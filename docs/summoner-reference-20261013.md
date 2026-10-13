# 召唤师本人普通攻击参考研究（2026-10-13，进行中）

## 当前检查点

用户目标改为DNF召唤师普攻参考，并明确永久授权隔离Work本地测试。起点工作分支3239a9caa0405813d277e770be123e1f26c4680f、main仍d4e6acfa；新分支work/summoner-reference-20261013。已重新通过连接GitHub读AGENTS/README/active-handoff及相关报告，工作区/可见进程/Actions in_progress与queued均无旧任务。

尚无版本/攻击对象选择回复；当前取证假设为端游召唤师本人站立普攻，不把召唤兽攻击或战斗法师专属普攻当作目标。效果完全一致尚未证实，不能靠改职业名宣称复刻完成。

## 已核实事实

- [Neople官方女魔法师历史竞技场更新](https://www.dfoneople.com/news/updates/622/Arena-Character-Balancing)：Common Basic Attack的首击后摇有增加记录；没有公布精确毫秒。这是历史版本机制，不代表当前手游时序。
- [Neople官方召唤师历史PVP更新](https://www.dfoneople.com/news/updates/221/PVP-Balance-Update/Female-Mage)：Lasher、Mark the Target、Spirit Sacrifice列有取消普攻后使用的规则；没有提供本次普攻刀轨迹/参数。
- [Neople女魔法师角色页](https://www.dfoneople.com/gameinfo/character/Mage(F))实际HTML读到Summoner武器Staff/Rod及官方视频ID Uyc8tspz4Xo、DLNcM_tomKI；尚未观看这两个视频，不能称掌握普攻动作。
- MiniDNF固定543839751adbe09eecc896da949945080782b45e，真实读取Actor.xlsx(blob3185a8bdc716c1d9ba7dc01ad94cc9f04d44604f)，角色文本是狂战士/剑魂/鬼泣/阿修罗及怪物，未检出召唤师/魔法师配置。其鬼剑士数据不得冒充召唤师参数。
- Unity-DNF固定4436c7212a6e3ed2cb389b2c0c4fa5b6211f79e6，真实Config/Object/Character目录仅GhostKnight；未找到召唤师动作配置。两个仓库未有明确可移植许可，仍只做事实研究。
- B站公开[DNF全技能—召唤师](https://www.bilibili.com/video/BV1qFxHeCEA7/)HTML实际HTTP200；gzip解码后标题/视频元数据读取成功：202秒、cid26022052839、1920×1080原页面声明。只读元数据，不等于已看见普攻。匿名view API实际412；媒体取得/观看仍进行中，不绕过认证或安全限制。

## 授权实现及本轮运行

- `docs/local-testing-authorization.json`保存用户原话“永久授权本地测试”、时间及限制。AGENTS追加项目级持续规则，后续不用逐次确认同一项本地测试。
- 本地执行器支持持续记录，每次使用独立证据目录和运行锁；明确显示Chromium沙箱关闭。旧一次授权消费锁仍兼容，不删除历史。
- 本轮Node171/171实际PASS；持续授权路径实际执行V10 5/5、V11 13/13、exit0、errors=[]，新录像在临时独立证据目录（尚待归档）。这验证测试入口，不是召唤师候选通过。
- 未改产品源码、未部署/重启、未改其它项目，main未动。

## 下一步

先从可访问的视频取得明确普攻样本，记录实际观察区间、播放速度与帧率，不能把全技能标题当普攻证据。得到样本后再建立独立召唤师候选和动作/受击对照；高风险美术/参数改动前先远程检查点。若媒体阻断，保存失败并请求可观看参考片段，不猜精确效果。
