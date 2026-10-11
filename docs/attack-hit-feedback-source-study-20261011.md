# 攻击逻辑与受击反馈：开源源码研究（2026-10-11）

## 结论与范围

**通过（静态检查）**：本轮搜索 GitHub 并固定读取四个战斗项目的真实源码，新增 OpenBOR、Ikemen-GO，复核 MiniDNF、Unity-DNF。OpenBOR 适合研究带景深轴的横版碰撞与倒地追击；Ikemen-GO 适合研究同一招式命中后的顿帧、硬直、受击速度与反馈联动。MiniDNF 更贴近既有 DNF 风格状态机；Unity-DNF 可参考动作帧驱动，但伤害结算存在演示占位。

这不是“找到官方 DNF 完整源码”的结论。没有编译、运行或录制上述四个上游游戏；不能从静态代码认定安卓手感、官方参数、网络协议兼容性。只保存原创分析和上游链接，没有复制大段第三方源码或游戏素材。

dnfku 起始 main：`16413898f3780bebbdb0409d745a65edccfd25bd`。开始前读取 GitHub 的 AGENTS、README、当前交接及 V9/既有源码与机制报告。本轮只更新研究文档，不修改 V9 游戏逻辑，不部署或重启。

## 搜索与筛选

搜索方向包括 DNF Unity、beat em up hitstop、OpenBOR、Ikemen-GO。搜索结果只用于发现候选；结论来自固定 commit 的实际文件读取。搜索未返回某类结果不等于不存在该类项目。

