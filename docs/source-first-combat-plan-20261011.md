# V9后续：外部源码先行的战斗手感研发任务（2026-10-11）

## 为什么要调整执行流程

用户在手机反馈：虽然战斗原型逻辑测试数量持续增长，但实际打击感仍不符合 DNF 风格目标，希望优先真正研究网络上的其他 Git 战斗源码，而不是不断自行创造参数和状态机。此为**人工体验未通过的反馈**；不是运行时 bug 定位证据。

本轮开始前通过已连接 GitHub 工具读取 `AGENTS.md`、`README.md`、`docs/active-handoff.md` 与已有 [四仓库实码审查](attack-hit-feedback-source-study-20261011.md)。**现有报告已经核查了** OpenBOR、Ikemen-GO、MiniDNF 与 Unity-DNF 的真实函数和行链接，但交接明确记录：**四项目静态研究尚未作为新功能落实到 V9，也未进行 V9 的浏览器/Android 体验复测。** 所以重点不是重复搜索，而是把已有证据转化成 V9 的明确代码差异和可复现视觉验收。

## 本轮补充候选（当前仅 README 已读，不算源码机制审计）

| 新候选 | GitHub/README 确认内容 | 当前状态 |
|---|---|---|
| [street-crime](https://github.com/isocialPractice/street-crime) | HTML5 Canvas 横版格斗，包含输入缓冲与有帧节奏的角色攻击表现 | 通过（README静态候选识别）；战斗函数未读、运行未覆盖 |
| [way-of-the-samurai](https://github.com/DenisTkachenko888/way-of-the-samurai) | Pygame 2.5D belt-scroller，自述三种剑击、按动画帧命中与短命中停顿 | 通过（README静态候选识别）；战斗函数未读、运行未覆盖 |
| [2DVersusFighting](https://github.com/getsuda24-coder/2DVersusFighting) | Unity 2D 双人格斗原型，自述动画事件触发 hitbox、hitstun、连招 | 通过（README静态候选识别）；战斗函数未读、运行未覆盖 |

上述三个 README 已通过已连接 GitHub `fetch_file` 读取：Blob `street-crime/README.md=6a43ba42d75917549ef9b375842edd98dca521a9`、`way-of-the-samurai/README.md=dbae4394a3fedd9896f4f2d59fa7780ed4b9e487`、`2DVersusFighting/README.md=fe59c041481499d1614ccdcaa8892151d15a999a`。**未读取实际关键脚本与精确固定分支版本，不可声称有已核实的机制调用链或可直接移植授权。**

## 强制工作顺序与验收门槛

1. 先读取已有四仓库报告，查看证据清单、固定 SHA、关键函数；扩大检索到至少8个真实候选，筛选源码可访问、战斗功能真实存在、许可证边界清晰者。深审至少3个战斗项目，必须给出具体文件/函数/固定 commit 链接；不能以 README 或目录充数。
2. 建立 `上游命中/受击函数 -> dnfku V9当前文件/函数 -> 差异 -> 最小改动 -> 运行日志 -> 录像关键帧` 矩阵，优先三段普攻受击姿势、命中有效帧刀刃判定、空中与贴地追击、真正落地起身动作、双方顿帧和声画反馈同步。
3. 用户规则不变：一个普通攻击按实际攻击盒碰到站立/浮空/倒地目标；接触成立后状态决定受击效果。保护到阈值强制起身与无敌。不得从 OpenBOR/Ikemen 直接拷贝限制倒地命中的默认策略来违背用户要求。
4. 根据差异矩阵修改1–2项核心问题，保持旧回归；在可用浏览器运行并截图/录像实际接触、受击帧、落地和保护；浏览器不可用应明确记录0断言/未覆盖，不能拿 Node 通过冒充视觉或 Android 手感通过。
5. 保存原始参考路径、许可证、运行数据、失败与未覆盖；每轮更新相关研究文档和 `docs/active-handoff.md`。不直接复制未经授权的素材、大段源码或 DNF 原版游戏资源；不修改《皓石传奇三》。

## 本轮实际执行分类

- **通过（静态仓库与 README 检查）**：读取现有研究证据；确认三个新候选确有对应 GitHub README。
- **未覆盖**：三个候选实际战斗代码深入审计、上游编译运行、在 V9 中落实上述外部研究、浏览器/Android 人工体验。
- **未执行**：任何代码更改、Node/浏览器性能与玩法复测。用户本轮主要请求的是提供 Codex/Work 的强制研究指令，而不是立即部署或修改游戏。
