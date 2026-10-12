# V10一次性无Chromium沙箱验收适配（2026-10-12，待触发）

## 已实施与真实边界

起始main：c40eb13b0606034eda2a25754ec6055d43530c0b。用户明确授权本次GitHub托管临时运行器采用chromiumSandbox:false；先读AGENTS/README/交接及上次实际run报告。

**配置说明：Chromium沙箱已关闭。** 这是本轮待运行的启动配置，不是已经成功执行的证明，也不是安全验收通过。没有在当前root工作窗口、正式服务器或个人电脑启动无沙箱浏览器。

| 项目 | 本轮状态 |
|---|---|
| 最小配置修改、语法/YAML检查 | 通过（静态） |
| 原5条验收断言 | 完整保留，逐行相同；实测未覆盖 |
| 新手动运行 | 尚未触发，0次 |
| Chromium实际启动 | 未覆盖 |
| V10实际截图/WebM/Artifact | 尚未取得 |

## 最小源码差异

1. tests/feedback-lab-sandbox-preflight.cjs保留原文件名/日志名以减少workflow改动，功能改为真实Chrome启动、V10 HTTPS响应和标题检查、preflight-v10.png；移除chrome://sandbox启用判定。launch改chromiumSandbox:false，记录CDP实际commandLine及noSandboxArgument、明确sandboxNotice。修复browserLaunch初始化不足：launch前先记attempted，成功后passed。
2. tests/feedback-lab-smoke.cjs仅调整sandbox:false、GitHub托管运行器范围保护及结果sandboxNotice。原5条assertions++完整行逐行相同，无改HP/body状态、阈值、超时或断言。
3. workflow仍仅workflow_dispatch/ubuntu-24.04/contents:read/checkout persist-credentials:false，步骤名称改为浏览器启动和HTTPS加载检查，summary明确“Chromium沙箱已关闭”；保持原退出码文件、错误日志、finally关闭context和WebM录制/always上传。
4. 两脚本要求GITHUB_ACTIONS=true、RUNNER_ENVIRONMENT=github-hosted且UID非0；不支持在个人或生产机器按本配置执行，不新增仓库Secrets、不sudo、不修改宿主策略、不部署游戏。
5. 仅原型页面HTTPS访问。没有修改任何prototype战斗源码或《皓石传奇三》。

检查：node --check两个脚本均退出0；YAML/manual-only、runner、permissions、checkout检查通过。静态记录：[unsandbox-static.json](evidence-actions-v10-20261012/unsandbox-static.json)。本轮未实际启动当前工作窗口浏览器以验证脚本。

## 手动触发的工具阻塞

已授权的GitHub网页浏览器无法恢复其原生凭据状态；工具实际报：

```text
Browser observation is unavailable because native credential state cannot be safely resumed.
Start a new browser runtime to continue.
```

按提示重置一次cua_repl工具会话，再尝试已授权的工作流页面，仍同样被阻止；读取官方故障指引也被同一工具边界拦截。停止UI恢复，不查cookie、不提取GitHub凭据、不绕过工具保护。

这与GitHub托管runner上的Chrome sandbox是否可启动属于不同层。不能把工具观察失败说成Google下载失败、GitHub未登录或此次无沙箱浏览器启动失败。GitHub连接器仍可提交/读文件及查询run、Artifacts，但本会话没有首次workflow_dispatch接口，不用rerun冒充新的授权手动运行。

因此先保存完成的具体工作流和必要测试配置，**本轮新运行计数0**。后续需要用户从已登录的GitHub界面打开Actions→dnfku V10 browser acceptance→Run workflow→main，只提交一次。该操作创建仓库全局run，连接器可读取，不要求共享用户网页登录cookie。在取得新run_id以前，所有启动/5断言/录像结果保持未覆盖。

若取得run，核对event=workflow_dispatch、main和本次提交，再读取日志/Artifacts。失败停止，保留原始新错误并区分是否仍来自sandbox；不得自动反复触发。配置false本身不能承诺5/5或录像存在，不能称100%成功。

## 后续结果记录要求

报告必须明确Chromium沙箱已关闭，功能通过也不能冒充安全验收。按原5项记录实际通过数量与首次失败；检查Artifact实际下载、CRC、results.json、PNG及WebM，不把网页截图或旧Skia录像冒充本次浏览器录像。帧率、安卓手感及音效仅按后续实际覆盖记录。

