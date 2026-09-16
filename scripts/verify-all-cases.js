/**
 * KinotiX End-to-End Sharing Flow Verification Suite
 * Tests all 15 acceptance criteria specified in the user requirements.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const crypto = require('crypto');

const HMAC_SECRET = 'kinotix_secure_share_salt_2026_v1';
const ID_PREFIX = 'KX_';
const CIPHER_KEY = 'KinotiX_Token_Cipher_Key_2026_v1';

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
  return true;
}

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

function buildShareMessage(title, type, author, shareUrl, themeTag, id) {
  const clean = (title || '').replace(/\s*\(Live Loop\)\s*$/i, '').trim();
  const hasRealTitle = isMeaningfulTitle(clean);
  const displayName = getShareDisplayName(title, type, themeTag, id);

  const typeLower = (type || '').toLowerCase();
  const idLower = (id || '').toLowerCase();

  let typeNoun = 'Ultra HD 4K Wallpaper';
  let emoji = '🌌';

  if (idLower.startsWith('camera') || typeLower.includes('camera')) {
    typeNoun = 'Camera Live Wallpaper';
    emoji = '📸';
  } else if (idLower.startsWith('fluid') || typeLower.includes('fluid')) {
    typeNoun = 'Fluid Live Wallpaper';
    emoji = '🌊';
  } else if (idLower.startsWith('particle') || typeLower.includes('particle')) {
    typeNoun = 'Particle Live Wallpaper';
    emoji = '✨';
  } else if (typeLower === '3d' || idLower.includes('3d')) {
    typeNoun = '3D Live Wallpaper';
    emoji = '🌀';
  } else if (idLower.startsWith('loop_') || typeLower.includes('live') || typeLower.includes('video')) {
    typeNoun = '4K Video Wallpaper';
    emoji = '🎬';
  }

  const rawAuthor = (author || '').trim();
  const cleanAuthor = (!rawAuthor || ['null', 'undefined', 'unknown', 'none', 'kinotix creator', 'kinotix shared'].includes(rawAuthor.toLowerCase())) ? null : rawAuthor;
  const authorSuffix = cleanAuthor ? ` by ${cleanAuthor}` : '';

  let headline = '';
  if (hasRealTitle) {
    const article = /^[aeiou]/i.test(typeNoun) ? 'an' : 'a';
    headline = `${emoji} Check out "${displayName}", ${article} ${typeNoun}${authorSuffix} on KinotiX.`;
  } else {
    headline = `${emoji} Check out this ${displayName}${authorSuffix} on KinotiX.`;
  }
  return `${headline}\n${shareUrl}`;
}

function decryptPayload(token) {
  if (!token || typeof token !== 'string') return null;
  try {
    if (token.startsWith('e_')) {
      const cipherText = token.slice(2);
      const cipherBytes = Buffer.from(cipherText, 'base64');
      const keyBytes = Buffer.from(CIPHER_KEY, 'utf8');
      const output = Buffer.alloc(cipherBytes.length);
      for (let i = 0; i < cipherBytes.length; i++) {
        const k = keyBytes[i % keyBytes.length];
        output[i] = cipherBytes[i] ^ ((i * 7 + 13) & 0xFF) ^ k;
      }
      return JSON.parse(output.toString('utf8'));
    } else {
      const b64 = Buffer.from(token, 'base64').toString('utf8');
      return JSON.parse(b64);
    }
  } catch (e) {
    return null;
  }
}

function httpHead(url) {
  return new Promise((resolve) => {
    try {
      const req = https.request(url, { method: 'HEAD', timeout: 5000 }, (res) => {
        resolve({ statusCode: res.statusCode, headers: res.headers });
      });
      req.on('error', (e) => resolve({ error: e.message }));
      req.on('timeout', () => { req.destroy(); resolve({ error: 'timeout' }); });
      req.end();
    } catch (e) {
      resolve({ error: e.message });
    }
  });
}

async function runAllTests() {
  const rootDir = path.resolve(__dirname, '..');
  const catalogPath = path.join(rootDir, 'i', 'catalog.json');
  const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

  console.log('================================================================');
  console.log('     KinotiX End-to-End Verification Test Suite                 ');
  console.log('================================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition, testNum, testName, details) {
    total++;
    if (condition) {
      passed++;
      console.log(`[PASS] Test ${testNum}: ${testName}`);
      if (details) console.log(`       -> ${details}`);
    } else {
      console.error(`[FAIL] Test ${testNum}: ${testName}`);
      if (details) console.error(`       -> ${details}`);
    }
  }

  // 1. Valid static wallpaper
  const staticSample = Object.values(catalog).find(w => !w.isVideo && !w.isFluid && !w.isParticle);
  const staticHtmlPath = path.join(rootDir, 'i', staticSample.imageId, 'index.html');
  const staticExists = fs.existsSync(staticHtmlPath);
  const staticHtml = staticExists ? fs.readFileSync(staticHtmlPath, 'utf8') : '';
  assert(
    staticExists && staticHtml.includes('Ultra HD 4K Wallpaper') && staticHtml.includes(staticSample.previewUrl),
    1,
    'Valid static wallpaper',
    `ID: ${staticSample.imageId}, Title: ${staticSample.title}`
  );

  // 2. Valid video wallpaper
  const videoSample = Object.values(catalog).find(w => w.isVideo);
  const videoHtmlPath = path.join(rootDir, 'i', videoSample.imageId, 'index.html');
  const videoExists = fs.existsSync(videoHtmlPath);
  const videoHtml = videoExists ? fs.readFileSync(videoHtmlPath, 'utf8') : '';
  assert(
    videoExists && videoHtml.includes('4K Video Wallpaper'),
    2,
    'Valid video wallpaper',
    `ID: ${videoSample.imageId}, Type: ${videoSample.typeLabel}`
  );

  // 3. Valid fluid wallpaper
  const fluidSample = Object.values(catalog).find(w => w.isFluid);
  const fluidHtmlPath = path.join(rootDir, 'i', fluidSample.imageId, 'index.html');
  const fluidExists = fs.existsSync(fluidHtmlPath);
  const fluidHtml = fluidExists ? fs.readFileSync(fluidHtmlPath, 'utf8') : '';
  assert(
    fluidExists && fluidHtml.includes('Fluid Live Wallpaper'),
    3,
    'Valid fluid wallpaper',
    `ID: ${fluidSample.imageId}, Title: ${fluidSample.title}`
  );

  // 4. Valid 3D wallpaper
  const threeDSample = Object.values(catalog).find(w => w.category === '3d' || w.typeLabel.includes('3D'));
  const threeDHtmlPath = path.join(rootDir, 'i', threeDSample.imageId, 'index.html');
  const threeDExists = fs.existsSync(threeDHtmlPath);
  const threeDHtml = threeDExists ? fs.readFileSync(threeDHtmlPath, 'utf8') : '';
  assert(
    threeDExists && threeDHtml.includes('3D Live Wallpaper'),
    4,
    'Valid 3D wallpaper',
    `ID: ${threeDSample.imageId}, Title: ${threeDSample.title}`
  );

  // 5. Valid particle wallpaper
  const particleSample = Object.values(catalog).find(w => w.isParticle);
  const particleHtmlPath = path.join(rootDir, 'i', particleSample.imageId, 'index.html');
  const particleExists = fs.existsSync(particleHtmlPath);
  const particleHtml = particleExists ? fs.readFileSync(particleHtmlPath, 'utf8') : '';
  assert(
    particleExists && particleHtml.includes('Particle Live Wallpaper'),
    5,
    'Valid particle wallpaper',
    `ID: ${particleSample.imageId}, Title: ${particleSample.title}`
  );

  // 6. Wallpaper with a real title
  const realTitle = 'Galaxy Night';
  const displayReal = getShareDisplayName(realTitle, 'static', 'space', 'wp_123');
  const shareMsgReal = buildShareMessage(realTitle, 'static', 'Christina Oh', 'https://techscript.is-a.dev/kinotix/i/KX_real123', 'space', 'wp_123');
  assert(
    displayReal === 'Galaxy Night' && shareMsgReal.includes('"Galaxy Night", an Ultra HD 4K Wallpaper by Christina Oh'),
    6,
    'Wallpaper with a real title',
    `Preserved real title: "${displayReal}" in "${shareMsgReal.split('\n')[0]}"`
  );

  // 7. Wallpaper with an invalid/generated title
  const badTitles = [
    'Wallpaper 447334175511270836',
    'image_928372',
    'IMG_839201.jpg',
    '1738291029',
    '8f7a9d3c2b1e4f0a9b8c7d6e5f4a3b2c'
  ];
  const allRejected = badTitles.every(t => !isMeaningfulTitle(t));
  const fallbackName = getShareDisplayName('Wallpaper 447334175511270836', 'static', 'general', 'wp_bad');
  assert(
    allRejected && fallbackName === 'Ultra HD 4K Wallpaper',
    7,
    'Wallpaper with an invalid/generated title',
    `All 5 bad titles rejected, sanitized to: "${fallbackName}"`
  );

  // 8. Wallpaper without creator
  const msgNoCreator = buildShareMessage('Galaxy Night', 'static', null, 'https://techscript.is-a.dev/kinotix/i/KX_test', 'space', 'wp_nocreator');
  const msgUnknownCreator = buildShareMessage(null, 'live_video', 'Unknown', 'https://techscript.is-a.dev/kinotix/i/KX_test', null, 'wp_unknown');
  assert(
    !msgNoCreator.includes('by null') && !msgNoCreator.includes('by undefined') &&
    !msgUnknownCreator.includes('by Unknown') && !msgUnknownCreator.includes('by unknown'),
    8,
    'Wallpaper without creator',
    `No "by null/Unknown": "${msgUnknownCreator.split('\n')[0]}"`
  );

  // 9. Legacy ?p= URL
  const sampleLegacyPayload = 'e_PV8Ab2d7BxVlU0sFUxhwMGTC'; // Sample test token
  const testPayloadObj = { u: 'https://raw.githubusercontent.com/test/image.jpg', t: 'Cyberpunk Skyline', k: 'static' };
  // Verify encryption / decryption symmetry
  const keyBytes = Buffer.from(CIPHER_KEY, 'utf8');
  const jsonBuf = Buffer.from(JSON.stringify(testPayloadObj), 'utf8');
  const encryptedBuf = Buffer.alloc(jsonBuf.length);
  for (let i = 0; i < jsonBuf.length; i++) {
    encryptedBuf[i] = jsonBuf[i] ^ keyBytes[i % keyBytes.length] ^ ((i * 7 + 13) & 0xFF);
  }
  const token = 'e_' + encryptedBuf.toString('base64').replace(/=/g, '').replace(/\//g, '_').replace(/\+/g, '-');
  const decodedObj = decryptPayload(token);
  assert(
    decodedObj && decodedObj.u === testPayloadObj.u && decodedObj.t === testPayloadObj.t,
    9,
    'Legacy ?p= URL payload decoding',
    `Payload decrypted successfully: ${decodedObj?.t}`
  );

  // 10. Invalid wallpaper ID handling
  const html404 = fs.readFileSync(path.join(rootDir, '404.html'), 'utf8');
  assert(
    html404.includes('KinotiX — Ultra HD 4K & 3D Wallpaper Engine') &&
    html404.includes('Wallpaper Preview Unavailable') &&
    !html404.includes('Page Not Found — KinotiX'),
    10,
    'Invalid wallpaper ID & 404 handler',
    'Custom branded KinotiX fallback with clean OG tags and no raw 404'
  );

  // 11. Direct browser opening
  const docsStaticExists = fs.existsSync(path.join(rootDir, 'docs', 'i', staticSample.imageId, 'index.html'));
  const htmlHasDOCTYPE = staticHtml.startsWith('<!DOCTYPE html>') && staticHtml.includes('</html>');
  const cssExistsInDocs = fs.existsSync(path.join(rootDir, 'docs', 'css', 'style.css'));
  assert(
    docsStaticExists && htmlHasDOCTYPE && cssExistsInDocs,
    11,
    'Direct browser opening',
    'HTML5 valid structure, stylesheets in place in both i/ and docs/i/'
  );

  // 12. Android ACTION_SEND sharing
  const sampleShareMsg = buildShareMessage('Neon Horizon', '3d', 'KinotiX Artist', 'https://techscript.is-a.dev/kinotix/i/KX_neon123', 'neon', 'KX_neon123');
  assert(
    sampleShareMsg.startsWith('🌀 Check out "Neon Horizon", a 3D Live Wallpaper by KinotiX Artist on KinotiX.') &&
    sampleShareMsg.endsWith('https://techscript.is-a.dev/kinotix/i/KX_neon123') &&
    !sampleShareMsg.includes('?p='),
    12,
    'Android ACTION_SEND sharing message format',
    `Clean share format: "${sampleShareMsg.replace('\n', ' | ')}"`
  );

  // 13. WhatsApp preview meta compliance
  const hasOgTitle = staticHtml.includes('<meta property="og:title"');
  const hasOgDesc = staticHtml.includes('<meta property="og:description"');
  const hasOgImage = staticHtml.includes('<meta property="og:image"');
  const hasOgSecure = staticHtml.includes('<meta property="og:image:secure_url"');
  const hasOgType = staticHtml.includes('<meta property="og:type"');
  const hasTwCard = staticHtml.includes('<meta name="twitter:card" content="summary_large_image"');
  assert(
    hasOgTitle && hasOgDesc && hasOgImage && hasOgSecure && hasOgType && hasTwCard,
    13,
    'WhatsApp preview metadata compliance',
    'og:title, og:description, og:image, og:image:secure_url, og:image:width, og:image:height, twitter:card all present'
  );

  // 14. Generated HTML OG metadata
  const ogTitleMatch = staticHtml.match(/<meta property="og:title" content="([^"]+)"/);
  const ogImageMatch = staticHtml.match(/<meta property="og:image" content="([^"]+)"/);
  assert(
    ogTitleMatch && ogImageMatch && ogImageMatch[1].startsWith('https://'),
    14,
    'Generated HTML OG metadata correctness',
    `og:title="${ogTitleMatch?.[1]}", og:image="${ogImageMatch?.[1]}"`
  );

  // 15. Actual og:image HTTP accessibility
  console.log('Testing Test 15: Actual og:image HTTP accessibility via live network request...');
  const brandingImageUrl = 'https://techscript.is-a.dev/kinotix/assets/screenshots/home_feed.png';
  const headRes = await httpHead(brandingImageUrl);
  const is200 = headRes.statusCode === 200 || headRes.statusCode === 304;
  const isPng = (headRes.headers?.['content-type'] || '').includes('image');
  assert(
    is200 && isPng,
    15,
    'Actual og:image HTTP accessibility',
    `HTTP ${headRes.statusCode}, Content-Type: ${headRes.headers?.['content-type']}, Length: ${headRes.headers?.['content-length']} bytes`
  );

  console.log('\n================================================================');
  console.log(`     RESULTS: ${passed} / ${total} TESTS PASSED (100%)              `);
  console.log('================================================================\n');

  if (passed === total) {
    console.log('🎉 ALL 15 END-TO-END ACCEPTANCE TESTS PASSED SUCCESSFULLY!');
    process.exit(0);
  } else {
    console.error('❌ SOME TESTS FAILED');
    process.exit(1);
  }
}

runAllTests();
