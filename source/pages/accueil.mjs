/* Accueil « Deux réseaux » : ordre des sections = ordre dans lequel le visiteur en urgence cherche les informations
   (appeler, quel problème et quel prix, comment ça marche, ce qu'on répare, le chauffe-eau, où, garanties, rénovation, qui, appel final). */
import { html, brut } from '../../outils/gabarit.mjs';
import { manometre, icone } from '../gabarits/commun.mjs';
import { prix, trouver, carte, compteur } from '../gabarits/composants.mjs';

export const page = { cle: 'accueil', fichier: 'index', imagePartage: 'grok/accueil-ouverture-1280.webp' };

const DIAG = [
  ['fuite', 'recherche-de-fuite-simple', 'robinet'], ['wc', 'debouchage-wc', 'wc-bouche'], ['evacuation', 'debouchage-evier', 'evier'],
  ['eauChaude', 'probleme-de-ballon-d-eau-chaude', 'chauffe-eau'], ['humidite', 'j-ai-une-trace-d-humidite', 'canalisation'], ['prise', 'prises-electriques-standard', null],
];

/* Réseau dessiné derrière le mur (viewBox 1200 × 560) : eau froide, eau chaude, courant ; repères posés en % de la scène. */
/* verbe : la prestation que couvre le prix (le prix n'est jamais celui de l'appareil). */
const RISERS = [
  { x: 150, picto: 'wc-bouche', nom: 'WC', presta: 'debouchage-wc', verbe: 'Débouchage' }, { x: 330, picto: 'lavabo', nom: 'Lavabo', presta: 'debouchage-lavabo', verbe: 'Débouchage', chaud: true },
  { x: 510, picto: 'douche', nom: 'Douche', presta: 'debouchage-douche', verbe: 'Débouchage', chaud: true }, { x: 690, picto: 'evier', nom: 'Évier', presta: 'debouchage-evier', verbe: 'Débouchage', chaud: true },
  { x: 870, picto: 'chauffe-eau', nom: 'Chauffe-eau', presta: 'probleme-de-ballon-d-eau-chaude', verbe: 'Diagnostic' }, { x: 1050, picto: 'lave-vaisselle', nom: 'Électroménager', presta: 'robinet-de-machine-a-laver-a-remplacer', verbe: 'Robinet' },
];
const PRISES = [{ x: 250, nom: 'Prises', presta: 'prises-electriques-standard', verbe: 'Pose' }, { x: 610, nom: 'Points lumineux' }, { x: 960, nom: 'Mise aux normes' }];

/* Enduit en éclats : grille 7 × 4 aux sommets décalés (pseudo-hasard fixe). Chaque éclat est une boîte à sa taille
   (petits calques), découpée par un polygone ; les fissures suivent les mêmes sommets. Coordonnées en % de la scène. */
const alea = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const COLS = 7, LIGS = 4;
const SOMMETS = Array.from({ length: LIGS + 1 }, (_, j) => Array.from({ length: COLS + 1 }, (_, i) => [
  i === 0 || i === COLS ? (i / COLS) * 100 : (i / COLS) * 100 + (alea(i * 7 + j * 3) - 0.5) * 8,
  j === 0 || j === LIGS ? (j / LIGS) * 100 : (j / LIGS) * 100 + (alea(j * 13 + i * 5) - 0.5) * 13,
]));
const r2 = (v) => Math.round(v * 100) / 100;
const ECLATS = [];
for (let j = 0; j < LIGS; j++) for (let i = 0; i < COLS; i++) {
  const q = [SOMMETS[j][i], SOMMETS[j][i + 1], SOMMETS[j + 1][i + 1], SOMMETS[j + 1][i]];
  const xs = q.map((p) => p[0]), ys = q.map((p) => p[1]);
  const x = Math.min(...xs), y = Math.min(...ys), w = Math.max(...xs) - x, h = Math.max(...ys) - y;
  const cx = xs.reduce((a, b) => a + b) / 4, cy = ys.reduce((a, b) => a + b) / 4;
  ECLATS.push({ x: r2(x), y: r2(y), w: r2(w), h: r2(h), ox: r2(((cx - x) / w) * 100), oy: r2(((cy - y) / h) * 100),
    poly: `polygon(${q.map(([px, py]) => `${r2(((px - x) / w) * 100)}% ${r2(((py - y) / h) * 100)}%`).join(', ')})` });
}
/* Fissures en unités de la scène (1200 × 560) : d'abord des lignes brisées qui partent du point d'impact, puis les
   bords des éclats, chaque segment cassé en zigzag (le trait suit la découpe à quelques pixels près). */
