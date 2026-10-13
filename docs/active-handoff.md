# dnfku 当前研究交接

## 当前优先交接：V11保护断言纠错，本地UID0阻塞（2026-10-13）

- 起始main=`d4e6acfaeddfcb9e953b473f2fcebc5fecc6dec5`；独立分支 `work/v11-local-20261013`。先已通过连接GitHub读AGENTS/README/本交接、V11报告和实际文件。最近runs全结束，in_progress=0/queued=0，本机无dnfku测试/Chrome；其他隔离窗口是否有人编辑无法观察。
- **通过（历史取证）**：V11#1 run38214754382/job114696788116，Artifact11732530314完整ZIP2597562字节/29项CRC及SHA核对。前三检查PASS、第四FAIL、后六未执行；同run V10原5通过。连续普攻触发ground-limit：groundHits3/totalHits6，最后HP504，触发后无damage。旧断言只接受air4或total7，遗漏合法地面保护；原始失败不删除。
- **通过（本轮Node）**：基线153/153；新增公共输入/整保护周期/缓冲/恢复/反例18项，最终171/171 exit0。历史RAF间隔+声明输入延迟复现ground3/total6/HP504，不称精确鼠标重放。20/30/60/90/120Hz不同输入节奏测试不等于手机性能。
- **实现/静态通过**：公共V11十三项断言、独立sandbox:true本地执行器（loopback/超时/日志/证据/清理）；CI保持原non-root/GitHub-hosted/sandbox:false限制。产品源码/参数/workflow/V10原五项无修改。
- **失败/阻塞（实际本地入口）**：UID/GID0，Playwright1.62.1/Shell151.0.7922.34匹配；安全入口exit2、Chrome/HTTP未启动、0断言。未切UID、未关闭sandbox、未伪造CI变量、未安装、未触发Actions。CI root guard实际exit1/0断言。
- **未覆盖**：新浏览器断言/本地V10五项、实际sandbox内部诊断、录像/超时回收运行、Android/APK/帧率/主观手感。历史PNG中文方框/追击火花与绘制人物间距是待验视觉差距，不称打击感达标。
- [完整报告](v11-protection-local-20261013.md)、[真实证据](evidence-v11-local-20261013/)。普通用户原生入口是下一步环境要求；当前工具无user/uid/gid参数。先复核匹配Shell及PW录像依赖再跑 `DNFKU_CHROME_EXECUTABLE=/absolute/path/to/chrome-headless-shell DNFKU_EVIDENCE_DIR=/absolute/path/to/evidence node tests/juggle-lab-local.cjs`。当前环境已实测阻塞，不原地无限重试。
- 分支为WIP，未合main/未部署；最终提交SHA以GitHub回读为准。两窗口仍由用户转发结果；不触碰《皓石传奇三》。

## 当前优先交接：自主研究与V11候选已实现，待真实浏览器对照（2026-10-12）

- 起始main92c9524b；按用户上传的自主研究指令读取约束、再次核查固定上游实现；OpenBOR/Ikemen-GO/MiniDNF深入读取，Unity第三击配置补充，观察两段2020手游历史录像，所有限制在[证据/差距表](reference-gap-v11-20261012.md)。不声称掌握官方完整参数/保护。
- **实测通过（历史V10）**：#7 run38208502554实际Artifact11728540448 CRC/SHA核对，原5/5，真实PNG/WebM已读取解码。编码25fps/192帧/7.68秒不等于稳定游戏帧率；Chromium沙箱已关闭。
- **实现/逻辑通过**：隔离V11末段挑斩与接触续浮空；保留V10默认、原5smoke和浮空/扫地/强制起身规则。原147+新6=153/153 exit0，V10同输入1600步快照/事件与旧commit逐步相等。共享入口默认等价，V9/V10单文件已重建。
- **静态通过**：候选脚本/模块/HTML及manual-only Ubuntu工作流；只使用现有非root托管环境，contents:read/checkout不存凭据，无Secrets/sudo或宿主策略变更。原5先独立执行，再新10。
- **尚未覆盖**：首次提交时V11浏览器0执行、无新run/录像，视觉改善与安卓手感不能标通过。当前GitHub网页入口实际已恢复，下一步确认Pages内容、手动触发一次对照run后读取完整Artifact；失败留证，不自动重跑。
- 只操作dnfku，不触碰《皓石传奇三》或其他服务。最终HEAD以回读为准。


## 当前优先交接：#5 Chromium已启动，移除CDP命令行查询（2026-10-12）

- 起始mainb15248ba，先读AGENTS/README/交接/真实源码；用户要求最小修复后只返回commit，不自行触发。
- **通过（实际#5运行）**：run38195756623/job114637897734，Chrome151.0.7922.34 browserLaunch=passed；GitHub托管runner UID/GID1001；安装/manifest/版本/ldd退出0。**Chromium沙箱已关闭**，不冒充安全验收。
- **失败（真实预检查）**：Browser.getBrowserCommandLine缺--enable-automation，预检查退出1；与sandbox无关，CDP查询在HTTPS加载前阻止执行。原5断言全部skipped/0执行，无PNG/WebM。
- **通过（Artifact取证）**：ID11723367047，8308字节/14文件，实际下载与全ZIP CRC通过，SHA256匹配3ed3eb2b6e306d79dbbc81c54a5fb5ef90d1d988417eb2412b92f26c0fe84904。保留原ZIP/summary/完整job日志，不保存签名URL。
- **仅删3行**：预检查CDP session创建、命令行查询、依赖参数判断。保留真实启动、版本、HTTPS响应、标题、截图、沙箱关闭提示及hosted/非root限制；workflow/smoke/游戏源码不改。
- **通过（静态）**：预检查及smoke node --check退出0，必要检查仍在。**未覆盖（修复后）**：本轮不触发/不rerun，等待用户手动执行一次后核实5项和录像。
- [修复与原始证据](v10-run5-preflight-fix-20261012.md)。不操作《皓石传奇三》；最终main SHA回读为准。

## 当前优先交接：用户授权一次无Chromium沙箱Actions，修改已就绪待触发（2026-10-12）

- 起始mainc40eb13b；先读AGENTS/README/交接/上次实际run报告。用户本轮明确授权一次性GitHub托管runner chromiumSandbox:false，优先于之前禁止关闭该浏览器sandbox的用户要求；不涉及宿主安全策略/正式服务器/个人电脑。
- **配置说明：Chromium沙箱已关闭**。预检查及smoke均false；预检查改实际启动+V10 HTTPS响应/标题/截图，不以sandbox启用判通过。两脚本只允许github-hosted Actions和非root。原5条断言逐行保留，游戏/攻击规则0修改。
- **通过（静态）**：两个node --check及YAML/manual-only/ubuntu/contents:read/checkout不持久化凭据检查退出0。保留错误/退出码、截图/recordVideo/finally清理、always Artifacts，无Secrets/sudo或策略变更。
- **触发阻塞**：当前浏览器工具原生凭据状态无法安全恢复，按提示重置一次工具会话后仍被阻止；不是GitHub账号未登录的证据，也不是新Chrome启动结果。连接器没有新workflow_dispatch接口，不用旧run的rerun替代。
- **未覆盖**：新手动触发0次、无新run_id；Chromium启动/原5断言/本次PNG/WebM均未覆盖，不承诺100%通过。须用户在GitHub工作流main界面提交一次后，用连接器读取全局run/Artifacts，无需共享登录凭据。
- [实施与边界](v10-unsandbox-actions-20261012.md)、[静态检查](evidence-actions-v10-20261012/unsandbox-static.json)。新run失败即停止并保留与sandbox是否有关的真实错误；不无限重试。
- 不操作《皓石传奇三》；最终提交SHA以main回读为准。

## 当前优先交接：唯一手动Actions已运行，No usable sandbox失败（2026-10-12）

