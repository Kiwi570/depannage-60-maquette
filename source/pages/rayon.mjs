/* Rayon d'action — ouverture « ondes-60 » : scindée, fond bleu pâle, texte et recherche de commune à gauche,
   carte à droite avec les ondes qui partent de Longueil-Sainte-Marie. */
import { html, brut } from '../../outils/gabarit.mjs';
import { icone } from '../gabarits/commun.mjs';
import { carte, distance } from '../gabarits/composants.mjs';

export const page = { cle: 'rayon', fichier: 'rayon-d-action', imagePartage: 'grok/rayon-rue-1280.webp' };

const norm = (t) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z]+/g, ' ').trim();

export default (c) => {
  const k = c.donnees.communes;
  const donnees = JSON.stringify({
    liste: k.liste.map((m) => ({ id: m.id, nom: m.nom, n: norm(m.nom), km: distance(c, m) })),
    oise: k.oise.map((m) => ({ nom: m.nom, n: norm(m.nom) })),
    textes: { oui: c.s('rayon.tete.oui'), oise: c.s('rayon.tete.oise'), non: c.s('rayon.tete.non'), vide: c.s('rayon.tete.vide') },
  }).replace(/</g, '\\u003c');
  return html`
<section class="tete-ondes" id="zone">
  <div class="conteneur tete-ondes-grille">
    <div class="tete-ondes-texte">
      <p class="surtitre" data-raccord-cible>${c.t('rayon.tete.surtitre')}</p>
      <h1 data-anime="gsap" class="tete-ondes-titre">${c.t('rayon.tete.titre')}</h1>
      <p class="tete-ondes-info" data-info-cle data-anime="gsap">${c.t('rayon.tete.info')}</p>
      <p class="tete-ondes-chapo" data-anime="gsap">${c.t('rayon.tete.texte')}</p>
      <form class="commune-form" data-commune-form data-anime="gsap" novalidate>
        <label for="commune">${c.t('rayon.tete.champ')}</label>
        <div class="commune-rang">
          <input id="commune" name="commune" type="text" list="communes-liste" autocomplete="address-level2" placeholder="${c.s('rayon.tete.exemple')}">
          <button type="submit" class="bouton bouton--encre" data-action-principale>${c.t('rayon.tete.verifier')}</button>
        </div>
        <datalist id="communes-liste">${[...k.liste, ...k.oise].map((m) => html`<option value="${m.nom}"></option>`)}</datalist>
        <p class="commune-reponse" data-commune-reponse aria-live="polite"></p>
      </form>
    </div>
    <div class="tete-ondes-carte" data-effet="ondes-60" data-anime="gsap">${carte(c, { id: 'carte-rayon' })}</div>
  </div>
  <script type="application/json" id="donnees-communes">${brut(donnees)}</script>
</section>

<section class="communes conteneur" id="communes">
  <div class="communes-tete">
    <div>
      <p class="surtitre" data-raccord-cible>${c.t('rayon.liste.surtitre')}</p>
      <h2 data-anime="lignes">${c.t('rayon.liste.titre')}</h2>
      <p class="petit">${c.t('rayon.liste.texte')}</p>
    </div>
    ${c.media({ nom: 'grok/rayon-village', alt: c.donnees.images['grok/rayon-village'].alt, cadrage: '55% 60%', classe: 'communes-media', sizes: '(max-width: 760px) 92vw, 30vw', attrs: 'data-fx="parallaxe"' })}
  </div>
  <ul class="communes-grille">${k.liste.map((m) => html`<li class="commune" id="commune-${m.id}">
    <p class="commune-cp">${m.cp}</p>
    <h3>${m.nom}</h3>
    <p class="commune-km">${m.id === 'longueil-sainte-marie' ? c.t('rayon.liste.depart') : html`<b>${distance(c, m)} km</b> ${c.t('commun.aVolOiseau')}`}</p>
    <p><a class="lien-fleche" href="tel:${c.site.contact.telephoneLien}">${icone.tel} ${c.t('rayon.liste.appeler')}</a></p>
  </li>`)}</ul>
</section>

<section class="oise" id="oise">
  ${c.media({ nom: 'grok/rayon-rue', alt: c.donnees.images['grok/rayon-rue'].alt, cadrage: '60% 55%', classe: 'oise-fond', sizes: '100vw', attrs: 'data-fx="parallaxe"' })}
  <div class="conteneur oise-contenu">
    <p class="surtitre" data-raccord-cible>${c.t('rayon.oise.surtitre')}</p>
    <h2 data-anime="lignes">${c.t('rayon.oise.titre')}</h2>
    <p data-anime>${c.t('rayon.oise.texte')}</p>
    <ul class="puces-communes puces-communes--clair" data-anime="cascade">${k.oise.map((m) => html`<li><span>${m.nom}</span></li>`)}</ul>
    <p class="fin-actions">${c.lien('contact', { classe: 'bouton bouton--jaune', texte: c.t('rayon.oise.action') })} <a class="bouton bouton--contour-clair" href="tel:${c.site.contact.telephoneLien}">${icone.tel}${c.site.contact.telephone}</a></p>
  </div>
</section>
`;
};