const IMPACT = [50, 42];
let graine = 1;
const zigzag = (pts) => {
  const out = [pts[0]];
  for (let k = 1; k < pts.length; k++) {
    const [ax, ay] = pts[k - 1], [bx, by] = pts[k];
    for (const t of [0.33, 0.66]) {
      const n = alea(graine++) - 0.5;
      out.push([ax + (bx - ax) * t - (by - ay) * n * 0.16, ay + (by - ay) * t + (bx - ax) * n * 0.16 * 2.1]);
    }
    out.push(pts[k]);
  }
  return 'M' + out.map(([x, y]) => `${r2(x * 12)} ${r2(y * 5.6)}`).join(' L');
};
const RAYONS = Array.from({ length: 7 }, (_, k) => {
  const a = (k / 7) * Math.PI * 2 + 0.4, l = 14 + alea(k + 70) * 16;
  return zigzag([IMPACT, [IMPACT[0] + Math.cos(a) * l * 0.55, IMPACT[1] + Math.sin(a) * l * 1.1], [IMPACT[0] + Math.cos(a + 0.12) * l, IMPACT[1] + Math.sin(a + 0.12) * l * 2]]);
});
const FISSURES = [
  ...RAYONS,
  ...SOMMETS.slice(1, -1).map((rang) => zigzag(rang)),
  ...Array.from({ length: COLS - 1 }, (_, k) => zigzag(SOMMETS.map((rang) => rang[k + 1]))),
];

/* Chauffe-eau dessiné assemblé (viewBox 640 × 560). data-ecart : déplacement vertical une fois éclaté ;
   data-ancre : départ du trait vers les étiquettes (x = 400). Ordre de peinture : du bas vers la cuve (dessus). */
