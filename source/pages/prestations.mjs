/* Prestations et tarifs — ouverture « étiquettes » : compacte, fond bleu nuit, étiquettes de prix suspendues qui tombent
   et se balancent. Puis le catalogue filtrable (réseau, famille, recherche), un prix détaillé ligne par ligne, la FAQ. */
import { html } from '../../outils/gabarit.mjs';
import { icone } from '../gabarits/commun.mjs';
import { prix, trouver, famille, imagePrestation, fmt } from '../gabarits/composants.mjs';

export const page = { cle: 'prestations', fichier: 'prestations', imagePartage: 'grok/prestations-pieces-800.webp' };

const ETIQUETTES = ['debouchage-wc', 'recherche-de-fuite-simple', 'j-ai-une-trace-d-humidite', 'prises-electriques-standard', 'robinet-de-machine-a-laver-a-remplacer'];
const norm = (t) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export default (c) => {
  const { familles, prestations } = c.donnees.prestations;
  const exemple = trouver(c, 'robinet-de-machine-a-laver-a-remplacer');
  return html`
<section class="tete-etiquettes" id="tarifs">
  <div class="conteneur tete-etiquettes-grille">
    <div class="tete-etiquettes-texte">
      <p class="surtitre" data-raccord-cible>${c.t('prestations.tete.surtitre')}</p>
      <h1><span class="ligne-masque"><span class="tete-ligne" data-anime="gsap">${c.t('prestations.tete.titre1')}</span></span><span class="ligne-masque"><span class="tete-ligne tete-ligne--jaune" data-anime="gsap">${c.t('prestations.tete.titre2')}</span></span></h1>
      <p class="tete-texte" data-anime="gsap">${c.t('prestations.tete.texte')}</p>
      <p class="tete-actions" data-anime="gsap">
        <a class="bouton bouton--jaune" href="#catalogue" data-action-principale data-sans-transition>${c.t('prestations.tete.action')} ${icone.fleche}</a>
        <span class="tete-info" data-info-cle>${c.t('prestations.tete.info')}</span>
      </p>
    </div>
    <div class="rail" data-effet="etiquettes" data-visuel aria-hidden="true">
      <span class="rail-barre"></span>
      ${ETIQUETTES.map((id, i) => { const p = trouver(c, id); return html`<a class="etiquette" href="#${p.id}" data-sans-transition tabindex="-1" style="--i:${i}">
        <span class="etiquette-ficelle"></span>
        <span class="etiquette-corps"><span class="etiquette-trou"></span>${prix(c, p, { classe: 'etiquette-prix' })}<span class="etiquette-nom">${p.nom}</span></span>
      </a>`; })}
    </div>
  </div>
</section>

<section class="cff catalogue" id="catalogue" data-module="catalogue-filtres-flip">
  <div class="conteneur">
    <div class="catalogue-tete">
      <h2 data-anime="lignes" data-raccord-cible>${c.t('prestations.catalogue.titre')}</h2>
    </div>
    <div class="cff__filtres" data-effet="filtres">
      <div class="cff__rang">
        <div class="cff__groupe" role="group" aria-label="${c.s('prestations.catalogue.reseau')}" data-filtre-groupe="reseau">
          <span class="cff__etiquette">${c.t('prestations.catalogue.reseau')}</span>
          <button type="button" data-valeur="tout" aria-pressed="true">${c.t('prestations.catalogue.tout')}</button>
          <button type="button" data-valeur="plomberie" aria-pressed="false">${c.t('prestations.catalogue.plomberie')}</button>
          <button type="button" data-valeur="electricite" aria-pressed="false">${c.t('prestations.catalogue.electricite')}</button>
        </div>
        <label class="recherche"><span class="visuellement-cache">${c.t('prestations.catalogue.recherche')}</span>
          <input type="search" data-recherche placeholder="${c.s('prestations.catalogue.rechercheExemple')}" autocomplete="off" enterkeyhint="search"></label>
      </div>
      <div class="cff__groupe cff__groupe--familles" role="group" aria-label="${c.s('prestations.catalogue.famille')}" data-filtre-groupe="famille">
        <span class="cff__etiquette">${c.t('prestations.catalogue.famille')}</span>
        <button type="button" data-valeur="tout" aria-pressed="true">${c.t('prestations.catalogue.tout')}</button>
        ${familles.map((f) => html`<button type="button" data-valeur="${f.id}" aria-pressed="false">${f.nom}</button>`)}
      </div>
      <p class="cff__compte" aria-live="polite"><b data-compte>${prestations.length}</b> <span data-compte-mot>${c.t('prestations.catalogue.compte2')}</span> · <button type="button" class="cff__reinit" data-reinit>${c.t('prestations.catalogue.reinit')}</button></p>
    </div>
    <div class="cff__grille" data-grille>
      ${prestations.map((p) => { const f = famille(c, p.famille); return html`<article class="cff__fiche fiche" id="${p.id}" data-reseau="${f.reseau}" data-famille="${p.famille}" data-prix="${p.prix ?? ''}" data-texte="${norm(p.nom + ' ' + f.nom)}">
        ${imagePrestation(c, p, { classe: 'cff__visuel' })}
        <p class="fiche-famille">${f.nom}</p>
        <h3 class="fiche-nom">${p.nom}</h3>
        ${prix(c, p, { classe: 'fiche-prix' })}
        ${p.detail.length || p.inclus.length || p.supplements.length ? html`<details class="fiche-detail">
          <summary>${c.t('commun.compris')}</summary>
          ${p.detail.length ? html`<ul class="fiche-lignes">${p.detail.map(([l, v]) => html`<li><span>${l}</span><span>${v}</span></li>`)}</ul>` : ''}
          ${p.duree ? html`<p class="fiche-duree">${c.t('prestations.catalogue.duree')} : ${p.duree}</p>` : ''}
          ${p.inclus.length ? html`<ul class="fiche-inclus">${p.inclus.map((x) => html`<li>${x}</li>`)}</ul>` : ''}
          ${p.nonInclus.length ? html`<p class="fiche-sous-titre">${c.t('commun.nonCompris')}</p><ul class="fiche-exclus">${p.nonInclus.map((x) => html`<li>${x}</li>`)}</ul>` : ''}
          ${p.supplements.length ? html`<p class="fiche-sous-titre">${c.t('prestations.catalogue.supplements')}</p><table class="fiche-table"><thead><tr><th scope="col">${c.t('prestations.catalogue.prise')}</th><th scope="col">${c.t('prestations.catalogue.avantDoublage')}</th><th scope="col">${c.t('prestations.catalogue.sousGoulotte')}</th></tr></thead><tbody>${p.supplements.map(([a, b, d]) => html`<tr><th scope="row">${a}</th><td>${b}</td><td>${d}</td></tr>`)}</tbody></table>` : ''}
        </details>` : ''}
        <p class="fiche-action">${c.lien('contact', { params: `prestation=${p.id}`, classe: 'lien-fleche', texte: html`${c.s('commun.commander')} ${icone.fleche}` })}</p>
      </article>`; })}
      <p class="cff__vide" data-vide hidden>${c.t('prestations.catalogue.vide')} <button type="button" class="cff__reinit" data-reinit>${c.t('prestations.catalogue.reinit')}</button></p>
    </div>
  </div>
</section>

<section class="inclus conteneur" id="inclus">
  ${c.media({ nom: 'grok/prestations-pieces', alt: c.donnees.images['grok/prestations-pieces'].alt, cadrage: '62% 50%', classe: 'inclus-media', sizes: '(max-width: 760px) 92vw, 40vw', attrs: 'data-anime="rideau"' })}
  <div>
    <p class="surtitre" data-raccord-cible>${c.t('prestations.inclus.surtitre')}</p>
    <h2 data-anime="lignes">${c.t('prestations.inclus.titre')}</h2>
    <p>${c.t('prestations.inclus.texte')}</p>
    <div class="ticket ticket--large" data-effet="goutte-prix">
      <span class="goutte" aria-hidden="true" data-goutte></span><span class="eclabousse" aria-hidden="true"></span>
      <p class="ticket-titre">${exemple.nom}</p>
      <ul class="ticket-lignes" data-anime="cascade">${exemple.detail.map(([l, v]) => html`<li><span>${l}</span><span>${v}</span></li>`)}</ul>
      <p class="ticket-total"><span>${c.t('accueil.prix.ticketTotal')}</span>${prix(c, exemple, { classe: 'ticket-prix' })}</p>
      <div class="ticket-colonnes">
        <div><p class="ticket-sous">${c.t('commun.compris')}</p><ul>${exemple.inclus.slice(0, 4).map((x) => html`<li>${x}</li>`)}</ul></div>
        <div><p class="ticket-sous">${c.t('commun.nonCompris')}</p><ul>${exemple.nonInclus.slice(0, 3).map((x) => html`<li>${x}</li>`)}</ul></div>
      </div>
    </div>
  </div>
</section>

<section class="faq-presta" id="faq">
  ${c.media({ nom: 'grok/prestations-faq', alt: '', cadrage: '72% 55%', classe: 'faq-fond', sizes: '100vw', attrs: 'data-fx="parallaxe"' })}
  <div class="conteneur faq-contenu">
    <p class="surtitre" data-raccord-cible>${c.t('prestations.faq.surtitre')}</p>
    <h2 data-anime="lignes">${c.t('prestations.faq.titre')}</h2>
    <div data-anime="cascade">${c.donnees.faq.map((f) => html`<details class="faq-item"><summary>${f.q}</summary><p>${f.r}</p></details>`)}</div>
  </div>
</section>

<section class="fin-page conteneur" id="fin">
  ${c.media({ nom: 'grok/accueil-outils', alt: c.donnees.images['grok/accueil-outils'].alt, cadrage: '50% 45%', classe: 'fin-media', sizes: '(max-width: 760px) 92vw, 34vw', attrs: 'data-fx="zoom"' })}
  <div>
    <h2 data-anime="lignes" data-raccord-cible>${c.t('prestations.fin.titre')}</h2>
    <p data-anime>${c.t('prestations.fin.texte')}</p>
    <p class="fin-actions" data-anime>${c.lien('besoin', { classe: 'bouton bouton--encre', texte: c.t('prestations.fin.action') })} <a class="bouton bouton--jaune" href="tel:${c.site.contact.telephoneLien}">${icone.tel}${c.t('commun.appelerLong')}</a></p>
  </div>
</section>
`;
};
