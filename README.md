# Layerwise · 3D 打印成本与报价工具

面向英文用户的独立工具站。原生 HTML/CSS/JavaScript，无前端运行依赖、付费 API、账户系统或服务器端数据存储。默认没有广告、统计脚本和外部字体请求。

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
3. 最终域名确定后，在生产环境变量设置 `SITE_URL`，值为 `https://你的实际域名`，不要包含路径；重新部署。
4. 构建会生成本站域名对应的 canonical、og:url、sitemap.xml 和 robots.txt 中的 sitemap 地址。域名未确定时不会编造 canonical 或 sitemap。
5. 使用自己的账号验证 Google Search Console / Bing Webmaster Tools，提交 `/sitemap.xml`。这不保证收录、排名、AI 引用或流量。

还可以把 `dist` 交给其他支持商业用途的静态托管。资源和站内链接使用相对路径，支持本地文件打开或子目录预览。自动生成 canonical 和 sitemap 的构建配置按最终域名根目录上线。未替用户创建仓库或执行公网发布。

## 手动添加 Ahrefs / Monetag

编辑源文件 `index.html`，然后重新构建部署：

- **Ahrefs：** 在 `<head>` 中找到 `AHREFS_ANALYTICS_START` / `AHREFS_ANALYTICS_END`，将你后台的统计代码粘贴到这对注释之间。
- **Monetag 全站代码：** 在 `<head>` 中找到 `MONETAG_SCRIPT_START` / `MONETAG_SCRIPT_END`。按后台广告格式说明粘贴代码，不要把私密账号凭据写入源码。
- **页面广告位置：** 计算器下方有 `#ad-slot-after-calculator`，默认 `hidden`，不会占空间。如果你的广告格式支持固定容器，可去掉 `hidden` 并放入该格式要求的内容。弹出式或 IPP 广告的渲染位置由广告服务控制，不会因为预留了 div 自动出现在这里。
- 添加第三方脚本后，必须同步更新 `privacy.html` 中的隐私说明，并按实际地区和所用广告/统计服务配置必要的同意机制。尤其分享链接里含有成本数据，需确认第三方脚本是否读取完整页面 URL；有需要可停用分享功能。

预留位置目前为空，没有伪造广告展示、统计账号或事件 ID。

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
