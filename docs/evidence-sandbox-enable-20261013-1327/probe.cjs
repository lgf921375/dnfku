const fs=require('node:fs'),path=require('node:path');
const dir=__dirname;
const runtimeModules=process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES;
const pw=require(runtimeModules?path.join(runtimeModules,'playwright'):'playwright');
const corePackage=runtimeModules?path.join(runtimeModules,'playwright-core/package.json'):require.resolve('playwright-core/package.json');
const manifest=JSON.parse(fs.readFileSync(path.join(path.dirname(corePackage),'browsers.json')));
const expected=manifest.browsers.find(x=>x.name==='chromium-headless-shell');
const executable='/workspace/scratch/27a600746412/local-browser-check/chrome-headless-shell-linux64/chrome-headless-shell';
const result={startedUTC:new Date().toISOString(),uid:process.getuid(),gid:process.getgid(),node:process.version,playwrightVersion:require(runtimeModules?path.join(runtimeModules,'playwright/package.json'):'playwright/package.json').version,expectedBrowser:expected,executable,requestedOptions:{headless:true,chromiumSandbox:true,timeout:15000},launchAttempted:false,browserLaunch:'NOT RUN',actualSandbox:'NOT COVERED',gameAssertions:0,httpServerStarted:false,externalPageLoaded:false,hostPolicyChanged:false,identityChanged:false};
let browser;
(async()=>{try{
  fs.accessSync(executable,fs.constants.X_OK);
  result.launchAttempted=true;
  browser=await pw.chromium.launch({executablePath:executable,headless:true,chromiumSandbox:true,timeout:15000});
  result.browserLaunch='PASS';result.browserVersion=browser.version();
  const page=await browser.newPage();await page.goto('chrome://sandbox');
  result.sandboxPageText=await page.locator('body').innerText();
  result.actualSandbox='Requested true; inspect recorded diagnostic before concluding sandbox enabled';
  const cdp=await browser.newBrowserCDPSession();
  result.browserCommandLine=await cdp.send('Browser.getBrowserCommandLine');await cdp.detach();
}catch(e){result.browserLaunch=result.launchAttempted?'FAIL':'NOT RUN';result.error=String(e.stack||e);console.error(result.error);process.exitCode=1;}
finally{if(browser)try{await browser.close();result.cleanup='closed';}catch(e){result.cleanupError=String(e);process.exitCode=1;}else result.cleanup='No Browser object obtained; launch framework cleanup applies';result.finishedUTC=new Date().toISOString();fs.writeFileSync(path.join(dir,'results.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({browserLaunch:result.browserLaunch,actualSandbox:result.actualSandbox,gameAssertions:result.gameAssertions}));}})();
