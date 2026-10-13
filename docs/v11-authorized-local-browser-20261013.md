# 一次授权的本地Chrome Headless Shell验收（2026-10-13）

## 结论

**通过（本轮真实运行）**：Node171/171；本地Chrome Headless Shell151.0.7922.34 + Playwright1.62.1，V10原五项5/5、V11公共十三项13/13，exit0，整轮24841ms。页面JS错误、console.error、请求失败均0。连续普攻保护HP保持492，免疫结束后真实新按钮输入造成HP470；演示另覆盖三次扫地和ground-limit。历史V11失败证据仍保留，未删除断言或改变战斗状态制造通过。

**Chromium浏览器沙箱已关闭**。用户2026-10-13 09:59:15（上海）回复“授权”，仅允许当前隔离Work、loopback、一次验收。实际UID/GID0、CapEff0/NoNewPrivs1/Seccomp2；这些宿主状态不等于Chromium内部沙箱启用。没有改宿主策略、sudo、切UID、代理或其它设备。授权已消费，复用记录的预检查实际exit2/EEXIST，没有第二次browser launch。

**未覆盖/待改**：Android APK/真实手机触控/性能、主观手感、DNF官方视频相似度、操作音效、完整DOM录屏、强制超时进程回收、受击盒和人物姿态对齐、中文字体。功能断言通过不等于DNF手游复刻达标。

## 起点与改动

- 先使用已连接GitHub重新读AGENTS/README/工作分支active-handoff及上一轮报告，核对远端工作分支与本地均 `3ce4e5ca0fa194b9656df70344d50c48a9159230`，main仍 `d4e6acfaeddfcb9e953b473f2fcebc5fecc6dec5`；工作区干净。
- 修改 `tests/juggle-lab-local.cjs`：默认依然要求非root+sandbox:true；增加显式授权记录、单次原子消费锁、worker身份nonce校验，仅这一次sandbox:false。保持CI身份拒绝、127.0.0.1绑定、页面请求origin限制和版本核对。
- 缺Playwright专用FFmpeg缓存；不重复下载Chrome、不安装依赖、不伪造缓存安装标记。使用原页面“录制战斗”/“停止并下载”按钮，真实Canvas.captureStream/MediaRecorder输出WebM。
- 修改 `tests/juggle-lab-acceptance.cjs`：只加入页面加载后的录像钩子；十三项业务断言、公共输入与被动采样保持。
- `prototype/**`、`.github/**`、CI V11包装及V10原五项文件均无diff；战斗规则/参数0修改。没有部署或重启，没有触发/重跑Actions，没有接触《皓石传奇三》。

## 本轮结果与真实数据

|检查|状态|证据|
|---|---|---|
|Node171项|通过，171/171、exit0，约519ms|node.tap/node.exit-code|
|本地V10原验收|通过，5/5|results-compact.json中的v10；完整界面PNG和Canvas WebM|
|本地V11公共验收|通过，13/13|results-compact.json中的checks/cases|
|原始页面一致性|通过|V11标题、HTTP200、响应HTML SHA与磁盘文件相等|
|末段挑飞 + 空中真实接触|通过|manual第三击0.99167s，vy4.65667；1.475s下降vy−3.96→3.88667，同一y0.11053、刀刃接触点存在|
|空挥/释放自然落地|通过|高度gravity12压力例、距离/纵深错位、停止新输入后自然落地；重力通过真实面板调整|
|连续攻击保护|通过|2.60833s air-limit，airHits4/totalHits7；HP492→492，剩余免疫0.6→0.33333s|
|保护结束与新输入|通过|缓冲结束HP492；新按钮攻击后HP470，有新damage事件|
|三次扫地保护|通过|demo地面3次、ground-limit，保护前后轨迹/事件完整保留|
|页面JS/控制台/请求错误|通过，均0|errors/consoleErrors/requestFailures数组|
|正常清理|通过|进程exit0，完毕后可见Chrome/测试进程0，loopback server正常close|
|默认root拒绝|通过，预检查exit2、0断言|default-root-guard；没有开启Chrome|
|一次授权不可复用|通过，预检查exit2/EEXIST、0断言|spent-authorization-check.json；原成功证据未覆盖|
|强制超时回收|未覆盖|本次24.841s正常退出，未触发90秒上限|
|视觉/字体/主观手感/Android|未覆盖，存在可见差距|两张关键帧与录像供人工复核|

