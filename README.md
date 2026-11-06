# Layerwise · 3D 打印成本与报价工具

面向英文用户的独立工具站。原生 HTML/CSS/JavaScript，无前端运行依赖、付费 API、账户系统或服务器端数据存储。已接入用户提供的 HilltopAds 横幅和点击弹窗代码；Ahrefs 保持空白，未使用外部字体。

## 本地预览

可以直接双击本目录的 `index.html`，无需安装依赖或启动服务。样式、计算器、报价下载和辅助页面均支持本地文件打开；分享链接在本地预览时只能在同样拥有这些文件的设备上打开，对外分享需要先上线。

如果需要 HTTP 预览，安装 Node.js 后在本目录运行：

```sh
npm run dev
```

打开 http://127.0.0.1:4173 。服务只监听本机。

```sh
npm test
npm run build
```

不需要 `npm install`。`npm test` 验证成本、失败率、利润率、加价率、平台费用、批量金额和边界条件。`npm run build` 把上线文件复制到 `dist/`，不包含开发服务器、测试和文档。

## 首版功能

- FDM：克数、每公斤价格；树脂：毫升数、每升价格。
- 耗材示例预设、时间、电力、机器折旧/维护、人工、其他费用、失败率。
- 两种报价方法：目标销售利润率、成本加价率；可计入比例和固定平台费用。
- 批量报价、客户报价 TXT 下载、打印或浏览器另存为 PDF。
- 客户报价不包含内部成本和利润；“Copy breakdown”专门复制内部明细。
- 本地自动保存；分享链接使用 URL fragment，排除项目名称。
- USD/EUR/GBP/CAD/AUD 币种标签，不进行汇率转换。
- 响应式布局、键盘交互、FAQ、计算说明、隐私、条款、404 和 WebApplication 结构化数据。

所有默认成本和耗材价格都只是示例，不是实时市场价格。所有输入按单个合格成品分配；同板多件需要先自行分摊材料、打印时间和人工。失败率只放大材料、耗电和机器成本，人工与其他费用计一次。报价按分向上取整，再乘件数，保证单位价格和批量金额一致。

## GitHub + Cloudflare Pages 部署

1. 把项目放入自己的 GitHub 仓库。
2. 在 Cloudflare Pages 连接该仓库，框架选 None，构建命令 `npm run build`，输出目录 `dist`。
3. 当前正式域名为 `https://layerwise.luqihang594241.workers.dev/`，记录在 `package.json` 的 `homepage` 中。构建默认使用此域名生成 canonical、og:url、sitemap.xml 和带 Sitemap 声明的 robots.txt；遗漏 `SITE_URL` 也会生成文件。改域名时设置构建环境变量 `SITE_URL=https://新的正式域名`（不含子路径）后重新构建发布，变量优先于 `homepage`。源码根目录也已提供当前域名的 `sitemap.xml` 和 `robots.txt`，支持直接发布；直接发布源码且更换域名时需同步更新两文件和 `homepage`。
4. Workers 静态资源目录为 `./dist`；Pages 输出目录为 `dist`。构建命令均为 `npm run build`。重新部署后确认 `/sitemap.xml` 能打开。
5. 使用自己的账号验证 Google Search Console / Bing Webmaster Tools，提交 `/sitemap.xml`。这不保证收录、排名、AI 引用或流量。

还可以把 `dist` 交给其他支持商业用途的静态托管。资源和站内链接使用相对路径，支持本地文件打开或子目录预览。自动生成 canonical 和 sitemap 的构建配置按最终域名根目录上线。未替用户创建仓库或执行公网发布。

## HilltopAds 和 Ahrefs 接入位置

编辑源文件 `index.html`，然后重新构建部署：

- **Ahrefs：** 在 `<head>` 中找到 `AHREFS_ANALYTICS_START` / `AHREFS_ANALYTICS_END`，将你后台的统计代码粘贴到这对注释之间。
- **HilltopAds 横幅（已添加）：** 搜索 `HILLTOPADS_BANNER_START`，位于首页正文之前的 `#ad-dock` 中，外层宽度为页面的 100%，随页面正常滚动。素材保持原比例居中，小屏按可用宽度缩小；固定尺寸广告本身不会被强行拉伸。右侧仅有 × 关闭按钮，本次页面访问关闭后不再出现，刷新页面恢复。无填充时不占高度，不遮挡导航和计算器。不要重复添加。
- **HilltopAds 弹窗（已添加）：** 搜索 `HILLTOPADS_POPUP_START`。用户新提供的 `bold-consequence.com` 地址返回 HTML 广告跳转页，已按用户要求改为点击 Build your quote / Copy breakdown / Share estimate 时调用 `window.open`；原按钮功能继续执行，不拦截输入、关闭、重置和材料切换。同次页面访问仅尝试一次；浏览器决定以新标签页还是新窗口打开，也可能阻止弹出。该 URL 不作为 `<script src>` 加载，旧 `expensive-pollution.com` 脚本已移除。
- **视频广告（已移除）：** 首页不再包含视频脚本或五秒定时加载逻辑。
- **Monetag（未启用）：** `<head>` 中原有 `MONETAG_SCRIPT_START` / `MONETAG_SCRIPT_END` 仍为空；不是 HilltopAds 的接入位置。不要把同一段代码重复放入多处。
- 添加第三方脚本后，必须同步更新 `privacy.html` 中的隐私说明，并按实际地区和所用广告/统计服务配置必要的同意机制。尤其分享链接里含有成本数据，需确认第三方脚本是否读取完整页面 URL；有需要可停用分享功能。

