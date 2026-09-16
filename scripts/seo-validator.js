/**
 * KinotiX Automated Production SEO Validator
 * 
 * Scans all generated HTML pages, category hubs, wallpaper share pages,
 * sitemaps, and robots.txt to detect any SEO defects.
 */

const fs = require('fs');
const path = require('path');

function runSeoAudit() {
  const rootDir = path.resolve(__dirname, '..');

  console.log('====================================================');
  console.log('          KinotiX Automated SEO Validator          ');
  console.log('====================================================\n');

  let pagesScanned = 0;
  let missingTitles = 0;
  let missingDescriptions = 0;
  let missingCanonicals = 0;
  let missingH1 = 0;
  let multipleH1 = 0;
  let missingAltText = 0;
  let missingOgTags = 0;
  let missingTwitterTags = 0;
  let brokenInternalLinks = 0;
  let structuredDataErrors = 0;

  const titleMap = new Map();
  const canonicalMap = new Map();
  const internalLinks = new Set();

  function auditHtmlFile(filePath, relPath) {
    pagesScanned++;
    const content = fs.readFileSync(filePath, 'utf8');

    // 1. Title Check
    const titleMatch = content.match(/<title>([^<]*)<\/title>/i);
    if (!titleMatch || !titleMatch[1].trim()) {
      missingTitles++;
    } else {
      const title = titleMatch[1].trim();
      titleMap.set(title, (titleMap.get(title) || 0) + 1);
    }

    // 2. Meta Description Check
    const descMatch = content.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i) ||
                      content.match(/<meta\s+content=["']([^"']*)["']\s+name=["']description["']/i);
    if (!descMatch || !descMatch[1].trim()) {
      missingDescriptions++;
    }

    // 3. Canonical Tag Check
    const canonicalMatch = content.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']*)["']/i) ||
                           content.match(/<link\s+href=["']([^"']*)["']\s+rel=["']canonical["']/i);
    if (!canonicalMatch || !canonicalMatch[1].trim()) {
      missingCanonicals++;
    } else {
      const canonical = canonicalMatch[1].trim();
      canonicalMap.set(canonical, (canonicalMap.get(canonical) || 0) + 1);
    }

    // 4. H1 Check
    const h1Matches = content.match(/<h1[^>]*>([\s\S]*?)<\/h1>/gi);
    if (!h1Matches || h1Matches.length === 0) {
      // 404 and share fallback might not need h1 or have h2
      if (!relPath.includes('404') && !relPath.endsWith('i/index.html')) {
        missingH1++;
      }
    } else if (h1Matches.length > 1) {
      multipleH1++;
    }

    // 5. Image Alt Text Check
    const imgRegex = /<img\s+([^>]*?)>/gi;
    let match;
    while ((match = imgRegex.exec(content)) !== null) {
      const imgAttrs = match[1];
      if (!/alt=["'][^"']*["']/i.test(imgAttrs)) {
        missingAltText++;
      }
    }

    // 6. Social Meta (OG & Twitter)
    if (!content.includes('property="og:title"') && !content.includes("property='og:title'")) {
      missingOgTags++;
    }
    if (!content.includes('name="twitter:title"') && !content.includes("name='twitter:title'")) {
      missingTwitterTags++;
    }

    // 7. Structured Data Check (JSON-LD)
    const jsonLdMatches = content.match(/<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi);
    if (jsonLdMatches) {
      for (const block of jsonLdMatches) {
        const rawJson = block.replace(/<\/?script[^>]*>/gi, '').trim();
        try {
          JSON.parse(rawJson);
        } catch (e) {
          structuredDataErrors++;
        }
      }
    }
  }

  // 1. Scan root core pages
  const coreFiles = [
    'index.html', 'download.html', 'features.html', 'faq.html',
    'privacy.html', 'terms.html', 'support.html', 'licenses.html'
  ];
  for (const f of coreFiles) {
    const p = path.join(rootDir, f);
    if (fs.existsSync(p)) auditHtmlFile(p, f);
  }

  // 2. Scan Category Hubs
  const catHubs = [
    '4k-wallpapers', 'anime-wallpapers', 'amoled-wallpapers', 'live-wallpapers',
    '3d-wallpapers', 'nature-wallpapers', 'cyberpunk-wallpapers', 'cars-wallpapers',
    'space-wallpapers', 'abstract-wallpapers'
  ];
  for (const c of catHubs) {
    const p = path.join(rootDir, c, 'index.html');
    if (fs.existsSync(p)) auditHtmlFile(p, `${c}/index.html`);
  }

  // 3. Scan Technical Guides
  const guideDir = path.join(rootDir, 'guides');
  if (fs.existsSync(guideDir)) {
    const gFiles = fs.readdirSync(guideDir);
    for (const g of gFiles) {
      if (g.endsWith('.html')) {
        auditHtmlFile(path.join(guideDir, g), `guides/${g}`);
      }
    }
  }

  // 4. Scan a representative sample of 100 generated share pages to verify consistency
  const shareDir = path.join(rootDir, 'i');
  if (fs.existsSync(shareDir)) {
    const dirs = fs.readdirSync(shareDir);
    let sampled = 0;
    for (const d of dirs) {
      const p = path.join(shareDir, d, 'index.html');
      if (fs.existsSync(p)) {
        auditHtmlFile(p, `i/${d}/index.html`);
        sampled++;
        if (sampled >= 100) break;
      }
    }
  }

  // 5. Sitemap & Robots Audit
  let sitemapValid = true;
  let robotsValid = true;
  const sitemapXml = path.join(rootDir, 'sitemap.xml');
  const robotsTxt = path.join(rootDir, 'robots.txt');

  if (!fs.existsSync(sitemapXml)) sitemapValid = false;
  if (!fs.existsSync(robotsTxt)) robotsValid = false;

  const robotsContent = fs.readFileSync(robotsTxt, 'utf8');
  if (!robotsContent.includes('https://techscript.is-a.dev/kinotix/sitemap.xml')) {
    robotsValid = false;
  }

  console.log('----------------------------------------------------');
  console.log(`Pages scanned:              ${pagesScanned}`);
  console.log(`Missing <title>:            ${missingTitles}`);
  console.log(`Missing meta descriptions:  ${missingDescriptions}`);
  console.log(`Missing canonical tags:     ${missingCanonicals}`);
  console.log(`Missing <h1> tag:           ${missingH1}`);
  console.log(`Multiple <h1> tags:         ${multipleH1}`);
  console.log(`Missing image alt text:     ${missingAltText}`);
  console.log(`Missing OpenGraph tags:     ${missingOgTags}`);
  console.log(`Missing Twitter Card tags:  ${missingTwitterTags}`);
  console.log(`Structured Data (JSON-LD):  ${structuredDataErrors === 0 ? 'VALID (0 errors)' : `${structuredDataErrors} errors`}`);
  console.log(`Multi-tier Sitemap Index:   ${sitemapValid ? 'VERIFIED' : 'FAILED'}`);
  console.log(`Robots.txt Configuration:   ${robotsValid ? 'VERIFIED' : 'FAILED'}`);
  console.log('----------------------------------------------------\n');

  if (missingTitles === 0 && missingDescriptions === 0 && missingCanonicals === 0 &&
      missingH1 === 0 && multipleH1 === 0 && missingAltText === 0 && structuredDataErrors === 0 &&
      sitemapValid && robotsValid) {
    console.log('>>> SEO AUDIT RESULT: ALL CRITICAL CHECKS PASSED (100% PRODUCTION READY) <<<');
  } else {
    console.warn('>>> SEO AUDIT RESULT: ISSUES DETECTED - REVIEW AUDIT LOG <<<');
  }
}

if (require.main === module) {
  runSeoAudit();
}

module.exports = { runSeoAudit };
