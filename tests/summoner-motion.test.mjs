import test from 'node:test';
import assert from 'node:assert/strict';
import {SummonerMotion,summonerPose,summonerStaff,summonerFrameDelta,SUMMONER_REFERENCE} from '../prototype/summoner-motion.mjs';

test('reference demo completes all visual segments in the observed one-second interval',()=>{
 const g=new SummonerMotion();g.playReference();g.tick(1);
 assert.deepEqual(g.events.filter(e=>e.type==='motion-start').map(e=>[e.stage,e.time]),[[0,0],[1,.333333],[2,.6]]);
 assert.equal(g.action,null);assert.equal(g.replay,false);assert.equal(g.events.at(-1).type,'reference-done');
 assert.equal(SUMMONER_REFERENCE.combatStatus,'NOT COVERED: no target in sample');
});
test('single public input stops after the first motion, without inventing a full combo',()=>{
 const g=new SummonerMotion();g.press();g.tick(.6);assert.equal(g.events.filter(e=>e.type==='motion-start').length,1);assert.equal(g.action,null);
});
test('queued press allows exactly one following motion after release',()=>{
 const g=new SummonerMotion();g.setHeld(true);g.tick(.1);g.press();g.setHeld(false);g.tick(1);
 assert.deepEqual(g.events.filter(e=>e.type==='motion-start').map(e=>e.stage),[0,1]);assert.equal(g.queue,false);
});
test('held input chains and releasing stops further inputs',()=>{
 const g=new SummonerMotion();g.setHeld(true);g.tick(.65);g.setHeld(false);g.tick(1);
 assert.deepEqual(g.events.filter(e=>e.type==='motion-start').map(e=>e.stage),[0,1,2]);assert.equal(g.action,null);
});
test('expired continuity restarts at first stage',()=>{
 const g=new SummonerMotion();g.press();g.tick(.8);g.press();assert.equal(g.action.stage,0);
});
test('observed raised and crouched poses are distinct, with low recovery retained',()=>{
 const up=summonerPose(12),low=summonerPose(24),later=summonerPose(29);
 assert.ok(up.hand[1]>70);assert.ok(low.head[1]<up.head[1]-20);assert.deepEqual(low.hand,later.hand);
});
test('staff remains rigid and its geometry mirrors around the owner origin',()=>{
 for(let frame=0;frame<=30;frame++){
  const p=summonerPose(frame),a=summonerStaff(p,{x:27}),b=summonerStaff(p,{x:27,facing:-1});
  assert.ok(Math.abs(Math.hypot(a.tip.x-a.butt.x,a.tip.y-a.butt.y)-68)<1e-9);
  for(const k of ['tip','butt','grip']){assert.ok(Math.abs(a[k].x+b[k].x-54)<1e-9);assert.equal(a[k].y,b[k].y);}
 }
});
test('30fps pose sampling holds the same pose inside a displayed frame',()=>{
 assert.deepEqual(summonerPose(4.1),summonerPose(4.9));assert.notDeepEqual(summonerPose(4),summonerPose(5));
});
test('preview pauses the public motion clock and rejects an attack',()=>{
 const g=new SummonerMotion();g.playReference();g.tick(.2);const before=g.time;g.seekFrame(24);g.tick(1);
 assert.equal(g.time,before);assert.equal(g.press().reason,'paused');assert.equal(g.pose().frame,24);g.reset();assert.equal(g.paused,false);
});
test('different external update rates preserve the same motion-start timeline',()=>{
 const runs=[20,30,60,120].map(hz=>{const g=new SummonerMotion();g.playReference();for(let i=0;i<hz*2;i++)g.tick(1/hz);return g.events;});
 for(const r of runs)assert.deepEqual(r,runs[0]);
});
test('moving is locked during a staff motion and allowed after it settles',()=>{
 const g=new SummonerMotion();g.press();assert.equal(g.move(10),false);g.tick(.6);assert.equal(g.move(-10),true);assert.equal(g.facing,-1);
});
test('motion lab cannot generate damage, hitstop or launch events',()=>{
 const g=new SummonerMotion();g.setHeld(true);g.tick(5);assert.ok(g.events.length>9);
 assert.ok(g.events.every(e=>!['damage','hit','launch','impact-feedback','forced-stand'].includes(e.type)));
 assert.equal(g.snapshot().hp,undefined);
});
test('first and regressing RAF timestamps cannot crash the production motion clock',()=>{
 const g=new SummonerMotion();g.press();
 for(const pair of [[99,null],[99,100],[110,99],[3000,110]])assert.doesNotThrow(()=>g.tick(summonerFrameDelta(...pair)));
 assert.equal(summonerFrameDelta(99,100),0);assert.equal(summonerFrameDelta(3000,110),.05);assert.ok(g.time>0);
});
