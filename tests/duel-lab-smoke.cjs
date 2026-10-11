/** Real Chromium interaction regression. Not Android. Requires Playwright + a browser. */
const {readFileSync,existsSync}=require('node:fs');
const path=require('node:path');
const {createRequire}=require('node:module');
let playwright;
try {playwright=require('playwright');} catch(e) {
  if(!process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES)throw e;
  playwright=createRequire(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'playwright','package.json'))('playwright');
}
(async()=>{
  const options={headless:true};
  if(process.env.DNFKU_CHROMIUM)options.executablePath=process.env.DNFKU_CHROMIUM;
  else if(existsSync('/usr/bin/chromium'))options.executablePath='/usr/bin/chromium';
  const browser=await playwright.chromium.launch(options);
  try {
    const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.setContent(readFileSync(path.join(__dirname,'../prototype/duel-lab-v6.html'),'utf8'));
    await page.evaluate(()=>combatLab.pause());
    let count=0;
    const check=(name,ok)=>{if(!ok)throw Error('FAIL '+name);console.log('PASS',++count,name);};
    const snap=()=>page.evaluate(()=>combatLab.snapshot());
    const reset=()=>page.locator('#reset').click();
    const advance=t=>page.evaluate(t=>combatLab.advance(t),t);
    const press=(id,skill)=>page.locator(`[data-id="${id}"][data-skill="${skill}"]`).dispatchEvent('pointerdown');
    check('two fighter controls rendered',await page.locator('[data-skill]').count()===8);
    check('initial HP rendered',(await page.locator('#hp-B').innerText())==='HP 200 / 200');
    await press('A','launcher');check('pointer input starts startup',(await snap()).fighters[0].action.phase==='startup');
    await advance(0.09);check('startup does not deduct HP',(await snap()).fighters[1].hp===200);
    await advance(0.01);check('active frame deducts HP',(await snap()).fighters[1].hp===182);
    check('active hitbox visible in state',(await snap()).fighters[0].boxes.length===1);
    check('HP display reflects hit',(await page.locator('#hp-B').innerText())==='HP 182 / 200');
    await advance(1);check('launcher lands opponent',(await snap()).fighters[1].body.state==='down');
    for(let i=0;i<3;i++){await press('A','groundSweep');await advance(0.34);}
    check('sweeps trigger protection',(await snap()).fighters[1].body.state==='invulnerable');
    check('sweep sequence deducts exact HP',(await snap()).fighters[1].hp===158);
    await reset();await page.locator('[data-guard="B"]').click();await press('A','launcher');await advance(0.15);
    check('guard UI blocks damage',(await snap()).fighters[1].hp===200&&(await page.locator('#log').innerText()).includes('格挡成功'));
    await reset();await press('B','launcher');await advance(0.1);check('B pointer attack damages A',(await snap()).fighters[0].hp===182);
    await reset();await page.locator('#bilateral').uncheck();check('single-side hitstop toggle changes both controllers',await page.evaluate(()=>combatLab.duel.fighters.every(f=>!f.controller.cfg.bilateralHitstop)));
    await page.locator('[data-id="A"][data-move="-0.2"]').dispatchEvent('pointerdown');check('movement pointer changes position',(await snap()).fighters[0].body.enemyX===-0.2);
    await reset();await page.locator('#step').click();check('paused single step advances time',(await snap()).time===1/120);
    check('mobile layout has no horizontal overflow',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    await reset();await page.locator('#demo').click();await page.locator('#pause').click();
    await page.waitForFunction(()=>combatLab.duel.events.some(e=>e.protectedStand),{},{timeout:6000});
    check('realtime auto sequence reaches protection',await page.evaluate(()=>combatLab.duel.events.filter(e=>e.type==='damage').length===4));
    check('no browser JS errors',errors.length===0);
    console.log(`SUMMARY ${count}/${count} PASS`);
    if(process.env.DNFKU_SCREENSHOT)await page.screenshot({path:process.env.DNFKU_SCREENSHOT,fullPage:true});
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
