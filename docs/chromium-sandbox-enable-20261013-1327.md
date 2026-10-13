# Chromium沙箱开启探测（2026-10-13 13:28 上海）

**失败（实际启动）**：用户给出 `chromiumSandbox: true` 后，绕开项目包装的授权自动关闭选项，使用独立最小探测真正请求开启。Chromium进程PID18已创建，但以SIGSEGV终止；Playwright launch抛错，Node进程退出1。没有取得可用Browser对象，不能说沙箱已开启。

**通过（证据核查）**：真实launch参数中没有 `--no-sandbox` 或 `--disable-setuid-sandbox`；探测前后可见Chrome进程均0。只启动一次，不自动回退关闭沙箱。未启动HTTP或加载外部页面，游戏断言0；产品、测试包装、授权记录、workflow未改。

**未覆盖/根因未确认**：当前可执行文件单独运行 `--version` 也以SIGSEGV（subprocess返回-11）终止，stdout/stderr均空。本轮没有出现可直接指认root/No usable sandbox的浏览器错误文本，不能把崩溃定性为沙箱拒绝。UID/GID0、NoNewPrivs1/Seccomp2仅为当前环境事实，不证明浏览器沙箱启用。

## 当前文件与历史差异

- 读取源码/约定时local与remote工作分支均881da77dacad97ef6e8ec7e7b6fa687916dd926e；工作树干净。已读AGENTS、README、active-handoff和S2报告。
- Node v24.19.0、Playwright1.62.1；manifest期望Shell151.0.7922.34/rev1234。当前实际浏览器版本未取得，不能称本次匹配已验证。
- 可执行文件：`/workspace/scratch/27a600746412/local-browser-check/chrome-headless-shell-linux64/chrome-headless-shell`。
- 上轮成功S2/S1测试environment.json记录SHA256：e11fc9ce65c96313476f7ee9844b6fb6a9220fb048693cfe9eee00acf4170a9f。
- 本轮实读SHA256：72ed668d9052411c6095e98b680795d0d3d8c82bed79e7c1c83797dedd83896d；143065088字节、mode0700、ELF文件头。与历史内容校验值不同，原因/修改来源未确认；不猜测是谁改动，也不将历史通过结果当作当前启动通过。

实际请求包括 `executablePath` 指向上述文件、`headless:true`、`chromiumSandbox:true`、`timeout:15000`。没有切换UID、调整权限或宿主安全策略、安装依赖、重下浏览器、重启/部署、触发Actions，未碰其它项目。

## 原始证据与下一步

[探测脚本](evidence-sandbox-enable-20261013-1327/probe.cjs)、[启动结果](evidence-sandbox-enable-20261013-1327/results.json)、[独立版本与文件核查](evidence-sandbox-enable-20261013-1327/diagnostics.json)、[原始错误](evidence-sandbox-enable-20261013-1327/stderr.log)、[退出码](evidence-sandbox-enable-20261013-1327/exit-code.txt)。脚本只做最小启动，成功路径里的sandbox页面与CDP诊断本轮未执行。

下一步先恢复/验证可信且可运行的浏览器二进制，再在非root且支持沙箱的环境验证开启。仅添加true不足以保证成功，本轮明确停在当前可执行文件崩溃处。最新远端提交以实际分支回读为准。
