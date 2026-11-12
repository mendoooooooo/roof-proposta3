/* ROOF — pages, routing and choreography. The 3D world lives in world.js. */
(() => {
'use strict';
const D = window.ROOF_DATA, IT = window.ROOF_ITALIAN || {}, W = window.World || { ok: false }, gsap = window.gsap;
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ease = t => t * t * (3 - 2 * t);
const page = $('#page');

/* ---------- clips that open on black frames: skip their first instant ---------- */
const SKIP = { 'Solana-Breakpoint21-Roof_small-short.mp4': 1.7 };
document.addEventListener('loadedmetadata', e => { const v = e.target; if (!v || v.tagName !== 'VIDEO' || v._skip) return; const k = Object.keys(SKIP).find(n => (v.currentSrc || v.src || '').includes(n)); if (!k) return; v._skip = true; const to = SKIP[k]; v.loop = false; if (v.currentTime < to) v.currentTime = to; v.addEventListener('ended', () => { v.currentTime = to; v.play().catch(() => {}); }); }, true);

/* ---------- language ---------- */
Object.assign(IT, {
  'Home': 'Home', 'Skip intro': 'Salta intro', 'SCROLL': 'SCORRI', 'NOW ENTERING': 'STAI ENTRANDO IN', 'FLOOR': 'PIANO',
  'ENTER THE BUILDING': 'ENTRA NEL PALAZZO', 'STEP INSIDE': 'ENTRA', 'THE ROOFTOP': 'IL TETTO', 'WHAT WE DO': 'COSA FACCIAMO',
  'Open': 'Apri', 'Close': 'Chiudi', 'VIEW': 'GUARDA', 'Take me back to the top': 'Torna all’inizio', 'Write to us': 'Scrivici',
  'SAY HELLO': 'SCRIVICI', 'HOMEBASE': 'LA NOSTRA SEDE', 'EIGHT WAYS TO MOVE AN AUDIENCE': 'OTTO MODI PER EMOZIONARE IL PUBBLICO',
  'SELECTED FRAMES': 'IMMAGINI SELEZIONATE', 'Opens the video on YouTube in a new tab.': 'Apre il video su YouTube in una nuova scheda.', 'IN MOTION': 'IN MOVIMENTO', 'Projects': 'Progetti', 'Contact': 'Contatti', 'Project': 'Progetto',
});
let lang = 'en'; try { if (localStorage.getItem('roof-language') === 'it') lang = 'it'; } catch (_) {}
const T = s => { if (lang !== 'it' || s == null) return s; const k = String(s).trim(); return IT[k] !== undefined ? IT[k] : s; };
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const E = s => esc(T(s));

/* ---------- content helpers ---------- */
const projects = D.filter(p => p.path.startsWith('project/'));
const clean = p => p.text.split('\nFollow')[0].split('\n');
const cdn = (src, w) => src.replace('https://www.roofvideodesign.com/', 'https://i0.wp.com/www.roofvideodesign.com/') + '?w=' + w + '&ssl=1';
const imgs = p => p.images.filter(x => x.src && x.src.startsWith('https://www.roofvideodesign.com/') && !x.src.includes('ROOF-LOGO')).map(x => x.src);
const mp4 = p => p.videos.filter(x => x && x.endsWith('.mp4'));
const slug = p => p.path.split('/')[1];
const types = ['Live visuals', 'Live visuals', 'Interactive', 'Live visuals', '3D & animation', 'XR & virtual', 'Live visuals', 'XR & virtual', '3D & animation'];
const category = p => types[projects.indexOf(p)];
const url = p => '#/project/' + slug(p);
const names = p => clean(p)[0];
const poster = p => imgs(p)[0] || '';
const ARROW = '<svg class="arrow-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14"/></svg>';
const LOGO_VIDEO = 'https://www.roofvideodesign.com/wp-content/uploads/2023/03/ROOF-Logo-Animation-Home-_small-short.mp4';
const pad = n => String(n).padStart(2, '0');
const split = text => { let i = 0; return String(text).split(' ').map(w => `<span class="w">${[...w].map(c => `<span class="c" style="--i:${i++}">${esc(c)}</span>`).join('')}</span>`).join(' '); };
const words = text => String(text).split(' ').map(w => `<span class="word">${esc(w)}</span>`).join(' ');
function services() { const l = clean(D[1]).slice(1), out = []; for (let i = 0; i < l.length;) { const name = l[i++], desc = l[i++]; let link = null; if (l[i] && l[i].startsWith('see our work')) link = l[i++]; out.push({ name, desc, link }); } return out; }
const serviceProject = i => projects.find(p => slug(p) === ['intelligent-music-project', 'salmo', 'be-you', 'solana', 'camst', 'thegiornalisti', 'solana-labs'][i]);

/* ---------- the building: one window per page / project ---------- */
const winPos = [[1, 4], [0, 4], [2, 4], [1, 3], [0, 2], [2, 2], [1, 1], [0, 0], [2, 0]];
const defs = [
  { id: 'home', c: 1, r: 2, video: LOGO_VIDEO },
  { id: 'works', c: 0, r: 3, video: 'https://www.roofvideodesign.com/wp-content/uploads/2023/03/Scorpions-header-Roof_small-short.mp4' },
  { id: 'services', c: 2, r: 3, video: D[1].videos[0] },
  { id: 'about', c: 0, r: 1, video: D[2].videos[0] },
  { id: 'contacts', c: 2, r: 1, video: D[3].videos[0] },
  ...projects.map((p, i) => ({ id: 'p:' + slug(p), c: winPos[i][0], r: winPos[i][1], video: mp4(p)[0] || null, poster: poster(p) ? cdn(poster(p), 640) : null })),
  { id: 'spare', c: 1, r: 0, video: null },
];
const routeOf = () => {
  const h = location.hash.replace(/^#\/?/, '').split('/');
  if (!h[0] || h[0] === 'main') return { name: 'home', win: 'home', key: 'home' };
  if (h[0] === 'project') { const p = projects.find(x => slug(x) === h[1]); if (p) return { name: 'project', win: 'p:' + h[1], p, key: 'p:' + h[1] }; }
  if (['works', 'services', 'about', 'contacts'].includes(h[0])) return { name: h[0], win: h[0], key: h[0] };
  return { name: '404', win: 'spare', key: '404' };
};
const routeLabel = r => r.name === 'home' ? 'Home' : r.name === 'works' ? 'What we create' : r.name === 'services' ? 'Services' : r.name === 'about' ? 'About' : r.name === 'contacts' ? "Let's talk" : r.p ? names(r.p) : '404';

/* ---------- shared fragments ---------- */
const heroWin = (eyebrow, title, sub = '', extra = '') => `<section class="hero-win"><div class="hero-win-inner">${extra}<span class="eyebrow">${eyebrow}</span><h1 class="split">${title}</h1>${sub ? `<p>${sub}</p>` : ''}</div><div class="scroll-hint"><span>${E('STEP INSIDE')}</span><i></i></div></section>`;
function card(p, i) {
  return `<a class="card" data-r href="${url(p)}" data-cat="${esc(category(p))}"><div class="card-in tilt"><div class="card-media"><img loading="lazy" src="${esc(cdn(poster(p), 900))}" alt="${E(names(p))}">${mp4(p).length ? `<video muted loop playsinline preload="none" data-hover="${esc(mp4(p)[0])}"></video>` : ''}<span class="card-num">${pad(i + 1)}</span><span class="card-glare"></span></div><div class="card-meta"><div><h3>${E(names(p))}</h3><p>${E(category(p))}</p></div><span class="card-arrow">${ARROW}</span></div></div></a>`;
}
const footer = () => `<footer class="foot"><div class="footer-top" data-r><span class="eyebrow">${E('NEXT PROJECT, NEW POSSIBILITIES')}</span><a href="#/contacts">${E("Let's make")}<br><span class="nowrap">${E('something move.')} <span>${ARROW}</span></span></a></div><div class="footer-bottom"><a class="logo footer-logo" href="#/"><img src="assets/roof-logo-black.png" alt="ROOF logo"></a><p>${E('Bologna, Italy.')}<br>${E('Creating worldwide.')}</p><div><a href="https://www.instagram.com/roofvideodesign/" target="_blank" rel="noopener">Instagram ${ARROW}</a><a href="https://www.youtube.com/@roofvideodesign7410" target="_blank" rel="noopener">YouTube ${ARROW}</a><a href="https://it-it.facebook.com/roofvideodesign/" target="_blank" rel="noopener">Facebook ${ARROW}</a></div></div>${legal()}</footer>`;
const legal = () => `<div class="legal"><span>${E('© all content is copyright of RVD srl 2023 · Independent redesign concept')}</span><div><a href="https://www.iubenda.com/privacy-policy/74691616">Privacy</a><a href="https://www.iubenda.com/privacy-policy/74691616/cookie-policy">Cookies</a><a href="https://www.iubenda.com/terms-and-conditions/74691616">${E('Terms')}</a></div></div>`;

/* ---------- HOME: a scroll journey through the room, the façade and the roof ---------- */
const selected = [projects[0], projects[2], projects[3], projects[4], projects[6]];
const STAGE = [.335, .60], CARDS = [.70, .86];
function homeHTML() {
  const sv = services().slice(0, 4);
  return `<div class="home"><div class="home-space"></div><div class="pin">
<section class="panel p-hero" data-range="0,.028" data-fx="hero"><div class="hero-cap"><span class="eyebrow pill">${E('DIGITAL CONTENT. LIVE EXPERIENCES.')}</span><button class="round-link pill" data-goto=".09">${E('ENTER THE BUILDING')} <i>↓</i></button></div></section>
<section class="panel p-love" data-range=".05,.118" data-fx="zoom"><div class="hero-meta eyebrow rise"><span>${E('INDEPENDENT DIGITAL CONTENT STUDIO')}</span><span class="status">${E('BOLOGNA, ITALY — WORLDWIDE')}</span></div><h1 class="rise" style="--d:1">${E('We love')}<br><em>${E('what we')} ${E('do.')}</em></h1><p class="rise" style="--d:2">${E('Video content. 3D environments. Live experiences.')}<br>${E('We bring imagination to the stage.')}</p></section>
<section class="panel p-studio" data-range=".14,.225" data-fx="left"><span class="eyebrow rise">${E('01 / THE STUDIO')}</span><h2 class="rise" style="--d:1">${E('Digital content.')}<br>${E('Physical impact.')}<br><em>${E('Experiences that stay.')}</em></h2><p class="body-copy rise" style="--d:2">${E(clean(D[2])[0])} ${E(clean(D[2])[1])}</p><a class="text-link rise" style="--d:3" href="#/about">${E('Meet ROOF')} ${ARROW}</a></section>
<section class="panel p-stage" data-range=".30,.615" data-fx="stage"><div class="stage-top"><span class="tag">${E('SELECTED WORK /')} <span class="filmcount">01</span> — 05</span></div><div class="stage-caption"><div><span class="tag tag-mobile">${E('SELECTED WORK /')} <span class="filmcount">01</span> — 05</span><span class="eyebrow" id="filmtype"></span><h2 id="filmtitle"></h2><p id="filmsub"></p></div><a class="project-button" id="filmlink">${E('Explore project')} <span>${ARROW}</span></a></div><div class="reel"><div class="timeline">${selected.map((p, i) => `<button data-film="${i}"><b>${pad(i + 1)}</b><span>${E(names(p))}</span></button>`).join('')}</div></div></section>
<section class="panel p-cards" data-range=".69,.868" data-fx="up"><div class="section-head"><h2>${E('Beyond the screen.')}</h2><a href="#/works" class="text-link">${E('All projects')} ${ARROW}</a></div><div class="strip">${[projects[3], projects[4], projects[5], projects[1], projects[7], projects[8]].map((p, i) => card(p, i)).join('')}</div></section>
<section class="panel p-services" data-range=".885,.962" data-fx="left"><span class="eyebrow rise">${E('THE ROOFTOP')}</span><h2 class="rise" style="--d:1">${E('Ideas into experiences.')}</h2><div class="mini-list">${sv.map((s, i) => `<a class="rise" style="--d:${i + 2}" href="#/services"><small>${pad(i + 1)}</small>${E(s.name)}<span>${ARROW}</span></a>`).join('')}</div><a href="#/services" class="text-link rise" style="--d:6">${E('Our services')} ${ARROW}</a></section>
<section class="panel p-end" data-range=".975,2" data-fx="up"><span class="eyebrow rise">${E('NEXT PROJECT, NEW POSSIBILITIES')}</span><a class="end-cta rise" style="--d:1" href="#/contacts">${E("Let's make")}<br><span class="nowrap">${E('something move.')} <span>${ARROW}</span></span></a><div class="end-row rise" style="--d:2"><p>${E('Bologna, Italy.')} ${E('Creating worldwide.')}</p><div><a href="https://www.instagram.com/roofvideodesign/" target="_blank" rel="noopener">Instagram</a><a href="https://www.youtube.com/@roofvideodesign7410" target="_blank" rel="noopener">YouTube</a><a href="https://it-it.facebook.com/roofvideodesign/" target="_blank" rel="noopener">Facebook</a><button data-goto="0">${E('Take me back to the top')} ↑</button></div></div>${legal()}</section>
</div></div>`;
}
let home = null, film = -1;
const amb = document.createElement('canvas'); amb.id = 'ambient'; amb.width = 24; amb.height = 44; amb.setAttribute('aria-hidden', 'true'); /* not attached: replaced by the in-window fit below */
const ambCtx = amb.getContext('2d');
function drawAmb() { const s = W.ok && W.slot('home'), c = s && s.el && s.el._amb; if (!c || !(s.el._b > .01) || (c._skip = !c._skip)) return; const hv = s.videoEl; if (!hv || hv.readyState < 2) return; try { c.getContext('2d').drawImage(hv, 0, 0, c.width, c.height); } catch (_) {} }
// phones: the closer the camera gets to the home window, the more the clip settles to "logo whole + glow".
// Tied to the camera itself, so it is complete exactly when the camera lands: nothing moves afterwards.
function homeFitFrame() {
  const s = W.ok && W.slot('home'); if (!s || !s.el || !s.el.classList.contains('home-win') || !W.homeFillDist) return;
  const c = W.camera.position, d = Math.hypot(c.x - s.center.x, c.y - s.center.y, c.z - s.center.z), u = W.homeFillDist() / Math.max(d, .001);
  const b = clamp((u - .45) / .55), e = b * b * (3 - 2 * b);
  if (s.el._b !== undefined && Math.abs(e - s.el._b) < .002) return; s.el._b = e;
  const fit = parseFloat(s.el.style.getPropertyValue('--fit')) || 1;
  s.el.style.setProperty('--vw', (100 + (fit * 200 - 100) * e).toFixed(2) + '%'); s.el.style.setProperty('--ma', (1 - e).toFixed(3));
  if (s.el._amb) s.el._amb.style.opacity = e.toFixed(3);
}
const ambBand = () => { const s = W.ok && W.slot('home'); if (!s || !s.el) return; if (!s.el._amb) { const c = document.createElement('canvas'); c.width = 48; c.height = 27; c.className = 'win-amb'; s.el.insertBefore(c, s.videoEl); s.el._amb = c; } const portrait = innerWidth < innerHeight; s.el.classList.toggle('home-win', portrait); if (!portrait) { s.el._fit = false; s.el.classList.remove('fit'); } s.el.style.setProperty('--fit', Math.min(1, innerWidth / (innerHeight * 1.035 * 16 / 9)).toFixed(4)); };
// one DOM screen per face of the 3D drum
const faceEls = selected.map(p => { const d = document.createElement('div'); d.className = 'screen3d'; d.style.backgroundImage = `url("${cdn(poster(p), 1280)}")`; d.innerHTML = `<video muted loop playsinline preload="none" data-src="${esc(mp4(p)[0])}"></video>`; return d; });
const films = faceEls.map(d => d.firstElementChild);
films.forEach(v => v.addEventListener('playing', () => v.classList.add('is-playing')));
// the five showreel films download as soon as the home page is up: two at once, then one after another
let filmsWarm = false;
let windowsWarm = Promise.resolve();
function warmFilms() {
  if (filmsWarm) return; filmsWarm = true; windowsWarm.then(startFilms);
}
function startFilms() {
  let i = 0, live = 0;
  // two at a time, in showreel order; each one is briefly started (muted) so phones really buffer it, then waits for its turn on the screen
  const pump = () => { while (live < 2 && i < films.length) { const v = films[i++]; live++; let over = false; const next = () => { if (over) return; over = true; live--; pump(); };
    v.addEventListener('canplaythrough', next, { once: true }); v.addEventListener('error', next, { once: true }); setTimeout(next, 5000);
    if (!v.src) { v.preload = 'auto'; v.src = v.dataset.src; }
    v.play().then(() => { if (!filmsNear) v.pause(); }).catch(() => {}); } };
  pump();
}
let filmsNear = false;
function setFilm(i, playing, also = -1) {
  filmsNear = playing;
  films.forEach((v, j) => { if ((j === i || j === also) && playing) { if (!v.src) v.src = v.dataset.src; if (v.paused) v.play().catch(() => {}); } else if (!v.paused && !v._warming) v.pause(); });
  if (i === film || i < 0) return; film = i; const p = selected[i];
  $('#filmtitle').textContent = T(names(p)); $('#filmtype').textContent = T(category(p)); $('#filmsub').textContent = T(clean(p)[1]);
  $('#filmlink').href = url(p); $$('.filmcount').forEach(e => e.textContent = pad(i + 1));
  if (!reduce) gsap.fromTo(['#filmtype', '#filmtitle', '#filmsub', '#filmlink'], { y: 70, opacity: 0, rotateX: -70 }, { y: 0, opacity: 1, rotateX: 0, duration: .8, stagger: .06, ease: 'power3.out', overwrite: true });
  $$('[data-film]').forEach((b, j) => b.classList.toggle('active', j === i));
}
function setupHome() {
  film = -1;
  home = { panels: $$('.panel').map(el => { const [a, b] = el.dataset.range.split(',').map(Number); return { el, a, b, fx: el.dataset.fx, vis: null }; }), strip: $('.strip'), cards: $$('.strip .card'), bars: $$('[data-film]'), dial: $('.dial-ring') };
  home.bars.forEach((b, i) => b.onclick = () => goto(STAGE[0] + (STAGE[1] - STAGE[0]) * (i + .25) / 5));
  measureHome(); setFilm(0, false); ambBand();
  home.panels.forEach(P => { P.dim = P.el.classList.contains('p-love') || P.el.classList.contains('p-studio') || P.el.classList.contains('p-services') ? .48 : P.el.classList.contains('p-end') ? 0 : P.el.classList.contains('p-cards') ? .3 : 0; });
}
function measureHome() { if (!home) return; home.cards.forEach(c => { c._x = c.offsetLeft + c.offsetWidth / 2; }); home.stripW = home.strip.scrollWidth; }
function homeFrame(p) {
  // the drum: each project holds the screen, then the prism rolls a face up while the camera steps back
  const st = clamp((p - STAGE[0]) / (STAGE[1] - STAGE[0]), 0, .9999) * 5, fi = Math.floor(st), roll = fi < 4 ? ease(clamp((st - fi - .58) / .42)) : 0;
  if (W.ok) { W.setDrum(fi + roll, reduce ? 0 : Math.sin(roll * Math.PI)); W.setHome(p); }
  const F = .024; let dim = 0;
  for (const P of home.panels) {
    const i = P.a <= 0 ? 1 : clamp((p - P.a) / F), o = P.b >= 1 ? 1 : clamp((P.b - p) / F), v = Math.min(i, o);
    if (v > 0) dim = Math.max(dim, v * P.dim);
    if (v <= 0) { if (P.vis !== false) { P.vis = false; P.el.style.visibility = 'hidden'; P.el.classList.remove('on'); } continue; }
    if (!P.vis) { P.vis = true; P.el.style.visibility = 'visible'; }
    P.el.classList.toggle('on', v > .3);
    const ei = 1 - ease(i), eo = 1 - ease(o); let t = '';
    if (!reduce) switch (P.fx) {
      case 'left': t = `translate3d(${-ei * 16 + eo * 20}vw,0,${-(ei + eo) * 200}px) rotateY(${ei * 42 - eo * 48}deg)`; break;
      case 'up': t = `translate3d(0,${ei * 22 - eo * 26}vh,${-(ei + eo) * 160}px) rotateX(${-ei * 26 + eo * 30}deg)`; break;
      case 'zoom': t = `translate3d(0,0,${-ei * 500 + eo * 420}px)`; break;
      case 'hero': t = `translate3d(0,${eo * 6}vh,0)`; break;
      default: t = '';
    }
    P.el.style.opacity = P.fx === 'stage' ? ease(v) : v; P.el.style.transform = t;
  }
  scrim.style.opacity = dim.toFixed(3);
  // phones: a soft live glow of the ROOF clip fills the screen above and below its logo band
  const ao = W.ok && innerWidth < innerHeight ? 1 - clamp(p / .02) : 0;
  if (ao !== amb._o) { amb._o = ao; amb.style.opacity = ao; }
  // phones: only once the window fills the screen does the clip settle to "logo whole + glow"; seen on the façade it stays a normal full window
  const hs = W.ok && W.slot('home'); if (hs && hs.el) { const want = innerWidth < innerHeight && p < .02; if (hs.el._fit !== want) { hs.el._fit = want; hs.el.classList.toggle('fit', want); } }
  const near = p > .245 && p < .66, act = roll > .5 ? fi + 1 : fi;
  setFilm(act, near, roll > 0 && roll < 1 ? (act === fi ? fi + 1 : fi) : -1);
  for (let j = 0; j < home.bars.length; j++) home.bars[j].style.setProperty('--progress', clamp(st - j));
  // project cards: a 3D strip gliding past as we climb the façade
  if (p > CARDS[0] - .03 && p < CARDS[1] + .03) {
    const t = clamp((p - CARDS[0]) / (CARDS[1] - CARDS[0])), vw = innerWidth, x = vw * .62 - t * (home.stripW - vw * .25 + vw * .37);
    home.strip.style.transform = `translate3d(${x}px,0,0)`;
    if (!reduce) for (const c of home.cards) { const n = clamp((c._x + x - vw / 2) / vw, -1.2, 1.2); c.style.transform = `rotateY(${-n * 40}deg) translateZ(${-Math.abs(n) * 220}px)`; }
  }
}

/* ---------- other pages ---------- */
function worksHTML() {
  const cats = ['All projects', 'Live visuals', '3D & animation', 'Interactive', 'XR & virtual'];
  return heroWin(E('THE PORTFOLIO / 09 PROJECTS'), split(T('What we create.'))) +
    `<section class="sec"><div class="filterbar" data-r aria-label="${E('Filter projects')}">${cats.map((x, i) => `<button class="${i ? '' : 'active'}" aria-pressed="${!i}" data-filter="${esc(x)}">${E(x)}</button>`).join('')}</div><div class="wgrid" id="projects">${projects.map(card).join('')}</div></section>` + footer();
}
function setupWorks() {
  $$('[data-filter]').forEach(b => b.onclick = () => {
    $$('[data-filter]').forEach(x => { x.classList.toggle('active', x === b); x.setAttribute('aria-pressed', x === b); });
    const all = $$('#projects .card'), f = b.dataset.filter, show = c => f === 'All projects' || c.dataset.cat === f;
    all.forEach(c => c.classList.add('in'));
    gsap.to(all, { opacity: 0, scale: .86, rotateX: -18, y: 30, duration: reduce ? 0 : .28, stagger: .025, ease: 'power2.in', overwrite: true, onComplete() {
      all.forEach(c => c.style.display = show(c) ? '' : 'none'); lenis && lenis.resize();
      gsap.fromTo(all.filter(show), { opacity: 0, scale: .86, rotateX: 22, y: 60 }, { opacity: 1, scale: 1, rotateX: 0, y: 0, duration: reduce ? 0 : .7, stagger: .06, ease: 'power3.out', clearProps: 'transform,opacity' });
    } });
  });
}
function servicesHTML() {
  return heroWin(E('WHAT WE DO'), split(T('We love')) + '<br>' + split(T('what we do.'))) +
    `<section class="sec"><p class="eyebrow sec-k" data-r>${E('EIGHT WAYS TO MOVE AN AUDIENCE')}</p><div class="srv-list">${services().map((s, i) => {
      const link = D[1].links.find(x => x.text === s.link), dest = link ? '#/project/' + link.url.split('/').filter(Boolean).pop() : '#/works', p = serviceProject(i), clip = p && mp4(p)[0];
      return `<article class="srv" data-r="flip"><button class="srv-head" aria-expanded="false"><small>${pad(i + 1)}</small><span>${E(s.name)}</span><i>+</i></button><div class="srv-body"><div class="srv-in"><div class="srv-copy"><p>${E(s.desc)}</p>${s.link ? `<a href="${dest}">${E(s.link)} ${ARROW}</a>` : ''}</div>${clip ? `<div class="srv-media" style="background-image:url('${esc(cdn(poster(p), 900))}')"><video muted loop playsinline preload="none" data-src="${esc(clip)}"></video></div>` : ''}</div></div></article>`;
    }).join('')}</div></section>` + footer();
}
function setupServices() {
  const sv = $$('.srv-media video'); sv.forEach(v => v.addEventListener('playing', () => v.classList.add('is-playing')));
  const loadSrv = i => { const v = sv[i]; if (v && !v.src) { v.preload = 'auto'; v.src = v.dataset.src; v.load(); } };
  $$('.srv-head').forEach(b => b.onclick = () => {
    const a = b.parentElement, opening = !a.classList.contains('open');
    $$('.srv.open').forEach(x => { if (x !== a) { x.classList.remove('open'); x.firstElementChild.setAttribute('aria-expanded', 'false'); const v = $('video', x); v && v.pause(); } });
    a.classList.toggle('open', opening); b.setAttribute('aria-expanded', opening);
    const v = $('video', a); if (v) { if (opening) { if (!v.src) v.src = v.dataset.src; v.play().catch(() => {}); } else v.pause(); }
  });
}
function aboutHTML() {
  const l = clean(D[2]);
  return heroWin(E('THE STUDIO'), split(T('We are ROOF.'))) +
    `<section class="sec about"><span class="eyebrow" data-r>${E('CREATIVE MINDS. SHARED VISION.')}</span><p class="statement" data-scrub="words">${words(T(l[0]) + ' ' + T(l[1]))}</p><div class="about-cols">${l.slice(2).map(x => `<p class="body-copy" data-r>${E(x)}</p>`).join('')}</div></section>
<section class="clients"><p class="eyebrow" data-r>${E('PART OF US')}</p><div class="clients-frame" data-scrub="tilt"><div class="clients-crop"><img src="${esc(cdn(imgs(D[2])[0], 1600))}" alt="${E('Original ROOF client and collaborator logos')}"></div></div></section>` + footer();
}
function contactHTML() {
  const l = clean(D[3]);
  return heroWin(E('CONTACT'), split(T('Great things')) + '<br>' + split(T('start with a hello.'))) +
    `<section class="sec contact"><div class="contact-copy"><div class="contact-main"><span class="eyebrow" data-r>${E('SAY HELLO')}</span><p class="body-copy" data-r>${E(l[1].replace(/^5/, ''))}</p><a class="email magnet" data-r="flip" href="mailto:info@roofvideodesign.com">info@roofvideodesign.com ${ARROW}</a></div>
<div class="tile tilt" data-r><span class="eyebrow">${E('HOMEBASE')}</span><p>${E(l[3])}</p><div class="address-row"><address>Roof Videodesign<br>Via Rizzoli 4<br>${E('40125 Bologna, Italy')}</address><a class="text-link" href="https://maps.app.goo.gl/zQqFZyZ3rt3q23di9" target="_blank" rel="noopener">${E('Find us on the map')} ${ARROW}</a></div></div><div class="tile tilt" data-r><span class="eyebrow">ROOF</span><p class="body-copy">${E(l[0])}</p></div></div>
${narrow() ? `<div class="cvideo-inline" data-r><video muted loop playsinline preload="none" data-auto="${esc(D[3].videos[0])}"></video></div></section>` : `<div class="reel-col"><div class="reel-slot"><span class="reel-tag eyebrow">ROOF — REEL</span></div></div></section>
<div class="cvideo" aria-hidden="true"><video muted loop playsinline preload="auto" src="${esc(D[3].videos[0])}"></video><i></i></div>`}` + footer();
}
// Let's talk: the window video detaches, flies into the page and stays with you while you read
let reel = null;
const narrow = () => matchMedia('(max-width:860px)').matches;
function setupContact() {
  if (!$('.cvideo')) { reel = null; const v = $('.cvideo-inline video'), bg = W.ok && W.slot('contacts') && W.slot('contacts').videoEl;
    return; }
  const el = $('.cvideo'), v = $('video', el), slot = $('.reel-slot'), src = W.ok && W.slot('contacts');
  reel = { el, slot, r0: W.ok ? W.fillRect() : { x: 0, y: 0, w: innerWidth, h: innerHeight }, last: scrollY(), vel: 0 };
  if (src && src.videoEl && src.videoEl.currentTime) v.addEventListener('loadedmetadata', () => { try { v.currentTime = src.videoEl.currentTime % (v.duration || 1e9); } catch (_) {} }, { once: true });
  reel.play = () => v.play().catch(() => {}); el.style.width = reel.r0.w + 'px'; el.style.height = reel.r0.h + 'px'; reelFrame(0, reel.last);
}
function reelFrame(s, y) {
  const R = reel, b = R.slot.getBoundingClientRect(), t = reduce ? (s > .02 ? 1 : 0) : ease(clamp(s / .85)), a = R.r0;
  R.vel += ((y - R.last) - R.vel) * .12; R.last = y;
  const k = (a.w + (b.width - a.w) * t) / a.w, x = a.x + (b.left - a.x) * t, yy = a.y + (b.top - a.y) * t;
  const arc = Math.sin(t * Math.PI), tilt = clamp(R.vel * .35, -14, 14), c = (b.top + b.height / 2 - innerHeight / 2) / innerHeight;
  const ry = reduce ? 0 : -arc * 38 - t * 7, rx = reduce ? 0 : arc * 14 + tilt * t + c * 10 * t, z = arc * 260;
  R.el.style.transform = `translate3d(${x + a.w * k / 2}px,${yy + a.h * k / 2}px,0) perspective(1400px) translateZ(${z}px) rotateY(${ry}deg) rotateX(${rx}deg) scale(${k}) translate(-50%,-50%)`;
  R.el.style.setProperty('--t', t.toFixed(3)); R.el.style.setProperty('--glow', (.25 + Math.min(Math.abs(R.vel) * .03, .6)).toFixed(3));
  R.el.style.visibility = b.bottom < -80 && t >= 1 ? 'hidden' : 'visible';
}
function projectHTML(p) {
  const lines = clean(p), ci = lines.findIndex(x => x.toLowerCase() === 'credits'), body = lines.slice(2, ci < 0 ? undefined : ci).filter(x => !['Visit The Virtual Tour', 'Click Here'].includes(x.trim())), credits = ci < 0 ? [] : lines.slice(ci + 1).filter(x => x.toLowerCase() !== 'credits');
  const vs = mp4(p), yt = p.videos.filter(x => x && x.includes('youtube.com')), next = projects[(projects.indexOf(p) + 1) % projects.length], id = slug(p), lead = body.shift() || category(p), n = projects.indexOf(p);
  const tour = id === 'bosch' ? `<a class="text-link" href="${esc((p.links.find(l => l.text === 'Click Here') || {}).url || 'https://www.roofvideodesign.com/project/bosch/')}" target="_blank" rel="noopener">${E('Visit the virtual tour')} ${ARROW}</a>` : '';
  return heroWin(`${pad(n + 1)} / ${pad(projects.length)} — ${E(category(p))}`, split(T(names(p))), E(lines[1]), `<a class="back" href="#/works">${E('← All projects')}</a>`) +
    `<section class="sec story"><div data-r><span class="eyebrow">${E('PROJECT NOTES')}</span><h2>${E(lead)}</h2></div><div class="story-body">${body.map(x => `<p class="body-copy" data-r>${E(x)}</p>`).join('')}${tour}${credits.length ? `<div class="credits" data-r><span class="eyebrow">CREDITS</span>${credits.map(x => `<p>${E(x)}</p>`).join('')}</div>` : ''}</div></section>
<section class="sec"><p class="eyebrow sec-k" data-r>${E('SELECTED FRAMES')}</p><div class="gallery">${imgs(p).map((src, i) => `<button data-r="${i % 2 ? 'right' : 'left'}" data-image="${esc(cdn(src, 2000))}" aria-label="${E(names(p))} ${i + 1}"><img src="${esc(cdn(src, 1100))}" alt="${E(names(p))} ${i + 1}" decoding="async"></button>`).join('')}</div>
${vs.length > 1 || yt.length ? `<p class="eyebrow sec-k" data-r>${E('IN MOTION')}</p>` : ''}<div class="project-videos">${vs.slice(1).map(src => `<div class="vframe" data-scrub="tilt"><video muted loop playsinline preload="none" data-auto="${esc(src)}"></video></div>`).join('')}${yt.map(src => { const id = (src.match(/embed\/([\w-]{6,})/) || [])[1]; return id ? `<a class="embed-button yt-link" data-r href="https://www.youtube.com/watch?v=${id}" target="_blank" rel="noopener"><span class="yt-inner">${E('Play original YouTube video')} ${ARROW}<br><small>${E('Opens the video on YouTube in a new tab.')}</small></span></a>` : ''; }).join('')}</div></section>
<a class="next" href="${url(next)}"><span class="eyebrow">${E('NEXT PROJECT')}</span><h2>${split(T(names(next)))}</h2><span class="project-button">${E('Explore')} <span>${ARROW}</span></span><img src="${esc(cdn(poster(next), 1200))}" alt="" loading="lazy"></a>` + footer();
}
function setupProject(p) {
  $$('[data-image]').forEach(b => b.onclick = () => openLightbox(b));
  $$('[data-embed]').forEach(b => b.onclick = () => { const f = document.createElement('iframe'); f.src = b.dataset.embed; f.title = names(p); f.allowFullscreen = true; f.className = 'embed'; b.replaceWith(f); });
}
const notFoundHTML = () => heroWin('404', split(T('Page not found.')), `<a class="text-link" href="#/works">${E('Back to projects')} ${ARROW}</a>`);

/* ---------- scrolling ---------- */
const lenis = window.Lenis ? new window.Lenis({ lerp: reduce ? 1 : .085, wheelMultiplier: 1.05, autoRaf: false }) : null;
const scrollY = () => lenis ? lenis.scroll : window.scrollY;
const limit = () => lenis ? lenis.limit : document.documentElement.scrollHeight - innerHeight;
const goto = p => { const y = p * limit(), top = p === 0; lenis ? lenis.scrollTo(y, top ? { duration: 3.6, lock: true, easing: t => -(Math.cos(Math.PI * t) - 1) / 2, onStart() { if (W.ok) { gsap.killTweensOf(W, 'smooth'); W.smooth = 1; } }, onComplete() { if (W.ok) gsap.to(W, { smooth: 0, duration: 1, ease: 'power2.out' }); } } : { duration: 1.6, easing: t => 1 - Math.pow(1 - t, 4) }) : scrollTo({ top: y, behavior: 'smooth' }); };
document.addEventListener('click', e => { const g = e.target.closest('[data-goto]'); if (g) goto(+g.dataset.goto); });

/* ---------- per-frame work (one loop for everything) ---------- */
let current = routeOf(), busy = true, heroIn = null, hint = null, scrubs = [];
const cur = { x: innerWidth / 2, y: innerHeight / 2, tx: innerWidth / 2, ty: innerHeight / 2, el: $('#cursor') };
const progress = $('#progress'), scrim = $('#scrim');
function tick(t) {
  lenis && lenis.raf(t); VS.tick();
  if (fine) { cur.x += (cur.tx - cur.x) * .22; cur.y += (cur.ty - cur.y) * .22; cur.el.style.transform = `translate3d(${cur.x}px,${cur.y}px,0)`; }
  drawAmb();
  homeFitFrame();
  if (busy) return;
  const y = scrollY(), lim = Math.max(limit(), 1);
  progress.style.transform = `scaleX(${clamp(y / lim)})`;
  if (current.name === 'home') { if (home) homeFrame(clamp(y / lim)); return; }
  const s = y / innerHeight; W.ok && W.setPage(s, !!reel, current.name === 'contacts' && !reel);
  if (reel) reelFrame(s, y);
  if (heroIn) { const k = clamp(1 - s * 1.9); heroIn.style.opacity = k; heroIn.style.transform = `translate3d(0,${-s * 90}px,0)`; heroIn.style.visibility = k <= 0 ? 'hidden' : 'visible'; if (hint) hint.style.opacity = clamp(1 - s * 5) * .9; }
  scrim.style.opacity = Math.max(.22, clamp((s - .25) * 1.2, 0, .5));
  for (const sc of scrubs) {
    const r = sc.el.getBoundingClientRect(); if (r.bottom < -100 || r.top > innerHeight + 100) continue;
    const k = clamp(1 - (r.top - innerHeight * .25) / (innerHeight * .6));
    if (sc.kind === 'words') { const n = Math.round(k * sc.words.length); if (n !== sc.n) { sc.n = n; sc.words.forEach((w, i) => w.classList.toggle('lit', i < n)); } }
    else if (!reduce) { const c = (r.top + r.height / 2 - innerHeight / 2) / innerHeight; sc.el.style.transform = `perspective(1400px) rotateX(${clamp(c, -1, 1) * 22}deg) scale(${1 - Math.abs(clamp(c, -1, 1)) * .1})`; }
  }
}
if (W.ok) W.onFrame = tick; else { document.body.classList.add('no-gl'); const loop = t => { tick(t); requestAnimationFrame(loop); }; requestAnimationFrame(loop); }
W.onResize = () => { measureHome(); ambBand(); lenis && lenis.resize(); if (reel && W.ok) { reel.r0 = W.fillRect(); reel.el.style.width = reel.r0.w + 'px'; reel.el.style.height = reel.r0.h + 'px'; } };
if (!W.ok) addEventListener('resize', W.onResize);

/* ---------- mounting a page ---------- */
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px 14% 0px', threshold: 0 });
const vio = new IntersectionObserver(es => es.forEach(e => { const v = e.target; if (e.isIntersecting) { if (!v.src) v.src = v.dataset.auto; v.play().catch(() => {}); } else v.pause(); }), { threshold: .2 });
function chrome() {
  document.documentElement.lang = lang;
  $$('[data-t]').forEach(el => el.textContent = T(el.dataset.t));
  $$('[data-language]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.language === lang)));
  $$('header nav a').forEach(a => a.classList.toggle('active', (a.hash || '#/') === (location.hash || '#/')));
  const r = current, base = lang === 'it' ? 'ROOF | Amiamo quello che facciamo' : 'ROOF | We love what we do';
  const name = r.name === 'home' ? '' : r.name === 'works' ? T('Projects') : r.name === 'contacts' ? T('Contact') : r.p ? names(r.p) : T(routeLabel(r));
  document.title = (name ? name + ' — ' : '') + base;
}
// defer: build the page invisibly (before a flight, so decoding and layout never land mid-animation); reveal() shows it
/* ---------- video download director: one queue for the whole site, strict priorities ----------
   1. loader + opening flight: the tower's window clips (the current window — ROOF on the home page — first and alone)
   2. once enough of the tower is in, the home page clips join
   3. inside a page: unfinished tower downloads are stopped; the page's own window clip and the page's clips load fully
   4. then the tower resumes, then the rest of the site (the showreel films when not on the home page)
   Every page change starts again from step 3. */
const VS = (() => {
  const LOW = matchMedia('(pointer:coarse)').matches || Math.min(innerWidth, innerHeight) < 620;
  let token = 0;
  const stage = document.createElement('div'); stage.setAttribute('aria-hidden', 'true');
  stage.style.cssText = 'position:fixed;left:0;bottom:0;width:4px;height:4px;overflow:hidden;opacity:.01;pointer-events:none;z-index:-1';
  document.body.append(stage);
  const parked = new Set();
  const hiddenBox = el => { if (!el) return false; if (getComputedStyle(el).display === 'none') return true; const r = el.getBoundingClientRect(); return r.width === 0 || r.height === 0; };
  function park(v) { if (v.parentElement === stage || !v.parentElement) return; v._home = v.parentElement; v._next = v.nextSibling; stage.append(v); parked.add(v); }
  function unpark(v) { if (v.parentElement !== stage || !v._home) return; v._home.insertBefore(v, v._next && v._next.parentNode === v._home ? v._next : null); parked.delete(v); }
  const full = v => { if (!v) return true; if (v.error) return true; const d = v.duration, b = v.buffered; return d > 0 && b.length > 0 && b.end(b.length - 1) >= d - .3; };
  const srcOf = v => v._src || v.dataset.src || v.dataset.auto || v.getAttribute('src');
  const slotOf = v => v._slot || null;
  function start(v) {
    if (!v) return; const s = srcOf(v); v.preload = 'auto';
    if (!v.getAttribute('src') && s) { v.src = s; }
    const sl = slotOf(v); if (sl) sl.started = true;
    // a short muted start makes phones (iOS) really buffer; whoever owns the clip pauses it again if it is not on screen
    // showreel films keep playing hidden while they warm up: phones only keep buffering a clip that is playing
    if (films.includes(v)) v._warming = true;
    if (hiddenBox(v.parentElement) || hiddenBox(v.parentElement && v.parentElement.parentElement)) park(v);
    // service clips sit in closed panels: they only download (no hidden playback), so the page stays smooth to scroll
    if (v.paused && !(v.closest('.srv-media') && !v.closest('.srv.open'))) v.play().catch(() => {});
  }
  function stop(v) {
    if (v && v.parentElement === stage) { unpark(v); v.pause(); }
    if (!v || full(v) || !v.getAttribute('src')) return;
    if (!v.paused && v.getBoundingClientRect().width > 0 && v.closest('.win3d') && v.closest('.win3d').style.display === 'block') return;   // never cut a clip that is on screen
    v._src = srcOf(v); v.pause(); v.removeAttribute('src'); v.load();
    const sl = slotOf(v); if (sl) sl.started = false;
  }
  const playable = v => full(v) || (v && v.readyState >= 4);
  const waitFull = (v, tok, max, enough) => new Promise(res => { const t0 = performance.now(); const c = () => { if (tok !== token || (enough ? playable(v) : full(v)) || performance.now() - t0 > max) res(); else setTimeout(c, 150); }; c(); });
  async function run(list, conc, tok, max = 15000, enough = false) {
    let i = 0;
    const worker = async () => { while (i < list.length && tok === token) { const v = list[i++]; if (!v || (enough ? playable(v) : full(v))) continue; start(v); await waitFull(v, tok, max, enough); if (v._warming) { v._warming = false; if (current.name !== "home" || !filmsNear) v.pause(); } if (v.parentElement === stage) { unpark(v); v.pause(); } } };
    await Promise.all(Array.from({ length: conc }, worker));
  }
  // the tower: current window first, then the nearest ones
  function tower(winId) {
    if (!W.ok) return [];
    const first = W.slot(winId), all = defs.map(d => W.slot(d.id)).filter(s => s && s.videoEl);
    all.forEach(s => { s.videoEl._slot = s; s.videoEl._src = s.video; });
    return all.sort((a, b) => (b === first) - (a === first) || (first ? a.center.distanceTo(first.center) - b.center.distanceTo(first.center) : 0)).map(s => s.videoEl);
  }
  function pageClips(r) {
    if (r.name === 'home') return films.slice();
    if (r.name === 'services') return $$('.srv-media video');
    if (r.name === 'contacts') return $$('.cvideo-inline video');
    if (r.name === 'project') return $$('.vframe video');
    return [];
  }
  const rest = r => r.name === 'home' ? [] : films.slice();
  return {
    // every frame: a parked clip whose window or screen comes into view returns home at once (still playing)
    tick() { if (!parked.size) return; for (const v of parked) { const box = v._home; if (box && !hiddenBox(box) && !hiddenBox(box.parentElement)) unpark(v); } },
    // loader + opening flight
    async boot(r) {
      const tok = ++token, t = tower(r.win);
      await run(t.slice(0, 1), 1, tok, 20000);
      if (tok !== token) return;
      const others = t.slice(1);
      // "enough" of the tower: about two thirds ready → the home clips join (one at a time)
      const watch = setInterval(() => { if (tok !== token) return clearInterval(watch); if (others.filter(full).length >= others.length * .66) { clearInterval(watch); run(pageClips(r), 2, tok, 9000, true); } }, 300);
      await run(others, LOW ? 2 : 3, tok);
    },
    // inside a page
    async enter(r) {
      const tok = ++token, t = tower(r.win), mine = [t[0]].concat(pageClips(r));
      t.slice(1).forEach(stop); rest(r).forEach(v => { if (!mine.includes(v)) stop(v); });
      const key = t[0], kSrc = key && srcOf(key), clips = pageClips(r), same = clips.filter(v => srcOf(v) === kSrc), other = clips.filter(v => srcOf(v) !== kSrc);
      same.forEach(v => { if (v.getAttribute('src') && !full(v)) { v._src = srcOf(v); v.removeAttribute('src'); v.load(); } v.preload = 'none'; });
      await run([key], 1, tok, 9000, true);
      if (tok !== token) return;
      await run(other, 3, tok, 9000, true);
      if (tok !== token) return;
      await run([key], 1, tok, 20000);
      if (tok !== token) return;
      await run(same, 1, tok, 9000, true);
      if (tok !== token) return;
      await run(t.slice(1), LOW ? 2 : 3, tok);
      if (tok !== token) return;
      await run(pageClips(r).concat(rest(r)), 2, tok);
    },
  };
})();
function mount(r, keep, defer) {
  const y = keep ? scrollY() : 0;
  io.disconnect(); vio.disconnect(); home = null; scrubs = []; heroIn = null; reel = null;
  films.forEach(v => v.pause());
  document.body.dataset.route = r.name;
  page.innerHTML = r.name === 'home' ? homeHTML() : r.name === 'works' ? worksHTML() : r.name === 'services' ? servicesHTML() : r.name === 'about' ? aboutHTML() : r.name === 'contacts' ? contactHTML() : r.name === 'project' ? projectHTML(r.p) : notFoundHTML();
  if (r.name === 'home') setupHome(); else if (r.name === 'works') setupWorks(); else if (r.name === 'services') setupServices(); else if (r.name === 'project') setupProject(r.p); else if (r.name === 'contacts') setupContact();
  heroIn = $('.hero-win-inner'); hint = $('.scroll-hint');
  $$('[data-r]').forEach(el => io.observe(el)); $$('[data-auto]').forEach(v => vio.observe(v));
  scrubs = $$('[data-scrub]').map(el => ({ el, kind: el.dataset.scrub, words: $$('.word', el), n: -1 }));
  scrim.style.opacity = 0; chrome(); VS.enter(r);
  if (!W.ok) { const fb = $('#fallback-bg'), d = defs.find(x => x.id === r.win); if (d && d.video && fb.dataset.v !== d.video) { fb.dataset.v = d.video; fb.src = d.video; fb.play().catch(() => {}); } }
  if (lenis) { lenis.resize(); lenis.scrollTo(y, { immediate: true, force: true }); } else scrollTo(0, y);
  if (defer) { page.style.opacity = 0; page.style.pointerEvents = 'none'; return; }
  reveal(keep);
}
const toTop = () => { lenis && lenis.scrollTo(0, { immediate: true, force: true }); window.scrollTo(0, 0); document.documentElement.scrollTop = 0; document.body.scrollTop = 0; };
function reveal(keep) {
  if (!keep) toTop();
  page.style.pointerEvents = ''; lenis && lenis.start(); reel && reel.play();
  if (!keep) requestAnimationFrame(() => { if (scrollY() > 2) toTop(); });
  busy = false;
  if (!keep) {
    gsap.fromTo(page, { opacity: 0 }, { opacity: 1, duration: reduce ? 0 : .6, ease: 'power2.out' });
    requestAnimationFrame(() => requestAnimationFrame(() => { const h = $('.hero-win'); h && h.classList.add('in'); }));
    $('#main').focus({ preventScroll: true });
  } else { const h = $('.hero-win'); h && h.classList.add('in', 'now'); }
}

/* ---------- travelling between windows ---------- */
const hud = $('#hud'), shutter = $('#shutter');
const wait = tl => tl.then();
const videosReady = (list, max) => new Promise(res => { const t0 = performance.now(); const chk = () => { if (list.every(v => !v || v.readyState >= 3 || v.error) || performance.now() - t0 > max) res(); else setTimeout(chk, 120); }; chk(); });
let pending = false;
async function go() {
  if (busy) { pending = true; return; }
  const next = routeOf(), prev = current;
  if (next.key === prev.key) return;
  busy = true; lenis && lenis.stop(); closeMenu(); amb._o = 0; amb.style.opacity = 0;
  { const hs = W.ok && W.slot('home'); if (hs && hs.el) { hs.el._fit = false; hs.el.classList.remove('fit'); } }
  const scrolled = scrollY() > 4;
  await wait(gsap.to(page, { opacity: 0, duration: reduce ? 0 : .32, ease: 'power2.in' }));
  page.innerHTML = ''; home = null; films.forEach(v => v.pause()); scrim.style.opacity = 0; progress.style.transform = 'scaleX(0)';
  lenis ? lenis.scrollTo(0, { immediate: true, force: true }) : scrollTo(0, 0);
  current = next; chrome();
  const fly = W.ok && !reduce && prev.win !== next.win;
  if (fly) { mount(next, false, true); await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(r, 60)))); }
  if (W.ok && !reduce) {
    // the yellow shutter only exists while it moves (phones tint their bars with fixed coloured layers)
    if (scrolled) { shutter.style.visibility = 'visible'; await wait(gsap.fromTo(shutter, { scaleY: 0, transformOrigin: '50% 100%' }, { scaleY: 1, duration: .42, ease: 'power3.inOut' })); W.toFill(prev.win); gsap.fromTo(shutter, { scaleY: 1, transformOrigin: '50% 0%' }, { scaleY: 0, duration: .5, ease: 'power3.inOut', delay: .05, onComplete() { shutter.style.visibility = 'hidden'; } }); }
    if (prev.win !== next.win) {
      $('.hud-k').textContent = T('NOW ENTERING'); $('.hud-name').textContent = T(routeLabel(next)); $('.hud-floor').textContent = T('FLOOR') + ' ' + pad(W.floor(next.win));
      gsap.fromTo(hud, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: .5, delay: .35 }); gsap.to(hud, { opacity: 0, y: -20, duration: .4, delay: 2.0 });
      await wait(W.fly(prev.win, next.win));
      if (next.name === 'contacts') await videosReady([W.slot('contacts') && W.slot('contacts').videoEl], 900);
    }
  } else if (W.ok) { W.setActive(next.win); W.toFill(next.win); }
  if (fly) reveal(); else mount(next);
  if (pending) { pending = false; go(); }
}
addEventListener('hashchange', go);

