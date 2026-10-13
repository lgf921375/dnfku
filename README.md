# dnfku — DNF 风格手游源码研究档案

> 最后核实：2026-10-11。此仓库用于保留**源码证据、机制分析、参数、验证边界与交接记录**，目前不是可运行的 DNF 手游源码工程。

## 2026-10-13 S7：景深接触与轮廓试验

- [S7离线页](prototype/summoner-lab-s7.html) / [本轮实测](docs/summoner-contact-s7-20261013.md)：默认保留矩形，统一景深接触/火花投影；可开启轮廓试验和边缘定格对照，S6保留。
- 最终Node264/264、浏览器57项通过。初版轮廓默认导致扫地接续2项失败，已恢复矩形默认，限制明确保留；原版规则/姿态/数值与Android仍未对齐。

## 2026-10-13 S6：致死与起身受击衔接

- [S6离线页](prototype/summoner-lab-s6.html) / [本轮修正与实测](docs/summoner-victim-s6-20261013.md)：修正空中致死瞬移到地面、倒地致死切站姿、普通起身挨打却不打断；增加低血量与预置起身对照，S5保留。
- Node246/246、S6浏览器50项通过，旁主结果一致；仍为原创反馈候选，没有新原版本人命中帧，精确DNF姿态/数值和Android未对齐。

## 2026-10-13 S5：修正命中瞬间受击并补状态反馈

- [S5离线页](prototype/summoner-lab-s5.html) / [修正与实测](docs/summoner-victim-s5-20261013.md)：先受击姿态再短停，按接触高度选反应；新增预置浮空/倒地、落地/起身、霸体和默认关闭的PK候选保护。修复移动后画面法杖与碰撞位置错位，保留S4对照。
- Node233/233；最终S5浏览器44项通过、旁结果与主结果一致。致死分支初始失败、辅助结果一致性失败均保留并修复。仍为原创候选，原版姿态/物理/保护数值与Android未对齐，不称效果一样。

## 2026-10-13 S4：普通怪物与PK角色站立受击对照

- [S4离线页](prototype/summoner-lab-s4.html) / [受击研究与验收](docs/summoner-victim-s4-20261013.md)：全身冲击/保持/恢复、从当前姿势接续、逐渐减速击退；可切换普通怪物/PK外观，S3保留。
- Node215/215；最终S4-only浏览器38项通过，旧基线18首轮另通过。两次页面启动失败已修复，保存失败和范围。精确原版PVE/PK姿态、数值及浮空/倒地保护仍未覆盖，不称完美复刻。

## 2026-10-13 召唤师S3：本人普攻命中反馈候选

- [S3离线页](prototype/summoner-lab-s3.html) / [研究与验收](docs/summoner-feedback-s3-20261013.md)：法杖真实接触后触发双方短停、木偶受击/推退、火花、轻震屏和可选原创声音；支持空挥/反馈开关/错位对照，S1/S2保留。
- Node205/205；真实浏览器旧5+13/S3空挥12/命中反馈13/触控6共49项通过。原版数值、浮空/保护、美术/音效一致和Android仍未覆盖，不称效果一样。独立缓存恢复浏览器成功；sandbox:true明确root失败，开发验收按长期授权关闭浏览器沙箱。

## 2026-10-13 召唤师S2：本人抬脚姿势校正（未达到效果一致）

- [S2离线候选](prototype/summoner-lab-s2.html) / [实证报告](docs/summoner-s2-20261013.md)：480p逐帧复核后，纠正第二段/末段双脚贴地问题，保留S1对照；新增原创衣饰/发束。仍是空挥候选，目标命中和DNF美术/音效一致性未完成。
- Node192/192；完整浏览器V10 5/V11 13/S2 12/手机尺寸6，旧S1另12+6实际通过，沙箱关闭。Android真机未覆盖，不能称完美复刻。

## 2026-10-13 召唤师本人普攻 S1（工作分支，未达到效果一致）

- [11:47永久授权复测](docs/summoner-retest-20261013-1147.md)：Node184/184、旧V10/V11 5/13、S1 12和手机尺寸触控6项通过；横屏画面/攻击键不同屏已复现并修复。仅桌面Chromium模拟，Android真机/效果一致仍未覆盖。

