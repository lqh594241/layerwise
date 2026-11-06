Layerwise · 3D Printing Cost & Quote Tool
A standalone tool site for English-speaking users. Native HTML/CSS/JavaScript, with no front-end runtime dependencies, paid APIs, account system, or server-side data storage. The user-provided HilltopAds banner and click popunder code has been integrated; Ahrefs remains blank, and no external fonts are used.

Local Preview
You can double-click index.html in this directory directly, with no need to install dependencies or start a service. The styles, calculators, quote downloads, and auxiliary pages all support opening as local files; when previewing locally, share links can only be opened on devices that also have these files. External sharing requires deploying the site first.

If you need an HTTP preview, after installing Node.js, run the following in this directory:
npm run dev
Open http://127.0.0.1:4173 . The service only listens on the local machine. Online demo: https://layerwise.luqihang594241.workers.dev/

npm test
npm run build
No npm install is required. npm test verifies costs, failure rates, profit margins, markup rates, platform fees, batch amounts, and boundary conditions. npm run build copies the production files to dist/, excluding the development server, tests, and documentation.

First-Version Features
FDM: grams, price per kilogram; resin: milliliters, price per liter.
Material example presets, time, electricity, machine depreciation/maintenance, labor, other costs, failure rate.
Two quoting methods: target sales profit margin, cost markup rate; proportional and fixed platform fees can be included.
Batch quotes, customer quote TXT download, print or save as PDF via the browser.
Customer quotes do not include internal costs and profit; "Copy breakdown" specifically copies the internal breakdown.
Local autosave; share links use URL fragments and exclude project names.
USD/EUR/GBP/CAD/AUD currency labels, with no exchange rate conversion.
Responsive layout, keyboard interaction, FAQ, calculation notes, privacy, terms, 404, and WebApplication structured data.
All default costs and material prices are examples only, not real-time market prices. All inputs are allocated per single qualified finished item; multiple items on the same build plate require you to allocate material, print time, and labor yourself first. The failure rate only scales material, electricity, and machine costs; labor and other costs are counted once. Quotes are rounded up to the cent, then multiplied by the quantity, ensuring that the unit price and batch amount are consistent.

