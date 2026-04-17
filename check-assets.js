const fs = require('fs');
const path = require('path');

// Check which asset files actually exist
const assetsDir = path.join(__dirname, 'public', 'assets');

function checkFile(filePath) {
  const fullPath = path.join(__dirname, 'public', filePath);
  return fs.existsSync(fullPath);
}

// List of assets from BootScene
const assetsToCheck = [
  // Trees
  'assets/sprites/trees/palm_tree.png',
  'assets/sprites/trees/trees_pine_growth.png',
  'assets/sprites/trees/apple_tree.png',
  'assets/sprites/trees/peach_tree.png',
  // Animals
  'assets/sprites/animals/chicken_walk.png',
  'assets/sprites/animals/chicken_idle.png',
  'assets/sprites/animals/cow_walk.png',
  'assets/sprites/animals/cow_idle.png',
  // Buildings
  'assets/sprites/buildings/fish_market.png',
  'assets/sprites/buildings/barn_premade.png',
  'assets/sprites/buildings/greenhouse_premade.png',
  // Boats
  'assets/sprites/boats/boat_blue.png',
  'assets/sprites/boats/boat_yellow.png',
  'assets/sprites/boats/boat_small.png',
];

console.log('=== Checking Smallburg Assets ===\n');

let found = 0;
let missing = 0;

assetsToCheck.forEach(asset => {
  const exists = checkFile(asset);
  if (exists) {
    console.log(`✅ ${asset}`);
    found++;
  } else {
    console.log(`❌ ${asset} - MISSING`);
    missing++;
  }
});

console.log(`\n=== Summary ===`);
console.log(`Found: ${found}`);
console.log(`Missing: ${missing}`);
