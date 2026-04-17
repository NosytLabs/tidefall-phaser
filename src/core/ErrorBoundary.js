/**
 * ErrorBoundary - Global error handling for the game
 * 
 * Features:
 * - Catch unhandled errors
 * - Display user-friendly error messages
 * - Log errors for debugging
 * - Attempt recovery when possible
 */

export class ErrorBoundary {
  constructor(game) {
    this.game = game;
    this.errors = [];
    this.maxErrors = 10;
    this.recoveryAttempts = 0;
    this.maxRecoveryAttempts = 3;
    
    // Bind error handlers
    this.handleGlobalError = this.handleGlobalError.bind(this);
    this.handleUnhandledRejection = this.handleUnhandledRejection.bind(this);
    
    // Install handlers
    this.install();
  }
  
  /**
   * Install global error handlers
   */
  install() {
    // Browser error handler
    window.addEventListener('error', this.handleGlobalError);
    window.addEventListener('unhandledrejection', this.handleUnhandledRejection);
    
    // Phaser error handler
    if (this.game) {
      this.game.events.on('error', this.handlePhaserError, this);
    }
    
    console.log('[ErrorBoundary] Error handlers installed');
  }
  
  /**
   * Remove error handlers
   */
  uninstall() {
    window.removeEventListener('error', this.handleGlobalError);
    window.removeEventListener('unhandledrejection', this.handleUnhandledRejection);
    
    if (this.game) {
      this.game.events.off('error', this.handlePhaserError, this);
    }
  }
  
  /**
   * Handle global JavaScript errors
   */
  handleGlobalError(event) {
    const error = {
      type: 'javascript',
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      stack: event.error?.stack,
      timestamp: new Date().toISOString()
    };
    
    this.logError(error);
    this.displayError(error);
    
    // Attempt recovery for known error types
    if (this.canRecover(error)) {
      this.attemptRecovery(error);
    }
    
    // Prevent default browser error display
    event.preventDefault();
  }
  
  /**
   * Handle unhandled promise rejections
   */
  handleUnhandledRejection(event) {
    const error = {
      type: 'promise',
      message: event.reason?.message || 'Unhandled promise rejection',
      stack: event.reason?.stack,
      timestamp: new Date().toISOString()
    };
    
    this.logError(error);
    this.displayError(error);
  }
  
  /**
   * Handle Phaser-specific errors
   */
  handlePhaserError(error) {
    const phaserError = {
      type: 'phaser',
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    };
    
    this.logError(phaserError);
    this.displayError(phaserError);
  }
  
  /**
   * Log error to console and storage
   */
  logError(error) {
    console.error('[ErrorBoundary]', error);
    
    // Add to error history
    this.errors.push(error);
    
    // Keep only recent errors
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }
    
