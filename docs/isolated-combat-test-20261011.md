# 原创独立战斗实验与测试记录（2026-10-11）

> 审计边界：此实验是 `dnfku` 中新增的原创 JavaScript 纯逻辑模型，**不是** MiniDNF、Unity-DNF、官方 DNF 游戏或已发布 Android 版本。无任何 DNF 原版图像、音效、代码拷贝或联机服务。所有参数均属于**实验设计值**，不是官方数值。

## 本轮可复核对象

- [prototype/combat-core.mjs](../prototype/combat-core.mjs)：`CombatArena`，纯 JavaScript 状态机、固定步长重力积分、攻防 AABB 判断、空中连击/落地扫地计数、保护触发及强制起身。
- [tests/combat-core.test.mjs](../tests/combat-core.test.mjs)：16 项自动测试；可在支持 ESM 与 `node:test` 的 Node.js 环境执行：`node --test tests/combat-core.test.mjs`。
- [prototype/standalone.html](../prototype/standalone.html)：由同一份 combat-core 源码内联生成的单文件可视化试验页（方块/圆形原创几何图形）；控制为“上挑、空追、扫地、高位斩、重置、暂停”。**网页/手机实际交互尚未验收**。
- 所有新增文件为原创实验源文件，并未编译成 Android APK，也未修改上游 Unity 工程。

## 规则与量纲（**本实验自行设定**）

| 属性 | 实验值 | 目的 |
|---|---:|---|
| 重力加速度绝对值 | 22 世界单位/秒² | 测试抛物线浮空和落地 |
| 上挑 Y 初速 | 10.5 世界单位/秒 | 观察最高点及着地时序 |
| 空中追加攻击 Y 速度 | 5.5 世界单位/秒 | 验证追加攻击重置纵速 |
| 自然倒地持续时间 | 0.9 秒 | 测试扫地命中与倒地时间刷新 |
| 空中累计命中保护阈值 | 4 次 | 达到时进入保护起身 |
| 落地扫地累计命中阈值 | 3 次 | 达到时进入保护起身 |
| 连击累计命中总阈值 | 7 次 | 独立兜底阈值，具体触发需补充测试 |
| 保护起身后的无敌时间 | 0.6 秒 | 无敌期间禁止受击 |
| 连击间隔窗口 | 1.6 秒 | 过窗后在合适状态清计数 |
| 数值模拟内部步长 | 1/120 秒 | 测试 30/60/120Hz 外部驱动的一致性 |

这些数值是原型的临时设计，不应误传为研究所得的 DNF 源码/官方阈值。静态 HTML 中的几何图形仅用于观察状态迁移，不构成打击手感评估。

## 实际执行结果

- **真实执行环境**：连接工具内的 V8 JavaScript 隔离运行环境。直接实例化与 GitHub 上传时使用的同一份 `CombatArena` 和 `runSuite` 逻辑，并执行 `runSuite(CombatArena, SETTINGS)`。
- **结果**：16 项 **PASS**，0 项 **FAIL**。这是**独立模型自动测试通过**，不是 Unity/Android/官方 DNF 实测通过。
- **Node CLI 状态**：本轮**未执行** `node --test` 的提交后复跑，上传的自动测试脚本适配 Node ESM 但环境验收仍为**未覆盖**。V8 测试输出不会自动构成 Node 通过证明。
- **HTML/触屏状态**：生成并提交页面，未运行真实浏览器/Android 触屏，**未覆盖**。

| # | 自动化实际检查项目 | 本轮 V8 执行 |
|---|---|---|
| 01 | 站立上挑进入浮空且初速为正 | PASS |
| 02 | 抛物线浮空后触地、不穿地；最高点处于实验预期区间 | PASS |
| 03 | 站立目标不被扫地攻击命中、不产生错误连击 | PASS |
| 04 | 倒地目标不被高位斩直接命中 | PASS |
| 05 | 落地扫地有效、刷新倒地计时 | PASS |
| 06 | 第 3 次扫地后立即保护起身 | PASS |
| 07 | 保护期间阻止攻击、无敌结束后重新允许上挑 | PASS |
| 08 | 第 4 次浮空命中后立即保护起身 | PASS |
| 09 | 空中追击显式重设垂直速度 | PASS |
| 10 | 超出 AABB 距离不命中、不累计连击 | PASS |
| 11 | 一致世界坐标平移后，命中与轨迹结果一致 | PASS |
| 12 | 倒地计时结束后自然起身 | PASS |
| 13 | 外部 30/60/120Hz 驱动，在 0.5s 处数值一致 | PASS |
| 14 | 孤立高位攻击超过连击窗口后计数清零 | PASS |
| 15 | 拒绝非法和非有限时间参数 | PASS |
| 16 | 一次保护仅产生一次强制起身、一次保护结束事件 | PASS |

**新发现（针对原创模型；已执行测试）**：

