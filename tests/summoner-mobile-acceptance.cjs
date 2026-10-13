// Desktop Chromium + 390x844/844x390 viewports and real synthesized touch input.
// This is NOT an Android device, Android browser build or human hand-feel test.
const fs=require('node:fs'),path=require('node:path');
async function runSummonerMobileAcceptance({page,dir,url,result}){
 const m=result.mobile={status:'running',checks:[],cases:{},scope:'Desktop Chromium mobile-size viewport + hasTouch + synthesized CDP touch; NOT Android hardware'};
 const observe=()=>page.evaluate(()=>({snapshot:summonerLab.motion.snapshot(),events:summonerLab.motion.events,pointerEvents:window.mobilePointers,samples:summonerLab.samples.slice(-180)}));
 const wait=f=>page.waitForFunction(f,null,{timeout:4000,polling:'raf'});
 const record=()=>fs.writeFileSync(path.join(dir,'mobile-results.json'),JSON.stringify(m,null,2)+'\n');
 const check=async(name,fn)=>{try{const ok=await fn();m.checks.push({name,status:ok?'PASS':'FAIL'});}catch(e){m.checks.push({name,status:'FAIL',error:e.stack});}record();};
 await page.setViewportSize({width:390,height:844});await page.goto(url,{waitUntil:'load'});await page.evaluate(()=>document.fonts.ready);
 await page.evaluate(()=>{window.mobilePointers=[];for(const type of ['pointerdown','pointerup','pointercancel'])document.addEventListener(type,e=>{window.mobilePointers.push({type,target:e.target.id,pointerType:e.pointerType,trusted:e.isTrusted});},true);});
 const tap=name=>page.getByRole('button',{name,exact:true}).tap();
 const reset=()=>tap('重来');
 await check('portrait390x844: no horizontal overflow and readable-sized DOM buttons',async()=>{
  m.cases.portraitLayout=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,buttons:[...document.querySelectorAll('nav button')].map(b=>{const r=b.getBoundingClientRect();return {text:b.textContent,width:r.width,height:r.height,font:parseFloat(getComputedStyle(b).fontSize)};})}));
  await page.screenshot({fullPage:true,path:path.join(dir,'mobile-portrait-internal.png')});const c=m.cases.portraitLayout;return c.scrollWidth<=c.width&&c.buttons.every(b=>b.height>=44&&b.font>=14);
 });
 await check('real touch tap: only first owner motion starts',async()=>{await reset();await tap('普通攻击 · X');await wait(()=>!summonerLab.motion.action&&summonerLab.motion.events.some(e=>e.type==='motion-end'));m.cases.tap=await observe();return m.cases.tap.events.filter(e=>e.type==='motion-start').length===1&&m.cases.tap.pointerEvents.some(e=>e.target==='attack'&&e.type==='pointerdown'&&e.pointerType==='touch'&&e.trusted);});
 const cdp=await page.context().newCDPSession(page);
 const touch=async type=>{if(type==='touchStart'){const b=page.getByRole('button',{name:'普通攻击 · X',exact:true});await b.scrollIntoViewIfNeeded();const r=await b.boundingBox();await cdp.send('Input.dispatchTouchEvent',{type,touchPoints:[{x:r.x+r.width/2,y:r.y+r.height/2,id:1}]});}else await cdp.send('Input.dispatchTouchEvent',{type,touchPoints:[]});};
 await check('real touch hold/release: three owner motions then settle',async()=>{await reset();try{await touch('touchStart');await wait(()=>summonerLab.motion.action?.stage===2);}finally{await touch('touchEnd');}await wait(()=>!summonerLab.motion.action);m.cases.held=await observe();return JSON.stringify(m.cases.held.events.filter(e=>e.type==='motion-start').map(e=>e.stage))==='[0,1,2]'&&!m.cases.held.snapshot.held;});
 await check('touch cancellation: no stuck held attack or continuing loop',async()=>{await reset();await touch('touchStart');await page.waitForTimeout(50);await touch('touchCancel');await wait(()=>!summonerLab.motion.action);m.cases.cancelled=await observe();return m.cases.cancelled.events.filter(e=>e.type==='motion-start').length===1&&!m.cases.cancelled.snapshot.held&&m.cases.cancelled.pointerEvents.some(e=>e.target==='attack'&&e.type==='pointercancel'&&e.pointerType==='touch');});
 await check('landscape844x390: full Canvas and primary attack button visible together',async()=>{
  await reset();await page.setViewportSize({width:844,height:390});await page.evaluate(()=>scrollTo(0,0));
  m.cases.landscapeLayout=await page.evaluate(()=>{const box=id=>{const r=document.getElementById(id).getBoundingClientRect();return {top:r.top,bottom:r.bottom,left:r.left,right:r.right,width:r.width,height:r.height};};return {width:innerWidth,height:innerHeight,scrollWidth:document.documentElement.scrollWidth,canvas:box('stage'),attack:box('attack')};});
  await page.screenshot({fullPage:true,path:path.join(dir,'mobile-landscape-internal.png')});const c=m.cases.landscapeLayout;
  return c.scrollWidth<=c.width&&c.canvas.top>=0&&c.canvas.bottom<=c.height&&c.attack.top>=0&&c.attack.bottom<=c.height;
 });
 await check('landscape: touch replay completes all three motions',async()=>{await tap('整套参考演示');await wait(()=>summonerLab.motion.events.some(e=>e.type==='reference-done'));m.cases.landscapeReplay=await observe();return m.cases.landscapeReplay.events.find(e=>e.type==='reference-done').time===1;});
 await cdp.detach();m.status=m.checks.every(c=>c.status==='PASS')?'passed-mobile-viewport':'failed-mobile-viewport';record();return m;
}
module.exports={runSummonerMobileAcceptance};
