/**
 * KinotiX Automated Share Page Generator
 * Production-Grade Static Generator for GitHub Pages & Social Previews
 * 
 * Generates ultra-fast static /kinotix/i/{imageId}/index.html pages with:
 * 1. High-priority eager image loading (fetchpriority="high", loading="eager", decoding="async")
 * 2. Instant preload link in <head> for zero-delay image discovery
 * 3. Fast Edge CDN (jsDelivr Cloudflare edge) with automatic raw.githubusercontent.com fallback
 * 4. Shimmering aspect-ratio reserved skeleton to eliminate layout shift (CLS = 0)
 * 5. Complete 1200x630 Open Graph & Twitter Card tags for WhatsApp & social crawlers
 * 6. Clean, type-aware titles with zero ugly filenames or IDs
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const HMAC_SECRET = 'kinotix_secure_share_salt_2026_v1';
const ID_PREFIX = 'KX_';
const BASE_URL = 'https://techscript.is-a.dev/kinotix/i/';
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.kinotix.app';

// URL Normalization matching Android KinotixShareResolver
function normalizeUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  try {
    const u = new URL(rawUrl.trim());
    const scheme = u.protocol.toLowerCase();
    const host = u.host.toLowerCase();
    let pathname = decodeURIComponent(u.pathname);
    if (pathname.endsWith('/') && pathname.length > 1) {
      pathname = pathname.slice(0, -1);
    }
    const stripParams = new Set([
      'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
      'fbclid', 'gclid', '_gl', 'token', 'session_id', 'cb', 'ts', '_r', 'ref'
    ]);
    const kept = [];
    u.searchParams.forEach((val, key) => {
      if (!stripParams.has(key.toLowerCase())) {
        kept.push([key, val]);
      }
    });
    kept.sort((a, b) => a[0].localeCompare(b[0]));
    const query = kept.length > 0 ? '?' + kept.map(p => `${p[0]}=${p[1]}`).join('&') : '';
    return `${scheme}//${host}${pathname}${query}`;
  } catch (e) {
    return rawUrl.trim();
  }
}

// Deterministic HMAC-SHA256 ID matching Android KinotixShareResolver
function generateImageId(canonicalUrl) {
  const hmac = crypto.createHmac('sha256', HMAC_SECRET);
  hmac.update(Buffer.from(canonicalUrl, 'utf8'));
  const digest = hmac.digest();
  const shortBytes = digest.subarray(0, 9);
  const base64Url = shortBytes.toString('base64')
    .replace(/=/g, '')
    .replace(/\//g, '_')
    .replace(/\+/g, '-');
  return ID_PREFIX + base64Url;
}

// Clean title validator matching Android KinotixShareResolver
function isMeaningfulTitle(title) {
  if (!title || typeof title !== 'string') return false;
  let clean = title.replace(/\s*\(Live Loop\)\s*$/i, '').trim();
  if (!clean) return false;
  
  // Reject hashtags or social tag dumps
  if (clean.startsWith('#') || clean.includes('#wallpapers') || clean.includes('#livewallpaper') || clean.includes('_page')) {
    return false;
  }

  if (/^\d+$/.test(clean)) return false;
  if (/^wallpaper[\s_-]*\d+$/i.test(clean)) return false;
  if (/^wallpaper[\s_-]*[0-9a-fA-F-]{6,}$/i.test(clean)) return false;
  if (/^(img|image|photo|video|frame|dsc|pic|wallpaper|file|asset|media|wallhaven|unsplash|pexels|pixabay|pinterest|github)[_\-\s0-9a-zA-Z]+(\.[a-zA-Z0-9]{2,5})?$/i.test(clean)) return false;
  if (/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(clean)) return false;
  if (/^[0-9a-fA-F]{16,}$/.test(clean)) return false;
  const lower = clean.toLowerCase();
  const placeholders = new Set(['artwork', 'shared wallpaper', 'cached wallpaper', 'wallpaper', 'unknown', 'null', 'undefined', 'untitled', 'preview', 'download', 'image', 'photo']);
  if (placeholders.has(lower)) return false;
  if (lower.startsWith('http://') || lower.startsWith('https://') || lower.startsWith('gs://') || lower.includes('firebase')) return false;
  if (/\.(jpg|jpeg|png|webp|mp4)$/i.test(lower)) {
    const withoutExt = clean.substring(0, clean.lastIndexOf('.'));
    return isMeaningfulTitle(withoutExt);
  }
  return true;
}

// Clean display name generator matching Android
function getShareDisplayName(rawTitle, rawType, themeTag, id) {
  let clean = (rawTitle || '').replace(/\s*\(Live Loop\)\s*$/i, '').trim();
  
  if (isMeaningfulTitle(clean)) {
    // Strip trailing parenthetical numbers e.g. " (1)"
    clean = clean.replace(/\s*\(\d+\)$/, '').trim();
    if (clean) return clean;
  }

  const typeLower = (rawType || '').toLowerCase();
  const idLower = (id || '').toLowerCase();
  const tagLower = (themeTag || '').toLowerCase();

  if (idLower.startsWith('camera') || typeLower.includes('camera')) return 'Camera Live Wallpaper';
  if (idLower.startsWith('fluid') || typeLower.includes('fluid')) {
    return tagLower.includes('abstract') ? 'Abstract Fluid Live Wallpaper' : 'Fluid Live Wallpaper';
  }
  if (idLower.startsWith('particle') || typeLower.includes('particle')) {
    if (tagLower.includes('galaxy') || tagLower.includes('space')) return 'Galaxy Particle Live Wallpaper';
    if (tagLower.includes('neon')) return 'Neon 3D Live Wallpaper';
    return 'Particle Live Wallpaper';
  }
  if (typeLower === '3d' || idLower.includes('3d') || tagLower.includes('3d')) {
    return tagLower.includes('neon') ? 'Neon 3D Live Wallpaper' : '3D Live Wallpaper';
  }
  if (typeLower.includes('live') || typeLower.includes('video') || idLower.startsWith('loop_')) {
    return tagLower.includes('mountain') ? 'Mountain 4K Video Wallpaper' : '4K Video Wallpaper';
  }
  if (typeLower === 'animated') return 'Animated Wallpaper';
  if (typeLower === 'dynamic') return 'Dynamic Wallpaper';
  if (typeLower === 'ai' || tagLower.includes('ai')) return 'AI Wallpaper';

  switch (tagLower) {
    case 'anime': return 'Anime Ultra HD 4K Wallpaper';
    case 'space':
    case 'galaxy': return 'Galaxy Ultra HD 4K Wallpaper';
    case 'nature':
    case 'mountain': return 'Mountain Ultra HD 4K Wallpaper';
    case 'cyberpunk':
    case 'neon': return 'Neon Ultra HD 4K Wallpaper';
    case 'amoled': return 'AMOLED Ultra HD 4K Wallpaper';
    case 'superheroes': return 'Superheroes 4K Wallpaper';
    case 'cars': return 'Supercars 4K Wallpaper';
    case 'bikes': return 'Superbikes 4K Wallpaper';
    case 'abstract': return 'Abstract 4K Wallpaper';
    default: return 'Ultra HD 4K Wallpaper';
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getCategorySlugAndName(cat) {
  const c = (cat || '').toLowerCase();
  if (c.includes('anime')) return { slug: 'anime-wallpapers', name: 'Anime Wallpapers' };
  if (c.includes('amoled')) return { slug: 'amoled-wallpapers', name: 'AMOLED Wallpapers' };
  if (c.includes('3d') || c.includes('optical')) return { slug: '3d-wallpapers', name: '3D Wallpapers' };
  if (c.includes('live')) return { slug: 'live-wallpapers', name: 'Live Wallpapers' };
  if (c.includes('nature')) return { slug: 'nature-wallpapers', name: 'Nature Wallpapers' };
  if (c.includes('cyberpunk') || c.includes('neon')) return { slug: 'cyberpunk-wallpapers', name: 'Cyberpunk Wallpapers' };
  if (c.includes('cars')) return { slug: 'cars-wallpapers', name: 'Cars Wallpapers' };
  if (c.includes('space') || c.includes('galaxy')) return { slug: 'space-wallpapers', name: 'Space Wallpapers' };
  if (c.includes('abstract')) return { slug: 'abstract-wallpapers', name: 'Abstract Wallpapers' };
  return { slug: '4k-wallpapers', name: '4K Wallpapers' };
}

function renderSharePageHtml({ imageId, title, typeLabel, cdnUrl, rawUrl, creator, category, isVideo }) {
  const canonicalUrl = `${BASE_URL}${imageId}/`;
  const escTitle = escapeHtml(title);
  const escType = escapeHtml(typeLabel);
  const escCdnUrl = escapeHtml(cdnUrl);
  const escRawUrl = escapeHtml(rawUrl);
  const escCreator = creator ? escapeHtml(creator) : 'KinotiX Studio';
  const { slug: categorySlug, name: categoryName } = getCategorySlugAndName(category);
  const escCategoryName = escapeHtml(categoryName);

  const creatorBadge = escCreator ? `<div class="creator-tag">Curated by <strong>${escapeHtml(escCreator)}</strong></div>` : '';
  const creatorOg = escCreator ? ` by ${escCreator}` : '';
  const ogDesc = `Download and experience this ${escType}${creatorOg} in 4K resolution on KinotiX for Android. Calibrated for AMOLED displays with 3D Parallax support.`;

  // Preload tag in <head> ensures immediate network discovery
  const preloadTag = isVideo
    ? `<link rel="preload" as="video" href="${escCdnUrl}">`
    : `<link rel="preload" as="image" href="${escCdnUrl}" fetchpriority="high">`;

  // Media element with eager loading, explicit dimensions, and instant fallback
  const mediaElement = isVideo
    ? `<video src="${escCdnUrl}" autoplay loop muted playsinline width="1080" height="1920" class="wallpaper-img loaded" onerror="if(this.src!=='${escRawUrl}'){this.src='${escRawUrl}';}"></video>`
    : `<img src="${escCdnUrl}" alt="${escTitle} • 4K ${escType} for phone" width="1080" height="1920" class="wallpaper-img" loading="eager" fetchpriority="high" decoding="async" onload="this.classList.add('loaded');" onerror="if(this.src!=='${escRawUrl}'){this.src='${escRawUrl}';}else{this.classList.add('loaded');}">`;

  return `<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escTitle} • 4K Wallpaper for Android | KinotiX</title>
  <meta name="description" content="${ogDesc}">
  <link rel="canonical" href="${canonicalUrl}">
  <link rel="icon" type="image/png" href="../../assets/icons/icon-192.png">
  <link rel="stylesheet" href="../../css/style.css">

  <!-- Critical Immediate Preload -->
  ${preloadTag}

  <!-- OpenGraph Metadata for WhatsApp, Telegram, Discord, Facebook, X -->
  <meta property="og:title" content="${escTitle} • 4K Wallpaper | KinotiX">
  <meta property="og:description" content="${ogDesc}">
  <meta property="og:type" content="article">
  <meta property="og:image" content="${escRawUrl}">
  <meta property="og:image:secure_url" content="${escRawUrl}">
  <meta property="og:image:type" content="image/jpeg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:site_name" content="KinotiX">

  <!-- Twitter Cards -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escTitle} • 4K Wallpaper | KinotiX">
  <meta name="twitter:description" content="${ogDesc}">
  <meta name="twitter:image" content="${escRawUrl}">

  <!-- Schema.org JSON-LD Structured Data: ImageObject & BreadcrumbList -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ImageObject",
        "@id": "${canonicalUrl}#image",
        "name": "${escTitle}",
        "caption": "${escTitle} - 4K Ultra HD Wallpaper for Android",
        "contentUrl": "${escRawUrl}",
        "thumbnailUrl": "${escCdnUrl}",
        "encodingFormat": "image/jpeg",
        "width": 1080,
        "height": 1920,
        "author": {
          "@type": "Organization",
          "name": "KinotiX"
        },
        "license": "https://techscript.is-a.dev/kinotix/licenses.html",
        "acquireLicensePage": "https://techscript.is-a.dev/kinotix/download.html"
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "${BASE_URL}"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "${escCategoryName}",
            "item": "${BASE_URL}${categorySlug}/"
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": "${escTitle}",
            "item": "${canonicalUrl}"
          }
        ]
      }
    ]
  }
  </script>

  <style>
    .share-container {
      min-height: calc(100vh - 160px);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem 1.5rem;
    }
    .wallpaper-preview-card {
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-xl);
      padding: 1.5rem;
      max-width: 440px;
      width: 100%;
      box-shadow: var(--shadow-lg);
      text-align: center;
      position: relative;
      overflow: hidden;
      transition: var(--transition);
    }
    .wallpaper-preview-card:hover {
      border-color: var(--border-hover);
    }
    .image-frame {
      width: 100%;
      aspect-ratio: 9 / 16;
      max-height: 480px;
      border-radius: var(--radius-lg);
      overflow: hidden;
      background: linear-gradient(110deg, #121520 8%, #1c2132 18%, #121520 33%);
      background-size: 200% 100%;
      animation: 1.6s shimmer linear infinite;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid var(--border-subtle);
      margin-bottom: 1.25rem;
    }
    @keyframes shimmer {
      to {
        background-position-x: -200%;
      }
    }
    .wallpaper-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      opacity: 0;
      transition: opacity 0.25s ease-out;
    }
    .wallpaper-img.loaded {
      opacity: 1;
    }
    .meta-badge {
      display: inline-block;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--primary);
      background: rgba(99, 102, 241, 0.12);
      border: 1px solid rgba(99, 102, 241, 0.25);
      padding: 0.25rem 0.75rem;
      border-radius: var(--radius-full);
      margin-bottom: 0.75rem;
      letter-spacing: 0.03em;
    }
    .title-display {
      font-size: 1.35rem;
      font-weight: 700;
      color: #FFFFFF;
      margin-bottom: 0.4rem;
      line-height: 1.3;
    }
    .creator-tag {
      font-size: 0.82rem;
      color: var(--text-muted);
      margin-bottom: 1.25rem;
    }
    .feature-pills {
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
      justify-content: center;
      margin-bottom: 1.5rem;
    }
    .feature-pill {
      background: var(--bg-surface-elevated);
      border: 1px solid var(--border);
      padding: 0.3rem 0.75rem;
      border-radius: var(--radius-full);
      font-size: 0.75rem;
      color: var(--text-muted);
      font-weight: 500;
    }
    .btn-action-group {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      width: 100%;
    }
    .btn-apply-app {
      background: var(--primary);
      color: #FFFFFF;
      font-weight: 600;
      padding: 0.85rem 1.5rem;
      border-radius: var(--radius-md);
      text-decoration: none;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      transition: var(--transition);
      box-shadow: var(--shadow-primary);
    }
    .btn-apply-app:hover {
      background: var(--primary-hover);
      transform: translateY(-1px);
    }
    .btn-play-store {
      background: var(--bg-surface-elevated);
      border: 1px solid var(--border);
      color: var(--text-primary);
      padding: 0.75rem 1.25rem;
      border-radius: var(--radius-md);
      text-decoration: none;
      font-size: 0.88rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      transition: var(--transition);
    }
    .btn-play-store:hover {
      background: var(--bg-surface-hover);
      border-color: var(--border-hover);
    }
  </style>
</head>
<body>
  <header>
    <div class="header-inner">
      <a href="../../index.html" class="brand" aria-label="KinotiX Home">
        <img src="../../assets/icons/icon.png" alt="KinotiX Icon" class="brand-icon">
        <span>KinotiX</span>
      </a>
      <nav aria-label="Main Navigation">
        <ul class="nav-menu">
          <li><a href="../../index.html">Home</a></li>
          <li><a href="../../features.html">Features</a></li>
          <li><a href="../../download.html">Download</a></li>
          <li><a href="https://github.com/Tcode-Motion/kinotix" target="_blank" rel="noopener noreferrer">GitHub ↗</a></li>
        </ul>
      </nav>
      <div class="header-actions">
        <a href="${PLAY_STORE_URL}" target="_blank" rel="noopener noreferrer" class="btn-playstore btn-playstore-sm" aria-label="Get KinotiX on Google Play">
          <span class="play-title">Google Play</span>
        </a>
      </div>
    </div>
  </header>

  <main class="share-container">
    <div class="wallpaper-preview-card">
      <nav class="breadcrumb-nav" aria-label="Breadcrumb" style="font-size: 0.78rem; color: var(--text-muted); margin-bottom: 0.85rem; text-align: left; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
        <a href="../../index.html" style="color: var(--text-muted); text-decoration: none;">Home</a>
        <span style="margin: 0 0.35rem; opacity: 0.5;">/</span>
        <a href="../../${categorySlug}/" style="color: var(--text-muted); text-decoration: none;">${escCategoryName}</a>
        <span style="margin: 0 0.35rem; opacity: 0.5;">/</span>
        <span style="color: var(--text-primary); font-weight: 500;">${escTitle}</span>
      </nav>

      <div class="image-frame">
        ${mediaElement}
      </div>
      <div class="meta-badge">${escType}</div>
      <h1 class="title-display">${escTitle}</h1>
      ${creatorBadge}

      <div class="feature-pills">
        <span class="feature-pill">Ultra HD 4K</span>
        <span class="feature-pill">Lossless Quality</span>
        <span class="feature-pill">AMOLED Calibrated</span>
      </div>

      <div class="btn-action-group">
        <a href="kinotix://i/${imageId}" class="btn-apply-app">
          Open in KinotiX App
        </a>
        <a href="../../${categorySlug}/" class="btn-play-store">
          Explore More ${escCategoryName}
        </a>
        <a href="${PLAY_STORE_URL}" target="_blank" rel="noopener noreferrer" class="btn btn-ghost btn-sm" style="font-size: 0.82rem; color: var(--text-muted);">
          Get KinotiX on Google Play ↗
        </a>
      </div>
    </div>
  </main>

  <footer>
    <div class="footer-bottom" style="border: none; padding-top: 0; justify-content: center;">
      <span>&copy; 2026 KinotiX Engine • Developed by Tcode-Motion</span>
    </div>
  </footer>

  <script>
    // Instant visibility if cached in memory/disk
    (function() {
      const el = document.querySelector('.wallpaper-img');
      if (el && (el.complete || el.readyState >= 2)) {
        el.classList.add('loaded');
      }
    })();
  </script>
</body>
</html>`;
}

// Main Generation Routine
function main() {
  const rootDir = path.resolve(__dirname, '..');
  const scriptsDir = __dirname;
  const repoRoot = path.resolve(rootDir, '..');
  const primaryAssetsDir = path.join(repoRoot, 'app', 'src', 'main', 'assets');

  console.log('--- KinotiX Share Page Static Generator (Ultra-Fast Immediate Loading) ---');

  const phoneTreePath = path.join(scriptsDir, 'phone_wallpaper_tree.json');
  const liveTreePath = path.join(scriptsDir, 'live_wallpaper_tree.json');
  const threeDIndexPath = path.join(primaryAssetsDir, 'three_d_index.json');

  let wallpapers = [];

  // 1. Process all real wallpapers from phone-wallpaper (branch: master)
  if (fs.existsSync(phoneTreePath)) {
    try {
      const list = JSON.parse(fs.readFileSync(phoneTreePath, 'utf8'));
      for (const item of list) {
        if (typeof item === 'string' && item.trim()) {
          const encodedSegments = item.split('/').map(encodeURIComponent).join('/');
          const rawUrl = `https://raw.githubusercontent.com/venomleo2o1-byte/phone-wallpaper/master/${encodedSegments}`;
          const cdnUrl = `https://cdn.jsdelivr.net/gh/venomleo2o1-byte/phone-wallpaper@master/${encodedSegments}`;
          const canonicalUrl = normalizeUrl(rawUrl);
          const imageId = generateImageId(canonicalUrl);

          const segments = item.split('/');
          const category = segments[0];
          const filename = segments[segments.length - 1];
          const rawTitle = filename.replace(/\.[a-zA-Z0-9]+$/, '');
          const is3D = category.toLowerCase().includes('3d') || category.toLowerCase().includes('optical');
          const typeLabel = is3D ? '3D Live Wallpaper' : (category.toLowerCase() === 'anime' ? 'Anime Ultra HD 4K Wallpaper' : `${category} 4K Wallpaper`);
          const title = getShareDisplayName(rawTitle, is3D ? '3d' : 'static', category, imageId);

          wallpapers.push({
            imageId,
            title,
            typeLabel,
            cdnUrl,
            rawUrl,
            creator: is3D ? 'KinotiX 3D Studio' : 'KinotiX Studio',
            category,
            isVideo: false
          });
        }
      }
      console.log(`Loaded ${wallpapers.length} wallpapers from phone_wallpaper_tree.json`);
    } catch (e) {
      console.warn('Error reading phone_wallpaper_tree.json:', e.message);
    }
  }

  // 2. Process all real live wallpapers from live-wallpaper (branch: main)
  if (fs.existsSync(liveTreePath)) {
    try {
      const list = JSON.parse(fs.readFileSync(liveTreePath, 'utf8'));
      let liveCount = 0;
      for (const item of list) {
        if (typeof item === 'string' && item.trim()) {
          const encodedSegments = item.split('/').map(encodeURIComponent).join('/');
          const rawUrl = `https://raw.githubusercontent.com/venomleo2o1-byte/live-wallpaper/main/${encodedSegments}`;
          const cdnUrl = `https://cdn.jsdelivr.net/gh/venomleo2o1-byte/live-wallpaper@main/${encodedSegments}`;
          const canonicalUrl = normalizeUrl(rawUrl);
          const imageId = generateImageId(canonicalUrl);

          const filename = item.split('/').pop();
          const rawTitle = filename.replace(/\.[a-zA-Z0-9]+$/, '');
          const title = getShareDisplayName(rawTitle, 'live', 'live', imageId);

          wallpapers.push({
            imageId,
            title,
            typeLabel: '4K Live Video Wallpaper',
            cdnUrl,
            rawUrl,
            creator: 'KinotiX Live Studio',
            category: 'live',
            isVideo: true
          });
          liveCount++;
        }
      }
      console.log(`Loaded ${liveCount} live video wallpapers from live_wallpaper_tree.json`);
    } catch (e) {
      console.warn('Error reading live_wallpaper_tree.json:', e.message);
    }
  }

  // 3. Fallback: Process three_d_index.json if present
  if (fs.existsSync(threeDIndexPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(threeDIndexPath, 'utf8'));
      for (const [catKey, list] of Object.entries(data)) {
        if (Array.isArray(list)) {
          for (const item of list) {
            const encodedSegments = item.split('/').map(encodeURIComponent).join('/');
            const rawUrl = `https://raw.githubusercontent.com/venomleo2o1-byte/phone-wallpaper/master/${encodedSegments}`;
            const cdnUrl = `https://cdn.jsdelivr.net/gh/venomleo2o1-byte/phone-wallpaper@master/${encodedSegments}`;
            const canonicalUrl = normalizeUrl(rawUrl);
            const imageId = generateImageId(canonicalUrl);

            const segments = item.split('/');
            const filename = segments[segments.length - 1];
            const rawTitle = filename.replace(/\.[a-zA-Z0-9]+$/, '');
            const title = getShareDisplayName(rawTitle, '3d', 'optical', imageId);

            wallpapers.push({
              imageId,
              title,
              typeLabel: '3D Live Wallpaper',
              cdnUrl,
              rawUrl,
              creator: 'KinotiX 3D Studio',
              category: '3d',
              isVideo: false
            });
          }
        }
      }
    } catch (e) {
      console.warn('Error reading three_d_index.json:', e.message);
    }
  }

  // Deduplicate by imageId
  const uniqueMap = new Map();
  for (const wp of wallpapers) {
    if (!uniqueMap.has(wp.imageId)) {
      uniqueMap.set(wp.imageId, wp);
    }
  }
  const uniqueWallpapers = Array.from(uniqueMap.values());
  console.log(`Total unique share pages to generate: ${uniqueWallpapers.length}`);

  // Targets: both /i/ and /docs/i/
  const outDirs = [
    path.join(rootDir, 'i'),
    path.join(rootDir, 'docs', 'i')
  ];

  for (const outDir of outDirs) {
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }

    let generatedCount = 0;
    for (const wp of uniqueWallpapers) {
      const pageDir = path.join(outDir, wp.imageId);
      if (!fs.existsSync(pageDir)) {
        fs.mkdirSync(pageDir, { recursive: true });
      }
      const filePath = path.join(pageDir, 'index.html');
      const html = renderSharePageHtml(wp);
      fs.writeFileSync(filePath, html, 'utf8');
      generatedCount++;
    }
    console.log(`Wrote ${generatedCount} ultra-fast share pages into ${outDir}`);
  }

  console.log('Share page generation completed successfully!');
}

if (require.main === module) {
  main();
}

module.exports = {
  normalizeUrl,
  generateImageId,
  isMeaningfulTitle,
  getShareDisplayName,
  renderSharePageHtml
};