1. 固定 `1/120s` 的内部物理步长，在本模型 0.5 秒采样点可使外部 30/60/120Hz 步进得到一致位置和纵速；**不等于实际手机 30/60/120Hz 帧率体验已通过**。
2. 为倒地目标使用独立的低位 AABB，能在本模型中区分“倒地扫地成功”与“高位挥砍失败”；**不代表 MiniDNF 的视觉/物理碰撞错位已得到修复**。
3. 达到实验阈值后，模型能够强制取消倒地/浮空并进入临时无敌状态，有明确的事件记录；**不表示上游 DNF 项目已有此机制**。

## 与上游研究的关系

- MiniDNF 的伤害检测逻辑依旧以本仓库既有的固定上游 SHA `543839751adbe09eecc896da949945080782b45e` 为参照：[SkillAttack.cs](https://github.com/v-star0719/U3D_MiniDNF/blob/543839751adbe09eecc896da949945080782b45e/Project/Assets/Scripts/SkillAttack.cs#L206-L255)、[ActorBase.cs](https://github.com/v-star0719/U3D_MiniDNF/blob/543839751adbe09eecc896da949945080782b45e/Project/Assets/Scripts/ActorBase.cs#L397-L431)。此原型**并非上述 C# 的逐行移植或运行验证**。
- Unity-DNF 的 200ms 配置来源为固定 SHA `4436c7212a6e3ed2cb389b2c0c4fa5b6211f79e6` 的 [Hit_1ActionSo.asset](https://github.com/Oceanisher/Unity-DNF/blob/4436c7212a6e3ed2cb389b2c0c4fa5b6211f79e6/Assets/Resources/Config/Object/Character/GhostKnight/Action/Hit_1ActionSo.asset#L30-L35)；**本实验未移植或实测该 hitstop 值**。
- 服务端 86JP 与客户端协议兼容性未核实；不连接、不拼接服务端。

## 未覆盖、已知局限与后续验收

- **失败**：V8 执行的 16 项测试中没有失败；没有运行 Node CLI/浏览器/安卓，所以不存在它们“测试失败”的结论。
- **未覆盖**：Node `--test` 提交后复跑、独立 HTML 的真实浏览器/触屏、30/60Hz 真实设备、UI 输入缓冲、完整伤害系统、角色/敌人多目标击退、连击总数阈值单独触发、两种保护同时达到阈值的优先级、交错事件计时、攻击者/受击者双方 hitstop、扫地保护手感与 DNF 行为对标。
- **需审视的设计问题**：目前固定测试阈值并非原版，落地 0.9s/起身无敌 0.6s 的体验需由实机视频对比调参；在实际合并原型前，还应定义统一时钟、输入缓冲、击中停顿、受击敌人碰撞盒和保护触发的状态优先级。
- **下一步 1**：在隔离 Node 环境复跑 `node --test tests/combat-core.test.mjs`，保存运行版本、退出码和原始日志。
- **下一步 2**：使用普通浏览器/Android 浏览器打开独立试验页，录屏验收四按钮触控、浮空高度、倒地视觉对齐、保护强制起身；任何实际问题记为**失败**并留证。
- **下一步 3**：再做参数扫描与体验调优，先出方案与录像，不在证据不足时宣布达到官方 DNF 打击感。

**隔离约束**：仅新增 `dnfku` 的独立原创实验与研究文档，不修改、部署、重启《皓石传奇三》，不触碰原手机 40C 数据、600ms 冷却或怪物规则。

---

## 2026-10-11 后续实测：Node CLI、Chromium 与扫地重复命中修复

> **本节是原 16 项记录的追加验收，不回写或抹除历史证据。测试对象是本仓库原创隔离模型，不是 MiniDNF/Unity-DNF 正式运行，也不是 Android 设备实测。**

### 一、提交前基线回归：通过（隔离 Node 运行测试）

- 在独立容器内恢复本仓库固定 commit `4ebe93b7457a4f6d4121c5a19feb0d1d561758f1` 时的 `prototype/combat-core.mjs` 和 `tests/combat-core.test.mjs`。以 Git Blob SHA 分别核对得到 `7349f0fefa71232d24a082cdcbf51df2fa88ebed`、`e059895cf235b8b95e130f587ef92c8b7022adb5`，与 GitHub 返回值完全一致，排除了“重建测试代码与仓库不一致”的疑点。
- 实际命令：`node --test tests/combat-core.test.mjs`，Node `v22.16.0`，进程退出码 `0`，原先 **16 PASS / 0 FAIL**。这项 Node CLI 原来在交接中是“未覆盖”，本轮终于取得运行证据。

### 二、旧版实际发现的问题：失败（旧版模型）

- 在 Chromium 无头浏览器（窄屏 410px）中执行了旧版单文件 HTML 的 DOM 和 `pointerdown` 事件。上挑约 `0.1s`、落地约 `1.05s`；同一模拟时刻连续分发三次 `groundSweep`，日志里约 `1.17–1.18s` 连续出现三次命中，立即触发 `ground-limit` 强制起身。这**不是**希望的有攻击节奏的真实扫地连击。
- **原因（静态 + 浏览器实测交叉确认）**：旧版 `CombatArena.hit()` 允许同一个模拟时间点反复通过状态/AABB 判定并增长保护次数，没有最小有效命中间隔。旧版 16 项测试未覆盖同帧重复事件。
- 限定语：将旧版重复攻击缺陷标为“失败（旧版原创模型）”，**不是**宣称 MiniDNF、Unity-DNF、官方 DNF 的扫地功能失败。

### 三、修复与新测试：通过（独立模型实测）

**修复内容**：

1. 在 `SETTINGS` 新增 `minHitIntervalSeconds=0.09`；`CombatArena` 保存 `lastHitTime`。在状态合法、AABB 命中后，如果距离上一次有效伤害不足 0.09 秒，返回 `blocked / hit-cadence`，不增加连击计数、不刷新倒地时间。无敌检查仍先于节奏检查，因此保护期间不能靠重复请求伤害绕过无敌。
2. 修改原来的重复扫地测试，在至少 `0.11s` 的间隔内触发；新增 7 项回归，包含同瞬间重复拒绝、按节奏扫地后保护、独立总数保护、连击窗口过期、扫地距离未命中、拒绝攻击不刷新躺地计时、保护与命中节奏的优先级。
3. 交互 HTML 增加“自动演示：浮空 → 扫地 → 保护”按钮，及上挑初速、重力、倒地时间的可调输入；将新源码嵌入 HTML，与 `combat-core.mjs` 同步。

**实际测试**：

| 实际执行项 | 环境 | 结果 |
|---|---|---|
| `node --test tests/combat-core.test.mjs` | Node v22.16.0，隔离容器 | **23/23 PASS，退出码 0** |
| `python tests/browser-smoke.py` | Python Playwright + 系统 Chromium，无头，390×844 模拟移动视口、`has_touch` 和人工合成的 `pointerdown` | **11/11 PASS，退出码 0** |
| 自动演示日志顺序 | 同一 Chromium 实际运行 | `airTap` → `landed` → 三次间隔扫地 → `forced-stand (ground-limit)` → `protection-ended`；通过 |
| 同瞬间扫地重复 | 同一 Chromium 实际运行 | 第二次即时请求得到 `hit-cadence`，计数保持 1/3；通过 |
| JavaScript 运行异常 | 同一 Chromium 实际运行 | 浏览器 `pageerror=[]`；通过 |

GitHub 上与实测候选代码一致的 Git Blob SHA（已逐个比对）：`combat-core.mjs` `8b70ef908a5687392bce104604d029f077531604`；`combat-core.test.mjs` `79ab19676eea992acd44e5e72862e0759d0b039b`；`standalone.html` `1b4dee8bf72b2c631deeed22965d33b55e28d10f`；`browser-smoke.py` `91483f222f2e1faa592e9f953f99c8697932021c`。

**复现命令**：Node 环境执行 `node --test tests/combat-core.test.mjs`；如运行环境已安装 Playwright 和 Chromium，再执行 `python tests/browser-smoke.py`。浏览器脚本使用 `page.set_content` 执行仓库原始 HTML 文字，避免当前隔离环境对 `file://` 打开的管理员限制；该限制并非游戏逻辑故障。本轮未安装依赖，也未创建外部服务。

### 四、状态边界与下一步

- **通过（原创隔离运行测试）**：23 个 Node 核心逻辑断言、11 个 Chromium 模拟触控/页面断言，及 GitHub blob 对齐。
- **失败（旧版，已在原创隔离模型中修复）**：几乎同一帧内多次扫地命中可刷满保护；现在用原创 90ms 节奏闸门阻止。
- **未覆盖**：Android 实际手指触控与 30/60Hz 画面手感、真实 Unity 战斗工程、原版 DNF 保护规则与起身时机、正式角色动作和碰撞高度、双边 hitstop、边缘输入缓冲、多人网络同步及版权审核。Chromium 的 `has_touch` 只是模拟输入，**不能记为 Android 真机通过**。
- **原创配置边界**：90ms 最小命中间隔、22 重力、10.5 上挑初速、0.9s 倒地、4 次空中 / 3 次扫地保护都是**测试假设**，不是 DNF 官方数值，也尚未经过人工手感调优。
- **下一步**：用户可下载并在真实安卓浏览器中触控测试更新后的单文件 HTML，录屏反馈具体落地过快、受击盒错位等问题；研发侧要进一步增加针对不同按键速率、极端重力和保护状态的场景测试。正式 DNF 风格打击感与 Android 手游仍属于研究/开发目标。
