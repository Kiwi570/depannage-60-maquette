/* Dépannage 60 — effets propres au client (direction « Deux réseaux »). Le socle gère l'ouverture, le voile, l'en-tête,
   le menu, le mode calme, les boucles, les mesures et la bibliothèque d'effets (lignes, cascade, rideau, parallaxe, zoom,
   trace, galerie, onde, magnétique). Chaque effet propre porte data-effet="nom-du-plan" :
   mise-en-service (intro), deux-reseaux (fil rouge), eau, manometre, interrupteurs, goutte-prix, vannes, derriere-le-mur,
   vue-eclatee, compteur, raccords, ondes-60, ruban, etiquettes, carrelage, prise-branchee. */
import { demarrer, boucle, etat, rafraichir, quand } from './socle/index.js?v=2';
import { init as vueEclatee } from './modules/vue-eclatee/module.js?v=2';

const gsap = window.gsap;
const ST = () => window.ScrollTrigger;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const pageCle = document.documentElement.dataset.page;
const calme = () => etat.calme;
const large = () => window.matchMedia('(min-width: 901px)').matches;
const PAGES = [];
const fmt = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

/* ---------- Intro « mise-en-service » : tuyau et câble se rejoignent, le nom se remplit d'eau, un arc traverse 60,
   puis le panneau se vide comme une cuve (bord en vague qui descend) ---------- */
function vague(niveau, phase, amp = 4, amp2 = 0) {
  /* Bord de l'eau : deux houles superposées sur 25 points, niveau en % (100 = vide, -8 = plein). */
  const pts = [];
  for (let i = 0; i <= 24; i++) {
    const y = niveau + Math.sin(i * 0.75 + phase) * amp + Math.sin(i * 1.9 - phase * 1.6) * amp2;
    pts.push(`${((i / 24) * 100).toFixed(2)}% ${y.toFixed(2)}%`);
  }
  return `polygon(0% 100%, 100% 100%, ${pts.reverse().join(', ')})`;
}
function arc() {
  /* Arc électrique : ligne brisée à travers « 60 » (viewBox 100 × 60). */
  let d = `M-4 ${(30 + (Math.random() - 0.5) * 16).toFixed(1)}`;
  for (let x = 6; x < 104; x += 7 + Math.random() * 7) d += ` L${Math.min(104, x).toFixed(1)} ${(30 + (Math.random() - 0.5) * 42).toFixed(1)}`;
  return d;
}

