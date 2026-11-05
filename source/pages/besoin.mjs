/* Décrivez votre besoin — ouverture « carrelage » : plein écran clair, les carreaux se retournent en vague et laissent
   la première question au centre ; le questionnaire (3 questions) démarre dans le premier écran. */
import { html, brut } from '../../outils/gabarit.mjs';
import { icone } from '../gabarits/commun.mjs';
import { prix, trouver, imagePrestation, compteur } from '../gabarits/composants.mjs';

export const page = { cle: 'besoin', fichier: 'decrivez-votre-besoin', imagePartage: 'grok/diagnostic-ouverture-1280.webp' };

const ICONE_COURANT = '<svg viewBox="0 0 64 64" aria-hidden="true" focusable="false"><rect x="14" y="10" width="36" height="44" rx="8" fill="#fff" stroke="#16191d" stroke-width="3"/><circle cx="26" cy="32" r="3.5" fill="#16191d"/><circle cx="38" cy="32" r="3.5" fill="#16191d"/><path d="M34 2 26 18h8l-6 14" fill="none" stroke="#ffc20e" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/></svg>';

export default (c) => {
  const B = c.donnees.besoin;
  const ids = [...new Set(B.lieux.flatMap((l) => l.cas.flatMap((k) => k.prestations)))];
  return html`
<section class="tete-carrelage" id="questionnaire">
  ${c.media({ nom: 'grok/diagnostic-ouverture', alt: '', cadrage: '50% 50%', priorite: true, classe: 'carrelage-fond', sizes: '100vw', attrs: 'data-fx="parallaxe" data-fx-force="6"' })}
  <div class="carreaux" aria-hidden="true" data-effet="carrelage">${Array.from({ length: 40 }, (_, i) => html`<span style="--i:${i}"></span>`)}</div>
  <div class="conteneur questionnaire" data-questionnaire>
    <div class="q-tete">
      <p class="surtitre" data-raccord-cible>${c.t('besoin.tete.surtitre')}</p>
      <h1 data-anime="gsap" class="q-titre">${c.t('besoin.tete.titre')}</h1>
      <p class="q-texte" data-anime="gsap">${c.t('besoin.tete.texte')}</p>
      <p class="q-info" data-info-cle data-anime="gsap">${c.t('besoin.tete.info')}</p>
    </div>
    <div class="q-progression" data-anime="gsap" data-effet="niveau-eau">
      <p class="q-etat" aria-live="polite" data-q-etat>${c.t('besoin.etape', { n: 1 })}</p>
      <div class="q-tuyau" aria-hidden="true"><span data-q-eau></span></div>
    </div>
    <div class="q-corps" data-q-corps data-anime="gsap">
      <fieldset class="q-etape" data-q-etape="1">
        <legend class="q-question" tabindex="-1">${c.t('besoin.q1')}</legend>
        <div class="q-tuiles">${B.lieux.map((l, i) => html`<button type="button" class="q-tuile" data-lieu="${l.id}" aria-pressed="false"${i === 0 ? html` data-action-principale` : ''}>
          <span class="q-picto">${l.picto ? html`<img src="/assets/images/pictos/${l.picto}-320.webp" alt="" width="320" height="320">` : brut(ICONE_COURANT)}</span>
          <span class="q-nom">${l.nom}</span></button>`)}</div>
      </fieldset>
      <fieldset class="q-etape" data-q-etape="2" hidden>
        <legend class="q-question" tabindex="-1">${c.t('besoin.q2')}</legend>
        ${B.lieux.map((l) => html`<div class="q-choix" data-cas-pour="${l.id}" hidden>${l.cas.map((k) => html`<button type="button" class="q-puce" data-cas="${k.id}" aria-pressed="false">${k.nom}</button>`)}</div>`)}
        <button type="button" class="lien q-retour" data-q-retour>${c.t('besoin.retour')}</button>
      </fieldset>
      <fieldset class="q-etape" data-q-etape="3" hidden>
        <legend class="q-question" tabindex="-1">${c.t('besoin.q3')}</legend>
        <div class="q-choix">${B.delais.map((d) => html`<button type="button" class="q-puce" data-delai="${d.id}" aria-pressed="false">${d.nom}</button>`)}</div>
        <button type="button" class="lien q-retour" data-q-retour>${c.t('besoin.retour')}</button>
      </fieldset>
      <div class="q-resultat" data-q-etape="4" hidden tabindex="-1">
        <p class="q-question" data-q-titre-ok>${c.t('besoin.resultatTitre')}</p>
        <div class="q-aucune" data-q-aucune hidden><p class="q-question">${c.t('besoin.resultatAucune')}</p><p>${c.t('besoin.resultatAucuneTexte')}</p></div>
        <p class="q-urgence" data-q-urgence hidden>${icone.tel} ${c.t('besoin.urgence')} <a href="tel:${c.site.contact.telephoneLien}">${c.site.contact.telephone}</a></p>
        <div class="q-cartes">${ids.map((id) => { const p = trouver(c, id); return html`<article class="q-carte" data-presta="${p.id}" hidden>
          ${imagePrestation(c, p, { classe: 'q-carte-media', sizes: '(max-width: 760px) 40vw, 200px' })}
          <div class="q-carte-texte">
            <h2 class="q-carte-nom">${p.nom}</h2>
            <div class="q-carte-prix">${prix(c, p, { classe: 'fiche-prix' })}</div>
            ${p.inclus.length ? html`<ul>${p.inclus.slice(0, 3).map((x) => html`<li>${x}</li>`)}</ul>` : ''}
            <p class="q-carte-actions"><a class="bouton bouton--jaune" data-commander href="${c.url('contact', '', `prestation=${p.id}`)}" data-libelle="${c.libelle('contact')}">${c.t('commun.commander')}</a> ${c.lien('prestations', { ancre: p.id, classe: 'lien-fleche', texte: html`${c.s('commun.voirFiche')} ${icone.fleche}` })}</p>
          </div>
        </article>`; })}</div>
        <p class="q-fin"><a class="bouton bouton--encre" href="tel:${c.site.contact.telephoneLien}">${icone.tel}${c.t('commun.appelerLong')}</a> <button type="button" class="lien" data-q-recommencer>${c.t('besoin.recommencer')}</button></p>
      </div>
      <p class="q-sansjs">${c.lien('prestations', { classe: 'lien-fleche', texte: html`${c.s('pages.prestations.nav')} ${icone.fleche}` })}</p>
    </div>
  </div>
</section>

<script type="application/json" id="donnees-besoin">${brut(JSON.stringify({ lieux: B.lieux }).replace(/</g, '\\u003c'))}</script>

<section class="suite conteneur" id="ensuite">
  ${c.media({ nom: 'grok/diagnostic-siphon', alt: c.donnees.images['grok/diagnostic-siphon'].alt, cadrage: '58% 50%', classe: 'suite-media', sizes: '(max-width: 760px) 92vw, 44vw', attrs: 'data-anime="rideau"' })}
  <div>
    <p class="surtitre" data-raccord-cible>${c.t('besoin.suite.surtitre')}</p>
    <h2 data-anime="lignes">${c.t('besoin.suite.titre')}</h2>
    <p data-anime>${c.t('besoin.suite.texte')}</p>
    <ol class="suite-liste" data-anime="cascade">${[3, 4].map((n) => html`<li><b>${c.t(`accueil.etapes.e${n}t`)}</b> ${c.t(`accueil.etapes.e${n}`)}</li>`)}</ol>
  </div>
</section>

<section class="fin-page fin-page--nuit" id="fin">
  <div class="conteneur fin-page-grille">
    ${c.media({ nom: 'site/recherche-fuite', alt: c.donnees.images['site/recherche-fuite'].alt, cadrage: '52% 45%', classe: 'fin-media', sizes: '(max-width: 760px) 92vw, 34vw', attrs: 'data-fx="zoom"' })}
    <div>
      <h2 data-anime="lignes" data-raccord-cible>${c.t('besoin.fin.titre')}</h2>
      <p data-anime>${c.t('besoin.fin.texte')}</p>
      <p class="fin-actions" data-anime><a class="appel-numero appel-numero--moyen" href="tel:${c.site.contact.telephoneLien}" data-survol="magnetique">${icone.tel}${compteur(c)}</a></p>
    </div>
  </div>
</section>
`;
};
