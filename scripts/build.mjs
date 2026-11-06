import { mkdir, copyFile, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = fileURLToPath(new URL('../', import.meta.url));
const output = path.join(root, 'dist');
const pages = ['index.html', 'privacy.html', 'terms.html', '404.html'];
const files = [...pages, 'styles.css', 'app.js', 'calculator.js', 'favicon.svg', 'robots.txt'];
const { homepage } = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
// Keep production discovery files present even when the build variable is omitted.
const origin = new URL(process.env.SITE_URL || homepage);
if (!['http:', 'https:'].includes(origin.protocol) || origin.pathname !== '/' || origin.search || origin.hash || origin.username || origin.password) throw new Error('SITE_URL must be an origin such as https://example.com, without a path.');
await mkdir(output, { recursive: true });
for (const file of files) await copyFile(path.join(root, file), path.join(output, file));
const escape = value => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');
for (const page of pages.filter(p => p !== '404.html')) {
  const url = new URL(page === 'index.html' ? '/' : page, origin).href;
  const source = await readFile(path.join(output, page), 'utf8');
  await writeFile(path.join(output, page), source.replace('</head>', `<link rel="canonical" href="${escape(url)}"><meta property="og:url" content="${escape(url)}">\n</head>`));
}
const urls = pages.filter(p => p !== '404.html').map(p => `<url><loc>${escape(new URL(p === 'index.html' ? '/' : p, origin).href)}</loc></url>`).join('');
await writeFile(path.join(output, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`);
await writeFile(path.join(output, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${new URL('/sitemap.xml', origin).href}\n`);
console.log(`Built ${files.length + 1} static assets. Sitemap and canonical URLs generated for ${origin.origin}.`);
