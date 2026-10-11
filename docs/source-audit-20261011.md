# 上游源码审查（2026-10-11）

## 固定上游版本

| 项目 | commit | 本轮确认 |
|---|---|---|
| [MiniDNF](https://github.com/v-star0719/U3D_MiniDNF) | `543839751adbe09eecc896da949945080782b45e` | Unity工程、战斗代码、Excel原始参数 |
| [Unity-DNF](https://github.com/Oceanisher/Unity-DNF) | `4436c7212a6e3ed2cb389b2c0c4fa5b6211f79e6` | Unity工程、动作/碰撞/物理模块 |
| [86JP 模拟器](https://github.com/bigsmallliao/86JP-DNFServerS4A12) | `4e2f25e04f604b7081cc42eb0f4d8c9a20a8ed05` | C#/.NET服务端工程 |

三仓库的 GitHub `license` 元数据本轮均为 `null`；**没有据此确定商业使用许可**。仓库内嵌第三方代码/素材需另审。

## MiniDNF：真实调用链

- `Project/Assets/Scripts/SkillAttack.cs`：`ManualUpdate → Update_Damage → DoDamage → IsInAttackRange`；命中后调用 `enemy.BeAttacked(actor, damage, skill)`。
- `Project/Assets/Scripts/ActorBase.cs`：`BeAttacked` 计算伤害并根据 `damageMoveEffect` 进入 `BeAttackedFrozen`、`BeAttackedHitMove`、`BeAttackedHitMoveDist`、`BeAttackedFallDown` 等状态。
- 同一文件 `BeAttackedFallOff` 在更新中应用 `falldownAcc`、`curFallSpeed`，接地时可能反弹或进入 `BeAttackedLieOnGround`。
- 同一文件 `isAlive` 仅排除 `Die`、`Dead`；正常倒地不会自动从 `DoDamage` 的存活筛选中被剔除。
- `Project/Assets/Scripts/ColliderManager.cs`：`IsCollision(center1,size1,center2,size2)` 用三轴 AABB 判定。
- `Project/Assets/Scripts/ConfigTemplates/DBSkillDamageRecord.cs`：定义每次伤害的 `startTime`、`interval`、`times`、`damageArenaRadius`、`damageArenaSize`、`hitMoveTime`、`hitMoveSpeed` 等。
- `Project/Assets/Scripts/SkillState.cs`：技能 CD 递减与状态管理。
- `Project/Assets/Configs/Attack.xlsx`：四个 worksheet 的实际表格已被独立解析，明细参见参数报告。

**静态代码通过**：存在浮空、下落、接地反弹、躺地、受击及命中检查链。

**未覆盖**：Unity 真机行为、实际扫地连续命中、完整连击保护、多人联机、Android 运行。

## Unity-DNF

- `Assets/Scripts/Obj/Unit/Control/PhysicsUnit.cs`：依动作帧生成、调整和清除 `BoxCollider2D`。
- `Assets/Scripts/Obj/Unit/Control/ActionUnit.cs`：动作状态机、受击切换、主动攻击命中帧停顿。
- `Assets/Scripts/Obj/Unit/Control/DisplacementUnit.cs`：跳跃初速度、重力/位移及顿帧时速度处理。
- `Assets/Scripts/Obj/Unit/Control/FightUnit.cs`：基础碰撞和伤害结果，但读取到固定 `10f` 伤害，带演示性。

**未覆盖**：完整扫地保护、APK 运行与服务端配套。

## 86JP 服务端模拟器

- `Server/DfoServer.sln`、`Server/DfoServer/DfoServer.csproj`：真实服务端工程。
- `Server/DfoServer/GameWorld/Dungeon.cs`：从 PVF 的 `dungeon.lst`、副本数据解析地图/迷宫配置。
- 文件树含 `Game/Accounts/`、`Game/Characters/`、`Game/Skills/`、`Game/Dungeon/`、`Game/Inventory/`、`Network/`、`Game/Session/`。
- README 表明需要适配的 86JP PC 客户端与 `Script.pvf`；仅下载源码不能直接运行；当前仍有 Bug。

**结论**：存在服务端源代码，但与两个 Unity 客户端的协议、素材和游戏规则兼容性完全未证实。

## 审查方法与限制

目录与文本代码来自 GitHub API。原始 `Attack.xlsx`（32,552 字节）从公开 GitHub URL单独下载到远程 Ubuntu 服务器 `/tmp/dnf95-github-attack-audit.xlsx`，使用 Python 标准库 `zipfile` / XML 只读解析，无依赖安装。二进制 Unity `DBSkillDamageTable.prefab` 无法直接通过文本接口读取。没有下载、运行或编译游戏工程。
