/**
 * Sprite Dimension Auditor for Tidefall Phaser
 * 
 * Audits all sprite files and compares actual dimensions against
 * expected frame sizes defined in BootScene.js
 */

const fs = require('fs');
const path = require('path');

// Try to use image-size library, fallback to native method
let imageSize;
try {
  const imageSizeModule = require('image-size');
  imageSize = imageSizeModule.default || imageSizeModule.imageSize || imageSizeModule;
} catch (e) {
  console.log('Note: image-size not installed, using native PNG parsing');
}

// Base path for assets
const ASSETS_DIR = path.join(__dirname, 'public', 'assets', 'sprites');

// Expected frame sizes from BootScene.js
const FRAME_CONFIG = {
  character: { frameWidth: 64, frameHeight: 64 },
  cow: { frameWidth: 32, frameHeight: 32 },
  chicken: { frameWidth: 16, frameHeight: 16 },
  pig: { frameWidth: 16, frameHeight: 16 },
  palm_tree: { frameWidth: 80, frameHeight: 80 },
  buildings: { frameWidth: null, frameHeight: null }, // Static images
  boats: { frameWidth: null, frameHeight: null }, // Static images
};

// File patterns to audit
const AUDIT_PATTERNS = [
  // Character animations - body parts
  { pattern: 'character/walk/body/*.png', category: 'character', type: 'body', animation: 'walk' },
  { pattern: 'character/idle/body/*.png', category: 'character', type: 'body', animation: 'idle' },
  { pattern: 'character/throw/body/*.png', category: 'character', type: 'body', animation: 'throw' },
  { pattern: 'character/catch/body/*.png', category: 'character', type: 'body', animation: 'catch' },
  { pattern: 'character/reel/body/*.png', category: 'character', type: 'body', animation: 'reel' },
  
  // Animals
  { pattern: 'animals/cow_walk.png', category: 'cow', type: 'walk' },
  { pattern: 'animals/chicken_walk.png', category: 'chicken', type: 'walk' },
  { pattern: 'animals/pig_walk.png', category: 'pig', type: 'walk' },
  { pattern: 'animals/cow_idle.png', category: 'cow', type: 'idle' },
  { pattern: 'animals/chicken_idle.png', category: 'chicken', type: 'idle' },
  { pattern: 'animals/pig_idle.png', category: 'pig', type: 'idle' },
  
  // Trees
  { pattern: 'trees/palm_tree.png', category: 'palm_tree', type: 'animated' },
  
  // Buildings (static images - no frame expectations)
  { pattern: 'buildings/*.png', category: 'buildings', type: 'static' },
  
  // Boats (static images - no frame expectations)
  { pattern: 'boats/*.png', category: 'boats', type: 'static' },
];

// Results storage
const results = {
  ok: [],
  mismatch: [],
  errors: [],
  summary: {
    total: 0,
    ok: 0,
    mismatch: 0,
    errors: 0
  }
};

/**
 * Native PNG dimension parser (fallback when image-size not available)
 */
function getPngDimensions(filePath) {
  const buffer = fs.readFileSync(filePath);
  
  // PNG signature check
  if (buffer[0] !== 0x89 || buffer[1] !== 0x50 || buffer[2] !== 0x4E || buffer[3] !== 0x47) {
    throw new Error('Not a valid PNG file');
  }
  
  // IHDR chunk starts at byte 16, width/height at bytes 16-23
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  
  return { width, height };
}

/**
 * Get image dimensions using available method
 */
function getImageDimensions(filePath) {
  if (imageSize) {
    const buffer = fs.readFileSync(filePath);
    const dimensions = imageSize(buffer);
    return { width: dimensions.width, height: dimensions.height };
  }
  return getPngDimensions(filePath);
}

/**
 * Expand glob-like pattern to actual files
 */
