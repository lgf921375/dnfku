# Google官方Chrome for Testing源检查与当前窗口安装方案（2026-10-12）

## 结论：官方包存在，当前窗口可以读到真实ZIP；本轮未安装

**通过（官方目录核查）**：GoogleChromeLabs/chrome-for-testing 的known-good-versions-with-downloads实际JSON包含151.0.7922.34，提供linux64完整chrome和chrome-headless-shell。没有猜下载地址或使用第三方镜像。

**通过（当前窗口限量HTTP检查）**：storage.googleapis.com两个官方地址HEAD200，Content-Type application/zip；Range206、各下载4096字节，开头PK0304；尾部各128字节均找到PK0506中央目录结束记录。完整包总长度193,282,658字节；Shell总长度120,231,126字节。

**未覆盖**：整包下载、全部CRC校验、解压安装、系统库检查、沙箱内启动、真实GUI显示。本轮按“先返回结果和方案”执行，不下载安装、不改代理/网络/游戏代码、不使用sudo或关闭sandbox，不迁移GitHub Actions。

起始dnfku main=`113b768c4bdacbbe1dfca03b913f52e68ced2c78`；已读最新AGENTS/README/active-handoff。前一轮cdn.playwright.dev返回195字节HTML的结论仍成立；本轮检查的是Google官方目录给出的另一个官方下载主机。

## 1. 官方目录与两个准确地址

官方目录固定提交：`df9c8fc89b8a9c9eacf1b5a747b3f0bf366fe21d`。
文件：data/known-good-versions-with-downloads.json。
Blob：`4b679724a58ed7035ec6484373075b71ddffc832`。
目录timestamp：2026-10-11T20:21:20.500Z。

实际取到的条目version=151.0.7922.34，Google条目revision=1654411。这里Google revision与Playwright缓存revision1234属于不同编号体系，不以它们数值不同认定版本不匹配。

仅保存该版本的原创参数摘录，不复制整个6MB目录：[官方条目与URL](evidence-google-cft-20261012/official-catalog-entry.json)。

- 完整Chrome：
  https://storage.googleapis.com/chrome-for-testing-public/151.0.7922.34/linux64/chrome-linux64.zip
- Headless Shell：
  https://storage.googleapis.com/chrome-for-testing-public/151.0.7922.34/linux64/chrome-headless-shell-linux64.zip

