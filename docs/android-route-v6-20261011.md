# Android客户端路线增量评估（V6，2026-10-11）

## 结论（设计建议，未实测）

当前优先把V6浏览器验收和真人Android录像补齐，保留JS模型作为规则与回归参考。最小可安装验证可评估WebView承载现有原创HTML；长期带帧动画、音效与复杂场景的客户端可评估原创Unity 2D工程。**尚未选定正式引擎、没有APK构建结果、没有性能或商业发行结论。**

## 核实的官方资料与当前项目事实

- Android官方说明WebView可在Activity中展示网页、加载HTML，并通过WebSettings启用JavaScript（默认关闭）。来源：[Android WebView文档](https://developer.android.com/develop/ui/views/layout/webapps/webview)，2026-10-11读取。这说明存在承载路径，不证明现有战斗页实机性能已合格。
- Unity官方Android环境设置要求Android SDK、NDK及JDK等依赖。来源：[Unity 6000.3 Android environment setup](https://docs.unity.com/en-us/engine/6000.3/manual/platform-specific/android/getting-started/sdksetup)，2026-10-11读取。工具链版本应随最终选择的编辑器版本核对，不从旧研究硬猜。
- 仓库当前有原创JS模型与离线HTML，没有Android/Unity工程、APK或服务端权威判定。本轮未安装Unity、Android SDK、Gradle，未连接手机。

| 候选路线 | 可复用内容（推演） | 必须新增并验证 | 当前状态 |
|---|---|---|---|
| Android浏览器 | V6离线HTML及JS | 手机开页方式、多指输入、录屏、帧时间、后台恢复 | 未覆盖 |
| WebView最小APK | 原创HTML、状态机和多数测试规则 | Android壳、打包本地内容、输入与生命周期、签名/安装、设备性能 | 未覆盖 |
| 原创Unity 2D客户端 | 原创规则、时序和事件测试向量 | 独立C#实现、原创动画/素材、碰撞盒、触控、Android构建和一致性回归 | 未覆盖 |

## 下一步验收条件（建议）

1. V6浏览器行为通过后，先用真实手机记录同一组上挑/扫地/格挡/霸体对攻。保存输入时刻、有效命中时刻、HP、保护事件与录像；30/60Hz逻辑对照不代替真机帧率测试。
2. 触摸操作、暂停/恢复、长帧后的时序需要专项测试。当前页面每帧将推进量限制为50ms，长时间后台恢复不会补算全部流逝时间；这只是实验页面策略，不是正式Android生命周期方案。
3. 正式路线的选择依据应来自实机输入延迟、帧时间、开发维护成本与原创动画需求。不能仅因为第三方Unity源码存在就直接采用，更不能复制无授权资源。
4. 联网后需独立确定权威伤害、动作命令、时序、安全和账号数据方案；现有双角色同帧换血政策并不是服务端协议。此阶段不部署、不拼接86JP服务端。
