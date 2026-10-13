/** Original rig, visually estimated from one 30fps owner EMPTY swing sample.
 * BV1vDx1zKEKg 19.167–20.167s. No DNF assets, combat data or victim rules.
 * Stage boundaries are observation labels, NOT measured input/active frames.
 */
export const SUMMONER_REFERENCE = Object.freeze({
  url:'https://www.bilibili.com/video/BV1vDx1zKEKg/',fps:30,
  startSeconds:19+5/30,endSeconds:20+5/30,
  timingStatus:'visual-estimate; input/attack-speed/active frames unknown',
  stageEnds:Object.freeze([10,18,30]),
  combatStatus:'NOT COVERED: no target in sample'
});
// Coordinates use a 90px-tall original character, feet at y=0, positive y up.
// Staff is one rigid segment; endpoints come from the same pose as the drawing.
const key=(frame,hip,shoulder,head,hand,staffAngle,backKnee,backFoot,frontKnee,frontFoot,freeHand)=>
  Object.freeze({frame,hip,shoulder,head,hand,staffAngle,backKnee,backFoot,frontKnee,frontFoot,freeHand});
const idle=key(30,[0,38],[0,65],[2,78],[-10,58],1.38,[-9,20],[-12,1],[7,19],[10,1],[14,49]);
export const SUMMONER_KEYS=Object.freeze([
  key(0,[-2,39],[-5,66],[-3,79],[15,69],1.68,[-11,20],[-17,1],[7,20],[11,1],[16,63]),
  key(2,[-2,39],[-5,67],[-3,80],[10,79],2.22,[-10,21],[-17,1],[7,20],[11,1],[16,70]),
  key(4,[1,31],[8,52],[10,65],[36,48],.08,[-8,17],[-21,1],[16,16],[26,1],[12,47]),
  key(6,[0,32],[2,55],[3,69],[12,48],1.38,[-9,17],[-18,1],[12,16],[23,1],[13,51]),
  key(10,[0,37],[0,63],[2,77],[11,65],.95,[-10,20],[-18,1],[9,20],[19,1],[13,60]),
  key(11,[0,35],[8,63],[9,77],[32,78],.25,[-19,18],[-36,9],[22,13],[41,1],[18,65]),
  key(12,[0,35],[8,63],[9,77],[33,78],.25,[-19,18],[-36,9],[22,13],[41,1],[18,65]),
  key(16,[0,33],[0,59],[1,73],[10,57],1.3,[-10,18],[-20,1],[14,17],[25,1],[13,54]),
  key(18,[0,37],[-2,62],[0,76],[-4,70],1.84,[-9,20],[-15,1],[10,20],[20,1],[13,63]),
  key(20,[1,34],[9,59],[10,73],[17,67],2.8,[-8,18],[-16,1],[18,18],[27,1],[18,56]),
  key(22,[1,29],[11,52],[13,66],[0,28],-2.03,[-10,16],[-23,1],[21,15],[34,1],[25,39]),
  key(24,[0,20],[15,38],[18,51],[-8,23],-3.1,[-11,10],[-20,1],[19,9],[34,1],[26,34]),
  key(29,[0,20],[15,38],[18,51],[-8,23],-3.1,[-11,10],[-20,1],[19,9],[34,1],[26,34]),idle
]);
const mix=(a,b,t)=>a+(b-a)*t;
function blend(a,b,t){
  const p={};for(const k of Object.keys(a)){
    if(Array.isArray(a[k]))p[k]=a[k].map((v,i)=>mix(v,b[k][i],t));
    else if(k==='staffAngle'){
      const delta=Math.atan2(Math.sin(b[k]-a[k]),Math.cos(b[k]-a[k]));p[k]=a[k]+delta*t;
    }else p[k]=mix(a[k],b[k],t);
  }return p;
}
export function summonerPose(frame,{quantized=true}={}){
  if(!Number.isFinite(frame))throw new RangeError('invalid motion frame');
  const f=Math.max(0,Math.min(30,quantized?Math.floor(frame+1e-8):frame));
  let a=SUMMONER_KEYS[0],b=idle;
  for(let i=1;i<SUMMONER_KEYS.length;i++){b=SUMMONER_KEYS[i];if(f<=b.frame)break;a=b;}
  return blend(a,b,b.frame===a.frame?0:(f-a.frame)/(b.frame-a.frame));
}
export function summonerStaff(p,{x=0,y=0,facing=1}={}){
  const dx=Math.cos(p.staffAngle),dy=Math.sin(p.staffAngle);
  const transform=(u,v)=>({x:x+facing*u,y:y+v});
  return {grip:transform(...p.hand),butt:transform(p.hand[0]-dx*29,p.hand[1]-dy*29),
    tip:transform(p.hand[0]+dx*39,p.hand[1]+dy*39)};
}
// The first rAF timestamp can precede performance.now() taken during setup.
// Clamp that interval instead of passing a negative dt into the motion clock.
export function summonerFrameDelta(now,last){
  if(!Number.isFinite(now)||(last!==null&&!Number.isFinite(last)))throw new RangeError('invalid frame timestamp');
  return last===null?0:Math.max(0,Math.min(.05,(now-last)/1000));
}
export class SummonerMotion {
  constructor(){this.reset();}
  reset(){this.time=0;this.accumulator=0;this.action=null;this.queue=false;this.held=false;this.replay=false;this.events=[];this.chainUntil=-1;this.lastStage=-1;this.facing=1;this.x=0;this.paused=false;this.preview=null;this.returnPose=null;}
  record(type,data={}){const e={time:+this.time.toFixed(6),type,...data};this.events.push(e);return e;}
  start(stage){const begin=stage?SUMMONER_REFERENCE.stageEnds[stage-1]:0;
    this.action={stage,frame:begin,elapsed:0};this.lastStage=stage;this.returnPose=null;
    return this.record('motion-start',{stage,sourceFrame:begin});}
  press(){if(this.paused)return this.record('input-rejected',{reason:'paused'});
    if(this.action){this.queue=true;return this.record('input-buffered');}
    // 220ms continuity window is original UX; not present in source evidence.
    return this.start(this.time<=this.chainUntil?(this.lastStage+1)%3:0);}
  setHeld(on){this.held=!!on;if(on&&!this.action)this.press();}
  playReference(){this.reset();this.replay=true;this.start(0);}
  seekFrame(frame){if(!Number.isFinite(frame)||frame<0||frame>30)throw new RangeError('preview 0..30');this.paused=true;this.preview=frame;this.record('preview',{frame});}
  face(direction){if(![1,-1].includes(direction))throw new RangeError('facing ±1');this.facing=direction;}
  move(dx){if(!Number.isFinite(dx))throw new RangeError('invalid movement');if(this.action||this.paused)return false;this.x=Math.max(-220,Math.min(220,this.x+dx));if(dx)this.face(Math.sign(dx));return true;}
  pose(){if(this.preview!==null)return summonerPose(this.preview);
    if(this.action)return summonerPose(this.action.frame);
    if(this.returnPose){const t=Math.min(1,(this.time-this.returnPose.time)/.12);return blend(this.returnPose.pose,idle,t*t*(3-2*t));}
    return {...idle};}
  staff(){return summonerStaff(this.pose(),{x:this.x,facing:this.facing});}
  fixedTick(){const dt=1/120;if(this.paused)return;this.time+=dt;
    if(this.action){const a=this.action;a.elapsed+=dt;a.frame+=dt*30;
      if(a.frame+1e-8>=SUMMONER_REFERENCE.stageEnds[a.stage]){
        const frame=SUMMONER_REFERENCE.stageEnds[a.stage];this.record('motion-end',{stage:a.stage,sourceFrame:frame});
        const next=(a.stage+1)%3;this.action=null;this.chainUntil=this.time+.22;
        if(this.queue||this.held||(this.replay&&next!==0)){this.queue=false;this.start(next);}
        else{this.returnPose={pose:summonerPose(frame),time:this.time};this.record('return-idle',{interpolated:frame!==30});}
        if(this.replay&&next===0){this.replay=false;this.record('reference-done');}
      }
    }else if(this.held)this.press();
    if(this.returnPose&&this.time-this.returnPose.time>=.12)this.returnPose=null;
  }
  tick(seconds){if(!Number.isFinite(seconds)||seconds<0||seconds>5)throw new RangeError('tick 0..5');
    if(this.paused)return this.snapshot();this.accumulator+=seconds;
    while(this.accumulator+1e-10>=1/120){this.accumulator=Math.max(0,this.accumulator-1/120);this.fixedTick();}return this.snapshot();}
  snapshot(){return {time:this.time,action:this.action&&{...this.action},queued:this.queue,held:this.held,replay:this.replay,paused:this.paused,facing:this.facing,x:this.x,pose:this.pose(),staff:this.staff(),combatStatus:SUMMONER_REFERENCE.combatStatus};}
}
