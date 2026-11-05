/* Dépannage 60 — effets propres au client (direction « Deux réseaux »). Le socle gère l'ouverture, le voile, l'en-tête,
   le menu, le mode calme, les boucles, les mesures et la bibliothèque d'effets (lignes, cascade, rideau, parallaxe, zoom,
   trace, galerie, onde, magnétique). Chaque effet propre porte data-effet="nom-du-plan" :
   mise-en-service (intro), deux-reseaux (fil rouge), eau, manometre, interrupteurs, goutte-prix, vannes, derriere-le-mur,
   raccords, ondes-60, ruban, etiquettes, carrelage, prise-branchee. */
import { demarrer, boucle, etat, rafraichir, quand } from './socle/index.js?v=1';

const gsap = window.gsap;
const ST = () => window.ScrollTrigger;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const pageCle = document.documentElement.dataset.page;
const calme = () => etat.calme;
const large = () => window.matchMedia('(min-width: 901px)').matches;
const PAGES = [];
const fmt = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

/* ---------- Intro « mise-en-service » : tuyau et câble se rejoignent, le nom se remplit d'eau, 60 s'allume ---------- */
function vague(niveau, phase) {
  /* Bord de l'eau : sinus sur 21 points, niveau en % (100 = vide, -8 = plein). */
  const pts = [];
  for (let i = 0; i <= 20; i++) { const x = i * 5; pts.push(`${x}% ${(niveau + Math.sin(i * 0.9 + phase) * 4).toFixed(2)}%`); }
  return `polygon(0% 100%, 100% 100%, ${pts.reverse().join(', ')})`;
}

function intro() {
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  const p = $('[data-ouverture]');
  if (!p) return tl;
  p.dataset.effet = 'mise-en-service';
  const eau = $('.ouv-eau', p), lum = $('.ouv-60-lum', p), chiffre = $('[data-ouv-chiffre]', p);
  const etatEau = { n: 100, ph: 0 }, compte = { v: 0 };
  tl.fromTo($$('.ouv-tuyau, .ouv-tuyau-eau', p), { strokeDashoffset: 1, strokeDasharray: '1 1' }, { strokeDashoffset: 0, duration: 0.7, ease: 'power2.inOut' }, 0.1)
    .fromTo($('.ouv-cable', p), { strokeDashoffset: 1, strokeDasharray: '1 1' }, { strokeDashoffset: 0, duration: 0.7, ease: 'power2.inOut' }, 0.18)
    .fromTo($('.ouv-losanges', p), { y: -14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, 0.05)
    .to(etatEau, { n: -8, ph: 7, duration: 0.95, ease: 'power1.inOut', onUpdate: () => { eau.style.clipPath = vague(etatEau.n, etatEau.ph); } }, 0.6)
    .fromTo(lum, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: 'power2.in' }, 1.15)
    .fromTo($('.ouv-mano', p), { '--angle': '-120deg' }, { '--angle': '60deg', duration: 0.9, ease: 'back.out(1.6)' }, 0.75)
    .fromTo(compte, { v: 0 }, { v: 45, duration: 0.9, ease: 'power2.out', onUpdate: () => { if (chiffre) chiffre.textContent = fmt(compte.v); } }, 0.75)
    .to($$('.ouv-scene, .ouv-reseaux', p), { opacity: 0, duration: 0.22, ease: 'power1.in' }, 1.8)
    .to($('.ouv-haut', p), { yPercent: -101, duration: 0.6, ease: 'power4.inOut' }, 1.8)
    .to($('.ouv-bas', p), { yPercent: 101, duration: 0.6, ease: 'power4.inOut' }, 1.8);
  return tl;
}

/* ---------- Ouverture propre à chaque page (après l'intro, ou pendant le retrait du voile) ---------- */
const OUVERTURES = {
  accueil(tl, t) {
    tl.fromTo('.hero-ligne', { yPercent: 135, opacity: 1 }, { yPercent: 0, opacity: 1, duration: 0.65, stagger: 0.08, ease: 'power4.out' }, t)
      .fromTo('.hero .surtitre, .hero-texte, .hero-actions, .hero-info', { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.05 }, t + 0.15)
      .fromTo('.hero-mano', { '--angle': '-120deg' }, { '--angle': '60deg', duration: 0.7, ease: 'back.out(1.7)' }, t + 0.3);
  },
};
function ouvrirPage(tl, t) { const f = OUVERTURES[pageCle]; if (f && gsap) f(tl, t); return tl; }
function etatFinalPages() {
  if (!gsap) return;
  gsap.set('.hero-ligne, .hero .surtitre, .hero-texte, .hero-actions, .hero-info', { clearProps: 'transform,opacity' });
  $$('.hero-mano').forEach((m) => m.style.removeProperty('--angle'));
  ETATS_FINAUX.forEach((f) => { try { f(); } catch (e) { console.error(e); } });
}
const ETATS_FINAUX = [];

