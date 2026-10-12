# Chromium正式安装与安全启动阻塞（2026-10-12）

## 实际结论

起始 GitHub main：261b47ca58c3c8609c415462b9e4e5ceb326c23e。已先读 AGENTS.md、README.md、docs/active-handoff.md、docs/google-cft-install-plan-20261012.md。本轮获授权正式下载和独立目录安装，不修改游戏规则，不操作《皓石传奇三》。

| 项目 | 实际状态 |
|---|---|
| 完整 Chrome 安装 | 通过：完整下载、大小、全部CRC、安全解压、二进制存在 |
| Headless Shell 安装 | 通过：完整下载、大小、全部CRC、安全解压、二进制存在 |
| 两者 --version | 通过：151.0.7922.34，退出码0 |
| 主二进制链接库检查 | 通过（ldd范围）：两者退出0，无not found；不等于运行期动态加载全部覆盖 |
| 普通用户执行入口 | 失败：runuser对已有oai/vscode均退出1，cannot set groups |
| 真实浏览器启动 | 阻塞于前置入口，未执行浏览器launch；不能报浏览器自身退出码 |
| Chromium沙箱 | 未覆盖：没有浏览器运行，未关闭沙箱 |
| V10 HTTPS/按钮/JS异常/smoke | 未覆盖：0断言，脚本未执行，无脚本退出码 |
| 本轮真实截图/录像 | 无 |

## 安装证据

官方下载始终使用前轮从Google官方目录取得的两个准确URL，没有镜像、代理配置变更、TLS绕过、sudo或系统依赖安装。

| 包 | 官方URL | HTTP/类型 | 实际大小 | ZIP条目CRC |
|---|---|---|---:|---|
| Chrome | https://storage.googleapis.com/chrome-for-testing-public/151.0.7922.34/linux64/chrome-linux64.zip | 200/application/zip，curl退出0 | 193282658 | 全部308条目通过 |
| Shell | https://storage.googleapis.com/chrome-for-testing-public/151.0.7922.34/linux64/chrome-headless-shell-linux64.zip | 200/application/zip，curl退出0 | 120231126 | 全部287条目通过 |

Chrome SHA256：`ae8736ac28bc69278551500f219fc749575648263c43ec5990749eff43b9fcf8`  
Shell SHA256：`3cfc2bd00d1bafcf8a68dc74c9c92bb7150ddc8d26ade948a776316e1cec4f14`

SHA256是本地实测指纹，没有声称独立官方签名认证。下载均无重定向，stderr为空；实际完整传输时间Chrome约12.51秒，Shell约10.91秒，zipfile.testzip未发现坏条目。完整命令/退出码/大小见 [installation-results.json](evidence-chromium-install-20261012/installation-results.json)。

安装根目录：`/tmp/dnfku-cft-151.0.7922.34-20261012`，保留两个ZIP和解压内容，占用约950MiB。属于当前窗口临时环境，环境回收后不保证留存；日志保存GitHub，浏览器包不上传仓库。

实际可执行文件：

- `/tmp/dnfku-cft-151.0.7922.34-20261012/chrome/chrome-linux64/chrome`
- `/tmp/dnfku-cft-151.0.7922.34-20261012/shell/chrome-headless-shell-linux64/chrome-headless-shell`

两者模式0755；解压前检查绝对路径、父目录穿越、反斜杠、symlink和特殊条目类型，校验成功后才解压。只为本轮独立目录文件恢复普通可执行位，未赋予setuid/setgid，不改宿主权限。不覆盖系统浏览器、不写Playwright默认缓存、不伪造安装标记、不改项目源码。

## 依赖与版本实际执行

两个主二进制分别执行ldd和--version，均退出0，stderr为空，ldd没有not found。版本输出：

```text
Google Chrome for Testing 151.0.7922.34
```

这是文件/版本与直接链接库成功，不代表 renderer、GPU、字体、运行时动态模块、沙箱进程已经运行。
完整stdout见 [dependencies-and-version.json](evidence-chromium-install-20261012/dependencies-and-version.json)。

## 普通用户入口的真实错误

只读用户表发现既有oai(uid1001)及vscode(uid1000)，不创建账号。当前进程UID/EUID0，CapEff=0000000000000000、NoNewPrivs=1、Seccomp=2。沿用既有runuser尝试普通用户入口；本轮未请求提权、未变更系统用户/组或安全策略。

```sh
runuser -u oai -- id
runuser -u vscode -- id
```

两条命令分别退出1，stdout为空，完整stderr相同：

```text
runuser: cannot set groups: Operation not permitted
```

**直接事实**：当前入口在设置用户组阶段失败，尚未执行id，更没有浏览器launch。CapEff为0与不能改变组身份相符；没有证据定位到具体宿主seccomp条目或管理策略，不把它认定为浏览器依赖缺失、Google下载失败或bwrap挂proc。不能说Chrome本身已经启动失败。

按用户“root环境无法安全启动先报告阻塞”要求，在此停止浏览器步骤。不使用其他方式绕过组权限、不root无沙箱启动、不关闭Chromium沙箱、不修改宿主权限。没有Chromium进程可供检查，**沙箱实际是否启用为未覆盖**。

原始入口记录：[ordinary-user-entry.json](evidence-chromium-install-20261012/ordinary-user-entry.json)。

## smoke适配评估与未执行范围

本轮从GitHub重新读取tests/feedback-lab-smoke.cjs，Blob `86eb7f17e97af6ff0d776338149aa8cf7be675c6` 与本地一致。脚本有5个验收计数点：V10标题、手动伤害、保护起身、空中/倒地追击事件、无pageerror。原脚本未改、所有断言保留。

原launch({headless:true})按Playwright默认会选择缓存Shell且未显式开启sandbox。当前是独立目录安装，未来在普通用户入口可用后，适配仅限：

1. launch增加已安装的executablePath和chromiumSandbox:true。
2. DNFKU_PREVIEW_URL使用 https://lgf921375.github.io/dnfku/prototype/feedback-lab-v10.html 。
3. 截图/recordVideo证据写独立用户可写目录，其余原断言保持原样。

由于安全运行前提没有满足，本轮不提前改或执行脚本，不将已有Cloud Chrome/Skia证据冒充本轮通过。V10 HTTPS真实加载、按钮、JS异常、完整连招、音效和录像均未执行；脚本退出码null，断言0项，而非失败断言5项。详见 [browser-test-status.json](evidence-chromium-install-20261012/browser-test-status.json)。

## 下一步最小修复

**需要平台提供当前隔离环境可正常执行命令的普通用户入口**，维持现有安全隔离；不需重新下载，不需sudo或提升当前root进程能力。平台入口就绪后，由普通用户确认安装目录可读、选择自己的可写用户数据及证据目录，显式sandbox:true启动完整Chrome新无头模式；安全启动成功才访问V10并运行保留原断言的smoke。

普通用户入口就绪仍不保证Chrome命名空间沙箱可用；该阶段再按真实错误独立判断。本轮没有验证它，不猜测后续错误。未转GitHub Actions，没有修改游戏源码或其他服务。