    // Store in localStorage for debugging (if available)
    try {
      const errorLog = JSON.parse(localStorage.getItem('tidefall_errors') || '[]');
      errorLog.push(error);
      // Keep only last 50 errors
      if (errorLog.length > 50) errorLog.shift();
      localStorage.setItem('tidefall_errors', JSON.stringify(errorLog));
    } catch (e) {
      // Ignore localStorage errors
    }
  }
  
  /**
   * Display error to user
   */
  displayError(error) {
    // Only show critical errors to user
    if (!this.isCritical(error)) {
      return;
    }
    
    // Check if error display already exists
    let errorDiv = document.getElementById('game-error-display');
    if (!errorDiv) {
      errorDiv = document.createElement('div');
      errorDiv.id = 'game-error-display';
      errorDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.9);
        color: #ff4444;
        padding: 20px;
        border-radius: 8px;
        border: 2px solid #ff4444;
        font-family: monospace;
        font-size: 14px;
        max-width: 80%;
        max-height: 80%;
        overflow: auto;
        z-index: 10000;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
      `;
      document.body.appendChild(errorDiv);
    }
    
    errorDiv.innerHTML = `
      <h3 style="margin: 0 0 10px 0; color: #ff4444;">⚠️ Game Error</h3>
      <p style="margin: 5px 0;"><strong>Type:</strong> ${error.type}</p>
      <p style="margin: 5px 0;"><strong>Message:</strong> ${error.message}</p>
      <p style="margin: 5px 0; font-size: 12px; color: #888;">
        Check console for details. Refresh to restart.
      </p>
      <button onclick="this.parentElement.remove()" style="
        margin-top: 10px;
        padding: 8px 16px;
        background: #ff4444;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      ">Dismiss</button>
    `;
  }
  
  /**
   * Check if error is critical enough to show user
   */
  isCritical(error) {
    const criticalPatterns = [
      'Cannot read properties of null',
      'Cannot read properties of undefined',
      'texture',
      'sprite',
      'scene',
      'game',
      'render',
      'webgl',
      'canvas'
    ];
    
    return criticalPatterns.some(pattern => 
      error.message?.toLowerCase().includes(pattern.toLowerCase())
    );
  }
  
  /**
   * Check if error can be recovered from
   */
  canRecover(error) {
    const recoverablePatterns = [
      'texture',
      'sprite',
      'animation',
      'audio'
    ];
    
    return recoverablePatterns.some(pattern =>
      error.message?.toLowerCase().includes(pattern.toLowerCase())
    );
  }
  
  /**
   * Attempt to recover from error
   */
  attemptRecovery(error) {
    if (this.recoveryAttempts >= this.maxRecoveryAttempts) {
      console.warn('[ErrorBoundary] Max recovery attempts reached');
      return false;
    }
    
    this.recoveryAttempts++;
    console.log(`[ErrorBoundary] Recovery attempt ${this.recoveryAttempts}/${this.maxRecoveryAttempts}`);
    
    // Texture-related recovery
    if (error.message?.includes('texture')) {
      return this.recoverTextureError(error);
    }
    
    // Sprite-related recovery
    if (error.message?.includes('sprite')) {
      return this.recoverSpriteError(error);
    }
    
    return false;
  }
  
  /**
   * Recover from texture errors
   */
  recoverTextureError(error) {
    try {
      // Get current scene
      const currentScene = this.game.scene?.getScenes(true)[0];
      if (!currentScene) return false;
      
      // Check for missing textures and try to reload
      const textureManager = this.game.textures;
      const missingTextures = [];
      
      textureManager.each(texture => {
        if (!texture.getSourceImage()) {
          missingTextures.push(texture.key);
        }
      });
      
      if (missingTextures.length > 0) {
        console.log('[ErrorBoundary] Attempting to reload textures:', missingTextures);
        // Could trigger asset reload here
        return true;
      }
    } catch (e) {
      console.error('[ErrorBoundary] Recovery failed:', e);
    }
    
    return false;
  }
  
  /**
   * Recover from sprite errors
   */
  recoverSpriteError(error) {
    try {
      const currentScene = this.game.scene?.getScenes(true)[0];
      if (!currentScene) return false;
      
      // Clean up null sprites
      const sprites = currentScene.children?.list?.filter(c => c.type === 'Sprite') || [];
      let cleaned = 0;
      
      sprites.forEach(sprite => {
        if (!sprite.texture || !sprite.active) {
          sprite.destroy();
          cleaned++;
        }
      });
      
      if (cleaned > 0) {
        console.log(`[ErrorBoundary] Cleaned up ${cleaned} invalid sprites`);
        return true;
      }
    } catch (e) {
      console.error('[ErrorBoundary] Sprite recovery failed:', e);
    }
    
    return false;
  }
  
  /**
   * Get error report
   */
  getReport() {
    return {
      recentErrors: this.errors.slice(-5),
      totalErrors: this.errors.length,
      recoveryAttempts: this.recoveryAttempts,
      timestamp: new Date().toISOString()
    };
  }
  
  /**
   * Clear error history
   */
  clear() {
    this.errors = [];
    this.recoveryAttempts = 0;
    
    // Clear display
    const errorDiv = document.getElementById('game-error-display');
    if (errorDiv) {
      errorDiv.remove();
    }
    
    // Clear localStorage
    try {
      localStorage.removeItem('tidefall_errors');
    } catch (e) {
      // Ignore
    }
  }
}

export default ErrorBoundary;