/* ---------- Fil rouge « deux-reseaux » : tuyau bleu et câble jaune dans la marge, raccordés à chaque section ---------- */
function deuxReseaux() {
  const main = $('main');
  const cibles = $$('[data-raccord-cible]', main);
  if (!main || cibles.length < 2) return;
  const NS = 'http://www.w3.org/2000/svg';
  const el = (n, a = {}, parent) => { const e = document.createElementNS(NS, n); for (const [k, v] of Object.entries(a)) e.setAttribute(k, v); parent && parent.appendChild(e); return e; };
  const svg = el('svg', { class: 'reseaux', 'aria-hidden': 'true', focusable: 'false', 'data-audit-ignorer': '' });
  svg.dataset.effet = 'deux-reseaux';
  const defs = el('defs', {}, svg);
  const clip = el('clipPath', { id: 'reseaux-clip' }, defs);
  const rect = el('rect', { x: 0, y: 0, width: 99999, height: 0 }, clip);
  const rail = el('path', { class: 'res-rail' }, svg);
  const g = el('g', { 'clip-path': 'url(#reseaux-clip)' }, svg);
  const tuyau = el('path', { class: 'res-tuyau' }, g);
  const flux = el('path', { class: 'res-flux' }, g);
  const fil = el('path', { class: 'res-fil' }, g);
  const gBranches = el('g', {}, svg);
  main.prepend(svg);

  let haut = 0, y0 = 0, yFin = 0, branches = [], hauteurClip = 0;
  function construire() {
    const W = main.clientWidth, H = main.clientHeight;
    if (!W || !H) return;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    const rm = main.getBoundingClientRect();
    haut = rm.top + window.scrollY;
    /* Marge du contenu calculée, identique sur toutes les pages (gouttière clamp(16px, 4vw, 48px), largeur 1280). */
    const g = Math.min(48, Math.max(16, window.innerWidth * 0.04));
    const gauche = (W - Math.min(W - 2 * g, 1280)) / 2;
    const tel = W < 760;
    const xT = Math.max(tel ? 5 : 12, Math.min(gauche * 0.38, 120));
    const xF = xT + (tel ? 5 : 13);
    const bout = Math.max(xF + 8, gauche - 10);
    y0 = (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--entete-h')) || 70) + 8;
    const boite = (e) => { const h = e.closest('.pin-spacer') || e; const r = e.getBoundingClientRect(); const rh = h.getBoundingClientRect(); return { y: r.top - rm.top + (h !== e ? 0 : 0) + r.height / 2, decal: rh.top - rm.top }; };
    branches = cibles.filter((c) => c.getClientRects().length).map((c) => ({ c, y: boite(c).y })).sort((a, b) => a.y - b.y);
    yFin = branches.length ? branches[branches.length - 1].y : H - 40;
    const d = (x) => `M${x} ${y0} V${yFin}`;
    rail.setAttribute('d', d(xT)); tuyau.setAttribute('d', d(xT)); flux.setAttribute('d', d(xT)); fil.setAttribute('d', `M${xF} ${y0} V${yFin + 10}`);
    gBranches.replaceChildren();
    branches.forEach((b) => {
      const lg = tel ? 0 : Math.max(0, bout - xT);
      const be = el('path', { class: 'res-branche-eau', d: `M${xT} ${b.y - 6} H${xT + lg * 0.62}`, pathLength: 1 }, gBranches);
      const bf = el('path', { class: 'res-branche-fil', d: `M${xF} ${b.y + 4} H${bout - 6}`, pathLength: 1 }, gBranches);
      el('rect', { class: 'res-raccord', x: xT - (tel ? 3 : 6), y: b.y - 11, width: tel ? 6 : 12, height: 10, rx: 2 }, gBranches);
      const led = el('circle', { class: 'res-led', cx: tel ? xF : bout, cy: b.y + 4, r: tel ? 3 : 4.5 }, gBranches);
      [be, bf].forEach((p) => { p.style.strokeDasharray = '1 1'; p.style.strokeDashoffset = calme() ? 0 : 1; });
      b.be = be; b.bf = bf; b.led = led; b.atteinte = false;
    });
    peindre(true);
  }
  function peindre(force) {
    const y = calme() ? yFin + 20 : Math.min(yFin + 20, window.scrollY + window.innerHeight * 0.64 - haut);
    if (!force && Math.abs(y - hauteurClip) < 0.5) return;
    hauteurClip = y;
    rect.setAttribute('height', Math.max(0, y).toFixed(1));
    /* L'eau avance dans le tuyau avec le défilement (aucune boucle continue sur ce long tracé). */
    flux.style.strokeDashoffset = (-window.scrollY * 0.6).toFixed(1);
    branches.forEach((b) => {
      const ok = y >= b.y - 4;
      if (ok === b.atteinte && !force) return;
      b.atteinte = ok;
      b.be.style.strokeDashoffset = ok ? 0 : 1; b.bf.style.strokeDashoffset = ok ? 0 : 1;
      b.led.classList.toggle('est-atteinte', ok); b.c.classList.toggle('est-atteinte', ok);
    });
  }
  let attente = 0;
  window.addEventListener('scroll', () => { if (!attente) attente = requestAnimationFrame(() => { attente = 0; peindre(false); }); }, { passive: true });
  if (ST()) ST().addEventListener('refresh', construire);
  construire();
  return construire;
}

/* ---------- Eau WebGL sur la photo d'ouverture (module de la bibliothèque) ---------- */
async function eau() {
  const root = $('.hero .eau-scene');
  if (!root) return;
  /* Rendu logiciel (pas de carte graphique) : l'image reste nette, sans WebGL. */
  try {
    const gl = document.createElement('canvas').getContext('webgl');
    const info = gl && gl.getExtension('WEBGL_debug_renderer_info');
    const rendu = info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : '';
    gl && gl.getExtension('WEBGL_lose_context')?.loseContext();
    if (/swiftshader|llvmpipe|software/i.test(rendu)) return;
  } catch (e) { return; }
  try {
    const { init } = await import('./modules/eau-qui-refracte/module.js?v=1');
    await init(root, { focus: [0.74, 0.48], teinteForce: 0.08, reflet: '#ffffff', teinte: '#1d5fd1', force: 0.9, dpr: 1 });
  } catch (e) { console.warn('[eau]', e); }
}

/* ---------- Manomètre de l'ouverture : l'aiguille tremble avec la vitesse du défilement ---------- */
function manometre() {
  const m = $('.hero-mano');
  if (!m || calme()) return;
  let dernier = window.scrollY, angle = 60;
  boucle(m, (dt) => {
    const v = (window.scrollY - dernier) / Math.max(dt, 0.001); dernier = window.scrollY;
    const cible = 60 + Math.max(-14, Math.min(14, v * 0.012));
    angle += (cible - angle) * Math.min(1, dt * 8);
    const a = angle.toFixed(1);
    if (etat.pret && a !== m.__a) { m.__a = a; m.style.setProperty('--angle', a + 'deg'); }
  });
}

/* ---------- Tableau d'interrupteurs : ils basculent un à un en entrant ; toucher = détail ---------- */
function interrupteurs() {
  const tableau = $('[data-effet="interrupteurs"]');
  if (!tableau) return;
  const inters = $$('.inter', tableau);
  const allumer = () => inters.forEach((li, i) => setTimeout(() => li.classList.add('est-allume'), calme() ? 0 : i * 160));
  if (calme() || !ST()) allumer();
  else ST().create({ trigger: tableau, start: 'top 72%', end: 'max', once: true, onEnter: allumer });
  ETATS_FINAUX.push(() => inters.forEach((li) => li.classList.add('est-allume')));
  inters.forEach((li) => {
    const b = $('.inter-bouton', li), d = $('.inter-detail', li);
    b.addEventListener('click', () => {
      const ouvrir = b.getAttribute('aria-expanded') !== 'true';
      b.setAttribute('aria-expanded', String(ouvrir));
      li.classList.remove('est-allume'); void li.offsetWidth; li.classList.add('est-allume');
      /* La hauteur change d'un coup (positions recalculées tout de suite), seul le contenu apparaît en fondu. */
      d.hidden = !ouvrir;
      if (ST()) ST().refresh();
      if (ouvrir && !calme()) gsap.fromTo(d, { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' });
    });
  });
}

/* ---------- Goutte qui tombe du tuyau, éclabousse, et le prix compte ---------- */
function compter(el, fin, duree = 0.9) {
  if (!el) return;
  const o = { v: 0 };
  gsap.to(o, { v: fin, duration: duree, ease: 'power2.out', onUpdate: () => { el.textContent = fmt(o.v); }, onComplete: () => { el.textContent = fmt(fin); } });
}
function gouttePrix(racine, { declencheur = true } = {}) {
  const goutte = $('[data-goutte]', racine), ecl = $('.eclabousse', racine), n = $('[data-compte-prix]', racine);
  if (!goutte || calme()) return;
  const jouer = () => {
    gsap.timeline()
      .fromTo(goutte, { y: -150, opacity: 1, scaleY: 1.1 }, { y: 0, duration: 0.55, ease: 'power2.in' })
      .to(goutte, { scaleY: 0.4, scaleX: 1.5, opacity: 0, duration: 0.18, ease: 'power1.out' })
      .fromTo(ecl, { scale: 0.2, opacity: 0.9 }, { scale: 1.8, opacity: 0, duration: 0.6, ease: 'power2.out' }, '<')
      .add(() => n && compter(n, +n.dataset.comptePrix), '<');
  };
  if (!declencheur) return jouer();
  ST() && ST().create({ trigger: racine, start: 'top 68%', end: 'max', once: true, onEnter: jouer });
}

/* ---------- Quatre vannes : épinglé sur ordinateur, l'eau avance d'étape en étape ---------- */
function vannes() {
  const sec = $('.etapes');
  if (!sec || !ST()) return;
  const eau = $('.etapes-eau', sec), etapes = $$('.etape', sec);
  const marquer = (p) => etapes.forEach((e, i) => {
    const ok = p >= (i + 0.35) / etapes.length;
    if (ok !== e.classList.contains('est-ouverte')) { e.classList.toggle('est-ouverte', ok); const s = $('.vanne svg', e); s.style.transform = ok ? 'rotate(180deg)' : ''; }
  });
  ETATS_FINAUX.push(() => { etapes.forEach((e) => e.classList.add('est-ouverte')); gsap.set(eau, { scaleX: 1, scaleY: 1 }); });
  if (calme()) return;
  const mm = gsap.matchMedia();
  mm.add('(min-width: 901px)', () => {
    const tl = gsap.timeline({ scrollTrigger: { trigger: sec, start: 'top top', end: '+=160%', pin: true, scrub: 0.6, invalidateOnRefresh: true, onUpdate: (s) => marquer(s.progress) } });
    tl.fromTo(eau, { scaleX: 0 }, { scaleX: 1, ease: 'none', duration: 1 });
  });
  mm.add('(max-width: 900px)', () => {
    gsap.fromTo(eau, { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: sec, start: 'top 65%', end: 'bottom 70%', scrub: 0.5, onUpdate: (s) => marquer(s.progress) } });
  });
}

/* ---------- Derrière le mur : l'enduit se décolle au défilement et révèle tuyaux et câbles ---------- */
function derriereLeMur() {
  const sec = $('.mur');
  if (!sec || !ST()) return;
  const enduit = $('.mur-enduit', sec), bord = $('.mur-bord', sec), traits = $$('.mur-reseau path', sec);
  const reperes = $$('.mur-appareil, .mur-etiquette', sec).map((e) => ({ e, x: parseFloat(e.style.left) / 100 }));
  const montrer = (p) => reperes.forEach((r) => r.e.classList.toggle('est-visible', p >= r.x - 0.04));
  traits.forEach((t) => { t.setAttribute('pathLength', '1'); });
  ETATS_FINAUX.push(() => { reperes.forEach((r) => r.e.classList.add('est-visible')); traits.forEach((t) => { t.style.strokeDasharray = 'none'; }); });
  if (calme()) return montrer(1);
  traits.forEach((t) => { t.style.strokeDasharray = '1 1'; t.style.strokeDashoffset = 1; });
  const scene = (q) => { let p = q;
    p = 0.12 + p * 0.88; /* le schéma dépasse déjà à gauche : jamais d'aplat de mur vide */
    enduit.style.clipPath = `inset(0 0 0 ${(p * 100).toFixed(2)}%)`;
    bord.style.transform = `translateX(${(p * sec.__largeur).toFixed(1)}px)`;
    bord.style.opacity = p > 0.002 && p < 0.995 ? 1 : 0;
    traits.forEach((t, i) => { t.style.strokeDashoffset = Math.max(0, 1 - Math.min(1, (p * 1.25 - i * 0.06))).toFixed(3); });
    montrer(p);
  };
  const mesurer = () => { sec.__largeur = $('.mur-scene', sec).clientWidth; };
  mesurer();
  scene(0);
  ST().addEventListener('refresh', mesurer);
  const mm = gsap.matchMedia();
  mm.add('(min-width: 761px)', () => {
    const o = { p: 0 };
    gsap.to(o, { p: 1, ease: 'none', onUpdate: () => scene(o.p), scrollTrigger: { trigger: sec, start: 'top top', end: '+=150%', pin: true, scrub: 0.6, invalidateOnRefresh: true } });
  });
  mm.add('(max-width: 760px)', () => {
    const o = { p: 0 };
    gsap.to(o, { p: 1, ease: 'none', onUpdate: () => scene(o.p), scrollTrigger: { trigger: sec, start: 'top 70%', end: 'bottom 75%', scrub: 0.5 } });
  });
}

/* ---------- Raccords qui se vissent (engagements) ---------- */
function raccords() {
  const liste = $('[data-effet="raccords"]');
  if (!liste) return;
  const items = $$('.raccord', liste);
  ETATS_FINAUX.push(() => gsap.set(items, { opacity: 1, y: 0 }));
  if (calme() || !ST()) return gsap.set(items, { opacity: 1 });
  ST().create({ trigger: liste, start: 'top 78%', end: 'max', once: true, onEnter: () => {
    gsap.fromTo(items, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.14, ease: 'power3.out' });
    gsap.fromTo($$('.ecrou', liste), { rotation: -240, scale: 0.6 }, { rotation: 0, scale: 1, duration: 1.1, stagger: 0.14, ease: 'back.out(1.4)' });
  } });
}

/* ---------- Carte : ondes depuis Longueil-Sainte-Marie ---------- */
function ondes(racine) {
  $$('[data-carte]', racine).forEach((carte) => {
    const cercles = $$('[data-ondes] circle', carte);
    if (!cercles.length) return;
    carte.closest('[data-effet]') || (carte.dataset.effet = 'ondes-60');
    boucle(carte, (dt, t) => {
      cercles.forEach((c, i) => {
        const f = ((t * 0.22) + i / cercles.length) % 1;
        c.setAttribute('r', (0.5 + f * 30).toFixed(2));
        c.style.opacity = (calme() ? 0 : (1 - f) * 0.85).toFixed(3);
      });
    });
  });
}

/* ===================== Pages intérieures ===================== */

/* Prestations : étiquettes de prix qui tombent et se balancent, puis oscillent avec la vitesse du défilement. */
OUVERTURES.prestations = (tl, t) => {
  tl.fromTo('.tete-ligne', { yPercent: 135, opacity: 1 }, { yPercent: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power4.out' }, t)
    .fromTo('.tete-texte, .tete-actions', { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.08 }, t + 0.2)
    .fromTo('.etiquette', { yPercent: -130, rotation: (i) => (i % 2 ? 14 : -14) }, { yPercent: 0, rotation: 0, duration: 1.4, stagger: 0.09, ease: 'elastic.out(1, 0.45)' }, t + 0.05);
};
PAGES.push(function prestations() {
  if (pageCle !== 'prestations') return;
  ETATS_FINAUX.push(() => gsap.set('.tete-ligne, .tete-texte, .tete-actions, .etiquette', { clearProps: 'transform,opacity' }));
  /* Les étiquettes oscillent avec la vitesse du défilement (lissage selon le temps écoulé). */
  const rail = $('.rail');
  if (rail && !calme()) {
    const tags = $$('.etiquette', rail);
    let dernier = window.scrollY, angle = 0;
    boucle(rail, (dt, t) => {
      const v = (window.scrollY - dernier) / Math.max(dt, 0.001); dernier = window.scrollY;
      angle += ((Math.max(-12, Math.min(12, v * 0.02))) - angle) * Math.min(1, dt * 4);
      if (!etat.pret) return;
      tags.forEach((e, i) => { e.style.transform = `rotate(${(angle * (i % 2 ? 1 : -0.8) + Math.sin(t * 1.3 + i) * 1.2).toFixed(2)}deg)`; });
    });
  }
  /* Catalogue filtrable (module de la bibliothèque, recherche ajoutée). */
  const cat = $('[data-module="catalogue-filtres-flip"]');
  if (cat) import('./modules/catalogue-filtres-flip/module.js?v=1').then(({ init }) => init(cat, { mots: ['prestation', 'prestations'], format: (n) => fmt(n) + ' €', duree: 0.4 }))
    .then(() => { if (location.hash) { const f = document.getElementById(decodeURIComponent(location.hash.slice(1))); if (f && f.matches('.fiche')) { const d = $('details', f); if (d) d.open = true; } } })
    .catch((e) => console.warn('[catalogue]', e));
});

/* Décrivez votre besoin : les carreaux se retournent en vague depuis le centre et laissent la première question. */
OUVERTURES.besoin = (tl, t) => {
  const carreaux = $$('.carreaux span');
  const cx = 3.5, cy = 2;
  tl.fromTo(carreaux, { rotationX: 0, opacity: 1 }, { rotationX: -92, opacity: 0, duration: 0.55, ease: 'power2.in', stagger: (i) => Math.hypot((i % 8) - cx, Math.floor(i / 8) - cy) * 0.06, onComplete: () => $('.carreaux') && $('.carreaux').classList.add('fini') }, t)
    .fromTo('.q-titre', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' }, t + 0.25)
    .fromTo('.q-texte, .q-info, .q-progression, .q-corps', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: 'power3.out' }, t + 0.4)
    .fromTo('.q-tuile', { y: 26, rotationX: 50, opacity: 0 }, { y: 0, rotationX: 0, opacity: 1, duration: 0.6, stagger: 0.05, ease: 'back.out(1.6)' }, t + 0.5);
};
PAGES.push(function besoin() {
  if (pageCle !== 'besoin') return;
  ETATS_FINAUX.push(() => { gsap.set('.q-titre, .q-texte, .q-info, .q-progression, .q-corps, .q-tuile', { clearProps: 'transform,opacity' }); $('.carreaux') && $('.carreaux').classList.add('fini'); });
  const Q = $('[data-questionnaire]');
  if (!Q) return;
  const corps = $('[data-q-corps]', Q), etatQ = $('[data-q-etat]', Q), eau = $('[data-q-eau]', Q);
  const etapes = $$('[data-q-etape]', Q);
  const choix = { lieu: null, cas: null, delai: null };
  const donnees = JSON.parse($('#donnees-besoin')?.textContent || '{}');
  const modele = etatQ.textContent.replace('1', '{n}');
  let n = 1;
  function aller(k, focus = true) {
    const avant = corps.offsetHeight;
    n = k;
    etapes.forEach((e) => { e.hidden = +e.dataset.qEtape !== k; });
    etatQ.textContent = k <= 3 ? modele.replace('{n}', k) : '✓';
    eau.style.transform = `scaleX(${[0.12, 0.12, 0.45, 0.78, 1][k]})`;
    const apres = corps.offsetHeight;
    if (!calme() && gsap) {
      gsap.fromTo(corps, { height: avant }, { height: apres, duration: 0.45, ease: 'power3.out', clearProps: 'height', onComplete: rafraichir });
      gsap.fromTo($(`[data-q-etape="${k}"]`, Q), { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out' });
    } else rafraichir();
    if (focus) { const cible = $(`[data-q-etape="${k}"] .q-question`, Q) || $(`[data-q-etape="${k}"]`, Q); cible && cible.focus({ preventScroll: true }); }
    const u = new URL(location.href);
    ['lieu', 'cas', 'delai'].forEach((x) => (choix[x] ? u.searchParams.set(x, choix[x]) : u.searchParams.delete(x)));
    history.replaceState(history.state, '', u);
  }
  function resultat() {
    const lieu = donnees.lieux.find((l) => l.id === choix.lieu);
    const cas = lieu && lieu.cas.find((x) => x.id === choix.cas);
    const ids = cas ? cas.prestations : [];
    $$('.q-carte', Q).forEach((c) => {
      const ok = ids.includes(c.dataset.presta);
      c.hidden = !ok;
      c.style.order = ids.indexOf(c.dataset.presta);
      const a = $('[data-commander]', c);
      if (a) { const u = new URL(a.href, location.href); u.searchParams.set('delai', choix.delai || ''); a.href = u.pathname + u.search; }
    });
    $('[data-q-aucune]', Q).hidden = ids.length > 0;
    $('[data-q-titre-ok]', Q).hidden = ids.length === 0;
    $('[data-q-urgence]', Q).hidden = choix.delai !== 'urgence';
    aller(4);
    const premiere = $('.q-carte:not([hidden])', Q);
    if (premiere && !calme()) gsap.fromTo($$('.q-carte:not([hidden])', Q), { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, stagger: 0.08, ease: 'power3.out', delay: 0.15 });
  }
  const presser = (sel, el) => { $$(sel, Q).forEach((b) => b.setAttribute('aria-pressed', String(b === el))); };
  Q.addEventListener('click', (e) => {
    const t = e.target.closest('button');
    if (!t || !Q.contains(t)) return;
    if (t.dataset.lieu) {
      choix.lieu = t.dataset.lieu; choix.cas = null; presser('[data-lieu]', t);
      $$('[data-cas-pour]', Q).forEach((g) => { g.hidden = g.dataset.casPour !== choix.lieu; });
      aller(2);
    } else if (t.dataset.cas) { choix.cas = t.dataset.cas; presser(`[data-cas-pour="${choix.lieu}"] [data-cas]`, t); aller(3); }
    else if (t.dataset.delai) { choix.delai = t.dataset.delai; presser('[data-delai]', t); resultat(); }
    else if (t.hasAttribute('data-q-retour')) aller(Math.max(1, n - 1));
    else if (t.hasAttribute('data-q-recommencer')) { choix.lieu = choix.cas = choix.delai = null; $$('[aria-pressed]', Q).forEach((b) => b.setAttribute('aria-pressed', 'false')); aller(1); }
  });
  /* Lien profond : ?lieu=wc&cas=bouche&delai=urgence */
  const p = new URLSearchParams(location.search);
  const l = p.get('lieu') && $(`[data-lieu="${CSS.escape(p.get('lieu'))}"]`, Q);
  if (l) {
    l.click();
    const k = p.get('cas') && $(`[data-cas-pour="${CSS.escape(p.get('lieu'))}"] [data-cas="${CSS.escape(p.get('cas'))}"]`, Q);
    if (k) { k.click(); const d = p.get('delai') && $(`[data-delai="${CSS.escape(p.get('delai'))}"]`, Q); if (d) d.click(); }
  }
});

/* Rayon d'action : ondes, recherche de la commune et trajet tracé sur la carte. */
OUVERTURES.rayon = (tl, t) => {
  tl.fromTo('.tete-ondes-titre', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' }, t)
    .fromTo('.tete-ondes-texte > p:not(.surtitre), .commune-form', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.08 }, t + 0.15)
    .fromTo('.tete-ondes-carte', { opacity: 0, scale: 0.94 }, { opacity: 1, scale: 1, duration: 0.9, ease: 'power3.out' }, t + 0.1)
    .fromTo('#carte-rayon .carte-anneau', { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.1, stagger: 0.15, ease: 'power2.out' }, t + 0.2)
    .fromTo('#carte-rayon .carte-point, #carte-rayon .carte-etiquette', { opacity: 0 }, { opacity: 1, duration: 0.4, stagger: 0.04 }, t + 0.5);
};
PAGES.push(function rayon() {
  if (pageCle !== 'rayon') return;
  ETATS_FINAUX.push(() => gsap.set('.tete-ondes-titre, .tete-ondes-texte > p, .commune-form, .tete-ondes-carte, #carte-rayon .carte-point, #carte-rayon .carte-etiquette', { clearProps: 'transform,opacity' }));
  const f = $('[data-commune-form]'), rep = $('[data-commune-reponse]');
  const D = JSON.parse($('#donnees-communes')?.textContent || '{}');
  const carte = $('#carte-rayon');
  if (!f || !D.liste) return;
  const norm = (t) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z]+/g, ' ').trim();
  const trajet = $('[data-trajet]', carte);
  f.addEventListener('submit', (e) => {
    e.preventDefault();
    const v = norm($('input', f).value || '');
    $$('.est-choisi, .est-choisie', carte).forEach((x) => x.classList.remove('est-choisi', 'est-choisie'));
    rep.className = 'commune-reponse';
    if (!v) { rep.textContent = D.textes.vide; return; }
    const m = D.liste.find((x) => x.n === v) || D.liste.find((x) => x.n.startsWith(v));
    if (m) {
      rep.textContent = D.textes.oui.replace('{commune}', m.nom).replace('{km}', m.km);
      rep.classList.add('est-oui');
      const pt = $(`[data-point="${m.id}"]`, carte); pt && pt.classList.add('est-choisi');
      const et = $(`[data-etiquette="${m.id}"]`, carte); et && et.classList.add('est-choisie');
      if (pt && trajet) {
        trajet.setAttribute('d', `M0 0 L${pt.getAttribute('cx')} ${pt.getAttribute('cy')}`);
        if (!calme()) gsap.fromTo(trajet, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.8, ease: 'power2.out' }); else trajet.style.strokeDashoffset = 0;
      }
      return;
    }
    const o = D.oise.find((x) => x.n === v || x.n.startsWith(v));
    rep.textContent = o ? D.textes.oise.replace('{commune}', o.nom) : D.textes.non;
    rep.classList.add(o ? 'est-oui' : 'est-non');
  });
});

/* Contact : la fiche se branche, le formulaire s'allume ; préremplissage par l'adresse. */
OUVERTURES.contact = (tl, t) => {
  tl.fromTo('.tete-prise-titre', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' }, t)
    .fromTo('.tete-prise-texte > p:not(.surtitre)', { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.08 }, t + 0.12)
    .fromTo('.tete-prise .fpe', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' }, t + 0.1)
    .fromTo('.prise-cable', { strokeDasharray: '1 1', strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.8, ease: 'power2.inOut' }, t + 0.1)
    .fromTo('.prise-fiche', { x: -90 }, { x: 0, duration: 0.6, ease: 'back.out(2)' }, t + 0.55)
    .add(() => $('.tete-prise .fpe') && $('.tete-prise .fpe').classList.add('est-branche'), t + 1.1);
};
PAGES.push(function contact() {
  if (pageCle !== 'contact') return;
  ETATS_FINAUX.push(() => { gsap.set('.tete-prise-titre, .tete-prise-texte > p, .tete-prise .fpe, .prise-fiche', { clearProps: 'transform,opacity' }); const f = $('.tete-prise .fpe'); f && f.classList.add('est-branche'); });
  /* Au défilement, le câble se détend : la fiche recule un peu (et se rebranche en remontant). */
  if (!calme() && ST()) gsap.to('.prise-fiche', { x: -26, ease: 'none', scrollTrigger: { trigger: '.tete-prise', start: 'top top', end: 'bottom top', scrub: 0.5 } });
  const root = $('.tete-prise .fpe');
  if (!root) return;
  const p = new URLSearchParams(location.search);
  const sel = $('#fpe-prestation');
  if (p.get('prestation') && sel && [...sel.options].some((o) => o.value === p.get('prestation'))) {
    sel.value = p.get('prestation');
    const reseau = sel.selectedOptions[0] && sel.selectedOptions[0].dataset.reseau;
    const type = $(`input[name="type"][value="${reseau === 'electricite' ? 'Électricité' : 'Plomberie'}"]`);
    type && (type.checked = true);
  }
  const delai = $('#fpe-delai');
  if (p.get('delai') && delai && [...delai.options].some((o) => o.value === p.get('delai'))) delai.value = p.get('delai');
  const nature = p.get('sujet') === 'partenaire' ? 'Partenariat professionnel' : p.get('delai') === 'urgence' ? 'Dépannage en urgence' : null;
  if (nature) { const n = $(`input[name="nature"][value="${nature}"]`); n && (n.checked = true); }
  import('./modules/formulaire-par-etapes/module.js?v=1').then(({ init }) => init(root, { sujet: 'Demande de rappel, Dépannage 60' })).catch((e) => console.warn('[formulaire]', e));
});

/* ---------- Démarrage ---------- */
demarrer({
  preparer() {
    if (!gsap) return;
    deuxReseaux();
    manometre();
    interrupteurs();
    $$('.ticket[data-effet="goutte-prix"]').forEach((t) => gouttePrix(t));
    vannes();
    derriereLeMur();
    raccords();
    ondes(document);
    PAGES.forEach((f) => { try { f(); } catch (e) { console.error('[page]', e); } });
    /* Épinglages du projet créés après ceux du socle : tri par position dans la page, puis un seul recalcul. */
    if (ST()) { ST().sort(); rafraichir(); }
    /* L'eau WebGL démarre une fois l'ouverture terminée (le fil principal reste libre pendant l'intro). */
    quand('pret', () => { (window.requestIdleCallback || setTimeout)(() => eau(), { timeout: 400 }); });
  },
  jouer() {
    if (!gsap) return null;
    const tl = intro();
    return ouvrirPage(tl, 1.78);
  },
  etatFinal() { etatFinalPages(); },
  arrivee() { if (gsap) ouvrirPage(gsap.timeline(), 0.1); },
});

