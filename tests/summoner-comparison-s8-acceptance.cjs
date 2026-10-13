// Exercise the integrated menu through public controls. The S7 combat suite
// covers physics separately; these checks cover composition and switching.
const fs=require('node:fs'),path=require('node:path');
async function runSummonerComparisonS8Acceptance({page,dir,result}){
 const c=result.comparison={status:'running',checks:[],cases:{},scope:'S8 combined presets on unchanged S7 core; original DNF/Android parity NOT COVERED'};
 const check=async(name,fn)=>{try{c.checks.push({name,status:await fn()?'PASS':'FAIL'});}catch(e){c.checks.push({name,status:'FAIL',error:e.stack});}};
 const state=()=>page.evaluate(()=>({snapshot:summonerLab.motion.snapshot(),events:summonerLab.motion.events,run:summonerLab.comparisonRun,selection:document.getElementById('comparison').value,hint:document.getElementById('comparisonHint').textContent}));
 const select=id=>page.locator('#comparison').selectOption(id);
 const play=()=>page.locator('#replay').click();
 const wait=fn=>page.waitForFunction(fn,null,{timeout:4500,polling:'raf'});
 await page.locator('#slow').uncheck();await page.locator('#sound').uncheck();await page.locator('#rig').uncheck();
 await check('menu includes every compound scenario and selectable custom settings',async()=>{
  c.cases.options=await page.locator('#comparison').evaluate(e=>[...e.options].map(o=>({value:o.value,label:o.textContent})));
  return c.cases.options.length===18&&new Set(c.cases.options.map(o=>o.value)).size===18&&c.cases.options.some(o=>o.value==='custom');
 });
 for(const [id,hits,hp] of [['standing',3,88],['empty',0,120],['player',3,88],['no-feedback',3,88],['depth-miss',0,120]])await check(`menu playback ${id}: genuine contact result and automatic stop`,async()=>{
  await select(id);await play();await wait(()=>summonerLab.comparisonRun?.done);const s=c.cases[id]=await state();
  return s.snapshot.hitCount===hits&&s.snapshot.target.hp===hp&&!s.snapshot.action&&!s.snapshot.held&&!s.snapshot.replay&&s.run.completed===1&&(id!=='player'||s.snapshot.targetKind==='player')&&(id!=='no-feedback'||s.events.filter(e=>e.type==='impact').every(e=>e.stopSeconds===0));
 });
 await check('menu air fixture produces actual airborne contact before floor transition',async()=>{
  await select('air');await play();await wait(()=>summonerLab.comparisonRun?.done);const s=c.cases.air=await state();return s.events.some(e=>e.type==='impact'&&e.victimState==='air')&&s.events.some(e=>e.type==='victim-land')&&s.snapshot.target.hp<120;
 });
 await check('menu standing armor preserves damage and suppresses ordinary reactions',async()=>{
  await select('armor');await play();await wait(()=>summonerLab.comparisonRun?.done);const s=c.cases.armor=await state();return s.snapshot.hitCount===3&&s.snapshot.target.hp===88&&s.events.filter(e=>e.type==='armored-hit').length===3&&!s.snapshot.target.reaction;
 });
 for(const [id,lane] of [['depth-front',9],['depth-back',-9]])await check(`menu ${id} plays at its selected depth and records the matching effect plane`,async()=>{
  await select(id);await play();await wait(()=>summonerLab.comparisonRun?.done);const s=c.cases[id]=await state(),hits=s.events.filter(e=>e.type==='impact');return s.snapshot.target.lane===lane&&hits.length>0&&hits.every(e=>e.lane===lane&&Math.abs(e.projectedPoint.y-(e.point.y-lane))<1e-8);
 });
 for(const [id,protectedRise] of [['down',false],['pk-protection',true]])await check(`menu ${id}: two complete cycles, low hits and protection separation`,async()=>{
  await select(id);await play();await wait(()=>summonerLab.comparisonRun?.done);const s=c.cases[id]=await state(),hits=s.events.filter(e=>e.type==='impact');
  return s.run.completed===2&&s.snapshot.hitCount===2&&s.snapshot.target.hp===92&&hits.every(e=>e.stage===2&&e.victimState==='down')&&s.events.some(e=>e.type==='forced-stand')===protectedRise&&!s.snapshot.held&&!s.snapshot.action;
 });
 for(const id of ['air-death','down-death'])await check(`menu ${id}: lethal pose survives automatic playback`,async()=>{
  await select(id);await play();await wait(()=>summonerLab.comparisonRun?.done&&summonerLab.motion.target.state==='down');const s=c.cases[id]=await state();
  return s.snapshot.target.hp===0&&s.snapshot.hitCount===1&&s.snapshot.targetPose.head.y<25&&s.events.filter(e=>e.type==='victim-defeat').length===1&&!s.events.some(e=>e.type==='victim-rise');
 });
 await check('menu ordinary rise versus armored rise uses the same real first contact',async()=>{
  for(const id of ['rise','armor-rise']){await select(id);await play();await wait(()=>summonerLab.motion.hitCount>0);c.cases[id]=await state();}
  const a=c.cases.rise,b=c.cases['armor-rise'];return a.events.some(e=>e.type==='rise-interrupted')&&!b.events.some(e=>e.type==='rise-interrupted')&&b.events.some(e=>e.type==='armored-hit');
 });
 await check('paired edge selections replay the same paused fixture with opposite results',async()=>{
  for(const id of ['edge-rectangle','edge-outline']){await select(id);await play();c.cases[id]=await state();await page.locator('#stage').screenshot({path:path.join(dir,id+'-internal.png')});}
  const a=c.cases['edge-rectangle'],b=c.cases['edge-outline'];return a.snapshot.paused&&b.snapshot.paused&&a.snapshot.action.frame===11&&b.snapshot.action.frame===11&&JSON.stringify(a.snapshot.contactEdge.staff)===JSON.stringify(b.snapshot.contactEdge.staff)&&a.snapshot.target.hp===110&&b.snapshot.target.hp===120&&a.snapshot.hitCount===1&&b.snapshot.hitCount===0;
 });
 await check('switch from paused/dead/protected fixtures removes all stale combat state',async()=>{
  for(const id of ['edge-outline','air-death','pk-protection']){await select(id);await play();if(id!=='edge-outline')await wait(()=>summonerLab.comparisonRun?.done);await select('standing');const s=await state();c.cases['switch-'+id]=s;const t=s.snapshot.target;
   if(s.snapshot.paused||s.snapshot.contactEdge||s.snapshot.held||s.snapshot.queued||s.snapshot.action||s.snapshot.hitCount!==0||t.hp!==120||t.state!=='standing'||t.stop||t.invulnerable||t.reaction||Object.values(t.combo).some(Boolean)||s.snapshot.effects.length||s.run)return false;
  }return true;
 });
 await check('switch during real held input releases it and keeps new empty fixture',async()=>{
  await select('down');const b=await page.locator('#attack').boundingBox();await page.mouse.move(b.x+b.width/2,b.y+b.height/2);await page.mouse.down();
  try{await wait(()=>summonerLab.motion.action!==null);await select('empty');}finally{await page.mouse.up();}
  await page.waitForTimeout(150);const s=c.cases.heldSwitch=await state();return !s.snapshot.held&&!s.snapshot.action&&!s.snapshot.target.present&&s.snapshot.hitCount===0;
 });
 await check('manual adjustments become custom, replay/reset retain config, preferences survive presets',async()=>{
  await select('standing');await page.locator('#pk').check();await page.locator('#scene').selectOption('down');await page.locator('#depth').fill('9');const before=await state();
  await play();await wait(()=>summonerLab.comparisonRun?.done);await page.locator('#reset').click();const after=c.cases.custom=await state();
  await page.locator('#slow').check();await page.locator('#rig').check();await select('player');const prefs=await page.evaluate(()=>['slow','rig'].every(id=>document.getElementById(id).checked));await page.locator('#slow').uncheck();await page.locator('#rig').uncheck();
  return before.selection==='custom'&&after.selection==='custom'&&after.snapshot.scenario==='down'&&after.snapshot.targetKind==='player'&&after.snapshot.target.lane===9&&after.snapshot.target.hp===120&&!after.snapshot.held&&prefs;
 });
 await check('selector keyboard has no accidental owner movement or attack',async()=>{
  await select('standing');await page.locator('#comparison').focus();await page.keyboard.press('d');await page.keyboard.press('x');const s=c.cases.selectKeys=await state();return s.snapshot.x===0&&!s.snapshot.action&&!s.snapshot.held;
 });
 await check('phone-size menu is touch accessible and has no horizontal overflow',async()=>{
  await page.setViewportSize({width:390,height:844});await select('standing');await page.locator('#comparison').tap();await page.keyboard.press('Escape');await select('down-death');await page.locator('#replay').tap();await wait(()=>summonerLab.comparisonRun?.done);
  c.cases.mobile=await page.evaluate(()=>{const e=document.getElementById('comparison'),r=e.getBoundingClientRect();return {width:innerWidth,scrollWidth:document.documentElement.scrollWidth,selectHeight:r.height,hp:summonerLab.motion.target.hp,selection:e.value};});await page.screenshot({fullPage:true,path:path.join(dir,'s8-menu-mobile-internal.png')});const s=c.cases.mobile;
  await page.setViewportSize({width:960,height:540});return s.scrollWidth<=s.width&&s.selectHeight>=44&&s.hp===0&&s.selection==='down-death';
 });
 await check('no new page, console or network errors',async()=>!result.errors.length&&!result.consoleErrors.length&&!result.requestFailures.length);
 c.status=c.checks.every(x=>x.status==='PASS')?'passed-comparison-browser':'failed-comparison-browser';const tmp=path.join(dir,'comparison-results.pending.json');fs.writeFileSync(tmp,JSON.stringify(c,null,2)+'\n');fs.renameSync(tmp,path.join(dir,'comparison-results.json'));return c;
}
module.exports={runSummonerComparisonS8Acceptance};
