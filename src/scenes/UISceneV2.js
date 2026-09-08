import Phaser from 'phaser';
export class UISceneV2 extends Phaser.Scene { constructor(){ super({key:'UIScene',active:false}); } create(){ this.add.text(8,8,'TIDEFALL'); } }