| 项目 | 本轮固定提交 | 参考价值 | 已读许可证边界 |
|---|---|---|---|
| [OpenBOR](https://github.com/DCurrent/openbor) | `787b6770409935137579715febf80cf7a529b748` | 当前动画帧攻击/身体盒、XYZ 接触、攻击 ID 去重、受击/倒地/击退、命中停顿与火花音效 | 根 LICENSE 为 BSD-3-Clause；不由此推出第三方模组或角色素材授权 |
| [Ikemen-GO](https://github.com/ikemen-engine/Ikemen-GO) | `5eb7f3c746632c1d2652a521dab7bc541c1f2edb` | HitDef 数据、双方停顿、硬直/恢复、站立/空中/倒地反应、命中与防御反馈 | 实际 LICENCE.txt 明确引擎及脚本 MIT；指定字体/图标 CC BY 3.0，发行包其他素材可能另有许可 |
| [MiniDNF](https://github.com/v-star0719/U3D_MiniDNF) | `543839751adbe09eecc896da949945080782b45e` | 技能时间调度、逻辑盒、伤害与状态切换、浮空/下落/碰地 | 未找到覆盖整个项目的明确许可证；第三方库许可证不能替代全项目授权 |
| [Unity-DNF](https://github.com/Oceanisher/Unity-DNF) | `4436c7212a6e3ed2cb389b2c0c4fa5b6211f79e6` | 帧伤害窗、命中去重、FreezeStart、动作与物理分层 | 未找到明确全项目许可证 |
| [DNFMobileEX](https://github.com/MusouCrow/DNFMobileEX) | `52d8b965df0734cbf748dbe9b8f84c4e3b49bb0d` | 本轮完整目录与 Launcher 显示 NPK 读取和图片/精灵导出，未展示战斗链；排除为攻击研究主样本 | 根 LICENSE 为 MIT；工具许可不覆盖输入的游戏资源 |

Ikemen 的 GitHub license 元数据为 Other/NOASSERTION，而实际许可证文本明确引擎/脚本 MIT；本报告以实际文本为准。[许可证原文](https://github.com/ikemen-engine/Ikemen-GO/blob/5eb7f3c746632c1d2652a521dab7bc541c1f2edb/LICENCE.txt)。

## 1. OpenBOR：动作帧 → 几何接触 → 条件过滤 → 受击 → 反馈

以下均为源码事实，不代表游戏运行验收。

1. **有效攻击盒来自当前动画帧。** `do_attack` 调用 `checkhit`；后者验证动画、当前帧与目标 vulnerable 标记，扫描该帧 active_status 有效的攻击盒，调用 `check_collision_vs_body` 对目标当前帧身体盒检查。证据：[do_attack]( https://github.com/DCurrent/openbor/blob/787b6770409935137579715febf80cf7a529b748/engine/openbor.c#L31443-L31512 )、[checkhit]( https://github.com/DCurrent/openbor/blob/787b6770409935137579715febf80cf7a529b748/engine/openbor.c#L29490-L29652 )、[身体盒]( https://github.com/DCurrent/openbor/blob/787b6770409935137579715febf80cf7a529b748/engine/openbor.c#L29237-L29275 )。
2. **碰撞含朝向、空间和景深。** `check_collision` 按左右朝向变换 X，按高度处理 Y，并检查 Z 的前后边界；任一轴不交就返回未命中。命中时计算两个盒交集的中心，`populate_lasthit` 保存接触位置供后续反应/火花使用。证据：[坐标与重叠中心]( https://github.com/DCurrent/openbor/blob/787b6770409935137579715febf80cf7a529b748/engine/openbor.c#L29073-L29220 )。这说明横版走位不能只检查水平距离。
3. **几何重叠之后仍有资格过滤。** 排除死亡、无敌/不可触及、阵营不符、next_hit_time 未到；攻击 ID 检查防止同次攻击反复结算。证据：[过滤与去重]( https://github.com/DCurrent/openbor/blob/787b6770409935137579715febf80cf7a529b748/engine/openbor.c#L31514-L31581 )、[更新攻击 ID/下一次允许命中]( https://github.com/DCurrent/openbor/blob/787b6770409935137579715febf80cf7a529b748/engine/openbor.c#L31763-L31774 )。引擎游戏时钟尚未核对，不能将其直接写成固定毫秒值。
4. **OTG 与追击预算是额外策略。** 倒地目标在 OTG_NONE 下被跳过；OTG_GROUND_ONLY 不能打非倒地目标。空中追击成本超出剩余 jugglepoints 也跳过；命中后扣预算，起身时可恢复模型配置点数。证据：[OTG/预算门槛]( https://github.com/DCurrent/openbor/blob/787b6770409935137579715febf80cf7a529b748/engine/openbor.c#L31583-L31606 )、[扣预算]( https://github.com/DCurrent/openbor/blob/787b6770409935137579715febf80cf7a529b748/engine/openbor.c#L31681-L31685 )、[set_rise]( https://github.com/DCurrent/openbor/blob/787b6770409935137579715febf80cf7a529b748/engine/openbor.c#L34932-L34979 )。这里没有证明“达到累计保护条件立即强制起身并短暂无敌”。
5. **伤害结算与痛击动作分开。** `common_takedamage` 先 `checkdamage`，后根据防御结果、死亡/击倒和 pain 策略选反应；击倒分支设置水平速度与垂直 toss，再 `set_fall`；不倒地时可 `set_pain`，也存在不播放 pain 的分支。证据：[common_takedamage]( https://github.com/DCurrent/openbor/blob/787b6770409935137579715febf80cf7a529b748/engine/openbor.c#L39239-L39460 )、[set_pain]( https://github.com/DCurrent/openbor/blob/787b6770409935137579715febf80cf7a529b748/engine/openbor.c#L35137-L35201 )、[set_fall]( https://github.com/DCurrent/openbor/blob/787b6770409935137579715febf80cf7a529b748/engine/openbor.c#L34849-L34929 )。可以借鉴“扣血并不必然打断动作”的分层，但不能把全部 no_pain 情形直接叫作 DNF 霸体。
6. **反馈绑定确认命中。** 处理防御/伤害后生成命中火花；pause_add 延迟攻击者与目标的移动、动画、思考等调度；命中音/格挡音可分别指定，否则采用全局后备。证据：[伤害、火花与双方停顿]( https://github.com/DCurrent/openbor/blob/787b6770409935137579715febf80cf7a529b748/engine/openbor.c#L31688-L31742 )、[play_hit_impact_sound]( https://github.com/DCurrent/openbor/blob/787b6770409935137579715febf80cf7a529b748/engine/openbor.c#L31953-L31985 )。

**已知边界**：`checkhit` 的反击盒检测段明确暂时禁用等待重写（[29655–29663]( https://github.com/DCurrent/openbor/blob/787b6770409935137579715febf80cf7a529b748/engine/openbor.c#L29655-L29663 )）。未完整追踪玩家连招输入/取消链，不能声称本轮已审计 OpenBOR 全部战斗模块。

**适配解释**：本项目普通攻击必须保持同一招式，由实际盒判断能否碰到站立/浮空/倒地目标。不能照搬 OpenBOR 的默认 OTG 拒绝策略再按目标状态切换不同技能。可以保留死亡、无敌、重复命中等必要过滤，并在确认接触后按目标状态选受击反应。

## 2. Ikemen-GO：一个 HitDef 可以产生多种受击结果

以下均为源码事实。

- `HitDef` 分别保存双方 pausetime、guard_pausetime、地面/空中速度、追击成本和 hitonce 等字段。[HitDef 数据]( https://github.com/ikemen-engine/Ikemen-GO/blob/5eb7f3c746632c1d2652a521dab7bc541c1f2edb/src/char.go#L606-L674 )。参数默认值和引擎计时不能直接作为 DNF 官方数值。
- `hitDetectionPlayer` 在已有目标/招式 ID、可受击资格和 juggle 预算检查后，检查 Z depth，再经 `clsnCheck` 执行攻击盒/身体盒交叉并调用 `hitResultCheck`。[命中链]( https://github.com/ikemen-engine/Ikemen-GO/blob/5eb7f3c746632c1d2652a521dab7bc541c1f2edb/src/char.go#L14073-L14231 )。该版本有 Z 深度判断，不能简单声称“只有二维轴”。
- `clsnCheckSingle` 处理盒类型、关闭的盒、免疫过滤、朝向和世界位置/偏移，遍历实际盒求交。[盒判定]( https://github.com/ikemen-engine/Ikemen-GO/blob/5eb7f3c746632c1d2652a521dab7bc541c1f2edb/src/char.go#L10917-L10981 )。
- `hitResultCheck` 区分站立/蹲下/空中防御，防御与受击分别有停顿、硬直、控制恢复时间和速度。[防御判定]( https://github.com/ikemen-engine/Ikemen-GO/blob/5eb7f3c746632c1d2652a521dab7bc541c1f2edb/src/char.go#L11437-L11465 )、[命中/防御时间]( https://github.com/ikemen-engine/Ikemen-GO/blob/5eb7f3c746632c1d2652a521dab7bc541c1f2edb/src/char.go#L11678-L11729 )。
- **同一个 HitDef 内，目标状态决定反应。** 站立、空中、倒地分支采用各自速度、hittime 和弹起条件；倒地不贴地时还可能采用空中分支。[反应分支]( https://github.com/ikemen-engine/Ikemen-GO/blob/5eb7f3c746632c1d2652a521dab7bc541c1f2edb/src/char.go#L11730-L11785 )。这里是“命中后选择受击结果”，不意味着玩家要按三个不同攻击键。
- **顿帧与硬直不是同一个计时器。** pausetime 的两端分别影响攻击者/受击者 hitPauseTime；guard 有独立设置。受击 shake 倒计时结束后才继续减 hittime，起身恢复另有计时。[双方停顿]( https://github.com/ikemen-engine/Ikemen-GO/blob/5eb7f3c746632c1d2652a521dab7bc541c1f2edb/src/char.go#L14313-L14334 )、[受击恢复更新]( https://github.com/ikemen-engine/Ikemen-GO/blob/5eb7f3c746632c1d2652a521dab7bc541c1f2edb/src/char.go#L12607-L12666 )。某些兼容分支有加帧规则，不能概括成统一毫秒换算。
- 同一命中结果区分 hitspark/hitsound 与 guardspark/guardsound；`hitonce` 与目标/HitDef 跟踪控制重复命中。[火花/声音]( https://github.com/ikemen-engine/Ikemen-GO/blob/5eb7f3c746632c1d2652a521dab7bc541c1f2edb/src/char.go#L12064-L12095 )、[hitonce]( https://github.com/ikemen-engine/Ikemen-GO/blob/5eb7f3c746632c1d2652a521dab7bc541c1f2edb/src/char.go#L14337-L14339 )。
- 空中追击预算不足会拒绝后续命中；它与本项目既定“强制起身保护”不同。[预算过滤]( https://github.com/ikemen-engine/Ikemen-GO/blob/5eb7f3c746632c1d2652a521dab7bc541c1f2edb/src/char.go#L14161-L14179 )。不能拿其预算阈值替换现有规则。

**适配解释**：可借鉴“招式数据定义反馈，目标状态修正结果”的结构。动作状态、受击姿势、顿帧、禁止操作的硬直和受击位移需要明确关联，但不能混成一个统一倒计时。

## 3. 两个 DNF 风格样本的实际价值与不足

### MiniDNF

`SkillAttack` 的 ManualUpdate/Update_Damage/DoDamage 依据 startTime、interval、times 调度伤害，对存活敌方做范围检查后调用 BeAttacked。[伤害调度]( https://github.com/v-star0719/U3D_MiniDNF/blob/543839751adbe09eecc896da949945080782b45e/Project/Assets/Scripts/SkillAttack.cs#L144-L153 )、[DoDamage 与范围]( https://github.com/v-star0719/U3D_MiniDNF/blob/543839751adbe09eecc896da949945080782b45e/Project/Assets/Scripts/SkillAttack.cs#L206-L255 )。

`ActorBase.BeAttacked` 中技能 isGod 可提前返回；通常先终止当前技能/连击准备，再计算伤害、扣 HP 和显示反馈；之后依据 Frozen、HitMove、HitMoveFreezeInAir、HitMoveDist/To 分派受击移动。[伤害与反应]( https://github.com/v-star0719/U3D_MiniDNF/blob/543839751adbe09eecc896da949945080782b45e/Project/Assets/Scripts/ActorBase.cs#L678-L790 )。

已有机制报告核查下落积分、碰地反弹与倒地动画/持续时间。HitMoveFreezeInAir 对空中受击清零 hitMoveSpeed，但该分支未显式重置 curFallSpeed；因此不能只凭名称认定它会重置整个空中轨迹。躺地持续时间也不等于累计保护。此处仍未证实完整 DNF 连击保护或安卓手感。详见 [既有机制报告](combat-mechanics-20261011.md)。

### Unity-DNF

`ActionUnit` 主动攻击段需要 HasDamage、匹配伤害帧和命中去重，随后触发 FreezeStart；被动受击段仍有 TODO。[主动/被动链]( https://github.com/Oceanisher/Unity-DNF/blob/4436c7212a6e3ed2cb389b2c0c4fa5b6211f79e6/Assets/Scripts/Obj/Unit/Control/ActionUnit.cs#L90-L126 )。FreezeStart/冻结时间控制见 [682–721]( https://github.com/Oceanisher/Unity-DNF/blob/4436c7212a6e3ed2cb389b2c0c4fa5b6211f79e6/Assets/Scripts/Obj/Unit/Control/ActionUnit.cs#L682-L721 )。

`FightUnit` 的已读结算分支直接返回成功与固定 `10f` 伤害，是演示性占位，不能充当完整伤害公式。[结算占位]( https://github.com/Oceanisher/Unity-DNF/blob/4436c7212a6e3ed2cb389b2c0c4fa5b6211f79e6/Assets/Scripts/Obj/Unit/Control/FightUnit.cs#L68-L79 )。

**结论**：可以研究动作时间窗和停顿触发位置；不能仅因画面或文件名接近 DNF 就认定伤害、保护、受击动画均已实现。

## 4. 与当前 V9 的逐项对照

对照基准是本轮读取的 dnfku 起始提交，非推测本地旧文件。源码：[combat-rhythm.mjs](https://github.com/lgf921375/dnfku/blob/16413898f3780bebbdb0409d745a65edccfd25bd/prototype/combat-rhythm.mjs)、[rhythm-renderer.mjs](https://github.com/lgf921375/dnfku/blob/16413898f3780bebbdb0409d745a65edccfd25bd/prototype/rhythm-renderer.mjs)。

| 项目 | V9 已有事实 | 本轮发现的缺口 / 建议 |
|---|---|---|
| 三段攻击 | 不同前摇/有效/后摇、伤害 12/14/22、顿帧 45/55/85ms | 三段普通攻击在 resolve 中均写 hitstun=.27；建议按招式区分恢复时间，数值须实测 |
| 双方顿帧 | 独立 attacker/victimStop 倍率；实际命中后触发 | 已有基础；需要检查停顿时姿势/轨迹/输入与声音的实际同步 |
| 受击姿势 | damage 后非霸体目标 hurt=.22；rhythmPose 使用统一后仰/手臂/刀角 | 缺少按轻重、方向、浮空阶段制作的受击姿势序列；hurtDirection 被赋值，但当前 renderer 未使用 |
| 空中与倒地 | 按三段改变相对垂速；空中整体旋转，倒地整体旋转/缩放 | 有物理差异但不等同于专门受击动画；需补空中受击→落地→滑行/躺地→起身连续动作 |
| 接触位置 | 有效段使用实际武器手/剑尖 AABB、交集中心火花、lane 检查 | .065 padding 的斜剑 AABB 有角落误差；考虑按帧多盒/线段胶囊，先对真实录像再定 |
| 落地反馈 | land=.18，生成 landing 效果 | 环形效果不能替代角色自身着地缓冲动作 |
| 保护 | 继承已确认保护起身/短暂无敌及命中节奏规则 | 不用 OpenBOR/Ikemen 的 juggle 拒绝命中来替换，不引入按状态换普通攻击 |

**解释性推断**：重复的受击姿势和统一硬直可能削弱三段轻重区分。这是源码可见缺口及合理假设，尚未由浏览器/真人手机对照试验验证；不能认定它是用户手感反馈的全部原因。

## 5. 下一批开发的可审查顺序（本轮未实现）

1. 给三段原有普通攻击增加原创受击配置：攻击者停顿、受击者停顿、硬直、速度变化、姿势类型与恢复过渡。仍以实际攻击盒命中，不按目标状态改成另一招。
2. 先制作轻击、重击、浮空受击、触地与起身的动作过渡；保护起身优先于普通受击，不让效果覆盖无敌规则。
3. 从一次确认的命中事件同时触发姿势、火花、声音和轻震屏；格挡有独立反馈，空挥不触发受击效果。
4. 用实际浏览器及 Android 横屏录像检查刀刃与身体接触、停顿结束后的轨迹、连按与着地。比较录屏和主观反馈，而不是以自动测试数量替代打击感验收。

## 检查与失败边界

- **通过（静态检查）**：读取四仓库固定 HEAD、真实文件树和关键源码；检查许可证原文；完成攻击/受击调用链与 V9 差异对照。源文件 SHA、取证方式见 [证据清单](evidence-source-study-20261011.json)。
- **检索失败并已解决**：OpenBOR 大文件的初次 fetch_file 返回空正文，raw GET 因过大失败；没有将其计为已读，随后使用准确 blob SHA 读取实际源码后才分析。Ikemen 初查 License.txt 路径 404，按真实目录改为 LICENCE.txt 后成功。
- **未覆盖**：四个上游的编译运行/游戏录屏、OpenBOR 完整玩家输入取消链、官方 DNF 数值/保护一致性、上游 Android APK、联网兼容性、V9 本轮浏览器/真人手机复测。
- **没有执行新的功能测试**：本轮是文档研究；V9 既有 142/142 Node 和 Skia 模型录像只作为历史记录，不重复宣布本轮通过。此前 Chromium 缺失、浏览器 0 断言和 Android 未验收的限制继续有效。
