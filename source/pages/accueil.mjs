/* Accueil « Deux réseaux » : ordre des sections = ordre dans lequel le visiteur en urgence cherche les informations
   (appeler, quel problème et quel prix, comment ça marche, ce qu'on répare, où, garanties, rénovation, qui, appel final). */
import { html, brut } from '../../outils/gabarit.mjs';
import { manometre, icone } from '../gabarits/commun.mjs';
import { prix, trouver, carte, imagePrestation } from '../gabarits/composants.mjs';

export const page = { cle: 'accueil', fichier: 'index', imagePartage: 'grok/accueil-ouverture-1280.webp' };

const DIAG = [
  ['fuite', 'recherche-de-fuite-simple', 'robinet'], ['wc', 'debouchage-wc', 'wc-bouche'], ['evacuation', 'debouchage-evier', 'evier'],
  ['eauChaude', 'probleme-de-ballon-d-eau-chaude', 'chauffe-eau'], ['humidite', 'j-ai-une-trace-d-humidite', 'canalisation'], ['prise', 'prises-electriques-standard', null],
];

/* Réseau dessiné derrière le mur (viewBox 1200 × 560) : eau froide, eau chaude, courant ; repères posés en % de la scène. */
const RISERS = [
  { x: 150, picto: 'wc-bouche', nom: 'WC', famille: 'wc' }, { x: 330, picto: 'lavabo', nom: 'Lavabo', famille: 'lavabo', chaud: true },
  { x: 510, picto: 'douche', nom: 'Douche', famille: 'douche', chaud: true }, { x: 690, picto: 'evier', nom: 'Évier', famille: 'evier', chaud: true },
  { x: 870, picto: 'chauffe-eau', nom: 'Chauffe-eau', famille: 'chauffe-eau' }, { x: 1050, picto: 'lave-vaisselle', nom: 'Électroménager', famille: 'electromenager' },
];
const PRISES = [{ x: 250, nom: 'Prises' }, { x: 610, nom: 'Points lumineux' }, { x: 960, nom: 'Mise aux normes' }];

function reseau() {
  const froid = `M0 440 H1200 ${RISERS.map((r) => `M${r.x} 440 V300`).join(' ')}`;
  const chaud = `M870 300 V470 H330 ${RISERS.filter((r) => r.chaud).map((r) => `M${r.x + 22} 470 V300`).join(' ')}`;
  const courant = `M110 120 H1200 ${PRISES.map((p) => `M${p.x} 120 V196`).join(' ')} M110 120 V170`;
  return brut(`<svg class="mur-reseau" viewBox="0 0 1200 560" aria-hidden="true" focusable="false" data-fx="trace">
<path class="res-froid" d="${froid}" data-fx-trait/>
<path class="res-chaud" d="${chaud}" data-fx-trait/>
<path class="res-courant" d="${courant}" data-fx-trait/>
<rect class="res-tableau" x="60" y="150" width="100" height="120" rx="8"/>
${[0, 1, 2].map((i) => `<rect class="res-disj" x="${76 + i * 24}" y="176" width="16" height="40" rx="3"/>`).join('')}
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
      <span class="goutte" aria-hidden="true" data-goutte></span><span class="eclabousse" aria-hidden="true"></span>
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
      ${RISERS.map((r) => html`<span class="mur-appareil" data-repere style="left:${pc(r.x, 1200)}%;top:${pc(260, 560)}%"><img src="/assets/images/pictos/${r.picto}-320.webp" alt="" width="320" height="320" loading="lazy"><span>${r.nom}</span></span>`)}
      ${PRISES.map((p) => html`<span class="mur-etiquette" data-repere style="left:${pc(p.x, 1200)}%;top:${pc(270, 560)}%">${p.nom}</span>`)}
      <span class="mur-etiquette mur-etiquette--tableau" data-repere style="left:${pc(110, 1200)}%;top:${pc(300, 560)}%">Tableau</span>
      <div class="mur-enduit" aria-hidden="true">${c.media({ nom: 'grok/accueil-mur', alt: '', cadrage: '50% 50%', classe: 'mur-enduit-img', sizes: '100vw' })}<span class="mur-bord"></span></div>
    </div>
  </div>
</section>

<section class="metiers conteneur" id="metiers" data-raccord>
  <article class="metier metier--eau">
    ${c.media({ nom: 'grok/accueil-plomberie', alt: c.donnees.images['grok/accueil-plomberie'].alt, cadrage: '58% 50%', classe: 'metier-media', sizes: '(max-width: 760px) 92vw, 28vw', attrs: 'data-fx="parallaxe"' })}
    <div><h3 data-raccord-cible>${c.t('accueil.mur.plomberie')}</h3><p>${c.t('accueil.mur.plomberieTexte')}</p>
    <p>${c.lien('prestations', { params: 'reseau=plomberie', ancre: 'catalogue', classe: 'lien-fleche', texte: html`${c.s('accueil.mur.voirPlomberie')} ${icone.fleche}` })}</p></div>
  </article>
  <article class="metier metier--courant">
    ${c.media({ nom: 'grok/accueil-electricite', alt: c.donnees.images['grok/accueil-electricite'].alt, cadrage: '50% 45%', classe: 'metier-media', sizes: '(max-width: 760px) 92vw, 28vw', attrs: 'data-fx="parallaxe"' })}
    <div><h3>${c.t('accueil.mur.electricite')}</h3><p>${c.t('accueil.mur.electriciteTexte')}</p>
    <p>${c.lien('prestations', { params: 'reseau=electricite', ancre: 'catalogue', classe: 'lien-fleche', texte: html`${c.s('accueil.mur.voirElectricite')} ${icone.fleche}` })}</p></div>
  </article>
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
      <a class="appel-numero" href="tel:${c.site.contact.telephoneLien}" data-survol="magnetique">${icone.tel}<span>${c.site.contact.telephone}</span></a>
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
