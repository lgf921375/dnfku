# MiniDNF 技能表实际参数（2026-10-11）

**数据来源**：[`Project/Assets/Configs/Attack.xlsx`](https://github.com/v-star0719/U3D_MiniDNF/blob/543839751adbe09eecc896da949945080782b45e/Project/Assets/Configs/Attack.xlsx)；32,552 字节；工作表 `sheet3.xml` 为伤害配置，`sheet2.xml` 为动作配置，`sheet1.xml` 为技能基本信息。以下均为第三方项目的数据，**不是官方 DNF 参数**。速度单位尚未做游戏世界坐标换算。

| 攻击 | damage ID | 伤害% | startTime(s) | hitMoveTime(s) | damageMoveEffect | hitMoveSpeed(X,Y) |
|---|---:|---:|---:|---:|---|---|
| 鬼剑士普攻1 | 10011 | 100 | 0.45 | 0.3 | HitMoveFreezeInAir | (10,0) |
| 鬼剑士普攻2 | 10012 | 110 | 0.2 | 0.3 | HitMoveFreezeInAir | (10,0) |
| 鬼剑士普攻3 | 10013 | 120 | 0.35 | 0.3 | HitMove | (100,150) |
| 上挑 | 10021 | 130 | 0.3 | 0.3 | HitMove | (100,400) |
| 十字斩1 | 10031 | 80 | 0.3 | 0.3 | HitMove | (100,0) |
| 十字斩2 | 10032 | 100 | 0.3 | 0.3 | HitMove | (200,0) |
| 裂波斩抓取 | 10041 | 50 | 0 | 0.5 | HitMoveTo | 未配置速度，另有 hitMoveTo=130|80 |
| 裂波斩连伤 | 10042 | 20 | 0.5 | 1.9 | Frozen | interval=0.1 秒，times=6 |
| 裂波斩结束 | 10043 | 100 | 0 | 0.3 | HitMove | (300,0) |

对应 `sheet2.xml`：
- 角色普攻第1、第2、第3段分别映射 `10011 / 10012 / 10013`；第1、2段 `comboStartTime=0.5`。
- 上挑：`skillID=100002`，伤害 ID `10021`，动画 `UpStroke`。
- 十字斩：`skillID=100003`，伤害 ID `10031|10032`。
- 裂波斩：`skillID=100004`，伤害 ID `10041|10042|10043`。

多数以上伤害配置的 `damageArenaRadius=180`，`damageCenterType=Attacker`，`damageArenaType=FrontArena`。必须按字段名与其对应 Excel 列识别，不能单靠截图猜数字。

### 避免误判

- `hitMoveSpeed` 是配置输入；不能直接将其解释为屏幕像素/秒。
- `Frozen`、`HitMoveFreezeInAir` 具体作用应以代码分支为准，不能仅按名称推断。
- 技能参数存在 ≠ 实战中对倒地怪必定命中；需核查碰撞高度与动作帧。
- 原版 DNF 的浮空保护/扫地保护阈值尚无证据；**不填写编造的阈值**。
