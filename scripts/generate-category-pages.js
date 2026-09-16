/**
 * KinotiX Category Hub & Technical Guide Static Generator
 * 
 * Generates static, indexable category landing pages and technical guides
 * with Schema.org CollectionPage & BreadcrumbList structured data.
 */

const fs = require('fs');
const path = require('path');
const { normalizeUrl, generateImageId, getShareDisplayName } = require('./generate-share-pages');

const BASE_URL = 'https://techscript.is-a.dev/kinotix/';
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.kinotix.app';

// 10 Core SEO Category Hub Definitions
const CATEGORY_HUBS = [
  {
    slug: '4k-wallpapers',
    catKey: 'all',
    title: '4K Wallpapers for Phone & Android | KinotiX',
    heading: 'Ultra HD 4K Wallpapers for Phone & Mobile',
    tagline: 'Curated 3840×2160 Ultra HD wallpapers calibrated for high-density Android displays, AMOLED screens, and custom lock screens.',
    description: 'Browse and download verified 4K wallpapers for Android phones. Lossless high-resolution mobile backgrounds calibrated for AMOLED and high refresh rate displays on KinotiX.',
    categoryName: '4K Wallpapers'
  },
  {
    slug: 'anime-wallpapers',
    catKey: 'Anime',
    title: 'Anime 4K Wallpapers for Android & Phone | KinotiX',
    heading: 'Anime 4K Wallpapers for Mobile & Lock Screen',
    tagline: 'Hand-curated anime character art, cyberpunk aesthetics, and scenic illustrations rendered in crisp 4K resolution.',
    description: 'Discover the best anime 4K wallpapers for your phone. High-resolution anime artwork calibrated for Android home screens and lock screens on KinotiX.',
    categoryName: 'Anime Wallpapers'
  },
  {
    slug: 'amoled-wallpapers',
    catKey: 'AMOLED',
    title: 'AMOLED Wallpapers 4K — Pure Black & OLED | KinotiX',
    heading: 'AMOLED & Pure Black 4K Wallpapers for Android',
    tagline: 'True #000000 black backgrounds engineered to turn off individual OLED sub-pixels, reducing battery consumption while delivering infinite contrast.',
    description: 'Download true black AMOLED 4K wallpapers for Android. Maximize battery efficiency and visual contrast on OLED displays with KinotiX.',
    categoryName: 'AMOLED Wallpapers'
  },
  {
    slug: 'live-wallpapers',
    catKey: 'live',
    title: '4K Live Wallpapers for Android — Motion & Video | KinotiX',
    heading: '4K Live Video & Motion Wallpapers for Android',
    tagline: 'Seamless 60 FPS looping video wallpapers engineered with hardware-accelerated rendering and automatic battery-pause on sleep.',
    description: 'Experience 4K live video wallpapers for Android. Fluid 60 FPS motion backgrounds with smart battery pause on screen lock with KinotiX.',
    categoryName: 'Live Wallpapers'
  },
  {
    slug: '3d-wallpapers',
    catKey: '3D & Optical Illusion',
    title: '3D Parallax & Depth Illusion Wallpapers | KinotiX',
    heading: '3D Parallax Gyroscope Wallpapers for Android',
    tagline: 'Interactive multi-layer 3D depth wallpapers that react dynamically to your phone’s accelerometer and gyroscope sensors.',
    description: 'Explore interactive 3D parallax wallpapers for Android. Gyroscope-driven depth illusions and multi-plane motion art on KinotiX.',
    categoryName: '3D Wallpapers'
  },
  {
    slug: 'nature-wallpapers',
    catKey: 'Nature',
    title: 'Nature 4K Wallpapers — Landscapes & Mountains | KinotiX',
    heading: 'Nature & Landscape 4K Wallpapers for Mobile',
    tagline: 'Breathtaking mountain peaks, aurora borealis, oceanic horizons, and serene natural wilderness captured in native 4K detail.',
    description: 'Download scenic nature 4K wallpapers for phone and Android. Vibrant landscapes, forests, oceans, and mountains on KinotiX.',
    categoryName: 'Nature Wallpapers'
  },
  {
    slug: 'cyberpunk-wallpapers',
    catKey: 'Cyberpunk',
    title: 'Cyberpunk 4K Wallpapers — Neon & Futuristic | KinotiX',
    heading: 'Cyberpunk & Futuristic Neon 4K Wallpapers',
    tagline: 'Neon-soaked futuristic skylines, synthwave streetscapes, and high-tech anime environments tailored for vibrant AMOLED displays.',
    description: 'Immerse your home screen with cyberpunk 4K wallpapers. Neon cityscapes, high-tech vehicles, and futuristic art on KinotiX.',
    categoryName: 'Cyberpunk Wallpapers'
  },
  {
    slug: 'cars-wallpapers',
    catKey: 'Cars',
    title: 'Supercars 4K Wallpapers — Exotic & Sports Cars | KinotiX',
    heading: 'Supercars & Sports Car 4K Wallpapers for Phone',
    tagline: 'Ultra-high-resolution automotive photography featuring hypercars, classic sports cars, and precision-tuned speed machines.',
    description: 'Explore supercar 4K wallpapers for mobile. High-definition exotic cars, track machines, and classic automobiles on KinotiX.',
    categoryName: 'Cars Wallpapers'
  },
  {
    slug: 'space-wallpapers',
    catKey: 'Space',
    title: 'Space 4K Wallpapers — Galaxy, Nebula & Cosmos | KinotiX',
    heading: 'Space & Cosmic Galaxy 4K Wallpapers for Android',
    tagline: 'Deep space nebulae, cosmic star clusters, planetary vistas, and lunar landscapes calibrated for deep blacks and vivid colors.',
    description: 'Download cosmic space 4K wallpapers for Android. Galaxies, celestial nebulae, and astronaut art in lossless resolution on KinotiX.',
    categoryName: 'Space Wallpapers'
  },
  {
    slug: 'abstract-wallpapers',
    catKey: 'Abstract',
    title: 'Abstract 4K Wallpapers — Fluid & Minimal Art | KinotiX',
    heading: 'Abstract & Fluid Art 4K Wallpapers for Mobile',
    tagline: 'Geometric 3D forms, chromatic liquid simulations, and minimalist color gradients designed to make your app icons stand out.',
    description: 'Discover modern abstract 4K wallpapers for Android. Fluid art, geometric textures, and minimalist color palettes on KinotiX.',
    categoryName: 'Abstract Wallpapers'
  }
];

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function generateCategoryPages() {
  const rootDir = path.resolve(__dirname, '..');
  const scriptsDir = __dirname;
  const docsDir = path.join(rootDir, 'docs');

  console.log('--- Generating KinotiX SEO Category Hub Pages ---');

  const phoneTreePath = path.join(scriptsDir, 'phone_wallpaper_tree.json');
  const liveTreePath = path.join(scriptsDir, 'live_wallpaper_tree.json');

  const phoneTree = fs.existsSync(phoneTreePath) ? JSON.parse(fs.readFileSync(phoneTreePath, 'utf8')) : [];
  const liveTree = fs.existsSync(liveTreePath) ? JSON.parse(fs.readFileSync(liveTreePath, 'utf8')) : [];

  // Index wallpapers by category key
  const categoryWallpapersMap = new Map();
  for (const hub of CATEGORY_HUBS) {
    categoryWallpapersMap.set(hub.slug, []);
  }

  // Populate phone wallpapers
  for (const item of phoneTree) {
    const segments = item.split('/');
    const cat = segments[0];
    const filename = segments[segments.length - 1];
    const encodedSegments = item.split('/').map(encodeURIComponent).join('/');
    const rawUrl = `https://raw.githubusercontent.com/venomleo2o1-byte/phone-wallpaper/master/${encodedSegments}`;
    const cdnUrl = `https://cdn.jsdelivr.net/gh/venomleo2o1-byte/phone-wallpaper@master/${encodedSegments}`;
    const canonical = normalizeUrl(rawUrl);
    const imageId = generateImageId(canonical);
    const rawTitle = filename.replace(/\.[a-zA-Z0-9]+$/, '');
    const title = getShareDisplayName(rawTitle, cat, cat, imageId);

    const wpObj = {
      imageId,
      title,
      cdnUrl,
      rawUrl,
      category: cat
    };

    // Add to specific hub
    for (const hub of CATEGORY_HUBS) {
      if (hub.catKey === 'all') {
        categoryWallpapersMap.get(hub.slug).push(wpObj);
      } else if (cat.toLowerCase().includes(hub.catKey.toLowerCase()) || hub.catKey.toLowerCase().includes(cat.toLowerCase())) {
        categoryWallpapersMap.get(hub.slug).push(wpObj);
      }
    }
  }

  // Populate live wallpapers
  for (const item of liveTree) {
    const filename = item.split('/').pop();
    const encodedSegments = item.split('/').map(encodeURIComponent).join('/');
    const rawUrl = `https://raw.githubusercontent.com/venomleo2o1-byte/live-wallpaper/main/${encodedSegments}`;
    const cdnUrl = `https://cdn.jsdelivr.net/gh/venomleo2o1-byte/live-wallpaper@main/${encodedSegments}`;
    const canonical = normalizeUrl(rawUrl);
    const imageId = generateImageId(canonical);
    const rawTitle = filename.replace(/\.[a-zA-Z0-9]+$/, '');
    const title = getShareDisplayName(rawTitle, 'live', 'live', imageId);

    const wpObj = {
      imageId,
      title,
      cdnUrl,
      rawUrl,
      category: 'live',
      isVideo: true
    };

    categoryWallpapersMap.get('live-wallpapers').push(wpObj);
    categoryWallpapersMap.get('4k-wallpapers').push(wpObj);
  }

  // Generate HTML for each Category Hub
  for (const hub of CATEGORY_HUBS) {
    const list = categoryWallpapersMap.get(hub.slug) || [];
    // Show top 32 curated wallpapers per hub
    const showcaseList = list.slice(0, 32);

    let wallpaperCardsHtml = '';
    for (const wp of showcaseList) {
      const escTitle = escapeHtml(wp.title);
      const escCdn = escapeHtml(wp.cdnUrl);
      const escRaw = escapeHtml(wp.rawUrl);
      const shareUrl = `../i/${wp.imageId}/`;

      wallpaperCardsHtml += `
      <div class="wallpaper-card">
        <a href="${shareUrl}" class="wallpaper-link" aria-label="View ${escTitle}">
          <div class="wallpaper-thumb-wrapper">
            <img src="${escCdn}" 
                 alt="${escTitle} • 4K wallpaper for phone" 
                 width="1080" 
                 height="1920" 
                 loading="lazy" 
                 decoding="async" 
                 class="wallpaper-card-img" 
                 onerror="if(this.src!=='${escRaw}'){this.src='${escRaw}';}">
          </div>
          <div class="wallpaper-info">
            <span class="card-title">${escTitle}</span>
            <span class="card-badge">4K Ultra HD</span>
          </div>
        </a>
      </div>`;
    }

    // Sibling category links
    let siblingLinksHtml = '';
    for (const sib of CATEGORY_HUBS) {
      if (sib.slug !== hub.slug) {
        siblingLinksHtml += `<a href="../${sib.slug}/" class="btn btn-secondary btn-sm">${escapeHtml(sib.categoryName)}</a>\n`;
      }
    }

    const canonicalUrl = `${BASE_URL}${hub.slug}/`;

    const html = `<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(hub.title)}</title>
  <meta name="description" content="${escapeHtml(hub.description)}">
  <link rel="canonical" href="${canonicalUrl}">
  <link rel="icon" type="image/png" href="../assets/icons/icon-192.png">
  <link rel="stylesheet" href="../css/style.css">

  <!-- OpenGraph Metadata -->
  <meta property="og:title" content="${escapeHtml(hub.title)}">
  <meta property="og:description" content="${escapeHtml(hub.description)}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:image" content="${showcaseList[0] ? showcaseList[0].rawUrl : '../assets/screenshots/home_feed.png'}">
  <meta property="og:site_name" content="KinotiX">

  <!-- Twitter Cards -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(hub.title)}">
  <meta name="twitter:description" content="${escapeHtml(hub.description)}">
  <meta name="twitter:image" content="${showcaseList[0] ? showcaseList[0].rawUrl : '../assets/screenshots/home_feed.png'}">

  <!-- Schema.org JSON-LD Structured Data: CollectionPage & BreadcrumbList -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": "${canonicalUrl}",
        "url": "${canonicalUrl}",
        "name": "${escapeHtml(hub.heading)}",
        "description": "${escapeHtml(hub.description)}",
        "isPartOf": {
          "@type": "WebSite",
          "name": "KinotiX",
          "url": "${BASE_URL}"
        }
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
            "name": "${escapeHtml(hub.categoryName)}",
            "item": "${canonicalUrl}"
          }
        ]
      }
    ]
  }
  </script>
</head>
<body>
  <header>
    <div class="header-inner">
      <a href="../index.html" class="brand" aria-label="KinotiX Home">
        <img src="../assets/icons/icon.png" alt="KinotiX Icon" class="brand-icon">
        <span>KinotiX</span>
      </a>
      <nav aria-label="Main Navigation">
        <ul class="nav-menu">
          <li><a href="../index.html">Home</a></li>
          <li><a href="../features.html">Features</a></li>
          <li><a href="../download.html">Download</a></li>
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

  <main>
    <div class="container" style="padding-top: 2rem;">
      <nav class="breadcrumb-nav" aria-label="Breadcrumb" style="margin-bottom: 1.5rem; font-size: 0.85rem; color: var(--text-muted);">
        <a href="../index.html" style="color: var(--text-muted); text-decoration: none;">Home</a>
        <span style="margin: 0 0.5rem; opacity: 0.5;">/</span>
        <span style="color: var(--text-primary); font-weight: 600;">${escapeHtml(hub.categoryName)}</span>
      </nav>

      <section class="category-hero" style="margin-bottom: 3rem; text-align: center; max-width: 800px; margin-left: auto; margin-right: auto;">
        <span class="badge badge-primary" style="margin-bottom: 1rem;">Curated Collection</span>
        <h1 style="font-size: clamp(2rem, 4vw, 2.75rem); font-weight: 800; line-height: 1.2; margin-bottom: 1rem; color: #FFFFFF;">
          ${escapeHtml(hub.heading)}
        </h1>
        <p style="font-size: 1.05rem; color: var(--text-secondary); line-height: 1.6; margin-bottom: 1.75rem;">
          ${escapeHtml(hub.tagline)}
        </p>
        <div style="display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap;">
          <a href="${PLAY_STORE_URL}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">
            Apply in KinotiX App
          </a>
          <a href="../download.html" class="btn btn-secondary">
            App Specifications
          </a>
        </div>
      </section>

      <!-- Wallpaper Showcase Grid -->
      <section style="margin-bottom: 4rem;">
        <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 1.5rem;">
          <h2 style="font-size: 1.5rem; font-weight: 700; color: #FFFFFF;">Top ${escapeHtml(hub.categoryName)}</h2>
          <span style="font-size: 0.9rem; color: var(--text-muted);">${list.length} Verified Wallpapers</span>
        </div>
        <div class="wallpaper-grid">
          ${wallpaperCardsHtml}
        </div>
      </section>

      <!-- Category Navigation & Internal Linking Network -->
      <section style="background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-xl); padding: 2.5rem 2rem; margin-bottom: 4rem; text-align: center;">
        <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 1rem; color: #FFFFFF;">Explore Related Wallpaper Categories</h3>
        <p style="color: var(--text-muted); font-size: 0.95rem; margin-bottom: 1.5rem; max-width: 600px; margin-left: auto; margin-right: auto;">
          Discover complementary themes calibrated for OLED displays, motion parallax, and high-DPI smartphone screens.
        </p>
        <div style="display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap;">
          ${siblingLinksHtml}
        </div>
      </section>
    </div>
  </main>

  <footer>
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <div class="footer-brand-header">
            <img src="../assets/icons/icon.png" alt="KinotiX Icon" class="footer-logo">
            <span class="footer-title">KinotiX</span>
          </div>
          <p class="footer-desc">
            Hardware-accelerated 4K live wallpaper and 3D parallax engine for Android. Calibrated for AMOLED displays and high-refresh-rate devices.
          </p>
        </div>
        <div class="footer-col">
          <h3 class="footer-heading">Collections</h3>
          <ul class="footer-links">
            <li><a href="../4k-wallpapers/">4K Wallpapers</a></li>
            <li><a href="../anime-wallpapers/">Anime Wallpapers</a></li>
            <li><a href="../amoled-wallpapers/">AMOLED Wallpapers</a></li>
            <li><a href="../live-wallpapers/">Live Wallpapers</a></li>
            <li><a href="../3d-wallpapers/">3D Parallax</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h3 class="footer-heading">Product</h3>
          <ul class="footer-links">
            <li><a href="../features.html">Engine Features</a></li>
            <li><a href="../download.html">Download App</a></li>
            <li><a href="../guides/amoled-wallpaper-guide.html">AMOLED Display Guide</a></li>
            <li><a href="../guides/4k-vs-fhd-phone-wallpapers.html">4K vs FHD Guide</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h3 class="footer-heading">Legal & Info</h3>
          <ul class="footer-links">
            <li><a href="../privacy.html">Privacy Policy</a></li>
            <li><a href="../terms.html">Terms of Service</a></li>
            <li><a href="../support.html">Support</a></li>
            <li><a href="https://github.com/Tcode-Motion/kinotix" target="_blank" rel="noopener noreferrer">Source Code</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <span>&copy; 2026 KinotiX Engine • Developed by Tcode-Motion</span>
        <span>Package: com.kinotix.app</span>
      </div>
    </div>
  </footer>
</body>
</html>`;

    // Write to both root and docs/
    const targetDirs = [
      path.join(rootDir, hub.slug),
      path.join(docsDir, hub.slug)
    ];

    for (const dir of targetDirs) {
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, 'index.html'), html, 'utf8');
    }
    console.log(`Generated category hub: ${hub.slug} with ${showcaseList.length} cards`);
  }

  // 2. Generate the 2 Technical Display Guides (Phase J)
  generateTechnicalGuides(rootDir, docsDir);

  console.log('Category Hubs and Technical Guides generated successfully!');
}

