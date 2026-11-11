// Regia della pagina Cremglassé (standard Marmo, base Ciclista): preloader corto, scroll morbido, vetrina orizzontale,
// HUD a orario d'apertura (09:00 → 18:00, i loro orari), lista attiva delle formule, contatori, modulo sempre in vista, cursore.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const foto = document.documentElement.classList.contains('foto');
  const ridotto = foto || matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile = () => innerWidth <= 860;
  window.SCROLL = {y: 0, v: 0, p: 0};
  document.body.classList.add('carica');

  /* ---------- contenuti: foto e testi dal loro sito ---------- */
  const DENTRO = [
    {f: 'design', img: 'banco', tag: 'Il banco', h: 'Mantecatore a vista', t: 'Il cliente assiste alla creazione del gelato, sempre fresco al banco.'},
    {f: 'prodotti', img: 'cono', tag: 'Gelato', h: 'Il gelato mantecato', t: 'Coni e coppette dal banco a vista.'},
    {f: 'design', img: 'lichene', tag: 'Design', h: 'Lichene naturale', t: 'Un ambiente europeo, elegante e moderno, con un tocco di jungle.'},
    {f: 'prodotti', img: 'coppetta', tag: 'Gelato', h: 'Coppette e semifreddi', t: 'Prodotti nel negozio, ogni giorno.'},
    {f: 'design', img: 'poltrone', tag: 'Saletta', h: 'La saletta', t: 'Saletta interna e dehor con servizio al tavolo, nella formula Large.'},
    {f: 'prodotti', img: 'waffle', tag: 'Gourmanderie', h: 'Waffle e gaufre', t: 'La gaufre belga, accanto al gelato.'},
    {f: 'design', img: 'archi', tag: 'Il locale', h: 'Il bancone', t: 'Arredi progettati e prodotti da Arredi & Design Food.'},
    {f: 'prodotti', img: 'macarons', tag: 'Gourmanderie', h: 'Macarons', t: 'Pasticceria francese.'},
    {f: 'design', img: 'centrifughe', tag: 'Frutteria', h: 'Frutteria e centrifughe', t: 'L\'angolo frutteria, in entrambe le formule.'},
    {f: 'prodotti', img: 'torta', tag: 'Bakery', h: 'Torte', t: 'Dal banco bakery.'},
    {f: 'design', img: 'sgabelli', tag: 'Il locale', h: 'Le pareti', t: 'Aromi, musica e colori pensati per far viaggiare chi entra.'},
    {f: 'prodotti', img: 'lamponi', tag: 'Dolci', h: 'Panna e lamponi', t: 'Dolci al cucchiaio.'},
    {f: 'design', img: 'vetrina', tag: 'L\'ingresso', h: 'La vetrina', t: 'L\'insegna Cremglassé, gelateria e gourmanderie.'},
    {f: 'prodotti', img: 'gourmanderie', tag: 'Caffetteria', h: 'Donuts e caffetteria', t: 'Banco caffetteria, nella formula Large.'}
  ];
  const binario = $('#binario');
  binario.innerHTML = DENTRO.map((d, i) => `
    <div class="carta" data-f="${d.f}" data-cur="vedi">
      <div class="foto"><span class="n mono">${String(i + 1).padStart(2, '0')}</span><span class="tag">${d.tag}</span>
        <img src="img/${d.img}.webp" alt="${d.h}" loading="lazy"></div>
      <div class="info"><h3>${d.h}</h3><span class="tipo">${d.t}</span></div>
    </div>`).join('') + `
    <a class="carta fine" href="https://arredi-design.com" target="_blank" rel="noopener" data-cur="link">
      <span class="mono" style="color:var(--oro)">La capogruppo</span>
      <div><span class="grande">30+</span><h3>anni di falegnameria per bar, gelaterie e ristoranti.</h3><p style="margin-top:14px">Arredi &amp; Design Food S.r.l., Torino.</p></div>
      <span class="btn btn-bianco btn-s" style="align-self:flex-start">arredi-design.com</span>
    </a>`;

  const NEGOZI = ['Roma EUR', 'Arezzo', 'Pietra Ligure', 'Loano', 'Beinasco', 'Front', 'Bulle CH', 'Torino', 'Asti', 'Carpi', 'Verona', 'Gallarate', 'Pesaro', 'Castelnuovo Don Bosco', 'Chieri', 'Novi Ligure', 'Savigliano', 'Cittadella', 'Münster DE', 'Tricase', 'Trento', 'Dubai', 'Sharjah', 'Santarcangelo di Romagna'];
  const giro = NEGOZI.map(n => `<span>${n}</span><i>✦</i>`).join('');
  $('#nastro').innerHTML = giro + giro;

  /* ---------- modulo: un template, montato nella sezione finale e nel cassetto ---------- */
  const tpl = $('#tplModulo');
  ['#moduloFinale', '#moduloCassetto'].forEach(s => $(s).appendChild(tpl.content.cloneNode(true)));
  $$('.modulo').forEach((f, k) => {
    $$('input[type=radio]', f).forEach(r => r.name += k);   // gruppi separati tra i due moduli
    f.addEventListener('submit', e => { e.preventDefault(); f.classList.add('inviato'); });
  });
  const body = document.body;
  function apri(formula) {
    const f = $('#moduloCassetto .modulo');
    f.classList.remove('inviato');
    if (formula) { const r = $$('input[type=radio]', f).find(x => x.value === formula); if (r) r.checked = true; }
    body.classList.add('aperto'); $('#cassetto').setAttribute('aria-hidden', 'false');
    lenis && lenis.stop();
    setTimeout(() => $('input', f).focus({preventScroll: true}), 500);
  }
  function chiudi() { body.classList.remove('aperto'); $('#cassetto').setAttribute('aria-hidden', 'true'); lenis && lenis.start(); }
  $$('[data-apri]').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); apri(b.dataset.apri); }));
  $('#chiudi').addEventListener('click', chiudi); $('#velo').addEventListener('click', chiudi);
  addEventListener('keydown', e => e.key === 'Escape' && chiudi());

  /* ---------- preloader corto: la pallina si riempie, la linea taglia, si apre in due ---------- */
  const preN = $('#preN'), preOra = $('#preOra'), pre = $('#pre'), riempi = $('#preRiempi');
  const ora = m => String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(Math.round(m % 60)).padStart(2, '0');
  const fontPronti = document.fonts ? document.fonts.ready : Promise.resolve();
  // il preloader aspetta solo i font (massimo 1,4 s): il cono 3D si carica dopo, così testo e pulsante arrivano subito
  const fontMax = new Promise(r => setTimeout(r, 1400));
  let pronti = false; Promise.race([fontPronti, fontMax]).then(() => pronti = true);
  const t0 = performance.now();
  (function conta(t) {
    const min = ridotto ? 1 : 1100;
    let p = Math.min(Math.max((t - t0) / min, 0), 1);
    if (!pronti && !foto) p = Math.min(p, .92);
    const v = foto ? 100 : Math.round((1 - Math.pow(1 - p, 2.2)) * 100);
    preN.textContent = String(v).padStart(3, '0');
    preOra.textContent = 'ORE ' + ora(540 + v * 5.4);
    riempi.setAttribute('y', 72 - v * .6); riempi.setAttribute('height', v * .6);
    if (v < 100) return requestAnimationFrame(conta);
    pre.classList.add('taglio');
    setTimeout(() => { pre.classList.add('via'); body.classList.remove('carica'); body.classList.add('pronto'); window.APERTO = true; window.dispatchEvent(new Event('apertura')); caricaCono(); }, ridotto ? 0 : 450);
    setTimeout(() => pre.remove(), ridotto ? 0 : 1900);
  })(t0);

  // three.js e la scena del cono: dopo l'apertura, quando la pagina è già leggibile
  function caricaCono() {
    if (window.__cono) return; window.__cono = 1;
    const go = () => { const m = document.createElement('script'); m.type = 'module'; m.src = 'js/cono.js'; document.body.appendChild(m); };
    'requestIdleCallback' in window ? requestIdleCallback(go, {timeout: 600}) : setTimeout(go, 200);
  }

  /* ---------- scroll morbido (solo mouse), Lenis caricato dopo ---------- */
  let lenis = null;
  if (!ridotto && matchMedia('(pointer:fine)').matches) {
    const s = document.createElement('script'); s.src = 'https://unpkg.com/lenis@1.1.13/dist/lenis.min.js';
    s.onload = () => { lenis = new Lenis({lerp: .09, wheelMultiplier: .95}); lenis.on('scroll', suScroll); (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(performance.now()); };
    document.head.appendChild(s);
  }
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href'); const el = id.length > 1 && $(id);
    if (!el && id !== '#top') return;
    e.preventDefault();
    lenis ? lenis.scrollTo(id === '#top' ? 0 : el, {offset: -10, duration: 1.4}) : (id === '#top' ? scrollTo({top: 0, behavior: 'smooth'}) : el.scrollIntoView({behavior: 'smooth'}));
  }));

  /* ---------- vetrina orizzontale bloccata ---------- */
  const vetrina = $('#dentro'), vista = $('.binario-vista'), barra = $('#barra'), cIdx = $('#cIdx'), cTot = $('#cTot');
  let corsa = 0;
  function misura() {
    if (mobile()) { vetrina.style.removeProperty('--h'); binario.style.transform = ''; return; }
    corsa = Math.max(0, binario.scrollWidth - innerWidth);
    vetrina.style.setProperty('--h', (innerHeight + corsa * 1.05) + 'px');
  }
  function aggiornaContatore(prog) {
    const visibili = $$('.carta:not(.fuori):not(.fine)', binario);
    cTot.textContent = String(visibili.length).padStart(2, '0');
    cIdx.textContent = String(Math.min(visibili.length, Math.max(1, Math.round(prog * (visibili.length - 1)) + 1))).padStart(2, '0');
  }
  $$('.filtri button').forEach(b => b.addEventListener('click', () => {
    $$('.filtri button').forEach(x => x.classList.toggle('on', x === b));
    const f = b.dataset.f;
    $$('.carta:not(.fine)', binario).forEach(c => c.classList.toggle('fuori', f !== 'tutto' && c.dataset.f !== f));
    misura();
    if (!mobile()) { const top = vetrina.getBoundingClientRect().top + scrollY; lenis ? lenis.scrollTo(top, {immediate: true}) : scrollTo(0, top); }
    else vista.scrollTo({left: 0, behavior: 'smooth'});
    aggiornaContatore(0);
  }));
  vista.addEventListener('scroll', () => { if (mobile()) { const p = vista.scrollLeft / Math.max(1, vista.scrollWidth - vista.clientWidth); barra.style.width = p * 100 + '%'; aggiornaContatore(p); } }, {passive: true});
  addEventListener('resize', misura); addEventListener('load', misura); misura(); aggiornaContatore(0);

  /* ---------- HUD, sezione attiva, fondo scuro, richiesta in vista ---------- */
  const sezioni = $$('[data-sez]'), sezEl = $('#sez'), oraEl = $('#ora'), hudEm = $('.hud-sez em');
  const menu = $$('.menu a'), nav = $('.nav'), flott = $('.flottante'), barraTel = $('.barra-tel'), richiesta = $('#richiesta');
  let ultimoY = 0, ultimaV = 0, ultimoT = performance.now();
  function suScroll() {
    const y = scrollY, H = document.documentElement.scrollHeight - innerHeight;
    const t = performance.now(); const dt = Math.max(1, t - ultimoT);
    SCROLL.v = SCROLL.v * .8 + ((y - ultimaV) / dt) * .2; ultimaV = y; ultimoT = t;
    SCROLL.y = y; SCROLL.p = H > 0 ? y / H : 0;
    oraEl.textContent = ora(540 + SCROLL.p * 540);
    hudEm.style.setProperty('--p', SCROLL.p * 100 + '%');
    const mid = innerHeight * .5;
    let att = sezioni[0];
    for (const s of sezioni) if (s.getBoundingClientRect().top <= mid) att = s;
    if (sezEl.textContent !== att.dataset.sez) sezEl.textContent = att.dataset.sez;
    body.classList.toggle('su-scuro', att.classList.contains('scura'));
    menu.forEach(a => a.classList.toggle('on', att.id && a.getAttribute('href') === '#' + att.id));
    nav.classList.toggle('nascosta', y > ultimoY && y > innerHeight * .8);
    ultimoY = y;
    const suModulo = richiesta.getBoundingClientRect().top < innerHeight * .75;
    flott.classList.toggle('su', y > innerHeight * .7 && !suModulo);
    barraTel.classList.toggle('via', suModulo);
    if (!mobile() && corsa) {
      const r = vetrina.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, -r.top / (vetrina.offsetHeight - innerHeight)));
      binario.style.transform = `translate3d(${-p * corsa}px,0,0)`;
      barra.style.width = p * 100 + '%';
      aggiornaContatore(p);
    }
  }
  addEventListener('scroll', () => { if (!lenis) suScroll(); }, {passive: true});
  suScroll();

  /* ---------- formule: la riga attiva cambia la foto nell'arco ---------- */
  const forImg = $('#forImg');
  function attiva(riga) {
    if (riga.classList.contains('on')) return;
    $$('.riga-for').forEach(r => r.classList.toggle('on', r === riga));
    const src = `img/${riga.dataset.img}.webp`;
    forImg.classList.add('cambia');
    setTimeout(() => { forImg.src = src; forImg.onload = () => forImg.classList.remove('cambia'); }, 220);
    misura();
  }
  $$('.riga-for').forEach(r => { r.addEventListener('mouseenter', () => matchMedia('(hover:hover)').matches && attiva(r)); r.addEventListener('click', () => attiva(r)); });

  /* ---------- contatori ---------- */
  const fmt = n => n.toLocaleString('it-IT');
  function conta(el) {
    const fine = +el.dataset.conta, t0 = performance.now();
    if (ridotto || fine === 0) { el.textContent = fmt(fine); return; }
    (function f(t) { const p = Math.min((t - t0) / 1600, 1); el.textContent = fmt(Math.round(fine * (1 - Math.pow(1 - p, 4)))); if (p < 1) requestAnimationFrame(f); })(t0);
  }
  const ioN = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { conta(e.target); ioN.unobserve(e.target); } }), {threshold: .4});
  $$('[data-conta]').forEach(el => foto ? (el.textContent = fmt(+el.dataset.conta)) : ioN.observe(el));

  /* ---------- testi che entrano ---------- */
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), {rootMargin: '0px 0px -12% 0px'});
  $$('.rivela').forEach(el => {
    if (el.closest('.hero')) return;
    const fratelli = [...el.parentElement.children].filter(x => x.classList.contains('rivela'));
    if (fratelli.length > 2) el.style.transitionDelay = fratelli.indexOf(el) * .08 + 's';
    io.observe(el);
  });
  const passi = $('.passi'); new IntersectionObserver((es, o) => es.forEach(e => { if (e.isIntersecting) { passi.classList.add('in'); $$('li', passi).forEach((li, i) => setTimeout(() => li.classList.add('in'), 250 + i * 250)); o.disconnect(); } }), {threshold: .3}).observe(passi);
  addEventListener('apertura', () => $$('.hero .rivela').forEach(el => el.classList.add('in')));

  /* ---------- cursore ---------- */
  if (matchMedia('(hover:hover) and (pointer:fine)').matches && !ridotto) {
    body.classList.add('cur-on');
    const c = $('#cursore'), punto = $('.punto', c), anello = $('.anello', c);
    let mx = innerWidth / 2, my = innerHeight / 2, ax = mx, ay = my;
    addEventListener('mousemove', e => { c.classList.add('vivo'); mx = e.clientX; my = e.clientY; punto.style.transform = `translate(${mx}px,${my}px)`; });
    (function segui() { ax += (mx - ax) * .16; ay += (my - ay) * .16; anello.style.transform = `translate(${ax}px,${ay}px)`; requestAnimationFrame(segui); })();
    document.addEventListener('mouseover', e => {
      const el = e.target.closest('[data-cur], a, button, label');
      c.className = 'vivo ' + (!el ? '' : (el.dataset.cur === 'vedi' ? 'vedi' : 'link'));
    });
  }
})();
