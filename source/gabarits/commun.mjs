/* Gabarit commun : head, en-tête, menu, pied de page, barre fixe du téléphone, voile, panneau d'intro « mise en service ».
   Les conventions data-* sont celles que lisent le socle JavaScript et l'audit (voir le README du socle). */
import { html, brut } from '../../outils/gabarit.mjs';

const navigation = (c) => c.site.navigation.filter((cle) => c.pages[cle] && (c.pages[cle].langues || c.langues).includes(c.l));

/* Icônes en ligne (décor). */
export const icone = {
  tel: brut('<svg class="ico" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6.6 3.5 9 3l1.6 4.2-2 1.4a12 12 0 0 0 6.8 6.8l1.4-2L21 15l-.5 2.4A2.5 2.5 0 0 1 18 19.5C10.5 19.2 4.8 13.5 4.5 6a2.5 2.5 0 0 1 2.1-2.5Z" fill="currentColor"/></svg>'),
  fleche: brut('<svg class="ico" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 12h13m-5-5 5 5-5 5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>'),
};

/* Manomètre : graduations de 0 à 60 min, aiguille posée sur la valeur (état final) ; le projet l'anime. */
export function manometre(valeur = 45, classe = '') {
  const a = (v) => -120 + (v / 60) * 240;
  const pt = (ang, r) => { const t = (ang - 90) * Math.PI / 180; return [50 + r * Math.cos(t), 50 + r * Math.sin(t)]; };
  const graduations = [0, 15, 30, 45, 60].map((v) => { const [x1, y1] = pt(a(v), 38); const [x2, y2] = pt(a(v), 31); return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"/>`; }).join('');
  const [ax, ay] = pt(-120, 42), [bx, by] = pt(120, 42);
  return brut(`<svg class="mano ${classe}" viewBox="0 0 100 100" aria-hidden="true" focusable="false" style="--angle:${a(valeur)}deg">
<circle class="mano-fond" cx="50" cy="50" r="47"/>
<path class="mano-arc" d="M${ax.toFixed(1)} ${ay.toFixed(1)} A42 42 0 1 1 ${bx.toFixed(1)} ${by.toFixed(1)}" pathLength="1"/>
<g class="mano-grad">${graduations}</g>
<g class="mano-aiguille"><path d="M50 50 L48 47 L50 14 L52 47 Z"/><circle cx="50" cy="50" r="5"/></g>
</svg>`);
}

function tete(c) {
  const p = c.page, cle = p.cle;
  const titre = c.s(`pages.${cle}.titre`), description = c.s(`pages.${cle}.description`);
  const ici = c.abs(c.url(cle));
  const imagePartage = c.abs(`/assets/partage/${p.partage === false ? 'accueil' : cle}-${c.l}.jpg`);
  const structure = c.donnees.structure ? JSON.stringify(c.donnees.structure).replace(/</g, '\\u003c') : '';
  return html`<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${titre}</title>
<meta name="description" content="${description}">
<meta name="robots" content="noindex, nofollow">
<link rel="canonical" href="${ici}">
<style>${brut(c.critique.css)}</style>
<script>${brut(c.critique.js)}</script>
${(c.site.polices || []).map((f) => html`<link rel="preload" href="${f}" as="font" type="font/woff2" crossorigin>\n`)}<link rel="stylesheet" href="${c.asset('css/socle.css')}">
<link rel="stylesheet" href="${c.asset('css/site.css')}">
<link rel="modulepreload" href="${c.asset('js/site.js')}">
<link rel="modulepreload" href="${c.asset('js/socle/index.js')}">
<script src="/assets/vendor/gsap.min.js" defer></script>
<script src="/assets/vendor/ScrollTrigger.min.js" defer></script>
<script src="/assets/vendor/SplitText.min.js" defer></script>
<script type="module" src="${c.asset('js/site.js')}"></script>
<meta name="theme-color" content="${c.site.couleurs.theme || c.site.couleurs.fond}">
<link rel="icon" href="/assets/images/favicon-32.png" type="image/png" sizes="32x32">
<link rel="apple-touch-icon" href="/assets/images/apple-touch-icon.png">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${c.site.nom}">
<meta property="og:locale" content="fr_FR">
<meta property="og:title" content="${titre}">
<meta property="og:description" content="${description}">
<meta property="og:url" content="${ici}">
<meta property="og:image" content="${imagePartage}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${c.s(`pages.${p.partage === false ? 'accueil' : cle}.partageAlt`)}">
<meta name="twitter:card" content="summary_large_image">
${structure ? html`<script type="application/ld+json">${brut(structure)}</script>` : ''}
</head>`;
}

function entete(c) {
  return html`<header data-entete>
  <div class="entete-rangee">
    <a class="entete-logo" href="${c.url('accueil')}" data-libelle="${c.libelle('accueil')}"${c.page.cle === 'accueil' ? brut(' aria-current="page"') : ''}>
      <img src="/assets/images/logo-encre.png" alt="" width="622" height="242"><span class="visuellement-cache">${c.site.nom}, ${c.s('pages.accueil.nav')}</span>
    </a>
    <nav data-nav aria-label="${c.s('commun.navigation')}">
      <ul>${navigation(c).filter((k) => k !== 'accueil').map((k) => html`<li>${c.lien(k)}</li>`)}</ul>
    </nav>
    <div class="entete-actions">
      <a class="bouton bouton--jaune entete-tel" href="tel:${c.site.contact.telephoneLien}">${icone.tel}<span>${c.site.contact.telephone}</span></a>
      <button type="button" data-menu-bouton aria-controls="menu" aria-expanded="false" data-libelle-ouvrir="${c.s('commun.menu')}" data-libelle-fermer="${c.s('commun.fermer')}"><span data-libelle-bouton>${c.t('commun.menu')}</span></button>
    </div>
  </div>
</header>
<div id="menu" data-menu role="dialog" aria-modal="true" aria-label="${c.s('commun.menu')}">
  <ul>${navigation(c).map((k, i) => html`<li style="--i:${i}">${c.lien(k, { classe: 'menu-lien' })}</li>`)}</ul>
  <p><a class="bouton bouton--jaune" href="tel:${c.site.contact.telephoneLien}">${icone.tel}${c.t('commun.appelerLong')}</a></p>
  <p><button type="button" class="lien" data-calme-bascule data-libelle-reduire="${c.s('commun.calmeReduire')}" data-libelle-retablir="${c.s('commun.calmeRetablir')}" data-libelle-systeme="${c.s('commun.calmeSysteme')}"><span data-libelle-bouton>${c.t('commun.calmeReduire')}</span></button></p>
</div>`;
}

function pied(c) {
  const communes = c.donnees.communes.liste;
  return html`<footer class="pied" id="pied" data-masque-barre>
  <div class="conteneur pied-grille">
    <div class="pied-marque">
      <img src="/assets/images/logo-clair.png" alt="${c.site.nom}" width="622" height="242" loading="lazy">
      <p>${c.site.contact.adresse}</p>
      <p><a class="pied-tel" href="tel:${c.site.contact.telephoneLien}">${c.site.contact.telephone}</a></p>
      <p class="pied-petit">${c.t('commun.siren')}</p>
    </div>
    <nav aria-label="${c.s('commun.sommaire')}">
      <p class="pied-titre">${c.t('commun.sommaire')}</p>
      <ul>${navigation(c).map((k) => html`<li>${c.lien(k)}</li>`)}</ul>
    </nav>
    <div>
      <p class="pied-titre">${c.t('commun.communes')}</p>
      <ul class="pied-communes">${communes.map((m) => html`<li>${c.lien('rayon', { ancre: `commune-${m.id}`, texte: m.nom })}</li>`)}</ul>
    </div>
    <div>
      <p class="pied-titre">${c.t('commun.confort')}</p>
      <ul>
        <li><button type="button" class="lien" data-calme-bascule data-libelle-reduire="${c.s('commun.calmeReduire')}" data-libelle-retablir="${c.s('commun.calmeRetablir')}" data-libelle-systeme="${c.s('commun.calmeSysteme')}"><span data-libelle-bouton>${c.t('commun.calmeReduire')}</span></button></li>
        <li><a href="#haut" data-sans-transition>${c.t('commun.retourHaut')}</a></li>
        <li><a href="${c.site.contact.facebook}" target="_blank" rel="noopener">${c.t('commun.facebook')} <span class="visuellement-cache">${c.t('commun.nouvelOnglet')}</span></a></li>
      </ul>
    </div>
  </div>
  <div class="conteneur pied-bas">
    <p>${c.t('commun.mentions')} · ${c.t('commun.confidentialite')}</p>
    <p>${c.t('commun.maquette')}</p>
    <p>© ${c.site.nom}</p>
  </div>
</footer>`;
}

function barre(c) {
  return html`<div data-barre-fixe>
  <a class="bouton bouton--jaune" href="tel:${c.site.contact.telephoneLien}">${icone.tel}${c.t('commun.appeler')}</a>
  ${c.page.cle !== 'besoin' ? c.lien('besoin', { classe: 'bouton bouton--encre', texte: c.t('commun.barreBesoin') }) : c.lien('contact', { classe: 'bouton bouton--encre', texte: html`${c.s('pages.contact.nav')}` })}
</div>`;
}

function voile(c) {
  return html`<div data-voile aria-hidden="true"><div class="voile-contenu"><img src="/assets/images/losanges.png" alt="" width="472" height="112"><span data-voile-libelle>${c.libelle(c.page.cle)}</span></div></div>`;
}

/* Panneau d'intro « mise en service » : le tuyau bleu et le câble jaune se rejoignent, le nom se remplit d'eau (vague,
   bulles), un arc électrique traverse « 60 » qui s'allume, le manomètre monte à 45, puis le panneau se vide comme une
   cuve (bord en vague qui descend). Visible et entier dès la première image. */
function panneau(c) {
  return html`<div class="ouverture-panneau" data-ouverture data-gouttiere="#f4f1ea" aria-hidden="true">
  <div class="ouv-moitie ouv-haut"></div><div class="ouv-moitie ouv-bas"></div>
  <svg class="ouv-reseaux" viewBox="0 0 1000 600" preserveAspectRatio="none" aria-hidden="true">
    <path class="ouv-tuyau" d="M-10 486 H430 Q480 486 480 456 V440" pathLength="1"/>
    <path class="ouv-tuyau-eau" d="M-10 486 H430 Q480 486 480 456 V440" pathLength="1"/>
    <path class="ouv-cable" d="M1010 508 H560 Q520 508 520 478 V452" pathLength="1"/>
  </svg>
  <div class="ouv-scene">
    <img class="ouv-losanges" src="/assets/images/losanges.png" alt="" width="472" height="112">
    <p class="ouv-nom"><span class="ouv-mot">DÉPANNAGE<span class="ouv-eau">DÉPANNAGE</span></span><span class="ouv-60">60<span class="ouv-60-lum">60</span><svg class="ouv-arc" viewBox="0 0 100 60" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path class="ouv-arc-halo" d="M0 30 H100"/><path class="ouv-arc-trait" d="M0 30 H100"/></svg></span></p>
    <div class="ouv-bas-ligne">
      ${manometre(45, 'ouv-mano')}
      <p class="ouv-ligne"><span class="ouv-chiffre" data-ouv-chiffre>45</span> ${c.t('commun.introMinutes')} · ${c.t('commun.introLigne')}</p>
    </div>
  </div>
</div>`;
}

export function page(c, contenu) {
  return html`<!doctype html>
<html lang="${c.l}" data-v="${c.v}" data-page="${c.page.cle}"${c.site.curseur ? brut(' data-curseur') : ''}>
${tete(c)}
<body id="haut">
${voile(c)}
${panneau(c)}
<a class="evitement" href="#contenu">${c.t('commun.evitement')}</a>
${entete(c)}
<main id="contenu" tabindex="-1"${c.page.sansAction ? brut(' data-sans-action') : ''}${c.page.sansEffet ? brut(' data-sans-effet') : ''}>
${contenu}
</main>
${pied(c)}
${barre(c)}
</body>
</html>`;
}
