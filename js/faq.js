// FAQ Accordion & Filter Engine
function initFAQ() {
  const nodes = document.querySelectorAll('.faq-node');
  nodes.forEach(node => {
    const q = node.querySelector('.faq-node-question');
    if (q) {
      q.addEventListener('click', () => {
        node.classList.toggle('active');
      });
    }
  });

  const search = document.getElementById('faq-search-input');
  if (search) {
    search.addEventListener('input', (e) => {
      const val = e.target.value.toLowerCase().trim();
      nodes.forEach(node => {
        const text = node.textContent.toLowerCase();
        node.style.display = text.includes(val) ? 'block' : 'none';
      });
    });
  }
}
