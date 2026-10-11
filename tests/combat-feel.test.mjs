import { CombatArena } from '../prototype/combat-core.mjs';
import { test as nodeTest } from 'node:test';
import assert from 'node:assert/strict';

nodeTest('24 hitstop suspends physical motion while event clock keeps advancing',()=>{
 const a=new CombatArena();a.hit('launcher');const y=a.y,t=a.time;
 a.tick(0.025);
 assert.equal(a.y,y);assert.ok(a.time>t);assert.ok(a.hitstopRemaining>0);
 a.tick(0.075);
 assert.ok(a.hitstopRemaining===0);assert.ok(a.y>y);
});
nodeTest('25 hitstop zero restores immediate physical motion',()=>{
 const a=new CombatArena({hitstopSeconds:0});a.hit('launcher');const y=a.y;
 a.tick(1/120);assert.ok(a.y>y);assert.equal(a.hitstopRemaining,0);
});
nodeTest('26 repeated blocked hits do not extend hitstop',()=>{
 const a=new CombatArena();a.hit('launcher');a.tick(1/120);
 const h=a.hitstopRemaining;
 assert.equal(a.hit('launcher').reason,'hit-cadence');
 assert.equal(a.hitstopRemaining,h);
});
nodeTest('27 optional ground bounce triggers once before prone',()=>{
 const a=new CombatArena({groundBounceVelocity:2,groundBounceCount:1});
 a.hit('launcher');for(let n=0;n<500 && a.state!=='down';n++)a.tick(1/120);
 assert.equal(a.state,'down');assert.equal(a.events.filter(e=>e.type==='ground-bounce').length,1);
 assert.equal(a.events.filter(e=>e.type==='landed').length,1);
 assert.equal(a.y,0);assert.equal(a.vy,0);
});
nodeTest('28 bounce callback preserves airborne state and blocks sweep',()=>{
 const a=new CombatArena({groundBounceVelocity:2,groundBounceCount:1});
 a.hit('launcher');for(let n=0;n<300 && !a.events.some(e=>e.type==='ground-bounce');n++)a.tick(1/120);
 assert.equal(a.events.filter(e=>e.type==='ground-bounce').length,1);
 assert.equal(a.state,'airborne');assert.equal(a.hit('groundSweep').reason,'invalid-target-state');
});
nodeTest('29 no bounce on default settings',()=>{
 const a=new CombatArena();a.hit('launcher');for(let n=0;n<300 && a.state!=='down';n++)a.tick(1/120);
 assert.equal(a.state,'down');assert.equal(a.events.some(e=>e.type==='ground-bounce'),false);
});
nodeTest('30 ground sweep still connects after low bounce finishes',()=>{
 const a=new CombatArena({groundBounceVelocity:1.2,groundBounceCount:1});
 a.hit('launcher');for(let n=0;n<300 && a.state!=='down';n++)a.tick(1/120);
 assert.equal(a.state,'down');assert.equal(a.hit('groundSweep').type,'hit');
});
nodeTest('31 hitstop pauses knockdown countdown after a valid sweep',()=>{
 const a=new CombatArena();a.hit('launcher');for(let n=0;n<300&&a.state!=='down';n++)a.tick(1/120);
 assert.equal(a.hit('groundSweep').type,'hit');const remain=a.downRemaining;
 a.tick(0.02);assert.equal(a.downRemaining,remain);
 a.tick(0.10);assert.ok(a.downRemaining<remain);
});
nodeTest('32 protection cancels both pending bounce and hitstop',()=>{
 const a=new CombatArena({groundBounceVelocity:2,groundBounceCount:1});
 a.hit('launcher');for(let n=0;n<3;n++){a.tick(0.11);a.hit('airTap');}
 assert.equal(a.state,'invulnerable');assert.equal(a.hitstopRemaining,0);
 assert.equal(a.bounceRemaining,0);assert.equal(a.y,0);
});
nodeTest('33 frame-driver equivalence with hitstop enabled',()=>{
 const states=[];
 for(const fps of [30,60,120]){
  const a=new CombatArena();a.hit('launcher');for(let n=0;n<fps/2;n++)a.tick(1/fps);
  states.push([a.y,a.vy,a.hitstopRemaining]);
 }
 for(const s of states.slice(1))for(let j=0;j<3;j++)assert.ok(Math.abs(states[0][j]-s[j])<1e-9,JSON.stringify(states));
});
