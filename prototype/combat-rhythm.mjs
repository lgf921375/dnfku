/** V9 original three-cut rhythm adapter. V8 geometric rules remain authoritative. */
import {CombatContact} from './combat-contact.mjs';
import {rhythmWeapon} from './rhythm-renderer.mjs';
export const CUTS = Object.freeze([
  {startup:.10,active:.075,recovery:.18,damage:12,stop:.045,push:.8,box:{x0:.1,x1:1.48,y0:.06,y1:1.85}},
  {startup:.085,active:.08,recovery:.17,damage:14,stop:.055,push:1.05,box:{x0:.05,x1:1.55,y0:.04,y1:1.9}},
  {startup:.14,active:.10,recovery:.24,damage:22,stop:.085,push:2.4,box:{x0:.05,x1:1.72,y0:0,y1:2.05}}
]);
export class CombatRhythm extends CombatContact {
  constructor(options={}) {
    super({...options,hp:options.hp??600});
    this.feel={attackerStop:1,victimStop:1,knockback:1,...options.feel};
    for(const f of this.fighters){
      f.cut=0;f.chainUntil=-1;f.poseTime=0;f.hurt=0;f.land=0;f.hurtDirection=1;
      const c=f.controller;c.frames={...c.frames};
      c.policy={...c.policy,cancelRecoveryAfter:.09,cancelRules:{...c.policy.cancelRules,highSlash:['highSlash','launcher'],launcher:['highSlash']}};
      c.cfg.inputBufferSeconds=.32;
      const start=c.start.bind(c);
      c.start=name=>{
        if(name==='highSlash'){
          f.cut=c.actionTime<=f.chainUntil?(f.cut+1)%3:0;
          const {startup,active,recovery}=CUTS[f.cut];c.frames.highSlash={startup,active,recovery};
          f.chainUntil=c.actionTime+startup+active+recovery+.38;
        }else{f.cut=0;f.chainUntil=-1;}
        start(name);c.action.cut=name==='highSlash'?f.cut:null;
      };
      const receive=c.receiveHit.bind(c);
      c.receiveHit=options=>{const result=receive(options);if(result.type!=='armor-resisted'){f.chainUntil=-1;f.cut=0;}return result;};
      const press=c.press.bind(c);
      c.press=name=>{
        if(c.action&&c.attackerHitstopRemaining>0){c.buffer={name,expiresAt:c.actionTime+c.cfg.inputBufferSeconds};return c.record('input-buffered',{name,phase:c.phase});}
        return press(name);
      };
    }
  }
  attackBoxes(f){
    const a=f.controller.action;
    if(!a||a.phase!=='active'||f.dead)return [];
    const other=this.fighters.find(t=>t!==f);if(Math.abs(f.lane-other.lane)>.55)return [];
    const {hand,tip}=rhythmWeapon(f),padding=.065;
    return [{x0:Math.min(hand.x,tip.x)-padding,x1:Math.max(hand.x,tip.x)+padding,y0:Math.min(hand.y,tip.y)-padding,y1:Math.max(hand.y,tip.y)+padding}];
  }
  resolve(intent){
    const {f,target,a}=intent,b=target.body,before={state:b.state,vy:b.vy},targetBox=b.enemyBox();
    const cut=a.name==='highSlash'?CUTS[a.cut]:null,old=this.skills.highSlash;
    if(cut)this.skills.highSlash={...old,damage:cut.damage,hitstun:.27};
    const index=this.events.length;try{super.resolve(intent);}finally{this.skills.highSlash=old;}
    const e=this.events.slice(index).find(e=>e.type==='damage'||e.type==='guard');if(!e)return;
    e.cut=cut?a.cut:null;
    const effect=this.effects.at(-1);if(effect){effect.cut=e.cut;effect.x=(Math.max(intent.box.x0,targetBox.x0)+Math.min(intent.box.x1,targetBox.x1))/2;effect.impactY=(Math.max(intent.box.y0,targetBox.y0)+Math.min(intent.box.y1,targetBox.y1))/2;}
    if(e.type!=='damage')return;
    const stop=cut?.stop??.07;
    f.controller.attackerHitstopRemaining=stop*this.feel.attackerStop;
    if(!e.protectedStand&&!target.dead){
      b.hitstopRemaining=stop*this.feel.victimStop;
      if(!e.armored){
        target.hurt=.22;target.hurtDirection=f.facing;
        target.knockback=(cut?.push??.55)*f.facing*this.feel.knockback;
        if(cut&&before.state==='airborne'){
          // Relative impulses/damping, never a uniform velocity reset on every hit.
          b.vy=a.cut===0?Math.min(6,before.vy+1.1):a.cut===1?Math.min(5,before.vy*.65+1.5):Math.min(-2.4,before.vy-3);
        }else if(cut&&a.cut===2&&before.state==='idle'){
          b.state='airborne';b.y=.01;b.vy=3.6;b.bounceRemaining=0;
        }
      }
    }
    this.record('impact-feedback',{attacker:f.id,target:target.id,cut:e.cut,attackerStop:f.controller.attackerHitstopRemaining,victimStop:b.hitstopRemaining,vy:b.vy});
  }
  fixedTick(){
    const previous=this.fighters.map(f=>({state:f.body.state,frozen:f.body.hitstopRemaining>0||f.controller.attackerHitstopRemaining>0}));
    super.fixedTick();
    this.fighters.forEach((f,i)=>{
      if(!previous[i].frozen){f.poseTime+=this.settings.fixedStep;f.hurt=Math.max(0,f.hurt-this.settings.fixedStep);f.land=Math.max(0,f.land-this.settings.fixedStep);}
      if(previous[i].state==='airborne'&&f.body.state==='down'){f.land=.18;this.effects.push({type:'landing',time:this.time,x:f.body.enemyX,y:0,lane:f.lane});}
    });
  }
}
