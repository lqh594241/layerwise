
Layerwise · 3D Printing Cost & Quotation Tool
An independent tool site for English-speaking users. Native HTML/CSS/JavaScript, with no frontend runtime dependencies, paid APIs, account system, or server-side data storage. Integrated user-provided HilltopAds banner and click pop-up code; Ahrefs remains blank, and external fonts are not used.
Local Preview
You can simply double-click the index.html file in this directory without installing dependencies or starting a service. Styles, calculators, quote downloads, and auxiliary pages all support local file opening. Shared links can only be opened on devices with the same files when previewed locally; external sharing requires online deployment first.
If you need HTTP preview, run the following command in this directory after installing Node.js:
npm run dev
Open http://127.0.0.1:4173. The service only listens on the local machine. Online demo: https://layerwise.luqihang594241.workers.dev/
npm test
npm run build
No need for npm install.  npm test verifies cost, failure rate, profit margin, markup rate, platform fees, batch amounts, and boundary conditions.  npm run build copies the production files to dist/, excluding the development server, tests, and documentation.
First Edition Features
FDM: grams, price per kilogram; Resin: milliliters, price per liter.
Consumable Examples: Preset, Time, Power, Machine Depreciation/Maintenance, Labor, Other Costs, Failure Rate.
Two quotation methods: target sales profit margin, cost markup rate; deductible ratio and fixed platform fee.
Batch Quoting, Customer Quotation TXT Download, Print or Save as PDF in Browser.
The customer quotation does not include internal costs and profits; "Copy breakdown" specifically replicates internal details.
Locally auto-save; share links using URL fragments, excluding project names.
USD/EUR/GBP/CAD/AUD currency labels, no exchange rate conversion.
Responsive layout, keyboard interaction, FAQ, calculation instructions, privacy, terms, 404, and WebApplication structured data.
All default costs and material prices are merely examples and not real-time market prices. All inputs are allocated per qualified finished product; for multiple items on the same board, material, printing time, and labor costs must be allocated first. The failure rate only amplifies material, power consumption, and machine costs, while labor and other expenses are calculated once. The quote is rounded up to the nearest fraction, then multiplied by the quantity to ensure consistent unit price and bulk amount.
