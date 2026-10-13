# V11保护失败纠错与本地安全入口（2026-10-13）

## 结论

**通过（历史证据核对 + 本轮Node运行）**：V11 #1的已报告失败由测试条件遗漏合法 `ground-limit` 导致。原Artifact中保护触发后HP没有继续改变。本轮按历史RAF间隔、明确声明的公共输入延迟复现相同groundHits=3/totalHits=6/HP504，并验证整个保护期及恢复。本轮未修改战斗源码、保护阈值或手感参数。

**失败/阻塞（本轮本地环境）**：UID/GID0；新安全本地入口实际退出2，未启动浏览器或HTTP服务，浏览器断言0项。不切用户、不关闭Chromium沙箱、不伪造CI变量、不安装浏览器或修改代理。本轮没有触发/重跑Actions，没有部署或重启。

**未覆盖**：修正后的V11浏览器13项、新本地V10五项、真实沙箱内部诊断、录像生成/超时回收的运行验证、Android APK/手机触控/性能、官方手游普攻逐帧匹配、主观手感。171项绿灯不代表复刻达标。

## 接管和去重

- 从已连接GitHub读取AGENTS.md/README.md/active-handoff.md、V11参考报告和实际源码/测试。
- 起始 `main=d4e6acfaeddfcb9e953b473f2fcebc5fecc6dec5`，新clone核对同一HEAD；初始未checkout产生的全文件D是新clone状态，并非旧工作窗口删改；随后填充新checkout。
- 独立分支 `work/v11-local-20261013`；无旧未提交更改被覆盖。
- GitHub最近12条run均completed；随后独立查询in_progress=0、queued=0。本机/proc未发现dnfku测试/Chrome进程。**无法观察别的隔离窗口是否仍有人编辑**；用户两窗口互传方式继续适用。
- 本轮只操作dnfku；不接触《皓石传奇三》或其任何服务/数据。

## 原始失败：事实和推断分开

