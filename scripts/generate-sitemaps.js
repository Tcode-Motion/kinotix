/**
 * KinotiX Multi-Tier XML Sitemap & Google Images Generator
 * 
 * Generates:
 * 1. sitemap.xml (Sitemap Index)
 * 2. sitemap-pages.xml (Core Application & Info Pages)
 * 3. sitemap-categories.xml (Category Hub Landing Pages)
 * 4. sitemap-wallpapers.xml (Canonical Wallpaper Pages)
 * 5. sitemap-images.xml (Google Images XML Specification)
 */

const fs = require('fs');
const path = require('path');
const { normalizeUrl, generateImageId, getShareDisplayName } = require('./generate-share-pages');

const BASE_URL = 'https://techscript.is-a.dev/kinotix/';
const TODAY = new Date().toISOString().split('T')[0];

function escapeXml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function generateSitemaps() {
  const rootDir = path.resolve(__dirname, '..');
  const scriptsDir = __dirname;
  const docsDir = path.join(rootDir, 'docs');

  console.log('--- Generating KinotiX Multi-Tier XML Sitemaps ---');

  // 1. Core Pages
  const corePages = [
    { loc: `${BASE_URL}`, priority: '1.00', changefreq: 'weekly' },
    { loc: `${BASE_URL}download.html`, priority: '0.95', changefreq: 'weekly' },
    { loc: `${BASE_URL}features.html`, priority: '0.90', changefreq: 'monthly' },
    { loc: `${BASE_URL}guides/amoled-wallpaper-guide.html`, priority: '0.85', changefreq: 'monthly' },
    { loc: `${BASE_URL}guides/4k-vs-fhd-phone-wallpapers.html`, priority: '0.85', changefreq: 'monthly' },
    { loc: `${BASE_URL}faq.html`, priority: '0.80', changefreq: 'monthly' },
    { loc: `${BASE_URL}support.html`, priority: '0.75', changefreq: 'monthly' },
    { loc: `${BASE_URL}privacy.html`, priority: '0.70', changefreq: 'monthly' },
    { loc: `${BASE_URL}terms.html`, priority: '0.70', changefreq: 'monthly' },
    { loc: `${BASE_URL}licenses.html`, priority: '0.60', changefreq: 'monthly' }
  ];

  let pagesXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  for (const page of corePages) {
    pagesXml += `  <url>\n    <loc>${page.loc}</loc>\n    <lastmod>${TODAY}</lastmod>\n    <changefreq>${page.changefreq}</changefreq>\n    <priority>${page.priority}</priority>\n  </url>\n`;
  }
  pagesXml += `</urlset>\n`;

  // 2. Category Hub Pages
  const categories = [
    '4k-wallpapers',
    'anime-wallpapers',
    'amoled-wallpapers',
    'live-wallpapers',
    '3d-wallpapers',
    'nature-wallpapers',
    'cyberpunk-wallpapers',
    'cars-wallpapers',
    'space-wallpapers',
    'abstract-wallpapers'
  ];

  let catXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  for (const cat of categories) {
    catXml += `  <url>\n    <loc>${BASE_URL}${cat}/</loc>\n    <lastmod>${TODAY}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.90</priority>\n  </url>\n`;
  }
  catXml += `</urlset>\n`;

  // 3. Wallpapers & Images Data Collection
  const phoneTreePath = path.join(scriptsDir, 'phone_wallpaper_tree.json');
  const liveTreePath = path.join(scriptsDir, 'live_wallpaper_tree.json');

  let wallpapers = [];

  if (fs.existsSync(phoneTreePath)) {
    const list = JSON.parse(fs.readFileSync(phoneTreePath, 'utf8'));
    for (const item of list) {
      if (typeof item === 'string' && item.trim()) {
        const encodedSegments = item.split('/').map(encodeURIComponent).join('/');
        const rawUrl = `https://raw.githubusercontent.com/venomleo2o1-byte/phone-wallpaper/master/${encodedSegments}`;
        const canonicalUrl = normalizeUrl(rawUrl);
        const imageId = generateImageId(canonicalUrl);
        const segments = item.split('/');
        const category = segments[0];
        const filename = segments[segments.length - 1];
        const rawTitle = filename.replace(/\.[a-zA-Z0-9]+$/, '');
        const is3D = category.toLowerCase().includes('3d') || category.toLowerCase().includes('optical');
        const title = getShareDisplayName(rawTitle, is3D ? '3d' : 'static', category, imageId);

        wallpapers.push({
          imageId,
          loc: `${BASE_URL}i/${imageId}/`,
          imageUrl: rawUrl,
          title,
          caption: `${title} - Ultra HD 4K Wallpaper for Android and Phone`
        });
      }
    }
  }

  if (fs.existsSync(liveTreePath)) {
    const list = JSON.parse(fs.readFileSync(liveTreePath, 'utf8'));
    for (const item of list) {
      if (typeof item === 'string' && item.trim()) {
        const encodedSegments = item.split('/').map(encodeURIComponent).join('/');
        const rawUrl = `https://raw.githubusercontent.com/venomleo2o1-byte/live-wallpaper/main/${encodedSegments}`;
        const canonicalUrl = normalizeUrl(rawUrl);
        const imageId = generateImageId(canonicalUrl);
        const filename = item.split('/').pop();
        const rawTitle = filename.replace(/\.[a-zA-Z0-9]+$/, '');
        const title = getShareDisplayName(rawTitle, 'live', 'live', imageId);

        wallpapers.push({
          imageId,
          loc: `${BASE_URL}i/${imageId}/`,
          imageUrl: rawUrl,
          title,
          caption: `${title} - 4K Live Video Wallpaper for Android`
        });
      }
    }
  }

  // Deduplicate wallpapers by imageId
  const uniqueWallpapersMap = new Map();
  for (const wp of wallpapers) {
    if (!uniqueWallpapersMap.has(wp.imageId)) {
      uniqueWallpapersMap.set(wp.imageId, wp);
    }
  }
  const uniqueWallpapers = Array.from(uniqueWallpapersMap.values());
  console.log(`Total indexed wallpapers: ${uniqueWallpapers.length}`);

  // Generate sitemap-wallpapers.xml
  let wpXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  for (const wp of uniqueWallpapers) {
    wpXml += `  <url>\n    <loc>${wp.loc}</loc>\n    <lastmod>${TODAY}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.75</priority>\n  </url>\n`;
  }
  wpXml += `</urlset>\n`;

  // Generate sitemap-images.xml (Google Images XML Specification)
  let imgXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;
  for (const wp of uniqueWallpapers) {
    imgXml += `  <url>\n    <loc>${wp.loc}</loc>\n    <image:image>\n      <image:loc>${escapeXml(wp.imageUrl)}</image:loc>\n      <image:title>${escapeXml(wp.title)}</image:title>\n      <image:caption>${escapeXml(wp.caption)}</image:caption>\n    </image:image>\n  </url>\n`;
  }
  imgXml += `</urlset>\n`;

  // 4. Master Sitemap Index (sitemap.xml)
  const masterIndexXml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <sitemap>\n    <loc>${BASE_URL}sitemap-pages.xml</loc>\n    <lastmod>${TODAY}</lastmod>\n  </sitemap>\n  <sitemap>\n    <loc>${BASE_URL}sitemap-categories.xml</loc>\n    <lastmod>${TODAY}</lastmod>\n  </sitemap>\n  <sitemap>\n    <loc>${BASE_URL}sitemap-wallpapers.xml</loc>\n    <lastmod>${TODAY}</lastmod>\n  </sitemap>\n  <sitemap>\n    <loc>${BASE_URL}sitemap-images.xml</loc>\n    <lastmod>${TODAY}</lastmod>\n  </sitemap>\n</sitemapindex>\n`;

  // Write all sitemaps to both root and docs/
  const targetDirs = [rootDir, docsDir];
  for (const dir of targetDirs) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'sitemap.xml'), masterIndexXml, 'utf8');
    fs.writeFileSync(path.join(dir, 'sitemap-pages.xml'), pagesXml, 'utf8');
    fs.writeFileSync(path.join(dir, 'sitemap-categories.xml'), catXml, 'utf8');
    fs.writeFileSync(path.join(dir, 'sitemap-wallpapers.xml'), wpXml, 'utf8');
    fs.writeFileSync(path.join(dir, 'sitemap-images.xml'), imgXml, 'utf8');
    console.log(`Saved 5 sitemaps to ${dir}`);
  }

  console.log('Sitemap generation completed successfully!');
}

if (require.main === module) {
  generateSitemaps();
}

module.exports = { generateSitemaps };
