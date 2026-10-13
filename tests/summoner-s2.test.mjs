import test from 'node:test';
import assert from 'node:assert/strict';
import {SummonerMotion,summonerPose} from '../prototype/summoner-motion.mjs';
import {SummonerMotionS2,summonerPoseS2,S2_CALIBRATION} from '../prototype/summoner-motion-s2.mjs';
test('S2 corrects both second-motion feet visibly above the baseline floor',()=>{
 const before=summonerPose(12),after=summonerPoseS2(12);assert.ok(before.frontFoot[1]<2);assert.ok(after.frontFoot[1]>25&&after.backFoot[1]>25);
});
test('S2 third recovery keeps both feet elevated, then returns feet to the floor',()=>{
 for(const f of [24,25,26,27,28,29]){const p=summonerPoseS2(f);assert.ok(p.frontFoot[1]>25&&p.backFoot[1]>25);}
 assert.ok(summonerPoseS2(30).frontFoot[1]<2);assert.ok(summonerPoseS2(30).backFoot[1]<2);
});
test('S2 public reference replay completes same observed timeline with a real idle pose',()=>{
 const g=new SummonerMotionS2();g.playReference();g.tick(1);assert.equal(g.action,null);assert.equal(g.pose().frame,30);assert.equal(g.events.at(-1).type,'reference-done');
 assert.ok(g.pose().frontFoot[1]<2);
});
test('S2 changed visual elevation does not create jump, damage, target lift or intrinsic movement',()=>{
 const g=new SummonerMotionS2();g.playReference();g.tick(.42);assert.ok(g.pose().frontFoot[1]>25);assert.equal(g.x,0);g.tick(1);
 assert.ok(g.events.every(e=>!['damage','jump','launch','forced-stand'].includes(e.type)));assert.equal(g.snapshot().hp,undefined);
});
test('S2 single third input settles through the S2 pose rather than old grounded recovery',()=>{
 const g=new SummonerMotionS2();g.start(2);g.tick(.4);assert.ok(g.pose().frontFoot[1]<2);g.tick(.13);
 const actual=g.pose(),expected=summonerPoseS2(30);assert.deepEqual(actual.frontFoot,expected.frontFoot);assert.deepEqual(actual.hand,expected.hand);
 assert.ok(Math.abs(Math.sin(actual.staffAngle)-Math.sin(expected.staffAngle))<1e-9);
 assert.ok(Math.abs(Math.cos(actual.staffAngle)-Math.cos(expected.staffAngle))<1e-9);
});
test('S2 weapon and elevated body landmarks share the same facing and owner translation',()=>{
 const g=new SummonerMotionS2();g.seekFrame(24);g.x=30;const a=g.staff();g.face(-1);const b=g.staff();
 for(const k of ['grip','tip','butt']){assert.ok(Math.abs(a[k].x+b[k].x-60)<1e-8);assert.equal(a[k].y,b[k].y);}
 assert.equal(g.staff().grip.y,g.pose().hand[1]);
});
test('S2 does not change historical S1 timeline, independent of external refresh rate',()=>{
 for(const hz of [30,60,120]){const a=new SummonerMotion(),b=new SummonerMotionS2();a.playReference();b.playReference();for(let i=0;i<hz*2;i++){a.tick(1/hz);b.tick(1/hz);}assert.deepEqual(b.events,a.events);}
});
test('S2 calibration discloses visual uncertainty and collision/physics coverage limits',()=>{
 assert.equal(S2_CALIBRATION.manualUncertaintyPixels,3);assert.ok(S2_CALIBRATION.scope.includes('NOT COVERED'));
});
