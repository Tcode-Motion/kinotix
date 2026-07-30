// Main Script Initialization
document.addEventListener('DOMContentLoaded', () => {
  if (typeof initTheme === 'function') initTheme();
  if (typeof initNavigation === 'function') initNavigation();
  if (typeof initFAQ === 'function') initFAQ();
});
