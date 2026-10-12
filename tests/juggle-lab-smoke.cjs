// V11 candidate acceptance. Original V10 five assertions run separately and stay unchanged.
// All combat actions below use page controls; evaluate only observes combat state.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright');
const dir=path.resolve(process.env.DNFKU_EVIDENCE_DIR??'ci-evidence/v11');fs.mkdirSync(dir,{recursive:true});
(async()=>{let browser,context,page;const errors=[],checks=[],cases={};
const check=(name,ok)=>{checks.push({name,status:ok?'PASS':'FAIL'});if(!ok)throw Error(name);};
try{
 if(process.getuid?.()===0||process.env.GITHUB_ACTIONS!=='true'||process.env.RUNNER_ENVIRONMENT!=='github-hosted')throw Error('Restricted to non-root GitHub-hosted Actions');
 browser=await chromium.launch({executablePath:process.env.DNFKU_CHROME_EXECUTABLE,channel:'chromium',headless:true,chromiumSandbox:false});
 context=await browser.newContext({viewport:{width:960,height:540},hasTouch:true,recordVideo:{dir,size:{width:960,height:540}}});
 page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 const response=await page.goto(process.env.DNFKU_PREVIEW_URL,{waitUntil:'load'});
 const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
 check('V11 HTTPS 200, title and exact tested HTML',response.status()===200&&(await page.title()).includes('V11')&&sha(await response.body())===sha(fs.readFileSync(path.join(__dirname,'../prototype/juggle-lab-v11.html'))));
 // Passive frame sampling. This writes only test evidence, never fighter/HP/timer/controller fields.
 await page.evaluate(()=>{window.v11Samples=[];let last=0;
   function observe(now){const g=window.rhythmLab?.game;if(g&&window.v11Samples.length<6000)window.v11Samples.push({wall:now,rafDelta:last?now-last:null,time:g.time,a:g.fighter('A').body.snapshot(),b:g.fighter('B').body.snapshot(),damage:g.events.filter(e=>e.type==='damage').length});last=now;requestAnimationFrame(observe);}requestAnimationFrame(observe);
 });
 const observe=()=>page.evaluate(()=>({events:rhythmLab.game.events,bodyEvents:rhythmLab.game.fighter('B').body.events,body:rhythmLab.game.fighter('B').body.snapshot(),hp:rhythmLab.game.fighter('B').hp,samples:window.v11Samples}));
 const reset=()=>page.getByRole('button',{name:'重来',exact:true}).click();
 const wait=fn=>page.waitForFunction(fn,null,{timeout:12000,polling:'raf'});
 const hold=async()=>{const box=await page.getByRole('button',{name:'攻击',exact:true}).boundingBox();await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();};
 await reset();await hold();
 await wait(()=>rhythmLab.game.events.some(e=>e.cut===2&&e.before?.state==='idle'&&e.after?.state==='airborne'));
 await page.screenshot({path:path.join(dir,'third-lift.png')});
 await wait(()=>rhythmLab.game.events.some(e=>e.before?.state==='airborne'&&e.before.vy<0&&e.after?.vy>0));await page.mouse.up();
 await page.screenshot({path:path.join(dir,'air-follow.png')});cases.manual=await observe();
 check('real held basic: standing third lifts, same-key falling contact reverses velocity',cases.manual.events.some(e=>e.cut===2&&e.reaction==='launch')&&cases.manual.events.some(e=>e.before?.state==='airborne'&&e.before.vy<0&&e.after.vy>0&&e.before.y===e.after.y&&e.contact.point));
 // Pointer release stops new input; an already buffered public input is allowed to finish.
 await wait(()=>!rhythmLab.game.fighter('A').controller.action&&!rhythmLab.game.fighter('A').controller.buffer);cases.settled=await observe();
 await wait(()=>rhythmLab.game.fighter('B').body.state==='down');const landed=await observe();
 check('release: natural gravity landing after queued input settles',landed.events.filter(e=>e.type==='damage').length===cases.settled.events.filter(e=>e.type==='damage').length&&landed.bodyEvents.some(e=>e.type==='landed'));
 await page.screenshot({path:path.join(dir,'natural-land.png')});cases.natural=landed;
 await reset();await hold();await wait(()=>rhythmLab.game.fighter('B').body.state==='invulnerable');const protectedHp=(await observe()).hp;
 await page.waitForTimeout(250);await page.mouse.up();cases.continuous=await observe();
 check('continuous basic reaches original protection; protected HP unchanged',cases.continuous.hp===protectedHp&&cases.continuous.bodyEvents.some(e=>e.type==='forced-stand'&&(e.airHits===4||e.totalHits===7)));
 await page.screenshot({path:path.join(dir,'air-protection.png')});
 await reset();await page.keyboard.down('a');await page.waitForTimeout(700);await page.keyboard.up('a');await page.keyboard.down('d');await page.waitForTimeout(50);await page.keyboard.up('d');
 await page.getByRole('button',{name:'攻击',exact:true}).click();await page.waitForTimeout(500);cases.distance=await observe();
 check('distance miss causes no damage or float',cases.distance.events.every(e=>e.type!=='damage')&&cases.distance.body.state==='idle');
 await reset();await page.keyboard.down('w');await page.waitForTimeout(700);await page.keyboard.up('w');await page.getByRole('button',{name:'攻击',exact:true}).click();await page.waitForTimeout(500);cases.lane=await observe();
 check('lane miss causes no damage or float',cases.lane.events.every(e=>e.type!=='damage')&&cases.lane.body.state==='idle');
 // A declared low-gravity stress case creates a target above all basic blade contact heights.
 await page.getByRole('button',{name:'调节',exact:true}).click();await page.locator('#gravity').fill('12');await reset();
 await page.getByRole('button',{name:'上挑',exact:true}).click();await wait(()=>!rhythmLab.game.fighter('A').controller.action&&rhythmLab.game.fighter('B').body.y>3);
 await page.getByRole('button',{name:'攻击',exact:true}).click();await page.waitForTimeout(400);cases.height=await observe();
 check('unreachable height stress case: no basic hit',cases.height.events.filter(e=>e.type==='damage').length===1&&cases.height.body.y>3);
 await page.screenshot({path:path.join(dir,'height-miss-gravity12.png')});
 await page.locator('#gravity').fill('22');await page.getByRole('button',{name:'调节',exact:true}).click();await reset();
 await page.getByRole('button',{name:'连招演示',exact:true}).click();await wait(()=>rhythmLab.demo?.done);cases.demo=await observe();
 const air=cases.demo.events.filter(e=>e.reaction==='air'),ground=cases.demo.events.filter(e=>e.before?.state==='down');
 check('full demo: launch, two air follows, natural drop, three ground hits and ground-limit',air.length>=2&&ground.length===3&&cases.demo.bodyEvents.some(e=>e.type==='forced-stand'&&e.reason==='ground-limit'));
 await page.screenshot({path:path.join(dir,'ground-protection.png')});await wait(()=>rhythmLab.game.fighter('B').body.state==='idle');cases.recovered=await observe();
 check('protection expires into idle',cases.recovered.bodyEvents.some(e=>e.type==='protection-ended'));
 check('no browser JavaScript errors',errors.length===0);
 fs.writeFileSync(path.join(dir,'results.json'),JSON.stringify({status:'passed-browser',browserVersion:browser.version(),sandboxNotice:'Chromium沙箱已关闭',checks,errors,cases,androidHandFeel:'NOT COVERED',visualSimilarity:'requires human video review',fps:'RAF samples recorded; not Android/stable-FPS acceptance'},null,2));
 console.log(JSON.stringify({status:'passed-browser',checks}));
}catch(e){fs.writeFileSync(path.join(dir,'results.json'),JSON.stringify({status:'failed-or-blocked',sandboxNotice:'Chromium沙箱已关闭',error:e.stack,checks,errors,cases},null,2));console.error(e.stack);process.exitCode=1;if(page)try{await page.mouse.up();await page.screenshot({path:path.join(dir,'failure.png')});}catch(error){console.error(error.stack);}}
finally{if(context)try{await context.close();}catch(e){console.error(e.stack);process.exitCode=1;}if(browser)try{await browser.close();}catch(e){console.error(e.stack);process.exitCode=1;}}
})();
