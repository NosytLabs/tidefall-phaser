import { FishingSystem } from '../systems/FishingSystem.js';
import { FishingScene } from '../scenes/FishingScene.js';
import { UISceneV2 } from '../scenes/UISceneV2.js';

let done=false;
export function applyTidefallPolish(){
  if(done)return; done=true;
  const oldCreate=FishingScene.prototype.create;
  FishingScene.prototype.create=function(...args){oldCreate.apply(this,args);this.fpsText?.destroy()};
  FishingSystem.prototype.createBiteFlash=function(){};
  const oldShow=UISceneV2.prototype.showMessage;
  UISceneV2.prototype.showMessage=function(text,duration=2200){
    const clean=String(text??'').replace(/^!!\s*[^!]+FISH\s*!!\s*Press SPACE!?$/i,'BITE! PRESS SPACE TO HOOK');
    oldShow.call(this,clean,duration);
  };
}
