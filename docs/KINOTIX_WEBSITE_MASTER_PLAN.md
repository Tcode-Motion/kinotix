# KinotiX Website — Master Implementation Plan

## 1. Project Overview & Directives
This Master Plan details the full production overhaul of the official KinotiX website (`KinotiX-GitHub` and `docs/` mirror).
The objective is to establish a modern, sophisticated, dark-first web presence for **KinotiX**, completely removing all remnants of "Pro", "WallVerse", keyword-stuffing, and childish/funky emoji decorations.

---

## 2. Core Technical Architecture
- **Tech Stack**: Semantic HTML5, Vanilla CSS3 (Custom Properties / Design Tokens), Vanilla ES6+ JavaScript.
- **Color Palette**:
  - Background Dark: `#090A0F`
  - Surface / Cards: `#121520`
  - Surface Hover: `#1A1E2E`
  - Primary Brand: `#6366F1` (Indigo)
  - Secondary Brand: `#06B6D4` (Cyan)
  - Accent: `#8B5CF6` (Violet)
  - Borders: `rgba(255, 255, 255, 0.08)`
  - Text Primary: `#FFFFFF`
  - Text Secondary: `#9CA3AF`
  - Text Muted: `#6B7280`
- **Typography**: Inter (Body & UI) + Outfit (Headings & Display), strictly excluding script/cursive fonts.
- **Routing & Deployment**: GitHub Pages from `./docs`, automated static share generator via `scripts/generate-share-pages.js`.

---

## 3. Phase-by-Phase Roadmap

### Phase A: Audit & Baseline Documentation
- [x] Complete comprehensive audit of all templates, styles, and assets.
- [x] Create `docs/KINOTIX_WEBSITE_AUDIT.md`.
- [x] Create `docs/KINOTIX_WEBSITE_MASTER_PLAN.md`.
- [x] Create `docs/KINOTIX_WEBSITE_PROGRESS.md`.

### Phase B: Design System Implementation
- Rewrite `css/style.css` and `docs/css/style.css` with the strict production design tokens:
  - AMOLED dark theme variables (`#090A0F`, `#121520`, `#6366F1`, `#06B6D4`, `#8B5CF6`).
  - Standardized elevation, radius (`12px`, `16px`, `24px`), and transitions (`cubic-bezier(0.16, 1, 0.3, 1)`).
  - Clear typography scale and disciplined spacing utility classes.
  - Zero neon glows or psychedelic gradients.

### Phase C: Global UI Cleanup
- Standardize Header across all pages:
  - Clean KinotiX wordmark + official app icon (no "PRO" badge, no emojis).
  - Clean desktop navigation links with active state indicator.
  - Compact Google Play CTA.
  - Mobile hamburger toggle and accessible drawer.
- Standardize Footer:
  - Semantic column hierarchy (Ecosystem, Resources, Legal, Developer).
  - Copyright statement: `&copy; 2026 KinotiX • Tcode-Motion`.
  - Zero emojis or informal text.

### Phase D: Responsive Breakpoint Engineering
- Refactor CSS media queries for full device spectrum:
  - Mobile Small: 320px–375px
  - Mobile Standard: 390px–430px
  - Tablet: 768px–1024px
  - Laptop: 1280px–1440px
  - Desktop Ultra-Wide: 1920px+
- Eliminate any horizontal scrolling, awkward text wrapping, or overlapping cards.

### Phase E: Google Play Store Synchronization
- Align website metadata and copy with the official Google Play listing:
  - App Name: **KinotiX: 4K Live & 3D Wallpaper**
  - Package Name: `com.kinotix.app`
  - URL: `https://play.google.com/store/apps/details?id=com.kinotix.app`
  - Accurate capability matrix: Ultra HD 4K, 3D Gyro Parallax, OpenGL ES Fluid dynamics, Transparent Camera.

### Phase F: Visual Asset & Screenshot Alignment
- Curate and normalize screenshots from `assets/screenshots/`:
  - `play_screenshot_1.png` through `play_screenshot_9.png`.
  - Ensure uniform aspect ratio (9:19.5 smartphone form factor).
  - Add official app logo raster asset `ic_kinotix_logo.png`.