function intro() {
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  const p = $('[data-ouverture]');
  if (!p) return tl;
  p.dataset.effet = 'mise-en-service';
  const eau = $('.ouv-eau', p), lum = $('.ouv-60-lum', p), chiffre = $('[data-ouv-chiffre]', p);
  const arcSvg = $('.ouv-arc', p), arcTraits = $$('.ouv-arc path', p);
  const etatEau = { n: 100, ph: 0, k: 1 }, compte = { v: 0 }, eclair = { k: 0, vu: -1 }, vidange = { n: -10, ph: 0 };
  const peindreEau = () => { eau.style.clipPath = vague(etatEau.n, etatEau.ph, 2 + 5 * etatEau.k, 2.6 * etatEau.k); };
  /* Un seul éclat : l'arc apparaît, change de forme sans s'éteindre, puis s'efface (pas de clignotement). */
  const peindreArc = () => { const k = Math.floor(eclair.k); if (k === eclair.vu) return; eclair.vu = k; const d = arc(); arcTraits.forEach((t) => t.setAttribute('d', d)); };
  tl.fromTo($$('.ouv-tuyau, .ouv-tuyau-eau', p), { strokeDashoffset: 1, strokeDasharray: '1 1' }, { strokeDashoffset: 0, duration: 0.7, ease: 'power2.inOut' }, 0.1)
    .fromTo($('.ouv-cable', p), { strokeDashoffset: 1, strokeDasharray: '1 1' }, { strokeDashoffset: 0, duration: 0.7, ease: 'power2.inOut' }, 0.18)
    .fromTo($('.ouv-losanges', p), { y: -14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, 0.05)
    .to(etatEau, { n: -10, ph: 9, k: 0.15, duration: 1.05, ease: 'power1.inOut', onUpdate: peindreEau }, 0.55)
    .fromTo(arcSvg, { opacity: 0 }, { opacity: 1, duration: 0.06, ease: 'none' }, 1.0)
    .fromTo(eclair, { k: 0 }, { k: 6, duration: 0.5, ease: 'none', onUpdate: peindreArc }, 1.0)
    .to(arcSvg, { opacity: 0, duration: 0.2, ease: 'power1.in' }, 1.42)
    .fromTo(lum, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power2.in' }, 1.34)
    .fromTo($('.ouv-mano', p), { '--angle': '-120deg' }, { '--angle': '60deg', duration: 0.9, ease: 'back.out(1.6)' }, 0.75)
    .fromTo(compte, { v: 0 }, { v: 45, duration: 0.9, ease: 'power2.out', onUpdate: () => { if (chiffre) chiffre.textContent = fmt(compte.v); } }, 0.75)
    .fromTo(vidange, { n: -10, ph: 0 }, { n: 114, ph: 5, duration: 0.72, ease: 'power1.inOut', onUpdate: () => { p.style.clipPath = vague(vidange.n, vidange.ph, 3.2, 1.2); } }, 1.76);
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
  /* Trois calques dans la marge : le rail (fixe), le tuyau et le câble remplis jusqu'au point atteint (découpe CSS en
     rectangle, appliquée sans repeindre le long tracé), puis raccords, LED et étincelles. */
  const calque = (extra = '') => el('svg', { class: 'reseaux' + extra, 'aria-hidden': 'true', focusable: 'false', 'data-audit-ignorer': '' });
  const svgRail = calque(), plein = calque(' reseaux--plein'), svg = calque();
  svg.dataset.effet = 'deux-reseaux';
  const rail = el('path', { class: 'res-rail' }, svgRail);
  const tuyau = el('path', { class: 'res-tuyau' }, plein);
  const flux = el('path', { class: 'res-flux' }, plein);
  const pouls = el('path', { class: 'res-pouls' }, plein);
  const fil = el('path', { class: 'res-fil' }, plein);
  const courant = el('path', { class: 'res-courant-fil' }, plein);
  const gBranches = el('g', {}, svg);
  const gEtincelles = el('g', {}, svg);
  main.prepend(svgRail, plein, svg);
  const calques = [svgRail, plein, svg];

  let haut = 0, y0 = 0, yFin = 0, branches = [], hauteurClip = 0, xEau = 0, xCourant = 0, dernierY = -1, hauteurMain = 0;
  const fen = { a: 0, z: 0 };
  function construire() {
    const W = main.clientWidth, H = main.clientHeight;
    if (!W || !H) return;
    const rm = main.getBoundingClientRect();
    haut = rm.top + window.scrollY;
    /* Marge du contenu calculée, identique sur toutes les pages (gouttière clamp(16px, 4vw, 48px), largeur 1280). */
    const g = Math.min(48, Math.max(16, window.innerWidth * 0.04));
    const gauche = (W - Math.min(W - 2 * g, 1280)) / 2;
    const tel = W < 760;
    const xT = Math.max(tel ? 5 : 12, Math.min(gauche * 0.38, 120));
    const xF = xT + (tel ? 5 : 13);
    const bout = Math.max(xF + 8, gauche - 10);
    /* Le dessin reste dans la marge : le SVG n'est pas plus large qu'elle (petit calque, repeint seul au défilement). */
    const largeur = Math.ceil(bout + 24);
    calques.forEach((s) => { s.setAttribute('viewBox', `0 0 ${largeur} ${H}`); s.style.width = largeur + 'px'; });
    hauteurMain = H;
    y0 =(parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--entete-h')) || 70) + 8;
    const boite = (e) => { const h = e.closest('.pin-spacer') || e; const r = e.getBoundingClientRect(); const rh = h.getBoundingClientRect(); return { y: r.top - rm.top + (h !== e ? 0 : 0) + r.height / 2, decal: rh.top - rm.top }; };
    branches = cibles.filter((c) => c.getClientRects().length).map((c) => ({ c, y: boite(c).y })).sort((a, b) => a.y - b.y);
    yFin = branches.length ? branches[branches.length - 1].y : H - 40;
    const d = (x) => `M${x} ${y0} V${yFin}`;
    [rail, tuyau].forEach((t) => t.setAttribute('d', d(xT)));
    fil.setAttribute('d', `M${xF} ${y0} V${yFin + 10}`);
    xEau = xT; xCourant = xF;
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
    if (!force && Math.abs(window.scrollY - dernierY) < 0.5) return;
    dernierY = window.scrollY;
    if (force || Math.abs(y - hauteurClip) >= 0.5) { hauteurClip = y; plein.style.clipPath = `inset(0 0 ${Math.max(0, hauteurMain - Math.max(0, y)).toFixed(1)}px 0)`; }
    /* L'eau avance dans le tuyau et le courant dans le câble avec le défilement (aucune boucle continue sur ce long tracé).
       Les tirets ne sont tracés que sur la partie à l'écran (le décalage compense le départ) : peu de tirets à recalculer. */
    const sy = window.scrollY, haute = sy - haut, basse = haute + window.innerHeight;
    /* Fenêtre retracée seulement quand l'écran en sort (marge de 700 px) : le reste du temps, seul le décalage change. */
    if (force || haute < fen.a || basse > fen.z) {
      fen.a = Math.max(y0, haute - 700); fen.z = Math.min(yFin + 10, basse + 700);
      [[flux, xEau, yFin], [pouls, xEau, yFin], [courant, xCourant, yFin + 10]].forEach(([t, x, fin]) => {
        t.setAttribute('d', fen.z > fen.a ? `M${x} ${fen.a.toFixed(1)} V${Math.min(fin, fen.z).toFixed(1)}` : 'M0 0');
      });
    }
    [[flux, 0.6], [pouls, 1.4], [courant, 2]].forEach(([t, k]) => { t.style.strokeDashoffset = (-sy * k + (fen.a - y0)).toFixed(1); });
    branches.forEach((b) => {
      const ok = y >= b.y - 4;
      if (ok === b.atteinte && !force) return;
      if (ok && !b.atteinte && !force) etincelle(+b.led.getAttribute('cx'), +b.led.getAttribute('cy'));
      b.atteinte = ok;
      b.be.style.strokeDashoffset = ok ? 0 : 1; b.bf.style.strokeDashoffset = ok ? 0 : 1;
      b.led.classList.toggle('est-atteinte', ok); b.c.classList.toggle('est-atteinte', ok);
    });
  }
  /* Étincelle à la LED quand le courant l'atteint : une seule à la fois, au plus trois par seconde. */
  let derniere = 0;
  function etincelle(x, y) {
    const t = performance.now();
    if (calme() || !etat.pret || t - derniere < 340) return;
    derniere = t;
    const e = el('g', { class: 'res-etincelle' }, gEtincelles);
    for (let k = 0; k < 8; k++) {
      const a = (k * Math.PI) / 4 + 0.3, r1 = 7, r2 = k % 2 ? 13 : 18;
      el('line', { x1: (x + Math.cos(a) * r1).toFixed(1), y1: (y + Math.sin(a) * r1).toFixed(1), x2: (x + Math.cos(a) * r2).toFixed(1), y2: (y + Math.sin(a) * r2).toFixed(1) }, e);
    }
    setTimeout(() => e.remove(), 700);
  }
  let attente = 0;
  window.addEventListener('scroll', () => { if (!attente) attente = requestAnimationFrame(() => { attente = 0; peindre(false); }); }, { passive: true });
  if (ST()) ST().addEventListener('refresh', construire);
  construire();
  return construire;
}

/* ---------- Eau sur la photo d'ouverture : WebGL (module de la bibliothèque), sinon ondes dessinées en 2D ---------- */
async function eau() {
  const root = $('.hero .eau-scene');
  if (!root) return;
  /* Rendu logiciel (pas de carte graphique) ou pas de WebGL : ondes 2D légères à la place. */
  try {
    const gl = document.createElement('canvas').getContext('webgl');
    const info = gl && gl.getExtension('WEBGL_debug_renderer_info');
    const rendu = info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : '';
    gl && gl.getExtension('WEBGL_lose_context')?.loseContext();
    if (!gl || /swiftshader|llvmpipe|software/i.test(rendu)) return eau2D(root);
  } catch (e) { return eau2D(root); }
  try {
    const { init } = await import('./modules/eau-qui-refracte/module.js?v=2');
    await init(root, { focus: [0.74, 0.48], teinteForce: 0.08, reflet: '#ffffff', teinte: '#1d5fd1', force: 0.9, dpr: 1 });
  } catch (e) { console.warn('[eau]', e); eau2D(root); }
}
/* Ondes 2D : anneaux en perspective sous la souris ou le doigt ; deux gouttes d'elles-mêmes à l'arrivée, puis plus rien
   sans geste du visiteur (rien ne tourne pour rien). */
function eau2D(root) {
  const cv = $('.eau__canvas', root);
  if (!cv || calme()) return;
  const ctx = cv.getContext('2d');
  if (!ctx) return;
  const ECH = 0.5, ondes = [];
  /* Au retour arrière, la page revient telle qu'on l'a quittée : pas de goutte d'elle-même. */
  let W = 0, H = 0, r = null, derniere = 0, goutte = 0.4, auto = etat.arrivee === 'retour' ? 0 : 1.6;
  const taille = () => { const b = root.getBoundingClientRect(); W = Math.max(1, Math.round(b.width * ECH)); H = Math.max(1, Math.round(b.height * ECH)); cv.width = W; cv.height = H; r = { l: b.left + window.scrollX, t: b.top + window.scrollY }; };
  const ajouter = (x, y, force) => { ondes.push({ x, y, r: 2, v: 60 + 50 * force, a: 0.5 * force }); if (ondes.length > 20) ondes.shift(); };
  taille();
  if (ST()) ST().addEventListener('refresh', taille);
  root.closest('.hero').addEventListener('pointermove', (e) => {
    const t = performance.now();
    if (!r || t - derniere < 80) return;
    derniere = t; ajouter((e.pageX - r.l) * ECH, (e.pageY - r.t) * ECH, 0.8);
  }, { passive: true });
  root.closest('.hero').addEventListener('pointerdown', (e) => { if (r) ajouter((e.pageX - r.l) * ECH, (e.pageY - r.t) * ECH, 1); }, { passive: true });
  root.classList.add('eau--actif');
  let vide = true;
  boucle(cv, (dt) => {
    if (auto > 0 && etat.pret) { auto -= dt; goutte -= dt; if (goutte <= 0) { goutte = 1.1 + Math.random() * 0.9; ajouter(W * (0.45 + Math.random() * 0.45), H * (0.35 + Math.random() * 0.5), 1); } }
    if (!ondes.length) { if (!vide) { ctx.clearRect(0, 0, W, H); vide = true; } return; }
    vide = false;
    ctx.clearRect(0, 0, W, H);
    ctx.lineWidth = 1.4;
    for (let i = ondes.length - 1; i >= 0; i--) {
      const o = ondes[i];
      o.r += o.v * dt * ECH; o.a -= dt * 0.36;
      if (o.a <= 0) { ondes.splice(i, 1); continue; }
      ctx.beginPath(); ctx.ellipse(o.x, o.y, o.r, o.r * 0.4, 0, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255,255,255,${o.a.toFixed(3)})`; ctx.stroke();
      ctx.beginPath(); ctx.ellipse(o.x, o.y + 1.5, o.r * 0.72, o.r * 0.29, 0, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(106,156,242,${(o.a * 0.9).toFixed(3)})`; ctx.stroke();
    }
  }, { lourde: true });
}

/* ---------- Numéro en compteur d'eau : les roues tournent une fois à l'arrivée ; sinon le numéro est déjà affiché ---------- */
function compteurs() {
  const odos = $$('.odo');
  if (!odos.length) return;
  ETATS_FINAUX.push(() => odos.forEach((o) => gsap.set($$('.odo-bande', o), { clearProps: 'transform' })));
  if (calme() || !ST()) return;
  odos.forEach((o) => {
    const bandes = $$('.odo-bande', o);
    /* Le décalage final du CSS est lu par GSAP comme y en pixels : on le remet à zéro, seul yPercent compte. */
    gsap.set(bandes, { y: 0, yPercent: 0 });
    ST().create({ trigger: o, start: 'top 92%', end: 'max', once: true, onEnter: () => {
      bandes.forEach((b, i) => gsap.to(b, { yPercent: -(10 + +b.style.getPropertyValue('--n')) * 5, duration: 0.6 + i * 0.012, delay: i * 0.012, ease: 'power3.out' }));
    } });
  });
}

/* ---------- Chauffe-eau en vue éclatée (module de la bibliothèque) ---------- */
function chauffeEau() {
  const root = $('.vec');
  if (!root) return null;
  return vueEclatee(root, { longueur: 2, recomposer: false }).catch((e) => console.warn('[vue-eclatee]', e));
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

/* ---------- Coupure de courant : le tableau est dans le noir, une lampe suit la souris (ou se promène quelques
   secondes sur un écran tactile) ; au défilement, les pannes s'allument une à une avec leur prix, jamais ne s'éteignent ;
   toucher = détail. Toutes allumées : le noir se dissipe. Mode calme : pas de noir, tout est allumé. ---------- */
function interrupteurs() {
  const tableau = $('[data-effet="interrupteurs"]');
  if (!tableau) return;
  const inters = $$('.inter', tableau);
  const noir = $('.noir', tableau);
  const verifier = () => { if (inters.every((li) => li.classList.contains('est-allume'))) tableau.classList.add('est-tout-allume'); };
  const allumer = (li) => { if (!li.classList.contains('est-allume')) { li.classList.add('est-allume'); if (!calme()) li.classList.add('s-allume'); verifier(); } };
  const toutAllumer = () => { inters.forEach((li) => li.classList.add('est-allume')); tableau.classList.add('est-tout-allume'); };
  ETATS_FINAUX.push(toutAllumer);
  inters.forEach((li) => {
    const b = $('.inter-bouton', li), d = $('.inter-detail', li);
    b.addEventListener('click', () => {
      const ouvrir = b.getAttribute('aria-expanded') !== 'true';
      b.setAttribute('aria-expanded', String(ouvrir));
      allumer(li);
      /* La hauteur change d'un coup (positions recalculées tout de suite), seul le contenu apparaît en fondu. */
      d.hidden = !ouvrir;
      if (ST()) ST().refresh();
      if (ouvrir && !calme()) gsap.fromTo(d, { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' });
    });
  });
  if (calme() || !ST() || !noir) return toutAllumer();

  /* Allumage piloté par le défilement, croissant seulement, tout allumé quand le tableau est aux deux tiers à l'écran.
     Une carte à la fois, au moins 350 ms entre deux (jamais plus de trois allumages par seconde, même en défilant vite). */
  let voulu = 0, allumes = 0, minuterie = 0;
  const suivante = () => {
    minuterie = 0;
    if (allumes >= voulu) return;
    allumer(inters[allumes++]);
    if (allumes < voulu) minuterie = setTimeout(suivante, 350);
  };
  const demander = (n) => { voulu = Math.max(voulu, n); if (!minuterie) suivante(); };
  ST().create({ trigger: tableau, start: 'top 82%', end: 'center 58%', onUpdate: (s) => demander(Math.min(inters.length, Math.floor(s.progress * (inters.length + 0.999)))), onLeave: () => demander(inters.length) });

  /* Lampe : un grand calque (deux fois le tableau) déplacé par transform, jamais repeint. */
  const lampe = document.createElement('span');
  lampe.className = 'noir-lampe';
  noir.appendChild(lampe);
  let r = null, vise = null, auto = 4.5, cx = 0.5, cy = 0.4, dernier = '';
  const mesurer = () => { const b = tableau.getBoundingClientRect(); r = { l: b.left + window.scrollX, t: b.top + window.scrollY, w: b.width, h: b.height }; dernier = ''; };
  const viser = (e) => { if (!r) return; vise = [Math.max(0, Math.min(1, (e.pageX - r.l) / r.w)), Math.max(0, Math.min(1, (e.pageY - r.t) / r.h))]; };
  tableau.addEventListener('pointermove', viser, { passive: true });
  tableau.addEventListener('pointerdown', viser, { passive: true });
  ST().addEventListener('refresh', mesurer);
  mesurer();
  boucle(tableau, (dt, t) => {
    if (tableau.classList.contains('est-tout-allume') || !r) return;
    let x, y;
    if (vise) [x, y] = vise;
    else if (auto > 0) { auto -= dt; x = 0.5 + Math.sin(t * 0.9) * 0.3; y = 0.45 + Math.sin(t * 1.3 + 1) * 0.25; }
    else return;
    const k = Math.min(1, dt * 7);
    cx += (x - cx) * k; cy += (y - cy) * k;
    const v = `translate3d(${((cx - 0.5) * r.w).toFixed(1)}px, ${((cy - 0.5) * r.h).toFixed(1)}px, 0)`;
    if (v !== dernier) { dernier = v; lampe.style.transform = v; }
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

/* ---------- Derrière le mur : l'enduit se fissure, tombe en éclats depuis le point d'impact, et révèle le réseau
   en radiographie ; chaque appareil est un lien vers sa prestation, survol ou focus = l'eau monte dans sa colonne ---------- */
const alea = (n) => { const x = Math.sin(n * 91.7 + 17.3) * 43758.5453; return x - Math.floor(x); };
function derriereLeMur() {
  const sec = $('.mur');
  if (!sec || !ST()) return;
  const scene = $('.mur-scene', sec), enduit = $('.mur-enduit', sec), img = $('.mur-enduit-img img', sec);
  const fiss = $('.mur-fissures', sec), fissures = $$('.mur-fissures path', sec), eclats = $$('.eclat', sec);
  const colonnes = $$('.res-colonne', sec);
  $$('.mur-appareil[data-riser]', sec).forEach((a) => {
    const col = colonnes[+a.dataset.riser];
    if (!col) return;
    const on = () => col.classList.add('est-pulse'), off = () => col.classList.remove('est-pulse');
    a.addEventListener('pointerenter', on); a.addEventListener('pointerleave', off);
    a.addEventListener('focus', on); a.addEventListener('blur', off);
  });
  /* Repères (appareils, prises, tableau) : ils apparaissent quand l'enduit au-dessus d'eux est tombé. */
  const reperes = $$('[data-repere]', sec).map((e) => { const x = parseFloat(e.style.left) / 100, y = parseFloat(e.style.top) / 100; return { e, s: 0.28 + Math.min(1, Math.hypot((x - 0.5) * 2.1, y - 0.42) / 1.1) * 0.34, vu: null }; });
  const fini = () => { enduit && enduit.classList.add('est-parti'); reperes.forEach((r) => r.e.classList.add('est-visible')); };
  ETATS_FINAUX.push(fini);
  if (calme() || !enduit) return fini();

  /* Point d'impact, ordre de chute (du plus proche au plus loin), dérive et rotation propres à chaque éclat. */
  const IX = 0.5, IY = 0.42;
  const infos = eclats.map((e, i) => {
    const x = (parseFloat(e.style.left) + parseFloat(e.style.width) / 2) / 100, y = (parseFloat(e.style.top) + parseFloat(e.style.height) / 2) / 100;
    return { e, d: Math.hypot((x - IX) * 2.1, y - IY), dx: (x - IX) * 0.18 + (alea(i) - 0.5) * 0.05, rot: (alea(i + 40) - 0.5) * 80, l: -1 };
  });
  const dMax = Math.max(...infos.map((i) => i.d)) || 1;
  infos.forEach((i) => { i.s = 0.18 + (i.d / dMax) * 0.36; });
  let W = 0, H = 0;
  const mesurer = () => {
    W = scene.clientWidth; H = scene.clientHeight;
    if (!W || !img) return;
    const src = img.currentSrc || img.src, nw = img.naturalWidth || 16, nh = img.naturalHeight || 9;
    const k = Math.max(W / nw, H / nh), iw = nw * k, ih = nh * k, ix = (W - iw) / 2, iy = (H - ih) / 2;
    $('.mur-eclats', sec).style.setProperty('--enduit', `url("${src}")`);
    eclats.forEach((e) => { e.style.backgroundSize = `${iw.toFixed(1)}px ${ih.toFixed(1)}px`; e.style.backgroundPosition = `${(ix - e.offsetLeft).toFixed(1)}px ${(iy - e.offsetTop).toFixed(1)}px`; });
    infos.forEach((i) => { i.l = -1; });
  };
  if (img && !img.complete) img.addEventListener('load', () => { mesurer(); rendre(dernierP); }, { once: true });
  const lisse = (a, b, v) => Math.min(1, Math.max(0, (v - a) / (b - a)));
  let brise = null, parti = null, dernierP = 0, clavier = false;
  const rendre = (q) => {
    dernierP = q;
    const p = clavier ? 1 : q;
    /* Les fissures partent dès l'arrivée (rayons depuis l'impact, puis bords des éclats ; chaque fissure = bord clair + trait). */
    const f = lisse(-0.12, 0.16, p);
    fissures.forEach((t, i) => { const k = Math.floor(i / 2) * 0.025; t.style.strokeDashoffset = (1 - lisse(k, 0.55 + k, f)).toFixed(3); });
    fiss.style.opacity = (1 - lisse(0.2, 0.45, p)).toFixed(3);
    const b = p >= 0.17;
    if (b !== brise) { brise = b; enduit.classList.toggle('est-brise', b); }
    infos.forEach((i) => {
      const l = lisse(i.s, i.s + 0.2, p);
      if (l === i.l) return;
      i.l = l;
      i.e.style.transform = l ? `translate3d(${(i.dx * l * W).toFixed(1)}px, ${(l * l * H * 0.95).toFixed(1)}px, 0) rotate(${(i.rot * l).toFixed(1)}deg)` : '';
      i.e.style.opacity = (1 - lisse(0.72, 1, l)).toFixed(3);
    });
    reperes.forEach((r) => { const v = p >= r.s; if (v !== r.vu) { r.vu = v; r.e.classList.toggle('est-visible', v); } });
    const pa = p >= 0.8;
    if (pa !== parti) { parti = pa; enduit.classList.toggle('est-parti', pa); }
  };
  /* Au clavier, l'enduit tombe d'un coup : un lien n'est jamais caché sous le mur. */
  scene.addEventListener('focusin', () => { if (!clavier) { clavier = true; rendre(dernierP); } });
  mesurer();
  rendre(0);
  ST().addEventListener('refresh', () => { mesurer(); rendre(dernierP); });
  const mm = gsap.matchMedia();
  mm.add('(min-width: 761px)', () => {
    const o = { p: 0 };
    gsap.to(o, { p: 1, ease: 'none', onUpdate: () => rendre(o.p), scrollTrigger: { trigger: sec, start: 'top top', end: '+=140%', pin: true, scrub: 0.6, invalidateOnRefresh: true } });
  });
  mm.add('(max-width: 760px)', () => {
    const o = { p: 0 };
    gsap.to(o, { p: 1, ease: 'none', onUpdate: () => rendre(o.p), scrollTrigger: { trigger: scene, start: 'top 80%', end: 'bottom 30%', scrub: 0.5 } });
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
  if (cat) import('./modules/catalogue-filtres-flip/module.js?v=2').then(({ init }) => init(cat, { mots: ['prestation', 'prestations'], format: (n) => fmt(n) + ' €', duree: 0.4 }))
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
  import('./modules/formulaire-par-etapes/module.js?v=2').then(({ init }) => init(root, { sujet: 'Demande de rappel, Dépannage 60' })).catch((e) => console.warn('[formulaire]', e));
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
    const vec = chauffeEau();
    raccords();
    ondes(document);
    compteurs();
    PAGES.forEach((f) => { try { f(); } catch (e) { console.error('[page]', e); } });
    /* Épinglages du projet créés après ceux du socle : tri par position dans la page, puis un seul recalcul
       (la vue éclatée est prête un instant plus tard : nouveau tri, le recalcul regroupé reste unique). */
    if (ST()) { ST().sort(); rafraichir(); }
    if (vec) vec.then(() => { if (ST()) { ST().sort(); rafraichir(); } });
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

