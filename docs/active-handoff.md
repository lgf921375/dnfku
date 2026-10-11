# dnfku 当前研究交接

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