- [离线动作候选](prototype/summoner-lab-s1.html)：按实际30fps视频空挥姿势估计前伸、斜向上挥、压低收杖；单键/长按、逐帧、慢放与录像。仍为原创插画，目标受击/浮空/停顿/音效对齐未完成。
- [参考、纠错和测试报告](docs/summoner-reference-20261013.md)；永久隔离本地测试授权已保存，覆盖下方历史“一次授权已消费”限制。浏览器沙箱明确关闭，main未改。

## 2026-10-13 V11本地浏览器实测通过（沙箱关闭，工作分支）

- [本轮报告](docs/v11-protection-local-20261013.md)：历史V11#1第四断言遗漏合法扫地保护（ground3/total6），原失败证据保留；战斗代码/参数无修改。
- Node实测 **171/171 PASS**；用户仅授权本Work一次浏览器沙箱关闭，本地Shell151.0.7922.34/PW1.62.1实测 **V10 5/5 + V11 13/13 PASS**、exit0。真实PNG/Canvas WebM和原始轨迹已保存；[本轮报告](docs/v11-authorized-local-browser-20261013.md)。
- 授权已消费，默认安全入口与CI限制保留。Android实机、视觉相似度/主观手感/手机性能仍未覆盖；中文字体及姿态/受击盒错位待研发，不能标复刻完成。详见[交接](docs/active-handoff.md)。

## 当前结论

- **已通过（静态代码核查）**：MiniDNF 包含攻击调度、技能伤害、角色受击、浮空/下落、碰地反弹、倒地和碰撞盒判定；已读取 GitHub 原始 `Attack.xlsx` 中的具体技能配置。
- **已通过（静态代码核查）**：Unity-DNF 有基于动作帧的碰撞盒、行为状态机、跳跃/位移和命中停顿的实现；战斗结算存在演示性固定伤害 `10f`。
- **已通过（静态目录和部分代码核查）**：86JP 服务端模拟器包含 .NET/C# 工程，以及账号、角色、技能、SQLite、副本、掉落等模块。
- **未覆盖**：任何仓库的完整原版 DNF 扫地保护、累计保护阈值、强制起身、Android APK 编译/实机测试、完整多人联网性能。
- **未找到**：获授权的原版 DNF 完整官方客户端+服务端源代码组合。上述仓库**不能简单直接组合**为联网手游。

## 原创战斗逻辑隔离试验（2026-10-11 新增）

本仓库已新增**不使用 DNF 原版代码/素材**的原创 JavaScript 逻辑模型，用于尝试验证浮空、落地扫地、连击保护和强制起身；它不是上游游戏的移植版本，更不是已经验收的 Android 手游。

- [单文件交互试验页](prototype/standalone.html)：原创几何图形、自动连招、重力/浮空/倒地时间、**命中顿帧与可选触地反弹**滑块；Chromium 自动模拟触控已覆盖主要事件，**Android 真机仍未覆盖**。
- [独立战斗核心](prototype/combat-core.mjs)：测试专用的固定步长状态机与 AABB 命中判定。
- [自动测试](tests/combat-core.test.mjs) + [手感扩展测试](tests/combat-feel.test.mjs)：共33项，已在 Node.js v22.16.0 **实际执行33/33通过**。运行：`node --test tests/*.test.mjs`。
- [隔离实验报告](docs/isolated-combat-test-20261011.md)：保留原始 16 项 V8 基线，追加最新版 Node/Chromium 实测、旧版缺陷与修复证据。
- [浏览器自动测试](tests/browser-smoke.py)：需预装 Python Playwright 与 Chromium；最新版**17/17通过**，验证自动连招、命中停顿与触地反弹，但**不等于 Android 实机**。
- [V3 战斗手感实验报告](docs/combat-feel-20261011.md)：命中顿帧、反弹状态、实测落地时间、覆盖边界。

**最新实测边界（2026-10-11）**：**33/33 Node**、**17/17 Chromium** 测试通过，已用原创模型量测 40ms 命中停顿与一次可选低幅反弹对落地时间的影响。之前同帧扫地刷保护缺陷已修复。所有数字仅指独立实验，不是 DNF 官方参数；**Unity/Android APK、Android 实机触控、真实手感与官方 DNF 行为对标均未覆盖**。详见 [V3 报告](docs/combat-feel-20261011.md) 和 [先前实验报告](docs/isolated-combat-test-20261011.md)。

