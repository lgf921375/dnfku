# dnfku 当前研究交接

时间：2026-10-11。阶段：公开 GitHub 源码的静态审计，未启动游戏。

## 已完成

- 确认本仓库为用户新建的公开 `lgf921375/dnfku`，GitHub 连接具有 push 权限。
- 审查三仓库的真实 GitHub 文件树、README 及重点 C# 实现，固定上游 commit（见 `docs/source-audit-20261011.md`）。
- 从 MiniDNF GitHub 仅下载 32,552 字节的 `Attack.xlsx` 到 Ubuntu `/tmp/dnf95-github-attack-audit.xlsx`，用 Python 标准库解析四个工作表；录入有实际证据的技能数值。
- 建立 README、AGENTS、源码审计、技能参数和机制报告，防止上下文丢失。
- 所有活动限于 GitHub 文档整理和隔离的只读源码分析；未部署/重启/改写《皓石传奇三》。

## 未覆盖与风险

- MiniDNF 的真实 Unity 编译和安卓 APK/实机；扫地命中与浮空/扫地保护实测。
- 86JP 模拟器与任一 Unity 客户端通信协议兼容性。
- 原作者明确授权的完整客户端+服务端商业发行许可；本轮上游 GitHub license 元数据为 null。
- `DBSkillDamageTable.prefab` 因为二进制/文本接口限制未解码；Excel 参数与实际 Prefab 运行时一致性未核实。
- 下载的 Excel 放在临时目录，不是长期数据仓库；关键信息已提取并入文档。

## 下一步

1. 复核当前仓库 `AGENTS.md`、本交接及已有报告，确认没有同名文件冲突。
2. 深入检查 MiniDNF `ActorBase`、`SkillAttack`、`ObjectCollider` 相关身高/地面攻击命中边界，并优先找可运行但不含原版版权资源的最小复现方式。
3. 确定原创 Android 原型的触摸摇杆、技能键、动作时序、保护策略；先写设计和测试，不擅自拼接两边服务端。
4. 每轮将新证据、上游 commit 和未覆盖项更新到仓库。失败保留失败记录，不刷通过。