const BALLON = brut(`<svg class="vec__svg ballon" viewBox="0 0 640 560" data-etiquettes="400" aria-hidden="true" focusable="false">
<defs><linearGradient id="ballon-corps" x1="0" x2="1"><stop offset="0" stop-color="#d6d1c6"/><stop offset=".32" stop-color="#fbfaf6"/><stop offset=".72" stop-color="#f0ede5"/><stop offset="1" stop-color="#c9c3b6"/></linearGradient></defs>
<g class="vec__piece" data-piece="6" data-ancre="276 396" data-ecart="132"><rect x="212" y="372" width="10" height="10" fill="#c9a25a"/><rect x="196" y="380" width="44" height="30" rx="7" fill="#d9a441" stroke="#8a6a20" stroke-width="2"/><circle cx="262" cy="392" r="14" fill="#fbfaf6" stroke="#16191d" stroke-width="2"/><path d="M262 392 L270 384" stroke="#c43d2c" stroke-width="2.5" stroke-linecap="round"/><rect x="212" y="410" width="10" height="14" fill="#c9a25a"/></g>
<g class="vec__piece" data-piece="5" data-ancre="270 342" data-ecart="116"><rect x="212" y="314" width="10" height="18" fill="#c9a25a"/><rect x="196" y="330" width="44" height="28" rx="7" fill="#d9a441" stroke="#8a6a20" stroke-width="2"/><rect x="238" y="336" width="32" height="12" rx="4" fill="#c43d2c"/><path d="M206 358 h24 l-6 14 h-12 z" fill="#9aa3ad" stroke="#5d656e" stroke-width="1.5"/></g>
<g class="vec__piece" data-piece="4" data-ancre="314 298" data-ecart="92"><rect x="262" y="312" width="10" height="20" fill="#b5602f"/><path d="M166 280 H314 V292 Q314 316 288 316 H192 Q166 316 166 292 Z" fill="#e8e4da" stroke="#16191d" stroke-width="2.5"/><circle cx="182" cy="296" r="3.5" fill="#16191d"/><circle cx="298" cy="296" r="3.5" fill="#16191d"/></g>
<g class="vec__piece" data-piece="3" data-ancre="302 266" data-ecart="64"><rect x="280" y="170" width="6" height="80" rx="2" fill="#9aa3ad"/><rect x="272" y="246" width="30" height="40" rx="6" fill="#fbfaf6" stroke="#16191d" stroke-width="2"/><circle cx="287" cy="260" r="7" fill="#ffc20e" stroke="#16191d" stroke-width="1.5"/><path d="M287 260 V254" stroke="#16191d" stroke-width="2" stroke-linecap="round"/><rect x="279" y="274" width="16" height="5" rx="2" fill="#9aa3ad"/></g>
<g class="vec__piece" data-piece="2" data-ancre="256 250" data-ecart="40"><path d="M224 282 V170 Q224 158 236 158 H244 Q256 158 256 170 V282" fill="none" stroke="#b5602f" stroke-width="8" stroke-linecap="round"/><path d="M224 282 V170 Q224 158 236 158 H244 Q256 158 256 170 V282" fill="none" stroke="#e39a6c" stroke-width="2" stroke-linecap="round"/><rect x="204" y="276" width="72" height="12" rx="3" fill="#9aa3ad" stroke="#16191d" stroke-width="1.5"/><rect x="226" y="288" width="6" height="9" fill="#5d656e"/><rect x="248" y="288" width="6" height="9" fill="#5d656e"/></g>
<g class="vec__piece" data-piece="1" data-ancre="330 150" data-ecart="-10"><rect x="176" y="14" width="26" height="14" rx="3" fill="#9aa3ad"/><rect x="278" y="14" width="26" height="14" rx="3" fill="#9aa3ad"/><rect x="150" y="24" width="180" height="262" rx="70" fill="url(#ballon-corps)" stroke="#16191d" stroke-width="3"/><path d="M152 96 H328 M152 214 H328" stroke="#d6d1c6" stroke-width="2"/><rect x="200" y="122" width="80" height="54" rx="8" fill="#1d5fd1"/><path d="M212 140 H250 M212 154 H242" stroke="#fff" stroke-width="3" stroke-linecap="round"/><path d="M272 130 l-9 15 h7 l-5 13 l13 -18 h-7 l5 -10 z" fill="#ffc20e"/></g>
</svg>`);

function reseau() {
  const froid = 'M0 440 H1200';
  const chaud = `M870 300 V470 H330 ${RISERS.filter((r) => r.chaud).map((r) => `M${r.x + 22} 470 V300`).join(' ')}`;
  const courant = `M55 150 V120 H1200 ${PRISES.map((p) => `M${p.x} 120 V196`).join(' ')}`;
  return brut(`<svg class="mur-reseau" viewBox="0 0 1200 560" aria-hidden="true" focusable="false">
<path class="res-froid res-lueur" d="${froid} ${RISERS.map((r) => `M${r.x} 440 V300`).join(' ')}"/>
<path class="res-chaud res-lueur" d="${chaud}"/>
<path class="res-courant res-lueur" d="${courant}"/>
<path class="res-froid" d="${froid}"/>
${RISERS.map((r, i) => `<path class="res-froid res-colonne" data-colonne="${i}" d="M${r.x} 440 V300"/>`).join('')}
<path class="res-chaud" d="${chaud}"/>
<path class="res-courant" d="${courant}"/>
<rect class="res-tableau" x="18" y="150" width="74" height="120" rx="8"/>
${[0, 1, 2].map((i) => `<rect class="res-disj" x="${29 + i * 19}" y="176" width="13" height="40" rx="3"/>`).join('')}
${PRISES.map((p) => `<rect class="res-prise" x="${p.x - 22}" y="196" width="44" height="44" rx="8"/><circle class="res-trou" cx="${p.x - 7}" cy="218" r="3"/><circle class="res-trou" cx="${p.x + 7}" cy="218" r="3"/>`).join('')}
</svg>`);
}

