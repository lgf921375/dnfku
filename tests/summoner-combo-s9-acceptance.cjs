// Public controls and actual browser state transitions; no fabricated launch,
// forced impact or target reset to join separate scenes into one sequence.
const fs=require('node:fs'),path=require('node:path');
async function runSummonerComboS9Acceptance({page,dir,result}){
 const c=result.combo={status:'running',checks:[],cases:{},scope:'Composed S9 fixture and unchanged S7 victim core; desktop Chromium, not Android hardware'};
 const check=async(name,fn)=>{try{c.checks.push({name,status:await fn()?'PASS':'FAIL'});}catch(e){c.checks.push({name,status:'FAIL',error:e.stack});}};
 const state=()=>page.evaluate(()=>({snapshot:summonerLab.motion.snapshot(),events:summonerLab.motion.events,run:summonerLab.combo.run,timeline:summonerLab.timeline,profile:document.getElementById('comparison').value,scene:document.getElementById('scene').value}));
 const wait=fn=>page.waitForFunction(fn,null,{timeout:8500,polling:'raf'});
 const choose=async(profile='combined',scene='air-flow')=>{await page.locator('#comparison').selectOption(profile);await page.locator('#scene').selectOption(scene);};
 const start=()=>page.locator('#combo').click();const done=()=>wait(()=>summonerLab.combo.run?.done);
 await page.locator('#slow').uncheck();await page.locator('#sound').uncheck();await page.locator('#rig').uncheck();
 await check('both selectors share one configuration group; all 55 combinations retain both axes',async()=>{
  const config=await page.evaluate(()=>({group:document.getElementById('comparison').closest('[role=group]')===document.getElementById('scene').closest('[role=group]'),profiles:[...document.getElementById('comparison').options].map(o=>o.value).filter(v=>v!=='custom'),scenes:[...document.getElementById('scene').options].map(o=>o.value)}));let checked=0;
  for(const profile of config.profiles)for(const scene of config.scenes){await page.locator('#scene').selectOption(scene);await page.locator('#comparison').selectOption(profile);let s=await state();if(s.profile!==profile||s.scene!==scene||s.snapshot.scenario!==(scene==='air-flow'?'air':scene))return false;
   await page.locator('#scene').selectOption(scene);s=await state();if(s.profile!==profile||s.scene!==scene)return false;checked++;}
  c.cases.combinations={...config,checked};return config.group&&checked===55;
 });
 await check('combined air-to-ground demo preserves one fight, real contact, HP and protected standing',async()=>{
  await choose();await start();await done();const s=c.cases.complete=await state(),hits=s.events.filter(e=>e.type==='impact');await page.screenshot({fullPage:true,path:path.join(dir,'s9-complete-internal.png')});
  const order=['victim-land','forced-stand','victim-standing','combo-demo-done'].map(type=>s.events.findIndex(e=>e.type===type));
  return JSON.stringify(hits.map(e=>[e.victimState,e.targetHP]))==='[["air",112],["down",98],["down",84]]'&&new Set(hits.map(e=>e.attackId)).size===3&&order.every((n,i)=>n>=0&&(!i||n>order[i-1]))&&s.events.filter(e=>e.type==='combo-demo-start').length===1&&s.snapshot.target.hp===84&&s.snapshot.target.state==='standing'&&s.snapshot.target.invulnerable===0&&s.run.reason==='protection'&&s.run.approachDistance>0&&!s.snapshot.held&&!s.snapshot.replay&&!s.snapshot.action;
 });
 await check('visible timeline follows actual hit, landing, chase and rise events in order',async()=>{
  const s=c.cases.complete,expected=['fixture',...s.events.filter(e=>['impact','victim-land','forced-stand','victim-rise','victim-standing','victim-defeat','combo-demo-done'].includes(e.type)).map(e=>e.type)];return JSON.stringify(s.timeline.map(e=>e.event))===JSON.stringify(expected)&&s.timeline.some(e=>e.text==='浮空受击')&&s.timeline.filter(e=>e.text==='倒地追击').length===2&&s.timeline.some(e=>e.text==='保护起身');
 });
 await check('ordinary-monster combination naturally rises at cycle bound without PK protection',async()=>{
  await choose('standing');await start();await done();const s=c.cases.monster=await state();return s.profile==='standing'&&s.scene==='air-flow'&&s.snapshot.targetKind==='monster'&&s.run.completed===4&&s.run.reason==='cycle-limit'&&s.events.some(e=>e.type==='victim-rise')&&!s.events.some(e=>e.type==='forced-stand')&&s.snapshot.target.state==='standing'&&s.events.filter(e=>e.type==='impact').some(e=>e.victimState==='down');
 });
 await check('combined standing configuration has actual standing hits and no invented airborne launch',async()=>{
  await choose('combined','standing');await page.locator('#replay').click();await wait(()=>summonerLab.motion.events.some(e=>e.type==='reference-done'));const s=c.cases.standing=await state();return s.snapshot.target.hp===88&&s.events.filter(e=>e.type==='impact').every(e=>e.victimState==='standing')&&!s.events.some(e=>e.type==='launch')&&s.snapshot.target.y===0;
 });
 await check('combined down configuration reaches protection in the same two ground hits',async()=>{
  await choose('combined','down');await start();await done();const s=c.cases.down=await state();return s.profile==='combined'&&s.scene==='down'&&s.run.reason==='protection'&&s.snapshot.target.hp===92&&s.events.filter(e=>e.type==='impact').every(e=>e.stage===2&&e.victimState==='down')&&s.snapshot.target.state==='standing';
 });
 await check('fragile plus continuous state falls after one lethal contact and stops',async()=>{
  await choose('fragile');await start();await done();const s=c.cases.death=await state();return s.scene==='air-flow'&&s.snapshot.target.hp===0&&s.snapshot.target.state==='down'&&s.snapshot.target.y===0&&s.snapshot.hitCount===1&&s.run.reason==='defeat'&&s.events.filter(e=>e.type==='victim-defeat').length===1;
 });
 await check('manual stop keeps the current victim instead of resetting the demonstration',async()=>{
  await choose();await start();await wait(()=>summonerLab.motion.hitCount===1);const before=await state();await page.locator('#combo').click();await wait(()=>!summonerLab.motion.action);await page.waitForTimeout(150);const after=c.cases.manualStop=await state();return before.snapshot.target.hp===112&&after.snapshot.target.hp===112&&after.snapshot.hitCount===1&&after.run.reason==='manual'&&!after.snapshot.held&&!after.snapshot.replay&&after.events.filter(e=>e.type==='motion-start').length===1;
 });
 await check('state change during a combo keeps the selected profile and clears the old run',async()=>{
  await choose();await start();await wait(()=>summonerLab.motion.hitCount===1);await page.locator('#scene').selectOption('down');const s=c.cases.stateSwitch=await state();return s.profile==='combined'&&s.scene==='down'&&s.snapshot.scenario==='down'&&s.snapshot.targetKind==='player'&&s.snapshot.pkProtectionEnabled&&s.snapshot.target.hp===120&&!s.snapshot.action&&!s.snapshot.held&&!s.run;
 });
 await check('profile change during a combo keeps the selected state and applies the new armor',async()=>{
  await choose();await start();await wait(()=>summonerLab.motion.hitCount===1);await page.locator('#comparison').selectOption('armor');const s=c.cases.profileSwitch=await state();return s.profile==='armor'&&s.scene==='air-flow'&&s.snapshot.scenario==='air'&&s.snapshot.armored&&s.snapshot.target.hp===120&&!s.snapshot.action&&!s.snapshot.held&&!s.run;
 });
 await check('advanced custom controls and reset retain the state combination',async()=>{
  await choose('depth-back','down');await page.locator('#armor').check();await page.locator('#reset').click();const s=c.cases.custom=await state();return s.profile==='custom'&&s.scene==='down'&&s.snapshot.scenario==='down'&&s.snapshot.target.lane===-9&&s.snapshot.armored&&!s.snapshot.action;
 });
 await check('portrait phone-size touch plays the complete joined chain with both choices visible',async()=>{
  await choose();if(await page.locator('details').evaluate(e=>e.open))await page.getByText('逐帧查看',{exact:true}).click();await page.setViewportSize({width:390,height:844});await page.evaluate(()=>scrollTo(0,0));
  c.cases.phoneLayout=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,selects:['comparison','scene'].map(id=>{const r=document.getElementById(id).getBoundingClientRect();return {id,height:r.height,top:r.top,bottom:r.bottom,left:r.left,right:r.right};})}));
  await page.locator('#combo').tap();await done();const s=c.cases.touchCombo=await state();await page.screenshot({fullPage:true,path:path.join(dir,'s9-phone-complete-internal.png')});const l=c.cases.phoneLayout;
  return l.scrollWidth<=l.width&&l.selects.every(r=>r.height>=44&&r.top>=0&&r.bottom<844&&r.left>=0&&r.right<=390)&&s.snapshot.target.hp===84&&s.run.reason==='protection'&&s.timeline.filter(e=>e.text==='倒地追击').length===2;
 });
 await check('landscape phone-size shows Canvas, both choices and combo button together',async()=>{
  await page.setViewportSize({width:844,height:390});await page.evaluate(()=>scrollTo(0,0));c.cases.landscape=await page.evaluate(()=>({height:innerHeight,width:innerWidth,scrollWidth:document.documentElement.scrollWidth,items:['comparison','scene','stage','combo'].map(id=>{const r=document.getElementById(id).getBoundingClientRect();return {id,top:r.top,bottom:r.bottom};})}));await page.screenshot({fullPage:true,path:path.join(dir,'s9-landscape-internal.png')});const l=c.cases.landscape;await page.setViewportSize({width:960,height:540});return l.scrollWidth<=l.width&&l.items.every(r=>r.top>=0&&r.bottom<=l.height);
 });
 await check('no new browser, console or network errors',async()=>!result.errors.length&&!result.consoleErrors.length&&!result.requestFailures.length);
 c.status=c.checks.every(x=>x.status==='PASS')?'passed-combo-browser':'failed-combo-browser';const tmp=path.join(dir,'combo-results.pending.json');fs.writeFileSync(tmp,JSON.stringify(c,null,2)+'\n');fs.renameSync(tmp,path.join(dir,'combo-results.json'));return c;
}
module.exports={runSummonerComboS9Acceptance};
