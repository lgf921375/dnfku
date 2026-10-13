# 召唤师S3：普通攻击命中反馈研究与候选（2026-10-13）

**通过（实际实现与运行）**：在S2本人动作上新增训练木偶、法杖接触精判、每段命中去重、双方短暂停顿、受击形变/推退、接触点火花、轻震屏与可选原创合成声音。Node205/205；真实Chromium49项通过，异常0。S1/S2、旧战斗源码和HTML、workflow保持不变。

**未覆盖**：精确DNF召唤师命中帧/受击盒/伤害/停顿时长、目标浮空/倒地追击/保护、官方美术/音效一致、Android真机及真人打击感。S3是有命中反馈的候选，尚未达到“效果一样”。

## 先审真实源码，再落实反馈

| 真实源事实 | S3落实 | 证据边界 |
| --- | --- | --- |
| [Unity-DNF ActionUnit.cs](https://github.com/Oceanisher/Unity-DNF/blob/4436c7212a6e3ed2cb389b2c0c4fa5b6211f79e6/Assets/Scripts/Obj/Unit/Control/ActionUnit.cs)，OnFightActive确认伤害、动作/帧匹配和去重后FreezeStart | 确认法杖接触后统一impact事件，才扣HP/触发反馈；同一actionId仅一次 | 固定blob19e570ac；该项目被动受击仍有顿帧TODO，不能称原项目已实现完整双方停顿 |
| [Ikemen-GO char.go](https://github.com/ikemen-engine/Ikemen-GO/blob/b464672651c87c42aeca10bb5c33003f26d42071/src/char.go)，actionRun内hitPause判断保护受击/恢复计时 | 停顿时同时冻结动作姿势、目标位移、受击形变年龄与硬直计时；火花独立按反馈时钟消退 | 固定blobffece5eb；是通用结构，不是召唤师数值 |
| [GhostKnight Hit_1ActionSo.asset](https://github.com/Oceanisher/Unity-DNF/blob/4436c7212a6e3ed2cb389b2c0c4fa5b6211f79e6/Assets/Resources/Config/Object/Character/GhostKnight/Action/Hit_1ActionSo.asset)明确是鬼剑士，freeze配置200 | S3另设41.7/41.7/66.7ms可比较候选，未套用200 | 原版召唤师停顿仍需实际命中参考 |

本轮直接重读固定提交实际文件，没有复制其代码或素材。OpenBOR指定区间接口返回空内容，未把它标成本轮复核成功。新增[2019召唤师修炼场讲解](https://www.bilibili.com/video/BV1rb411H7ho/)公开HTML/元数据和playAPI取得，但1MiB与更小256KiB媒体均超时；未观看到其动作/音频，不能据标题声称取得本人普攻命中样本。精确版本仍按既有“端游召唤师本人”假设。

## 参数事实、推演与原创选择

S2骨架/法杖几何继续使用已有空挥片段的视觉估计。S3用当前绘制的法杖整段（杖尾至杖尖）对木偶头/躯干/腿三个原创身体盒做胶囊精判，先筛前方和景深。接触点直接投影到火花；斜段大AABB的空角不视为命中。半径2.1是原创容错值，非官方碰撞半径；未实现完整逐姿势轮廓或高速扫掠检测。

| 候选项 | 首段 | 第二段 | 第三段 |
| --- | ---: | ---: | ---: |
| 有效帧半开区间（0起） | [4,6) | [11,14) | [20,23) |
| 双方停顿（120Hz固定步） | 5步/41.7ms | 5步/41.7ms | 8步/66.7ms |
| 地面推退（原创单位） | 3 | 4 | 8 |
| 木偶扣HP（初始120） | 8 | 10 | 14 |
| 受击形变/硬直候选 | 180ms | 220ms | 280ms |

上述全部是原创试验参数，不能当原版数值。第三段暂用较明显的地面形变/推退，不根据空挥片段推导目标浮空。本人抬脚仍只是S2动画姿态。木偶HP耗尽后不再命中，按“重来”恢复。

空挥、距离不足、背向或错位目标没有命中火花/伤害/停顿/撞击音。反馈开关关闭时保留实际接触与扣HP，清掉反应/停顿/效果，便于对照。连按缓冲和长按沿用原UX，停顿仍可接收缓冲。声音勾选后，通过用户操作启用AudioContext，仅对已确认impact播放原创短音；不含DNF音频。浏览器验证的是上下文运行/音频缓冲调度，未做扬声器听感或音频回录。

## 实际验收与环境纠错

- Node205/205：原192保留，新增13个有意义的接触/空挥/去重/双边冻结/缓冲/镜像/帧率输入等价/重置/合成音频检查，exit0。
- Chromium：旧V10 5、V11 13、S3空挥动作12、S3命中反馈13、手机尺寸触控6，共49项，exit0；pageerror/console.error/requestfailed均0。手机尺寸仅390×844与844×390、桌面Chromium合成touch，非Android真机。
- 浏览器内部查看横屏完整画面与主攻击键、中文UI；113个页面汉字在新离线字库中齐全。实际Canvas录像帧已查看，原始3段录像SHA与大小匹配且全段ffmpeg解码退出0。S3录像存在重复DTS警告，保留原文；不据编码帧率断言稳定游戏FPS。录像不包含DOM或声音。
- 修复前文件143065088字节/SHA72ed668d崩溃。缓存HeadlessShell ZIP287项全CRC通过，包内二进制196975952字节/SHAe11fc9ce与上轮成功记录匹配。解压至独立scratch目录后--version退出0、151.0.7922.34，与PW1.62.1/rev1234匹配。没有重下载或修改旧损坏文件；未修改宿主策略/权限。
- 恢复后二次最小sandbox:true尝试，浏览器明确报“Running as root without --no-sandbox is not supported”，浏览器退出1。这是修复后本次直接失败依据；不反过来将先前SIGSEGV定性为同一原因。开发浏览器验收沿用已保存长期授权sandbox:false，HTTP127.0.0.1；没有云浏览器、Actions、部署或其它项目操作。
- 反馈结果旁文件保存成较早running/11项状态，最终主results.json却有完整13项通过；已经从主结果原子重写旁文件并核对一致。不隐藏保存差异，不将主结果缺失的断言补算为通过。

[轻量结果与文件哈希](evidence-summoner-s3-20261013/results.json)、[参考事实与失败](evidence-summoner-s3-20261013/reference.json)、[Node原始输出](evidence-summoner-s3-20261013/node-205.tap)、[沙箱true实际失败](evidence-summoner-s3-20261013/sandbox-true-result.json)。原始浏览器主结果及本轮原创Canvas录像单独归档；原DNF片段、帧、签名URL和内部PNG均不交付。

[离线S3页面](../prototype/summoner-lab-s3.html)：按X/长按攻击或整套参考演示，勾选声音；用空挥、命中反馈、错位目标开关对照。S1/S2保留。最新提交以实际远端回读为准。下一步优先补对应版本召唤师本人普攻打中普通目标的可靠视频，再校准有效帧、停顿、受击/浮空和音色。

交付证据包254504字节/9项CRC通过，独立取回已保存版本SHA b6da55cf完全匹配；本轮测试录像3188572字节/独立取回SHA df5fcfd4完全匹配。无原DNF媒体或内部PNG。
