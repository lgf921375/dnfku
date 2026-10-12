# V10手动Actions验收实现（2026-10-12，尚未触发）

起始main：d4253857190404b099efa9363c0f596dda78418d。按用户授权实施，先读AGENTS/README/交接及chromium-native-entry-actions-plan。

## 已提交内容与静态检查

- .github/workflows/v10-browser-acceptance.yml：仅workflow_dispatch，ubuntu-24.04，无container，contents:read，15分钟任务上限。
- 固定官方actions/checkout、setup-node、upload-artifact的实际v6/v6/v5提交SHA，避免运行期间标签变更。
- 普通用户id/UID/GID、groups、目录真实读写、只读宿主安全信息；UID0即退出，不切换UID或提权。
- 在runner临时目录安装精确Playwright1.62.1，核对manifest两种Chrome版本151.0.7922.34，再由官方CLI install chromium安装匹配浏览器和录像依赖。无sudo/with-deps，依赖缺失即停，不依赖本窗口/tmp。
- tests/feedback-lab-sandbox-preflight.cjs：显式完整Chrome可执行路径+headless+chromiumSandbox:true，--version/ldd、实际启动参数、chrome://sandbox截图与诊断文本。要求Seccomp-BPF和namespace/SUID至少一个层被Chrome页面报告Yes；证据不满足即失败，阻止V10测试。不会用设置true本身冒充实际启用。
- tests/feedback-lab-smoke.cjs：仅启动参数、证据路径、失败记录与finally关闭context确保WebM落盘；5条原assertions++所在完整代码行逐行一致，未放宽或删除原验收。
- 固定HTTPS：https://lgf921375.github.io/dnfku/prototype/feedback-lab-v10.html 。
- 各阶段stdout/stderr与实际退出码单独保存；always()生成summary.json并upload-artifact，包含真实PNG/WebM、sandbox、结果、错误。无录像时明确空列表；工作流上传范围是本次ci-evidence，不混入旧模型/云浏览器证据。

node --check两脚本退出0；YAML解析、manual-only、权限、runner、always上传静态检查通过。[完整检查记录](evidence-actions-v10-20261012/static-checks.json)。没有运行当前root浏览器，没有改游戏文件/攻击规则/《皓石传奇三》。

## 手动执行阻塞与覆盖边界

本会话GitHub连接器有Git数据写入和已有run/job的查询、rerun工具，但**没有首次workflow_dispatch接口**；exec工具环境command -v gh未发现gh。没有调用不存在的工具、借rerun冒充首次运行或查找/提取凭据。

开发者工具使用要求：支持服务的插件不足时，浏览器fallback需要用户批准。因此先把实际最小工作流和改动保存可审查，再请求允许使用GitHub网页手动触发一次。当前尚未使用浏览器fallback、尚未触发run，不能编造run_id、启动结果或Artifacts。

| 项目 | 状态 |
|---|---|
| 实现/静态检查 | 通过（静态） |
| GitHub托管runner身份 | 未覆盖 |
| Chromium实际启动 | 未覆盖 |
| 沙箱实际启用 | 未覆盖 |
| 原5项断言 | 未覆盖，0执行 |
| 本轮Actions真实截图/WebM | 未取得 |
| 30/60fps稳定性与安卓手感 | 未覆盖 |

后续手动触发入口：GitHub仓库Actions → dnfku V10 browser acceptance → Run workflow → main；执行一次后按run_id读取步骤日志和Artifacts。工作流结果必须核对preflight、5断言、WebM文件后更新本报告/交接，安全启动失败保留失败，不关闭sandbox强行重跑。

即使未来5项通过，视频帧率测量、长时间稳定性、手机多指触控/音效和安卓真实手感仍不自动通过。当前没有实际视频，不能报帧率值。

## 2026-10-12 网页触发接续：GitHub校验错误已定位，登录尚未完成

用户已明确授权GitHub网页触发一次；本轮重新核对仓库lgf921375/dnfku、main及起始HEAD4a0669cd，未触发任何workflow_dispatch（次数0），未重跑其他工作流。

**纠错**：上轮YAML本地解析通过不等于GitHub表达式校验通过。实际发现 [run38191658416](https://github.com/lgf921375/dnfku/actions/runs/38191658416)，event=push、conclusion=failure，jobs=0、Artifacts=0，是提交时的工作流校验错误，不是Ubuntu浏览器作业执行：

```text
(Line: 16, Col: 33): Unrecognized named-value: 'runner'. Located at position 1 within expression: runner.temp
```

原因是作业级env不支持runner上下文。最小修复仅移除该处runner.temp，在首个环境检查步骤内export PLAYWRIGHT_BROWSERS_PATH="$RUNNER_TEMP/dnfku-browsers"，写入GITHUB_ENV供后续步骤使用。未新增push触发器，仍仅workflow_dispatch；不改sandbox启动/5断言/游戏代码。

**真实网页登录阻塞**：Cloud Chrome未登录。安全browserAuth首次GitHub密码方式被站点明确拒绝：该账号不支持password sign-in。用户通过安全表单选择Google后，Google返回密码有误。此为具体凭据错误，不推断为自动化拦截。没有在聊天、日志或仓库保存/输出密码、验证码、cookie、OAuth会话URL；没有重复提交密码，后续按安全浏览器手动交接完成登录。

截至本段写入，workflow_dispatch=0，Chromium启动/实际沙箱/原5断言均未覆盖，0执行，无本轮V10截图/WebM，Artifacts未生成。旧校验run的Artifacts列表真实读取为0，不称存在可下载证据。

用户接管正确登录后，仍需核对main、工作流有效和Run workflow→main，只点击一次；记录run_id后读取日志、退出码与产物，安全启动失败即停。本次修复不自动触发验收、不rerun；30/60fps与安卓手感继续未覆盖。

