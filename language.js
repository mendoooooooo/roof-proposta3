/* Local bilingual copy: no network translation, no DOM rebuild, no video restart. */
(() => {
  const dictionary = window.ROOF_ITALIAN || {};
  let language = 'en';
  try { language = localStorage.getItem('roof-language') === 'it' ? 'it' : 'en'; } catch (_) {}
  const originals = new WeakMap();
  function translate(value) {
    const key = value.trim();
    let replacement = dictionary[key];
    if (replacement === undefined) {
      if (/^Show /.test(key)) replacement = key.replace(/^Show /, 'Mostra ');
      else if (/^Enlarge .+ image \d+$/.test(key)) replacement = key.replace(/^Enlarge /, 'Ingrandisci ').replace(/ image (\d+)$/, ' — immagine $1');
      else if (/ — project photography$/.test(key)) replacement = key.replace(/ — project photography$/, ' — fotografia del progetto');
      else if (/ — image \d+$/.test(key)) replacement = key.replace(/ — image /, ' — immagine ');
    }
    return replacement === undefined ? value : value.replace(key, replacement);
  }
  function update(node, attribute) {
    const current = attribute ? node.getAttribute(attribute) : node.nodeValue;
    if (!current) return;
    let records = originals.get(node);
    if (!records) { records = {}; originals.set(node, records); }
    const key = attribute || '#text';
    let record = records[key];
    if (!record || current !== record.last) record = records[key] = { source: current, last: current };
    const result = language === 'it' ? translate(record.source) : record.source;
    record.last = result;
    if (result !== current) {
      if (attribute) node.setAttribute(attribute, result);
      else node.nodeValue = result;
    }
  }
  function apply(root) {
    if (root.nodeType === 3) {
      if (!root.parentElement?.closest('script,style,[data-language-switch]')) update(root);
      return;
    }
    if (root.nodeType !== 1 || root.closest('script,style,[data-language-switch]')) return;
    for (const attr of ['aria-label', 'alt', 'title']) if(root.hasAttribute(attr)) update(root, attr);
    root.childNodes.forEach(apply);
  }
  function metadata() {
    document.documentElement.lang = language;
    document.querySelectorAll('[data-language]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.language === language));
    });
    const path = location.hash.replace(/^#\/?/, '').split('/')[0];
    const titles = {works:'Progetti',services:'Servizi',about:'Studio',contacts:'Contatti',project:'Progetto'};
    document.title = language === 'it' ? (titles[path] ? titles[path] + ' — ' : '') + 'ROOF | Amiamo quello che facciamo' : (path && !['main','selected'].includes(path) ? path.charAt(0).toUpperCase()+path.slice(1)+' — ' : '') + 'ROOF | We love what we do';
    document.querySelector('meta[name="description"]').content = language === 'it' ? 'ROOF — contenuti digitali, live visuals e ambienti 3D. Una proposta indipendente di restyling.' : 'ROOF — digital content creation, live visuals and 3D environments. An independent redesign proposal.';
  }
  const observer = new MutationObserver(records => {
    observer.disconnect();
    records.forEach(record => {
      if(record.type === 'childList') record.addedNodes.forEach(apply);
      else if(record.type === 'characterData') apply(record.target);
      else update(record.target, record.attributeName);
    });
    metadata();
    watch();
  });
  function watch(){observer.observe(document.body, {subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['aria-label','alt','title']});}
  document.querySelectorAll('[data-language]').forEach(button => button.addEventListener('click', () => {
    if(language === button.dataset.language) return;
    language = button.dataset.language;
    try { localStorage.setItem('roof-language', language); } catch (_) {}
    observer.disconnect(); apply(document.body); metadata(); watch();
    requestAnimationFrame(() => {
      document.querySelectorAll('details[open]').forEach(detail => { if(!detail.classList.contains('is-animating')) detail.style.height = 'auto'; });
      window.ScrollTrigger?.refresh();
      window.dispatchEvent(new Event('scroll'));
    });
  }));
  apply(document.body); metadata(); watch();
})();
