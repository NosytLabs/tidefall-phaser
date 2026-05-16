import Phaser from 'phaser';
import { eventBus } from '../core/EventBus.js';
import { EVENTS } from '../core/Constants.js';

/**
 * NotificationSystem - Proactive notifications and alerts
 * 
 * Features:
 * - Toast notifications
 * - Achievement popups
 * - Rare fish alerts
 * - Proactive tips
 * - Priority queue
 */
export class NotificationSystem {
  constructor(scene) {
    this.scene = scene;
    this.notifications = [];
    this.queue = [];
    this.activeNotifications = [];
    this.maxActive = 3;
    this.notificationId = 0;
    
    // Rare fish opportunities
    this.rareFishAlerts = new Map();
    this.lastRareAlert = 0;
    
    // Event listeners
    this.setupEventListeners();
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Achievement unlocks
    eventBus.on(EVENTS.ACHIEVEMENT_UNLOCKED, (data) => {
      this.showAchievement(data);
    });
    
    // Fish caught
    eventBus.on(EVENTS.FISHING_CATCH, (data) => {
      const rarity = data?.fish?.rarity || data?.rarity;
      if (rarity === 'legendary') {
        this.showLegendaryAlert(data);
      } else if (rarity === 'epic') {
        this.showRareCatch(data);
      }
    });
    
    // Quest updates
    eventBus.on('quest:updated', (data) => {
      if (data.completed) {
        this.showQuestComplete(data);
      } else if (data.objectiveMet) {
        this.showObjectiveMet(data);
      }
    });
    
    // Time-based events
    this.scene.time.addEvent({
      delay: 60000,
      callback: () => this.checkRareOpportunities(),
      loop: true
    });
  }

  /**
   * Show a notification
   */
  show(options) {
    const notification = {
      id: ++this.notificationId,
      type: options.type || 'info',
      title: options.title || '',
      message: options.message || '',
      icon: options.icon || '🔔',
      duration: options.duration || 3000,
      priority: options.priority || 0,
      actions: options.actions || [],
      onDismiss: options.onDismiss,
      data: options.data || {}
    };
    
    // Add to queue
    this.queue.push(notification);
    this.queue.sort((a, b) => b.priority - a.priority);
    
    this.processQueue();
    
    return notification.id;
  }

  /**
   * Process notification queue
   */
  processQueue() {
    // Remove expired notifications
    this.activeNotifications = this.activeNotifications.filter(n => {
      if (n.expired) {
        this.removeNotification(n.id);
        return false;
      }
      return true;
    });
    
    // Add new notifications up to max
    while (this.activeNotifications.length < this.maxActive && this.queue.length > 0) {
      const notification = this.queue.shift();
      this.displayNotification(notification);
    }
  }

