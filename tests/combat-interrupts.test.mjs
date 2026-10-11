import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CombatInterruptController } from '../prototype/combat-interrupts.mjs';
const make=(opt={})=>new CombatInterruptController(opt);
const advance=(a,steps=1)=>{for(let i=0;i<steps;i++)a.tick(1/120)};
const wait=(a,check,max=500)=>{for(let i=0;i<max&&!check();i++)advance(a);assert.ok(check(),'state never reached')};

test('49 recovery cancel starts configured followup immediately',()=>{
 const a=make();a.press('launcher');wait(a,()=>a.phase==='recovery');advance(a,14);
 assert.equal(a.canCancelInto('airTap'),true);
 assert.equal(a.press('airTap').type,'cancel-input-started');
 assert.equal(a.phase,'startup');assert.equal(a.actionName,'airTap');
 assert.equal(a.events.filter(x=>x.type==='action-canceled').length,1);
});
test('50 press before recovery cancel threshold is buffered',()=>{
 const a=make();a.press('launcher');wait(a,()=>a.phase==='recovery');
 assert.equal(a.press('airTap').type,'input-buffered');assert.equal(a.actionName,'launcher');
});
test('51 forbidden cancel target is buffered rather than canceled',()=>{
 const a=make();a.press('highSlash');wait(a,()=>a.phase==='recovery');advance(a,14);
 assert.equal(a.canCancelInto('airTap'),false);assert.equal(a.press('airTap').type,'input-buffered');
});
test('52 recovery cancel disabled falls back to input queue',()=>{
 const a=make({interruptSettings:{cancelEnabled:false}});a.press('launcher');wait(a,()=>a.phase==='recovery');advance(a,14);
 assert.equal(a.press('airTap').type,'input-buffered');
});
test('53 launcher active frames provide action-only armor',()=>{
 const a=make();a.press('launcher');wait(a,()=>a.phase==='active');
 assert.equal(a.armored,true);assert.equal(a.receiveHit().type,'armor-resisted');assert.equal(a.actionName,'launcher');
});
test('54 armor does not cover startup',()=>{
 const a=make();a.press('launcher');assert.equal(a.receiveHit().type,'action-interrupted');assert.equal(a.phase,'idle');
});
test('55 armor does not cover recovery',()=>{
 const a=make();a.press('launcher');wait(a,()=>a.phase==='recovery');
 assert.equal(a.receiveHit().type,'action-interrupted');assert.equal(a.phase,'idle');
});
test('56 nonarmored action can be interrupted during active',()=>{
 const a=make();a.press('highSlash');wait(a,()=>a.phase==='active');
 assert.equal(a.armored,false);assert.equal(a.receiveHit().type,'action-interrupted');assert.equal(a.phase,'idle');
});
test('57 force interrupt overrides active superarmor',()=>{
 const a=make();a.press('launcher');wait(a,()=>a.phase==='active');
 assert.equal(a.receiveHit({force:true}).type,'action-interrupted');assert.equal(a.phase,'idle');
});
test('58 interrupt clears stale buffer and attacker-side hitstop',()=>{
 const a=make();a.press('launcher');wait(a,()=>a.phase==='active');
 assert.ok(a.attackerHitstopRemaining>0);a.press('airTap');
 assert.equal(a.receiveHit({force:true}).type,'action-interrupted');
 assert.equal(a.buffer,null);assert.equal(a.attackerHitstopRemaining,0);
 advance(a,100);assert.equal(a.events.some(e=>e.type==='input-consumed'),false);
});
test('59 cancel avoids duplicate impact from canceled action',()=>{
 const a=make();a.press('launcher');wait(a,()=>a.phase==='recovery');advance(a,14);
 const impacts=a.events.filter(e=>e.type==='impact').length;
 a.press('airTap');assert.equal(a.events.filter(e=>e.type==='impact').length,impacts);
 wait(a,()=>a.events.filter(e=>e.type==='impact').length>impacts);
 assert.equal(a.events.filter(e=>e.type==='impact').length,impacts+1);
});
test('60 cancel duration rejects negative and nonfinite values',()=>{
 for(const x of [-1,NaN,Infinity])assert.throws(()=>make({interruptSettings:{cancelRecoveryAfter:x}}),RangeError);
});
test('61 idle incoming hit does not fabricate an action interrupt',()=>{
 const a=make();assert.equal(a.receiveHit().type,'incoming-hit-idle');
 assert.equal(a.events.filter(e=>e.type==='action-interrupted').length,0);
});
test('62 30/60/120Hz external drivers match cancel readiness',()=>{
 const results=[];
 for(const fps of [30,60,120]){const a=make();a.press('launcher');for(let i=0;i<fps/2;i++)a.tick(1/fps);results.push(a.snapshot());}
 for(const x of results.slice(1)){assert.equal(x.phase,results[0].phase);assert.equal(x.cancelReady,results[0].cancelReady);assert.ok(Math.abs(x.actionTime-results[0].actionTime)<1e-10)}
});

test('63 cancelReady snapshot is false when cancel switch is disabled',()=>{
 const a=make({interruptSettings:{cancelEnabled:false}});a.press('launcher');
 wait(a,()=>a.phase==='recovery'&&a.action.elapsed>.11);
 assert.equal(a.canCancelInto('airTap'),false);assert.equal(a.snapshot().cancelReady,false);
});
test('64 cancelReady is false when current action has no legal followup',()=>{
 const a=make();a.press('highSlash');wait(a,()=>a.phase==='recovery'&&a.action.elapsed>.11);
 assert.equal(a.snapshot().cancelReady,false);
});
test('65 legal recovery cancel works with input buffer switched off',()=>{
 const a=make({actionSettings:{inputBufferSeconds:0}});a.press('launcher');
 wait(a,()=>a.phase==='recovery'&&a.action.elapsed>.11);
 assert.equal(a.snapshot().cancelReady,true);
 assert.equal(a.press('airTap').type,'cancel-input-started');
});
