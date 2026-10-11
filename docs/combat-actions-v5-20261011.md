# V5 原创战斗动作：取消窗口、霸体抗打断与受击中断（2026-10-11）

> **严格范围**：这是 `dnfku` 自己编写的 JS 独立模型，基于 V3 的 `CombatArena` 和 V4 的 `CombatActionController`。**没有**运行 MiniDNF / Unity-DNF / 86JP 游戏；没有 DNF 原版素材。以下 65/65 与 12/12 仅指隔离 Node / Chromium 运行测试，**不等于 Android 真机、官方 DNF 机制或真实角色战斗手感验证**。

## 1. GitHub 版本与回溯

本轮按项目约定，先通过已连接 GitHub 工具读取 `AGENTS.md`、`README.md`、`docs/active-handoff.md` 和 V4 研究文档，再读 `prototype/combat-actions.mjs` / `tests/combat-actions.test.mjs`。开始时 `main` HEAD=`e1e0a6bcf5cf7c9e13d5bba7b8fb8b9cadb97d4a`。

上游最新分支 HEAD 在本轮再次检查并保持不变：

- MiniDNF [543839751adbe09eecc896da949945080782b45e](https://github.com/v-star0719/U3D_MiniDNF/tree/543839751adbe09eecc896da949945080782b45e)
- Unity-DNF [4436c7212a6e3ed2cb389b2c0c4fa5b6211f79e6](https://github.com/Oceanisher/Unity-DNF/tree/4436c7212a6e3ed2cb389b2c0c4fa5b6211f79e6)
- 86JP [4e2f25e04f604b7081cc42eb0f4d8c9a20a8ed05](https://github.com/bigsmallliao/86JP-DNFServerS4A12/tree/4e2f25e04f604b7081cc42eb0f4d8c9a20a8ed05)

## 2. 第一项：补齐上一轮未入库的 V4 页面

- 从前次聊天生成文件恢复 `dnfku-combat-lab-v4.html`，通过工具直接保存到 [prototype/action-lab.html](../prototype/action-lab.html)，回读 Git blob `2e874dcc554fd8257d99e882ea26521b4381a972` 与先前实际浏览器测试文件一致。
- 将上轮真实执行的 [tests/action-lab-smoke.py](../tests/action-lab-smoke.py) 原样提交，回读 Git blob `e20e43336cd9e53f1d2bcd5c396cbe75b98192bc` 与隔离环境文件一致。**V4 的页面及回归脚本现在均可从 GitHub 复现。**
- 本轮再次在同一个隔离容器运行：`python tests/action-lab-smoke.py`，**12/12 PASS、exit 0**，前次 GitHub 未覆盖的持久化缺口已补齐。

## 3. 第二项：原创 V5 动作打断与取消政策

新增 [prototype/combat-interrupts.mjs](../prototype/combat-interrupts.mjs)，以 `CombatInterruptController extends CombatActionController` 独立实现，不修改 V3 核心以及 V4 的动作控制器。

| 原型规则 | 实现行为 | 验证边界 |
|---|---|---|
| 后摇取消 | 在 `recovery` 已经过 `cancelRecoveryAfter=0.10s` 且 `cancelRules` 允许时，立即开始合法的后续技能；早于窗口则按 V4 原规则缓冲 | Node 自动测试 |
| 取消限制 | 默认上挑→空追、空追→上挑、扫地→上挑；高位斩未配置取消目标；可关闭取消开关 | 纯原创配置，非官方 DNF 连招表 |
| 霸体 | 默认只有“上挑有效帧”有抗打断效果；普通受击不会取消当前动作，强制打断能覆盖 | **仅防动作中断，不提供减伤/无敌或受击判定** |
| 受击打断 | 调用方报告已确认的受击事件后，若不在霸体保护状态，则取消攻击、清理排队输入和攻击方逻辑顿帧 | 当前没有真实敌人向玩家施加伤害的完整系统 |
| 输入队列一致性 | 成功取消动作后，清空旧缓冲；受击中断后清空缓冲，防止旧技能在之后自动执行 | Node 自动测试 |
| 帧率驱动 | 对比外部30/60/120Hz步进，核验相同观察点的取消准备状态 | 只测试离散逻辑，不代表真实手机刷新率 |

新增 [tests/combat-interrupts.test.mjs](../tests/combat-interrupts.test.mjs)，在既有 48 项之上增加 **17 项**，最终 Node 回归共 **65 项**。

### 已复现并修复的 V5 快照误报

- **失败（修复前）**：`interruptSettings.cancelEnabled=false`，实际 `canCancelInto('airTap')===false`，但上挑后摇达到窗口时，`snapshot().cancelReady` 仍可能为 `true`。这是状态展示字段未判断开关和合法后续目标的缺陷。
- **修复**：`cancelReady` 额外要求开关启用、当前阶段为后摇、到达时间阈值、当前技能至少存在一个允许的取消目标。
- **通过（修复后）**：新增测试63–65分别验证关闭取消开关后快照为false、无合法目标时为false、输入缓冲关闭时合法取消仍可触发；完整65项均通过。不能删除上述历史失败证据。

## 4. 实际运行证据

**隔离环境**：Node.js `v22.16.0`；预装 Python Playwright + Chromium 无头浏览器，390×844 移动尺寸，`has_touch=true` 且合成 `pointerdown`。从未声称访问真实 Android 设备。

| 实际运行命令 | 实际结果 |
|---|---|
| `node --test tests/*.test.mjs` | **65 PASS / 0 FAIL / exit 0** |
| `python tests/action-lab-smoke.py`（V4 基线） | **12 PASS / 0 FAIL / exit 0** |
| `python tests/action-lab-v5-smoke.py` | **12 PASS / 0 FAIL / exit 0** |

浏览器 V5 新增验证：动作按钮与中断控件、普通高位斩前摇被打断、上挑有效帧霸体抵抗普通中断、强制打断覆盖霸体、后摇取消进入空追、关闭取消后改为输入排队、浏览器 JS 异常为0。

首次 V5 浏览器脚本在调用 `pointerdown/click` 后立即读取渲染画面的状态字段而触发一次断言失败；调试后改为明确等待下次渲染，再复跑12/12。这是**测试脚本异步时序问题**，与战斗动作事件记录区分保存。

## 5. 可重复文件及准确 Git Blob

- [prototype/combat-interrupts.mjs](../prototype/combat-interrupts.mjs)：`249b67f78efab2ece46c5ce1d44a368298dfb48a`
- [tests/combat-interrupts.test.mjs](../tests/combat-interrupts.test.mjs)：`d0540d7adb60debd36ffce317b972f82d2bcea02`
- [prototype/action-lab-v5.html](../prototype/action-lab-v5.html)：`a6070ce6107e44d0958e19cc7adb74d5b97bc610`
- [tests/action-lab-v5-smoke.py](../tests/action-lab-v5-smoke.py)：`3a781356876c089bf92ba47b812e6ad73cda17b4`
- V4补齐：[prototype/action-lab.html](../prototype/action-lab.html) `2e874dcc554fd8257d99e882ea26521b4381a972`、[tests/action-lab-smoke.py](../tests/action-lab-smoke.py) `e20e43336cd9e53f1d2bcd5c396cbe75b98192bc`。

以上 Blob 均由本地 `git hash-object` 和提交后的 GitHub 文件回读匹配。V5 HTML 中的动作控制器与碰撞模型使用内联副本；属于可离线打开的独立试验场，**尚未验证 Android 实机兼容性**。

## 6. 未覆盖与下一步

- **通过（有限范围内真实运行）**：原创 JavaScript 的65个 Node 状态机断言；V4/V5 两套各12项 Chromium 合成触控检查。
- **失败/修复记录**：旧 V2 同时刻扫地刷保护的缺陷、此次 V5 取消状态快照误报及浏览器脚本即时读取误报，分别保留在相应报告。
- **未覆盖**：正式攻击帧每帧独立 hitbox、格挡与 HP 伤害、霸体状态下真实伤害结算、对手真正生成的受击事件、真实人物动画与双方 Rigidbody 命中停顿、APK 构建、Android 人手触控与帧率、联网服务端、原版 DNF 行为一致性、素材商业许可。
- **后续优先级**：把 V5 的受击事件连接到独立的二角色碰撞场景，添加命中帧独立 hitbox 与霸体“仍受伤但不被打断”的可计量测试；之后再做 Android 浏览器真机录屏，最后评估 Unity 或 Android 工程实现。未运行的事项仍标记**未覆盖**。
- **隔离约束**：本轮仅新增/更新 `dnfku`；未修改、部署、重启《皓石传奇三》，没有触碰其40C数据、单套服务、600ms冷却或原怪物规则。