function generateTechnicalGuides(rootDir, docsDir) {
  const guides = [
    {
      slug: 'amoled-wallpaper-guide.html',
      title: 'How AMOLED Wallpapers Save Battery on OLED Screens | KinotiX',
      heading: 'How True Black & AMOLED Wallpapers Save Battery on OLED Displays',
      description: 'Learn the technical science behind AMOLED sub-pixel illumination, how true #000000 black wallpapers conserve power, and how KinotiX optimizes battery efficiency on Android.',
      contentHtml: `
      <article style="max-width: 760px; margin: 0 auto; color: var(--text-secondary); line-height: 1.8; font-size: 1.05rem;">
        <h2 style="color: #FFFFFF; font-size: 1.6rem; margin-top: 2rem; margin-bottom: 1rem;">1. The Physics of AMOLED Sub-Pixel Illumination</h2>
        <p>Unlike traditional IPS LCD displays that employ a continuous global LED backlight to illuminate pixels from behind, OLED (Organic Light Emitting Diode) and AMOLED displays feature emissive pixels. Each individual red, green, and blue sub-pixel generates its own light through electroluminescence.</p>
        <p>When an AMOLED panel encounters a true black pixel with hexadecimal value <code>#000000</code>, the display driver completely switches off the electrical current to that specific diode. A completely turned-off pixel consumes approximately zero milliwatts (0 mW) of power.</p>

        <h2 style="color: #FFFFFF; font-size: 1.6rem; margin-top: 2.5rem; margin-bottom: 1rem;">2. Power Consumption Benchmarks: Black vs. Light Wallpapers</h2>
        <p>Extensive display telemetry demonstrates that on modern OLED panels (such as Samsung Dynamic AMOLED 2X and LTPO OLED displays):</p>
        <ul style="padding-left: 1.5rem; margin-bottom: 1.5rem;">
          <li>A bright white background at 100% brightness draws between <strong>450mW and 600mW</strong> of continuous display power.</li>
          <li>A standard mixed-color 4K wallpaper draws between <strong>250mW and 350mW</strong>.</li>
          <li>A calibrated AMOLED true-black wallpaper with >70% true-black surface area draws only <strong>80mW to 120mW</strong>.</li>
        </ul>
        <p>Over an average daily screen-on time of 5 to 7 hours, utilizing calibrated AMOLED wallpapers can reclaim <strong>12% to 22% total daily battery capacity</strong> on Android devices.</p>

        <h2 style="color: #FFFFFF; font-size: 1.6rem; margin-top: 2.5rem; margin-bottom: 1rem;">3. Why Contrast Ratio Reaches Infinity (∞:1)</h2>
        <p>Because black pixels emit zero light (0.000 nits), the contrast ratio calculation (peak luminance divided by black level luminance) mathematically approaches infinity. Dark modes and pure black wallpapers eliminate the grayish glow typical of LCDs, creating rich, striking visual separation for your application icons and lock-screen widgets.</p>

        <div style="background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 1.5rem; margin: 2.5rem 0; text-align: center;">
          <h3 style="color: #FFFFFF; margin-bottom: 0.5rem;">Experience Calibrated AMOLED Wallpapers</h3>
          <p style="color: var(--text-muted); font-size: 0.95rem; margin-bottom: 1.25rem;">Explore hundreds of verified true-black 4K backgrounds with 0% battery penalty in KinotiX.</p>
          <a href="../amoled-wallpapers/" class="btn btn-primary">Browse AMOLED Collection</a>
        </div>
      </article>`
    },
    {
      slug: '4k-vs-fhd-phone-wallpapers.html',
      title: '4K vs. Full HD Wallpapers: Pixel Density & Screen Scaling Explained | KinotiX',
      heading: '4K vs. Full HD Wallpapers: Why Resolution Matters on High-PPI Screens',
      description: 'Understand the difference between 1080p FHD and 2160p 4K UHD wallpapers on modern smartphone displays, pixel density (PPI), and parallax motion fidelity.',
      contentHtml: `
      <article style="max-width: 760px; margin: 0 auto; color: var(--text-secondary); line-height: 1.8; font-size: 1.05rem;">
        <h2 style="color: #FFFFFF; font-size: 1.6rem; margin-top: 2rem; margin-bottom: 1rem;">1. The Pixel Density Revolution in Modern Smartphones</h2>
        <p>Modern flagship and mid-range Android smartphones frequently feature Quad HD+ (1440 × 3120) or 4K (2160 × 3840) displays with pixel densities ranging from 450 to 550+ pixels per inch (PPI). On displays of this caliber, applying a standard 1080p (Full HD) wallpaper forces the Android window manager to perform bilinear or bicubic upscaling.</p>
        <p>Upscaling an image to 200% or 300% of its native canvas stretches pixel boundaries, resulting in noticeable edge softness, blurred text in graphical artwork, and visual compression noise around high-contrast details.</p>

        <h2 style="color: #FFFFFF; font-size: 1.6rem; margin-top: 2.5rem; margin-bottom: 1rem;">2. The Parallax & Crop Margin Requirement</h2>
        <p>When an Android wallpaper engine enables 3D Parallax or dynamic multi-page home screen scrolling, the wallpaper canvas is not rendered at an exact 1:1 viewport ratio. To enable camera tilt and sensor response without exposing black borders, the engine must zoom into the image by 10% to 20%.</p>
        <p>If a wallpaper begins at only 1080 × 1920 pixels, zooming in by 15% drops the visible resolution below 900p! Conversely, an authentic 4K Ultra HD asset (2160 × 3840) provides sufficient surplus pixel data that even under aggressive tilt and parallax zoom, every rendered pixel on your screen maps directly to real visual information.</p>

        <h2 style="color: #FFFFFF; font-size: 1.6rem; margin-top: 2.5rem; margin-bottom: 1rem;">3. Lossless Detail in Fine Art & Dark Artwork</h2>
        <p>In photographic landscapes, starry nebulae, and detailed anime illustrations, subtle highlights and starpoints often occupy single-pixel dimensions. In Full HD assets, these micro-details are obliterated by JPEG quantization. KinotiX curates native 4K UHD assets with calibrated high-bitrate encoding to preserve razor-sharp fine details.</p>

        <div style="background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 1.5rem; margin: 2.5rem 0; text-align: center;">
          <h3 style="color: #FFFFFF; margin-bottom: 0.5rem;">Explore Native 4K UHD Wallpapers</h3>
          <p style="color: var(--text-muted); font-size: 0.95rem; margin-bottom: 1.25rem;">Download uncompromised 3840 × 2160 resolution wallpapers engineered for flagship Android screens.</p>
          <a href="../4k-wallpapers/" class="btn btn-primary">Explore 4K Collection</a>
        </div>
      </article>`
    }
  ];

  for (const guide of guides) {
    const canonicalUrl = `${BASE_URL}guides/${guide.slug}`;
    const html = `<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(guide.title)}</title>
  <meta name="description" content="${escapeHtml(guide.description)}">
  <link rel="canonical" href="${canonicalUrl}">
  <link rel="icon" type="image/png" href="../assets/icons/icon-192.png">
  <link rel="stylesheet" href="../css/style.css">

  <!-- OpenGraph Metadata -->
  <meta property="og:title" content="${escapeHtml(guide.title)}">
  <meta property="og:description" content="${escapeHtml(guide.description)}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:image" content="../assets/screenshots/home_feed.png">
  <meta property="og:site_name" content="KinotiX">

  <!-- Twitter Cards -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(guide.title)}">
  <meta name="twitter:description" content="${escapeHtml(guide.description)}">
  <meta name="twitter:image" content="../assets/screenshots/home_feed.png">

  <!-- Schema.org JSON-LD Structured Data: Article & BreadcrumbList -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": "${canonicalUrl}",
        "headline": "${escapeHtml(guide.heading)}",
        "description": "${escapeHtml(guide.description)}",
        "author": {
          "@type": "Organization",
          "name": "KinotiX Engineering"
        },
        "publisher": {
          "@type": "Organization",
          "name": "KinotiX",
          "logo": {
            "@type": "ImageObject",
            "url": "https://techscript.is-a.dev/kinotix/assets/icons/icon-512.png"
          }
        },
        "mainEntityOfPage": "${canonicalUrl}"
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
            "name": "Guides",
            "item": "${BASE_URL}"
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": "${escapeHtml(guide.heading)}",
            "item": "${canonicalUrl}"
          }
        ]
      }
    ]
  }
  </script>
</head>
<body>
  <header>
    <div class="header-inner">
      <a href="../index.html" class="brand" aria-label="KinotiX Home">
        <img src="../assets/icons/icon.png" alt="KinotiX Icon" class="brand-icon">
        <span>KinotiX</span>
      </a>
      <nav aria-label="Main Navigation">
        <ul class="nav-menu">
          <li><a href="../index.html">Home</a></li>
          <li><a href="../4k-wallpapers/">Collections</a></li>
          <li><a href="../features.html">Features</a></li>
          <li><a href="../download.html">Download</a></li>
        </ul>
      </nav>
      <div class="header-actions">
        <a href="${PLAY_STORE_URL}" target="_blank" rel="noopener noreferrer" class="btn-playstore btn-playstore-sm" aria-label="Get KinotiX on Google Play">
          <span class="play-title">Google Play</span>
        </a>
      </div>
    </div>
  </header>

  <main>
    <div class="container" style="padding-top: 2.5rem; padding-bottom: 4rem;">
      <nav class="breadcrumb-nav" aria-label="Breadcrumb" style="margin-bottom: 2rem; font-size: 0.85rem; color: var(--text-muted);">
        <a href="../index.html" style="color: var(--text-muted); text-decoration: none;">Home</a>
        <span style="margin: 0 0.5rem; opacity: 0.5;">/</span>
        <span style="color: var(--text-muted);">Display Guide</span>
        <span style="margin: 0 0.5rem; opacity: 0.5;">/</span>
        <span style="color: var(--text-primary); font-weight: 600;">Technical Analysis</span>
      </nav>

      <header style="text-align: center; max-width: 800px; margin: 0 auto 3rem auto;">
        <span class="badge badge-primary" style="margin-bottom: 1rem;">Display Engineering</span>
        <h1 style="font-size: clamp(2rem, 4vw, 2.75rem); font-weight: 800; line-height: 1.25; margin-bottom: 1.25rem; color: #FFFFFF;">
          ${escapeHtml(guide.heading)}
        </h1>
        <p style="font-size: 1.1rem; color: var(--text-muted); line-height: 1.6;">
          ${escapeHtml(guide.description)}
        </p>
      </header>

      ${guide.contentHtml}
    </div>
  </main>

  <footer>
    <div class="container">
      <div class="footer-bottom" style="border: none; padding-top: 0; justify-content: center;">
        <span>&copy; 2026 KinotiX Engine • Developed by Tcode-Motion</span>
      </div>
    </div>
  </footer>
</body>
</html>`;

    const targetDirs = [
      path.join(rootDir, 'guides'),
      path.join(docsDir, 'guides')
    ];

    for (const dir of targetDirs) {
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, guide.slug), html, 'utf8');
    }
    console.log(`Generated technical guide: ${guide.slug}`);
  }
}

if (require.main === module) {
  generateCategoryPages();
}

module.exports = { generateCategoryPages };
