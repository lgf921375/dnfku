/** V11 experimental contact-driven lift. Source study informs structure, not official values. */
import {CombatFeedback} from './combat-feedback.mjs';
import {CUTS} from './combat-rhythm.mjs';
import {feedbackPose,feedbackWeapon,drawFeedback} from './feedback-renderer.mjs';
export class CombatJuggle extends CombatFeedback{
  pose(f){return feedbackPose(f,{risingFinisher:true});}
  weapon(f){return feedbackWeapon(f,this.pose(f));}
  continuationVelocity(cut){
    // Ballistic round-trip window: current recovery + next startup/active + one physics step.
    // This is an original, inspectable starting constraint, not a measured DNF timing.
    const current=CUTS[cut],next=CUTS[(cut+1)%CUTS.length];
    return this.settings.gravity*(current.recovery+next.startup+next.active+this.settings.fixedStep)/2;
  }
  applyVerticalReaction(b,a,before){
    const lift=this.continuationVelocity(a.cut);
    if(before.state==='airborne'){
      // Preserve upward momentum, arrest a confirmed falling contact, cap at existing launcher speed.
      b.vy=Math.min(this.settings.launchVelocity,Math.max(lift,before.vy+lift));
    }else if(a.cut===2&&before.state==='idle'){
      b.state='airborne';b.y=.01;b.vy=lift;b.bounceRemaining=0;
    }
    // Downed targets stay down; ground hit accounting and forced stand remain in CombatArena.
  }
  resolve(intent){
    const {f,target,a,box}=intent,b=target.body;
    const before={state:b.state,x:b.enemyX,y:b.y,vy:b.vy,hp:target.hp,box:{...b.enemyBox()}};
    const w=this.weapon(f),point=f.contactPoint&&{...f.contactPoint},index=this.events.length;
    super.resolve(intent);
    const e=this.events.slice(index).find(e=>e.type==='damage');if(!e)return;
    if(a.name==='highSlash'&&a.cut===2&&before.state==='idle'&&!e.armored&&!e.protectedStand&&!target.dead){
      target.reaction.kind='launch';e.reaction='launch';
      const reaction=this.events.slice(index).find(e=>e.type==='reaction-start');if(reaction)reaction.kind='launch';
    }
    e.contact={point,blade:w,attackBox:{...box},targetBox:before.box};
    e.before={state:before.state,x:before.x,y:before.y,vy:before.vy,hp:before.hp};
    e.after={state:b.state,x:b.enemyX,y:b.y,vy:b.vy,hp:target.hp,airHits:b.airHits,groundHits:b.groundHits,totalHits:b.totalHits};
  }
}
export function drawJuggle(ctx,game,options={}){
  drawFeedback(ctx,game,{...options,pose:f=>game.pose(f),weapon:f=>game.weapon(f),risingFinisher:true});
}
