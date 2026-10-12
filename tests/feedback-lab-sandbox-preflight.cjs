// One-off GitHub-hosted browser preflight. Chromium sandbox is explicitly disabled.
const fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright');
const dir=path.resolve('ci-evidence');fs.mkdirSync(dir,{recursive:true});
(async()=>{
 const state={uid:process.getuid(),gid:process.getgid(),browserLaunch:'not-run',sandbox:'disabled',sandboxNotice:'Chromium沙箱已关闭',runnerEnvironment:process.env.RUNNER_ENVIRONMENT};
 let browser;
 try{
  if(state.uid===0)throw Error('Root execution is not allowed');
  if(process.env.GITHUB_ACTIONS!=='true'||state.runnerEnvironment!=='github-hosted')throw Error('Sandbox-disabled test is restricted to GitHub-hosted Actions runners');
  const executable=process.env.DNFKU_CHROME_EXECUTABLE;
  if(!executable)throw Error('Explicit installed Chromium path required');
  fs.accessSync(executable,fs.constants.R_OK|fs.constants.X_OK);state.executable=executable;
  for(const args of [['--version']]){
   const p=spawnSync(executable,args,{encoding:'utf8',timeout:30000});
   state.version={exitCode:p.status,stdout:p.stdout,stderr:p.stderr,error:p.error?.message};
   if(p.status!==0||!p.stdout.includes('151.0.7922.34'))throw Error('Installed Chromium version check failed');
  }
  const deps=spawnSync('ldd',[executable],{encoding:'utf8',timeout:30000});
  state.dependencies={exitCode:deps.status,stdout:deps.stdout,stderr:deps.stderr,error:deps.error?.message};
  if(deps.status!==0||deps.stdout.includes('not found'))throw Error('Missing linked browser dependency');
  state.browserLaunch='attempted';
  browser=await chromium.launch({executablePath:executable,headless:true,chromiumSandbox:false,timeout:30000});
  state.browserLaunch='passed';state.browserVersion=browser.version();
  const page=await browser.newPage();
  state.pageErrors=[];page.on('pageerror',e=>state.pageErrors.push(e.message));
  const response=await page.goto(process.env.DNFKU_PREVIEW_URL,{waitUntil:'load',timeout:30000});
  state.page={url:page.url(),status:response?.status(),title:await page.title()};
  await page.screenshot({path:path.join(dir,'preflight-v10.png')});
  if(!response?.ok()||!state.page.title.includes('V10'))throw Error('V10 HTTPS page load check failed');
  state.status='passed';

 }catch(e){state.status='failed';state.error=e.stack;process.exitCode=1;}
 finally{
  if(browser)try{await browser.close();}catch(e){state.closeError=e.stack;state.status='failed';process.exitCode=1;}
  fs.writeFileSync(path.join(dir,'sandbox.json'),JSON.stringify(state,null,2));console.log(JSON.stringify(state,null,2));
 }
})();

