// Shared V11 controls and evidence. Wrappers own environment permissions and launch mode.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {validProtection,protectionUnchanged,protectionHistoryUnchanged}=require('./protection-evidence.cjs');
async function runJuggleAcceptance({page,dir,url,exactHtml,transport,result,onProgress=()=>{},onPageLoaded=async()=>{}}) {
 const {errors,checks,cases}=result;
 const check=(name,ok)=>{checks.push({name,status:ok?'PASS':'FAIL'});onProgress(name);if(!ok)throw Error(name);};
 page.setDefaultTimeout(12000);page.setDefaultNavigationTimeout(15000);
 const response=await page.goto(url,{waitUntil:'load',timeout:15000});
 const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
 check(`V11 ${transport} 200, title and exact tested HTML`,new URL(page.url()).protocol===(transport==='HTTPS'?'https:':'http:')&&response.status()===200&&(await page.title()).includes('V11')&&sha(await response.body())===sha(fs.readFileSync(exactHtml)));
 await onPageLoaded(page);
 // Passive frame sampling. This writes only test evidence, never fighter/HP/timer/controller fields.
 await page.evaluate(()=>{window.v11Samples=[];let last=0,previousGame=null;
   function observe(now){const g=window.rhythmLab?.game;if(g!==previousGame){window.v11Samples=[];previousGame=g;last=0;}if(g&&window.v11Samples.length<6000)window.v11Samples.push({wall:now,rafDelta:last?now-last:null,time:g.time,a:g.fighter('A').body.snapshot(),b:g.fighter('B').body.snapshot(),hp:g.fighter('B').hp,damage:g.events.filter(e=>e.type==='damage').length});last=now;requestAnimationFrame(observe);}requestAnimationFrame(observe);
 });
 const observe=()=>page.evaluate(()=>({events:rhythmLab.game.events,bodyEvents:rhythmLab.game.fighter('B').body.events,body:rhythmLab.game.fighter('B').body.snapshot(),hp:rhythmLab.game.fighter('B').hp,settings:rhythmLab.game.settings,samples:window.v11Samples}));
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
 await reset();await hold();await wait(()=>rhythmLab.game.fighter('B').body.state==='invulnerable');
 cases.protectionEntry=await observe();
 const stand=cases.protectionEntry.bodyEvents.filter(e=>e.type==='forced-stand').at(-1);
 check('continuous basic reaches a valid original air, ground or total protection threshold',validProtection(stand,cases.protectionEntry.settings));
 const cutoff=cases.protectionEntry.body.time+Math.min(.25,cases.protectionEntry.body.invulnerabilityRemaining/2);
 await page.waitForFunction(time=>rhythmLab.game.fighter('B').body.time>=time,cutoff,{timeout:12000,polling:'raf'});
 await page.mouse.up();cases.continuous=await observe();
 check('continued public inputs cause no damage or HP change while protected',protectionUnchanged(cases.protectionEntry,cases.continuous));
 await page.screenshot({path:path.join(dir,'air-or-ground-protection.png')});
 await wait(()=>!rhythmLab.game.fighter('A').controller.action&&!rhythmLab.game.fighter('A').controller.buffer&&rhythmLab.game.fighter('B').body.state==='idle');
 cases.afterProtection=await observe();
 check('release and queued input: immunity history intact, protection expires',protectionHistoryUnchanged(cases.protectionEntry,cases.afterProtection));
 await page.getByRole('button',{name:'攻击',exact:true}).click();
 await page.waitForFunction(hp=>rhythmLab.game.fighter('B').hp<hp,cases.afterProtection.hp,{timeout:12000,polling:'raf'});
 cases.resumed=await observe();
 check('after immunity ends a new real button attack can damage again',cases.resumed.hp<cases.afterProtection.hp&&cases.resumed.events.slice(cases.afterProtection.events.length).some(e=>e.type==='damage'));
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

 return result;
}
module.exports={runJuggleAcceptance};
