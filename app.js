(function () {
  'use strict';

  const S = window.SITE;
  const SECTIONS = ['about', 'research', 'life'];
  const TITLES = { about: 'About', research: 'Research', life: 'Life' };
  const $ = (s, r = document) => r.querySelector(s);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const ext = url => /^(https?:)?\/\//.test(url) ? ' target="_blank" rel="noopener"' : '';

  // Turns [text](url) into links after escaping everything else.
  const linkify = s => esc(s).replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, t, u) => `<a href="${u}"${ext(u)}>${t}</a>`);

  // ---------- About ----------
  function renderAbout() {
    const a = S.about;
    return `
      <h2>${esc(a.heading)}</h2>
      ${a.bio.map(p => `<p>${linkify(p)}</p>`).join('')}
      <h3>Interests</h3>
      <ul class="tags">${a.interests.map(i => `<li>${esc(i)}</li>`).join('')}</ul>
      <h3>Experience and education</h3>
      <ol class="timeline">${a.timeline.map(e => `
        <li><strong>${esc(e.title)}</strong><span>${esc(e.org)}${e.years ? `, ${esc(e.years)}` : ''}</span>${e.note ? `<span class="muted">${linkify(e.note)}</span>` : ''}</li>`).join('')}
      </ol>
      <h3>Find me</h3>
      <ul class="links">${a.links.map(l => `<li><a href="${esc(l.url)}"${ext(l.url)}>${esc(l.label)}</a></li>`).join('')}</ul>`;
  }

  // ---------- Filterable lists ----------
  function chips(types, count, group, initial) {
    return `<div class="chips" role="group" aria-label="Filter by category">${types.map(([k, label]) =>
      `<button type="button" class="chip" data-group="${group}" data-filter="${k}" aria-pressed="${k === initial}">${esc(label)}<span class="count">${count(k)}</span></button>`
    ).join('')}</div>`;
  }

  const R_TYPES = [['recent', 'Recent'], ['paper', 'Publications'], ['blog', 'Blog'], ['media', 'Media'], ['service', 'Service']];

  // Recent = upcoming work plus anything dated within the past 12 months.
  function itemTime(it) {
    if (it.status === 'in-prep') return Infinity;
    if (it.date) { const [y, m] = it.date.split('-').map(Number); return new Date(y, (m || 12) - 1, 1).getTime(); }
    if (it.year) return new Date(it.year, 11, 1).getTime();
    return 0;
  }
  function isRecent(it) {
    const cutoff = new Date();
    cutoff.setFullYear(cutoff.getFullYear() - 1);
    return itemTime(it) >= cutoff.getTime();
  }
  const service = () => (S.research.service || []).filter(g => g.venues && g.venues.length);
  function researchCount(k) {
    const items = S.research.items;
    if (k === 'recent') return items.filter(isRecent).length;
    if (k === 'service') return service().reduce((n, g) => n + g.venues.length, 0);
    return items.filter(i => i.type === k).length;
  }
  function yearsText(ys) {
    if (!ys || !ys.length) return '';
    const sorted = [...ys].sort((a, b) => a - b);
    const consecutive = sorted.every((y, i) => i === 0 || y === sorted[i - 1] + 1);
    if (sorted.length > 2 && consecutive) return `${sorted[0]} to ${sorted[sorted.length - 1]}`;
    return sorted.join(', ');
  }
  function renderService() {
    const groups = service();
    if (!groups.length) return `<li class="empty">No service listed yet.</li>`;
    return groups.map(g => `
      <li class="service-group">
        <h4 class="service-role">${esc(g.role)}</h4>
        <ul class="service-venues">${g.venues.map(v => `<li><span class="venue">${esc(v.name)}</span>${v.years ? `<span class="years">${esc(yearsText(v.years))}</span>` : ''}</li>`).join('')}</ul>
      </li>`).join('');
  }
  const L_TYPES = [['recent', 'Recent'], ['travel', 'Travel'], ['event', 'Events'], ['milestone', 'Milestones']];
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  function monthText(d) {
    if (!d) return '';
    const [y, m] = String(d).split('-').map(Number);
    return m ? `${MONTHS[m - 1]} ${y}` : String(y);
  }
  const lifeCount = k => S.life.stories.filter(st => k === 'recent' ? isRecent(st) : st.type === k).length;

  function renderResearch() {
    return `
      <h2>Research</h2>
      <p class="lede">${esc(S.research.intro)}</p>
      ${chips(R_TYPES, researchCount, 'research', 'recent')}
      <ul class="works" id="works"></ul>`;
  }

  function fillWorks(filter) {
    const label = (R_TYPES.find(t => t[0] === filter) || R_TYPES[0])[1];
    const ul = $('#works');
    if (filter === 'service') { ul.innerHTML = renderService(); return; }
    const items = S.research.items
      .filter(i => filter === 'recent' ? isRecent(i) : i.type === filter)
      .slice()
      .sort((a, b) => itemTime(b) - itemTime(a));
    if (!items.length) {
      ul.innerHTML = filter === 'recent'
        ? `<li class="empty">Nothing new in the past 12 months. Check the other categories.</li>`
        : `<li class="empty">No ${esc(label.toLowerCase())} yet. Check back soon.</li>`;
      return;
    }
    ul.innerHTML = items.map(it => {
      const soon = it.status === 'in-prep';
      const links = it.links || [];
      const primary = links[0];
      const title = primary ? `<a href="${esc(primary.url)}"${ext(primary.url)}>${esc(it.title)}</a>` : esc(it.title);
      const meta = (soon ? 'In preparation' : esc(it.venue || '')) + (it.note ? `<span class="work-note">${esc(it.note)}</span>` : '');
      const authors = (it.authors || []).map(n => /^Ge Shi\*?$/.test(n) ? `<strong class="me">${esc(n)}</strong>` : esc(n)).join(', ');
      const more = links.length ? `<span class="item-links">${links.map(l => `<a href="${esc(l.url)}"${ext(l.url)}>${esc(l.label)}</a>`).join('')}</span>` : '';
      return `<li class="work">
        <span class="work-year${soon ? ' is-soon' : ''}">${soon ? 'Soon' : esc(it.year)}</span>
        <div><h4 class="work-title">${title}</h4>${authors ? `<p class="work-authors">${authors}</p>` : ''}<p class="work-meta">${meta}${more}</p></div>
      </li>`;
    }).join('');
  }

  // ---------- Life ----------
  function renderLife() {
    return `
      <h2>Life</h2>
      <p class="lede">${esc(S.life.intro)}</p>
      ${chips(L_TYPES, lifeCount, 'life', 'recent')}
      <ul class="stories" id="stories"></ul>`;
  }

  function media(st) {
    return st.image
      ? `<img src="${esc(st.image)}" alt="${esc(st.alt)}" loading="lazy">`
      : `<span class="placeholder" aria-hidden="true">Photo coming soon</span>`;
  }

  function fillStories(filter) {
    const label = (L_TYPES.find(t => t[0] === filter) || L_TYPES[0])[1];
    const ul = $('#stories');
    const list = S.life.stories.map((st, i) => [st, i])
      .filter(([st]) => filter === 'recent' ? isRecent(st) : st.type === filter)
      .sort((a, b) => itemTime(b[0]) - itemTime(a[0]));
    if (!list.length) {
      ul.innerHTML = filter === 'recent'
        ? `<li class="empty">Nothing new in the past 12 months. Check the other categories.</li>`
        : `<li class="empty">No ${esc(label.toLowerCase())} yet. Check back soon.</li>`;
      return;
    }
    ul.innerHTML = list.map(([st, i]) => `
      <li><button type="button" class="story" data-story="${i}">
        <span class="story-img">${media(st)}</span>
        <span class="story-title">${esc(st.title)}</span>
        <span class="story-meta">${esc([st.place, monthText(st.date)].filter(Boolean).join(', '))}</span>
      </button></li>`).join('');
  }

  function openStory(i) {
    const st = S.life.stories[i];
    const dlg = $('#lightbox');
    $('#lb-media').innerHTML = media(st);
    $('#lb-title').textContent = st.title;
    $('#lb-meta').textContent = [st.place, monthText(st.date)].filter(Boolean).join(', ');
    $('#lb-text').innerHTML = linkify(st.text || '');
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
  }

  // ---------- Trace ----------
  const traceEl = $('#trace');
  function onEvent(name, action, color) {
    const li = document.createElement('li');
    li.innerHTML = `<span class="who" style="--dot:${esc(color)}">${esc(name)}</span><span class="act">${esc(action)}</span>`;
    traceEl.prepend(li);
    while (traceEl.children.length > 4) traceEl.lastChild.remove();
  }

  // ---------- Routing ----------
  const panel = $('#panel');
  const scroller = $('#panel-scroll');

  function getFocus() {
    // The part of the screen where the map is visible, in CSS px.
    const r = panel.getBoundingClientRect();
    const vw = window.innerWidth, vh = window.innerHeight;
    const plate = $('.plate').getBoundingClientRect();
    if (r.width < vw * 0.7) {
      const trace = $('.trace').getBoundingClientRect();
      return { x: 0, y: 0, w: r.left, h: vh, avoid: [plate, trace] };
    }
    return { x: 0, y: plate.bottom, w: vw, h: r.top - plate.bottom, avoid: [] };
  }

  function show(id, instant) {
    if (!SECTIONS.includes(id)) id = 'about';
    for (const s of SECTIONS) $('#sec-' + s).hidden = s !== id;
    document.querySelectorAll('.tabs a').forEach(a => {
      if (a.dataset.tab === id) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    scroller.scrollTop = 0;
    document.title = id === 'about' ? S.name : `${TITLES[id]} | ${S.name}`;
    window.World.focus(id, instant);
  }

  // ---------- Theme and motion ----------
  const themeBtn = $('#toggle-theme');
  const motionBtn = $('#toggle-motion');
  const darkMq = window.matchMedia('(prefers-color-scheme: dark)');
  const motionMq = window.matchMedia('(prefers-reduced-motion: reduce)');
  let storedTheme = null;
  try { storedTheme = localStorage.getItem('theme'); } catch (e) { /* storage unavailable */ }

  function applyTheme(name) {
    document.documentElement.dataset.theme = name;
    window.World.setTheme(name === 'dark' ? 'night' : 'day');
    themeBtn.textContent = name === 'dark' ? 'Switch to day' : 'Switch to night';
  }
  function setPaused(p) {
    window.World.setPaused(p);
    motionBtn.setAttribute('aria-pressed', String(p));
    motionBtn.textContent = p ? 'Resume world' : 'Pause world';
  }

  // ---------- Boot ----------
  $('#tagline').innerHTML = [].concat(S.tagline).map(esc).join('<br>');
  $('#sec-about').innerHTML = renderAbout();
  $('#sec-research').innerHTML = renderResearch();
  $('#sec-life').innerHTML = renderLife();
  fillWorks('recent');
  fillStories('recent');

  document.addEventListener('click', e => {
    const chip = e.target.closest('.chip');
    if (chip) {
      const group = chip.dataset.group;
      document.querySelectorAll(`.chip[data-group="${group}"]`).forEach(c => c.setAttribute('aria-pressed', String(c === chip)));
      (group === 'research' ? fillWorks : fillStories)(chip.dataset.filter);
      return;
    }
    const story = e.target.closest('.story');
    if (story) openStory(Number(story.dataset.story));
  });
  $('#lightbox').addEventListener('click', e => { if (e.target === e.currentTarget) e.currentTarget.close(); });

  window.World.init($('#world'), {
    getFocus,
    onEvent,
    onZoneClick: id => { if (location.hash !== '#' + id) location.hash = id; }
  });

  applyTheme(storedTheme || (darkMq.matches ? 'dark' : 'light'));
  darkMq.addEventListener('change', e => { if (!storedTheme) applyTheme(e.matches ? 'dark' : 'light'); });
  themeBtn.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    storedTheme = next;
    try { localStorage.setItem('theme', next); } catch (e) { /* storage unavailable */ }
    applyTheme(next);
  });

  setPaused(motionMq.matches);
  motionBtn.addEventListener('click', () => setPaused(motionBtn.getAttribute('aria-pressed') !== 'true'));

  window.addEventListener('hashchange', () => show(location.hash.slice(1)));
  show(location.hash.slice(1), true);
  window.addEventListener('resize', () => window.World.focus(location.hash.slice(1) || 'about', true));
})();