默认固定30/60/120Hz的游戏输入与浏览器RAF不完全相同。本次continuous触发air-limit，历史#1触发ground-limit；两者均是现有原型合法阈值，本次十三项同时支持并覆盖air/ground保护。保护计数是原创规则，不称DNF官方真实阈值。

## 录像与截图验证

|真实录像|字节|解码帧数|时长|验证|
|---|---:|---:|---:|---|
|v10-browser-canvas.webm|1512763|195|6.465872s|VP8、960×540，全片ffmpeg解码exit0|
|v11-browser-canvas.webm|3533337|509|16.965791s|VP8、960×540，全片ffmpeg解码exit0|

ffprobe `r_frame_rate=60/1`、`avg_frame_rate=0/0`；不得因此声称稳定60fps。195/6.465872与509/16.965791只是录制文件平均约30帧/秒，也不是手机帧率验收。

录像来自**实际浏览器Canvas**，不是Skia模型；不含DOM按钮和音轨，不冒充全屏UI/带声音录屏。8张PNG保存完整界面，完整RAF/HP/事件在原始results.json。截图和WebM全部已生成、哈希记录，ZIP CRC通过。

证据包 `dnfku_V11_local_browser_evidence_20261013.zip`：6261530字节，SHA256 `f6084e89d2e5fb48b96428c3d4eb9ccc9c6599cb5c6fb00e0776ac32288691dd`。含两段真实WebM、8张PNG、完整原始results/RAF和说明；另行持久保存供下载，避免将大录像/重复轨迹加入git。GitHub保留轻量结果、文件哈希索引、授权/消费记录、环境/退出码及恢复交接。

## 视觉事实和推断分开

**事实**：本轮third-lift/air-follow截图仍有中文字方框；本机 `fc-list :lang=zh family` 输出为空。空中追击时火花位于人物渲染轮廓外侧，视觉接触差距仍可见。

**源码事实**：`CombatArena.enemyBox()` 为站立/浮空轴对齐矩形；`drawFeedback()` 在airborne状态根据vy旋转人物并平移，受击盒没有同样的姿态变换。当前接触判断可通过逻辑AABB，不能证明剑刃接触了实际绘制轮廓。

**推断/后续方案**：应优先把人物姿态、武器和受击形状采用同一变换，建立不接触渲染受击区域的负例，再做最小候选修改；同时检查中文字体。不能靠增加震屏/火花或扩大盒掩盖该差距。此轮仅验收，尚未实施这些产品修改或重读新的上游函数。

## 执行命令和恢复

本次实际执行：

```bash
node --test tests/*.test.mjs
DNFKU_LOCAL_AUTHORIZATION_RECORD=/workspace/scratch/fddb459d7ec2/dnfku/docs/evidence-v11-authorized-20261013/authorization.json \
DNFKU_CHROME_EXECUTABLE=/workspace/scratch/27a600746412/local-browser-check/chrome-headless-shell-linux64/chrome-headless-shell \
DNFKU_EVIDENCE_DIR=/workspace/scratch/fddb459d7ec2/dnfku/docs/evidence-v11-authorized-20261013/browser \
node tests/juggle-lab-local.cjs
```

[本轮GitHub证据](evidence-v11-authorized-20261013/)：授权及消费锁、轻量结果、Node日志、录像元数据/完整解码结果、默认root拒绝和复用拒绝、环境、退出码、清理证明。nonce是消费锁运行标识，不是账号凭据；记录已消费，不能拿它在新窗口再次启动。

下一轮先读AGENTS/README/active-handoff及此报告，重新核对远端HEAD、工作区和进程。当前单次授权已用完；保留默认安全入口，不自动再开Chrome或Actions。继续源码/轨迹分析可以在Node中推进，新的浏览器批次依实际授权安排。无需重新下载浏览器或重跑历史失败。最终提交SHA以GitHub回读为准。
