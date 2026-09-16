/**
 * KinotiX Automated Share Page Generator
 * 
 * Generates static /kinotix/i/{imageId}/index.html pages for all wallpapers
 * with genuine HTTP 200 server-rendered Open Graph & Twitter metadata.
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

  const creatorBadge = escCreator ? `<div class="creator-tag">by <strong>${escCreator}</strong></div>` : '';
  const creatorOg = escCreator ? ` by ${escCreator}` : '';
  const ogDesc = `Discover this ${escType}${creatorOg} on KinotiX — 3D Parallax & OpenGL ES Fluid Wallpaper Engine.`;

  return `<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escTitle} • KinotiX</title>
  <meta name="description" content="${ogDesc}">
  <link rel="canonical" href="${canonicalUrl}">
  <link rel="stylesheet" href="../../css/style.css">

  <!-- OpenGraph Metadata (Pre-rendered for WhatsApp, Telegram, Discord, Facebook) -->
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
      padding: 2rem 1rem;
    }
    .wallpaper-preview-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-xl);
      padding: 1.5rem;
      max-width: 460px;
      width: 100%;
      box-shadow: var(--shadow-lg);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      text-align: center;
      position: relative;
      overflow: hidden;
      transition: var(--transition);
    }
    .wallpaper-preview-card:hover {
      border-color: var(--border-hover);
      box-shadow: 0 0 40px rgba(0, 240, 255, 0.2);
    }
    .image-frame {
      width: 100%;
      aspect-ratio: 9 / 16;
      max-height: 480px;
      border-radius: var(--radius-lg);
      overflow: hidden;
      background: #020408;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid rgba(255, 255, 255, 0.08);
      margin-bottom: 1.25rem;
    }
    .wallpaper-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      transition: transform 0.4s ease;
    }
    .wallpaper-img:hover {
      transform: scale(1.02);
    }
    .meta-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      background: rgba(0, 240, 255, 0.1);
      border: 1px solid rgba(0, 240, 255, 0.3);
      color: var(--cyan);
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.35rem 0.8rem;
      border-radius: 999px;
      margin-bottom: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .title-display {
      font-size: 1.4rem;
      font-weight: 800;
      color: var(--text-primary);
      margin-bottom: 0.35rem;
      letter-spacing: -0.02em;
    }
    .creator-tag {
      font-size: 0.88rem;
      color: var(--text-secondary);
      margin-bottom: 1.25rem;
    }
    .feature-pills {
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
      justify-content: center;
      margin-bottom: 1.25rem;
    }
    .feature-pill {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      padding: 0.25rem 0.7rem;
      border-radius: 12px;
      font-size: 0.75rem;
      color: var(--text-muted);
      font-weight: 600;
    }
    .btn-action-group {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      width: 100%;
    }
    .btn-apply-app {
      background: linear-gradient(135deg, var(--cyan), #0070f3);
      color: #000;
      font-weight: 800;
      padding: 0.85rem 1.5rem;
      border-radius: var(--radius-md);
      text-decoration: none;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      transition: var(--transition);
      box-shadow: 0 4px 14px rgba(0, 240, 255, 0.4);
    }
    .btn-apply-app:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 240, 255, 0.6);
    }
    .btn-play-store {
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.15);
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
      background: rgba(255, 255, 255, 0.12);
      border-color: rgba(255, 255, 255, 0.3);
    }
  </style>
</head>
<body>
  <header>
    <a href="../../index.html" class="brand">
      <span>KinotiX 🌌</span>
    </a>
    <nav>
      <ul class="nav-links">
        <li><a href="../../index.html">Home</a></li>
        <li><a href="../../features.html">Features</a></li>
        <li><a href="../../download.html">Download</a></li>
        <li><a href="https://github.com/Tcode-Motion/kinotix" target="_blank">GitHub ↗</a></li>
      </ul>
      <a href="${PLAY_STORE_URL}" target="_blank" rel="noopener noreferrer" class="btn-playstore btn-playstore-sm" aria-label="Get KinotiX on Google Play">
        <span class="play-title">Google Play</span>
      </a>
    </nav>
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
        <span class="feature-pill">⚡ Ultra HD 4K</span>
        <span class="feature-pill">🛡️ Lossless Quality</span>
        <span class="feature-pill">🔋 Zero Battery Drain</span>
      </div>

      <div class="btn-action-group">
        <a href="kinotix://i/${imageId}" class="btn-apply-app">
          <span>🚀 Open in KinotiX App</span>
        </a>
        <a href="${PLAY_STORE_URL}" target="_blank" rel="noopener noreferrer" class="btn-play-store">
          <span>Get KinotiX on Google Play</span>
        </a>
      </div>
    </div>
  </main>

  <footer>
    <div class="footer-bottom">
      <span>&copy; 2026 KinotiX Engine • Tcode-Motion</span>
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

  // 3. Built-in interactive engine presets
  const presets = [
    {
      canonicalUrl: 'kinotix://engine/fluid/cosmic_glow',
      title: 'Cosmic Glow Fluid',
      typeLabel: 'Fluid Live Wallpaper',
      previewUrl: 'https://techscript.is-a.dev/kinotix/assets/screenshots/discover_feed.png',
      creator: 'KinotiX Fluid Studio',
      isFluid: true
    },
    {
      canonicalUrl: 'kinotix://engine/particle/astropixel',
      title: 'Astropixel 3D Engine',
      typeLabel: 'Particle Live Wallpaper',
      previewUrl: 'https://techscript.is-a.dev/kinotix/assets/screenshots/collections.png',
      creator: 'KinotiX Particle Studio',
      isParticle: true
    },
    {
      canonicalUrl: 'kinotix://engine/camera/camera_live',
      title: 'Transparent Camera Live',
      typeLabel: 'Camera Live Wallpaper',
      previewUrl: 'https://techscript.is-a.dev/kinotix/assets/screenshots/home_feed.png',
      creator: 'KinotiX Camera Studio'
    },
    {
      canonicalUrl: 'https://raw.githubusercontent.com/venomleo2o1-byte/live-wallpaper/main/previews/ocean_loop.mp4',
      title: 'Deep Ocean Loop',
      typeLabel: '4K Video Wallpaper',
      previewUrl: 'https://techscript.is-a.dev/kinotix/assets/screenshots/detail_apply.png',
      creator: 'KinotiX Live Studio',
      isVideo: true
    }
  ];

  for (const preset of presets) {
    const imageId = generateImageId(normalizeUrl(preset.canonicalUrl));
    wallpapers.push({
      imageId,
      title: preset.title,
      typeLabel: preset.typeLabel,
      previewUrl: preset.previewUrl,
      creator: preset.creator,
      category: 'engine',
      isVideo: preset.isVideo,
      isFluid: preset.isFluid,
      isParticle: preset.isParticle
    });
  }

  // Deduplicate by imageId
  const uniqueWallpapers = new Map();
  const catalogObj = {};
  for (const wp of wallpapers) {
    if (!uniqueWallpapers.has(wp.imageId)) {
      uniqueWallpapers.set(wp.imageId, wp);
      catalogObj[wp.imageId] = wp;
    }
  }

  console.log(`Generating static share pages for ${uniqueWallpapers.size} unique wallpapers...`);

  const outDirs = [
    path.join(rootDir, 'i'),
    path.join(rootDir, 'docs', 'i')
  ];

  // Auto-sync CSS to docs/css if docs exists
  const docsDir = path.join(rootDir, 'docs');
  const cssDir = path.join(rootDir, 'css');
  const docsCssDir = path.join(docsDir, 'css');
  if (fs.existsSync(docsDir) && fs.existsSync(cssDir)) {
    if (!fs.existsSync(docsCssDir)) {
      fs.mkdirSync(docsCssDir, { recursive: true });
    }
    const cssFiles = fs.readdirSync(cssDir);
    for (const file of cssFiles) {
      fs.copyFileSync(path.join(cssDir, file), path.join(docsCssDir, file));
    }
  }

  let generatedCount = 0;
  for (const wp of uniqueWallpapers.values()) {
    const html = renderSharePageHtml(wp);
    for (const outDir of outDirs) {
      const pageDir = path.join(outDir, wp.imageId);
      if (!fs.existsSync(pageDir)) {
        fs.mkdirSync(pageDir, { recursive: true });
      }
      fs.writeFileSync(path.join(pageDir, 'index.html'), html, 'utf8');
    }
    generatedCount++;
  }

  // Write catalog.json to both i/ and docs/i/
  const catalogJson = JSON.stringify(catalogObj, null, 2);
  for (const outDir of outDirs) {
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }
    fs.writeFileSync(path.join(outDir, 'catalog.json'), catalogJson, 'utf8');
  }

  console.log(`Successfully generated ${generatedCount} wallpaper pages and catalog.json in i/ and docs/i/!`);
}

main();
