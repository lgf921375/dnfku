# 原生普通用户入口核查与Actions最小方案（2026-10-12）

## 实际结论

起始main：9d22acadf3dd5fdcd4af71d10ba289d00d3d77bd。已读AGENTS.md、最新active-handoff、chromium-install-result及原feedback-lab-smoke.cjs。

| 项目 | 状态与边界 |
|---|---|
| 工具接口核查 | 通过（接口静态检查）：exec_command没有user/uid/gid参数 |
| 普通用户执行入口 | 失败/不可用：本会话未暴露受支持入口；不等于普通用户id已实际执行失败 |
| 当前身份 | 通过（实际检查）：id输出uid=0(root) gid=0(root) groups=0(root) |
| 安装文件仍存在 | 通过（当前文件检查）：Chrome/Shell均存在0755；未重新下载 |
| 普通用户读安装文件 | 未覆盖：没有普通用户命令执行 |
| 普通用户独立可写数据目录 | 未覆盖：未用root创建目录冒充普通用户写入验证 |
| Chromium安全启动/沙箱实际启用 | 未覆盖：本轮未启动浏览器 |
| V10真实自动测试 | 未覆盖：0断言；本轮无截图/录像 |
| Actions运行 | 未覆盖：只给方案，未创建启用workflow、未触发运行 |

## 接口证据

当前会话暴露的本地命令执行工具为exec_command，其完整声明见 [native-entry-tool-schema.json](evidence-runtime-entry-20261012/native-entry-tool-schema.json)。

文档参数仅有：
cmd、justification、login、max_output_tokens、prefix_rule、sandbox_permissions、shell、tty、workdir、yield_time_ms。

没有user/uid/gid或容器运行用户参数。shell只指定shell程序，login只控制shell登录模式，都不是用户身份入口。sandbox_permissions不是用户选择，不能用它请求提权来替代普通用户执行。

functions.exec仅用于编排已暴露工具，不提供另一套本地用户执行接口；浏览器UI工具面向独立cloud browser，不是当前安装目录的shell入口。本轮没有传入未声明参数、重试runuser、使用底层UID切换、创建用户、改变权限或安全策略。

范围限定：结论是“本会话已暴露的工具没有受支持普通用户入口”，不能扩展为平台内部绝对没有该能力。

## 当前文件复查

root身份只读确认：

- /tmp/dnfku-cft-151.0.7922.34-20261012/chrome/chrome-linux64/chrome：存在0755。
- /tmp/dnfku-cft-151.0.7922.34-20261012/shell/chrome-headless-shell-linux64/chrome-headless-shell：存在0755。

不能用root的存在/可读检查证明普通用户已成功读取，更不能证明其有可写profile。上轮完整大小、CRC、SHA256、--version证据不重复下载。本轮遵照“没有受支持入口直接停止当前启动尝试”。

## GitHub Actions运行原脚本的最小方案（建议，未执行）

采用一次手动workflow_dispatch，Linux虚拟机runner（例如ubuntu-24.04），不采用默认root容器，不改安全策略、不加浏览器禁用沙箱参数、不使用sudo。权限只需contents:read；验收仅访问现有V10 HTTPS，不构建/部署游戏或重启服务。

1. checkout固定源码提交并记录git rev-parse HEAD。先id，并断言UID非0；以实际值为准，不预先认定runner身份。普通用户创建自己的临时profile/证据目录，实际读写探测后才进入浏览器步骤。
2. 在runner自己的临时目录安装精确Playwright1.62.1 npm包，例如npm install --prefix "$RUNNER_TEMP/dnfku-pw" --no-audit --no-fund playwright@1.62.1；不修改项目package文件。查实际package/browsers.json并确认目标Chrome151.0.7922.34。若registry版本或manifest不符就停止报告，不自动换最新版。
3. 设置CODEX_PRIMARY_RUNTIME_NODE_MODULES为该目录的node_modules，使原脚本require路径有效；官方CLI执行install chromium（不带--with-deps），安装对应Chrome/Shell和录像所需FFmpeg。新runner与当前窗口不共享/tmp，它需要自己的安装；本轮当前窗口不重下。下载失败保留URL/响应/退出码，不盲目重试或使用第三方镜像。必要时另行按已核实Google准确URL进行完整大小/CRC校验后独立安装，但不是自动未经审核fallback。
4. 对所选二进制执行--version和ldd；缺依赖即停止，不sudo修复。在普通用户下用chromiumSandbox:true进行预启动检查，检查实际启动参数不含禁用沙箱选项。配置true本身不等于沙箱已证明启用；另保存Chrome sandbox状态页/可获取的进程沙箱诊断与错误，未能取得证据就标未覆盖，不强称通过。无法安全启动则失败并保存完整日志。
5. 仅在运行入口/安全启动满足后适配原tests/feedback-lab-smoke.cjs的launch路径与sandbox配置；其5个计数点不删除、不放宽、不改游戏状态或规则。源码最小待实施改动：

```js
browser = await chromium.launch({
  executablePath: process.env.DNFKU_CHROME_EXECUTABLE,
  headless: true,
  chromiumSandbox: true
});
```

DNFKU_CHROME_EXECUTABLE是runner真实安装路径，不能使用当前窗口/tmp路径。DNFKU_PREVIEW_URL固定为 https://lgf921375.github.io/dnfku/prototype/feedback-lab-v10.html 。

使用node tests/feedback-lab-smoke.cjs执行原脚本，不用npx playwright test来假装这是Playwright Test框架用例。保留原截图/recordVideo功能；失败路径若需保证录像落盘，只调整资源清理finally/context.close并记录变更，原断言保持。
6. shell启用pipefail后保留stdout/stderr及真实退出码，避免tee吞掉失败。upload-artifact在always()条件保存依赖/启动日志、退出码、脚本输出、results.json、PNG与原始WebM。安装/启动前失败导致没有截图录像时，在状态文件说明未取得，不伪造产物。用节点/步骤状态区分下载、运行入口、沙箱、页面和断言失败。

原脚本Blob：86eb7f17e97af6ff0d776338149aa8cf7be675c6。5个计数点为标题V10、手动伤害、演示保护起身、air/ground追击、无pageerror。以上改动是后续方案，本轮未改脚本或创建活动workflow，也未跑Actions，不标5/5通过。

官方参考：
- https://playwright.dev/docs/ci （支持Actions、安装浏览器、运行测试、保存产物；其--with-deps示例不按本轮权限约束采用）
- https://playwright.dev/docs/api/class-browsertype#browser-type-launch-option-chromium-sandbox （明确需配置sandbox）
- https://docs.github.com/en/actions/reference/runners/github-hosted-runners （托管runner环境说明，实际身份仍需id）

## 当前停止点

普通用户入口不可用，Chromium安全启动未覆盖，V10真实自动测试未覆盖。无需重新下载当前环境的两个包。下一步可按此方案准备手动Actions验收；尚没有Actions成功证据，不能宣称迁移后一定能保持沙箱并通过测试。未修改游戏战斗代码，未操作《皓石传奇三》。

