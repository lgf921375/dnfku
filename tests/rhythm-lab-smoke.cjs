/** Browser behavior checks. Missing Chromium is a failure to run, not a page PASS. */
const {readFileSync,mkdirSync}=require('node:fs'),path=require('node:path'),{createRequire}=require('node:module');
let pw;try{pw=require('playwright');}catch(e){pw=createRequire(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'playwright/package.json'))('playwright');}
(async()=>{
  const dir=path.join(__dirname,'../docs/evidence-v9/browser');mkdirSync(dir,{recursive:true});
  const browser=await pw.chromium.launch({headless:true,...(process.env.DNFKU_CHROMIUM?{executablePath:process.env.DNFKU_CHROMIUM}:{})});
  const context=await browser.newContext({viewport:{width:960,height:540},hasTouch:true,recordVideo:{dir}}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));let count=0;
  const check=(label,ok)=>{if(!ok)throw Error('FAIL '+label);console.log('PASS',++count,label);};
  try{
    await page.setContent(readFileSync(path.join(__dirname,'../prototype/rhythm-lab-v9.html'),'utf8'));await page.evaluate(()=>rhythmLab.pause());
    check('unified basic control',await page.locator('[data-skill="airTap"],[data-skill="groundSweep"]').count()===0);
    await page.locator('#basic').tap();check('input starts windup without instant HP loss',await page.evaluate(()=>rhythmLab.game.fighter('A').controller.phase==='startup'&&rhythmLab.game.fighter('B').hp===600));
    await page.evaluate(()=>rhythmLab.advance(.22));check('actual active weapon box causes damage',await page.evaluate(()=>rhythmLab.game.fighter('B').hp<600));
    await page.locator('#tune').tap();check('parameter panel opens',await page.locator('#panel').isVisible());
    await page.locator('#gravity').fill('30');check('gravity changes both bodies',await page.evaluate(()=>rhythmLab.game.fighters.every(f=>f.body.cfg.gravity===30)));
    await page.locator('#gravity').fill('22');await page.locator('#boxes').check();check('debug control checks',await page.locator('#boxes').isChecked());
    await page.locator('#demo').tap();await page.evaluate(()=>{for(let i=0;i<1000&&!rhythmLab.demo.done;i++)rhythmLab.step(1/120);});
    check('real-input demo ends at protection',await page.evaluate(()=>rhythmLab.demo.phase==='保护起身'));
    check('full demo includes actual landing',await page.evaluate(()=>rhythmLab.game.fighter('B').body.events.some(e=>e.type==='landed')));
    await page.screenshot({path:path.join(dir,'landscape.png')});
    await page.setViewportSize({width:390,height:844});check('portrait attack button remains visible',await page.locator('#basic').isVisible());await page.screenshot({path:path.join(dir,'portrait.png')});
    check('no browser exceptions',errors.length===0);console.log('SUMMARY',count,'PASS, 0 FAIL');
  }finally{await context.close();await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
