// Main Web Portal Script
document.addEventListener('DOMContentLoaded', () => {
  if (typeof initTheme === 'function') initTheme();
  if (typeof initFAQ === 'function') initFAQ();
});
