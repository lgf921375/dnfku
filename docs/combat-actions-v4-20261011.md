# V4 原创动作时间轴与双边顿帧实验（2026-10-11）

> **版本边界**：本次新增的是 `dnfku` 自有、独立于第三方 Unity 项目的 JavaScript **动作层**。使用 V3 已有 `CombatArena` 作为受击判定模型。所有时间值为原创试验参数，**非 DNF 官方参数**；尚无 Android / Unity 实机运行验收。

## 1. 仓库与上游版本

- 任务开始前依次读取 `AGENTS.md`、`README.md`、`docs/active-handoff.md`、V3 报告及实际源码；开始 HEAD=`348d7fc24bcf39ce60cd3975b2580dae3771c076`。
- 上游依据仍是 [MiniDNF 54383975](https://github.com/v-star0719/U3D_MiniDNF/tree/543839751adbe09eecc896da949945080782b45e) 和 [Unity-DNF 4436c721](https://github.com/Oceanisher/Unity-DNF/tree/4436c7212a6e3ed2cb389b2c0c4fa5b6211f79e6)，实际机制分析请看既有 `docs/combat-mechanics-20261011.md`。本轮不移植其源代码或素材，不把 Unity-DNF 的 `frameFreezeInfo.time:200` 当成原型参数。

## 2. V4 研发内容（原创设计，受独立运行测试覆盖）

新文件 [prototype/combat-actions.mjs](../prototype/combat-actions.mjs) 导出 `CombatActionController`、`ACTION_FRAMES`、`ACTION_SETTINGS`。

- **动作阶段**：`startup → active → recovery → idle`。点击技能先进入前摇；**只有到达有效帧入口时**才调用现有 `CombatArena.hit(name)`，同一动作至多触发一次命中尝试。没有因为按下按钮就立即造成伤害。
- **原型动作表（秒）**：

| 攻击 | 前摇 | 有效段 | 后摇 |
|---|---:|---:|---:|
| 上挑 `launcher` | 0.10 | 0.07 | 0.18 |
| 空追 `airTap` | 0.06 | 0.07 | 0.13 |
| 扫地 `groundSweep` | 0.07 | 0.06 | 0.16 |
| 高位斩 `highSlash` | 0.09 | 0.06 | 0.18 |

- **输入缓冲**：动作执行中可缓存一次新技能命令（默认 **0.20 秒**，后输入覆盖前输入）。到当前动作后摇完结时，若输入仍在有效时间内才启动下一动作，否则记录 `input-expired`；禁用缓冲时回 `input-rejected / busy`。为避免打击停顿误吞操作，缓冲有效期按可推进的**动作时钟**计算，双边命中停顿期间不减少。
- **对比双边命中停顿**：默认开启 `bilateralHitstop:true`。有效命中后，V3 目标逻辑暂停重力/倒地计时；新增攻击者动作时钟在同一段 `hitstopSeconds` 内暂停。切换为 `false` 后仅目标逻辑暂停、攻击者动作继续推进。**这里的“双边”仅指两个模拟状态机计时都被冻结，未包含攻击者真实 Rigidbody、动画渲染和服务器同步，不能当作真实游戏双边 hitstop 已验收。**
- **按固定步长验证**：使用已有 `CombatArena.cfg.fixedStep=1/120` 推进事件时间，动作时钟仅在未被冻结的步骤递增；动作入口防止重复命中。模拟外部 30/60/120Hz 时间推进一致性。

## 3. 实际测试环境与结果

- **本地复原范围**：使用隔离工作目录 `/mnt/data/dnfku-work` 中的 V3 文件。V3 `prototype/combat-core.mjs` 的真实 Git Blob 是 `54e4df5e80089b8204d8656d5857c1eb064a0ff8`，旧测试文件 Blob 与 GitHub 一致。
- **Node.js v22.16.0 实际执行**：`node --test tests/*.test.mjs`，**48 PASS / 0 FAIL、退出码 0**。其中 V3 33 项完整回归，新增 [tests/combat-actions.test.mjs](../tests/combat-actions.test.mjs) 15 项（测试编号34–48）。
- **新增 Node 场景**：前摇不提前伤害、进入有效段恰好一次命中、动作阶段顺序、后摇消费缓冲、过早按键过期、覆盖缓冲、双边冻结动作计时、单边保持动作推进、被拒绝命中不冻结攻击者、关闭缓冲后拒绝、冻结期全局时钟持续、30/60/120Hz 外部驱动数值一致、站立目标扫地被拒绝、非法输入校验、排队动作依旧只命中一次。
- **Chromium 浏览器的独立 V4 交互预览**：本地生成无第三方资源的单文件 `action-lab.html`，使用和 GitHub 模块完全相同的内联源码；390×844 手机尺寸视口、Playwright `has_touch` 模拟 `pointerdown`；在 `tests/action-lab-smoke.py` 本地执行，**12 PASS / 0 FAIL、退出码 0、浏览器 `pageerror=[]`**。包含前摇后实际命中、缓冲出队、参数控件、双边开关、自动连招与强制起身。**注意：V4 独立 HTML 和此浏览器脚本本轮仅作为聊天中的隔离可下载测试产物，尚未写入 GitHub；GitHub 已持久化的是原型逻辑和 15 项 Node 测试。** 不得写成 GitHub 中已部署 V4 页面。
- **浏览器脚本调试历史**：最初测试在派发 `pointerdown` 后立即读取异步渲染状态，出现 **测试脚本过早断言失败**；改为等待25ms后通过。之后测试脚本用不兼容的范围输入字符串 `0.20` 导致 Playwright `Locator.fill: Malformed value`，规范为 `0.2` 后通过。两者是**测试脚本使用问题**，并非已证实的战斗状态机失效；保留原始失败记录。
- **可重复性限制**：Node 的 GitHub 提交内容已通过 Blob SHA 对账：`combat-actions.mjs`=`d6d07319278c9ec46555115059c3967cefc5e277`，`combat-actions.test.mjs`=`7ff7f5009f7e64bdac4de317b54fd52d02e16174`。浏览器版本目前仅可从本次对话的 V4 HTML 文件下载，在独立容器进行模拟运行；真正 Android 手机手指交互未测试。

## 4. 通过、失败与未覆盖

- **通过（原创逻辑真实 Node 实测）**：48/48，动作计时、有效帧入口和输入缓冲；不代表完整 DNF 游戏。
- **通过（隔离 Chromium 模拟交互）**：12/12，桌面 Chromium 模拟手机尺寸/触摸环境，含自动扫地保护演示；不代表 Android 真机。
- **失败/修订**：浏览器测试脚本曾出现异步断言和输入格式错误，已修复并复跑；以前的“同帧扫地刷保护”历史失败仍保留在 V2 报告。
- **未覆盖**：独立 HTML 在 Android 真机的安装/打开/真人操作、引擎级双方 hitstop、帧动画打击音效、每帧独立碰撞盒变化、真实攻击取消窗口、输入缓冲在低端手机的丢帧适应、正式服务端协议/联机、上游 Unity 编译和商业授权。**当前 active 帧是时间到点的一次判定，不是连续可命中的宽时间窗口**。
- **下一轮**：将 V4 页面和浏览器回归脚本正式同步到 GitHub（若继续保留此 UI 设计），为每一动作的有效帧建立可视化攻击盒及命中帧表，加入取消/霸体/受击打断规则；Android 真人触控后再判断是否改善“打击感”。不要直接复制第三方版权资源。
- **安全边界**：本轮未修改、部署或重启《皓石传奇三》；不接触单套服务、40C 账号数据、600ms 冷却及原有怪物规则。
