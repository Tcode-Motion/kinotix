# KinotiX Website — Google Search Console & SEO Monitoring Framework

## 1. Monitoring Purpose
This framework outlines key metrics, reporting cadences, and diagnostic procedures for monitoring the organic search performance of the **KinotiX website** (`https://techscript.is-a.dev/kinotix/`).

> [!NOTE]
> All metrics below must be tracked using genuine Google Search Console (GSC) and server telemetry data once indexed. Do NOT fabricate numbers, impressions, or keyword ranking estimates.

---

## 2. Core Search Console Metrics to Track

### 2.1 Indexation & Coverage
- **Total Valid Pages**: Track the growth of indexed URLs under `/sitemap-pages.xml`, `/sitemap-categories.xml`, and `/sitemap-wallpapers.xml`.
- **Excluded Pages**: Ensure intentional noindex directives (e.g. `/404.html`, dynamic query parameters) match expected values and that no genuine wallpaper or category pages are marked "Excluded by 'noindex' tag".
- **Crawled - Currently Not Indexed**: Monitor this status to identify any potential low-value or slow-loading wallpaper pages that require optimization.

### 2.2 Google Images Search Performance
- **Filter**: Performance → Search Type: **Image**.
- **Impressions & Clicks**: Track organic visibility across visual searches (e.g. "anime 4k wallpaper for android", "amoled black wallpaper").
- **Top Landing Pages**: Identify which individual wallpaper share pages (`/i/{imageId}/`) attract the highest visual traffic.

### 2.3 Search Queries & Intent Tracking
- **Branded Queries**: `kinotix`, `kinotix app`, `kinotix 4k wallpapers`, `kinotix live wallpaper`.
- **Category Queries**: `anime 4k wallpapers`, `amoled wallpapers android`, `3d live wallpapers`, `nature 4k wallpapers`.
- **Device & Resolution Queries**: `4k phone wallpapers`, `mobile wallpaper 4k`, `android live wallpaper 4k`.

---

## 3. Core Web Vitals & Page Experience Thresholds

| Metric | Target (Good) | Needs Improvement | Poor |
|---|---|---|---|
| **Largest Contentful Paint (LCP)** | < 1.2s | 1.2s - 2.5s | > 2.5s |
| **Interaction to Next Paint (INP)** | < 100ms | 100ms - 200ms | > 200ms |
| **Cumulative Layout Shift (CLS)** | 0.00 (Zero Shift) | 0.01 - 0.10 | > 0.10 |
| **First Contentful Paint (FCP)** | < 0.8s | 0.8s - 1.8s | > 1.8s |
| **Time to First Byte (TTFB)** | < 300ms | 300ms - 800ms | > 800ms |

---

## 4. Periodic Maintenance Procedures

### Weekly Check:
1. Check GSC Coverage report for any sudden spike in 404 errors or crawl anomalies.
2. Review multi-tier sitemap status to verify all 5 XML sitemaps remain "Success".

### Monthly Check:
1. Run `node scripts/seo-validator.js` to assert zero missing meta tags, canonicals, or structured data syntax errors.
2. Review Google Play referral traffic from the website's download CTAs.
3. Check for any broken image links or CDN latency shifts.
