# V10：上游源码落实、受击动作与刀刃接触（2026-10-12）

## 当前结果：代码与模型画面已改，浏览器验收未完成

本轮完成真正 GitHub 检索、下载和阅读四个项目的关键攻击/受击源码，按函数与当前 V9 对照，新增实际 V10 核心/绘制/离线页。并不是再写一篇综述后停止。

**通过（静态检查）**：四项目固定 commit 与本地下载文件 Git Blob SHA 一致；逐函数差异矩阵及许可证检查完成。**通过（Node 实际运行）**：147/147（原142保留，新5），无失败。**通过（Skia 模型绘制运行与人工看图）**：V9/V10 对比240帧、30fps、8秒，正常输入连招都到达保护起身；受击姿势、接触点、返斩、着地/起身画面有实际变化。

**失败/阻塞**：Cloud Browser 不允许 file: 地址；正常内部 HTTP 预览启动因 bwrap 无法挂载 proc 失败；本地 Playwright 又缺 Chromium 可执行文件，0项断言执行。**未覆盖**：真实浏览器交互/录屏、Android 实机、音效听感、主观 DNF 打击感。所以本批标记为**有画面改动但验收未完成**，绝不宣布打击感优化完成。

开始前从 GitHub 读取最新 AGENTS、active-handoff、attack-hit-feedback-source-study、README及源码先行计划。起始 main=`6af364f3e06b0c701df077b53701ac29a994c55e`，它比上一轮研究提交新；实现仍为 V9。只修改 dnfku；不部署或重启其他游戏。

## 本轮真实检索、下载与深审对象

执行 GitHub 仓库搜索：dnf unity、beat em up、Ikemen-GO、OpenBOR。结果包括 Unity-DNF、DNFMobileEX、HealthBar_HUD_Unity、DNFSurvivor、template-beat-em-up、PompaDroid、zabuyaki、game-off-2017、fists-of-fury-course、OpenBOR、Ikemen 等。候选数量不算机制审计；本轮深审下面四个。

下载方式为 GitHub fetch_blob/fetch_file 返回的实际文本，写入隔离 upstream-review；保存前后完整 Git Blob 哈希核验一致。下载目录没有上传回 dnfku，仓库只保存原创分析/证据清单和源码链接，未搬入上游大段实现或素材。精确文件大小、Blob SHA、搜索结果摘要见 [source-download.json](evidence-v10/source-download.json)。

| 项目 | 本轮固定 commit | 实際下载并阅读的关键文件 | 许可证 |
|---|---|---|---|
| OpenBOR | `787b6770409935137579715febf80cf7a529b748` | engine/openbor.c，1,746,596字节 | 根 LICENSE BSD-3-Clause；不等于模组素材许可 |
| Ikemen-GO | `b464672651c87c42aeca10bb5c33003f26d42071` | src/char.go，426,494字节 | 本轮重读 LICENCE.txt：引擎/脚本MIT，指定字体/图标及发行资源另有范围 |
| MiniDNF | `543839751adbe09eecc896da949945080782b45e` | Project/Assets/Scripts/ActorBase.cs、SkillAttack.cs | 未找到覆盖全项目的明确许可；仅研究机制 |
| street-crime | `777da9e0ebbd5418dd957e1511eac5e4f89fc641` | js/entities/player.js、enemy.js、hitfx.js，及 LICENSE | 实读根 LICENSE 为MIT；不复制其素材 |

Ikemen HEAD 已从上一轮 5eb7f3c…变为 b4646726…，函数部分行号发生变化，本报告已按本轮下载文件重新定位。没有把上轮行号直接套到新提交。

## 逐项目攻击与受击调用链：源码事实

### OpenBOR（横版景深格斗）