## V4 原创攻击时间轴（2026-10-11）

- [攻击动作控制器](prototype/combat-actions.mjs)：基于现有 V3 `CombatArena` 的独立动作层；前摇/有效帧/后摇、一格按键缓冲及可切换的攻击者/受击者**逻辑时间**同步顿帧。**没有**将其等同于真实 Unity 双边物理/动画冻结。
- [动作测试](tests/combat-actions.test.mjs)：新增 15 项独立 Node 自动回归；连同此前 33 项，`node --test tests/*.test.mjs` 在 Node v22.16.0 实际执行 **48/48 PASS、退出码0**。
- [V4 研究报告](docs/combat-actions-v4-20261011.md)：源码状态机、原创动作时序、真实执行结果及未覆盖项。
- [V4 单文件 HTML](prototype/action-lab.html) 与 [V4 浏览器复测脚本](tests/action-lab-smoke.py) **已补齐 GitHub**，实际复跑 12/12 PASS；`prototype/standalone.html` 仍是 V3。真实 Android 人手触控仍未覆盖。

## V5 原创取消/霸体/受击打断实验（2026-10-11）

- [V5 动作中断模块](prototype/combat-interrupts.mjs)：新增后摇取消窗口、限定攻击取消规则、有效帧霸体（**仅防动作打断，不代表免伤**）、受击终止动作和排队输入清理，不改 V3 原有命中/保护判定。
- [V5 自动化测试](tests/combat-interrupts.test.mjs)：总共新增17项，连同全部旧用例，`node --test tests/*.test.mjs` 在隔离 Node.js v22.16.0 **65/65 PASS**。
- [V5 离线交互页面](prototype/action-lab-v5.html) / [V5 Chromium 测试脚本](tests/action-lab-v5-smoke.py)：390×844 合成触控、取消、普通打断与强制打断验证 **12/12 PASS**。原 V4 浏览器12项也复跑通过。**不是 Android 真机实测**。
- [V5 机制与缺陷报告](docs/combat-actions-v5-20261011.md)：包含“取消功能已关闭但 `cancelReady` 仍误报”为真的**已复现失败及修复证据**。旧版失败历史不删除。
- **持续限制**：这只是原创角色动作逻辑；实际 HP/格挡/霸体下受伤、真实多角色实体攻击、安卓 APK、人手操作与官方 DNF 行为一致性都**未覆盖**。

## V6 原创二角色扣血与碰撞实验（2026-10-11）

- [二角色战斗层](prototype/combat-duel.mjs)：有效段逐步检查独立攻击盒、双向攻击、HP、正面格挡、霸体受伤不打断、保护起身与同帧换血；沿用V3/V4/V5规则，旧源码与测试未改。
- [V6离线实验页](prototype/duel-lab-v6.html)：原创几何角色、双方技能、HP、格挡、步进移动与碰撞盒；由 [生成器](prototype/build-duel-lab.mjs) 直接使用测试模块生成。
- [V6报告](docs/combat-duel-v6-20261011.md) / [Android路线评估](docs/android-route-v6-20261011.md)：Node v24.19.0本轮 **104/104通过**（旧65+新39）；[批量检查](tests/run-v6-batch.mjs) 与 [原始证据](docs/evidence-v6/results.json)。
- **环境失败/未覆盖**：本轮Chromium缺失且下载失败，V6浏览器脚本启动退出1，页面断言0项执行。页面视觉/交互、Android真机/APK、Unity、主观手感、联网均未覆盖；历史V4/V5浏览器通过不能代替V6。

## V7 横版人物动作与连续操作（2026-10-11）

- 用户反馈V6方块展示与手感不满足横版格斗目标。新增 [V7单文件](prototype/scroll-lab-v7.html)：原创持剑关节人物、前摇/挥砍/受击/浮空/倒地、连续摇杆与前后走位、刀光/火花/轻震屏、可选合成音效、可选陪练。旧规则与测试保持原样。
- [V7报告](docs/side-scroll-v7-20261011.md)：Node **118/118 PASS**；同一Canvas绘制函数在Skia生成四状态图并人工查看。**不是浏览器/手机验收**。Chromium仍缺失，V7交互断言0项执行；真实打击感未覆盖。
- [批量脚本](tests/run-v7-batch.mjs) / [原始结果](docs/evidence-v7/results.json)。手机建议横屏打开，左下摇杆，右下技能；攻击键在对手倒地时自动选扫地。当前仍为简化原创画风与原型，非正式手游。

