# dnfku — DNF 风格手游源码研究档案

> 最后核实：2026-10-11。此仓库用于保留**源码证据、机制分析、参数、验证边界与交接记录**，目前不是可运行的 DNF 手游源码工程。

## 当前结论

- **已通过（静态代码核查）**：MiniDNF 包含攻击调度、技能伤害、角色受击、浮空/下落、碰地反弹、倒地和碰撞盒判定；已读取 GitHub 原始 `Attack.xlsx` 中的具体技能配置。
- **已通过（静态代码核查）**：Unity-DNF 有基于动作帧的碰撞盒、行为状态机、跳跃/位移和命中停顿的实现；战斗结算存在演示性固定伤害 `10f`。
- **已通过（静态目录和部分代码核查）**：86JP 服务端模拟器包含 .NET/C# 工程，以及账号、角色、技能、SQLite、副本、掉落等模块。
- **未覆盖**：任何仓库的完整原版 DNF 扫地保护、累计保护阈值、强制起身、Android APK 编译/实机测试、完整多人联网性能。
- **未找到**：获授权的原版 DNF 完整官方客户端+服务端源代码组合。上述仓库**不能简单直接组合**为联网手游。

## 原创战斗逻辑隔离试验（2026-10-11 新增）

本仓库已新增**不使用 DNF 原版代码/素材**的原创 JavaScript 逻辑模型，用于尝试验证浮空、落地扫地、连击保护和强制起身；它不是上游游戏的移植版本，更不是已经验收的 Android 手游。

- [单文件交互试验页](prototype/standalone.html)：可自行下载 HTML 在浏览器打开，通过原创几何图形观察战斗状态；本轮尚未进行真实浏览器/手机触控验收。
- [独立战斗核心](prototype/combat-core.mjs)：测试专用的固定步长状态机与 AABB 命中判定。
- [自动测试](tests/combat-core.test.mjs)：16 项检测，可由具备 Node.js 的用户运行 `node --test tests/combat-core.test.mjs`；本轮仅实际在 V8 隔离运行环境执行全部 16 项，**Node CLI 尚未复跑**。
- [隔离实验报告](docs/isolated-combat-test-20261011.md)：实验规则、V8 实际运行结果、失败/未覆盖项和下一步验收方案。

**记录边界**：16/16 通过仅指原创纯逻辑模型的 V8 运行测试。Unity 游戏、Android APK、手机触控、连击保护真实手感和官方 DNF 行为对标均为**未覆盖**。实验参数是原创设计值而非官方 DNF 阈值。

## 文档导航

1. [AGENTS.md](AGENTS.md)：本仓库后续审查和更新规则。
2. [docs/source-audit-20261011.md](docs/source-audit-20261011.md)：真实文件路径与源码结论。
3. [docs/skill-parameters-20261011.md](docs/skill-parameters-20261011.md)：从 MiniDNF `Attack.xlsx` 实际解析的技能参数。
4. [docs/combat-mechanics-20261011.md](docs/combat-mechanics-20261011.md)：浮空、落地、扫地条件和仍缺少的保护机制。
5. [docs/active-handoff.md](docs/active-handoff.md)：下一轮必须先读的执行交接及未覆盖项。

## 上游研究对象（按本次读取时的版本固定）

- MiniDNF — [v-star0719/U3D_MiniDNF](https://github.com/v-star0719/U3D_MiniDNF/tree/543839751adbe09eecc896da949945080782b45e)（Unity/C# 客户端单机演示）
- Unity-DNF — [Oceanisher/Unity-DNF](https://github.com/Oceanisher/Unity-DNF/tree/4436c7212a6e3ed2cb389b2c0c4fa5b6211f79e6)（Unity/C# 客户端原型）
- 86JP-DNFServerS4A12 — [bigsmallliao/86JP-DNFServerS4A12](https://github.com/bigsmallliao/86JP-DNFServerS4A12/tree/4e2f25e04f604b7081cc42eb0f4d8c9a20a8ed05)（第三方 .NET 服务端模拟器）

## 边界与版权

上游项目的 GitHub 仓库元数据在本轮**未识别到明确许可证**，不能据此认定其代码、原版角色、音效、贴图或其它 DNF 资产可自由复制/商用。本仓库仅保存**原创研究总结、参数事实及源码位置链接**，不镜像他人源码或游戏素材。

本研究独立于《皓石传奇三》。禁止因为研究 DNF 而修改其现有正式服务、原手机40C账号/角色数据、600ms冷却或怪物规则；未经明确授权不在生产环境编译、部署、重启或压测。