- 用户接管后GitHub已登录，网页显示用户菜单/Settings/Run workflow。核对main77e867fd，**只触发一次workflow_dispatch**：run38193839109/job114632108113、attempt1，完成failure；未重跑。
- **通过（真实runner）**：Ubuntu24.04.5，UID/GID1001(runner)，目录读写；PW1.62.1及Chrome/Shell151.0.7922.34/FFmpeg安装、manifest、Chrome版本、ldd退出0。
- **失败（安全启动）**：sandbox:true真实launch、pid2542，zygote初始化No usable sandbox!，SIGABRT；预检查退出1。未添加sandbox禁用参数、未提权或改策略；直接原因明确，AppArmor特定规则未做审计验证。
- **未覆盖**：没有成功启动可证明实际sandbox；原smoke步骤skipped，原5断言0执行（非5项失败），无V10截图/WebM，帧率/安卓手感未覆盖。产物browserLaunch=not-run初始字段不足，error已证明确实尝试launch，解释纠错保留原产物。
- **通过（真实Artifact）**：ID11722453127、14245字节，下载并全ZIP CRC通过，14文件可读，SHA256匹配8c690e27fa1bec78128554922ea3995b3224c903726268f9f96641da4a8dc494。summary screenshots/videos空、smoke null；完整错误/退出码已保存GitHub，不持久化下载签名/登录凭据。
- [运行结果](v10-actions-run-38193839109.md)、[实际run](https://github.com/lgf921375/dnfku/actions/runs/38193839109)、[Artifact](https://github.com/lgf921375/dnfku/actions/runs/38193839109/artifacts/11722453127)。最终网页截图受browser原生凭据状态保护限制，未绕过；日志和Artifact已通过连接器实际读取。
- 安全失败按指令停止，唯一执行授权已用完。下一轮仅先只读核查其他现成安全Ubuntu镜像/预配置QA环境；不直接重跑或改变宿主策略。没有成功基线暂不进行手感优化开发。
- 本轮仅结果文档/日志交接，不改游戏战斗代码、不操作《皓石传奇三》。最终main回读为准。

## 当前优先交接：修复Actions表达式错误，网页登录未完成（2026-10-12）

- 用户已授权GitHub网页一次workflow_dispatch。起始main4a0669cd；重新核对lgf921375/dnfku/main/工作流。本轮手动触发次数仍0，未重跑其他workflow。
- **失败（GitHub真实校验）**：发现run38191658416为push校验记录，jobs0/artifacts0，错误Line16 runner.temp在job.env不支持。上轮仅YAML静态通过不足以称工作流有效；记录纠错，不冒充Ubuntu浏览器已运行。
- **最小修复**：仅将PLAYWRIGHT_BROWSERS_PATH移到步骤内由RUNNER_TEMP设置并写GITHUB_ENV。仅workflow_dispatch、普通用户、sandbox:true及5原断言保持；游戏/原攻击规则不改。
- **登录阻塞**：Cloud Chrome尚未登录；GitHub不支持此账号密码方式，用户选择Google后收到密码有误。安全browserAuth完成非秘密提示读取；没有重复提交或保存凭据/OAuth会话信息。需手动接管正确登录，禁止聊天提供密码。
- **未覆盖**：手动run尚无，Chromium实际启动/实际sandbox/5断言均0执行，本轮V10截图录像无、Artifacts0。旧push校验失败run不得当本次手动验收；帧率/安卓手感未覆盖。
- [追加纠错报告](v10-actions-acceptance-20261012.md)、[非秘密触发证据](evidence-actions-v10-20261012/dispatch-attempt.json)。后续登录完成才核对main并只触发一次，保留run_id/真实日志/Artifacts。
- 不部署服务器、不操作《皓石传奇三》，不关闭沙箱、不提权；最终main从提交后回读。

## 当前优先交接：V10手动Actions实现，首次触发待网页入口（2026-10-12）

- 起始main=`d4253857190404b099efa9363c0f596dda78418d`；用户授权迁移并执行一次。已读AGENTS/README/交接/Actions方案，未改游戏机制或《皓石传奇三》。
- 新增 .github/workflows/v10-browser-acceptance.yml，仅workflow_dispatch/ubuntu-24.04/contents:read；普通UID与真实目录读写，PW精确1.62.1/Chrome151manifest核查，官方浏览器安装；无sudo、宿主策略修改或sandbox关闭。
- 新增sandbox preflight，实际Chrome启动参数+chrome://sandbox诊断/截图核查，安全证据不足即停。原smoke仅启动路径+sandbox:true、独立证据目录、失败/录像关闭适配；5条assertions++原行逐行保持。
- **通过（静态）**：2脚本node --check退出0，YAML/manual-only/权限/上传核查通过。product文件0修改。各阶段日志/退出码、真实PNG/WebM和summary通过always上传Actions Artifacts。
- **未覆盖**：尚未触发Actions，runner身份/Chromium实际启动/实际sandbox/5断言/本轮截图录像全未覆盖，0断言；不能标通过。帧率与安卓手感未覆盖。
- **首次触发能力阻塞**：当前GitHub连接器没有workflow_dispatch工具，本地没有gh；rerun不能替代首次执行。按开发者插件fallback要求，需用户允许GitHub网页浏览器入口后手动触发一次；先保存具体工作流供审查，不擅自browser fallback/获取凭据。
- [实施与边界](v10-actions-acceptance-20261012.md)、[静态证据](evidence-actions-v10-20261012/static-checks.json)。后续取得run_id后核日志/Artifacts更新结果；不以本段静态通过冒充实测。
- 最终提交SHA从main回读；当前仅验收工作流/必要测试适配与文档，不部署或修改战斗规则。

## 当前优先交接：工具无原生普通用户参数，停止本地启动（2026-10-12）

- 起始main=`9d22acadf3dd5fdcd4af71d10ba289d00d3d77bd`，先读AGENTS/交接/安装报告/原smoke。本轮只查原生工具入口，不重下浏览器、不重试runuser、不切UID、不提权或改安全策略。
- **通过（接口核查）**：本会话exec_command完整参数无user/uid/gid；没有其他暴露的本地命令工具可指定用户。shell/login/sandbox_permissions不是普通用户身份参数；不向工具传未声明参数。
- **失败/不可用（普通用户入口）**：当前受支持入口不存在；id仍UID/GID0。普通用户id、读两个安装目录、写独立数据目录均未覆盖，不用root检查冒充。
- **通过（文件复查）**：完整Chrome/Shell仍存在0755，当前/tmp安装保留，不需重复下载。
- **未覆盖**：Chromium安全启动、实际沙箱、V10 HTTPS与原smoke均未执行，0断言，无本轮截图录像。按用户明确指令停止当前环境启动尝试。
- [核查与Actions最小方案](chromium-native-entry-actions-plan-20261012.md)、[工具接口证据](evidence-runtime-entry-20261012/native-entry-tool-schema.json)。方案仅手动workflow_dispatch、普通用户id/读写验证、精确PW版本与manifest核查、官方浏览器/FFmpeg安装、显式sandbox:true、原5断言、always上传真实日志/截图/视频。禁止sudo/修改策略；没有启动或Actions实测不标通过。
- 尚未创建启用workflow或触发Actions，也未改测试/游戏代码；后续只调整smoke launch路径+sandbox和必要失败清理，保留断言。新runner独立安装与当前窗口“不重下”区分。
- 本批仅文档/接口证据和交接；不操作《皓石传奇三》。最终SHA从main回读。

## 当前优先交接：两个Chromium包已安装，普通用户入口失败（2026-10-12）

- 起始main=`261b47ca58c3c8609c415462b9e4e5ceb326c23e`；本轮用户明确授权当前隔离窗口正式下载安装。已先读AGENTS/README/交接/Google安装方案；不改游戏规则、测试源码、系统配置，不操作《皓石传奇三》。
- **通过（真实下载/安装）**：Google官方Chrome151.0.7922.34/linux64完整包193282658字节、Shell120231126字节，HTTP200/application/zip，curl退出0。全部ZIP条目CRC分别308/287通过，SHA256已记录，安全解压到独立 `/tmp/dnfku-cft-151.0.7922.34-20261012`，二进制存在0755；未覆盖系统浏览器、未写Playwright缓存或伪造标记。
- **通过（版本/ldd）**：两者--version输出151.0.7922.34退出0，主二进制ldd退出0无not found。运行时动态依赖未覆盖。
- **失败（普通用户入口）**：既有oai/vscode分别执行runuser -u USER -- id，两者退出1，stderr完整为runuser: cannot set groups: Operation not permitted。当前CapEff0/UID0/NoNewPrivs1/Seccomp2；不能归因为Google下载、浏览器库缺失或bwrap。
- **未覆盖（浏览器与沙箱）**：入口失败发生于浏览器launch前，未执行root浏览器、未关闭sandbox、未提权或改宿主权限。无运行浏览器可确认实际sandbox；V10/smoke0断言，脚本未运行、退出码null，无本轮截图/录像。原脚本5个计数断言保持，Blob86eb7f17e97af6ff0d776338149aa8cf7be675c6。
- [正式安装/阻塞报告](chromium-install-result-20261012.md)及[evidence目录](evidence-chromium-install-20261012/)包含完整下载命令、CRC/SHA、依赖/版本、入口错误、测试未覆盖状态和安装脚本。包仅在当前环境临时目录，不上传GitHub，环境回收需重新确认。
- **下一步最小修复**：平台提供当前隔离环境的正常普通用户执行入口，保持安全隔离；随后仅适配测试launch的真实executablePath+chromiumSandbox:true及独立证据目录，保留原断言，使用V10 HTTPS进行真实测试。现有包无需重下；普通用户下沙箱是否可用仍需实测。暂不转GitHub Actions。
- 本批仅文档/证据持久化；最终main SHA以提交后的回读为准。

## 当前优先交接：Google官方CfT包可限量读取，安装方案待执行（2026-10-12）

- 本轮用户要求先返回检查结果/方案；未下载安装、未改代理/沙箱/系统权限/游戏或测试代码，未迁移GitHub Actions。起始main=`113b768c4bdacbbe1dfca03b913f52e68ced2c78`，先读AGENTS/README/交接。
- **官方目录真实读取**：GoogleChromeLabs/chrome-for-testing固定commit `df9c8fc89b8a9c9eacf1b5a747b3f0bf366fe21d`，known-good-versions-with-downloads列出151.0.7922.34/linux64的完整Chrome和Shell；URL来自真实条目，不猜路径。
- **通过（当前窗口HTTP限量）**：storage.googleapis.com/chrome-for-testing-public/151.0.7922.34/linux64/下chrome-linux64.zip及chrome-headless-shell-linux64.zip均HEAD200/application/zip，总长193282658及120231126；Range206各4096字节，PK0304；尾部128字节均有PK0506 EOCD，结构总长相符。不是此前cdn.playwright.dev的195字节HTML。
- **静态匹配**：Playwright1.62.1 manifest要求browserVersion151.0.7922.34、缓存revision1234；官方Google revision1654411为不同编号体系。默认headless寻找Shell；完整Chrome新headless可用channel:chromium或explicit executablePath。
- **新运行前提**：当前UID0，无DISPLAY/WAYLAND_DISPLAY；NoNewPrivs1/Seccomp2不足以证明sandbox可用。Playwright默认chromiumSandbox=false会加--no-sandbox，未来必须显式true，并由平台提供普通用户/安全运行条件；本轮不切用户、不开关隔离。
- [完整检查/安装方案](google-cft-install-plan-20261012.md)、[官方条目](evidence-google-cft-20261012/official-catalog-entry.json)、[HTTP](evidence-google-cft-20261012/response-results.json)、ZIP尾部及模式/环境日志已保存。
- **下一步方案**：当前窗口按两个准确官方URL完整下载→核对大小/zip全CRC→独立用户可写目录解压→显式可执行路径+sandbox:true、普通用户运行→HTTPS真实验收。整包传输/CRC/安装/依赖/启动/GUI均未覆盖，不能标安装成功。
- 不将PLAYWRIGHT_DOWNLOAD_HOST简单指向Google根来猜拼接路径；不伪造缓存安装标记，不用sudo/关闭sandbox/第三方包。仅在出现真实阻塞后再考虑其他授权环境。
- 本批只保存诊断文档、日志和交接；不部署/重启服务，不触碰《皓石传奇三》。最终SHA以main回读为准。

## 当前优先交接：Chromium下载链路返回195字节HTML（2026-10-12，只读诊断）

- 起始main=`0e35d851402d471b04ef986d8967735f543e820a`，先读AGENTS/README/交接；本轮没有安装重试、DEBUG安装、改代理/网络/隔离、使用sudo或改游戏源码。
- **通过（真实限量HTTP诊断）**：当前Playwright1.62.1 dry-run退出0，官方配置Chrome151.0.7922.34/revision1234；主机cdn.playwright.dev，完整包路径/builds/cft/151.0.7922.34/linux64/chrome-linux64.zip，Shell路径同目录chrome-headless-shell-linux64.zip。完整Chrome URL来自实际历史安装日志，Shell为本轮dry-run确认的后续配置地址。
- **失败（内容有效性）**：两地址HEAD200、Range206，Content-Type text/html、Content-Length195、Content-Range bytes0-194/195，下载195字节，开头<html>。正文Site Unavailable / Unable to access this site；0重定向，没有观察到403/404/502/407。
- **原因边界**：当前得到HTML而非ZIP，足以解释解压签名错误；不能认定真实ZIP截断，也不能确定源站/CDN/出口代理哪层返回HTML。上轮临时ZIP不存在，未做旧文件字节复验。
- **代理/环境**：Playwright自身getProxyForUrl确认CDN请求选中http代理，NO_PROXY未绕过；download host/timeout/cache覆盖变量未设置。代理主机脱敏，不保存凭据。进程间端口不同，未归因为损坏。
- **磁盘/缓存**：可用约31.68GB，缓存只见88字节.links，无安装程序/ZIP；PATH与常见Chrome目录未发现可复用浏览器。系统库缺失尚未覆盖，bwrap是不同层故障。
- [完整报告](playwright-download-diagnosis-20261012.md)、[HTTP结果](evidence-download-20261012/response-results.json)、[HTML提示](evidence-download-20261012/chromium-body-sanitized.json)、[dry-run](evidence-download-20261012/dry-run.txt)和脱敏环境/磁盘日志均保存。
- **最小下一步**：平台核查官方CDN请求为何返回Site Unavailable，在拿到真实ZIP前不盲装、不改超时/清缓存/换版本；当前出口无法获取时采用另一已授权匹配Chromium的QA环境。已有Cloud Chrome HTTPS验收可用，但不冒充原脚本通过/流畅度达标。
- 本批仅诊断文档与交接。未触及《皓石传奇三》或部署/重启任何服务；最终SHA以main回读为准。

## 当前优先交接：HTTPS云Chrome验收已运行，启动错误分层诊断（2026-10-12）

- 本轮按用户要求暂停V10功能开发；起始main=`7902c5808be99447f49506b165642f2897d03dfd`。先读GitHub AGENTS/README/交接及旧浏览器日志，未改游戏源码/规则或测试脚本。
- **bwrap来源（静态证据+历史命令）**：/usr/local/bin/sites-preview ELF含sites_preview::build_bwrap_arguments；上轮本地HTTP预览隔离层挂proc失败、退出1。不能把它说成Cloud Chrome启动失败，也未查明具体宿主安全策略。
- **本地脚本真实重试失败**：HTTPS作为DNFKU_PREVIEW_URL，feedback-lab-smoke.cjs在chromium.launch退出1，缺Chromium revision1234二进制，0断言。完整stderr/exit_code保留。
- **通过（真实Cloud Chrome页面）**：现有 https://lgf921375.github.io/dnfku/prototype/feedback-lab-v10.html 正常加载；单次手动普攻600→588，手动上挑600→582且浮空；点击公开连招演示三段→上挑→空追→落地同键追击→保护站起，最终HP474。不是模型注入或Skia。
- **取得真实录像**：[原始完整WebM](evidence-browser-20261012/full-browser-demo.webm)、[兼容MP4](evidence-browser-20261012/full-browser-demo.mp4)、[手动上挑](evidence-browser-20261012/manual-launcher.webm)，页面captureStream/MediaRecorder控件录制与下载。Canvas无HUD/音轨，HUD见真实截图。
- **重要限制**：完整WebM约139.8秒、150帧，平均有效1.073fps，不是30fps流畅度通过；低帧率具体原因未定位。仅功能流程可标通过，Android手感/多指/音效、保护期间人工复攻、手动完整连招未独立验收。
- Cloud捕获14条扩展metadata发送错误，均chrome-extension来源；不称控制台完全无错。一次等待保护标签超时后最终到达；window.rhythmLab读取被Cloud只读scope隔离，改用DOM/截图/录像核查。
- [完整诊断与最小方案](browser-diagnosis-20261012.md)。下一步优先沿用HTTPS/已运行Chrome；原自动脚本要在匹配Chromium的QA环境运行；预览隔离挂载由平台维护者处理，不关隔离/不提权。
- 本轮仅诊断文档/交接/真实证据保存，无功能开发、安装依赖、部署/重启或其他游戏访问。原V10历史限制下文保留，以本段新增覆盖为准；最终提交SHA以main回读为准。

## 当前优先交接：V10源码落实已改，浏览器验收未完成（2026-10-12）

- 起始main=`6af364f3e06b0c701df077b53701ac29a994c55e`；先读GitHub最新AGENTS/本交接/四仓库报告/README及源码先行计划。
- **实际检索/下载/深审**：OpenBOR `787b6770409935137579715febf80cf7a529b748`、Ikemen `b464672651c87c42aeca10bb5c33003f26d42071`（本轮HEAD已更新，重定位行号）、MiniDNF `543839751adbe09eecc896da949945080782b45e`、street-crime `777da9e0ebbd5418dd957e1511eac5e4f89fc641`。8个下载源码/许可证文件Git Blob哈希完全匹配；不上传第三方源码或素材。
- [逐项目函数与V9差异报告](source-driven-feedback-v10-20261012.md)、[下载证据](evidence-v10/source-download.json)。
- **实际修改**：新增CombatFeedback刀刃胶囊精判、真实接触点、分段硬直/受击姿势和暂停时钟；drawFeedback区分轻/返/重/空/地受击，触地和普通起身过渡；V10离线页实际调用新模块并加入录制控制。V9及旧核心/测试保留。
- **规则保留**：同一普攻几何接触站/空/地，状态只决定受击；原浮空/扫地/保护强制起身及短暂无敌。未照搬OTG或juggle拒绝命中。
- **通过（Node真实运行）**：147/147，含原142+新5。**通过（Skia生产模型画面/看图）**：[8秒30fps对比录像](evidence-v10/comparison-model.mp4)、[对比图](evidence-v10/reaction-comparison.png)；正常输入连招到达保护。**这些不是浏览器/Android录像，不是主观打击感验收通过**。
- **失败/阻塞**：Cloud Browser拒绝file协议；正常内部HTTP预览启动bwrap挂载proc权限失败；Playwright缺Chromium，0断言。原始[日志](evidence-v10/browser.txt)、[分类结果](evidence-v10/results.json)。初期文本保存换行差异导致一次Node退出1，经精确恢复后通过，未改旧测试。
- **当前状态：有代码/画面改进，但用户要求的浏览器操作与战斗录像仍未完成，不能宣布优化完成。** Android真人、多指、音效听感、录制按钮、身体盒逐姿势贴合和成熟美术未覆盖。
- **下一轮必须先验收**：用可运行Chromium与HTTP预览跑feedback-lab-smoke.cjs并真实录屏；再根据录像和用户反馈修改。不要以继续加参数或Node数量代替体验。
- 本批源码、模型证据、报告/交接原子提交；最终SHA以main回读为准。未发布生产服务/重启，未触及《皓石传奇三》。

## 当前优先交接：用户要求外部 Git 战斗源码先行，停止凭空编手感（2026-10-11）

- **最新用户反馈**：持续自创规则、不断增加 Node 测试仍远离 DNF 手感；需真正检索和分析别人项目中的攻击、受击、浮空、扫地、动作帧和音画反馈源码，落实到当前 V9。用户主观体验不满意，**不能标为已通过真实手感验收**。
- **研究连续性**：已有 [四仓库源码研究](attack-hit-feedback-source-study-20261011.md) 实际审查 OpenBOR、Ikemen-GO、MiniDNF、Unity-DNF；新建 [源码先行计划](source-first-combat-plan-20261011.md) 补充3个横版/格斗候选，当前新候选只读 README，**未审战斗函数/未运行**。后续不要反复重写相同综述，要按照“固定commit+函数/行号+机制调用链→V9代码差异矩阵→最小真实改动→浏览器/手机录像”推进。
- **不可破坏的用户规则**：同一普攻按实际刀刃攻击盒与站立/空中/倒地目标的身体盒是否接触决定命中；状态只决定受击效果；连击保护达到阈值强制起身并短暂无敌。禁止倒地时自动改成另一招，也不能为了套 OpenBOR OTG 过滤而拒绝实际贴地命中。
- **状态**：本批通过的是 GitHub 文档/README 静态读取与更新，无游戏源码更改、无新 Node/Chromium/Android 实测；当前 V9 历史142/142 Node 和 Skia 录像不能改写为浏览器或手机达标。**下轮必须以视觉和操作结果而非测试数量验收。**
- **限制**：仅本仓库研究文档变更，无部署/重启/其他游戏修改，不碰《皓石传奇三》、40C、600ms或受保护素材。下面原“攻击与受击反馈开源源码研究”“V9”段落继续保留。

## 当前优先交接：攻击与受击反馈开源源码研究（2026-10-11）

- 起始 main=`16413898f3780bebbdb0409d745a65edccfd25bd`；先读取 GitHub AGENTS/README/交接/V9及既有研究报告。本轮为研究，最新游戏版本仍是 V9。
- **通过（静态检查）**：搜索并固定读取 OpenBOR `787b6770409935137579715febf80cf7a529b748`、Ikemen-GO `5eb7f3c746632c1d2652a521dab7bc541c1f2edb`；复核 MiniDNF、Unity-DNF。准确路径/函数/行链接和源码 SHA 见 [研究报告](attack-hit-feedback-source-study-20261011.md)、[证据清单](evidence-source-study-20261011.json)。
- OpenBOR：当前帧多攻击/身体盒、XYZ 接触和交集中心、攻击 ID 去重、OTG/juggle 策略、伤害与受击动画分离、双方调度停顿。反击盒检测明确暂时禁用；玩家取消链未完整审计。
- Ikemen：同一 HitDef 按目标状态选择受击速度/时间；双方顿帧、防御顿帧、受击硬直/恢复和反馈分开。实际 LICENCE 为引擎/脚本 MIT，素材另有范围；不能以元数据 Other 推断无许可。
- **V9 源码缺口**：三段普攻仍统一 hitstun=.27，hurt=.22且同一后仰姿势；hurtDirection 当前 renderer 未使用。空中/倒地已有旋转和速度差异，但缺专门的受击→触地→起身动作序列。可能影响手感是推断，未以手机对照验证。
- **用户规则继续优先**：同一普攻以实际盒碰站立/浮空/倒地目标，状态只影响受击结果；不能照搬 OTG 拒绝策略或 juggle 跳过命中来替换保护强制起身/短暂无敌。
- **失败/已解决**：OpenBOR 空正文/大文件 raw 读取失败，经准确 blob 读取解决；Ikemen 初查路径404，经真实树纠正。DNFMobileEX 目录与 Launcher 显示资源导出用途，未证明战斗链，排除主参考。
- **未覆盖**：上游运行/编译/Android、官方参数与联网兼容、本轮 V9 浏览器/手机复测。没有新增功能测试，不把历史142项通过当成本轮或手感通过。
- **下一步**：在 V9 上定义原创分段受击配置与动作过渡→实际接触驱动同步音画反馈→浏览器/Android 横屏录像验收。保护/无敌原规则保留。未实现V10，未部署/重启或修改其他项目。
- 本轮四个研究文档原子提交；最终 HEAD 以 GitHub main 回读为准。下方 V9 是最新实现交接，其他段落为历史。

## 当前优先交接：V9三段普攻与动作碰撞对齐（2026-10-11）

- 起始main实际=`b027febcd3fca6d15616fcb043f271cdca550574`；先用GitHub读AGENTS/README/本交接/V5/V8/机制报告，并复核MiniDNF及Unity-DNF真实源码和固定HEAD。上传指令与5578.mp4已读取，未复制第三方代码/游戏素材。
- 新增`combat-rhythm.mjs`、`rhythm-renderer.mjs`、`rhythm-demo.mjs`和V9单文件：三段同键普攻，不按目标状态换空追/扫地；有效帧用实际绘制武器手/剑尖的包围盒。第一版宽盒提前命中的视觉问题已纠正；斜剑AABB仍有角落误差，未实现精确刀刃轮廓。
- 独立双方顿帧、轻重节奏、相对空中惯性、火花交点、倒地地面锚点与实时面板；保护/90ms/基础重力/倒地时间继续继承。所有新数值是原创实验参数。
- **通过（真实Node）**：最终142/142，旧134原样通过；新增测试初次2处时间断言失败保留日志，后来改为按实际命中事件等待。**通过（Skia生产绘制运行与看图）**：240帧/30fps/8秒录像；正常输入完整连招抵达保护起身，非状态注入。不是浏览器录像，不代表手机手感通过。
- **环境失败**：Chromium缺失，下载无效ZIP；V9浏览器脚本exit1、0断言执行。**未覆盖**：浏览器DOM/CSS/触摸/音频、Android真人手感/APK、Unity运行/联机与官方参数。V9仍是原创骨骼插画原型，视觉与DNF成熟美术有差距。
- [完整报告](combat-rhythm-v9-20261011.md)、[结果](evidence-v9/results.json)、[录像](evidence-v9/combo-demo.mp4)、[关键帧](evidence-v9/keyframes.jpg)、[V9页](../prototype/rhythm-lab-v9.html)。上传参考只抽样观测，没有认定官方动作数值；公开候选视频仅检索标题，未播放。
- **下一步**：可用浏览器跑V9脚本并补旧版回归→Android实际横屏录屏验收→进一步原创逐帧美术/动作节奏及刀刃碰撞。禁止再把测试数量当作手感达标。
- 提交为本批原子更新，最终HEAD以GitHub main回读为准。旧73文件在文档更新前Blob全一致；旧源码与测试保持不改。未部署/重启，未触及其他项目。

以下V8及更早内容为历史，当前以V9与用户统一物理命中规则为准。


## 当前优先交接：V8统一普通攻击（2026-10-11，最新）

- 起始main=`79da22e475751814f22a0c5f461d0f6489ec1d8e`，先读取GitHub AGENTS/README/本交接/V7报告/模块。
- **用户明确规则**：普通攻击与空追是一体，实际攻击盒碰到站立、浮空或倒地目标就允许命中（保护无敌等例外仍存在）。V7按目标状态切独立扫地、用状态白名单拒绝重叠盒的设计与此冲突，必须纠正，不能再继承为正式规则。
- **旧失败已复现**：相同低位普攻盒打倒地目标，旧CombatScroll HP仍200；新CombatContact HP186。证据：[规则对照](evidence-v8/reproduction.txt)。历史旧测试是在确认旧设计，不代表符合当前要求。
- 新 `combat-contact.mjs` 默认开启几何模式，`basic()`始终同一普通攻击。有效盒决定命中，目标状态只决定接触后的受击效果/保护计数；低空普通命中保留纵速，倒地普通命中刷新躺地并加扫地计数。旧保护/无敌/90ms/格挡仍保留。
- 新V8模板/单文件只有普通攻击、上挑、格挡，不再独立空追/扫地。共享核心加入可选参数和默认关闭的新模式；旧模型仍按原行为回归；重新生成V6/V7内联页保持源码一致。
- **通过（真实Node）**：134/134 PASS、0 FAIL、exit0（旧118+新16）；三个页面生成及旧新对照也exit0。**环境失败**：Chromium缺失，V8页面断言0项执行；批量exit1。
- **未覆盖**：V8浏览器脚本8项断言、手机多指/录像/真实手感、刀光与盒动态精确对齐、正式三段普攻、APK/Unity/联机。部分空中保护测试直接摆放状态位置，不能称长时间空连实测。
- 详情：[V8纠错报告](contact-v8-20261011.md)、[原始结果](evidence-v8/results.json)。下一步用同一攻击键贯穿上挑追击及落地追击，依据真实录像做三段普攻/攻击盒；禁止再按目标状态切换攻击来代替碰撞判断。
- 本批源码/报告/交接原子提交，最终HEAD以main回读为准。只改dnfku，无部署/重启，不触及《皓石传奇三》/40C/600ms/怪物配置。

以下V7及更早内容为历史，当前规则以V8为准。

## 当前优先交接：V7横版体验改进（2026-10-11，最新）

- 起始 main=`5bc62e211c8a28aa0bbccfd3728f7451f52591c8`；本轮先从GitHub读取AGENTS、README、本交接、V6报告与核心。用户手机截图与反馈明确指出V6静态方块和手感不满足横版格斗目标；这是需要保留的体验失败反馈，截图不代表动态手感已量测。
- 新增 `combat-scroll.mjs` 与 `scroll-renderer.mjs`：V6上增量持续移动、前后lane走位判定、普通水平击退、陪练与反馈；原创持剑关节人物及站立/行走/挥刀/受击/浮空/倒地。未改V3–V6参数或旧源码/测试。
- 新增V7模板/生成器/单文件页面：横屏优先，左摇杆右技能、顶部HP、刀光/火花/轻震屏、按住攻击、倒地自动扫地、可选WebAudio合成音、格挡按住/释放与全屏请求。实际触摸事件、音频和全屏仍未验收。
- **通过（真实Node）**：118/118，0失败，exit0（旧104+新14）。**通过（Skia生产绘制函数执行及人工看图）**：四状态PNG。不是浏览器截图，不等于动画流畅或手感通过。
- **环境失败/未覆盖**：V7浏览器启动exit1，缺Chromium，12项页面断言0项执行；整体批量exit1。V6/V4/V5浏览器未复跑，真人Android多指/帧率/录像、APK/Unity/联机均未覆盖。V7主观打击感仍待用户验收。
- 证据：[V7报告](side-scroll-v7-20261011.md)、[原始批量结果](evidence-v7/results.json)、[同代码命中画面](evidence-v7/impact.png)。离屏环境中文字体不完整，只核查人物舞台。
- **下一批**：用户横屏实际试V7并录屏→可用浏览器环境跑V7/V6/旧版交互→根据真实反馈做原创逐帧美术/动作节奏→再评估APK。不能用118项通过宣称达到DNF手感。当前仍是双角色简化原型，不是完整游戏。
- 本段和源码/证据同批原子提交；最终HEAD以main回读为准。不部署、不重启、不触及《皓石传奇三》或40C/600ms/怪物配置。

以下V6及更早段落为历史，当前优先级与新增覆盖以V7报告为准。

## 当前优先交接：V6二角色战斗（2026-10-11，本轮最新）

- 接手GitHub main核实SHA：`492688f5b1a749dc962679ff95519fb8ac373a45`。先读取AGENTS、README、本交接、V5/V4及此前报告；继承既有参数，不重建上游研究。上游最新版本本轮未复核。
- 新增 `prototype/combat-duel.mjs`：二角色各自使用V3身体状态、V5动作；active连续窗口碰撞、独立区间hitbox、朝向镜像、HP、正面0削血格挡、霸体扣血不打断、普通/强制打断、浮空/扫地/保护兼容、败北与同帧换血。
- 新增V6 HTML模板/生成器/离线页：直接嵌入四模块，支持双方按键、血条、格挡、步进移动、攻击盒、暂停和扫地演示。页面生成/语法通过；浏览器画面及行为未验收。
- **通过（真实Node隔离运行）**：Node v24.19.0 `node tests/run-v6-batch.mjs` 中Node项退出0，**104/104 PASS、0 FAIL**；旧65项原样回归，加V6战斗38项和页面来源一致性1项。构建项退出0。
- **失败（环境阻塞）**：V6 Chromium脚本启动退出1，浏览器文件缺失；Playwright Chromium下载内容不可解压，安装退出1。浏览器**0项断言执行**，不能称为页面功能失败或通过。批量命令整体退出1。旧V4/V5 Python测试本轮未复跑，其历史12/12仍仅指之前环境。
- **未覆盖**：V6 Chromium18项断言、真人Android触屏/录像、APK、Unity、真实帧动画/音效、主观打击感、多目标/景深轴、联网服务端、官方DNF一致性与商业许可。
- **证据入口**：[V6完整报告](combat-duel-v6-20261011.md)、[批量原始结果](evidence-v6/results.json)、[Node日志](evidence-v6/node.txt)、[浏览器阻塞日志](evidence-v6/browser.txt)、[Android路线增量评估](android-route-v6-20261011.md)。旧V2/V5失败记录保持原样，本轮未发现Node覆盖场景的新产品失败。
- **下一批连续任务**：①可用Chromium环境跑V6脚本及V4/V5浏览器回归并修复真实失败；②真实手机开V6离线页录屏；③在证据基础上做原创动画/连续摇杆；④再选最小APK路线。当前格挡/伤害/时序均为原创实验设计值，不宣称官方。
- 本段与源码/证据在同一原子提交保存。最终提交SHA需GitHub main回读，不能预填自身SHA；报告内起始SHA不代表提交后HEAD。
- 仅修改dnfku；未部署或重启，未触碰《皓石传奇三》及其40C/单服务/600ms/怪物配置。

以下为按批次保留的历史记录；其中“下一步”和“未覆盖”以本段及V6报告的最新覆盖为准。

时间：2026-10-11。阶段：上游源码静态审计 + 原创 JavaScript 隔离原型的 Node/Chromium 自动实测；上游 Unity 游戏及 Android 仍未运行验收。

## 已完成

- 确认本仓库为用户新建的公开 `lgf921375/dnfku`，GitHub 连接具有 push 权限。
- 审查三仓库的真实 GitHub 文件树、README 及重点 C# 实现，固定上游 commit（见 `docs/source-audit-20261011.md`）。
- 从 MiniDNF GitHub 仅下载 32,552 字节的 `Attack.xlsx` 到 Ubuntu `/tmp/dnf95-github-attack-audit.xlsx`，用 Python 标准库解析四个工作表；录入有实际证据的技能数值。
- 建立 README、AGENTS、源码审计、技能参数和机制报告，防止上下文丢失。
- 所有活动限于 GitHub 文档整理和隔离的只读源码分析；未部署/重启/改写《皓石传奇三》。

## 未覆盖与风险

- MiniDNF 的真实 Unity 编译和安卓 APK/实机；扫地命中与浮空/扫地保护实测。
- 86JP 模拟器与任一 Unity 客户端通信协议兼容性。
- 原作者明确授权的完整客户端+服务端商业发行许可；本轮上游 GitHub license 元数据为 null。
- `DBSkillDamageTable.prefab` 因为二进制/文本接口限制未解码；Excel 参数与实际 Prefab 运行时一致性未核实。
- 下载的 Excel 放在临时目录，不是长期数据仓库；关键信息已提取并入文档。

## 下一步

1. 复核当前仓库 `AGENTS.md`、本交接及已有报告，确认没有同名文件冲突。
2. 深入检查 MiniDNF `ActorBase`、`SkillAttack`、`ObjectCollider` 相关身高/地面攻击命中边界，并优先找可运行但不含原版版权资源的最小复现方式。
3. 确定原创 Android 原型的触摸摇杆、技能键、动作时序、保护策略；先写设计和测试，不擅自拼接两边服务端。
4. 每轮将新证据、上游 commit 和未覆盖项更新到仓库。失败保留失败记录，不刷通过。

## 2026-10-11 本轮追加交接：扫地与浮空边界（静态审计）

- **本轮开始时 dnfku HEAD**：`1d5e3efd83d7e101d6b58e8891670867831ad429`（`main`），先读取了 `AGENTS.md`、`README.md`、本交接以及三个已有研究报告，未发现同名目标冲突。
- **上游最新 HEAD 与固定审计版本核实一致（通过，静态检查）**：
  - MiniDNF `v-star0719/U3D_MiniDNF` `master`：`543839751adbe09eecc896da949945080782b45e`。
  - Unity-DNF `Oceanisher/Unity-DNF` `master`：`4436c7212a6e3ed2cb389b2c0c4fa5b6211f79e6`。
  - 86JP `bigsmallliao/86JP-DNFServerS4A12` `main`：`4e2f25e04f604b7081cc42eb0f4d8c9a20a8ed05`。
- **新发现，均为通过（静态检查），不代表 Unity 游戏已运行**：
  1. `ActorBase.ChangeStatus(BeAttackedLieOnGround)` 用 `SkillAttack.GetDamageDuration(damageConf)` 设躺地时间；该值为 `startTime+interval*(times-1)`，与单独扫地保护阈值不是同一回事。
  2. `SkillAttack.IsInAttackRange` 的技能伤害盒使用 `actorConf.size` 及角色逻辑位置，而 `ObjectCollider.realPos` 的物理碰撞盒含独立中心偏移；`isLieDown` 会改变角色原点位置，已读代码未为倒地重设专门的扁平伤害盒。
  3. 技能伤害盒中心取 `realPos`，敌方盒中心取 `realLocalPos`，存在父层级非零变换时的坐标空间混用风险，但尚未复现 bug。
  4. `HitMoveFreezeInAir` 对空中受击只清空 `hitMoveSpeed`，该分支未显式重置 `curFallSpeed`；解除冻结后 `BeAttackedFallOff` 继续基于当前垂直速度积分。普通 `HitMove` 可重新设置位移速度，但不证明有完整连击保护。
- **证据与文件**：详情、精确固定 commit 上游源码行链接和检查矩阵写入 [combat-mechanics-20261011.md](combat-mechanics-20261011.md)，研究文档提交 `158e3938f14aa95927a7c6cc4aab2c3f3b0ab04a`（[GitHub commit](https://github.com/lgf921375/dnfku/commit/158e3938f14aa95927a7c6cc4aab2c3f3b0ab04a)）。本交接提交后的最新 HEAD 请以 GitHub `main` 实际 SHA 为准。
- **失败**：没有执行功能运行测试，故本轮没有可核实的运行测试失败记录；没有把静态可疑点标记为失败。
- **未覆盖**：扫地命中实测、浮空冻结后真实轨迹、保护累计/强制起身/无敌时间、场景父层级引起的错位实测、Prefab 生效一致性、Unity 编译、Android APK/实机、联网协议和版权授权。
- **下一步（不自动部署）**：先建立无 DNF 原版资源的最小隔离测试：分别记录落地时间、两种命中盒、零/非零父节点偏移、冻结前后垂直速度和重复受击时的状态；按“通过/失败/未覆盖”分别存证，然后才讨论原创安卓摇杆和技能控制设计。不得拼接未验证的客户端/服务端。
- **隔离约束**：本轮只读获取上游 C# 并更新 `dnfku` 的两份文档。未改写或部署《皓石传奇三》，不触及其单套服务、原手机40C数据、600ms冷却或原怪物规则。

## 2026-10-11 第二批增量交接：Unity-DNF 命中顿帧

- **证据**：复核 `Oceanisher/Unity-DNF` 固定 commit `4436c7212a6e3ed2cb389b2c0c4fa5b6211f79e6` 的 `ActionUnit.cs`、`DisplacementUnit.cs`、`FightUnit.cs`、`ActionData.cs`、`TimeUtil.cs` 和鬼剑士普攻 `Hit_1ActionSo.asset` / `Hit_2ActionSo.asset`；与上游 `master` 当前 HEAD 一致。精确行号见 [combat-mechanics-20261011.md](combat-mechanics-20261011.md) 新增“续研二”。
- **通过（静态检查）**：主动攻击命中后，`OnFightActive` 校验有伤害、当前动作帧匹配且同帧未顿帧过才启动冻结；时间由动作帧 `frameFreezeInfo` 管理，以毫秒计；冻结期间 `DisplacementUnit` 暂停位移计算并使 `Rigidbody2D.velocity` 清零。鬼剑士普攻1、2的资源输入配置包含 `time: 200` 毫秒，**不能当作运行中已实测的打击停顿时长或官方 DNF 参数**。
- **通过（静态检查）/未覆盖边界**：`OnFightPassive` 在受到有效伤害时切换受击动作，源代码 TODO 明确写着受击方顿帧还要加；因此不宣称双边 hitstop 已完成。战斗伤害仍有固定 `10f` 的演示实现。
- **失败**：本轮没有执行运行测试，无真实失败记录。
- **未覆盖**：Unity 真正触发 hitstop 的频率、双方是否同时停顿、帧率差异、受击方停顿时机、连击保护与真实 Android 运行。
- **下一步**：独立逐帧对比普攻1/2的 `frameFreezeInfo` 配置、实际 `OnFreezeProcess` 状态、时间累计与碰撞触发，并和 MiniDNF 的落地/扫地轨迹分别验证；不直接拷贝第三方素材/代码。
- **GitHub 研究报告提交**：`049eb5d116de9c67416bd5ace126530be4660163`（[查看提交](https://github.com/lgf921375/dnfku/commit/049eb5d116de9c67416bd5ace126530be4660163)）；本交接写入后的最新提交 SHA 以 `main` HEAD 为准。仅修改本仓库研究文档，未部署、重启或更改《皓石传奇三》。

## 2026-10-11 第三批交接：原创隔离战斗逻辑已执行 V8 测试

### 开始状态及范围
- 本轮先读取 `AGENTS.md`、`README.md`、本交接与 `docs/combat-mechanics-20261011.md`；开始时 `dnfku/main` HEAD 为 `314b1b6b24436cc4c91cc4a0295efb6969c9fdd9`。
- 研究继续参考既有固定上游审计 SHA：MiniDNF `543839751adbe09eecc896da949945080782b45e`、Unity-DNF `4436c7212a6e3ed2cb389b2c0c4fa5b6211f79e6`、86JP `4e2f25e04f604b7081cc42eb0f4d8c9a20a8ed05`；本轮没有运行或改写上游项目。
- 新增纯原创 JS 战斗模型 [combat-core.mjs](../prototype/combat-core.mjs)、[combat-core.test.mjs](../tests/combat-core.test.mjs)、单文件交互页面 [standalone.html](../prototype/standalone.html)、[隔离实验报告](isolated-combat-test-20261011.md)，并更新 `README.md` 导航。

### 实际测试结论（严格区分对象）
- **通过（独立原创模型 V8 运行测试）**：在隔离 V8 环境直接运行与入库代码同源的 `runSuite(CombatArena, SETTINGS)`；总计 **16 PASS / 0 FAIL**。覆盖上挑浮空和触地、落地后低位扫地、倒地计时刷新、空中/地面命中次数保护、达到阈值立即起身及临时无敌、AABB 射程失败、坐标整体平移、外部 30/60/120Hz 驱动在 0.5s 的一致性，以及无效时间输入等。完整测试条目和设计阈值见隔离实验报告。
- **新发现（仅限原创测试模型）**：独立“站立/浮空/倒地”命中规则及固定步长可重现扫地与强制起身路径；这些实验是为未来 Android 手感研究构建**验证工具**，不是 MiniDNF、Unity-DNF 或官方 DNF 的运行验收。
- **失败**：上述 16 项 V8 测试没有失败；没有 Node CLI 或浏览器测试结果，不能标记它们“通过”或“失败”。
- **未覆盖**：提交后的 `node --test tests/combat-core.test.mjs` 实际运行、`standalone.html` 在浏览器/Android 上的操作，原版 DNF 保护阈值、攻击动画/碰撞视觉对齐、触摸输入、官方游戏落地手感、上游 Unity 编译与真实场景、hitstop 双边效果、联机和商业许可。
- **实验参数均为原创设计值**：重力22、上挑速度10.5、空追5.5、倒地0.9s、空中4次/扫地3次触发保护、保护无敌0.6s、1/120s内部模拟步长；不得说成官方 DNF 数值。浏览器 UI 尚未验收，不将其称为通过。

### 提交与接下来任务
- 实验核心提交 `7a3bc6e312a46632d211945e6a3fa4c714d6be67`。
- 自动测试提交 `e37aed71b573ce45900d171f6838e99cb13f454b`。
- 单文件演示页面提交 `4d41befcbde505f40ec63faea5c2166244f24419`。
- 测试报告提交 `2609fe619a5a14d28aadcb4739e641f5ac4e983a`。
- README 入口提交 `6eaf00d7b553c857c04ee99ded86df2d3859ed05`。
- 本次交接提交后的 GitHub `main` HEAD 由 GitHub 实时读取确定，切勿硬猜最终 SHA。
- **优先下一步**：在隔离 Node 环境实际跑 `node --test tests/combat-core.test.mjs`，保存原始运行日志及退出码；然后人工打开无版权素材的独立 HTML，实测 PC/Android 触控、轨迹、保护强制起身效果并录屏。增加“达到总阈值7”与“帧时间极值”等回归覆盖。真正的 Android APK/Unity 打击感只有运行验收后才能标为通过。
- **隔离约束**：仅修改 `lgf921375/dnfku` 自有文件；**没有**改写、部署、重启《皓石传奇三》，其单套服务、手机40C账号、600ms冷却和原怪物规则均未触碰。无版权原版 DNF 素材。

## 2026-10-11 第四批交接：Node + Chromium 实测、重复扫地缺陷修复、自动演示

### 范围与证据

- 本轮开始先从已连接 GitHub 读取 `AGENTS.md`、`README.md`、本交接、既有隔离实验报告以及 `prototype/combat-core.mjs`、`tests/combat-core.test.mjs`、`prototype/standalone.html`。开始时 `dnfku/main` HEAD=`4ebe93b7457a4f6d4121c5a19feb0d1d561758f1`。沿用此前 MiniDNF `543839751adbe09eecc896da949945080782b45e`、Unity-DNF `4436c7212a6e3ed2cb389b2c0c4fa5b6211f79e6`、86JP `4e2f25e04f604b7081cc42eb0f4d8c9a20a8ed05` 静态来源；本轮并未运行这三个上游游戏。
- 原仓库核心和 Node 测试文件已在隔离容器按 Git Blob SHA **精确复原**：`7349f0fefa71232d24a082cdcbf51df2fa88ebed`、`e059895cf235b8b95e130f587ef92c8b7022adb5`；基线 Node v22.16.0 执行 `node --test tests/combat-core.test.mjs` **16/16 PASS、exit 0**。原始 HTML 也按 Git Blob SHA `0232b65717c7c84e3b6fbfaadfd3b624119f49ef` 精确复原并在 Chromium 实际执行。
- **失败（旧版原创模型，已复现）**：同一模拟帧连续触发扫地即可三次命中并立刻保护起身，说明旧 `CombatArena.hit()` 无最小有效命中间隔；不能据此说官方 DNF 或任何上游项目失败。
- **修复及新发现（原创模型）**：设置 `minHitIntervalSeconds=0.09`（原创测试值），新增 `lastHitTime` 节奏闸门。攻击状态有效且 AABB 命中后，间隔过短返回 `hit-cadence`，不加命中计数也不刷新倒地时长；达到空中/扫地保护阈值后仍立即强制起身，保护无敌优先。
- **通过（实际独立 Node 回归测试）**：最新版 **23/23 PASS、exit 0**，其中新增 7 项：同帧扫地拒绝、正常节奏连续扫地保护、独立总命中保护阈值、连击过窗清零、射程不命中、被节奏拒绝后不刷新倒地、无敌优先。详见 [隔离实验报告](isolated-combat-test-20261011.md) 追加章节。
- **通过（实际 Chromium 无头浏览器模拟触控）**：390×844 移动视口、合成 `pointerdown`，Playwright 执行 `python tests/browser-smoke.py`，**11/11 PASS、exit 0、无 JavaScript 页面错误**；包括自动演示 `上挑→空追→落地→三次间隔扫地→保护起身`、按钮触发、参数调节、同帧重复拒绝、无敌禁止上挑。Python 脚本需预装 Playwright 与 Chromium；本轮无安装依赖、无外部服务。由于环境限制通过 `page.set_content` 加载 HTML，并非通过 Android 手机上的浏览器。
- **未覆盖**：真实 Android 手机上的手指触控、30/60Hz 真实画面和打击感、正式客户端 APK、角色动画/判定盒边界与击中停顿双边同步、联网战斗、上游 Unity 编译、原版 DNF 真实数值及版权授权。不能把 Chromium 模拟移动视口当作 Android 真机实测。

### 最新文件与提交

- [原创战斗核心](../prototype/combat-core.mjs)，提交 `46d689fa91f913ac08c16d567129dc03fff8eb39`，blob `8b70ef908a5687392bce104604d029f077531604`。
- [23 项 Node 自动测试](../tests/combat-core.test.mjs)，提交 `9f198c49ff7735d91e3e4c060af9b929e3423d50`，blob `79ab19676eea992acd44e5e72862e0759d0b039b`。
- [新版单文件 HTML](../prototype/standalone.html)，自动连招与调参提交 `eb7d871bf929f569b9a59b20940449498b7a712f`、同步命中间隔提交 `383a1c262d4ba750eec92623d34d6fe5f042f6ad`，最终 blob `1b4dee8bf72b2c631deeed22965d33b55e28d10f`。
- [浏览器回归脚本](../tests/browser-smoke.py)，提交 `a78f9376183e8a476fd5e393f08531bc4a6e9915`，blob `91483f222f2e1faa592e9f953f99c8697932021c`。
- [增量实测报告](isolated-combat-test-20261011.md) 提交 `5551069cea663bf429304545e629aaad48d3da58`；README 导航更新提交 `07c7828ab928349f548f0f872ef8d6e4455c69e1`。
- **本交接提交后的最新 HEAD**：以最终 GitHub `main` 实际 SHA 为准，勿提前捏造。

### 下轮任务

1. 请用户实际在 Android 手机浏览器下载并打开 `prototype/standalone.html`，对上挑滞空、扫地连击、命中节奏、强制起身体验录屏；在获得真实反馈前仅称“待人工实测”。
2. 隔离原型进一步研究动作起手/有效帧/后摇、双边 hitstop、落地动画和贴地扫地判定，可设计不同命中节奏与攻击碰撞帧；先在原型逐项测试，再评估 Unity/Android 迁移。当前未实现或验证这些高级效果。
3. 如继续开发，保持上游源码/版权与原创实验区分；按“通过（静态核查）/通过（明确限定的独立运行测试）/失败/未覆盖”存证。不得修改、部署、重启《皓石传奇三》或触动单套服务、40C、600ms 冷却、原怪物规则。

## 2026-10-11 第五批交接：V3 命中顿帧 + 可选落地反弹，真实 Node/Chromium 回归

### 起点、上游与授权约束

- 开始时 `dnfku/main` HEAD：`0bca660fdd7230812fdfe0272556cd28b44f9028`。按 `AGENTS.md` 先读取仓库 `AGENTS.md`、`README.md`、本交接、`docs/isolated-combat-test-20261011.md` 和当前核心/HTML/测试文件。未触碰其他游戏或正式服务。
- 再次从已连接 GitHub 复核上游分支 HEAD，均与既有研究一致：MiniDNF `543839751adbe09eecc896da949945080782b45e`、Unity-DNF `4436c7212a6e3ed2cb389b2c0c4fa5b6211f79e6`、86JP `4e2f25e04f604b7081cc42eb0f4d8c9a20a8ed05`。本轮不改/不运行这三份上游游戏项目，未得商业许可。
- Git Blob 验证本地恢复的**上一版**三个文件与 GitHub 一致：核心 `8b70ef908a5687392bce104604d029f077531604`、23项 Node 测试 `79ab19676eea992acd44e5e72862e0759d0b039b`、HTML `1b4dee8bf72b2c631deeed22965d33b55e28d10f`。基线 Node 实测 **23/23 PASS，退出码0**。

### 本次原创开发（并非官方 DNF 参数）

1. `prototype/combat-core.mjs` 新增 `hitstopSeconds=0.04`（默认40毫秒）：有效命中后按固定 `1/120s` 内部时钟冻结目标物理位移、重力和倒地计时，事件时钟持续前进；被拒绝命中不得延长顿帧；保护强制起身立即清空余下顿帧。**尚未实现攻击者和受击者的双边动作停顿**。
2. 同一文件新增可选 `groundBounceVelocity=0`（默认关闭）及 `groundBounceCount=1`，允许实验性一次低幅触地反弹。首次碰地保持浮空、发 `ground-bounce` 事件；第二次碰地才变成 `down`，反弹时不能提前扫地。
3. `prototype/standalone.html` 内联最新核心，并提供 `命中停顿`、`触地反弹初速` 两个滑块、剩余顿帧显示、触地反弹事件日志；原自动演示和攻击按钮保留。全部仅是原创实验设计值。

### 实际执行（精确限定通过范围）

- **通过（真实 Node v22.16.0 隔离测试）**：`node --test tests/*.test.mjs`，原23项 + 新增10项，**33/33 PASS，退出码0**。新增项验证：顿帧冻结物理、可关闭顿帧、被拒绝攻击不延长冻结、可选一次弹起、反弹阶段扫地无效、默认无反弹、反弹后扫地有效、扫地后冻结倒地倒计时、保护时清理反弹/顿帧、外部30/60/120Hz驱动的确定性。
- **通过（真实 Chromium 无头浏览器内的模拟输入测试）**：`python tests/browser-smoke.py`；390×844模拟手机视口，使用 Playwright 触发 HTML 事件，共 **17/17 PASS，退出码0，页面 JS 异常0**。额外验证滑块读数、命中顿帧读数、反弹事件、反弹最终倒地及之后扫地；不是 Android 手机硬件/真实手指实测。
- **通过（可重复的原创物理样本）**：在内部步长1/120s、上挑初速10.5、重力22条件下：关闭顿帧+反弹时落地0.9500s；默认40ms顿帧/无反弹时落地0.9917s；再启用反弹初速2、次数1时落地1.1667s（首次反弹约0.9917s）；三组最高点均为2.4721世界单位。仅解释**原创模型**下的改变，不能据此宣称已达到官方 DNF 手感。
- **失败**：本轮实际执行的最新版测试没有失败。历史旧版“同帧重复扫地刷保护”的失败案例仍保留在早期报告中；不能因修复而改写历史状态。
- **未覆盖**：Android 实机下载/触屏/帧率、Unity APK 编译与动画/碰撞盒实测、真实手感与 DNF 对标、角色双边 hitstop、前摇/有效帧/后摇、输入缓存、多人联机、防作弊、素材许可证。

### 研究与代码提交（已与本地运行版本 Blob 对账）

- `prototype/combat-core.mjs`：commit `63e5abf3e77c1e0f4eed4dd0862c639719d890c7`；Blob `54e4df5e80089b8204d8656d5857c1eb064a0ff8`。
- 新增 `tests/combat-feel.test.mjs`：commit `57ead5d5f9bdf5eb50739698e28a2b2d28bb162c`；Blob `3551a8ac4267c5a803d26aff71b78356ca172390`。
- `prototype/standalone.html`：commit `bf72f8715871aa38de375096494782a1a1da9660`；Blob `99a9c1c4a4dada6dfba5b47fd6f32edc4c93f916`。
- `tests/browser-smoke.py`：commit `15f068d429b518dc7d42b0652a1e24da66d85ef1`；Blob `4e7d8547fd82bed1ae61c566ced59cfe27b47ee8`。
- 完整方法、轨迹及状态见 [docs/combat-feel-20261011.md](combat-feel-20261011.md)，commit `900863c4c5f988e9684a861fa0dc38552b94e9ec`。README 导航更新 `384afdcc95347239251c481ab87cad961b2f2d23`。
- 本次交接提交后的 **最终 HEAD 需从 GitHub `main` 复核**。

### 接下来

1. 用户在 Android 真实浏览器下载 V3 独立 HTML，实际触控、录屏报告击中停顿/落地/扫地时间、动作视觉与拖影错位；在得到录像证据前不能宣称 Android 体验通过。
2. 继续在独立原创原型增加“攻击前摇 → 有效命中帧 → 后摇”、按键缓冲、攻击者和受击者双边 hitstop（可关闭），逐项增加 Node/浏览器回归。
3. 若后续转 Unity/Android，先处理资源版权、动作原点和空间坐标统一，再做 APK 与手机验收，不将第三方客户端与86JP服务端直接拼接。
4. **《皓石传奇三》保持完全独立**：不触动其单套服务、40C账号/数据、600ms冷却、怪物规则；没有部署/重启/修改该项目。

## 2026-10-11 第六批交接：V4 攻击动作时间轴 / 输入缓冲 / 可选双边逻辑顿帧

### 研究起点
- 开始前已使用已连接的 GitHub 工具读取 `AGENTS.md`、`README.md`、本交接、`docs/combat-feel-20261011.md`、V3 核心及对应测试。任务开始 `dnfku/main` HEAD=`348d7fc24bcf39ce60cd3975b2580dae3771c076`。
- 继续参考上游固定审计版本：MiniDNF `543839751adbe09eecc896da949945080782b45e`、Unity-DNF `4436c7212a6e3ed2cb389b2c0c4fa5b6211f79e6`、86JP `4e2f25e04f604b7081cc42eb0f4d8c9a20a8ed05`。本轮**不编译、不复制、不运行这些第三方源码**。
- V3 稳定核心仍为 `prototype/combat-core.mjs`，旧测试保持不改；隔离测试环境 Node `v22.16.0`，Chromium Playwright 手机视口390×844。

### 本轮已实现（原创模型，且限定环境实测）
1. 新增 `prototype/combat-actions.mjs`，导出 `CombatActionController`：每个技能 `startup → active → recovery`，只在 `active` 开始进行一次命中判定。动作值均是**原创实验值**：上挑100/70/180ms、空追60/70/130ms、扫地70/60/160ms、高位斩90/60/180ms，非 DNF 官方参数。
2. 一位输入缓冲，默认200ms。后输入覆盖前输入，缓冲到后摇结束时未超时才消费；双边顿帧时动作时钟冻结，缓冲有效期同步暂停。既有命中间隔 `90ms`、浮空/地面保护及强制起身继续由 V3 `CombatArena` 管理。
3. `bilateralHitstop` 默认开启：目标模型原有命中停顿保持；攻击者动作时钟在同一段停顿内暂停；可切单边对照。**注意：这是双方逻辑时间停顿，不是 Unity 的两个实际角色动画/碰撞体冻结，真实游戏双边 hitstop 仍未覆盖。**

### 真实测试证据与纠错
- **通过（Node.js 隔离运行测试）**：`node --test tests/*.test.mjs` **48 PASS、0 FAIL、exit 0**。新增 `tests/combat-actions.test.mjs` 的15项检测：前摇无即时伤害、动作有效入口恰好一次命中、动作三阶段顺序、后摇消费/覆盖/过期缓冲、拒绝输入、双边/单边顿帧对照、被挡的命中不触发攻击者停顿、30/60/120Hz外部时间推进一致性、目标站立扫地无效、排队动作只命中一次等；原 V3 的33项全部回归。
- **通过（隔离 Chromium 浏览器模拟触控）**：本轮自建 V4 `action-lab.html` 单文件，在浏览器中嵌入与提交模块一致的原创代码，Playwright 390×844 触控模拟环境 `tests/action-lab-smoke.py` **12 PASS、0 FAIL、exit 0、pageerror=[]**。界面可操作四种攻击，显示动作阶段、缓冲事件、自动连招/保护和调节参数。
- **测试脚本历史问题**：浏览器首次断言紧贴指针事件、尚未等待渲染而失败，后加25ms等待后通过；随后 `Locator.fill('0.20')` 范围控件格式不兼容引发工具异常，改为 `0.2` 后通过。它们是**测试脚本时序/格式错误**，不证明战斗逻辑失败。保留历史失败/修订记录。
- **文件持久化边界**：新 V4 代码和 Node 测试已写入并从 GitHub 回读核对 Blob SHA：控制器 `d6d07319278c9ec46555115059c3967cefc5e277`（提交 `564de4bbbc2967464036897ddd2e22d59c2385f3`）；动作测试 `7ff7f5009f7e64bdac4de317b54fd52d02e16174`（提交 `270d4d19a5731dd30eea978dd716eed944e26bac`）。
- **V4 页面目前仅为对话中的可下载产物**，本轮未把 HTML 和 Playwright V4 脚本上传 GitHub；仓库里的 `prototype/standalone.html` 仍是 V3，不得称 GitHub 已保存 V4 网页。V4 单文件当前本地校验 Blob：`2e874dcc554fd8257d99e882ea26521b4381a972`，不能从聊天链接推断未来 GitHub 可取。
- 详细说明、新发现和运行证据见 [docs/combat-actions-v4-20261011.md](combat-actions-v4-20261011.md)，报告提交 `8df6c2f8af32e6716ba4b66e20af7957d2cd6cae`；README 已同步 V4 导航，提交 `e7a176a39d9c0df905e1772f46a8abe847cebedb`。

### 验收范围与后续任务
- **通过**：原创 JS 动作层在本地 Node.js 48项自动回归与 Chromium 12项模拟浏览器验证；不把第三方 Unity 官方 DNF 或 Android 的未实测功能称为完成。
- **失败**：没有仍然失败的本轮 Node/浏览器战斗行为；历史 V2 同帧扫地刷保护缺陷和本轮测试脚本错误仍按来源保留。
- **未覆盖**：完整动画帧独立攻击盒、动作取消窗口、格挡/霸体/被打断规则、真正 Unity 双方动作冻结、Android 实机手指操作、手机30/60Hz效果、联网判定/安全协议、官方 DNF 参数与版权许可。
- **下一步**：优先把 V4 单文件页面及重现脚本完整持久化到 GitHub，再做逐帧攻击有效盒和攻击打断规则；人工 Android 录像与手感验收仍独立安排。保持原项目 `AGENTS.md` 约束，每一结论附测试类型和证据。
- **隔离声明**：没有修改、部署、重启《皓石传奇三》，不触及其单套服务、原手机40C数据、600ms冷却和怪物规则。本轮只新增 `dnfku` 原创实验文件与文档。
- 本段保存后的仓库 HEAD 由 GitHub `main` **最终回读核实**，不得提前猜 SHA。

## 2026-10-11 第七批交接：补齐 V4 页面 + V5 取消/霸体/打断（有真实自动化执行证据）

### 起始版本与本轮范围
- 开始时 GitHub `main` SHA=`e1e0a6bcf5cf7c9e13d5bba7b8fb8b9cadb97d4a`。已先从 GitHub 读 `AGENTS.md`、`README.md`、本交接、`docs/combat-actions-v4-20261011.md` 及 V4 实际源码/测试；随后复核三个上游最新 HEAD（均与固定版本一致）：MiniDNF `543839751adbe09eecc896da949945080782b45e`、Unity-DNF `4436c7212a6e3ed2cb389b2c0c4fa5b6211f79e6`、86JP `4e2f25e04f604b7081cc42eb0f4d8c9a20a8ed05`。
- 已将此前**只在对话中交付**的 V4 HTML [prototype/action-lab.html](../prototype/action-lab.html) 和 [tests/action-lab-smoke.py](../tests/action-lab-smoke.py) 原样提交 GitHub，Blob SHA `2e874dcc554fd8257d99e882ea26521b4381a972`、`e20e43336cd9e53f1d2bcd5c396cbe75b98192bc`，提交 SHA 分别为 `2a039a28fe173378559d268000206aa35a4db4bd` / `60b79b58c11c2d0b60af6ee426a5280cf2be9c36`。V4 浏览器脚本本轮复跑 **12/12 PASS**。
- 本轮仅建立原创 JS 战斗控制器扩展，不修改、运行、拼接第三方客户端和服务端源码，未使用官方 DNF 资源。

### 新研发与新发现：全部区分实际对象
1. [prototype/combat-interrupts.mjs](../prototype/combat-interrupts.mjs) 新增 `CombatInterruptController`，**原创实验策略**：后摇完成0.10s后根据白名单规则取消当前动作并接技能；默认上挑→空追、空追→上挑、扫地→上挑。提前输入依旧走 V4 缓冲。
2. “霸体”定义为**上挑有效段不允许普通动作打断，但强制打断有效**。此模块仅处理攻击者动作和事件记录，不处理真实玩家血量/减伤、格挡或敌人碰撞；不允许把“霸体逻辑测试通过”写成“DNF 怪物真实受击通过”。
3. 受击输入 `receiveHit({force})` 是外部**已验证受击事件的注入接口**，普通非霸体受击清除当前动作、按键缓冲和攻击者剩余逻辑顿帧；不是实际角色之间的命中事件生成，也不是联网攻防。
4. **失败（修复前可复现）**：取消开关设为 false 时，`canCancelInto` 已按规则拒绝，但 `snapshot().cancelReady` 在后摇时仍可能为 true。已记录隔离 Node 复现值：`phase=recovery`、`elapsed≈0.11667s`、`cancelEnabled=false`、`canCancelInto=false`、`snapshotCancelReady=true`。**修复**：快照增加取消开关、时间阈值和至少一个合法目标条件；测试63–65验证三种边界。
5. [prototype/action-lab-v5.html](../prototype/action-lab-v5.html) 是已入库单文件原创交互场景，包括“模拟受击”“强制打断”、取消/霸体开关、原 V4 自动连招及原有状态显示。与实际测试文件 SHA 一致。它可用普通浏览器离线打开，但真人 Android 设备未验收。

### 本轮实际回归
- Node.js `v22.16.0`：`node --test tests/*.test.mjs` **65 PASS / 0 FAIL / exit 0**（旧版48项 + 新增 `tests/combat-interrupts.test.mjs` 17项）。
- Playwright + Chromium 无头，390×844 合成触摸 `pointerdown`：`python tests/action-lab-smoke.py` V4 基线 **12/12 PASS**；`python tests/action-lab-v5-smoke.py` V5 **12/12 PASS**、0个浏览器 JavaScript 页面异常。
- V5 浏览器脚本曾在受击事件后立即读取尚未刷新的 `#phase` 导致一次**测试脚本断言失败**，修复为等待下一次 UI 渲染后重新执行12/12 PASS。归因限定为脚本时序；仍保留历史失败，而非宣传初始就全部通过。
- **V5 最终 Git Blob 与本地实际运行文件完全一致**：核心扩展 `249b67f78efab2ece46c5ce1d44a368298dfb48a`；17项 Node 测试 `d0540d7adb60debd36ffce317b972f82d2bcea02`；V5 单文件 HTML `a6070ce6107e44d0958e19cc7adb74d5b97bc610`；V5 Chromium 脚本 `3a781356876c089bf92ba47b812e6ad73cda17b4`。
- 详细功能、实际执行结果与纠错见 [docs/combat-actions-v5-20261011.md](combat-actions-v5-20261011.md)（提交 `405ffad2fbd9d02f44e46afabc79b03ccda15db9`），README 导航更新提交 `9895b321b05b80fc6962326b6ee372ce91f86fe5`。本交接最终提交后的 main SHA 务必从 GitHub 核对，不从本交接推测。

### 明确分类与后续
- **通过（原创隔离真实 Node/Chromium 运行测试）**：65项 JS 自动测试及 V4/V5 两份各12项浏览器模拟按钮检查。范围严格限定为简化状态机和 DOM 事件。
- **失败且已修复**：旧 V2 同一时刻反复扫地刷保护；V5 `cancelReady` 误报；V4/V5 浏览器测试脚本曾有错误的异步断言/参数格式。历史失败记录在各自报告内，不能删除。
- **未覆盖**：二角色独立 hitbox / 攻击帧宽时间窗、真实扣血与格挡/霸体减伤、被击中的玩家真正进入受击状态、Android 手机手指操作录像与30/60Hz效果、Unity编译、联网服务端协议/账号/安全性、官方 DNF 保护机制与资产版权。
- **下轮研发优先**：将两角色攻击事件与受击/霸体动作规则接通（仍为无版权独立测试）；再加入不同攻击帧判定范围及格挡和真实伤害的隔离单元测试。Android 真人触屏后才评估视觉打击感和打断手感。
- **安全隔离**：本轮没有修改、部署、重启《皓石传奇三》，未碰其40C、单套服务、600ms冷却及怪物规则；没有触动其他游戏项目。
