/**
 * KinotiX Automated Share Page Generator
 * Production-Grade Static Generator for GitHub Pages & Social Previews
 * 
 * Generates static /kinotix/i/{imageId}/index.html pages with genuine
 * HTTP 200 server-rendered Open Graph & Twitter Card metadata.
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
    let pathname = u.pathname;
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
  const clean = title.replace(/\s*\(Live Loop\)\s*$/i, '').trim();
  if (!clean) return false;
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
  const clean = (rawTitle || '').replace(/\s*\(Live Loop\)\s*$/i, '').trim();
  if (isMeaningfulTitle(clean)) return clean;
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
  if (typeLower === '3d' || idLower.includes('3d')) {
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

function renderSharePageHtml({ imageId, title, typeLabel, previewUrl, creator, category, isVideo, isFluid, isParticle }) {
  const canonicalUrl = `${BASE_URL}${imageId}`;
  const escTitle = escapeHtml(title);
  const escType = escapeHtml(typeLabel);
  const escPreview = escapeHtml(previewUrl);
  const escCreator = creator ? escapeHtml(creator) : '';

  const creatorBadge = escCreator ? `<div class="creator-tag">Curated by <strong>${escCreator}</strong></div>` : '';
  const creatorOg = escCreator ? ` by ${escCreator}` : '';
  const ogDesc = `Experience this ${escType}${creatorOg} with 3D Parallax Gyro & OpenGL ES Fluid simulation in KinotiX for Android.`;

  return `<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escTitle} • KinotiX</title>
  <meta name="description" content="${ogDesc}">
  <link rel="canonical" href="${canonicalUrl}">
  <link rel="icon" type="image/png" href="../../assets/icons/icon-192.png">
  <link rel="stylesheet" href="../../css/style.css">

  <!-- OpenGraph Metadata (WhatsApp, Telegram, Discord, Facebook, X) -->
  <meta property="og:title" content="${escTitle} • KinotiX">
  <meta property="og:description" content="${ogDesc}">
  <meta property="og:type" content="article">
  <meta property="og:image" content="${escPreview}">
  <meta property="og:image:secure_url" content="${escPreview}">
  <meta property="og:image:type" content="image/jpeg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:site_name" content="KinotiX">

  <!-- Twitter Cards -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escTitle} • KinotiX">
  <meta name="twitter:description" content="${ogDesc}">
  <meta name="twitter:image" content="${escPreview}">

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
      background: #000000;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid var(--border-subtle);
      margin-bottom: 1.25rem;
    }
    .wallpaper-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
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
      <div class="image-frame">
        <img src="${escPreview}" alt="${escTitle}" class="wallpaper-img" onerror="this.onerror=null; this.src='../../assets/screenshots/home_feed.png';">
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
        <a href="${PLAY_STORE_URL}" target="_blank" rel="noopener noreferrer" class="btn-play-store">
          Get KinotiX on Google Play
        </a>
      </div>
    </div>
  </main>

  <footer>
    <div class="footer-bottom" style="border: none; padding-top: 0; justify-content: center;">
      <span>&copy; 2026 KinotiX Engine • Developed by Tcode-Motion</span>
    </div>
  </footer>
</body>
</html>`;
}

// Main Generation Routine
function main() {
  const rootDir = path.resolve(__dirname, '..');
  const repoRoot = path.resolve(rootDir, '..');
  const primaryAssetsDir = path.join(repoRoot, 'app', 'src', 'main', 'assets');
  const fallbackAssetsDir = path.join(__dirname, 'data');

  console.log('--- KinotiX Share Page Static Generator ---');

  let wallpapersIndexPath = path.join(primaryAssetsDir, 'wallpapers_index.json');
  let threeDIndexPath = path.join(primaryAssetsDir, 'three_d_index.json');

  if (!fs.existsSync(wallpapersIndexPath)) {
    wallpapersIndexPath = path.join(fallbackAssetsDir, 'wallpapers_index.json');
    threeDIndexPath = path.join(fallbackAssetsDir, 'three_d_index.json');
  }

  console.log('Using wallpaper index path:', wallpapersIndexPath);

  let wallpapers = [];

  // 1. Process curated static wallpapers index
  if (fs.existsSync(wallpapersIndexPath)) {
    try {
      const list = JSON.parse(fs.readFileSync(wallpapersIndexPath, 'utf8'));
      for (const item of list) {
        if (typeof item === 'string') {
          const rawUrl = `https://raw.githubusercontent.com/venomleo2o1-byte/phone-wallpaper/main/${encodeURI(item)}`;
          const canonicalUrl = normalizeUrl(rawUrl);
          const imageId = generateImageId(canonicalUrl);

          const segments = item.split('/');
          const category = segments.length > 1 ? segments[1] : 'general';
          const filename = segments[segments.length - 1];
          const rawTitle = filename.replace(/\.[a-zA-Z0-9]+$/, '');
          const title = getShareDisplayName(rawTitle, 'static', category, imageId);

          wallpapers.push({
            imageId,
            title,
            typeLabel: category === 'anime' ? 'Anime Ultra HD 4K Wallpaper' : 'Ultra HD 4K Wallpaper',
            previewUrl: rawUrl,
            creator: 'KinotiX Studio',
            category,
            isVideo: false
          });
        }
      }
      console.log(`Loaded ${list.length} static wallpapers from wallpapers_index.json`);
    } catch (e) {
      console.warn('Error reading wallpapers_index.json:', e.message);
    }
  }

  // 2. Process 3D Optical Illusions
  if (fs.existsSync(threeDIndexPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(threeDIndexPath, 'utf8'));
      for (const [catKey, list] of Object.entries(data)) {
        if (Array.isArray(list)) {
          for (const item of list) {
            const rawUrl = `https://raw.githubusercontent.com/venomleo2o1-byte/phone-wallpaper/main/${encodeURI(item)}`;
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
              previewUrl: rawUrl,
              creator: 'KinotiX 3D Studio',
              category: '3d',
              isVideo: false
            });
          }
        }
      }
      console.log(`Loaded 3D optical illusions from three_d_index.json`);
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
    console.log(`Wrote ${generatedCount} static share pages into ${outDir}`);
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
