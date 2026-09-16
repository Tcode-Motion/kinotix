const fs = require('fs');
const path = require('path');

const targetDirs = [
  path.resolve(__dirname, '..'),
  path.resolve(__dirname, '../docs')
];

function cleanHtmlFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const dirName = path.basename(path.dirname(filePath));
  const isSubdir = ['privacy', 'terms', 'faq', 'support', 'roadmap', 'changelog', 'features', 'download'].includes(dirName);

  const iconPrefix = isSubdir ? '../assets/icons/' : 'assets/icons/';
  const homeLink = isSubdir ? '../index.html' : 'index.html';

  // 1. Clean brand header
  content = content.replace(/<a[^>]*class=["']brand["'][^>]*>[\s\S]*?<\/a>/gi, () => {
    return `<a href="${homeLink}" class="brand" aria-label="KinotiX Home"><img src="${iconPrefix}icon.png" alt="KinotiX Icon" class="brand-icon"><span>KinotiX</span></a>`;
  });

  // 2. Remove keyword stuffing walls
  content = content.replace(/<meta name=["']keywords["'] content=["']4K Wallpapers,[\s\S]*?">/gi, '<meta name="keywords" content="KinotiX, 4K Wallpapers, 3D Parallax, Live Wallpapers, Android Wallpaper Engine">');

  // 3. Purge 'PRO 🌌' and emoji decorations
  content = content.replace(/<span class=["']badge["']>PRO 🌌<\/span>/gi, '');
  content = content.replace(/<span class=["']badge["']>v1\.2\.0 🌌<\/span>/gi, '');
  content = content.replace(/PRO 🌌/g, '');
  content = content.replace(/v1\.2\.0 🌌/g, 'v1.2.0');
  content = content.replace(/KinotiX 🌌/g, 'KinotiX');
  
  const emojis = ['🛡️', '⚡', '🚀', '📦', '🔥', '✨', '🌀', '🌊', '📱', '❤️', '💎', '📷', '🔍', '⭐', '🌌'];
  for (const em of emojis) {
    content = content.split(em + ' ').join('');
    content = content.split(' ' + em).join('');
    content = content.split(em).join('');
  }

  // 4. Update legacy repo urls
  content = content.replace(/github\.com\/Tanmoy\/wallverse/gi, 'github.com/Tcode-Motion/kinotix');
  content = content.replace(/tanmoy\.github\.io\/wallverse/gi, 'tcode-motion.github.io/kinotix');
  content = content.replace(/\/wallverse\//g, '/kinotix/');

  fs.writeFileSync(filePath, content, 'utf8');
}

for (const dir of targetDirs) {
  if (!fs.existsSync(dir)) continue;
  const files = fs.readdirSync(dir);
  for (const f of files) {
    if (f.endsWith('.html') && f !== 'index.html' && f !== 'download.html' && f !== 'features.html') {
      cleanHtmlFile(path.join(dir, f));
    }
  }
}

// Subdirs
const subdirs = ['privacy', 'terms', 'faq', 'support', 'roadmap', 'changelog'];
for (const base of targetDirs) {
  for (const sub of subdirs) {
    const p = path.join(base, sub, 'index.html');
    if (fs.existsSync(p)) cleanHtmlFile(p);
  }
}

console.log('Sanitization complete.');
