# V10浏览器启动原因诊断与HTTPS真实验收（2026-10-12）

## 结论先行

**通过（真实云Chrome操作）**：直接打开 https://lgf921375.github.io/dnfku/prototype/feedback-lab-v10.html 成功，显示完整角色画面、HP与控件。手动攻击600→588，手动上挑600→582并浮空；点击连招演示运行三段普攻→上挑→浮空普通追击→落地同键追击→保护起身，最终HP474。真实画布录像下载成功。

**失败（本地脚本启动）**：现有 feedback-lab-smoke.cjs 用HTTPS地址重试仍在chromium.launch退出1，原因是指定Chromium二进制不存在。0项页面断言，不能称该脚本通过。

**限制**：完整云Chrome原始WebM 139.802515秒、150个解码帧、960×540，平均有效帧约1.073fps；不是30fps流畅度通过。保留原始时间，不加速冒充实时；Android真人操作/多指/音效听感/主观打击感仍未覆盖。

本轮起始GitHub main：`7902c5808be99447f49506b165642f2897d03dfd`。已读取最新AGENTS、README、active-handoff、上轮browser.txt/results.json及现有脚本。只读诊断和页面验收，游戏源码/规则未改，无依赖安装、隔离修改、提权、服务部署或重启，未访问《皓石传奇三》。

## 三个故障必须分开

| 问题 | 发起路径与阶段 | 直接证据 | 结论边界 |
|---|---|---|---|
| bwrap挂载proc失败 | 上轮执行sites-preview start /workspace/scratch/ad0ba23151c8/dnfku-preview；本地HTTP预览隔离准备阶段 | 历史工具输出：Sites preview exited before becoming healthy: / bwrap: Can't mount proc on /newroot/proc: Operation not permitted；退出1。当前启动器ELF符号存在sites_preview::build_bwrap_arguments，并含bwrap、预览进程日志等字符串 | 是Sites本地预览启动器路径中的挂载失败。没有证据认定云Chrome设置错误，也没有定位到具体宿主seccomp/AppArmor/capability/namespace策略 |
| Chromium缺失 | Node脚本chromium.launch，早于page.goto | 本轮真实命令退出1，缺/root/.cache/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-linux64/chrome-headless-shell | 依赖文件缺失，不是GitHub Pages加载失败，不是bwrap同一个故障 |
| file协议被拒 | 上轮Cloud Browser导航file:///home/oai/share/... | 工具明确只允许http/https；拒绝发生于URL策略检查 | 不说明浏览器无法启动。没有再次尝试file或通过绕路读取本地文件；本轮直接使用现有公开HTTPS部署 |

### bwrap调用来源：实际静态证据

- `file /usr/local/bin/sites-preview`：ELF 64-bit x86-64，not stripped，不是浏览器exe，也不是可直接sed读取的shell脚本。
- `nm -C /usr/local/bin/sites-preview`：`0000000000012c60 t sites_preview::build_bwrap_arguments`；还存在PreviewProcess和预览子进程日志收集符号。
- 启动器字符串含bwrap、failed to inherit site root fd into bwrap、/usr/local/lib/sites-preview/server.cjs等。
- 因而调用来源可以落实为 **sites-preview / sites-previewd 的本地预览隔离启动路径**。它与本轮使用的已运行远端Cloud Chrome不同。
- 当前`sites-preview status`输出stopped、退出0。本轮未重启预览服务以做strace复现，也没有完整的历史bwrap argv/系统调用跟踪；不能补造动态调用栈。
- 启动器SHA256：3f3b90aaa562ee4c09c47320cb13e8ed72db78b481a46d1c7fb9d5eaf1f0972e。证据：[符号](evidence-browser-20261012/launcher-call-chain.txt)、[ELF检查](evidence-browser-20261012/file-evidence.txt)、[字符串](evidence-browser-20261012/launcher-strings.json)、[状态](evidence-browser-20261012/sites-preview-evidence.txt)。

**准确原因表述**：bwrap报告在预览隔离层挂载proc时“Operation not permitted”。可以指出失败操作和所在层，但本轮不能确定由哪条宿主策略拒绝；不把“缺少root权限”“云浏览器开关配置错误”当已查明事实。

## 现有脚本真实重试

执行（未修改脚本）：

```bash
DNFKU_PREVIEW_URL='https://lgf921375.github.io/dnfku/prototype/feedback-lab-v10.html' node /workspace/scratch/ad0ba23151c8/dnfku/tests/feedback-lab-smoke.cjs
```

通过Python subprocess原样传入上述环境变量，分别保存stdout/stderr和真实子进程退出码；不是用后续cat的退出码替代Node退出码。

- Node退出1；assertions=0。
- 失败位置tests/feedback-lab-smoke.cjs:7:25，即chromium.launch。
- 核心错误：`browserType.launch: Executable doesn't exist at /root/.cache/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-linux64/chrome-headless-shell`。
- 因启动前失败，HTTPS地址、页面控件、录像上下文均尚未由该脚本执行。
- 完整输出：[stderr](evidence-browser-20261012/smoke-stderr.txt)、[stdout](evidence-browser-20261012/smoke-stdout.txt)、[命令及exit_code](evidence-browser-20261012/smoke-command.json)。
- 本轮未安装浏览器，也未向chromium.launch加入关闭sandbox的参数。

## 另一已授权环境：Cloud Chrome真实验收

