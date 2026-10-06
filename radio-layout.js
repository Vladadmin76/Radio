/* Last-row cards were shrinking to the image. Force three equal columns.
   Recent chips must open the player; the first handler missed the station. */
(function () {
  const style = document.createElement('style');
  style.textContent = '.genre-grid{width:100%!important;grid-template-columns:repeat(3,minmax(0,1fr))!important}.genre-card{width:100%!important;min-width:0!important;aspect-ratio:10/7}.genre-card img{width:100%;height:100%;object-fit:contain;transform:none}';
  document.head.appendChild(style);
  function fixOther() {
    document.querySelectorAll('.genre-card img[alt="Other"]').forEach(img => {
      const card = img.parentElement;
      if (!card || card.dataset.other === '1') return;
      card.dataset.other = '1';
      card.innerHTML = '<div style="height:100%;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:16px;letter-spacing:.04em">OTHER</div>';
    });
  }
  fixOther();
  const grid = document.getElementById('grid-scroll-genres');
  if (grid) new MutationObserver(fixOther).observe(grid, { childList: true, subtree: true });

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
