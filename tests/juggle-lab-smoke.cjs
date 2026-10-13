// CI-only wrapper: keep GitHub-hosted/non-root restriction and explicit sandbox-disabled scope.
const fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright');
const {runJuggleAcceptance}=require('./juggle-lab-acceptance.cjs');
const dir=path.resolve(process.env.DNFKU_EVIDENCE_DIR??'ci-evidence/v11');fs.mkdirSync(dir,{recursive:true});
(async()=>{let browser,context,page;const result={status:'failed-or-blocked',sandboxNotice:'Chromium沙箱已关闭',errors:[],consoleErrors:[],requestFailures:[],checks:[],cases:{},androidHandFeel:'NOT COVERED',visualSimilarity:'requires human video review',fps:'RAF samples recorded; not Android/stable-FPS acceptance'};
try{
 if(process.getuid?.()===0||process.env.GITHUB_ACTIONS!=='true'||process.env.RUNNER_ENVIRONMENT!=='github-hosted')throw Error('Restricted to non-root GitHub-hosted Actions');
 browser=await chromium.launch({executablePath:process.env.DNFKU_CHROME_EXECUTABLE,channel:'chromium',headless:true,chromiumSandbox:false,timeout:15000});
 result.browserVersion=browser.version();
 context=await browser.newContext({viewport:{width:960,height:540},hasTouch:true,recordVideo:{dir,size:{width:960,height:540}}});
 page=await context.newPage();page.on('pageerror',e=>result.errors.push(e.message));page.on('console',m=>{if(m.type()==='error')result.consoleErrors.push(m.text());});page.on('requestfailed',r=>result.requestFailures.push({url:r.url().split('?')[0],error:r.failure()?.errorText}));
 await runJuggleAcceptance({page,dir,url:process.env.DNFKU_PREVIEW_URL,exactHtml:path.join(__dirname,'../prototype/juggle-lab-v11.html'),transport:'HTTPS',result,onProgress:()=>fs.writeFileSync(path.join(dir,'results.json'),JSON.stringify(result,null,2))});
 result.status='passed-browser';
}catch(e){result.error=e.stack;console.error(e.stack);process.exitCode=1;if(page)try{await page.mouse.up();await page.screenshot({path:path.join(dir,'failure.png')});}catch(error){console.error(error.stack);}}
finally{if(context)try{await context.close();}catch(e){result.cleanupError=e.stack;process.exitCode=1;}if(browser)try{await browser.close();}catch(e){result.cleanupError=e.stack;process.exitCode=1;}
 result.exitCode=process.exitCode??0;if(result.exitCode&&result.status==='passed-browser')result.status='failed-cleanup';fs.writeFileSync(path.join(dir,'results.json'),JSON.stringify(result,null,2));console.log(JSON.stringify({status:result.status,checks:result.checks,exitCode:result.exitCode}));}
})();
