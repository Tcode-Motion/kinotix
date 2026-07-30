// Theme Engine
function initTheme() {
  const btn = document.getElementById('theme-btn');
  const stored = localStorage.getItem('kinotix_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', stored);
  if (btn) btn.textContent = stored === 'dark' ? '☀️' : '🌙';

  if (btn) {
    btn.addEventListener('click', () => {
      const mode = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', mode);
      localStorage.setItem('kinotix_theme', mode);
      btn.textContent = mode === 'dark' ? '☀️' : '🌙';
    });
  }
}