/* ---------- chrome interactions ---------- */
const menuBtn = $('#menu'), nav = $('header nav');
function closeMenu() { nav.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); document.body.classList.remove('menu-open'); }
menuBtn.onclick = () => { const o = nav.classList.toggle('open'); menuBtn.setAttribute('aria-expanded', o); document.body.classList.toggle('menu-open', o); };
$$('[data-language]').forEach(b => b.onclick = () => { if (lang === b.dataset.language) return; lang = b.dataset.language; try { localStorage.setItem('roof-language', lang); } catch (_) {} if (busy) chrome(); else mount(current, true); });
const lb = $('#lightbox'), lbFrame = $('.lb-frame', lb), lbImg = $('img', lbFrame); let lbThumb = null, lbBusy = false;
// locking the page must not change its width (scrollbar gap kept), or the thumbnail would move under the closing photo
function lockScroll(on) { const html = document.documentElement; if (on) { html.style.paddingRight = (innerWidth - html.clientWidth) + 'px'; html.classList.add('lb-lock'); lenis && lenis.stop(); } else { html.classList.remove('lb-lock'); html.style.paddingRight = ''; lenis && lenis.start(); } }
const lbRect = el => { const r = el.getBoundingClientRect(); return { left: r.left, top: r.top, width: r.width, height: r.height }; };
function openLightbox(button) {
  if (lbBusy || lb.open) return; const thumb = $('img', button), small = innerWidth <= 860; lbThumb = button;
  const ratio = thumb.naturalWidth && thumb.naturalHeight ? thumb.naturalWidth / thumb.naturalHeight : 1.5;
  const maxW = innerWidth * (small ? .92 : .84), maxH = innerHeight * (small ? .7 : .78); let w = maxW, h = w / ratio; if (h > maxH) { h = maxH; w = h * ratio; }
  const end = { left: (innerWidth - w) / 2, top: (innerHeight - h) / 2 - (small ? 10 : 14), width: w, height: h };
  lbImg.src = thumb.currentSrc || thumb.src; lbImg.alt = thumb.alt;
  const hi = new Image(); hi.onload = () => { if (lb.open && lbThumb === button) lbImg.src = hi.src; }; hi.src = button.dataset.image;
  const all = $$('[data-image]'); $('.lb-title', lb).textContent = current.p ? T(names(current.p)) : ''; $('.lb-count', lb).textContent = pad(all.indexOf(button) + 1) + ' / ' + pad(all.length);
  lockScroll(true); lb.showModal();
  if (reduce) { Object.assign(lbFrame.style, { left: end.left + 'px', top: end.top + 'px', width: end.width + 'px', height: end.height + 'px' }); return; }
  const start = lbRect(button); button.style.visibility = 'hidden'; lbBusy = true;
  gsap.timeline({ onComplete() { lbBusy = false; } })
    .fromTo($('.lb-bg', lb), { opacity: 0 }, { opacity: 1, duration: .55, ease: 'power2.out' }, 0)
    .fromTo(lbFrame, { ...start, opacity: 1, borderRadius: 6, rotation: -2, boxShadow: '0 0 0 rgba(0,0,0,0)' }, { ...end, borderRadius: 22, rotation: 0, boxShadow: '0 50px 140px rgba(0,0,0,.7)', duration: .85, ease: 'expo.out' }, 0)
    .fromTo(lbImg, { scale: 1.18 }, { scale: 1, duration: 1.1, ease: 'expo.out' }, 0)
    .fromTo([$('.lb-meta', lb), $('.lb-close', lb)], { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: .6, stagger: .08, ease: 'power3.out' }, .3);
}
function closeLightbox() {
  if (!lb.open || lbBusy) return; const button = lbThumb;
  const done = () => { lb.close(); lockScroll(false); if (button) button.style.visibility = ''; gsap.set(lbFrame, { opacity: 1 }); lbBusy = false; };
  if (reduce || !button) { done(); return; }
  lbBusy = true; const back = lbRect(button), radius = parseFloat(getComputedStyle(button).borderTopLeftRadius) || 0;
  gsap.timeline({ onComplete: done })
    .to([$('.lb-close', lb), $('.lb-meta', lb)], { opacity: 0, y: 12, duration: .25, ease: 'power2.in' }, 0)
    .to(lbImg, { keyframes: [{ scale: 1.06, duration: .35, ease: 'power2.out' }, { scale: 1, duration: .5, ease: 'power3.inOut' }] }, 0)
    .to(lbFrame, { ...back, borderRadius: radius, boxShadow: '0 0 0 rgba(0,0,0,0)', duration: .85, ease: 'expo.inOut' }, 0)
    .to(lbFrame, { keyframes: [{ rotation: 1.5, duration: .4, ease: 'sine.inOut' }, { rotation: 0, duration: .45, ease: 'sine.inOut' }] }, 0)
    .to($('.lb-bg', lb), { opacity: 0, duration: .65, ease: 'power2.inOut' }, .12)
    .call(() => { button.style.visibility = ''; }, null, .72)
    .to(lbFrame, { opacity: 0, duration: .18, ease: 'power1.out' }, .8);
}
$('.lb-close', lb).onclick = closeLightbox; $('.lb-bg', lb).onclick = closeLightbox; lb.addEventListener('cancel', e => { e.preventDefault(); closeLightbox(); });
if (fine) {
  document.body.classList.add('has-cursor');
  let tiltEl = null;
  addEventListener('pointermove', e => {
    cur.tx = e.clientX; cur.ty = e.clientY;
    if (!cur.seen) { cur.seen = true; cur.x = cur.tx; cur.y = cur.ty; cur.el.style.transform = `translate3d(${cur.x}px,${cur.y}px,0)`; cur.el.classList.add('seen'); }
    const t = e.target.closest ? e.target.closest('.tilt') : null;
    if (tiltEl && tiltEl !== t) { tiltEl.style.setProperty('--rx', 0); tiltEl.style.setProperty('--ry', 0); }
    tiltEl = t;
    if (t && !reduce) { const r = t.getBoundingClientRect(), nx = (e.clientX - r.left) / r.width - .5, ny = (e.clientY - r.top) / r.height - .5; t.style.setProperty('--ry', (nx * 16).toFixed(2)); t.style.setProperty('--rx', (-ny * 14).toFixed(2)); t.style.setProperty('--mx', ((nx + .5) * 100).toFixed(1) + '%'); t.style.setProperty('--my', ((ny + .5) * 100).toFixed(1) + '%'); }
    const m = e.target.closest ? e.target.closest('.magnet') : null;
    $$('.magnet').forEach(x => { if (x !== m) x.style.translate = ''; });
    if (m && !reduce) { const r = m.getBoundingClientRect(); m.style.translate = `${(e.clientX - r.left - r.width / 2) * .12}px ${(e.clientY - r.top - r.height / 2) * .3}px`; }
  }, { passive: true });
  document.addEventListener('pointerover', e => {
    const c = e.target.closest && e.target.closest('.card,[data-image],.next'), h = e.target.closest && e.target.closest('a,button,summary');
    cur.el.classList.toggle('view', !!c); cur.el.classList.toggle('hot', !!h && !c);
    cur.el.firstElementChild.textContent = c ? T('VIEW') : '';
    const cardEl = e.target.closest && e.target.closest('.card');
    $$('.card video').forEach(v => { if (!cardEl || !cardEl.contains(v)) { if (!v.paused) v.pause(); v.classList.remove('on'); } });
    if (cardEl) { const v = $('video', cardEl); if (v) { if (!v.src) v.src = v.dataset.hover; v.play().then(() => v.classList.add('on')).catch(() => {}); } }
  }, { passive: true });
}

