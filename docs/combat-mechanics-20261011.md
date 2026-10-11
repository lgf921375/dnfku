# 战斗机制审计：已知行为、疑点和测试方案

## 已核实的机制

1. **受击链**：`SkillAttack.DoDamage()` 遍历敌人，先过滤已死目标，再调用 `IsInAttackRange()`，命中执行 `ActorBase.BeAttacked()`。
2. **倒地仍可能受击**：`ActorBase.isAlive` 只排除 `Die/Dead`，不排除 `BeAttackedLieOnGround` 和 `BeAttackedFallDown`；因此没有因存活筛选直接封锁扫地攻击。不过尚未实测。
3. **浮空和触地**：`BeAttackedFallOff` 使用重力与速度积分；落地依据阈值选择反弹或躺地。`FALLDOWN_BOUNCE_SPEED=-40f`、`FALLDOWN_BOUNCE_FACOTR=-0.4f`、`STAND_ON_GROUND_THROLD=5f` 是项目原始代码值，不能直接移植成安卓屏幕像素单位。
4. **倒地状态**：`BeAttackedLieOnGround` 等待 `statusDuration` 后转 `Idle`（或 `Die`）；没有在已读分支中看到累计扫地次数保护。
5. **倒地视觉位置调整**：`ActorBase.isLieDown` 置 true 时角色坐标原点上移半个配置身高，恢复时向下移动并夹到地面，需与碰撞盒和动画原点联测。
6. **命中盒**：`SkillAttack.IsInAttackRange()` 构造以 `damageArenaRadius` 为边长数值的 Vector3 盒，与敌人配置盒交叠检查；在已查该分支中未使用 `damageArenaSize`。这里不应据此断定整个项目所有技能皆如此。
7. **再次命中**：`BeAttacked()` 根据效果重新设置受击位移，并通过 `ChangeStatus()` 重置状态计时；能支持重新触发受击，不能等同于原版 DNF 完整连击机制。

## 尚未找到可证实的机制

- 浮空伤害累计/保护阈值
- 扫地次数/时间保护
- 保护后强制起身及无敌帧
- 明确区分站立攻击、低位扫地、空中追加攻击的全套命中规则
- 真实安卓触屏、不同帧率及联网权威判定

“未找到”仅表示本轮已读源码内没有证据，**不是证明整个仓库绝对不存在**。

## 推荐隔离测试矩阵（待执行，不宣称已通过）

| 测试 | 目标观察 | 状态 |
|---|---|---|
| 上挑一次 | 记录起跳 Y 速度、最高点、着地时间 | 未覆盖 |
| 普攻第3段击飞 | 对比上挑与普通攻击的高度、反弹 | 未覆盖 |
| 浮空中重复命中 | 记录 `curFallSpeed` 是否被重置、状态计时 | 未覆盖 |
| 怪物倒地后使用低位攻击 | 记录攻击盒与目标盒实际碰撞及伤害 | 未覆盖 |
| 倒地连击不中断 | 记录躺地时间是否更新、是否可无限重置 | 未覆盖 |
| 拟议保护机制 | 先确定原创规则，再验收强制起身及无敌窗口 | 未覆盖 |
| Android 触摸 + 30/60Hz | 测试输入缓冲、命中停顿、帧率独立性 | 未覆盖 |

## 架构方案边界

短期可做**单机原创战斗原型**验证手感；多人联网需单独设计服务端权威、命中事件、序列、延迟与防作弊，不把两个不同项目的客户端服务端未经核实地直接拼接。所有新增参数应明确标注为“原创设计/测试值”，不可冒称 DNF 原版参数。

---

## 2026-10-11 续研：倒地命中高度、受击冻结与起身时序

**证据范围**：仅通过已连接的 GitHub 工具，复核 MiniDNF 上游固定 commit `543839751adbe09eecc896da949945080782b45e` 的实际 C# 文件；该 SHA 与本轮上游 `master` HEAD 一致。**状态：通过（静态检查）**；未执行 Unity、APK、实机或实时战斗测试，所有实际体验结论仍为**未覆盖**。以下明确区分源码事实、风险推断与待测项目。

### 新证据 A：倒地等待时间直接依赖本次受击的伤害配置

