import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {CombatJuggle} from '../prototype/combat-juggle.mjs';
import evidence from './protection-evidence.cjs';
const {validProtection,protectionUnchanged,protectionHistoryUnchanged}=evidence;
const replay=JSON.parse(fs.readFileSync(new URL('../docs/evidence-v11-local-20261013/historical-replay.json',import.meta.url)));
const samples=[];
const observe=g=>structuredClone({body:g.fighter('B').body.snapshot(),bodyEvents:g.fighter('B').body.events,events:g.events,hp:g.fighter('B').hp,settings:g.settings,samples});
function heldUntilProtection(frameSeconds,delay=0){
  const g=new CombatJuggle();let next=delay;
  for(const dt of frameSeconds){
    if(g.time>=next){g.basic();next=g.time+.15;}
    g.tick(dt);
    if(g.fighter('B').body.state==='invulnerable')return g;
  }
  assert.fail('Public input did not reach protection');
}
function checkFullWindow(g){
  samples.length=0;const entry=observe(g),hp=entry.hp;let next=g.time;
  while(g.fighter('B').body.state==='invulnerable'){
    // Public key presses keep the real input buffer populated. No body/HP writes.
    if(g.time>=next){g.basic();next=g.time+.15;}
    g.tick(1/120);samples.push({time:g.time,b:g.fighter('B').body.snapshot(),hp:g.fighter('B').hp});
    assert.equal(g.fighter('B').hp,hp,'Immunity HP changed, including a queued input');
    if(g.fighter('B').body.state==='invulnerable')assert.ok(protectionUnchanged(entry,observe(g)));
  }
  assert.ok(protectionHistoryUnchanged(entry,observe(g)));
  const end=g.fighter('B').body.events.filter(e=>e.type==='protection-ended').at(-1);
  assert.ok(end.time>entry.body.time);
  // Stop repeating, let queued public input finish, then issue a fresh public attack.
  for(let i=0;i<120&&(g.fighter('A').controller.action||g.fighter('A').controller.buffer);i++)g.tick(1/120);
  const before=g.fighter('B').hp;g.basic();g.tick(.5);
  assert.ok(g.fighter('B').hp<before,'New input after expiry must damage again');
  return {entry,end,final:observe(g)};
}
test('historical RAF cadence + declared public input delay reproduces omitted ground-limit, HP504',()=>{
  const g=heldUntilProtection(replay.frameSeconds,replay.inputDelaySeconds),b=g.fighter('B');
  const stand=b.body.events.find(e=>e.type==='forced-stand');
  assert.equal(stand.reason,'ground-limit');assert.equal(stand.groundHits,3);assert.equal(stand.totalHits,6);assert.equal(b.hp,504);
  assert.equal(stand.airHits===4||stand.totalHits===7,false,'Original predicate is demonstrably false');
  assert.ok(validProtection(stand,g.settings));
  const trace=checkFullWindow(g);
  if(process.env.DNFKU_TRAJECTORY_PATH)fs.writeFileSync(process.env.DNFKU_TRAJECTORY_PATH,JSON.stringify({status:'PASS-Node-only',inputDelayIsDeclaredReproducer:true,trace},null,2));
});
for(const hz of [20,30,60,90,120])for(const delay of [0,1/120,1/60]){
  test(`public held input ${hz}Hz, delay ${delay.toFixed(5)}: threshold, full immunity, recovery`,()=>{
    const g=heldUntilProtection(Array(hz*12).fill(1/hz),delay);
    assert.ok(validProtection(g.fighter('B').body.events.find(e=>e.type==='forced-stand'),g.settings));checkFullWindow(g);
  });
}
test('protection evidence rejects absent, below-limit, unknown and mismatched reasons',()=>{
  const settings={airHitLimit:4,groundHitLimit:3,totalHitLimit:7};
  for(const stand of [null,{type:'forced-stand',reason:'ground-limit',groundHits:2},{type:'forced-stand',reason:'made-up',groundHits:3},{type:'forced-stand',reason:'air-limit',airHits:0,groundHits:3}])assert.equal(validProtection(stand,settings),false);
  for(const [reason,field,n] of [['air-limit','airHits',4],['ground-limit','groundHits',3],['total-limit','totalHits',7]])assert.ok(validProtection({type:'forced-stand',reason,[field]:n},settings));
});
test('protection evidence fails for HP, damage-event and transient sample tampering',()=>{
  const g=heldUntilProtection(replay.frameSeconds,replay.inputDelaySeconds);samples.length=0;
  const entry=observe(g);g.tick(.1);const later=observe(g);
  assert.ok(protectionUnchanged(entry,later));
  // Mutate detached evidence copies only, to prove the predicate is not a constant true.
  const hp=structuredClone(later);hp.hp--;assert.equal(protectionUnchanged(entry,hp),false);
  const damage=structuredClone(later);damage.events.push({type:'damage',time:entry.body.time+.05});assert.equal(protectionUnchanged(entry,damage),false);
  const transient=structuredClone(later);transient.samples.push({time:entry.body.time+.05,b:{state:'invulnerable'},hp:entry.hp-1});assert.equal(protectionUnchanged(entry,transient),false);
  const expired=structuredClone(later);expired.body.state='idle';assert.equal(protectionUnchanged(entry,expired),false);
});
