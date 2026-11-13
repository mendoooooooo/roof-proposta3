/* Scroll memory.
   - Refresh in the middle of a page: the site reopens at the top, then glides smoothly down to the exact point you were at.
   - Browser "back" (or "forward"): the page opens at the top, then glides down to where you were before leaving it. */
(() => {
  const KEY = 'roof-scroll', MAP = 'roof-scroll-map';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const store = { get(k) { try { return JSON.parse(sessionStorage.getItem(k) || 'null'); } catch (_) { return null; } },
                  set(k, v) { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch (_) {} } };
  // the browser must not jump on its own: the setting belongs to each history entry, and every hash change creates one
  const manual = () => { try { history.scrollRestoration = 'manual'; } catch (_) {} };
  manual();

  // every history entry gets an id; the last scroll position of each entry is remembered
  const positions = store.get(MAP) || {};
  let nextId = Math.max(0, ...Object.keys(positions).map(Number)) + 1;
  const idOf = () => {
    const st = history.state;
    if (st && st.roofId) return { id: st.roofId, known: true };
    const id = nextId++;
    try { history.replaceState(Object.assign({}, st || {}, { roofId: id }), ''); } catch (_) {}
    return { id, known: false };
  };
  let current = idOf().id, frozen = false, lastY = scrollY;
  addEventListener('scroll', () => { if (!frozen) { lastY = scrollY; positions[current] = Math.round(scrollY); } }, { passive: true });

  let glideToken = 0;
  const glide = target => {
    const token = ++glideToken;
    const maxY = () => Math.max(0, document.documentElement.scrollHeight - innerHeight);
    if (reduce) { scrollTo({ top: Math.min(target, maxY()), behavior: 'instant' }); return; }
    let cancelled = false;
    const stop = () => { cancelled = true; };
    ['wheel', 'touchstart', 'keydown', 'pointerdown'].forEach(t => addEventListener(t, stop, { passive: true, once: true }));
    const duration = Math.min(3200, 1100 + target * 0.35), t0 = performance.now();
    const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    const step = now => {
      if (cancelled || token !== glideToken) return;
      const p = Math.min(1, (now - t0) / duration);
      // the target is re-read every frame, so images that finish loading never make it overshoot
      scrollTo({ top: Math.min(target, maxY()) * ease(p), behavior: 'instant' });
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  // ---- back / forward ----
  addEventListener('hashchange', () => {
    manual();
    if (/^#(main|selected|project-details)$/.test(location.hash)) { current = idOf().id; return; } // in-page jumps, not a new page
    glideToken++;                                  // a glide still running on the old page stops here
    positions[current] = Math.round(lastY);         // the page being left keeps its last position
    frozen = true;                                  // the dissolve and the new render must not overwrite it
    const entry = idOf();
    current = entry.id;
    const target = entry.known ? positions[current] || 0 : 0;
    store.set(MAP, positions);
    const oldFirst = document.querySelector('main').firstElementChild;
    // wait until the new page is on screen and has faded in, then glide down from the top
    const t0 = performance.now();
    const wait = () => {
      const swapped = document.querySelector('main').firstElementChild !== oldFirst;
      if (!swapped && performance.now() - t0 < 4000) { setTimeout(wait, 60); return; }
      setTimeout(() => {
        frozen = false; lastY = scrollY;
        if (target > 40) glide(target);
      }, swapped ? 450 : 0);
    };
    wait();
  });

  // ---- refresh ----
  addEventListener('pagehide', () => {
    manual();
    if (!frozen) positions[current] = Math.round(scrollY);
    store.set(MAP, positions);
    store.set(KEY, { hash: location.hash, y: frozen ? 0 : Math.round(scrollY) });
  });
  const saved = store.get(KEY);
  try { sessionStorage.removeItem(KEY); } catch (_) {}
  if (!saved || saved.hash !== location.hash || saved.y < 40) return;
  frozen = true;
  scrollTo({ top: 0, behavior: 'instant' });
  // start once the loader has opened and the page has settled
  const ready = () => !document.body.classList.contains('is-loading') && !document.body.classList.contains('is-revealing');
  const t0 = performance.now();
  const wait = () => {
    if (scrollY) scrollTo({ top: 0, behavior: 'instant' }); // keep the browser from restoring the position on its own
    if (ready() || performance.now() - t0 > 9000) setTimeout(() => { frozen = false; glide(saved.y); }, 350);
    else setTimeout(wait, 80);
  };
  wait();
})();
