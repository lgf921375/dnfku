# dnfku 当前研究交接

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