/* ---------- refresh mid-page: after the opening, glide back to the same point ---------- */
try { history.scrollRestoration = 'manual'; } catch (_) {}
addEventListener('pagehide', () => { try { sessionStorage.setItem('roof-scroll', JSON.stringify({ h: location.hash, y: scrollY() })); } catch (_) {} });
function restoreScroll() {
  let s = null; try { s = JSON.parse(sessionStorage.getItem('roof-scroll') || 'null'); sessionStorage.removeItem('roof-scroll'); } catch (_) {}
  const nav = performance.getEntriesByType && performance.getEntriesByType('navigation')[0];
  if (!s || s.h !== location.hash || s.y < 60 || (nav && nav.type !== 'reload')) return false;
  setTimeout(() => {
    lenis && lenis.resize(); const target = Math.min(s.y, limit());
    if (reduce) { lenis ? lenis.scrollTo(target, { immediate: true, force: true }) : scrollTo(0, target); return; }
    if (lenis) lenis.scrollTo(target, { duration: Math.min(4.5, Math.max(1.4, target / 2300)), easing: t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2 });
    else scrollTo({ top: target, behavior: 'smooth' });
  }, 450);
  return true;
}
// Home: once the camera has landed on the window, keep going — through the window and into the room ("We love what we do").
const ROOM_P = .078;
function enterRoom() {
  if (current.name !== 'home' || reduce) return; const target = ROOM_P * limit(); if (scrollY() >= target - 4) return;
  if (lenis) lenis.scrollTo(target, { duration: 2.4, easing: t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2 }); else scrollTo({ top: target, behavior: 'smooth' });
}