  /**
   * Display a notification on screen
   */
  displayNotification(notification) {
    const W = this.scene.scale.width;
    const startY = 80;
    const spacing = 55;
    
    // Calculate position based on active notifications
    const index = this.activeNotifications.length;
    const y = startY + index * spacing;
    
    // Create notification container
    const container = this.scene.add.container(W / 2, y);
    container.setDepth(500);
    
    // Background
    const colors = {
      info: 0x333333,
      success: 0x1a4a1a,
      warning: 0x4a3a1a,
      error: 0x4a1a1a,
      achievement: 0x3a2a0a,
      rare: 0x2a1a4a
    };
    
    const bg = this.scene.add.rectangle(0, 0, 280, 45, colors[notification.type] || colors.info, 0.95)
      .setStrokeStyle(2, 0xffffff, 0.3);
    
    // Icon
    const icon = this.scene.add.text(-120, 0, notification.icon, {
      fontSize: '20px'
    }).setOrigin(0.5);
    
    // Title
    const title = this.scene.add.text(-90, -8, notification.title, {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0, 0.5);
    
    // Message
    const message = this.scene.add.text(-90, 8, notification.message, {
      fontFamily: 'monospace',
      fontSize: '9px',
      color: '#aaaaaa'
    }).setOrigin(0, 0.5);
    
    // Add elements to container
    container.add([bg, icon, title, message]);
    
    // Add action buttons if any
    if (notification.actions.length > 0) {
      let xOffset = 100;
      notification.actions.forEach(action => {
        const btn = this.createActionButton(xOffset, 0, action.label, () => {
          action.callback();
          this.dismiss(notification.id);
        });
        container.add(btn);
        xOffset += 50;
      });
    }
    
    // Slide in animation
    container.x = W + 150;
    this.scene.tweens.add({
      targets: container,
      x: W / 2,
      duration: 300,
      ease: 'Back.out'
    });
    
    // Store notification
    notification.container = container;
    notification.expired = false;
    this.activeNotifications.push(notification);
    
    // Auto dismiss
    if (notification.duration > 0) {
      this.scene.time.delayedCall(notification.duration, () => {
        this.dismiss(notification.id);
      });
    }
    
    // Sound effect
    if (!notification.data.silent) {
      this.playNotificationSound(notification.type);
    }
  }

  /**
   * Create an action button
   */
  createActionButton(x, y, label, callback) {
    const btnBg = this.scene.add.rectangle(x, y, 40, 20, 0x555555, 0.8)
      .setInteractive({ cursor: 'pointer' });
    
    const btnText = this.scene.add.text(x, y, label, {
      fontFamily: 'monospace',
      fontSize: '8px',
      color: '#ffffff'
    }).setOrigin(0.5);
    
    btnBg.on('pointerover', () => btnBg.setFillStyle(0x777777));
    btnBg.on('pointerout', () => btnBg.setFillStyle(0x555555));
    btnBg.on('pointerdown', callback);
    
    return this.scene.add.container(0, 0, [btnBg, btnText]);
  }

  /**
   * Dismiss a notification
   */
  dismiss(id) {
    const notification = this.activeNotifications.find(n => n.id === id);
    if (notification && !notification.expired) {
      notification.expired = true;
      
      if (notification.onDismiss) {
        notification.onDismiss();
      }
      
      // Slide out animation
      this.scene.tweens.add({
        targets: notification.container,
        x: -150,
        alpha: 0,
        duration: 200,
        ease: 'Power2',
        onComplete: () => {
          this.removeNotification(id);
          this.repositionNotifications();
          this.processQueue();
        }
      });
    }
  }

  /**
   * Remove a notification from active list
   */
  removeNotification(id) {
    const index = this.activeNotifications.findIndex(n => n.id === id);
    if (index > -1) {
      const notification = this.activeNotifications[index];
      if (notification.container) {
        notification.container.destroy();
      }
      this.activeNotifications.splice(index, 1);
    }
  }

  /**
   * Reposition active notifications
   */
  repositionNotifications() {
    const startY = 80;
    const spacing = 55;
    
    this.activeNotifications.forEach((notification, index) => {
      const targetY = startY + index * spacing;
      
      this.scene.tweens.add({
        targets: notification.container,
        y: targetY,
        duration: 200,
        ease: 'Power2'
      });
    });
  }

  /**
   * Show achievement notification
   */
  showAchievement(data) {
    this.show({
      type: 'achievement',
      title: 'Achievement Unlocked!',
      message: `${data.icon} ${data.name}`,
      icon: '🏆',
      duration: 5000,
      priority: 10,
      data: { silent: false }
    });
  }

  /**
   * Show legendary fish alert
   */
  showLegendaryAlert(data) {
    this.show({
      type: 'rare',
      title: 'LEGENDARY CATCH!',
      message: `You caught a ${data.fishName}!`,
      icon: '⭐',
      duration: 6000,
      priority: 20,
      data: { silent: false }
    });
  }

  /**
   * Show rare catch notification
   */
  showRareCatch(data) {
    this.show({
      type: 'success',
      title: 'Epic Catch!',
      message: `You caught a ${data.fishName}!`,
      icon: '🔮',
      duration: 4000,
      priority: 5
    });
  }

  /**
   * Show quest complete notification
   */
  showQuestComplete(data) {
    this.show({
      type: 'success',
      title: 'Quest Complete!',
      message: `${data.questName} - ${data.reward}g reward`,
      icon: '📜',
      duration: 5000,
      priority: 8,
      actions: [
        { label: 'View', callback: () => eventBus.emit('ui:showQuests') }
      ]
    });
  }

  /**
   * Show objective met notification
   */
  showObjectiveMet(data) {
    this.show({
      type: 'info',
      title: 'Objective Met',
      message: `${data.objectiveName} - Quest updated`,
      icon: '✓',
      duration: 3000,
      priority: 3
    });
  }

  /**
   * Show auto-save notification
   */
  showAutoSave() {
    this.show({
      type: 'info',
      title: 'Auto-Saved',
      message: 'Your progress has been saved',
      icon: '💾',
      duration: 2000,
      priority: 1,
      data: { silent: true }
    });
  }

  /**
   * Show proactive tip
   */
  showProactiveTip(tip) {
    this.show({
      type: 'info',
      title: tip.title,
      message: tip.text,
      icon: '💡',
      duration: 6000,
      priority: 4,
      actions: [
        { label: 'Got it', callback: () => {} }
      ]
    });
  }

  /**
   * Show rare fish opportunity alert
   */
  showRareOpportunity(fishType, conditions) {
    const now = Date.now();
    if (now - this.lastRareAlert < 60000) return; // Max 1 alert per minute
    
    this.lastRareAlert = now;
    
    this.show({
      type: 'warning',
      title: 'Rare Fishing Opportunity!',
      message: `${fishType} are more active ${conditions}`,
      icon: '⚡',
      duration: 8000,
      priority: 15,
      actions: [
        { label: 'Fish Now', callback: () => eventBus.emit('fishing:start') }
      ]
    });
  }

  /**
   * Check for rare fishing opportunities
   */
  checkRareOpportunities() {
    const timeOfDay = this.scene?.gameState?.timeOfDay;
    const weather = this.scene?.weatherSystem?.currentWeather;
    const hour = new Date().getHours();
    
    // Check conditions for rare fish opportunities
    if (weather === 'stormy') {
      this.showRareOpportunity('Legendary fish', 'during the storm!');
    } else if (weather === 'rainy' && (hour >= 5 && hour <= 7)) {
      this.showRareOpportunity('Rare fish', 'at dawn in the rain!');
    } else if (timeOfDay === 'night' && weather === 'clear') {
      this.showRareOpportunity('Nocturnal species', 'tonight!');
    }
  }

  /**
   * Show danger warning (for dangerous actions)
   */
  showDangerWarning(action, onConfirm, onCancel) {
    this.show({
      type: 'error',
      title: '⚠️ Warning',
      message: `Are you sure you want to ${action}?`,
      icon: '⚠️',
      duration: 0, // Don't auto dismiss
      priority: 100,
      actions: [
        { label: 'Yes', callback: onConfirm },
        { label: 'No', callback: onCancel }
      ]
    });
  }

  /**
   * Play notification sound
   */
  playNotificationSound(type) {
    const sounds = {
      info: 'notification_info',
      success: 'notification_success',
      warning: 'notification_warning',
      error: 'notification_error',
      achievement: 'achievement_unlock',
      rare: 'legendary_alert'
    };
    
    eventBus.emit(EVENTS.AUDIO_PLAY_SFX, { sound: sounds[type] || 'click' });
  }

  /**
   * Clear all notifications
   */
  clearAll() {
    this.activeNotifications.forEach(n => {
      if (n.container) n.container.destroy();
    });
    this.activeNotifications = [];
    this.queue = [];
  }

  /**
   * Destroy the notification system
   */
  destroy() {
    this.clearAll();
  }
}
