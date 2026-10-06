/* Last-row cards were shrinking to the image. Force three equal columns. */
(function () {
  const style = document.createElement('style');
  style.textContent = '.genre-grid{width:100%!important;grid-template-columns:repeat(3,minmax(0,1fr))!important}.genre-card{width:100%!important;min-width:0!important;aspect-ratio:10/7}.genre-card img{width:100%;height:100%;object-fit:contain;transform:none}';
  document.head.appendChild(style);
  function fixOther() {
    document.querySelectorAll('.genre-card img[alt="Other"]').forEach(img => {
      const card = img.parentElement;
      card.innerHTML = '<div style="height:100%;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:16px;letter-spacing:.04em">OTHER</div>';
    });
  }
  fixOther();
  new MutationObserver(fixOther).observe(document.getElementById('grid-scroll-genres') || document.body, { childList: true, subtree: true });
})();