已还原用户粘贴时的 Markdown/HTML 转义，并显式使用 HTTPS，保证本地文件模式不会把 `//` 误识别为文件路径。广告位路径保持用户提供的值。实际广告展示需在平台认可的站点测试，本地预览、广告拦截或平台限制可能导致不展示。浏览器自动化验证会拦截广告请求并返回空脚本，不产生测试广告流量，也不据此宣称实际填充成功。

## 文件

| 文件 | 用途 |
| --- | --- |
| `index.html` | 首页、计算器、解释和 FAQ；第三方代码占位 |
| `styles.css` | 桌面、移动和打印样式 |
| `calculator.js` | 可独立测试的计算与输入规范化 |
| `app.js` | 页面交互、本地保存、分享、下载和打印 |
| `privacy.html` / `terms.html` | 隐私和计算假设 |
| `scripts/build.mjs` | 静态构建、生产域名和 sitemap |
| `server.mjs` | 仅供本地预览的静态服务 |

下一步可根据真实搜索词扩展独立的树脂打印、机器折旧和耗材长度换算页面。首版没有批量生成重复 SEO 页面。

## 排查广告没有出现

打开生产网站，按 F12，在 Console 中执行：

```js
['banner', 'popup'].map(type => ({
  type,
  status: document.getElementById(`hilltopads-${type}-loader`)?.dataset.adStatus || 'not-in-this-version'
}));
```

- `not-in-this-version`：当前页面不是这版代码，检查 GitHub 提交和 Cloudflare 部署、强制刷新。
- 弹窗为 `ready`，点击指定功能按钮后变为 `attempted`；`attempted` 不保证浏览器允许了新窗口。
- `error`：脚本网络加载失败；在 Network 中查看失败请求，例如扩展拦截、域名或连接问题。
- `loaded`：脚本加载事件已触发，不代表平台已有广告填充或已出现广告或弹窗；继续看平台站点/广告位状态、频控、地区与浏览器设置。不要用不断自动重试或 window.open 强行绕过平台和浏览器。

测试在本地拦截广告请求，以空脚本或布局素材验证，不生成真实广告展示。广告只接入首页；条款与隐私页面不加载广告。不要把本地 file:// 预览结果当作生产域名的展示结果。


当前版本标记：`2026-11-05-full-width-top-banner-no-video`。可在生产首页源代码中检查 `layerwise-release`，确认已部署最新版。

## 搜索引擎站点地图检查

更新 GitHub 并等待 Cloudflare 部署成功后，打开 https://layerwise.luqihang594241.workers.dev/sitemap.xml ，应显示 XML 网址列表，不能是首页或 404。然后在对应 Google Search Console 网站属性的 Sitemaps 中提交 `sitemap.xml`，检查状态是否为 Success；也可向 Bing Webmaster Tools 提交同一地址。提交成功提示仅代表接受请求，成功读取也不保证收录、排名或流量。

## Cloudflare Workers 发布目录

本项目的 `wrangler.jsonc` 已指定 `assets.directory` 为 `./dist`，Worker 名称与本站目录名一致。上传 GitHub 时，把此配置文件与 `package.json` 放在同一级，并保留 `scripts/build.mjs` 的子目录结构。

- 构建命令：`npm run build`
- 部署命令：`npx wrangler deploy`
- 构建根目录：独立仓库为 `/`；共用仓库时为本站子目录。

提交后确认 Cloudflare 构建使用最新 GitHub 提交。旧日志若显示 `Set SITE_URL`，表示尚未使用本次修复后的构建脚本；最新构建会显示已生成 sitemap 和 canonical。发布目录应为 `dist`，不要再让自动检测选择仓库根目录 `.`。完成部署后检查正式网站 `/sitemap.xml`，再到 Search Console 重新提交。
