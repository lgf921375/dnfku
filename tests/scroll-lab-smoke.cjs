/** Real browser UI checks. Needs Chromium. Synthetic inputs, not Android hardware. */
const {readFileSync}=require('node:fs');const path=require('node:path');const {createRequire}=require('node:module');
let pw;try{pw=require('playwright');}catch(e){if(!process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES)throw e;pw=createRequire(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'playwright/package.json'))('playwright');}
(async()=>{const options={headless:true};if(process.env.DNFKU_CHROMIUM)options.executablePath=process.env.DNFKU_CHROMIUM;const br=await pw.chromium.launch(options);
try{const page=await br.newPage({viewport:{width:960,height:540},hasTouch:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.setContent(readFileSync(path.join(__dirname,'../prototype/scroll-lab-v7.html'),'utf8'));await page.evaluate(()=>scrollLab.pause());let n=0;const check=(label,ok)=>{if(!ok)throw Error('FAIL '+label);console.log('PASS',++n,label);};
check('landscape controls visible',await page.locator('#stick').isVisible()&&await page.locator('#basic').isVisible());
const r=await page.locator('#stick').boundingBox();await page.mouse.move(r.x+r.width*.8,r.y+r.height*.5);await page.mouse.down();await page.evaluate(()=>scrollLab.advance(.2));
check('held joystick causes continuous movement',await page.evaluate(()=>scrollLab.game.fighter('A').body.enemyX>.3));await page.mouse.up();
check('joystick release clears input',await page.evaluate(()=>scrollLab.game.fighter('A').input.x===0));await page.locator('#reset').tap();await page.locator('[data-skill="launcher"]').tap();
check('touch starts launcher',await page.evaluate(()=>scrollLab.game.fighter('A').controller.actionName==='launcher'));await page.evaluate(()=>scrollLab.advance(.1));
check('valid hit deducts opponent HP',await page.evaluate(()=>scrollLab.game.fighter('B').hp===182));check('hit feedback generated',await page.evaluate(()=>scrollLab.game.effects.length===1));
await page.evaluate(()=>scrollLab.advance(1.1));check('opponent lands down',await page.evaluate(()=>scrollLab.game.fighter('B').body.state==='down'));await page.locator('#basic').tap();
check('basic touch becomes sweep against downed target',await page.evaluate(()=>scrollLab.game.fighter('A').controller.actionName==='groundSweep'));
await page.locator('#reset').tap();await page.locator('#guard').tap();check('guard releases after touch',await page.evaluate(()=>!scrollLab.game.fighter('A').guard));
await page.locator('#ai').tap();check('training AI switch works',await page.evaluate(()=>scrollLab.game.ai));await page.setViewportSize({width:390,height:844});
check('portrait controls remain visible',await page.locator('#stick').isVisible()&&await page.locator('#basic').isVisible());check('no browser page errors',errors.length===0);console.log(`SUMMARY ${n}/${n} PASS`);
if(process.env.DNFKU_SCREENSHOT)await page.screenshot({path:process.env.DNFKU_SCREENSHOT});}finally{await br.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
