(() => {
  const overlay = document.getElementById('boot-loader');
  const hero = document.querySelector('.brand-video');
  const startedAt = performance.now();
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let finished = false;
  let fallback;
  const reveal = () => {
    if (finished) return;
    finished = true;
    clearTimeout(fallback);
    window.removeEventListener('hashchange', reveal);
    // Keep a short intentional intro even when the video is already cached.
    const minimumIntro = reducedMotion ? 0 : 650;
    setTimeout(() => {
      overlay.classList.add('is-complete');
      overlay.querySelector('.boot-label').textContent = 'READY TO EXPERIENCE';
      if (window.gsap && !reducedMotion) {
        gsap.set([overlay, ...overlay.children], {transition:'none'});
        const finish = () => {overlay.remove();document.body.classList.remove('is-loading','is-revealing');};
        gsap.timeline({onComplete:finish})
          .to('.boot-track',{scaleX:1.2,duration:.25,ease:'power2.out'},.1)
          .to('.boot-logo',{y:-70,scale:1.6,opacity:0,filter:'blur(12px)',duration:.85,ease:'power3.inOut'},.4)
          .to(['.boot-label','.boot-track'],{y:-20,opacity:0,duration:.35,stagger:.06},.45)
          .call(()=>{document.body.classList.remove('is-loading');document.body.classList.add('is-revealing');overlay.setAttribute('aria-hidden','true');},null,.65)
          .to(overlay,{clipPath:'inset(0 0 100% 0)',duration:1,ease:'power4.inOut'},.65);
        return;
      }
      setTimeout(() => {
        document.body.classList.add('is-revealing');
        document.body.classList.remove('is-loading');
        overlay.classList.add('is-exiting');
        overlay.setAttribute('aria-hidden', 'true');
        setTimeout(() => {
          overlay.remove();
          document.body.classList.remove('is-revealing');
        }, reducedMotion ? 0 : 1200);
      }, reducedMotion ? 0 : 420);
    }, Math.max(0, minimumIntro - (performance.now() - startedAt)));
  };
  if (!hero) { reveal(); return; }
  // Keep navigation available even if the external media server is unreachable.
  fallback = setTimeout(reveal, 8000);
  window.addEventListener('hashchange', reveal, { once: true });
  hero.addEventListener('error', reveal, { once: true });
  const frameReady = () => {
    if (hero.readyState < 2 || finished) return;
    if ('requestVideoFrameCallback' in hero && !hero.paused) {
      hero.requestVideoFrameCallback(reveal);
    } else {
      requestAnimationFrame(() => requestAnimationFrame(reveal));
    }
  };
  hero.addEventListener('loadeddata', frameReady, { once: true });
  hero.addEventListener('playing', frameReady, { once: true });
  frameReady();
})();
