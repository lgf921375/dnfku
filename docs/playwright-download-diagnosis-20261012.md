# Playwright 1.62.1 Chromium下载失败：只读诊断（2026-10-12）

## 结论

**通过（真实HTTP诊断）**：当前官方配置的两个ZIP地址都经现有网络/代理链路返回195字节HTML“Site Unavailable / Unable to access this site.”，不是ZIP。HEAD状态200，Range状态206，Content-Type为text/html，Content-Length为195，Content-Range为bytes 0-194/195，重定向0。请求均curl退出0；HTTP成功不能当作浏览器包下载成功。

**失败（下载内容有效性）**：Range实体前16字节为`3c68746d6c3e0a202020203c68656164`，即以`<html>`开头，非ZIP常见本地文件头`504b0304`。本次取得完整195字节HTML，未见“真实ZIP被截断”的证据。这直接解释当前链路无法解压；上轮安装器的原始临时包已不在，不能声称对上轮文件做了逐字节复验。

**未覆盖/未定位**：究竟由源站、CDN、出口代理还是其他访问限制层返回HTML，现有响应不足以定论。不能只因环境设置代理就认定代理配置错误；也不能把它当403、磁盘不足、Chrome系统库缺失或bwrap同一个故障。

本轮不再次安装、不运行DEBUG安装，不改变代理/网络、不使用sudo/关闭sandbox，不修改DNF源码。只执行安装dry-run、HEAD/限量Range、配置/磁盘/缓存只读检查。起始main=`0e35d851402d471b04ef986d8967735f543e820a`，已读取最新AGENTS/README/交接。

## 1. 真实下载地址与来源

主机均为 **cdn.playwright.dev**，HTTPS：

| 浏览器包 | 文件路径 | 地址证据 |
|---|---|---|
| Chromium | /builds/cft/151.0.7922.34/linux64/chrome-linux64.zip | 前两轮实际install输出已有该URL；本轮CLI dry-run复核一致 |
| Headless Shell | /builds/cft/151.0.7922.34/linux64/chrome-headless-shell-linux64.zip | 前两轮安装在Chromium失败后退出，未实际下载到Shell；本轮从当前Playwright dry-run确定配置URL，再实际请求该地址 |

这里明确区分“安装器曾实际使用的URL”和“当前官方CLI确认的后续配置URL”，不猜地址、不使用第三方镜像。

实际命令：

```bash
node "$CODEX_PRIMARY_RUNTIME_NODE_MODULES/playwright/cli.js" install --dry-run chromium
```

退出0；只打印计划，未下载安装。列出Chromium与Shell均Chrome 151.0.7922.34、revision1234。当前Playwright package.json版本1.62.1，browsers.json亦一致，无已见版本不匹配证据。[原始dry-run输出](evidence-download-20261012/dry-run.txt)、[命令/退出码](evidence-download-20261012/dry-run-command.json)、[历史安装日志摘录](evidence-download-20261012/previous-install-log-excerpt.txt)。

包内源码coreBundle.js的cftUrl、DOWNLOAD_PATHS及_downloadURLs表明该x64 Chrome for Testing路径默认镜像为cdn.playwright.dev；customHostOverride由PLAYWRIGHT_CHROMIUM_DOWNLOAD_HOST或PLAYWRIGHT_DOWNLOAD_HOST决定。本轮均未设置，不通过改host找未经核实镜像。

## 2. 实际HTTP响应

使用curl保留当前代理环境与TLS验证，无绕过代理尝试。HEAD跟随最多5次HTTPS重定向、连接超时8秒、总超时20秒；Range仅请求0–4095，最大实体8192字节，避免下载整个大包。四项独立并行执行，均退出0。

| 目标 | 方法 | 最终状态 | Content-Type | Content-Length | Content-Range | 实体下载字节 | 重定向 |
|---|---|---:|---|---:|---|---:|---:|
| Chromium | HEAD | 200 | text/html | 195 | 无 | 0 | 0 |
| Chromium | Range 0-4095 | 206 | text/html | 195 | bytes 0-194/195 | 195 | 0 |
| Shell | HEAD | 200 | text/html | 195 | 无 | 0 | 0 |
| Shell | Range 0-4095 | 206 | text/html | 195 | bytes 0-194/195 | 195 | 0 |

HEAD输出文件包含响应头（271字节），不是响应实体；记录的size_download为0，不将其当ZIP大小。Range响应文件才是195字节实体。

- 响应链含`HTTP/1.1 200 OK`及最终HTTP/2 200或206；前者与HTTPS经代理CONNECT握手相容，不当成另一个ZIP实体状态。
- server为openresty/1.27.1.1；未观察到403、404、502、HTTP 407或curl代理连接错误。没有重定向到其他主机。
- HEAD宣称accept-ranges: bytes，Range确实返回206，却是195字节HTML资源而非浏览器压缩包。
- 再做一次更小的Range 0-255，目的仅为读取195字节提示内容，仍未下载浏览器包。正文标题和提示为“Site Unavailable”和“Unable to access this site.”。[脱敏实体日志](evidence-download-20261012/chromium-body-sanitized.json)。
- 用户请求的检查项和完整允许头字段都写入[response-results.json](evidence-download-20261012/response-results.json)，独立日志见chromium/headless-shell的head/range JSON。没有存储凭据、代理Authorization或带签名的重定向查询。

