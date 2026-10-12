// Real Chromium preflight; fail closed before V10 if sandbox cannot be verified.
const fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright');
const dir=path.resolve('ci-evidence');fs.mkdirSync(dir,{recursive:true});
(async()=>{
 const state={uid:process.getuid(),gid:process.getgid(),browserLaunch:'not-run',sandbox:'not-verified'};
 let browser;
 try{
  if(state.uid===0)throw Error('Root execution is not allowed');
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
  browser=await chromium.launch({executablePath:executable,headless:true,chromiumSandbox:true,timeout:30000});
  state.browserLaunch='passed';state.browserVersion=browser.version();
  const cdp=await browser.newBrowserCDPSession();
  state.commandLine=(await cdp.send('Browser.getBrowserCommandLine')).arguments;
  if(state.commandLine.some(x=>/^--(?:no-sandbox|disable-setuid-sandbox|disable-seccomp-filter-sandbox|disable-namespace-sandbox)(?:=|$)/.test(x)))throw Error('Forbidden sandbox-disabling browser argument');
  const page=await browser.newPage();
  await page.goto('chrome://sandbox',{waitUntil:'load'});
  state.sandboxPage=await page.locator('body').innerText();
  await page.screenshot({path:path.join(dir,'sandbox.png')});
  state.seccompEnabled=/Seccomp-BPF sandbox\s+Yes/i.test(state.sandboxPage);
  state.namespaceOrSuidEnabled=/(?:PID namespaces|Namespace sandbox|SUID sandbox)\s+Yes/i.test(state.sandboxPage);
  if(!state.seccompEnabled||!state.namespaceOrSuidEnabled)throw Error('Chrome sandbox diagnostics did not confirm enabled layers');
  state.sandbox='passed';state.status='passed';
 }catch(e){state.status='failed';state.error=e.stack;process.exitCode=1;}
 finally{
  if(browser)try{await browser.close();}catch(e){state.closeError=e.stack;state.status='failed';process.exitCode=1;}
  fs.writeFileSync(path.join(dir,'sandbox.json'),JSON.stringify(state,null,2));console.log(JSON.stringify(state,null,2));
 }
})();