- **源码事实（通过，静态检查）**：`ActorBase.ChangeStatus(BeAttackedLieOnGround)` 在切换倒地动画后，设置 `statusDuration = SkillAttack.GetDamageDuration(damageConf)`；`SkillAttack.GetDamageDuration()` 返回 `startTime + interval * (times - 1)`，此处未读取独立的扫地保护阈值或起身时长配置。依据：[ActorBase.cs 920–926](https://github.com/v-star0719/U3D_MiniDNF/blob/543839751adbe09eecc896da949945080782b45e/Project/Assets/Scripts/ActorBase.cs#L920-L926)、[SkillAttack.cs 379–382](https://github.com/v-star0719/U3D_MiniDNF/blob/543839751adbe09eecc896da949945080782b45e/Project/Assets/Scripts/SkillAttack.cs#L379-L382)。
- **源码事实（通过，静态检查）**：`ActorBase.Update()` 中 `BeAttackedLieOnGround` 和 `BeAttackedFallDown` 都会在 `timer > statusDuration` 时进入 `Idle`（HP>0）或 `Die`；`ChangeStatus` 每次设 `timer=0`。依据：[ActorBase.cs 414–431](https://github.com/v-star0719/U3D_MiniDNF/blob/543839751adbe09eecc896da949945080782b45e/Project/Assets/Scripts/ActorBase.cs#L414-L431)、[ActorBase.cs 852–857](https://github.com/v-star0719/U3D_MiniDNF/blob/543839751adbe09eecc896da949945080782b45e/Project/Assets/Scripts/ActorBase.cs#L852-L857)。
- **解释性推断（待运行验证）**：某些伤害项的起始时间较短，可能让落地后的躺地持续时间也短；该计算式并不是 DNF 官方倒地保护规范。不能据此宣布已复现“快速起身”。

### 新证据 B：技能命中盒与物理碰撞盒是两条独立路径

- **源码事实（通过，静态检查）**：`SkillAttack.IsInAttackRange()` 调用 `ColliderManager.IsCollision` 时，使用以 `damageArenaRadius` 构造的三轴等长攻击盒，目标中心使用 `enemy.objectbase.realLocalPos + (0, actorConf.size.y/2, 0)`、目标尺寸使用 `enemy.actorConf.size`；该分支不直接读取 `enemy.objectcollider.realPos / size`。依据：[SkillAttack.cs 223–255](https://github.com/v-star0719/U3D_MiniDNF/blob/543839751adbe09eecc896da949945080782b45e/Project/Assets/Scripts/SkillAttack.cs#L223-L255)。
- **源码事实（通过，静态检查）**：`ActorBase.Init()` 将 `objectcollider.size = actorConf.size`；但 `ObjectCollider.realPos` 还叠加 `center` 和按 collider 类型计算的半高。该物理碰撞路径与技能伤害命中路径不等价。依据：[ActorBase.cs 193–216](https://github.com/v-star0719/U3D_MiniDNF/blob/543839751adbe09eecc896da949945080782b45e/Project/Assets/Scripts/ActorBase.cs#L193-L216)、[ObjectCollider.cs 11–45](https://github.com/v-star0719/U3D_MiniDNF/blob/543839751adbe09eecc896da949945080782b45e/Project/Assets/Scripts/ObjectCollider.cs#L11-L45)、[ColliderManager.cs 54–71](https://github.com/v-star0719/U3D_MiniDNF/blob/543839751adbe09eecc896da949945080782b45e/Project/Assets/Scripts/ColliderManager.cs#L54-L71)。
- **源码事实（通过，静态检查）**：播放 `BeAttackedFly` 或 `BeAttackedLieOnGround` 时 `isLieDown = true`，其 setter 将角色逻辑坐标原点上移 `actorConf.size.y/2`；恢复时下移并限制到地面，不存在已读分支中同步切换倒地专用的扁平命中盒。依据：[ActorBase.cs 149–174](https://github.com/v-star0719/U3D_MiniDNF/blob/543839751adbe09eecc896da949945080782b45e/Project/Assets/Scripts/ActorBase.cs#L149-L174)、[ActorBase.cs 1006–1027](https://github.com/v-star0719/U3D_MiniDNF/blob/543839751adbe09eecc896da949945080782b45e/Project/Assets/Scripts/ActorBase.cs#L1006-L1027)。
- **解释性推断（待运行验证）**：倒地后盒体可能与动画视觉区域不匹配，造成部分低位技能命中率异常。是否真能扫地、位置差多少，需要保存每帧逻辑坐标、伤害盒与动画帧可视化后判断；不能从上述事实直接宣称“无法扫地”。

### 新证据 C：命中计算可能混用局部坐标与世界坐标

- **源码事实（通过，静态检查）**：`IsInAttackRange()` 的 `Attacker/Target/AttackObject` 伤害中心分别取对应 `realPos`，但受击者盒中心取 `realLocalPos`；`ObjectBase` 明确分别实现 `realPos` 与 `realLocalPos` 的读写和坐标转换。依据：[SkillAttack.cs 223–255](https://github.com/v-star0719/U3D_MiniDNF/blob/543839751adbe09eecc896da949945080782b45e/Project/Assets/Scripts/SkillAttack.cs#L223-L255)、[ObjectBase.cs 53–93](https://github.com/v-star0719/U3D_MiniDNF/blob/543839751adbe09eecc896da949945080782b45e/Project/Assets/Scripts/ObjectBase.cs#L53-L93)。
- **解释性推断（待运行验证）**：若角色存在非零父节点平移或其他层级变换，两个坐标空间可能不一致；目前未检查具体场景层级，不能将此定为已复现的 bug。需用零偏移/非零偏移两组场景对照。

### 新证据 D：空中受击冻结没有直接清零下落速度

- **源码事实（通过，静态检查）**：`HitMoveFreezeInAir` 在角色 `realLocalPos.y>0` 时清零 `hitMoveSpeed` 并切换 `BeAttackedFrozen`，该分支没有显式设置 `curFallSpeed=0`。冻结状态到时，若仍在空中则切换 `BeAttackedFallOff`，其后使用 `curFallSpeed += falldownAcc * deltaTime` 更新。依据：[ActorBase.cs 758–770](https://github.com/v-star0719/U3D_MiniDNF/blob/543839751adbe09eecc896da949945080782b45e/Project/Assets/Scripts/ActorBase.cs#L758-L770)、[ActorBase.cs 337–350](https://github.com/v-star0719/U3D_MiniDNF/blob/543839751adbe09eecc896da949945080782b45e/Project/Assets/Scripts/ActorBase.cs#L337-L350)、[ActorBase.cs 397–411](https://github.com/v-star0719/U3D_MiniDNF/blob/543839751adbe09eecc896da949945080782b45e/Project/Assets/Scripts/ActorBase.cs#L397-L411)。
- **解释性推断（待运行验证）**：冻结期间位置更新暂缓，解除后可能沿冻结前保留的速度继续下落；不能宣称实现了 DNF 标准的浮空悬停/保护。
- **源码事实（通过，静态检查）**：普通 `HitMove` 会重新写入 `hitMoveSpeed = damage.hitMoveSpeed` 并切换受击状态，`BeAttackedHitMove` 积分更新 `curFallSpeed`；再次受击能重置部分状态参数，不等于累计保护机制。依据：[ActorBase.cs 750–757](https://github.com/v-star0719/U3D_MiniDNF/blob/543839751adbe09eecc896da949945080782b45e/Project/Assets/Scripts/ActorBase.cs#L750-L757)、[ActorBase.cs 352–375](https://github.com/v-star0719/U3D_MiniDNF/blob/543839751adbe09eecc896da949945080782b45e/Project/Assets/Scripts/ActorBase.cs#L352-L375)。

### 可复核检查点（本轮仅制定检查方案，全部未覆盖）

| 检查 | 操作与记录字段 | 通过条件（待执行） | 结果 |
|---|---|---|---|
| 落地时序 | 单次上挑和三段普攻分别记录 `damage.ID,startTime,interval,times,statusDuration,timer,status,y` | 实际倒地时长与触发配置和状态机一致 | 未覆盖 |
| 低位扫地碰撞 | 怪物倒地前后逐帧记录 `realPos,realLocalPos,actorConf.size,objectcollider.realPos/size,damageCenter` 及 AABB 三轴间隔 | 能确定倒地状态下哪些技能实际命中 | 未覆盖 |
| 父层级坐标偏移 | 相同场景分别以 0/非 0 父节点平移触发同一攻击 | 明确命中是否受坐标空间混用影响 | 未覆盖 |
| 空中冻结衔接 | 先上挑、再施加 `HitMoveFreezeInAir`，逐帧记录 `curFallSpeed` 与冻结结束后的轨迹 | 确认速度是否保留、落地时间是否受影响 | 未覆盖 |
| 再次攻击与保护 | 空中和倒地各重复命中并记录状态和伤害累计 | 确认是否有实际连击保护、强制起身及无敌窗口 | 未覆盖 |
| 安卓实机 | 原创无侵权资源原型在 30/60Hz 输入同一连招 | 实测动作时序/命中判定稳定 | 未覆盖 |

### 失败与边界

- **失败**：本轮未执行编译/运行测试，无可证实的测试失败结果；不把“未找到保护逻辑”写成“已验证不存在”。
- **未覆盖**：Unity 运行、安卓 APK、场景父层级真实分布、倒地命中与保护实测、Prefab 与 Excel 生效一致性、官方 DNF 参数与商业许可。
- **下一轮**：优先在不引入 DNF 版权素材、不接入外部服务端的前提下制作数学最小复现/Unity 隔离场景，再评估原创打击手感方案。绝不触碰《皓石传奇三》部署、账号或玩法规则。