function expandPattern(pattern) {
  const fullPattern = path.join(ASSETS_DIR, pattern);
  const dir = path.dirname(fullPattern);
  const filePattern = path.basename(fullPattern);
  
  if (!fs.existsSync(dir)) {
    return [];
  }
  
  const files = fs.readdirSync(dir);
  const regex = new RegExp('^' + filePattern.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$');
  
  return files
    .filter(f => regex.test(f))
    .map(f => path.join(dir, f));
}

/**
 * Calculate expected frames based on dimensions and frame size
 */
function calculateFrames(width, height, frameWidth, frameHeight) {
  if (!frameWidth || !frameHeight) {
    return { x: null, y: null, total: null };
  }
  
  const framesX = width / frameWidth;
  const framesY = height / frameHeight;
  
  return {
    x: framesX,
    y: framesY,
    total: framesX * framesY,
    isInteger: Number.isInteger(framesX) && Number.isInteger(framesY)
  };
}

/**
 * Audit a single file
 */
function auditFile(filePath, config) {
  try {
    const dimensions = getImageDimensions(filePath);
    const frameConfig = FRAME_CONFIG[config.category];
    
    const calculated = calculateFrames(
      dimensions.width,
      dimensions.height,
      frameConfig.frameWidth,
      frameConfig.frameHeight
    );
    
    const result = {
      file: path.relative(ASSETS_DIR, filePath),
      fullPath: filePath,
      actualWidth: dimensions.width,
      actualHeight: dimensions.height,
      expectedFrameWidth: frameConfig.frameWidth,
      expectedFrameHeight: frameConfig.frameHeight,
      calculatedFrames: calculated,
      category: config.category,
      type: config.type,
      status: 'OK'
    };
    
    // Determine status
    if (config.type === 'static') {
      // Static images don't have frame expectations
      result.status = 'OK';
    } else if (!calculated.isInteger) {
      result.status = 'MISMATCH';
      result.issue = `Dimensions (${dimensions.width}x${dimensions.height}) not divisible by frame size (${frameConfig.frameWidth}x${frameConfig.frameHeight})`;
    } else if (frameConfig.frameWidth && frameConfig.frameHeight) {
      // Check if expected frames make sense
      const expectedFrames = {
        walk: { body: 24 }, // 4 directions x 6 frames
        idle: { body: 8 },  // 4 directions x 2 frames
        throw: { body: 24 }, // 4 directions x 6 frames
        catch: { body: 20 }, // 4 directions x 5 frames
        reel: { body: 16 },  // 4 directions x 4 frames
      };
      
      if (config.category === 'character' && expectedFrames[config.animation]) {
        const expected = expectedFrames[config.animation][config.type];
        if (expected && calculated.total !== expected) {
          result.status = 'MISMATCH';
          result.issue = `Expected ${expected} frames, calculated ${calculated.total} frames`;
        }
      }
      
      // Animal-specific checks
      if (config.category === 'cow' && config.type === 'walk' && calculated.total !== 16) {
        result.status = 'MISMATCH';
        result.issue = `Cow walk expected 16 frames (4 dirs x 4), got ${calculated.total}`;
      }
      if (config.category === 'cow' && config.type === 'idle' && calculated.total !== 8) {
        result.status = 'MISMATCH';
        result.issue = `Cow idle expected 8 frames, got ${calculated.total}`;
      }
      if (config.category === 'chicken' && config.type === 'walk' && calculated.total !== 16) {
        result.status = 'MISMATCH';
        result.issue = `Chicken walk expected 16 frames (4 dirs x 4), got ${calculated.total}`;
      }
      if (config.category === 'chicken' && config.type === 'idle' && calculated.total !== 4) {
        result.status = 'MISMATCH';
        result.issue = `Chicken idle expected 4 frames, got ${calculated.total}`;
      }
      if (config.category === 'pig' && config.type === 'walk' && calculated.total !== 16) {
        result.status = 'MISMATCH';
        result.issue = `Pig walk expected 16 frames (4 dirs x 4), got ${calculated.total}`;
      }
      if (config.category === 'pig' && config.type === 'idle' && calculated.total !== 4) {
        result.status = 'MISMATCH';
        result.issue = `Pig idle expected 4 frames, got ${calculated.total}`;
      }
    }
    
    return result;
  } catch (error) {
    return {
      file: path.relative(ASSETS_DIR, filePath),
      fullPath: filePath,
      status: 'ERROR',
      issue: error.message
    };
  }
}

/**
 * Main audit function
 */
function runAudit() {
  console.log('='.repeat(80));
  console.log('TIDEFALL PHASER - SPRITE DIMENSION AUDIT');
  console.log('='.repeat(80));
  console.log(`Assets Directory: ${ASSETS_DIR}`);
  console.log('');
  
  // Check if assets directory exists
  if (!fs.existsSync(ASSETS_DIR)) {
    console.error(`ERROR: Assets directory not found: ${ASSETS_DIR}`);
    process.exit(1);
  }
  
  // Process each pattern
  AUDIT_PATTERNS.forEach(patternConfig => {
    const files = expandPattern(patternConfig.pattern);
    
    files.forEach(filePath => {
      const result = auditFile(filePath, patternConfig);
      results.summary.total++;
      
      if (result.status === 'OK') {
        results.ok.push(result);
        results.summary.ok++;
      } else if (result.status === 'MISMATCH') {
        results.mismatch.push(result);
        results.summary.mismatch++;
      } else {
        results.errors.push(result);
        results.summary.errors++;
      }
    });
  });
  
  // Print results
  printResults();
  
  // Save report to file
  saveReport();
}

/**
 * Print formatted results
 */
function printResults() {
  // Print MISMATCHES (most important)
  if (results.mismatch.length > 0) {
    console.log('');
    console.log('⚠️  MISMATCHES FOUND:');
    console.log('-'.repeat(80));
    results.mismatch.forEach(r => {
      console.log(`File: ${r.file}`);
      console.log(`  Dimensions: ${r.actualWidth}x${r.actualHeight}`);
      console.log(`  Expected Frame: ${r.expectedFrameWidth}x${r.expectedFrameHeight}`);
      if (r.calculatedFrames.total) {
        console.log(`  Calculated Frames: ${r.calculatedFrames.x} x ${r.calculatedFrames.y} = ${r.calculatedFrames.total}`);
      }
      console.log(`  Issue: ${r.issue}`);
      console.log('');
    });
  }
  
  // Print ERRORS
  if (results.errors.length > 0) {
    console.log('');
    console.log('❌ ERRORS:');
    console.log('-'.repeat(80));
    results.errors.forEach(r => {
      console.log(`File: ${r.file}`);
      console.log(`  Error: ${r.issue}`);
      console.log('');
    });
  }
  
  // Print OK files summary by category
  console.log('');
  console.log('✅ OK FILES (sample by category):');
  console.log('-'.repeat(80));
  
  const categories = {};
  results.ok.forEach(r => {
    if (!categories[r.category]) categories[r.category] = [];
    categories[r.category].push(r);
  });
  
  Object.entries(categories).forEach(([cat, files]) => {
    console.log(`\n${cat.toUpperCase()} (${files.length} files):`);
    files.slice(0, 3).forEach(f => {
      const frameInfo = f.calculatedFrames.total 
        ? `→ ${f.calculatedFrames.total} frames (${f.calculatedFrames.x}×${f.calculatedFrames.y})`
        : '→ static image';
      console.log(`  ✓ ${f.file} (${f.actualWidth}x${f.actualHeight}) ${frameInfo}`);
    });
    if (files.length > 3) {
      console.log(`  ... and ${files.length - 3} more`);
    }
  });
  
  // Summary
  console.log('');
  console.log('='.repeat(80));
  console.log('SUMMARY');
  console.log('='.repeat(80));
  console.log(`Total Files Audited: ${results.summary.total}`);
  console.log(`✅ OK: ${results.summary.ok}`);
  console.log(`⚠️  MISMATCH: ${results.summary.mismatch}`);
  console.log(`❌ ERRORS: ${results.summary.errors}`);
  console.log('');
  
  if (results.summary.mismatch === 0 && results.summary.errors === 0) {
    console.log('🎉 All sprites passed the audit!');
  } else {
    console.log('⚠️  Issues found - review the MISMATCH and ERROR sections above');
  }
}

/**
 * Save detailed report to JSON file
 */
function saveReport() {
  const reportPath = path.join(__dirname, 'sprite_audit_report.json');
  const report = {
    timestamp: new Date().toISOString(),
    summary: results.summary,
    mismatches: results.mismatch,
    errors: results.errors,
    ok: results.ok.map(r => ({
      file: r.file,
      dimensions: `${r.actualWidth}x${r.actualHeight}`,
      frames: r.calculatedFrames
    }))
  };
  
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 Full report saved to: ${reportPath}`);
}

// Run the audit
runAudit();