使用cua_repl及其文档支持的Cloud Chrome（cdp），用户提供的HTTPS地址。没有访问本地file，没有用Node/Skia代替页面运行，没有注入HP或角色状态。

| 验收项 | 实际操作与观察 | 本轮状态 |
|---|---|---|
| 浏览器与HTTPS加载 | createBrowserTab(cdp,指定HTTPS)；标题“青石 · 受击动作 V10”，角色、血条、控件可见 | 通过（云Chrome真实加载） |
| 手动普通攻击 | 点击攻击按钮，对手600→588；动作标签出现斜斩 | 通过（单次手动点击） |
| 三段普攻 | 点击连招演示；对手600→552、UI显示3连击；录像含三段动作 | 通过（浏览器内公开输入演示）；不是人工逐次精确连按 |
| 手动上挑 | 重来→上挑；600→582，截图见角色离地与上挑收招 | 通过（手动按钮） |
| 浮空普通追击 | 完整演示的正常输入运行；录像有离地受击、12伤害及后续落地 | 通过（浏览器演示流程）；人工空追时机独立精测未覆盖 |
| 落地同键追击 | UI“落地同键追击”，截图HP508、倒地角色；录像有12/22地面命中 | 通过（浏览器演示流程） |
| 保护起身 | 最终UI“保护起身”、HP474；录像抽帧见从倒地站起及蓝色保护轮廓 | 通过（浏览器演示流程）；保护期间手动再次攻击的独立测试未覆盖 |
| 录制与下载 | 点击录制战斗→演示→停止并下载，下载非空WebM，ffprobe可解码 | 通过（真实Chrome画布录制） |
| 原feedback-lab-smoke.cjs | 启动缺Chromium退出1，0断言 | 失败/环境阻塞，未用Cloud UI结果冒充脚本通过 |
| 流畅度/音效/Android | 视频平均有效帧约1.07fps，未验证音效/真人多指/手机手感 | 不标通过；帧率原因未定位，其他未覆盖 |

### 真实截图与录像来源

录制机制是页面已有的HTMLCanvasElement.captureStream(30)+MediaRecorder(video/webm)，直接点击录制控件和下载控件取得文件。原始WebM仅包含Canvas画面，无HUD/鼠标轨迹或音轨；HUD与阶段信息在完整浏览器截图中保留。

- [完整原始浏览器WebM](evidence-browser-20261012/full-browser-demo.webm)
- [保持原始时间的MP4兼容版](evidence-browser-20261012/full-browser-demo.mp4)
- [手动上挑原始WebM](evidence-browser-20261012/manual-launcher.webm)
- [HTTPS加载截图](evidence-browser-20261012/https-loaded.jpg)、[手动上挑截图](evidence-browser-20261012/manual-launcher.jpg)、[落地追击截图](evidence-browser-20261012/down-chase.jpg)、[演示终点截图](evidence-browser-20261012/full-demo-result.jpg)
- [录像抽帧：浮空](evidence-browser-20261012/review-09.jpg)、[地面重击](evidence-browser-20261012/review-11.jpg)、[保护站起](evidence-browser-20261012/review-12.jpg)；这些从真实WebM提取，不由游戏模型另画。
- [WebM元数据](evidence-browser-20261012/full-video-metadata.json)。原始完整视频139.802515秒，150解码帧，960×540、VP8、1,198,436字节；平均150/139.802515≈1.073fps。
- 原始完整WebM SHA256：aa879d4e5b3998a73319a9d83512ad5d142e075bff35e056153d8fc3b1bc853f。

**帧率解释边界**：captureStream(30)是请求值，不证明实际30fps。模板frame函数把单帧逻辑dt上限限制为0.05秒；低更新率下逻辑进度可能明显变慢，这是源码推演。没有RAF时间序列或云环境调度遥测，不能确定低帧率由云绘制节流、页面负载还是其他因素造成。本轮不改dt以“加速通过”。

### 原始诊断中的其他错误

- 捕获14条error均来源chrome-extension的content-script，内容为Error sending browser metadata to extension；完整保留[console日志](evidence-browser-20261012/cloud-console.json)。已读日志没有游戏HTTPS来源的error，但不宣称控制台完全无错或与脚本pageerror监测等价。
- Cloud read-only evaluate不能读取window.rhythmLab，诊断读状态尝试产生TypeError。未以此认定游戏出错；之后只用实际DOM、截图和录像取证。
- 等待保护标签的一次locator.waitFor超时；当时页面仍在落地追击，后续实际到达保护起身。该中间超时保留为验收过程限制，不能当作保护逻辑失败。
- 一次带durationMs的按钮调用最终只证实单次伤害；未认定按住自动连击已经独立验收。

## 下一步最小修复方案

1. **当前画面验收不需修游戏或提高权限**：继续用已成功的GitHub Pages HTTPS+已运行Cloud Chrome，避开不必要的本地预览启动路径。
2. **若必须运行原脚本**：在已有匹配Playwright Chromium的QA环境运行上述同一命令；若准备浏览器依赖，只按官方正常安装流程补对应revision，不关闭sandbox，不提权。本轮未安装。
3. **若需要本地预览**：交平台维护者排查sites-previewd/bwrap的proc挂载兼容性，需要实际受限操作/策略日志；现有证据不足以指定宿主策略，不建议盲改系统权限。
4. **手感验收仍待完成**：先量测浏览器RAF/绘制与录制帧时间并取得足够流畅的浏览器或Android录像，再评判打击感。功能流程通过不代表DNF手游品质。
