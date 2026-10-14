# 现成DNF同人代码接入：DFQ原Lua核心

用户“差距还是很大。可以直接复刻用的dnf代码。不要自己从零开发。”本轮停止继续扩展原创召唤师战斗模型，改为直接导入、执行现成模块。起点local/remote `de8985016cfc451628ac6f5abb841fb719ff169f`，tree `98296b46d577419ca3d75797ad51b2238c10681e`，工作区干净。真实AGENTS、README、交接、S9报告与文件已读；独立于其它窗口和《皓石传奇三》，无并行代理。

## 已做成的接入

[源码运行页](../prototype/dfq-source-lab.html)为可下载的离线单文件；[导入锁](../prototype/vendor/dfq-original/source-lock.json)记录原仓库、commit、每个文件Git Blob与SHA256；[原许可证](../prototype/vendor/dfq-original/LICENSE)和作者说明保留。

选定 [2DScrollGames/DFQ-Original](https://github.com/2DScrollGames/DFQ-Original/tree/d4b9088d9e6efeede3e504d3b6e64e3a459aa012)，固定commit `d4b9088d9e6efeede3e504d3b6e64e3a459aa012`，Apache-2.0。它自述为DNF同人小游戏、原环境LÖVE0.10.2；不是Neople官方客户端源码。

**通过（原字节核对）**：导入33个Lua模块+6个Lua配置+LICENSE/README共41文件，全部Git Blob与上游一致。独立克隆只检出源码和所需配置；没有导出原DNF图片/音效/客户端资源。用户明确要求复用代码，所选代码有明示许可证；保留全部许可证、作者头与第三方credit，不以其它库许可证替代项目授权。

**直接执行，未转写算法**：浏览器和Node通过Fengari Lua VM解析执行原模块。核心没有改成新的JavaScript战斗状态机，也没有继承S9原创受击逻辑。主要真实调用如下：

| 原模块 | 本轮执行内容 |
| --- | --- |
| `actor/gear/attack.lua` | `Enter/Update/DefaultCollide`：输入配置、阵营/禁攻/死亡/去重门槛、碰撞、双方停顿、受击、伤害事件 |
| `graphics/drawunit/solidRect.lua`、`rect.lua` | `CollideWithList/Collide/CheckRect`：xy与xz两个投影共同确定三轴接触 |
| `actor/service/battle.lua` | `Hitstop/Stun/Flight/Turn/DieTick`：原停顿、受击禁用检查、方向、浮空入口；死亡清理完整流程未接入 |
| `actor/state/duelist/flight.lua` | 原五阶段浮空、升降转换、落地反弹、低位受击动画槽及落地转down |
| `stun.lua/down.lua/sit.lua/itimeEnd.lua` | 原硬直、倒地计时、起身禁攻与到时切换 |
| `actor/system/attacker.lua`、`states.lua` | 原停顿计时解除与状态更新 |
| `actor/system/attributes.lua`、`service/attribute.lua` | 原被击回调扣HP、范围钳制 |
| `easemove.lua/valueMotion.lua/timer.lua` | 原位移力量衰减、固定小数与毫秒计时 |

原第三段测试链：碰撞→双边停顿→flight→五阶段/反弹→down→sit→stay；对应输入是源项目鬼剑士普通攻击配置。太刀原配置hitstop100/selfstop50ms；down500ms、sit150ms。在17ms测试步长下实际分别510/153ms，不把离散步量化值说成精确500/150ms实测。

## 已核实的候选与职业缺口

- MiniDNF固定HEAD `543839751adbe09eecc896da949945080782b45e`，当前GitHub许可证元数据null；README明确只做鬼剑士基础技能及部分狂战士技能，不能当成召唤师源码。
- Unity-DNF固定HEAD `4436c7212a6e3ed2cb389b2c0c4fa5b6211f79e6`，当前许可证元数据null；未选为直接分发基础。
- ArcticFox_DNF_1.0固定HEAD `f08a363a94583748f124be73691e18c1f00759d1`，MIT文件存在；代码树列出男鬼剑士，依赖Galaxy2D/GGE，README对原素材及使用范围另有说明。未导入该项目素材或宣称能在浏览器直接运行。
- onlyGuo/dnf-client-public固定HEAD `b3ba16b07280dab30c15088f9fb3d848e841ffdb`实际README是Electron登录器，未当成战斗客户端。
- 本轮GitHub代码树/仓库与两引擎检索没有取得可直接复用的召唤师本人普通攻击专属实现。DFQ中`buff/summon.lua`与哥布林summon不是召唤师普攻；不能因文件名有summon就替代职业代码。没有声称全网不存在。

可选问题“接战斗核心还是整个游戏”没有收到答案，按保留召唤师目标、先接通用核心推进。召唤师专属攻击尚未完成；原鬼剑士配置仅作为具来源的模块测试输入，没有冒称召唤师数值，也没有修改S9后称新职业已接入。

## 适配层与测试输入

这不是整个DFQ客户端移植：`dfq-platform.lua`提供无障碍空舞台、实体列表、显示/声音/资源占位与Point3/Color的有限FFI表兼容；`dfq-fixture.lua`负责建立测试实体、提交输入、开启/关闭碰撞窗口；JS只负责Lua调用、快照和占位轮廓显示。原游戏状态/停顿/碰撞/HP模块保持原字节。

测试HP120、攻击属性12、几何体和网页68ms接触窗口属于显式夹具输入，不是测得的官方DNF属性或召唤师帧数据。原攻击代码在Enter中含0/1随机伤害，首个命中伤害12，先空挥再命中可能为13；没有覆盖成固定数字。没有新增原创PK累计保护来冒充上游已经实现。

当前环境没有Unity/C#运行器或Lua命令行。实际安装仅限新工作目录的Fengari包，`--ignore-scripts`，不更改系统依赖/宿主策略。Node解析器实际0.1.5；浏览器预编译fengari-web0.1.4，MIT及依赖许可证保留，npm锁保留。没有冒称原LuaJIT/LÖVE完整程序已启动。

## 通过、失败与未覆盖

**开发失败**：适配层最早Lua声明语法错误，探索装载退出1，修正的是自有适配文件；没有修改导入模块。

**Node首失败保留**：8项执行7PASS/1FAIL，预期sit结束后stay，实际flight。原因是测试保持攻击窗口开启，禁攻解除后源库正常重新检测到命中；正确测试应关闭窗口再验证自然站立。补“持续窗口解除禁攻后命中”及“先空挥消耗原伤害随机数”回归后，最终 **10/10 PASS、exit0**。中间9/9日志也保留。

**浏览器首失败保留**：11项执行1PASS/10FAIL、exit1，错误选择npm CommonJS bundle使`module/fengari/dfqLab`未定义；横屏按钮bottom405.48也越界。改用项目文档指定的浏览器`fengari-web.js`，并改横屏高度预算195→255。

**第二轮失败保留**：10PASS/1FAIL、exit1。高位空挥再低位攻击的实际伤害13、HP107，断言误写108；修正断言为真实伤害事件与HP差相符并增加源库随机回归，未修改源库RNG或产品行为。

提交前全量`git diff --cached --check`对上游原文件、未改动的原始TAP日志及许可证拼接末尾空行报空白问题；为保持原字节未清理这些内容。排除vendor与原始实证后的自有代码/文档检查通过。

**最终通过**：浏览器 **11/11 PASS、exit0**，旁结果与主结果一致，page/console/network/Lua错误0。覆盖实际Lua模块装载、碰撞扣HP、独立停顿、去重、浮空反弹/落地/倒地/起身、景深拒绝、高位/低位、霸体、离线字库及手机尺寸touch。390×844无横向溢出、按钮≥44px；844×390画面/浮空测试按钮同屏。内部PNG已实际查看，不作为交付或保存截图。174汉字齐全，构建SHA确定。

按既有长期本地授权：恢复Shell151.0.7922.34/PW1.62.1，Chromium沙箱关闭，HTTP127.0.0.1；无部署/重启/Actions/云浏览器/其它项目操作。旧S1–S9/V10/V11浏览器与旧273项Node本轮未再跑，不计入新10/11。

[实证目录](evidence-source-reuse-20261014/)保存三次浏览器原始JSON/日志、三次Node日志与最终SHA摘要，包含全部失败；不含浏览器截图或原DNF资源。代码和报告随现有Git分支同步，没有重复保存仓库代码包。

**未覆盖**：召唤师本人专属普攻/技能/帧动画，官方DNF代码及数值一致性；完整DFQ客户端、LÖVE资源、ECS/地图/职业控制与动作有效帧；完整死亡销毁、PK累计保护，有限FFI之外的LuaJIT兼容；原版美术音效、真实Android硬件与手感。源码模块跑通不能称DNF复刻完成。

下一步在明确上游职业实现、运行平台与帧数据基础上接职业层；先补召唤师专属代码或有依据的数据，继续沿用所选源码核心，不再靠原创参数模型填补这些缺口。最新代码检查点与最终ref以远端实际回读为准。

最新代码检查点（远端对象已回读）：`499375a816c0ef0d11e3881d51d9977d753c08f0` / tree `62eed4ccb19b3c0cc6631ccf81b31170483e152c`，与本地完整树一致；后续仅本报告/交接记录检查点，最终工作分支ref以实际回读为准。
