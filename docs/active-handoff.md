# dnfku 当前研究交接

时间：2026-10-11。阶段：公开 GitHub 源码的静态审计，未启动游戏。

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