- [engine/openbor.c: do_attack，31443起；31478–31512]( https://github.com/DCurrent/openbor/blob/787b6770409935137579715febf80cf7a529b748/engine/openbor.c#L31443-L31512 )：创建/复用攻击 ID，调用 checkhit，再取得攻击与身体防御属性。
- [checkhit，29490–29652]( https://github.com/DCurrent/openbor/blob/787b6770409935137579715febf80cf7a529b748/engine/openbor.c#L29490-L29652 )：验证当前动画帧、目标 vulnerable、active_status；扫描当前帧攻击盒，与当前帧身体盒求交，不靠一个恒定攻击半径。
- [check_collision，29073–29220]( https://github.com/DCurrent/openbor/blob/787b6770409935137579715febf80cf7a529b748/engine/openbor.c#L29073-L29220 )：左右朝向变换、X/Y/Z边界检查，求盒交集中心并写入 lasthit。
- [do_attack，31514–31606]( https://github.com/DCurrent/openbor/blob/787b6770409935137579715febf80cf7a529b748/engine/openbor.c#L31514-L31606 )：无敌/死亡/阵营/命中间隔和 ID 去重；OTG 与 juggle 预算是额外策略。
- [common_takedamage，39239–39460]( https://github.com/DCurrent/openbor/blob/787b6770409935137579715febf80cf7a529b748/engine/openbor.c#L39239-L39460 )：先结算伤害，再区分不痛击、pain、fall等结果；击倒时设置位移/垂直 toss。[set_pain，35137–35201]( https://github.com/DCurrent/openbor/blob/787b6770409935137579715febf80cf7a529b748/engine/openbor.c#L35137-L35201 ) 根据攻击类型与前/后受击选择动画，不是所有命中一套姿势。[set_fall，34849起]( https://github.com/DCurrent/openbor/blob/787b6770409935137579715febf80cf7a529b748/engine/openbor.c#L34849-L34929 ) 处理倒地动画选择。
- [命中火花与停顿，31715–31742]( https://github.com/DCurrent/openbor/blob/787b6770409935137579715febf80cf7a529b748/engine/openbor.c#L31715-L31742 )：确认结果后生成火花，并延迟双方移动/动画/思考调度。

**不采用的部分**：OTG_NONE拒绝倒地命中、juggle不足拒绝空中命中与本项目规则不一致；不能照抄。反击检测29655–29663明确暂时禁用。上游未运行，玩家全部取消链未审完。

### Ikemen-GO（格斗引擎）

- [src/char.go: hitDetectionPlayer，14057起]( https://github.com/ikemen-engine/Ikemen-GO/blob/b464672651c87c42aeca10bb5c33003f26d42071/src/char.go#L14057-L14215 )：查可受击资格、既有目标/HitDef ID和追击预算，做深度与碰撞检查，再调用 hitResultCheck。
- [clsnCheckSingle，10901–10965]( https://github.com/ikemen-engine/Ikemen-GO/blob/b464672651c87c42aeca10bb5c33003f26d42071/src/char.go#L10901-L10965 )：盒类型、禁用、免疫、朝向及世界位置/偏移分开处理。
- [hitResultCheck，11370起；11662–11769反应段]( https://github.com/ikemen-engine/Ikemen-GO/blob/b464672651c87c42aeca10bb5c33003f26d42071/src/char.go#L11662-L11769 )：同一 HitDef 有防御、地面、空中、倒地各自的时间/速度；目标状态选择命中后反应，不是换玩家技能。
- [actionRun，12444起；12591–12650]( https://github.com/ikemen-engine/Ikemen-GO/blob/b464672651c87c42aeca10bb5c33003f26d42071/src/char.go#L12591-L12650 )：hitPause停止期间不递减普通受击恢复；hitshake结束后减hittime；倒地恢复另外计时。
- [双方 hitPauseTime，14297–14320]( https://github.com/ikemen-engine/Ikemen-GO/blob/b464672651c87c42aeca10bb5c33003f26d42071/src/char.go#L14297-L14320 )：攻击者与受击者暂停各取各自参数，防御暂停单独处理。

**解释性推断**：将招式数据、顿帧、受击硬直与姿势分开能避免“调了一个时间就改变全部反馈”的耦合。本轮没有把其默认数字或追击预算当DNF官方参数。

### MiniDNF（DNF风格Unity）

- [SkillAttack.cs: ManualUpdate，47起]( https://github.com/v-star0719/U3D_MiniDNF/blob/543839751adbe09eecc896da949945080782b45e/Project/Assets/Scripts/SkillAttack.cs#L47-L70 ) → [Update_Damage，124–153]( https://github.com/v-star0719/U3D_MiniDNF/blob/543839751adbe09eecc896da949945080782b45e/Project/Assets/Scripts/SkillAttack.cs#L124-L153 )：根据技能startTime、interval、times调度。
- [DoDamage，206起；IsInAttackRange，223–255]( https://github.com/v-star0719/U3D_MiniDNF/blob/543839751adbe09eecc896da949945080782b45e/Project/Assets/Scripts/SkillAttack.cs#L206-L255 )：存活敌方、范围接触后调用 BeAttacked。
- [ActorBase.cs: BeAttacked，666–790]( https://github.com/v-star0719/U3D_MiniDNF/blob/543839751adbe09eecc896da949945080782b45e/Project/Assets/Scripts/ActorBase.cs#L666-L790 )：isGod可拒绝受击，通常终止技能/连击准备；扣血后按Frozen/HitMove/HitMoveFreezeInAir/曲线位移选择反馈。
- [ChangeStatus，852起；910–929]( https://github.com/v-star0719/U3D_MiniDNF/blob/543839751adbe09eecc896da949945080782b45e/Project/Assets/Scripts/ActorBase.cs#L910-L929 )：依据高度选地面/空中受击动画，hitMoveTime设置状态持续；后续分别使用下落、躺地、跌落动作。
- HitMoveFreezeInAir清零hitMoveSpeed但此分支未显式清零curFallSpeed；状态名称不等于整个空中轨迹被重置。倒地时间不是累计保护阈值。

**采用结构**：状态选择受击动画，受击后有下落/着地/起身衔接。**不采用**：无法证明的官方保护参数、未经授权的角色资源。

### street-crime（额外深审，补足此前只有README的缺口）

- [player.js: _doAttack，420–456]( https://github.com/isocialPractice/street-crime/blob/777da9e0ebbd5418dd957e1511eac5e4f89fc641/js/entities/player.js#L420-L456 )：按攻击类型选范围/伤害/浮空/效果，方向和景深接触成立后调用 takeDamage、火花、连击与震屏。
- [player.js: takeDamage，509–540]( https://github.com/isocialPractice/street-crime/blob/777da9e0ebbd5418dd957e1511eac5e4f89fc641/js/entities/player.js#L509-L540 )：无敌/死亡/防御检查，扣血，再选择knockedUp或hurt状态。
- [enemy.js: takeDamage，654–681]( https://github.com/isocialPractice/street-crime/blob/777da9e0ebbd5418dd957e1511eac5e4f89fc641/js/entities/enemy.js#L654-L681 )：打断当前strike，扣血，浮空/普通受击分流。
- [_beginHurt，683–695]( https://github.com/isocialPractice/street-crime/blob/777da9e0ebbd5418dd957e1511eac5e4f89fc641/js/entities/enemy.js#L683-L695 )：再次受击延长已有受击计时，不总是重播首帧。代码注释明确指出旧做法使连招期间角色无法播过开头姿势。
- [hitfx.js: HitFX，5–36]( https://github.com/isocialPractice/street-crime/blob/777da9e0ebbd5418dd957e1511eac5e4f89fc641/js/entities/hitfx.js#L5-L36 )：效果类型决定大小/持续，世界位置锚定随摄像机移动，透明度/缩放随时间改变。

**不采用**：_doAttack是在攻击开始立即判定，并非按有效帧持续检查；敌方浮空后 invincible=true 也不符合本项目同键空追规则。本轮只借鉴连续姿势衔接与效果数据分层，不将其整套碰撞移植。

## V9逐函数差异 → 实际修改

V9基准：[起始提交](https://github.com/lgf921375/dnfku/tree/6af364f3e06b0c701df077b53701ac29a994c55e)。V9代码和142项旧测试保留原样作对照，V10继承它并覆写下面的具体函数；V10离线页实际实例化 CombatFeedback 和 drawFeedback，不是仅新增未调用的模块。

| 上游证据 | V9具体函数与缺口 | V10实际修改 | 证据/边界 |
|---|---|---|---|
| OpenBOR checkhit/check_collision；Ikemen clsnCheckSingle | combat-rhythm.mjs attackBoxes，36–41：斜剑大AABB角落也能接触 | combat-feedback.mjs bladeContact，5–20；attackBoxes，23–30：实际手/刀尖线段胶囊与目标盒精判，成立后才交给原核心；半径5/90来自绘制刀刃半宽5px与90px/逻辑单位 | 对角空角/穿过矩形/零长段Node核查；模型命中关键帧。身体盒仍是原逻辑盒，未完成逐姿势身体轮廓 |
| Ikemen hitResultCheck/actionRun | CombatRhythm.resolve，43–68：三段hitstun=.27、hurt=.22；顿帧已有独立两端 | CombatFeedback.resolve，31–46：每段硬直由原active+recovery得255/250/340ms；独立reaction状态和时钟；仍继承既有顿帧/伤害/速度 | 是明确可审查的原创派生方案，不是上游数值或官方DNF参数；手机节奏未验收 |
| OpenBOR set_pain；MiniDNF ChangeStatus | rhythmPose，4–26：统一后仰且hurtDirection未使用 | feedbackPose，4–39：轻击/返斩/重击/上挑/空中/倒地姿势，方向影响倾斜；从实际中断姿势混合到受击峰值再恢复，后手臂亦实际动画 | 关键帧确有姿势差异；原创骨骼美术，尚非成熟DNF角色动作 |
| MiniDNF 下落/躺地/跌落动作 | CombatRhythm.fixedTick，69–76和drawRhythm，50–56：着地环，倒地/空中主要整体旋转 | CombatFeedback.fixedTick，47–58及drawFeedback，67–79：着地缓冲、普通起身过渡；保护起身立即清除普通受击姿势并保持站立 | 正常输入模型有landing/ordinary-stand/forced-stand；新动作过渡仍需浏览器实看 |
| OpenBOR lasthit；street-crime HitFX | 原火花来自AABB交集中心；伤害事件触发音效 | 实际胶囊接触点写回effects，重击方向火花；页面声音按已确认命中及段数触发；新增画布录制控制 | 模型火花已看图；浏览器音效、录制按钮下载未运行，不宣称通过 |

实现文件：[combat-feedback.mjs](../prototype/combat-feedback.mjs)、[feedback-renderer.mjs](../prototype/feedback-renderer.mjs)、[V10离线页](../prototype/feedback-lab-v10.html)、[模板](../prototype/feedback-lab.template.html)、[生成器](../prototype/build-feedback-lab.mjs)。

## 保留规则与真实模型结果

未更改 combat-core、combat-contact、combat-duel、combat-rhythm、原 renderer 和既有测试。保护阈值、重力、倒地持续、最小命中间隔及保护无敌继续沿用，不添加OTG拒绝或空中预算过滤。

模型用原 RhythmDemo 正常输入驱动，不注入HP或目标状态。V10实录事件：三段12/14/22；上挑后空中同键命中；两次落地；落地继续highSlash；ground-limit触发forced-stand。具体时间/位置/状态见 [timeline.json](evidence-v10/timeline.json)。新测试还核查保护期间继续普通输入不扣血。

不能用模型一条连招认定全部反向命中、触控连按、卡帧、高刷新率已覆盖。

## 可见成果与验证

- [8秒V9/V10对比录像](evidence-v10/comparison-model.mp4)：1920×600、30fps、240帧；始终标注MODEL RENDER / NOT BROWSER OR ANDROID RECORDING。
- [轻击/重击对比图](evidence-v10/reaction-comparison.png)、[关键帧](evidence-v10/keyframes.jpg)。人工查看命中、返斩、普通起身图片，确认姿势和接触表现变化。只是变化核查，不是“主观体验达标”。
- [Node日志](evidence-v10/node.txt)：147/147，原142保留；新增5验证精判、正常输入空追/扫地/保护、顿帧时姿势冻结、三段不同姿势与派生硬直、离线页精确嵌入。
- [生成日志](evidence-v10/render.txt)。生成器和新模块语法检查通过。
- [浏览器检查脚本](../tests/feedback-lab-smoke.cjs)：真实页面控件/键盘，非HP/状态注入；需可用Chromium和V10 HTTP页。当前启动失败、0断言；[实际日志](evidence-v10/browser.txt)。
- [浏览器阻塞与结果清单](evidence-v10/results.json)。本地file:导航被策略拒绝后没有绕过；改走正常支持的内部HTTP预览准备，服务启动因proc挂载失败。没有伪造浏览器截图，Cloud Browser没有完成页面操作。

本轮过程中先用patch保存文本造成末尾/换行差异，初始Node批次退出1；随后按GitHub原始文本精确恢复并核对，原142与最终147通过。没有修改旧用例去刷通过，下载文件哈希最终完全匹配。初始批次完整失败stdout未留存，不能补写具体断言详情。

## 未完成与下一步

1. **浏览器操作、浏览器战斗录像是用户要求的未完成项**。当前基础设施阻塞，不能标通过；需在能运行Chromium且允许HTTP预览的环境执行现有脚本，录下普通手动攻击与连招。
2. Android真人横屏、多指摇杆+攻击、音效听感、录制按钮下载、帧率与主观DNF对比未覆盖。
3. 角色仍是骨骼插画；身体盒与旋转/倒地姿势未完全贴合，普通起身仍含尺寸混合，未制作成熟逐帧美术。不能因胶囊改进就称全部接触精确。
4. 不再添加新手感参数来代替验收。下一轮先解除预览环境阻塞并完成实际录像，再按录像和用户体验反馈改画面。
