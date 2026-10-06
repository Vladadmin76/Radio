(function () {
  const style = document.createElement('style');
  style.textContent = '.genre-grid{display:grid!important;width:100%!important;grid-template-columns:repeat(3,minmax(0,1fr))!important}.genre-card{position:relative!important;width:100%!important;aspect-ratio:10/7!important;overflow:hidden}.genre-card img{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;object-fit:fill!important;transform:none!important}';
  document.head.appendChild(style);
  function hexToUrl(hex) {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
    return URL.createObjectURL(new Blob([bytes], { type: 'image/webp' }));
  }
  function applyArt() {
    const art = window.GENRE_ART || {};
    document.querySelectorAll('.genre-card img').forEach(img => {
      const name = (img.getAttribute('src') || '').split('/').pop().replace('.webp', '');
      const key = img.alt === 'Other' ? 'other' : name;
      if (art[key] && img.dataset.art !== key) { img.src = art[key]; img.dataset.art = key; }
    });
    const cards = document.querySelectorAll('.genre-grid .genre-card');
    if (!cards.length) return;
    const h = Math.round(cards[0].getBoundingClientRect().width * 7 / 10);
    if (h) cards.forEach(card => { card.style.height = h + 'px'; });
  }
  applyArt();
  const grid = document.getElementById('grid-scroll-genres');
  if (grid) new MutationObserver(applyArt).observe(grid, { childList: true, subtree: true });
  const recent = document.getElementById('recent-row');
  if (recent) recent.addEventListener('click', (e) => {
    const btn = e.target.closest('.recent-chip');
    if (!btn) return;
    e.preventDefault(); e.stopPropagation();
    let stations = [];
    try { stations = JSON.parse(localStorage.getItem('retroRadioRecent_v1') || '[]'); } catch (err) {}
    const index = stations.findIndex(s => s && s.name === btn.textContent);
    if (index < 0) return;
    state.listContext = { title: 'RECENT', slug: 'recent', stations, sourceScreen: 'genres' };
    startPlayback(index);
  }, true);
})();