export default (c) => {
  const pc = (v, t) => ((v / t) * 100).toFixed(2);
  return html`
<section class="hero eau ecran" id="debut" data-plein-ecran>
  <div class="eau-scene">
    <div class="eau__fond">${c.media({ nom: 'grok/accueil-ouverture', alt: c.donnees.images['grok/accueil-ouverture'].alt, cadrage: '74% 48%', cadrageMobile: '56% 45%', priorite: true, classe: 'hero-media', sizes: '100vw' })}</div>
    <canvas class="eau__canvas" aria-hidden="true" data-effet="eau"></canvas>
    <div class="eau__voile" aria-hidden="true"></div>
  </div>
  <div class="hero-contenu conteneur">
    <p class="surtitre" data-anime="gsap">${c.t('accueil.hero.surtitre')}</p>
    <h1 class="hero-titre">
      <span class="ligne-masque"><span class="hero-ligne" data-anime="gsap">${c.t('accueil.hero.titre1')}</span></span>
      <span class="ligne-masque"><span class="hero-ligne" data-anime="gsap">${c.t('accueil.hero.titre2')}</span></span>
      <span class="ligne-masque"><span class="hero-ligne hero-ligne--eau" data-anime="gsap">${c.t('accueil.hero.titre3')}</span></span>
    </h1>
    <div class="hero-bas">
      <p class="hero-texte" data-anime="gsap">${c.t('accueil.hero.texte')}</p>
      <p class="hero-actions" data-anime="gsap">
        <a class="bouton bouton--jaune bouton--grand" href="tel:${c.site.contact.telephoneLien}" data-action-principale data-survol="magnetique">${icone.tel}${c.t('commun.appelerLong')}</a>
        ${c.lien('besoin', { classe: 'bouton bouton--contour', texte: c.t('accueil.hero.decrire') })}
      </p>
      <p class="hero-info" data-info-cle data-anime="gsap" data-effet="manometre">${manometre(45, 'hero-mano')}<span>${c.t('accueil.hero.info')}</span></p>
    </div>
    <p class="eau__indice" aria-hidden="true"><span class="eau__indice-souris">${c.t('accueil.hero.indiceSouris')}</span><span class="eau__indice-doigt">${c.t('accueil.hero.indiceDoigt')}</span></p>
  </div>
</section>

<section class="diag" id="probleme" data-raccord>
  <div class="conteneur diag-tete">
    <p class="surtitre" data-raccord-cible>${c.t('accueil.diag.surtitre')}</p>
    <h2 data-anime="lignes">${c.t('accueil.diag.titre')}</h2>
    <p data-anime>${c.t('accueil.diag.texte')}</p>
  </div>
  <div class="conteneur">
    <div class="tableau" data-effet="interrupteurs" data-visuel>
      <span class="vis vis--1" aria-hidden="true"></span><span class="vis vis--2" aria-hidden="true"></span><span class="vis vis--3" aria-hidden="true"></span><span class="vis vis--4" aria-hidden="true"></span>
      <ul class="inter-grille">${DIAG.map(([cle, id, picto], i) => { const p = trouver(c, id); return html`<li class="inter" style="--i:${i}">
        <button type="button" class="inter-bouton" aria-expanded="false" aria-controls="inter-${i}">
          <span class="inter-plaque" aria-hidden="true"><span class="inter-bascule"></span><span class="inter-led"></span></span>
          ${picto ? html`<img class="inter-picto" src="/assets/images/pictos/${picto}-320.webp" alt="" width="320" height="320" loading="lazy">` : html`<span class="inter-picto inter-picto--courant" aria-hidden="true"></span>`}
          <span class="inter-textes"><span class="inter-nom">${c.t('accueil.diag.' + cle)}</span>
          ${prix(c, p, { classe: 'inter-prix' })}
          <span class="inter-presta">${p.nom}</span></span>
        </button>
        <div class="inter-detail" id="inter-${i}" hidden>
          <ul>${(p.inclus.length ? p.inclus : p.detail.map((d) => d.join(' : '))).slice(0, 3).map((x) => html`<li>${x}</li>`)}</ul>
          <p class="inter-liens">${c.lien('prestations', { ancre: p.id, texte: c.t('commun.voirFiche') })} · ${c.lien('contact', { params: `prestation=${p.id}`, texte: c.t('commun.commander') })}</p>
        </div>
      </li>`; })}</ul>
      <div class="noir" aria-hidden="true" data-audit-ignorer></div>
      <p class="noir-indice" aria-hidden="true" data-audit-ignorer><span class="noir-indice-souris">${c.t('accueil.diag.indiceSouris')}</span><span class="noir-indice-doigt">${c.t('accueil.diag.indiceDoigt')}</span></p>
    </div>
    <p class="diag-autre">${c.lien('besoin', { classe: 'lien-fleche', texte: html`${c.s('accueil.diag.autre')} ${icone.fleche}` })}</p>
  </div>
</section>

<section class="prix-section conteneur" id="prix" data-raccord>
  ${c.media({ nom: 'site/debouchage-wc', alt: c.donnees.images['site/debouchage-wc'].alt, cadrage: '28% 50%', cadrageMobile: '45% 50%', classe: 'prix-photo', sizes: '(max-width: 760px) 92vw, 40vw', attrs: 'data-anime="rideau"' })}
  <div class="prix-texte">
    <p class="surtitre" data-raccord-cible>${c.t('accueil.prix.surtitre')}</p>
    <h2 data-anime="lignes">${c.t('accueil.prix.titre')}</h2>
    <p data-anime>${c.t('accueil.prix.texte')}</p>
    <div class="ticket" data-effet="goutte-prix">
      <span class="goutte" aria-hidden="true" data-goutte data-audit-ignorer></span><span class="eclabousse" aria-hidden="true" data-audit-ignorer></span>
      <p class="ticket-titre">${c.t('accueil.prix.ticketTitre')}</p>
      <ul class="ticket-lignes">${trouver(c, 'debouchage-wc').detail.map(([l, v]) => html`<li><span>${l}</span><span>${v}</span></li>`)}</ul>
      <p class="ticket-total"><span>${c.t('accueil.prix.ticketTotal')}</span>${prix(c, trouver(c, 'debouchage-wc'), { classe: 'ticket-prix' })}</p>
      <p class="ticket-note">${c.t('accueil.prix.ticketNote')}</p>
    </div>
    <ul class="coches" data-anime="cascade"><li>${c.t('accueil.prix.garantie1')}</li><li>${c.t('accueil.prix.garantie2')}</li></ul>
    <p>${c.lien('prestations', { classe: 'bouton bouton--encre', texte: c.t('accueil.prix.action'), attrs: 'data-survol="magnetique"' })}</p>
  </div>
</section>

<section class="etapes ecran epingle" id="comment" data-entete-cache data-raccord data-plein-ecran>
  <div class="conteneur etapes-tete">
    <p class="surtitre" data-raccord-cible>${c.t('accueil.etapes.surtitre')}</p>
    <h2 data-anime="lignes">${c.t('accueil.etapes.titre')}</h2>
  </div>
  <div class="conteneur etapes-scene" data-effet="vannes" data-visuel>
    <div class="etapes-tuyau" aria-hidden="true"><span class="etapes-eau"></span></div>
    <ol class="etapes-liste">${[1, 2, 3, 4].map((n) => html`<li class="etape" style="--i:${n - 1}">
      <span class="vanne" aria-hidden="true"><svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="26" class="vanne-roue"/><path d="M32 8v48M8 32h48M15 15l34 34M49 15 15 49" class="vanne-rayons"/><circle cx="32" cy="32" r="7" class="vanne-axe"/></svg></span>
      <span class="etape-num">${String(n).padStart(2, '0')}</span>
      <h3>${c.t(`accueil.etapes.e${n}t`)}</h3>
      <p>${c.t(`accueil.etapes.e${n}`)}</p>
    </li>`)}</ol>
    <p class="etapes-action">${c.lien('besoin', { classe: 'bouton bouton--jaune', texte: c.t('accueil.etapes.action') })}</p>
  </div>
</section>

<section class="mur ecran epingle" id="reseaux" data-entete-cache data-raccord data-plein-ecran>
  <div class="conteneur mur-tete">
    <p class="surtitre" data-raccord-cible>${c.t('accueil.mur.surtitre')}</p>
    <h2 data-anime="lignes">${c.t('accueil.mur.titre')}</h2>
    <p class="mur-legende" aria-hidden="true"><span class="leg leg--froid">${c.t('accueil.mur.eauFroide')}</span><span class="leg leg--chaud">${c.t('accueil.mur.eauChaude')}</span><span class="leg leg--courant">${c.t('accueil.mur.courant')}</span></p>
  </div>
  <p class="mur-glisser" aria-hidden="true">${c.t('accueil.mur.glisser')} →</p>
  <div class="mur-stage" tabindex="0" role="region" aria-label="${c.s('accueil.mur.titre')}">
    <div class="mur-scene" data-effet="derriere-le-mur" data-visuel>
      ${reseau()}
      ${RISERS.map((r, i) => { const p = trouver(c, r.presta); return html`<a class="mur-appareil" data-repere data-riser="${i}" href="${c.url('prestations', p.id)}" data-libelle="${c.libelle('prestations')}" style="left:${pc(r.x, 1200)}%;top:${pc(262, 560)}%"><img src="/assets/images/pictos/${r.picto}-320.webp" alt="" width="320" height="320" loading="lazy"><span class="mur-nom">${r.nom}</span><span class="mur-tarif"><span class="mur-quoi">${r.verbe}</span>${prix(c, p, { classe: 'mur-prix' })}</span></a>`; })}
      ${PRISES.map((q) => { const p = q.presta ? trouver(c, q.presta) : null; return html`<a class="mur-etiquette" data-repere href="${p ? c.url('prestations', p.id) : c.url('prestations', 'catalogue', 'reseau=electricite')}" data-libelle="${c.libelle('prestations')}" style="left:${pc(q.x, 1200)}%;top:${pc(6, 560)}%"><span class="mur-nom">${q.nom}</span><span class="mur-tarif">${q.verbe ? html`<span class="mur-quoi">${q.verbe}</span>` : ''}${prix(c, p, { classe: 'mur-prix' })}</span></a>`; })}
      <a class="mur-etiquette mur-etiquette--tableau" data-repere href="${c.url('prestations', 'catalogue', 'reseau=electricite')}" data-libelle="${c.libelle('prestations')}" style="left:${pc(14, 1200)}%;top:${pc(284, 560)}%"><span class="mur-nom">Tableau</span>${prix(c, null, { classe: 'mur-prix' })}</a>
      <div class="mur-enduit" aria-hidden="true" data-audit-ignorer>
        ${c.media({ nom: 'grok/accueil-mur', alt: '', cadrage: '50% 50%', classe: 'mur-enduit-img', sizes: '(max-width: 760px) 760px, 100vw' })}
        <div class="mur-eclats">${ECLATS.map((e) => html`<span class="eclat" style="left:${e.x}%;top:${e.y}%;width:${e.w}%;height:${e.h}%;clip-path:${e.poly};transform-origin:${e.ox}% ${e.oy}%"></span>`)}</div>
        <svg class="mur-fissures" viewBox="0 0 1200 560" preserveAspectRatio="none" aria-hidden="true" focusable="false">${brut(FISSURES.map((d) => `<path class="fissure-bord" d="${d}" pathLength="1"/><path d="${d}" pathLength="1"/>`).join(''))}</svg>
      </div>
    </div>
  </div>
  <div class="conteneur mur-bas">
    <p>${c.lien('prestations', { params: 'reseau=plomberie', ancre: 'catalogue', classe: 'lien-fleche lien-fleche--clair', texte: html`${c.s('accueil.mur.voirPlomberie')} ${icone.fleche}` })}</p>
    <p>${c.lien('prestations', { params: 'reseau=electricite', ancre: 'catalogue', classe: 'lien-fleche lien-fleche--clair', texte: html`${c.s('accueil.mur.voirElectricite')} ${icone.fleche}` })}</p>
  </div>
</section>

<section class="vec chauffe" id="chauffe-eau" data-raccord aria-labelledby="vec-titre">
  <div class="vec__cadre conteneur">
    <div class="vec__tete">
      <p class="surtitre" data-raccord-cible>${c.t('accueil.chauffe.surtitre')}</p>
      <h2 class="vec__titre" id="vec-titre" data-anime="lignes">${c.t('accueil.chauffe.titre')}</h2>
      <p class="vec__intro">${c.t('accueil.chauffe.intro')}</p>
    </div>
    <div class="vec__scene" data-effet="vue-eclatee">
      <div class="vec__plan">
        ${BALLON}
        <p class="vec__mention">${c.t('accueil.chauffe.mention')}</p>
      </div>
    </div>
    <div class="vec__pieces">
      <p class="vec__liste-titre surtitre" id="vec-liste">${c.t('accueil.chauffe.liste')}</p>
      <ol class="vec__liste" aria-labelledby="vec-liste">${[1, 2, 3, 4, 5, 6].map((n) => html`<li><button type="button" class="vec__legende" data-piece="${n}" aria-pressed="false"><span class="vec__num">${String(n).padStart(2, '0')}</span><span class="vec__textes"><span class="vec__nom">${c.t(`accueil.chauffe.p${n}`)}</span><span class="vec__presta">${c.t(`accueil.chauffe.p${n}t`)}</span></span></button></li>`)}</ol>
      <p class="vec__action">${c.lien('prestations', { params: 'famille=chauffe-eau', ancre: 'catalogue', classe: 'lien-fleche', texte: html`${c.s('accueil.chauffe.action')} ${icone.fleche}` })}</p>
    </div>
  </div>
</section>

<section class="zone" id="zone" data-raccord>
  <div class="conteneur zone-grille">
    <div class="zone-texte">
      <p class="surtitre" data-raccord-cible>${c.t('accueil.rayon.surtitre')}</p>
      <h2 data-anime="lignes">${c.t('accueil.rayon.titre')}</h2>
      <p data-anime>${c.t('accueil.rayon.texte')}</p>
      <ul class="puces-communes" data-anime="cascade">${c.donnees.communes.liste.map((m) => html`<li>${c.lien('rayon', { ancre: `commune-${m.id}`, texte: m.nom })}</li>`)}</ul>
      <p>${c.lien('rayon', { classe: 'bouton bouton--encre', texte: c.t('accueil.rayon.action') })}</p>
    </div>
    <div data-effet="ondes-60">${carte(c, { id: 'carte-accueil', libelle: c.s('accueil.rayon.carte') })}</div>
  </div>
</section>

<section class="engagements" id="engagements" data-raccord>
  ${c.media({ nom: 'grok/accueil-gouttes', alt: '', cadrage: '60% 50%', classe: 'engagements-fond', sizes: '100vw', attrs: 'data-fx="parallaxe" data-fx-force="12"' })}
  <div class="conteneur engagements-contenu">
    <p class="surtitre" data-raccord-cible>${c.t('accueil.engagements.surtitre')}</p>
    <h2 data-anime="lignes">${c.t('accueil.engagements.titre')}</h2>
    <ul class="raccords" data-effet="raccords">${[1, 2, 3, 4].map((n) => html`<li class="raccord" style="--i:${n - 1}">
      <svg class="ecrou" viewBox="0 0 60 60" aria-hidden="true" focusable="false"><path d="M30 4 52.5 17v26L30 56 7.5 43V17Z"/><circle cx="30" cy="30" r="11"/></svg>
      <h3>${c.t(`accueil.engagements.g${n}t`)}</h3><p>${c.t(`accueil.engagements.g${n}`)}</p>
    </li>`)}</ul>
  </div>
</section>

<section class="renovation ecran epingle" id="renovation" data-entete-cache data-fx="galerie" data-raccord>
  <div class="conteneur renovation-tete">
    <div>
      <p class="surtitre" data-raccord-cible>${c.t('accueil.renovation.surtitre')}</p>
      <h2 data-anime="lignes">${c.t('accueil.renovation.titre')}</h2>
    </div>
    <div class="renovation-intro"><p>${c.t('accueil.renovation.texte')}</p><p class="petit">${c.t('accueil.renovation.texte2')}</p></div>
  </div>
  <div class="piste renovation-piste" data-galerie tabindex="0" role="region" aria-label="${c.s('accueil.renovation.region')}">
    ${[['renovation-salle-de-bain', 1], ['renovation-cuisine', 2], ['renovation-piece', 3], ['renovation-pmr', 4]].map(([img, n]) => html`<article class="carte-reno" id="renovation-${n}">
      ${c.media({ nom: `grok/${img}`, alt: c.donnees.images[`grok/${img}`].alt, cadrage: c.donnees.images[`grok/${img}`].cadrage, classe: 'carte-reno-media', sizes: '(max-width: 760px) 78vw, 26vw' })}
      <h3><span class="carte-reno-num">${String(n).padStart(2, '0')}</span> ${c.t(`accueil.renovation.c${n}t`)}</h3>
      <p>${c.t(`accueil.renovation.c${n}`)}</p>
    </article>`)}
  </div>
  <div class="galerie-progres" aria-hidden="true"><span></span></div>
</section>

<section class="qui conteneur" id="qui" data-raccord>
  ${c.media({ nom: 'site/outils-debouchage', alt: c.donnees.images['site/outils-debouchage'].alt, cadrage: '50% 50%', classe: 'qui-media', sizes: '(max-width: 760px) 92vw, 44vw', attrs: 'data-fx="zoom"' })}
  <div class="qui-texte">
    <p class="surtitre" data-raccord-cible>${c.t('accueil.qui.surtitre')}</p>
    <h2 data-anime="lignes">${c.t('accueil.qui.titre')}</h2>
    <p class="citation" data-anime="mots">${c.t('accueil.qui.citation')}</p>
    <p data-anime>${c.t('accueil.qui.texte')}</p>
    <div class="pro" data-anime>
      <p class="pro-titre">${c.t('accueil.qui.proTitre')}</p>
      <p>${c.t('accueil.qui.proTexte')}</p>
      <p>${c.lien('contact', { params: 'sujet=partenaire', classe: 'lien-fleche', texte: html`${c.s('accueil.qui.proAction')} ${icone.fleche}` })}</p>
    </div>
  </div>
</section>

<section class="appel" id="appel" data-raccord>
  ${c.media({ nom: 'grok/accueil-appel', alt: '', cadrage: '60% 60%', classe: 'appel-fond', sizes: '100vw', attrs: 'data-fx="parallaxe"' })}
  <div class="conteneur appel-contenu">
    <p class="surtitre" data-raccord-cible>${c.t('accueil.appel.surtitre')}</p>
    <h2 data-anime="lignes">${c.t('accueil.appel.titre')}</h2>
    <p class="appel-actions" data-anime>
      <a class="appel-numero" href="tel:${c.site.contact.telephoneLien}" data-survol="magnetique">${icone.tel}${compteur(c)}</a>
      ${c.lien('contact', { classe: 'bouton bouton--contour-clair', texte: c.t('accueil.appel.rappel') })}
    </p>
  </div>
  <div class="ruban-section">
    <div class="ruban" id="ruban-communes" data-boucle-css data-effet="ruban"><p>${c.t('accueil.appel.ruban')} ${c.t('accueil.appel.ruban')}</p></div>
    <button type="button" class="ruban-pause" data-pause-pour="ruban-communes" data-libelle-pause="${c.s('commun.pause')}" data-libelle-lecture="${c.s('commun.lecture')}"><span data-libelle-bouton>${c.t('commun.pause')}</span></button>
  </div>
</section>
`;
};
