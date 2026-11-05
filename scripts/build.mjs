import { mkdir, readFile, writeFile, copyFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = path.join(root, 'dist');
const files = ['index.html', 'styles.css', 'app.js', 'calculator.js', 'favicon.svg', 'privacy.html', 'terms.html', '404.html', 'robots.txt'];
await mkdir(output, { recursive: true });
for (const file of files) await copyFile(path.join(root, file), path.join(output, file));
// Set SITE_URL only to the final production origin, never a preview URL.
if (process.env.SITE_URL) {
  const origin = new URL(process.env.SITE_URL);
  if (!['https:', 'http:'].includes(origin.protocol) || origin.pathname !== '/' || origin.search || origin.hash || origin.username || origin.password) {
    throw new Error('SITE_URL must be a production origin, e.g. https://your-domain.com (no path, credentials or query).');
  }
  const escape = (s) => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');
  for (const file of ['index.html', 'privacy.html', 'terms.html']) {
    const url = new URL(file === 'index.html' ? '/' : `/${file}`, origin).href;
    const html = await readFile(path.join(output, file), 'utf8');
    await writeFile(path.join(output, file), html.replace('</head>', `<link rel="canonical" href="${escape(url)}">\n<meta property="og:url" content="${escape(url)}">\n</head>`));
  }
  const urls = ['/', '/privacy.html', '/terms.html'].map((p) => `<url><loc>${escape(new URL(p, origin).href)}</loc></url>`).join('');
  await writeFile(path.join(output, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`);
  await writeFile(path.join(output, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${new URL('/sitemap.xml', origin).href}\n`);
} else {
  // Avoid retaining a sitemap for a previous domain on a later unconfigured build.
  const { rm } = await import('node:fs/promises');
  await rm(path.join(output, 'sitemap.xml'), { force: true });
}
console.log(`Built ${files.length} static assets in dist/.${process.env.SITE_URL ? ' Canonicals and sitemap generated.' : ' Set SITE_URL to generate production canonicals and sitemap.'}`);
