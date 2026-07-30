// Theme Handler
function initTheme() {
  const toggleBtn = document.getElementById('theme-toggle');
  const currentTheme = localStorage.getItem('kinotix_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', currentTheme);
  if (toggleBtn) toggleBtn.textContent = currentTheme === 'dark' ? '☀️' : '🌙';

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('kinotix_theme', newTheme);
      toggleBtn.textContent = newTheme === 'dark' ? '☀️' : '🌙';
    });
  }
}