事实：
- [V11 #1 run38214754382](https://github.com/lgf921375/dnfku/actions/runs/38214754382)，job114696788116，attempt1、failure。原V10五项同run通过。
- [Artifact11732530314](https://github.com/lgf921375/dnfku/actions/runs/38214754382/artifacts/11732530314)真实下载2597562字节；29项ZIP CRC全部通过。SHA256 `8f086504f39d1b1c4f350e5747fc205e832dca7e1a87224a90a143abdf32e464` 与GitHub digest一致。
- 原V11结果前三项PASS，第四项FAIL；后续六项未执行，不能写10项全失败或通过。
- continuous: forced-stand在2.13333s、reason=ground-limit、airHits=0、groundHits=3、totalHits=6。触发该保护的第三次扫地从HP526扣至504（该击本身合法）；之后没有damage事件，2.475s仍invulnerable，remaining=0.2583333s，HP504。
- 原断言 `hp===protectedHp && (airHits===4 || totalHits===7)`。Artifact没有独立保存局部变量protectedHp，不能声称从文件直接读到了它；但第二个条件在真实stand上必为false，足够解释本次失败。触发一击后的HP、最终HP以及事件共同支持该窗口内没有后续伤害。
- 原WebM实测VP8、960×540、6.040秒、编码25fps。已解码并查看第三击/追击/失败PNG；编码帧率不代表游戏或手机稳定帧率。

推断：
- 现有证据表明这次报错是断言遗漏扫地保护；没有证据要求修改战斗保护。未复跑新浏览器前，不排除其他独立问题。
- 历史air-follow截图的火花与所绘身体存在可见间距，逻辑AABB接触与旋转人物绘制可能不一致；这是视觉差距，不证明事件中的逻辑碰撞为空。中文文字显示方框，字体渲染未验收。

## 最小改动和保持范围

- `tests/protection-evidence.cjs`：根据实际settings及stand.reason检验air/ground/total阈值；独立验证HP、damage事件、RAF样本和保护生命周期。负例证明确实能拒绝不合法阈值/掉血/瞬时变动。
- `tests/juggle-lab-acceptance.cjs`：提取公共输入/断言；旧连续保护一项拆为合法阈值、不受伤害、缓冲结束保护历史、免疫结束新输入可受伤四项，共13项。有效帧/空挥/自然落地/扫地/保护原覆盖保留。
- `tests/juggle-lab-smoke.cjs`：CI包装继续保留非root、GITHUB_ACTIONS=true、RUNNER_ENVIRONMENT=github-hosted检查；仍明确关闭沙箱，仅限原授权CI范围。未修改workflow或V10原五项文件。
- `tests/juggle-lab-local.cjs`：独立本地包装，拒绝root/CI身份、严格核对Playwright manifest与Shell版本；显式chromiumSandbox:true，headless模式不传完整Chrome的channel选项；HTTP仅127.0.0.1、只提供两份确切HTML，浏览器请求限当前loopback origin。先原V10五项，再共享V11十三项。
- 本地入口带15秒launch/navigation、12秒一般检查、90秒整轮期限、Node堆384MiB/renderer-process-limit2、状态/日志/退出码、失败PNG/WebM/逐帧JSON；正常finally清理，SIGTERM及有进程身份校验的子树硬回收。**资源限制不是OS完整内存配额；录像、超时和进程回收尚未实际运行验收。**
- 没有往HP/坐标/状态/计数中写值制造通过；浏览器evaluate只采证，调节重力仍通过真实面板。
- `prototype/**`、`.github/**`、`tests/feedback-lab-smoke.cjs` 全部无diff；不用新战斗参数掩盖旧失败。

## 本轮实际命令与结果

|命令/检查|结果|边界|
|---|---|---|
|`node --test tests/*.test.mjs`（修改前）|153/153 PASS exit0|Node v24.19.0|
|`node --test tests/combat-protection-evidence.test.mjs`|18/18 PASS exit0|公共basic/tick输入；包括历史间隔+声明延迟、20/30/60/90/120Hz×3个起始延迟|
|`node --test tests/*.test.mjs`（修改后）|171/171 PASS exit0，约436ms|不是浏览器/Android性能|
|新增/修改5脚本 `node --check`|全部exit0|静态语法|
|新本地入口（真实UID0）|exit2，blocked-environment，0断言|没有launch/server，不称No usable sandbox实际失败|
|CI wrapper在真实UID0运行|exit1，检查0项|限制生效；未伪造环境、未触发Actions|
|产品/workflow/V10原验收无diff|`git diff --name-only HEAD -- prototype .github tests/feedback-lab-smoke.cjs` 为空|只改测试与交接|

本轮安全本地命令（已执行、预检查退出2）：

```bash
DNFKU_CHROME_EXECUTABLE=/workspace/scratch/27a600746412/local-browser-check/chrome-headless-shell-linux64/chrome-headless-shell \
DNFKU_EVIDENCE_DIR=/workspace/scratch/fddb459d7ec2/dnfku/docs/evidence-v11-local-20261013/local-browser \
node tests/juggle-lab-local.cjs
```

环境实测：Playwright1.62.1、Shell151.0.7922.34，manifest revision1234，二进制SHA256 `e11fc9ce65c96313476f7ee9844b6fb6a9220fb048693cfe9eee00acf4170a9f`，HTML SHA256 `9ab585f72a6d170d168a56e257567c6b00feda925026e980dde37c779aa0c6b7`。检查耗时约230ms。执行工具无声明user/uid/gid参数；现有Shell只是文件，不等于可安全运行的Chrome进程。系统ffmpeg/ffprobe存在；当前Playwright缓存未见其专用ffmpeg安装，不能假定recordVideo已可用。未来普通用户环境须核实匹配的Playwright录像依赖，不通过伪造缓存标记替代安装。

## 证据与恢复

**GitHub同步已经核实**：本地检查点commit34deafb8569c62e8707e92b10c431822eeab485a；命令行git push缺凭据exit128。已通过连接GitHub的Git data API写入独立分支并回读commit7dabdaafe0159c1a54c3c49c6544283731416a98，本地/远端tree均ebdccad3cc0a55d7e2bc65f698ce5bd6d6ae365d，已fetch回本地；main仍d4e6acfa。不能声称CLI push成功。此次记录与“新按钮攻击”断言改以缓冲结束时的HP/事件为基线（防旧缓冲造成假通过）会再提交，最终HEAD由远端回读。

[本轮证据目录](evidence-v11-local-20261013/):
- `historical-replay.json`：原RAF间隔与摘要；输入延迟2/120秒是**明确声明的复现选择**，原鼠标时间戳未保存，不称精确全输入重放。
- `node-protection-trajectory.json`：实际Node保护前后轨迹；Node结果不冒充新浏览器轨迹。
- `node-final.tap` / `node-final.exit-code`、`static-and-guards.json`、`local-browser/**` / `ci-root-guard/**`：真实命令/结果、环境版本/路径/状态。
- `historical-index.json` / `historical-continuous.json`：原始文件SHA/size、失败片段、伤害和保护事件。完整ZIP与原PNG/WebM另在下载证据包中保存，避免在git反复放大录像。历史Artifacts期限2026-10-26。
- 此报告与active-handoff随工作分支提交；最终远端SHA须回读，不能在提交前编造。

下一步：
1. 先读本交接、AGENTS/README/此报告，确认main与工作分支HEAD、无旧写进程，不重复启动。
2. 在平台原生普通用户环境重新检测现有PW/Shell/录像依赖，然后执行安全本地入口；若sandbox:true仍失败，留证停止，不改宿主策略。当前环境无法提供非root入口，不能自动迁移旧Actions的无沙箱授权。
3. 新本地V10五项/V11十三项和真实PNG/WebM未通过前，此分支保留WIP。无需自动再跑Actions或把它合入main。
4. 先解决实际浏览器覆盖及轨迹/绘制接触差距；再继续已有固定SHA/许可证的上游研究、取得独立男鬼剑士普攻真实视频样本。**本轮没有新看官方视频或重读新的上游函数**，不把旧报告引用冒充新研究。
5. Android真机触控、帧率、手感继续独立验收；正式手游、网络客户端/服务端尚未完成。
