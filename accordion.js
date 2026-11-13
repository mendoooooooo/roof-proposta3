(() => {
  const states = new WeakMap();
  document.addEventListener('click', event => {
    const summary = event.target.closest('.services-list > details > summary');
    if (!summary || !window.gsap || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    event.preventDefault();
    const panel = summary.parentElement;
    const content = panel.querySelector('.service-body');
    if (!content) return;
    const previous = states.get(panel);
    const opening = previous ? !previous.opening : !panel.open;
    const currentHeight = panel.getBoundingClientRect().height;
    previous?.animation.kill();
    gsap.killTweensOf(content.children);
    panel.style.height = '';
    panel.open = true;
    const expandedHeight = panel.getBoundingClientRect().height;
    const collapsedHeight = summary.getBoundingClientRect().height +
      parseFloat(getComputedStyle(panel).borderTopWidth || 0) +
      parseFloat(getComputedStyle(panel).borderBottomWidth || 0);
    panel.style.height = currentHeight + 'px';
    panel.style.overflow = 'hidden';
    summary.setAttribute('aria-expanded', String(opening));
    // Only one service open at a time: opening this one closes the others, with the same smooth animation.
    if (opening) panel.parentElement.querySelectorAll(':scope > details').forEach(other => {
      if (other === panel) return;
      const state = states.get(other);
      if (state ? state.opening : other.open) other.querySelector('summary').click();
    });
    const icon = summary.querySelector('span');
    if (icon) gsap.fromTo(icon, {rotation: previous ? gsap.getProperty(icon, 'rotation') : (opening ? 0 : 45)},
      {rotation: opening ? 45 : 0, duration: .4, ease: 'power2.inOut', overwrite: true});
    const animation = gsap.timeline({onComplete: () => {
      panel.open = opening;
      panel.style.height = '';
      panel.style.overflow = '';
      gsap.set(content.children, {clearProps:'opacity,transform'});
      states.delete(panel);
      if (!opening) panel.querySelectorAll('video').forEach(video => video.pause());
      window.ScrollTrigger?.refresh();
    }});
    states.set(panel, {opening, animation});
    animation.to(panel, {height: opening ? expandedHeight : collapsedHeight,
      duration: opening ? .65 : .45, ease:'power3.inOut'}, 0);
    if (opening) {
      animation.fromTo(content.children, {y:18, opacity:0},
        {y:0, opacity:1, stagger:.09, duration:.45, ease:'power2.out'}, .18);
      panel.querySelectorAll('video').forEach(video => video.play().catch(() => {}));
    } else {
      animation.to(content.children, {y:-8, opacity:0, duration:.2, ease:'power1.out'}, 0);
    }
  });
})();
