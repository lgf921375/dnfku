import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CombatArena } from '../prototype/combat-core.mjs';
import { CombatActionController } from '../prototype/combat-actions.mjs';

const make=(opt={})=>new CombatActionController(opt);
const steps=(c,n)=>{for(let i=0;i<n;i++)c.tick(1/120)};
const until=(c,p,max=500)=>{for(let i=0;i<max&&!p();i++)steps(c,1);assert.ok(p(),'phase did not arrive')};

test('34 action startup causes no instant damage',()=>{
 const c=make();c.press('launcher'); assert.equal(c.phase,'startup');assert.equal(c.arena.state,'idle');assert.equal(c.arena.events.length,0);
 steps(c,5);assert.equal(c.phase,'startup');assert.equal(c.arena.totalHits,0);
});
test('35 exactly one impact at first active frame',()=>{
 const c=make();c.press('launcher');until(c,()=>c.phase==='active');
 assert.equal(c.arena.state,'airborne');assert.equal(c.events.filter(e=>e.type==='impact').length,1);
 until(c,()=>c.phase==='recovery');assert.equal(c.events.filter(e=>e.type==='impact').length,1);
});
test('36 valid attack follows startup, active, recovery, idle',()=>{
 const c=make();c.press('launcher');until(c,()=>c.phase==='idle');
 assert.deepEqual(c.events.filter(e=>e.type==='phase').map(e=>e.phase),['startup','active','recovery']);
});
test('37 queued input is consumed after recovery',()=>{
 const c=make();c.press('launcher');until(c,()=>c.phase==='recovery');
 steps(c,4);assert.equal(c.press('airTap').type,'input-buffered');
 until(c,()=>c.events.some(e=>e.type==='input-consumed'));
 assert.equal(c.actionName,'airTap');assert.equal(c.phase,'startup');
});
test('38 early buffered input expires before recovery ends',()=>{
 const c=make({actionSettings:{inputBufferSeconds:.07}});c.press('launcher');
 steps(c,2);c.press('airTap');until(c,()=>c.phase==='idle');
 assert.ok(c.events.some(e=>e.type==='input-expired')); assert.equal(c.actionName,null);
});
test('39 latest queued command overwrites the earlier command',()=>{
 const c=make();c.press('launcher');until(c,()=>c.phase==='recovery');
 steps(c,5);c.press('highSlash');c.press('airTap');until(c,()=>c.events.some(e=>e.type==='input-consumed'));
 assert.equal(c.actionName,'airTap');
});
test('40 hitstop pauses attacker phase progression in bilateral mode',()=>{
 const c=make();c.press('launcher');until(c,()=>c.phase==='active');
 const prev=c.action.elapsed, y=c.arena.y,freeze=c.attackerHitstopRemaining;
 assert.ok(freeze>0);
 steps(c,2);assert.equal(c.action.elapsed,prev);assert.equal(c.arena.y,y);
});
test('41 unilateral mode keeps attacker animation advancing while target freezes',()=>{
 const c=make({actionSettings:{bilateralHitstop:false}});c.press('launcher');until(c,()=>c.phase==='active');
 const y=c.arena.y,progress=c.action.elapsed;steps(c,2);
 assert.ok(c.action.elapsed>progress);assert.equal(c.arena.y,y);
});
test('42 blocked hit never activates attacker hitstop',()=>{
 const a=new CombatArena();a.enemyX=100;const c=make({arena:a});c.press('launcher');
 until(c,()=>c.phase==='active');
 assert.equal(c.events.find(e=>e.type==='impact').reason,'aabb-miss');
 assert.equal(c.attackerHitstopRemaining,0);
});
test('43 disabled buffer rejects new input during active action',()=>{
 const c=make({actionSettings:{inputBufferSeconds:0}});c.press('launcher');
 assert.equal(c.press('groundSweep').reason,'busy');
});
test('44 global time advances during hitstop while animation time halts',()=>{
 const c=make();c.press('launcher');until(c,()=>c.phase==='active');
 const a=c.time,b=c.actionTime;steps(c,3);
 assert.ok(c.time>a);assert.equal(c.actionTime,b);
});
test('45 independent controller remains deterministic under 30/60/120Hz drivers',()=>{
 const copies=[];
 for (const fps of [30,60,120]) {
   const c=make();c.press('launcher');for(let i=0;i<fps/2;i++)c.tick(1/fps);
   copies.push({t:c.time,actionTime:c.actionTime,phase:c.phase, y:c.arena.y, hits:c.arena.totalHits});
 }
 assert.equal(copies[0].phase,copies[1].phase);assert.equal(copies[1].phase,copies[2].phase);
 for(const s of copies.slice(1))for(const k of ['t','actionTime','y','hits'])assert.ok(Math.abs(s[k]-copies[0][k])<1e-8,k+': '+JSON.stringify(copies));
});
test('46 sweep active window rejects standing target',()=>{
 const c=make();c.press('groundSweep');until(c,()=>c.phase==='active');
 assert.equal(c.events.find(e=>e.type==='impact').reason,'invalid-target-state');
 assert.equal(c.arena.groundHits,0);
});
test('47 action controller input validation',()=>{
 const c=make();assert.throws(()=>c.press('fake'),RangeError);
 for(const v of [NaN,-1,Infinity,9])assert.throws(()=>c.tick(v),RangeError);
});
test('48 queued action impact happens once after delayed startup',()=>{
 const c=make();c.press('launcher');until(c,()=>c.phase==='recovery');
 steps(c,5);c.press('airTap');until(c,()=>c.events.some(e=>e.type==='input-consumed'));
 const impacts=c.events.filter(e=>e.type==='impact').length;
 assert.equal(impacts,1);until(c,()=>c.events.filter(e=>e.type==='impact').length===2);
 assert.equal(c.events.filter(e=>e.type==='impact'&&e.name==='airTap').length,1);
});