来源：[Google官方目录（固定提交）](https://github.com/GoogleChromeLabs/chrome-for-testing/blob/df9c8fc89b8a9c9eacf1b5a747b3f0bf366fe21d/data/known-good-versions-with-downloads.json)。
官方README解释known-good-versions-with-downloads列出各资产下载URL及linux64支持。每版本JSON网页在web工具未能读取，已用官方仓库真实目录取证，而不是据网页失败猜测版本不存在。

## 2. 当前窗口实际HTTP证据

沿用现有代理和TLS验证，不unset代理、不加-k、不修改配置。两个HEAD和两个Range独立运行，curl均退出0、重定向0。Range请求0–4095并限制最大响应8192字节，没有下载完整包。

| 项目 | 完整Chrome | Headless Shell |
|---|---:|---:|
| HEAD最终状态 | 200 | 200 |
| Content-Type | application/zip | application/zip |
| 完整资源Content-Length | 193282658 | 120231126 |
| Range最终状态 | 206 | 206 |
| Content-Range | bytes 0-4095/193282658 | bytes 0-4095/120231126 |
| Range实际收到 | 4096字节 | 4096字节 |
| 前4字节 | 504b0304 | 504b0304 |
| 额外尾部请求 | 128字节 | 128字节 |
| ZIP EOCD记录 | 找到504b0506 | 找到504b0506 |
| EOCD条目数 | 308 | 287 |

Chrome EOCD中央目录offset193249650、长度32986，末尾22字节，加起来与总长度193282658一致。Shell offset120196315、中央目录34789、末尾22，与120231126一致。说明官方资源的首尾ZIP结构能够读取；**不能代替整个包内容CRC/完整传输校验**。

server为UploadServer，和前次CDN的HTML响应明显不同。HEAD的输出文件保存的是头部，实体下载仍为0，不把其文件大小当安装包大小。

[HTTP完整结果](evidence-google-cft-20261012/response-results.json)、[Chrome ZIP尾部](evidence-google-cft-20261012/chromium-zip-tail.json)、[Shell ZIP尾部](evidence-google-cft-20261012/headless-shell-zip-tail.json)、[限量探测脚本](evidence-google-cft-20261012/request-probes.py)。

**边界**：已证明当前代理路线能限量获取官方ZIP字节，没有证据保证约313.5MB的完整下载也会一次成功。若之后完整传输失败，再依据实际字节数/错误定位，不提前宣布安装完成。

## 3. 与Playwright1.62.1的版本、路径和模式匹配

本地实读package.json为1.62.1，browsers.json要求两者browserVersion151.0.7922.34、缓存revision1234。Google官方目录的版本和平台与它一致。

| 运行选择 | 当前默认预期路径/结果 |
|---|---|
| 完整Chrome | /root/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome |
| 默认headless且未指定channel/executablePath | /root/.cache/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-linux64/chrome-headless-shell |
| channel:'chromium'且headless:true | 选择完整Chrome的新无头模式 |
| headless:false | 选择完整Chrome，需图形显示环境 |
| 显式executablePath | 可选独立解压目录的完整Chrome或Shell；仍要启动实测验证兼容性 |

coreBundle.js getExecutableName在未指定channel时按options.headless选择shell/完整Chrome；指定chromium别名选择完整Chrome。**所以只安装完整包，不改变原脚本headless:true的默认选择，原脚本仍可能寻找缺失Shell**。

官方Playwright文档说明完整Chromium和独立Shell的模式区别，并可用chromium channel选择新无头模式：
https://playwright.dev/docs/browsers#chromium-new-headless-mode

[本地版本/路径/模式日志](evidence-google-cft-20261012/playwright-compatibility.json)。这里只确认静态匹配；没有运行151浏览器，不能称全部自动化接口兼容已实测。

## 4. 沙箱与图形界面：安装后的另两个前提

本地实测UID/EUID均0，DISPLAY和WAYLAND_DISPLAY均未设置；当前进程NoNewPrivs=1、Seccomp=2。这些值不能单独说明宿主允许哪些Chrome沙箱操作。

- 下载/解压文件本身不要求关闭sandbox。
- 完整Chrome安装后仍可用新headless模式运行，不必为了取得完整浏览器先安装桌面环境。
- 真正headed窗口需要平台提供正常图形显示会话；当前未核实该条件。
- Chrome沙箱需要适当的普通用户及宿主支持；Chrome/Puppeteer官方资料指出普通用户和沙箱运行的要求。当前root进程直接启动并保持Chrome sandbox存在已知限制；本轮没有尝试运行或切换用户。
- 本地Playwright源码默认在chromiumSandbox !== true时加入--no-sandbox；官方API文档也说明chromiumSandbox默认false。**后续必须显式chromiumSandbox:true**，不能因没有手写--no-sandbox就误认为沙箱已开启。
- 当前feedback-lab-smoke.cjs的launch只设置headless:true。今后验收阶段需在获准调整测试启动配置时显式开启sandbox并选正确浏览器路径；本轮不修改测试脚本或游戏代码。

官方资料：
https://playwright.dev/docs/api/class-browsertype#browser-type-launch-option-chromium-sandbox
https://pptr.dev/troubleshooting#setting-up-chrome-linux-sandbox

[运行环境只读日志](evidence-google-cft-20261012/run-environment.json)。

## 5. 当前工作窗口的安全安装方案（未执行）

### A. 先按官方准确URL下载并校验

1. 在用户可写的独立安装目录暂存两个ZIP，URL只采用上述固定版本官方条目；保持当前代理与TLS验证，不使用sudo。
2. 完整下载后核对实际大小分别为193282658、120231126；检查ZIP首尾及全部条目CRC，例如Python zipfile.testzip或unzip -t。
3. 记录本地SHA256作取证指纹。仅记录本地哈希不等于已有独立官方签名验证，不夸大校验等级。
4. 校验通过后解压，分别得到chrome-linux64/chrome与chrome-headless-shell-linux64/chrome-headless-shell。解压前检查条目路径，防止超出目标目录。
5. 保留独立目录，通过executablePath引用，不伪造Playwright安装标记。原cache目录与本方案独立目录映射明确后，再决定是否接入默认发现机制。

### B. 再核查运行环境与模式

1. 使用平台支持的普通用户执行入口，并维持chromiumSandbox:true；不为启动成功增加特权、关闭sandbox或修改宿主策略。本轮不自行创建用户/改系统权限。
2. 查浏览器系统库依赖；若缺少，由平台按既有权限提供。当前不运行install --with-deps或sudo安装系统库。
3. 优先用完整Chrome的新无头模式验证HTTPS，不依赖当前缺失的GUI显示环境。两个包均安装后也可按计划分别验收Shell。
4. 如要可见GUI，先确认平台提供的图形会话；不把“完整浏览器文件存在”当“GUI已可运行”。

完整Chrome的启动配置形态仅作为方案：

```js
await chromium.launch({
  executablePath: verifiedFullChromePath,
  headless: true,
  chromiumSandbox: true
});
```

使用默认缓存时，可用channel:'chromium'选择完整Chrome。使用Shell时采用已验证Shell路径或其默认headless选择。任何方式均须开启sandbox并在适当普通用户环境运行；尚未执行这些启动。

### C. 安装后才进行真实验收

先--version/依赖/安全启动检查，再用现有V10 HTTPS地址执行页面操作并保存截图、录像和错误。不改浮空、扫地或强制起身规则来适配环境。

## 最终状态与下一步

- **通过**：官方指定版本linux64条目、官方两个URL、当前窗口HEAD/首4096/末128字节访问、ZIP首尾结构、静态版本与模式匹配。
- **未执行**：整包下载、解压安装、系统库修复、浏览器启动、GUI配置或DNF代码修改。
- **未覆盖**：完整包CRC/传输可靠性、root工作窗口如何由平台提供非root执行入口、Chrome sandbox实际可用性与图形显示条件。
- **无需现在转GitHub Actions**：Google官方源已可访问，可优先在当前环境推进受控下载与独立目录安装；运行仍需满足普通用户/沙箱条件。
- 仅当官方渠道后续完整下载也有实际失败证据或当前平台无法提供所需安全运行条件时，再报告具体阻塞并评估其他已授权测试环境，不提前迁移。
