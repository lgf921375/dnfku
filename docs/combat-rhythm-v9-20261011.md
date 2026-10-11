# V9 三段普攻与动作命中对齐（2026-10-11）

## 结论与边界

新增原创V9可操作HTML、三段同键普攻、武器坐标驱动的有效帧攻击盒、独立双边顿帧、不同空中动量响应、倒地地面锚点与实时参数面板。**不能宣称已达到DNF手游手感**。当前角色仍是原创Canvas骨骼插画原型，尚不具备成熟逐帧角色美术。V8及此前73个文件在修改README/交接前逐Blob校验全一致，旧源码/旧测试未改。

起始main实际核实：`b027febcd3fca6d15616fcb043f271cdca550574`。先通过GitHub连接读取AGENTS、active-handoff、README、V5报告、V8报告及机制研究，随后复核两个上游版本和实际源文件。上传TXT指令已完整读取。

## 上游事实：本轮重新读取，静态通过

| 仓库与固定commit | 文件/证据 | 本轮核查结论 |
|---|---|---|
| MiniDNF `543839751adbe09eecc896da949945080782b45e` | [ActorBase.cs](https://github.com/v-star0719/U3D_MiniDNF/blob/543839751adbe09eecc896da949945080782b45e/Project/Assets/Scripts/ActorBase.cs) 397–411、758–765、920–925 | 下落累计curFallSpeed；落地夹到0并决定反弹/躺地；冻结分支清hitMoveSpeed，不能推断垂直速度统一清零；下落与倒地用不同动画。 |
| 同上 | [SkillAttack.cs](https://github.com/v-star0719/U3D_MiniDNF/blob/543839751adbe09eecc896da949945080782b45e/Project/Assets/Scripts/SkillAttack.cs) 144–153、206–248；[ColliderManager.cs](https://github.com/v-star0719/U3D_MiniDNF/blob/543839751adbe09eecc896da949945080782b45e/Project/Assets/Scripts/ColliderManager.cs) 53–70 | startTime/interval/times调度伤害；攻击范围与敌方盒检查后才BeAttacked；三轴AABB。并非本项目完整保护机制的来源。 |
| Unity-DNF `4436c7212a6e3ed2cb389b2c0c4fa5b6211f79e6` | [ActionUnit.cs](https://github.com/Oceanisher/Unity-DNF/blob/4436c7212a6e3ed2cb389b2c0c4fa5b6211f79e6/Assets/Scripts/Obj/Unit/Control/ActionUnit.cs) 90–126、682–721；[PhysicsUnit.cs](https://github.com/Oceanisher/Unity-DNF/blob/4436c7212a6e3ed2cb389b2c0c4fa5b6211f79e6/Assets/Scripts/Obj/Unit/Control/PhysicsUnit.cs) 182–229、399–407 | 有效伤害、动作帧一致与去重决定攻击者冻结；被动受击顿帧有TODO；动作帧变更更新动态碰撞器。 |
| 同上 | [DisplacementUnit.cs](https://github.com/Oceanisher/Unity-DNF/blob/4436c7212a6e3ed2cb389b2c0c4fa5b6211f79e6/Assets/Scripts/Obj/Unit/Control/DisplacementUnit.cs) 124–131、166–175、227–230 | 冻结时跳过位移计算并将Rigidbody速度设0；不等于双方完整实现已实测。 |
| 同上 | `Assets/Resources/Config/Object/Character/GhostKnight/Action/Hit_1ActionSo.asset`、`Hit_2ActionSo.asset`、`Hit_3ActionSo.asset` 32–36附近 | 三段配置均有frameFreezeInfo.time=200；只是上游毫秒配置，不是官方DNF实测值，未用于直接复制本轮参数。 |

两个上游master本轮HEAD仍分别为上述SHA。GitHub license元数据都为null；完整文件树中未找到覆盖整项目的根许可证。MiniDNF存在libpng/zlib局部许可证，**不覆盖其整个游戏/素材**。只参考设计思想，没有复制上游代码或游戏资源。

## 视频证据与对照：事实 / 推断 / 未覆盖

用户上传 `5578.mp4`：35.898秒、1560×720、59.94fps，SHA256=`fbaf4796a65699ac8cb15d5a45dc9906ab532c9bcfd985e81e37be9b227121e3`。抽看全片每3秒概览、前2秒每0.1秒画面；不是逐帧量测全片。可见抖音水印与“新版本红眼3套一键连招教学”标题、多个技能和不同片段。公共原始URL未验证，作者操作输入与内部判定不可见。

另检索到公开候选 [鬼剑士技能展示（2024-05-22）](https://www.bilibili.com/video/BV1jT421S7vi/)，本轮只读取搜索返回的标题/作者信息，**没有播放此网页视频，未将其作为帧时序证据**。

| 上传参考观测 | V9原型结果 | 仍不一致/未确认 |
|---|---|---|
| 约0.8–1.3秒可见明显动作位移、剑光与强亮命中反馈 | 武器和手臂连续插值；有效帧按相同手部/剑尖坐标生成AABB；交点火花 | 参考包含其他技能，不能认定是三段普攻；原型插画较简化，动作素材量不足。 |
| 约1.4–2秒可见连续近身攻击、弧光与伤害数字 | 三段不同起手/挥击/收招，轻重顿帧和击退不同 | 参考特效遮挡受击姿势，不能从样本准确反推重力/顿帧毫秒。 |
| 概览中有空中姿态与落地后的近身攻击画面 | 真输入演示含上挑、下落进入普攻盒后命中、真实落地与扫地保护 | 不证明复现同一职业技能链；只实现本项目原创实验连招。 |
| 参考画面角色细节、动作数量和特效密度更丰富 | 更换原创骨骼轮廓、披风、分段手臂、膝盖、弯曲躯干和受力姿势 | **视觉品质仍有差距**，需原创逐帧素材或更成熟骨骼动画继续改善。 |

## 本轮实现与实验参数

- `combat-rhythm.mjs`仅新增V9层；V8核心保留。单一highSlash普攻动作分三段，段位随实际起招递进，0.38秒衔接余量，断招/过期重置；不按目标状态改选空追或扫地。
- `rhythmPose`生成关键姿势插值；`rhythmWeapon`与绘图使用同样的肩/肘/手/剑尖变换，攻击盒只在active存在，支持朝向与景深错位打空。**矩形包围盒不是精确剑刃轮廓，斜向盒角落存在保守范围**，下一步可用扫掠胶囊/多小盒细化。
- 首次画面检查发现：早期V9宽盒在武器未触及敌人时已造成伤害。已替换为武器逐帧包围盒，命中火花改到实际两个盒相交的中心。保留此纠错记录。
- 空中普攻第一段采用原速度+1.1并上限6；第二段原速度×0.65+1.5并上限5；第三段原速度−3且至少向下−2.4。站立重斩轻抛3.6；倒地按原V8逻辑累积扫地。数值全部原创实验值。
- 攻击者/受击者顿帧倍率独立，可调0–2；动作和姿势时钟冻结。冻结中按键入缓冲，不能立即取消跳姿势。霸体仍扣血并保留动作；保护阈值与无敌沿用旧核心。
- 默认重力22、倒地0.9秒、空中4次/地面3次/总7次保护、保护无敌0.6秒、90ms命中间隔均继承。面板可实时调整重力、倒地时间、击退倍率、双方顿帧倍率与盒显示。

| 动作 | 前摇 / 有效 / 后摇（ms） | 伤害 | 基础命中顿帧（ms） |
|---|---|---|---|
| 斜斩 | 100 / 75 / 180 | 12 | 45 |
| 返斩 | 85 / 80 / 170 | 14 | 55 |
| 重斩 | 140 / 100 / 240 | 22 | 85 |
| 上挑 | 沿用100 / 70 / 180 | 沿用18 | 70 |

## 验证：通过 / 失败 / 未覆盖

**通过（真实Node）**：旧134项原样回归；完整142项最终通过，exit0。新检查覆盖三段/过期、正常输入完整连招、倒地同动作、打空/保护、双边冻结、不同空中惯性、格挡/霸体与页面嵌入一致性。初次新增测试2项时间断言失败；随武器盒对齐后另有1项固定读取时刻不正确，最终改为等待真实命中事件后量测。最初失败日志保存，不称初次全部通过。

**通过（生产绘制代码运行及看图）**：Skia生成240帧/30fps/8秒连招录像与关键帧，实际结束在保护起身。录像使用同一模型和绘制函数，通过正常输入推进，不注入敌人状态、血量或位置。`timeline.json`保留每帧高度、速度、攻击盒、HP和命中事件；关键帧叠加双类盒。它**不是浏览器录像**，没有DOM布局、触摸事件和实际音频。

**失败（环境）**：Chromium不存在；Playwright下载内容不是有效ZIP。V9浏览器脚本启动exit1，10项预期检查0项执行。没有页面PASS结果，不能用Node/Skia替代浏览器验收。

**未覆盖**：浏览器CSS布局/实际多指触控/音频/全屏；Android手机主观手感、帧率、APK；Unity编译运行；联网与官方机制一致性。当前V9需要用户打开HTML试用并录屏。

复跑：
```
node prototype/build-rhythm-lab.mjs
node --test tests/*.test.mjs
node tests/render-rhythm-preview.mjs
node tests/rhythm-lab-smoke.cjs
ffmpeg -framerate 30 -i docs/evidence-v9/frames/%04d.png -frames:v 240 -c:v libx264 -pix_fmt yuv420p docs/evidence-v9/combo-demo.mp4
```
Skia脚本使用环境变量CODEX_PRIMARY_RUNTIME_NODE_MODULES或DNFKU_SKIA；浏览器脚本使用Playwright及可用Chromium，可通过DNFKU_CHROMIUM指定路径。中间帧不入库，可重复生成。

## 交付与下一步

- [可操作单文件V9](../prototype/rhythm-lab-v9.html)：横屏，左摇杆，右普攻/上挑/格挡；顶部连招演示/调节；键盘WASD或方向键、J/K。
- [模型录像](evidence-v9/combo-demo.mp4)、[碰撞关键帧](evidence-v9/keyframes.jpg)、[原始结果](evidence-v9/results.json)、[时序](evidence-v9/timeline.json)。
- 下一批优先：可用浏览器完整交互验收→用户Android实际触控录像→依据主观反馈细化原创逐帧动作/受击造型→缩小斜剑包围盒误差。未完成前不宣称DNF手感达标。
- 本轮只改dnfku；没有部署/重启，没有修改《皓石传奇三》及原40C/600ms/怪物规则。
