// Browser acceptance: real page controls. No HP/body-state injection.
const {createRequire}=require('node:module');const path=require('node:path');const fs=require('node:fs');
const req=createRequire(__filename),{chromium}=req(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright');
const dir=path.resolve(process.env.DNFKU_EVIDENCE_DIR??path.join(__dirname,'../docs/evidence-v10/browser'));fs.mkdirSync(dir,{recursive:true});
(async()=>{let browser,context,page,assertions=0;const errors=[];
try{
 if(process.getuid?.()===0)throw Error('Root browser execution is not allowed');
 if(process.env.GITHUB_ACTIONS!=='true'||process.env.RUNNER_ENVIRONMENT!=='github-hosted')throw Error('Sandbox-disabled test is restricted to GitHub-hosted Actions runners');
 browser=await chromium.launch({executablePath:process.env.DNFKU_CHROME_EXECUTABLE,channel:'chromium',headless:true,chromiumSandbox:false});
 context=await browser.newContext({viewport:{width:960,height:540},hasTouch:true,recordVideo:{dir,size:{width:960,height:540}}});
 page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.DNFKU_PREVIEW_URL??'http://terminal.local:4173/',{waitUntil:'load'});
 if(!(await page.title()).includes('V10'))throw Error('Preview is not V10');assertions++;
 await page.getByRole('button',{name:'重来',exact:true}).click();
 await page.keyboard.down('d');await page.waitForTimeout(150);await page.keyboard.up('d');
 await page.getByRole('button',{name:'攻击',exact:true}).click();
 await page.waitForFunction(()=>window.rhythmLab.game.events.some(e=>e.type==='damage'),null,{timeout:3000});assertions++;
 await page.screenshot({path:path.join(dir,'manual-hit.png')});
 await page.getByRole('button',{name:'重来',exact:true}).click();
 await page.getByRole('button',{name:'连招演示',exact:true}).click();
 await page.waitForFunction(()=>window.rhythmLab.demo?.done,null,{timeout:15000});
 const result=await page.evaluate(()=>({phase:rhythmLab.demo.phase,events:rhythmLab.game.events,bodyEvents:rhythmLab.game.fighter('B').body.events}));
 if(result.phase!=='保护起身')throw Error('Demo did not reach protection');assertions++;
 if(!result.events.some(e=>e.reaction==='air')||!result.events.some(e=>e.reaction==='ground'))throw Error('Air/down chase absent');assertions++;
 if(errors.length)throw Error(errors.join('\n'));assertions++;
 await page.screenshot({path:path.join(dir,'protection.png')});
 fs.writeFileSync(path.join(dir,'results.json'),JSON.stringify({status:'passed-browser',assertions,sandbox:'disabled',sandboxNotice:'Chromium沙箱已关闭',result},null,2));
 console.log(JSON.stringify({status:'passed-browser',assertions}));
}catch(e){
 const failure={status:'failed-or-blocked',assertions,sandbox:'disabled',sandboxNotice:'Chromium沙箱已关闭',error:e.stack,errors};
 fs.writeFileSync(path.join(dir,'results.json'),JSON.stringify(failure,null,2));
 if(page)try{await page.screenshot({path:path.join(dir,'failure.png')});}catch(captureError){console.error(captureError.stack);}
 console.error(JSON.stringify(failure));process.exitCode=1;
}
finally{
 if(context)try{await context.close();}catch(e){console.error(e.stack);process.exitCode=1;}
 if(browser)try{await browser.close();}catch(e){console.error(e.stack);process.exitCode=1;}
}
})();