## V8 统一普通攻击与空中追击（2026-10-11，当前试用版）

- [V8离线页](prototype/contact-lab-v8.html)：同一个攻击动作根据有效碰撞盒命中站立/浮空/倒地，不再按敌人状态切换空追或扫地；移除独立空追/扫地按钮。盒碰不到时打空，保护/无敌仍生效。
- [纠错与证据](docs/contact-v8-20261011.md)：相同低位盒旧设计对倒地目标不扣血，新设计扣14；Node **134/134 PASS**。浏览器/手机/真实手感仍未覆盖，尚无正式三段普攻。
- 最新开发以V8为准，V7按目标状态切扫地仅作为历史设计，不再当成当前要求。

## V9 三段剑击与动作命中对齐（2026-10-11，当前试用版）

- [V9单文件横版页](prototype/rhythm-lab-v9.html)：同键三段普攻、上挑、空中位置命中、落地追击、保护起身；新原创骨骼插画、剑光和交点火花、独立双方顿帧与调节面板。
- [完整报告](docs/combat-rhythm-v9-20261011.md) / [8秒模型录像](docs/evidence-v9/combo-demo.mp4) / [碰撞关键帧](docs/evidence-v9/keyframes.jpg)。录像由Skia执行生产绘制函数生成，**非浏览器/手机录屏**。
- 最终Node142/142通过（含旧134）；Chromium缺失且下载失败，浏览器0断言执行。**真实触控、音效、布局、Android手感未验收**；美术仍为简化原创原型，不能宣称达到DNF手游品质。

## 研究文档索引

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


## 攻击逻辑与受击反馈开源研究（2026-10-11）

- [四仓库源码对照报告](docs/attack-hit-feedback-source-study-20261011.md)：新增 OpenBOR/Ikemen-GO，复核 MiniDNF/Unity-DNF；固定提交与函数行链接、顿帧/硬直/受击速度/反馈联动、V9受击姿势缺口。
- [取证清单](docs/evidence-source-study-20261011.json)。本轮仅通过静态检查，未运行上游游戏或新增V9功能测试；最新实现仍是V9，手机手感未验收。


## V10 源码落实与受击动作（2026-10-12，验收未完成）

- [V10试用页](prototype/feedback-lab-v10.html)：三段受击姿势、着地/起身过渡、实际刀刃胶囊接触；保留同键站/空/地命中与强制起身规则。
- [上游函数→V9→实际修改报告](docs/source-driven-feedback-v10-20261012.md)、[8秒模型对比录像](docs/evidence-v10/comparison-model.mp4)、[画面对比](docs/evidence-v10/reaction-comparison.png)。四项目真实下载/源码深审；Node147/147。
- **浏览器验收未完成**：file协议被拒、内部预览proc权限失败、Chromium缺失；浏览器0断言。上述录像是Skia模型，不是浏览器/Android录像；音效与手机主观手感均未验收，不能宣称打击感优化完成。

## V11 首轮自主研究与接触续浮空实验（2026-10-12）

- [参考证据与逐函数差距表](docs/reference-gap-v11-20261012.md)：三套实际实现+Unity第三击配置，固定commit/行号/许可；两段历史手游视频观察及不确定性。
- [V11实验页面](prototype/juggle-lab-v11.html)：末段改向上挑斩，实际接触才改变浮空速度，原V10和保护规则保留对照；[核心](prototype/combat-juggle.mjs)。
- 逻辑153/153通过，V10默认1600步与92c9524b事件/快照相同；[手动对照工作流](.github/workflows/v11-candidate-acceptance.yml)先原V10五断言，再独立V11十检查。首次提交时新浏览器/视觉/安卓均未覆盖，不能称打击感复刻完成；Chromium沙箱已关闭，仅限GitHub托管非rootrunner。