可复核的请求形态（两个地址均由dry-run输出提取）：

```bash
curl -q -sS --location --max-redirs 5 --connect-timeout 8 --max-time 20 \
  --proto '=https' --proto-redir '=https' --head '<已核实URL>'

curl -q -sS --location --max-redirs 5 --connect-timeout 8 --max-time 20 \
  --proto '=https' --proto-redir '=https' --range 0-4095 --max-filesize 8192 \
  '<已核实URL>'
```

[受控诊断脚本](evidence-download-20261012/request-probes.py)按dry-run提取URL，日志只保存安全头字段并剥离URL凭据/查询，不盲目安装。

## 3. 代理、环境、磁盘和本地浏览器

### 代理：确认被选中，未确认是谁返回错误HTML

- HTTPS_PROXY/HTTP_PROXY及小写对应项已设置，协议http；ALL_PROXY及小写项已设置为socks5h。只记录脱敏主机、端口和是否带凭据；当前值未带用户名/密码。未打印原始代理URL。
- NO_PROXY/no_proxy已设置，有6个条目，包含localhost；用Playwright自身utilsBundle.getProxyForUrl对真实CDN URL求值，结果为非空http代理，noProxyBypass=false。不是未经证实地认为NO_PROXY绕过了CDN。
- Playwright实际httpRequest调用getProxyForUrl，并为HTTPS采用HttpsProxyAgent，这是本轮读取的安装库代码事实。
- 不同执行进程看到的代理端口不同；本轮没有修改任何代理变量，不把某端口当固定系统配置或据此断言配置损坏。
- PLAYWRIGHT_DOWNLOAD_HOST、PLAYWRIGHT_CHROMIUM_DOWNLOAD_HOST、PLAYWRIGHT_DOWNLOAD_CONNECTION_TIMEOUT、PLAYWRIGHT_BROWSERS_PATH、PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD均未设置。
- [环境脱敏快照](evidence-download-20261012/environment-sanitized.json)、[Playwright代理选取实值的脱敏结果](evidence-download-20261012/proxy-selection-sanitized.json)。

结论：代理确实影响请求路径，但尚不能把错误HTML归因于具体代理软件/规则，未绕过代理作直接出口对照。

### 磁盘与缓存

- /workspace/scratch、/tmp、/root/.cache所在文件系统可用约31.68GB（约29.50GiB）；未见ENOSPC错误，现有证据不支持磁盘不足解释。
- ms-playwright缓存仅发现一个88字节.links登记文件，未找到安装后的chromium-1234或chromium_headless_shell-1234程序，也未发现保留的安装ZIP。
- /tmp有Playwright运行目录，不是有效Chromium程序或ZIP缓存；未清理缓存。
- PATH中的google-chrome/google-chrome-stable/chromium/chromium-browser/chrome均未找到；检查/usr/bin、/usr/lib/chromium、/opt/google/chrome、/opt/chromium及默认Playwright缓存位置未发现可复用程序。未声称穷尽任意私有目录。
- [磁盘/缓存/路径检查](evidence-download-20261012/disk-cache-browsers.json)。

### 故障分类

| 分类 | 本轮证据/结论 |
|---|---|
| 下载链路返回错误内容 | **已确认**：ZIP地址返回195字节Site Unavailable HTML |
| CDN本身宕机或官方文件不存在 | **未证实**：没有直接源站对照，未见404/502 |
| 真实ZIP传输截断 | **未证实**：本次收到完整小HTML，不是部分ZIP |
| 旧ZIP缓存损坏 | **未证实**：没有旧ZIP可检查；当前请求本身已无效 |
| 版本不匹配 | **未见证据**：Playwright1.62.1与manifest revision1234一致 |
| 系统库依赖不足 | **未覆盖**：浏览器未下载到，尚未进入浏览器运行阶段 |
| bwrap隔离挂载失败 | 与本轮HTTP/ZIP问题不同；没有启动本地Sites预览或修改隔离 |

## 4. 最小修复与其他环境

1. **优先处理现有出口能否取得真实官方ZIP**：让平台维护者根据cdn.playwright.dev的请求、195字节Site Unavailable响应和当前代理选取结果核查出口访问/代理返回内容。只有拿到有效ZIP后再安装。没有证据就不改网络参数。
2. 本轮不建议盲调超时、不清缓存、不换Playwright版本；这些都不会把当前195字节HTML变成浏览器包。未来若真正出现ZIP中途截断，再按传输/超时方向调查。
3. 不使用未核实第三方镜像，不禁TLS校验，不unset代理，不关闭sandbox或提权。本轮未尝试DEBUG=pw:install，因为日志+dry-run已经提供准确URL；无需再做安装重试。
4. 如果当前环境出口短期无法取得官方包，本地自动脚本需迁移到**已授权、具有匹配Playwright Chromium的QA环境**。本机缺程序，目前原脚本依旧未可运行。
5. 已授权的Cloud Chrome可继续用GitHub Pages HTTPS作UI验收，但它不能等同于本地feedback-lab-smoke.cjs运行；上一轮有效帧率低，流畅度仍须另行核查。不能因网络问题强行绕过隔离。

本轮保存的是诊断脚本、日志、报告和交接，不是浏览器安装成功记录，也没有改变DNF战斗逻辑。
