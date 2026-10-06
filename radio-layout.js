/* Equal genre cards. Other stays an illustrated card, not a text label. */
(function () {
  const style = document.createElement('style');
  style.textContent = [
    '.genre-grid{display:grid!important;width:100%!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;}',
    '.genre-card{width:100%!important;min-width:0!important;aspect-ratio:10/7!important;height:auto!important;overflow:hidden;}',
    '.genre-card img{width:100%!important;height:100%!important;object-fit:cover!important;transform:none!important;display:block;}'
  ].join('');
  document.head.appendChild(style);
  function equalize() {
    const cards = document.querySelectorAll('.genre-grid .genre-card');
    if (!cards.length) return;
    const w = cards[0].getBoundingClientRect().width;
    if (!w) return;
    const h = Math.round(w * 7 / 10);
    cards.forEach(card => { card.style.width = '100%'; card.style.height = h + 'px'; card.style.minHeight = h + 'px'; });
  }
  function fixArt() {
    document.querySelectorAll('.genre-card img[alt="Other"]').forEach(img => {
      if (!img.src.includes('other.webp')) img.src = 'assets/genres/other.webp';
    });
    equalize();
  }
  fixArt();
  window.addEventListener('resize', equalize);
  const grid = document.getElementById('grid-scroll-genres');
  if (grid) new MutationObserver(fixArt).observe(grid, { childList: true, subtree: true });
  const recent = document.getElementById('recent-row');
  if (recent) recent.addEventListener('click', (e) => {
    const btn = e.target.closest('.recent-chip');
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    let stations = [];
    try { stations = JSON.parse(localStorage.getItem('retroRadioRecent_v1') || '[]'); } catch (err) { stations = []; }
    const index = stations.findIndex(s => s && s.name === btn.textContent);
    if (index < 0 || typeof startPlayback !== 'function') return;
    state.listContext = { title: 'RECENT', slug: 'recent', stations, sourceScreen: 'genres' };
    startPlayback(index);
  }, true);
})();
