# V10运行#5命令行查询错误的最小修复（2026-10-12）

## 结论与实际证据

本轮先读AGENTS/README/最新交接和真实源码；起始main=b15248baf4889e83b39f04881bfad89385ecdfe8。
实际运行：[38195756623（#5）](https://github.com/lgf921375/dnfku/actions/runs/38195756623)，job114637897734，测试提交同上述SHA，workflow_dispatch，conclusion=failure。

已读取完整job日志，并下载 [Artifact11723367047](https://github.com/lgf921375/dnfku/actions/runs/38195756623/artifacts/11723367047)：
- ZIP8308字节，14个日志/状态文件，全CRC检查通过。
- SHA256=3ed3eb2b6e306d79dbbc81c54a5fb5ef90d1d988417eb2412b92f26c0fe84904，与平台摘要相同。
- 普通用户uid/gid1001、runnerEnvironment=github-hosted。
- Chrome版本151.0.7922.34，browserLaunch=passed；PW/manifest/browser安装与版本/ldd退出0。
- **Chromium沙箱已关闭**（授权chromiumSandbox:false），不称安全验收通过。
- 预检查退出1，错误：
```text
cdpSession.send: Protocol error (Browser.getBrowserCommandLine):
Command line not returned because --enable-automation not set.
```
- 原smoke步骤skipped、smoke=null，5项断言0执行；screenshots=[]、videos=[]。HTTPS加载/标题/截图尚未执行，不能以浏览器已启动代替页面验收。

这次直接失败是非必要CDP诊断查询的条件不足，发生在成功启动之后，**与上次No usable sandbox启动失败不同**。我引入的查询使预检查阻止了实际页面验收，本轮移除。

## 仅删除三行测试诊断

tests/feedback-lab-sandbox-preflight.cjs移除：
- 创建仅用于此查询的newBrowserCDPSession。
- Browser.getBrowserCommandLine。
- 依赖commandLine的noSandboxArgument判断。

没有新增--enable-automation，也未改浏览器或游戏来迎合诊断。保留：真实launch/版本/ldd、chromiumSandbox:false、明确沙箱关闭提示、非root与GitHub-hosted范围、V10 HTTPS响应、标题包含V10、preflight-v10.png、退出码/错误/close/finally记录。

tests/feedback-lab-smoke.cjs及workflow文件Blob保持不变；原5项断言无删减，无降低阈值或扩大超时。没有修改prototype游戏源码，不操作《皓石传奇三》。

## 本轮检查与边界

通过（静态）：node --check预检查和smoke均退出0；确认CDP查询及依赖字段不再存在，必要版本/启动/网页/标题/截图及runner限制仍存在。
未覆盖（修复后实测）：未运行浏览器、未触发/重跑Actions，未称新5/5或新录像已取得。

按用户要求只提交修复；用户手动触发一次后，再读新run的日志/5断言/results/PNG/WebM。帧率和安卓手感仍需独立验收。

证据：
- [原始完整Artifact](evidence-actions-v10-20261012/run-38195756623/artifact.zip)
- [原summary](evidence-actions-v10-20261012/run-38195756623/artifact/summary.json)
- [完整已掩码job日志](evidence-actions-v10-20261012/run-38195756623/job-114637897734.log)

