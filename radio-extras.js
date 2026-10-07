/* Retro Radio additions. Last-row cards are drawn in the same frame as the others. */
(function () {
  const RECENT_KEY = 'retroRadioRecent_v1';
  const HINT_KEY = 'retroRadioHintSeen_v1';
  const META_URL = 'https://app.fixtorllc.com/api/radio-nowplaying';
  function plaque(title, icon) {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 140"><rect width="200" height="140" fill="#f4f0e6"/><rect x="8" y="8" width="184" height="124" rx="3" fill="#f7f4ee" stroke="#3a352c" stroke-width="3"/><rect x="14" y="14" width="172" height="112" fill="none" stroke="#3a352c" stroke-width="1.4"/><text x="100" y="38" text-anchor="middle" font-family="Georgia,serif" font-size="15" font-weight="700" fill="#3a352c">' + title + '</text>' + icon + '</svg>';
    return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
  }
  const soundtrackImg = plaque('SOUNDTRACK', '<rect x="62" y="58" width="76" height="46" rx="2" fill="none" stroke="#3a352c" stroke-width="2.4"/><rect x="70" y="66" width="60" height="8" fill="#3a352c"/><path d="M62 58 L92 46 L138 46 L108 58 Z" fill="none" stroke="#3a352c" stroke-width="2.4"/><path d="M96 46 L108 58" stroke="#3a352c" stroke-width="2"/>');
  const spokenImg = plaque('SPOKEN WORD', '<path d="M70 62 h28 v48 H70 z M102 62 h28 v48 h-28 z" fill="none" stroke="#3a352c" stroke-width="2.4"/><path d="M74 74 h20 M74 82 h20 M74 90 h16 M106 74 h20 M106 82 h20 M106 90 h16" stroke="#3a352c" stroke-width="1.4"/>');
  const otherImg = plaque('OTHER', '<circle cx="100" cy="78" r="24" fill="none" stroke="#3a352c" stroke-width="3"/><path d="M84 94 L116 62" stroke="#3a352c" stroke-width="3"/><text x="100" y="116" text-anchor="middle" font-family="Georgia,serif" font-size="9" font-weight="700" fill="#3a352c">OUT OF CATEGORY</text>');
  const GENRE_GROUPS = [
    { slug: 'pop', label: 'Pop', img: 'assets/genres/pop.webp', members: ['pop','synthpop','electropop','k-pop','j-pop','t-pop','g-pop','city-pop'] },
    { slug: 'rock', label: 'Rock', img: 'assets/genres/rock.webp', members: ['rock','hard-rock','heavy-metal','thrash-metal','death-metal','black-metal','power-metal','symphonic-metal','gothic-metal','punk','post-punk','grunge','emo','alternative','indie','indie-rock','post-rock'] },
    { slug: 'hip-hop', label: 'Hip Hop', img: 'assets/genres/hip-hop.webp', members: ['hip-hop','rap','phonk'] },
    { slug: 'randb', label: 'R&B', img: 'assets/genres/randb.webp', members: ['randb','soul','funk','disco'] },
    { slug: 'electronic', label: 'Electronic', img: 'assets/genres/dance.webp', members: ['dance','house','techno','trance','dnb','dubstep','electro','edm','ambient','chill-out','lo-fi','trip-hop','psybient','psychedelic','progressive','darkwave','new-wave','vaporwave','chiptune'] },
    { slug: 'jazz', label: 'Jazz', img: 'assets/genres/jazz.webp', members: ['jazz','blues','ragtime','swing','bebop','smooth-jazz'] },
    { slug: 'classical', label: 'Classical', img: 'assets/genres/classical.webp', members: ['classical','baroque','romantic','modern-classical','choral','opera','new-age'] },
    { slug: 'country', label: 'Country', img: 'assets/genres/country.webp', members: ['country','country-rock','bluegrass','outlaw-country','americana','cowboy','folk','folk-rock','celtic'] },
    { slug: 'world', label: 'World', img: 'assets/genres/world.webp', members: ['world','afrobeat','reggae','dub','dancehall','ska','rocksteady','latin','salsa','merengue','bachata','tango','flamenco','bossa-nova','samba','forro','zouk','kizomba','afro-cuban','bhangra','bollywood'] },
    { slug: 'soundtrack', label: 'Soundtrack', img: 'assets/genres/soundtrack.webp', members: ['soundtrack','game-music','anison'] },
    { slug: 'spoken', label: 'Spoken', img: 'assets/genres/spoken-word.webp', members: ['spoken-word','comedy','podcast','audiobook','narration','acapella','field-recording','experimental'] },
    { slug: 'other', label: 'Other', img: 'assets/genres/other.webp', members: [] }
  ];
  const GROUP_BY_MEMBER = {};
  GENRE_GROUPS.forEach(g => g.members.forEach(m => { GROUP_BY_MEMBER[m] = g.slug; }));
  function groupBySlug(slug) { return GENRE_GROUPS.find(g => g.slug === slug) || GENRE_GROUPS[GENRE_GROUPS.length - 1]; }
  const style = document.createElement('style');
  style.textContent = '.genre-toolbar{display:flex;gap:8px;align-items:center;padding:8px 10px 0;flex-shrink:0}.genre-toolbar button,.list-extra button{border:2px solid #3a352c;background:#f4f0e6;color:#3a352c;font-family:inherit;font-weight:bold;font-size:12px;letter-spacing:.04em;border-radius:4px;padding:8px 10px;cursor:pointer}.genre-toolbar input{flex:1;min-width:0;border:2px solid #3a352c;background:#fbfaf5;font-family:inherit;font-size:16px;padding:8px 10px;border-radius:4px;color:#3a352c}.recent-row{display:flex;gap:8px;overflow-x:auto;padding:8px 10px 0}.recent-chip{flex:0 0 auto;border:1px dashed #8a8168;background:#f4f0e6;color:#3a352c;font-family:inherit;font-size:13px;font-weight:bold;padding:8px 10px;border-radius:4px;cursor:pointer}.hint-overlay{position:absolute;inset:0;z-index:40;background:rgba(58,53,44,.45);display:flex;align-items:flex-end;justify-content:center;padding:18px}.hint-card{background:#fbfaf5;border:2px solid #3a352c;border-radius:8px;padding:16px;max-width:420px;font-size:16px;line-height:1.45}.hint-card button{margin-top:12px;width:100%}.genre-grid{display:grid!important;width:100%!important;grid-template-columns:repeat(3,minmax(0,1fr))!important}.genre-card{position:relative!important;width:100%!important;aspect-ratio:10/7!important;overflow:hidden!important;background:#f4f0e6!important}.genre-card img{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;object-fit:contain!important;background:#f4f0e6!important;transform:none!important}';
  document.head.appendChild(style);
  function equalize() {
    const cards = document.querySelectorAll('.genre-grid .genre-card');
    if (!cards.length) return;
    const h = Math.round(cards[0].getBoundingClientRect().width * 7 / 10);
    if (h) cards.forEach(card => { card.style.height = h + 'px'; card.style.minHeight = h + 'px'; });
  }
  const genres = document.getElementById('screen-genres');
  const bar = document.createElement('div');
  bar.className = 'genre-toolbar';
  bar.innerHTML = '<button id="btn-language" type="button">LANGUAGE</button><button id="btn-favorites" type="button">FAVORITES</button><input id="station-search" type="search" placeholder="Search station" autocomplete="off">';
  const recent = document.createElement('div');
  recent.id = 'recent-row';
  recent.className = 'recent-row';
  genres.insertBefore(recent, genres.firstChild);
  genres.insertBefore(bar, genres.firstChild);
  const slot = document.createElement('span');
  slot.id = 'list-extra-slot';
  const header = document.querySelector('#screen-list .screen-header');
  if (header) header.appendChild(slot);
  const now = document.createElement('div');
  now.className = 'cassette-status';
  now.id = 'cassette-now';
  const title = document.getElementById('cassette-title');
  if (title) title.insertAdjacentElement('afterend', now);
  const hint = document.createElement('div');
  hint.id = 'hint-overlay';
  hint.className = 'hint-overlay';
  hint.style.display = 'none';
  hint.innerHTML = '<div class="hint-card">Language filter is the LANGUAGE button, or swipe down from the top. Favorites are the FAVORITES button, or swipe sideways.<button id="hint-ok" type="button">OK</button></div>';
  document.getElementById('app').appendChild(hint);
  state.failSkips = 0;
  state.metaTimer = null;
  const fineGenres = stationGenres;
  stationGenres = function (station) {
    const fine = fineGenres(station).filter(s => s !== 'other');
    const groups = new Set(fine.map(s => GROUP_BY_MEMBER[s] || 'other'));
    return groups.size ? Array.from(groups) : ['other'];
  };
  function loadRecent() { try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); } catch (e) { return []; } }
  function renderRecent() {
    recent.innerHTML = '';
    loadRecent().forEach((st, idx) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'recent-chip'; b.textContent = st.name;
      b.addEventListener('click', () => { state.listContext = { title: 'RECENT', slug: 'recent', stations: loadRecent(), sourceScreen: 'genres' }; startPlayback(idx); });
      recent.appendChild(b);
    });
  }
  function rememberStation(station) {
    const list = loadRecent().filter(s => (s.name || '').toLowerCase() !== station.name.toLowerCase());
    list.unshift(station);
    try { localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, 12))); } catch (e) {}
    renderRecent();
  }
  function setNowPlaying(text) { now.textContent = text || (state.player ? state.player.station.name : ''); }
  function splitStreamTitle(raw) {
    const text = String(raw || '').trim();
    const parts = text.split(' - ');
    if (parts.length >= 2) return { artist: parts[0].trim(), title: parts.slice(1).join(' - ').trim() };
    return { title: text, artist: '' };
  }
  updateMediaSessionMetadata = function (station, streamTitle) {
    if (!('mediaSession' in navigator)) return;
    const split = splitStreamTitle(streamTitle);
    navigator.mediaSession.metadata = new MediaMetadata({ title: split.title || station.name, artist: split.artist || station.name, album: station.name });
  };
  async function pollNowPlaying() {
    if (!state.player) return;
    const station = state.player.station;
    try {
      const res = await fetch(META_URL + '?url=' + encodeURIComponent(station.url_resolved || station.url));
      if (!res.ok) return;
      const data = await res.json();
      setNowPlaying(data.streamTitle || station.name);
      updateMediaSessionMetadata(station, data.streamTitle || '');
    } catch (e) {}
  }
  function startMetaPoll() { clearInterval(state.metaTimer); pollNowPlaying(); state.metaTimer = setInterval(pollNowPlaying, 20000); }
  const basePlay = playStation;
  playStation = function (station) { state.failSkips = 0; basePlay(station); setNowPlaying(station.name); updateMediaSessionMetadata(station, ''); rememberStation(station); startMetaPoll(); };
  function markStationDown() {
    if (!state.player) return;
    setNowPlaying('Station unavailable');
    if (state.failSkips >= 5 || !state.player.list || state.player.list.length < 2) return;
    state.failSkips++;
    playAdjacent(1);
  }
  silentReconnect = function () {
    if (!state.player || audioEl.paused) return;
    clearTimeout(state.reconnectTimer); clearTimeout(state.stallGraceTimer); state.stallGraceTimer = null;
    if (state.reconnectAttempts >= 3) { markStationDown(); return; }
    state.reconnectAttempts++;
    setNowPlaying('Reconnecting…');
    state.reconnectTimer = setTimeout(() => {
      if (!state.player || audioEl.paused) return;
      audioEl.src = state.player.station.url_resolved || state.player.station.url;
      audioEl.play().catch(() => {});
    }, 1500 * Math.min(state.reconnectAttempts, 4));
  };
  const baseGrid = renderGenreGrid;
  renderGenreGrid = function () {
    if (!state.pool.length) {
      document.getElementById('grid-scroll-genres').innerHTML = '<div class="empty-hint">Stations did not load.<br><button id="retry-pool" type="button">RETRY</button></div>';
      const btn = document.getElementById('retry-pool');
      if (btn) btn.addEventListener('click', () => loadPool());
      return;
    }
    baseGrid();
    const counts = {};
    for (const st of state.pool) for (const g of stationGenres(st)) counts[g] = (counts[g] || 0) + 1;
    const grid = document.createElement('div');
    grid.className = 'genre-grid';
    GENRE_GROUPS.filter(g => counts[g.slug] > 0).forEach(g => {
      const card = document.createElement('div');
      card.className = 'genre-card';
      card.innerHTML = '<img src="' + g.img + '" alt="' + g.label + '" draggable="false">';
      card.addEventListener('click', () => openStationList(g.slug));
      grid.appendChild(card);
    });
    const container = document.getElementById('grid-scroll-genres');
    container.innerHTML = '';
    container.appendChild(grid);
    equalize();
    renderRecent();
  };
  openStationList = function (slug) {
    state.listContext = { title: groupBySlug(slug).label, slug, stations: dedupeByName(state.pool.filter(st => stationGenres(st).includes(slug))), sourceScreen: 'genres' };
    renderStationList(); goToScreen('list');
  };
  const baseRenderList = renderStationList;
  renderStationList = function () {
    baseRenderList();
    const ctx = state.listContext;
    slot.innerHTML = ctx && ctx.title === 'FAVORITES' ? '<span class="list-extra"><button type="button" id="export-fav">EXPORT</button><button type="button" id="import-fav">IMPORT</button></span>' : '';
    const exp = document.getElementById('export-fav');
    const imp = document.getElementById('import-fav');
    if (exp) exp.addEventListener('click', () => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([JSON.stringify(state.favorites, null, 2)], { type: 'application/json' }));
      a.download = 'retro-radio-favorites.json'; a.click();
    });
    if (imp) imp.addEventListener('click', () => {
      const input = document.createElement('input'); input.type = 'file'; input.accept = 'application/json';
      input.addEventListener('change', () => {
        const file = input.files && input.files[0]; if (!file) return;
        const reader = new FileReader();
        reader.onload = () => { try {
          const parsed = JSON.parse(reader.result);
          if (!Array.isArray(parsed)) return;
          state.favorites = dedupeByName(state.favorites.concat(parsed.filter(s => s && s.name)));
          saveFavorites(); openFavoritesList();
        } catch (e) {} };
        reader.readAsText(file);
      });
      input.click();
    });
  };
  document.getElementById('btn-language').addEventListener('click', openFilter);
  document.getElementById('btn-favorites').addEventListener('click', openFavoritesList);
  document.getElementById('station-search').addEventListener('keydown', e => {
    if (e.key !== 'Enter') return;
    const q = e.target.value.trim().toLowerCase();
    if (q.length < 2) return;
    state.listContext = { title: 'SEARCH', slug: 'search', stations: dedupeByName(state.pool.filter(s => (s.name || '').toLowerCase().includes(q))), sourceScreen: 'genres' };
    renderStationList(); goToScreen('list');
  });
  document.getElementById('hint-ok').addEventListener('click', () => { hint.style.display = 'none'; try { localStorage.setItem(HINT_KEY, '1'); } catch (e) {} });
  if (!localStorage.getItem(HINT_KEY)) hint.style.display = 'flex';
  renderGenreGrid();
  window.addEventListener('resize', equalize);
})();
