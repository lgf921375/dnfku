/** Run: node --test tests/combat-core.test.mjs ; no dependencies. */
import { CombatArena, SETTINGS } from '../prototype/combat-core.mjs';
import { test as nodeTest } from 'node:test';
import assert from 'node:assert/strict';
const cases=(function runSuite(Arena, cfg) {
  const results=[];
  function test(name, fn){try{fn();results.push({name,status:"PASS"});}catch(e){results.push({name,status:"FAIL",error:String(e.message||e)});}}
  function ok(cond,message){if(!cond)throw new Error(message||"assertion failed");}
  function eq(actual,expected,msg){ok(actual===expected,`${msg||"value"}: expected ${expected}, got ${actual}`);}
  function near(actual,expected,tol,msg){ok(Math.abs(actual-expected)<=tol,`${msg||"value"}: expected ${expected}±${tol}, got ${actual}`);}
  function land(a) {for(let i=0;i<300 && a.state!=="down";i++)a.tick(1/120);eq(a.state,"down","land state");}
  test("01 launch from standing enters air with positive speed",()=>{
    const a=new Arena();eq(a.hit("launcher").type,"hit");eq(a.state,"airborne");near(a.vy,cfg.launchVelocity,1e-9);
  });
  test("02 airborne arc reaches apex and lands (no floor penetration)",()=>{
    const a=new Arena();a.hit("launcher");let max=0;let landingTime=0;
    for(let i=0;i<240;i++){a.tick(1/120);max=Math.max(max,a.y);if(a.state==="down"){landingTime=a.time;break}}
    ok(max>2.2 && max<2.6,"apex out of expected original-prototype range "+max);
    ok(landingTime>0.85&&landingTime<1.05,"unexpected landing time "+landingTime);
    eq(a.y,0);eq(a.vy,0);
  });
  test("03 standing target cannot be swept; no combo pollution",()=>{
    const a=new Arena();eq(a.hit("groundSweep").reason,"invalid-target-state");eq(a.totalHits,0);
  });
  test("04 high slash does not hit prone target",()=>{
    const a=new Arena();a.hit("launcher");land(a);eq(a.hit("highSlash").reason,"invalid-target-state");eq(a.state,"down");
  });
  test("05 low sweep connects after landing and refreshes down timer",()=>{
    const a=new Arena();a.hit("launcher");land(a);a.tick(0.53);ok(a.downRemaining<0.45);
    const event=a.hit("groundSweep");eq(event.type,"hit");eq(a.state,"down");near(a.downRemaining,cfg.knockdownSeconds,1e-9);
  });
  test("06 protection forces immediate stand after three ground sweeps",()=>{
    const a=new Arena();a.hit("launcher");land(a);
    a.hit("groundSweep");a.hit("groundSweep");a.hit("groundSweep");
    eq(a.state,"invulnerable");eq(a.y,0);eq(a.events.filter(e=>e.type==="forced-stand").length,1);
    eq(a.events.find(e=>e.type==="forced-stand").reason,"ground-limit");
  });
  test("07 attacks blocked during protection then accepted after expiration",()=>{
    const a=new Arena();a.hit("launcher");land(a);
    for(let i=0;i<3;i++)a.hit("groundSweep");
    eq(a.hit("launcher").reason,"protected-invulnerability");
    a.tick(cfg.protectedInvulnerabilitySeconds+0.02);eq(a.state,"idle");eq(a.hit("launcher").type,"hit");
  });
  test("08 four airborne hits trigger air-protection forced stand",()=>{
    const a=new Arena();a.hit("launcher");
    for(let i=0;i<3;i++){a.tick(0.05);eq(a.hit("airTap").type,"hit");}
    eq(a.state,"invulnerable");eq(a.events.find(e=>e.type==="forced-stand").reason,"air-limit");
  });
  test("09 airTap explicitly replaces vertical speed",()=>{
    const a=new Arena();a.hit("launcher");a.tick(0.2);ok(a.vy<cfg.launchVelocity);
    a.hit("airTap");near(a.vy,cfg.airTapVelocity,1e-9);
  });
  test("10 distance miss is not a hit nor a combo",()=>{
    const a=new Arena();a.enemyX=5;eq(a.hit("launcher").reason,"aabb-miss");eq(a.totalHits,0);
  });
  test("11 world-space translation invariance",()=>{
    const a=new Arena(),b=new Arena();b.playerX=15;b.enemyX=15.8;
    eq(a.hit("launcher").type,b.hit("launcher").type);a.tick(0.5);b.tick(0.5);
    near(a.y,b.y,1e-10);eq(a.state,b.state);
  });
  test("12 ordinary stand after knockdown time elapses",()=>{
    const a=new Arena();a.hit("launcher");land(a);a.tick(cfg.knockdownSeconds+0.02);
    eq(a.state,"idle");ok(a.events.some(e=>e.type==="ordinary-stand"));
  });
  test("13 30/60/120Hz driver step agrees at 0.5 seconds",()=>{
    const samples=[];
    for(const fps of [30,60,120]){const a=new Arena();a.hit("launcher");for(let i=0;i<fps/2;i++)a.tick(1/fps);samples.push(a.snapshot());}
    for(let i=1;i<samples.length;i++){near(samples[i].y,samples[0].y,1e-10);near(samples[i].vy,samples[0].vy,1e-10);eq(samples[i].state,samples[0].state);}
  });
  test("14 no false air-protection on isolated highSlash",()=>{
    const a=new Arena();a.hit("highSlash");a.tick(cfg.comboWindowSeconds+0.04);eq(a.totalHits,0);eq(a.state,"idle");
  });
  test("15 reject nonfinite and negative time input",()=>{
    const a=new Arena();for(const n of [-1,NaN,Infinity,6]){let failed=false;try{a.tick(n)}catch(e){failed=true}ok(failed,"accepted "+n);}
  });
  test("16 protection has a single transition event",()=>{
    const a=new Arena();a.hit("launcher");land(a);for(let i=0;i<3;i++)a.hit("groundSweep");
    a.tick(1);eq(a.events.filter(e=>e.type==="forced-stand").length,1);eq(a.events.filter(e=>e.type==="protection-ended").length,1);
  });
  return results;
})(CombatArena, SETTINGS);
for (const result of cases) nodeTest(result.name,()=>assert.equal(result.status,'PASS',result.error));