/* ---------- boot: loader → the city is built → fly into the window ---------- */
(function boot() {
  const bootEl = $('#boot'), num = $('.boot-num'), bar = $('.boot-track i'), skip = $('#skip-intro'), c = { v: 0 };
  chrome();
  if (W.ok) { W.init(defs); W.attachFaces(faceEls); ambBand(); W.setActive(current.win); W.preload(current.win); } VS.boot(current);
  const setN = () => { num.textContent = String(Math.round(c.v)).padStart(3, '0'); bar.style.transform = `scaleX(${c.v / 100})`; };
  // The loader opens once at least a third of the window clips can play (and the fonts are in), and never lasts more than 3 s.
  // The bar follows the later of "time passed" and "clips ready": both only grow, so it always moves forward, smoothly.
  const MAXT = reduce ? 0 : 3000, MINT = reduce ? 0 : 1100, t0 = performance.now();
  const winVids = () => defs.filter(d => d.video).map(d => W.ok && W.slot(d.id) && W.slot(d.id).videoEl).filter(Boolean);
  let fontsOk = !document.fonts; if (document.fonts) document.fonts.ready.then(() => { fontsOk = true; });
  const ready = new Promise(res => {
    const step = () => {
      const el = performance.now() - t0, vs = winVids(), need = Math.max(1, Math.ceil(vs.length / 3)), n = vs.filter(v => v.readyState >= 3).length;
      const target = Math.min(94, Math.max(el / Math.max(MAXT, 1) * 94, vs.length ? Math.min(n / need, 1) * 94 : 94));
      c.v += (Math.max(target, c.v) - c.v) * .1; setN();
      if (el >= MAXT || (el >= MINT && fontsOk && n >= need)) res(); else requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
  ready.then(() => {
    gsap.to(c, { v: 100, duration: reduce ? 0 : .45, ease: 'power1.out', onUpdate: setN, onComplete() {
      $('.boot-label').textContent = T('READY TO EXPERIENCE');
      const done = () => { document.body.classList.remove('is-booting', 'is-intro'); skip.remove(); mount(current); restoreScroll(); if (pending || routeOf().key !== current.key) { pending = false; go(); } };
      if (!W.ok || reduce) { W.ok && W.intro(current.win, true); gsap.to(bootEl, { opacity: 0, duration: .4, onComplete() { bootEl.remove(); } }); done(); return; }
      document.body.classList.add('is-intro');
      const intro = W.intro(current.win); intro.then(done);
      skip.onclick = () => intro.timeScale(9);
      gsap.timeline({ onComplete() { bootEl.remove(); } })
        .to('.boot-row,.boot-track', { opacity: 0, y: -16, duration: .35, stagger: .05 }, .1)
        .to('.boot-logo', { scale: 1.8, opacity: 0, filter: 'blur(14px)', duration: .9, ease: 'power3.in' }, .15)
        .to(bootEl, { backgroundColor: 'rgba(7,8,11,0)', duration: 1.3, ease: 'power2.inOut' }, .35);
    } });
  });
})();
})();