### Phase G: Homepage Redesign
- Redesign `index.html`:
  - Clean, restrained Hero section with app value proposition and Play Store CTA.
  - Live Wallpaper & 4K Discovery Grid with interactive filtering (All, 3D Parallax, Fluid Live, AMOLED, Nature, Cyberpunk).
  - Interactive click-to-view lightbox modal.
  - Product capability breakdown: 3D Gyro, Fluid Physics, Lossless 4K, Battery Optimization.
  - Authentic on-device screenshot carousel / gallery.
  - Zero emojis, zero fake statistics, zero keyword spam.

### Phase H: Download Page Redesign
- Overhaul `download.html`:
  - Clear Android system requirements (Android 7.0+, RAM, Sensor recommendations).
  - Official Google Play download button.
  - Release specifications (v1.2.0, build number, package verification).
  - Installation and troubleshooting FAQ link.

### Phase I: Interactive Wallpaper Image Viewer
- Build a lightweight, vanilla JS responsive modal viewer (`assets/js/viewer.js`):
  - Mobile: Full-bleed responsive container with floating close button and safe-area margins.
  - Desktop: Centered high-res display with `object-fit: contain`, side/bottom metadata panel, wallpaper type badge, and direct "Open in App / Download" actions.
  - Keyboard navigation (`Escape` to close, `ArrowLeft` / `ArrowRight` to navigate).

### Phase J: Share Page Overhaul (`/kinotix/i/{imageId}`)
- Update `scripts/generate-share-pages.js`:
  - Output clean, professional HTML templates for each wallpaper.
  - Real wallpaper preview image with correct OG/Twitter dimensions (`1200x630`).
  - Dynamic semantic titles (e.g. "Neon Horizon 4K Wallpaper • KinotiX").
  - Deep-link button: `kinotix://i/{imageId}` and fallback Play Store link.
  - Zero emojis, zero neon cards.

### Phase K: Share 404 Graceful Error Handling
- Update resolver in `i/index.html` and root `404.html`:
  - When an unknown wallpaper ID is requested, render a polished, branded "Wallpaper Unavailable" view with options to explore trending wallpapers or download the app.
  - Never show a raw generic GitHub Pages 404.

### Phase L: SEO, Open Graph & Structured Data
- Clean `<meta name="keywords">` across all pages (remove spam).
- Standardize Open Graph (`og:title`, `og:description`, `og:image`, `og:url`).
- Twitter Cards (`summary_large_image`).
- Valid JSON-LD Schema (`MobileApplication` and `WebSite`).
- Canonical URLs (`https://techscript.is-a.dev/kinotix/` or `https://tcode-motion.github.io/kinotix/`).

### Phase M: Image Performance Optimization
- Native `loading="lazy"` for all below-the-fold media.
- Explicit `width` and `height` attributes to prevent cumulative layout shift (CLS).
- High-efficiency preview thumbnails for discovery grids.

### Phase N: Grid System Architecture
- Fluid grid calculation:
  - Mobile (<640px): 2 columns
  - Tablet (641px–1024px): 3 columns
  - Laptop (1025px–1440px): 4 columns
  - Desktop (>1440px): 5 columns
- Gap consistency: `1rem` to `1.5rem`.

### Phase O: Accessibility & WCAG Standards
- Contrast ratios >= 4.5:1 for body copy and >= 3:1 for large display titles.
- Focus outlines for all interactive elements (`:focus-visible`).
- Descriptive `aria-label` attributes on icon buttons.
- Full keyboard operability.

### Phase P: Animation Polish & Reduced Motion
- Subtle, micro-transitions (`0.2s` to `0.35s` ease).
- `@media (prefers-reduced-motion: reduce)` disabling all non-essential transforms and animations.

### Phase Q: Content Quality & Deprecated Branding Purge
- Full codebase regex search and replacement of:
  - `KinotiX PRO` → `KinotiX`
  - `WallVerse` → `KinotiX`
  - Deprecated GitHub URLs (`Tanmoy/wallverse`) → (`Tcode-Motion/kinotix`).
  - All emoji decorations in headings, copy, and buttons.

### Phase R: Cross-Device & Browser Verification
- Automated and local browser verification across mobile, tablet, and desktop breakpoints.

### Phase S: Final QA & Build Verification
- Execute `node scripts/generate-share-pages.js`.
- Sync changes between root and `docs/`.
- Validate zero console errors, zero dead links, and 100% build integrity.
