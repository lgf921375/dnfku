import test from 'node:test';
import assert from 'node:assert/strict';
import {SummonerVictimS7} from '../prototype/summoner-victim-s7.mjs';
import {SummonerComboS9} from '../prototype/summoner-combo-s9.mjs';
const fixture=({scene='air',player=true,protect=true,fragile=false,empty=false,lane=0,left=false}={})=>{
 const m=new SummonerVictimS7();m.setScenario(scene);m.setTargetKind(player?'player':'monster');m.setPKProtection(protect);m.setFragile(fragile);m.target.present=!empty;m.target.lane=lane;if(left){m.face(-1);m.placeTargetInFront();}return m;
};
const finish=(demo,fps=120)=>{for(let i=0;i<fps*9&&demo.active;i++)demo.tick(1/fps);assert.equal(demo.active,false);return demo.motion;};
test('S9 full chain uses air contact, real floor, two ground hits and protected standing without resets',()=>{
 const m=fixture(),demo=new SummonerComboS9(m);m.reset=()=>{throw Error('Reset during same fight');};demo.start();finish(demo);
 assert.deepEqual(m.events.filter(e=>e.type==='impact').map(e=>[e.victimState,e.targetHP]),[['air',112],['down',98],['down',84]]);
 const order=['victim-land','forced-stand','victim-standing','combo-demo-done'].map(type=>m.events.findIndex(e=>e.type===type));assert(order.every((n,i)=>n>=0&&(!i||n>order[i-1])));
 assert.equal(m.target.state,'standing');assert.equal(m.target.invulnerable,0);assert.equal(demo.run.reason,'protection');assert(m.x>0);assert(!m.events.some(e=>e.type==='launch'));
});
test('S9 controller milestones agree across 30, 60 and 120Hz outer calls',()=>{
 const records=[30,60,120].map(fps=>{const m=fixture(),demo=new SummonerComboS9(m);demo.start();finish(demo,fps);return m.events.filter(e=>['impact','victim-land','forced-stand','victim-standing','combo-demo-done'].includes(e.type));});assert.deepEqual(records[0],records[1]);assert.deepEqual(records[1],records[2]);
});
test('S9 ordinary monster completes bounded cycles and naturally rises without PK forced stand',()=>{
 const m=fixture({player:false}),demo=new SummonerComboS9(m);demo.start();finish(demo);assert.equal(demo.run.reason,'cycle-limit');assert.equal(demo.run.completed,4);assert.equal(m.target.state,'standing');assert(m.events.some(e=>e.type==='victim-rise'));assert(!m.events.some(e=>e.type==='forced-stand'));assert.equal(m.held,false);assert.equal(m.replay,false);
});
test('S9 death preserves altitude until floor and ends without repeated damage',()=>{
 const m=fixture({fragile:true}),demo=new SummonerComboS9(m);demo.start();finish(demo);assert.equal(demo.run.reason,'defeat');assert.equal(m.target.hp,0);assert.equal(m.hitCount,1);assert.equal(m.target.state,'down');assert.equal(m.target.y,0);assert.equal(m.events.filter(e=>e.type==='victim-defeat').length,1);
});
test('S9 empty and out-of-plane runs never manufacture contact or protection',()=>{
 for(const settings of [{empty:true},{lane:24}]){const m=fixture(settings),demo=new SummonerComboS9(m);demo.start();finish(demo);assert.equal(m.target.hp,120);assert.equal(m.hitCount,0);assert.equal(demo.run.completed,4);assert(!m.events.some(e=>e.type==='forced-stand'));}
});
test('S9 cancellation preserves current target HP/pose and clears automatic replay/input',()=>{
 const m=fixture(),demo=new SummonerComboS9(m);demo.start();while(m.hitCount===0)demo.tick(1/120);const hp=m.target.hp,y=m.target.y;demo.cancel();assert.equal(m.target.hp,hp);assert.equal(m.target.y,y);assert.equal(m.held,false);assert.equal(m.queue,false);assert.equal(m.replay,false);assert.equal(demo.run.reason,'manual');
 for(let i=0;i<120;i++)demo.tick(1/120);assert.equal(m.hitCount,1);assert.equal(m.events.filter(e=>e.type==='motion-start').length,1);
});
test('S9 left-facing approach stays mirrored and yields the same contact chain',()=>{
 const m=fixture({left:true}),demo=new SummonerComboS9(m);demo.start();finish(demo);assert.equal(m.facing,-1);assert(m.x<0);assert.equal(m.target.hp,84);assert.deepEqual(m.events.filter(e=>e.type==='impact').map(e=>e.victimState),['air','down','down']);
});
test('S9 unreachable actor clamp exits at time limit without teleporting or resetting target',()=>{
 const m=fixture();m.target.x=1000;const demo=new SummonerComboS9(m);demo.start();finish(demo);assert.equal(demo.run.reason,'time-limit');assert.equal(m.x,220);assert.equal(m.target.x,1000);assert.equal(m.target.hp,120);
});
test('S9 paused/busy start and invalid delta are rejected without replacing live combat',()=>{
 const m=fixture(),demo=new SummonerComboS9(m);m.seekFrame(11);assert.throws(()=>demo.start());m.reset();m.press();assert.throws(()=>demo.start());assert.throws(()=>demo.tick(-1));assert.throws(()=>demo.tick(NaN));assert.throws(()=>demo.tick(6));assert.equal(m.target.hp,120);
});
