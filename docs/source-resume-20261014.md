# 从保存点继续：召唤师职业源码核查

用户22:20要求“如果还在执行请不要中断，中断了请从断处接着执行，不要重复执行完成的”。本轮先只读核对进程、仓库和交接，再继续未完成的召唤师/女法师专属来源，不重做前轮核心、连段与验收。

## 恢复结果

**通过（保存点恢复）**：本地启动时HEAD为旧快照`135628ff2583ca45afa6b7116bb1f2e08583d8fb`，工作区干净；最新交接报告在该快照不存在，首次读取返回exit2。远端工作分支实际为`68756ba1e68152e4c118314c276a8efcb64b9691`，tree `714adaf8479e6c6d608558ac18fe940256308e62`。fetch后仅fast-forward恢复既有提交，没有重新编写或重建源码页，也没有丢弃本地改动。

实际进程检查没有正在运行的本项目Node验收或Headless Shell，未终止任何已有进程。已恢复原动作页、60个导入文件、12+10项Node和15项浏览器的历史实证。**本轮运行测试：未执行**；这些历史PASS不算新的验收。恢复后已读最新真实交接与报告；本轮仅更新研究文档和执行约定，不改产品、参数、运行库或测试。

## 新查到的来源与结论

所有下列commit和文件/树SHA都由真实GitHub接口固定；原始Gitee源站另用只读`git ls-remote`核对。没有下载图片、音效、客户端包，也没有导入未确认职业范围的代码。

| 新查仓库 | 固定commit / 许可 | 本轮可核实范围与结论 |
| --- | --- | --- |
| [cloud8352/Dfqo](https://github.com/cloud8352/Dfqo) | `ada151f0eabdcaec386087d736a5b295863fcfad` / Apache-2.0文件存在 | Gitee DFQ扩展镜像；默认source439、config4174条目录未截断。新增Fighter、Iori、Kyo、Tsunade等角色目录，未取得召唤师普攻文件集合。 |
| [Highnesslin/Dfqo](https://github.com/Highnesslin/Dfqo) | `72dbbc08de45346da431bee666717ae99fa0d56e` / Apache-2.0元数据，LICENSE Blob同上 | 默认源码树与cloud版只有`actor/ai/MobaHeroMove.lua`不同，不是另一个已经实现召唤师的职业库。 |
| [baidwwy/dnf-godot](https://github.com/baidwwy/dnf-godot) | `e8d13dc8a3c3018476da61fcae4af9a30da8438b` / MIT原文件已读 | README自述城镇Demo。法师创建按钮存在，但`Main.gd`角色加载只处理SWORDMAN/FIGHTER；角色图片目录只fighter/gunner/swordman，未找到法师战斗入口。 |
| [PatrickZhu0/DF_GO](https://github.com/PatrickZhu0/DF_GO) | `a85f9fbdbd2aa86e9e1b83b726c36bb240905d21` / 许可元数据null、完整659条树无LICENSE文件 | `character_animation_config.gd`明确预载Swordman动画，`warrior_skill_config.gd`读取swordman资源；不能据通用PVF解析器推定召唤师已完成。未选择分发此代码。 |
| [prs-0x9/DNF-Godot](https://github.com/prs-0x9/DNF-Godot) | `5b876247b16f2d9957395ecac4d8ff6623065700` / MIT元数据 | README的DNF是Did Not Finish，项目是赛车游戏，与目标职业无关。已排除。 |
| [trianglestrip/template-beat-em-up-dnf](https://github.com/trianglestrip/template-beat-em-up-dnf) | `ba9542d79b013b6446af1501f74dea3fcde0dcfc` / MIT元数据 | README为类似Streets of Rage的通用横版模板；1593条未截断目录无目标职业命名。没有把它当作召唤师源码或改换当前引擎。 |
| [Lucky-Koishi/AS2_Shoot-the-mages](https://github.com/Lucky-Koishi/AS2_Shoot-the-mages) | `14cf2ca8255be964104770c042346d20438fa434` / 许可元数据null、6文件无LICENSE | README为Flash STG，Player/Entity/Bullet脚本不是目标三段近身普攻实现；未导入。 |

**通过（静态核查）**：Gitee原站`danielbrain/dnfsingle` HEAD与master均为e8d13dc8，与Godot镜像相同；`ct243768648/DFQ-Original` HEAD/diy与镜像ada151f0相同。不是把网页不可读误判成源站不存在。

DFQ镜像另外枚举22个分支、21个独立commit。默认分支已经读取，后续按树SHA去重：追加核对39个source/config树入口，其中source使用完整递归树，config先限定actor再读取17个独立actor配置树；这些调用没有失败或截断。对应Mage/AtMage/Magician/Summoner及中文职业命名路径没有命中。**此项只是目录/职业路径核查，不证明所有动态配置中都没有法师，更不证明全网没有源码**；但本轮没有得到能直接接入的召唤师普攻源码和帧数据集合。

`baidwwy/dnf-godot/src/scripts/UI/characterCreate/CharacterCreate.gd`的`_on_mageBtn_toggled`只切换选择与说明图片；`Main.gd`的`init_player`加载分支没有MAGE。其`Attack.gd`音效也直接引用swordman。已保存精确Blob SHA，不用“界面有法师”当作“法师战斗已实现”。

GitHub代码搜索出现的`mage.chr`也只是格式检查器样例文件名或教程描述，未取得真实角色文件及配套ANI/ATK；没有采用教程作者自行估计的攻击框作官方数据。

## 失败、未覆盖与继续位置

**失败已处理**：恢复前读取新报告不存在；恢复成功后读取真实最新版。一次Gitee网页tree不可读，改用GitHub固定镜像并以Gitee真实refs复核。Godot整树请求一次transport closed，改为有界src/addons/assets子树读取成功。部分网页open不可读，真实GitHub文件接口可读；未把这些错误记作源码不存在或运行失败。

**未覆盖**：上述新候选的Godot/Flash实际启动、Android运行、素材使用范围；召唤师本人普攻职业控制与准确帧数据、原DNF效果一致、PK累计保护与完整死亡销毁。本轮没有新的职业实现接入，现有源码连段页的测试职业仍为鬼剑士。不能因研究候选增多而称召唤师已经完成。

续接时先对照远端工作ref和本地HEAD，恢复干净的旧快照；保留原运行日志。继续工作优先寻找明确的女法师角色加载入口、普通攻击状态、原帧/命中框定义及其版本和许可证。新增来源必须先核对这些文件；当前已排除的菜单、赛车和STG候选不用重新走一遍。旧12+10/15检查只有在对应代码发生新变更时才需要按相关范围验证，不重复重做已经完成的实现。

[来源/分支/文件SHA实证](evidence-source-resume-20261014/summary.json)记录恢复前后状态、7个候选、15个实际读取文件、22分支和有界目录检查。复刻产品保存点仍为`68756ba1e68152e4c118314c276a8efcb64b9691`；本轮只有文档变更，最终工作ref以实际远端回读为准。
