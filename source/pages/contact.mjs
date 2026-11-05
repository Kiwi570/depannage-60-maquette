/* Contact — ouverture « prise-branchee » : compacte, fond jaune, la fiche se branche et le formulaire (étape 1) s'allume.
   Formulaire par étapes (module de la bibliothèque), simulé : rien n'est envoyé. Prérempli par ?prestation=, ?delai=, ?sujet=. */
import { html, brut } from '../../outils/gabarit.mjs';
import { icone } from '../gabarits/commun.mjs';
import { carte } from '../gabarits/composants.mjs';

export const page = { cle: 'contact', fichier: 'contact', imagePartage: 'grok/accueil-sac-640.webp' };


const FICHE = brut(`<svg class="prise-svg" viewBox="0 0 520 120" aria-hidden="true" focusable="false">
<path class="prise-cable" d="M-20 70 C 120 70, 160 20, 300 52 S 400 70, 404 66" pathLength="1"/>
<g class="prise-fiche"><rect x="380" y="46" width="54" height="40" rx="10"/><rect x="434" y="56" width="22" height="7" rx="2"/><rect x="434" y="70" width="22" height="7" rx="2"/></g>
<g class="prise-socle"><rect x="462" y="30" width="56" height="72" rx="12"/><circle cx="490" cy="66" r="20"/><circle class="prise-trou" cx="483" cy="60" r="3"/><circle class="prise-trou" cx="483" cy="73" r="3"/></g>
</svg>`);

export default (c) => { const F = c.donnees.formulaire; return html`
<section class="tete-prise" id="demande">
  <div class="conteneur tete-prise-grille">
    <div class="tete-prise-texte">
      <p class="surtitre surtitre--encre" data-raccord-cible>${c.t('contact.tete.surtitre')}</p>
      <h1 data-anime="gsap" class="tete-prise-titre">${c.t('contact.tete.titre')}</h1>
      <p data-anime="gsap">${c.t('contact.tete.texte')}</p>
      <p class="tete-prise-actions" data-anime="gsap"><a class="bouton bouton--encre" href="#formulaire" data-sans-transition data-action-principale>${c.t('contact.tete.remplir')}</a> <a class="tete-prise-tel" href="tel:${c.site.contact.telephoneLien}" data-info-cle>${icone.tel}${c.t('contact.tete.telephone')}</a></p>
      <div class="prise" data-effet="prise-branchee" data-visuel>${FICHE}</div>
    </div>

    <div class="fpe" id="formulaire" data-module="formulaire-par-etapes" data-anime="gsap">
      <div class="fpe__carton">
        <span class="fpe-led" aria-hidden="true"></span>
        <form class="fpe__form" action="#" method="post" novalidate>
          <div class="fpe__progression">
            <ol class="fpe__reperes" aria-label="${F.progression}"></ol>
            <div class="fpe__barre" aria-hidden="true"><span></span></div>
            <p class="fpe__etat" aria-live="polite"></p>
          </div>
          <fieldset class="fpe__etape" data-etape="${c.s('contact.form.e1')}">
            <legend class="fpe__legende"><h2 class="fpe__titre">${c.t('contact.form.q1')}</h2></legend>
            <fieldset class="fpe__groupe" data-libelle="${c.s('contact.form.type')}">
              <legend class="fpe__groupe-titre">${c.t('contact.form.type')} <i aria-hidden="true">*</i></legend>
              <div class="fpe__puces">${F.types.map((t, i) => html`<label class="fpe__puce"><input type="radio" name="type" value="${t}"${i === 0 ? brut(' required') : ''}><span class="fpe__choix-texte">${t}</span></label>`)}</div>
            </fieldset>
            <fieldset class="fpe__groupe" data-libelle="${c.s('contact.form.nature')}">
              <legend class="fpe__groupe-titre">${c.t('contact.form.nature')} <i aria-hidden="true">*</i></legend>
              <div class="fpe__puces">${F.natures.map((t, i) => html`<label class="fpe__puce"><input type="radio" name="nature" value="${t}"${i === 0 ? brut(' required') : ''}><span class="fpe__choix-texte">${t}</span></label>`)}</div>
            </fieldset>
          </fieldset>
          <fieldset class="fpe__etape" data-etape="${c.s('contact.form.e2')}">
            <legend class="fpe__legende"><h2 class="fpe__titre">${c.t('contact.form.q2')}</h2></legend>
            <div class="fpe__champ">
              <label for="fpe-prestation">${c.t('contact.form.prestation')}</label>
              <select id="fpe-prestation" name="prestation" data-libelle="${c.s('contact.form.prestation')}">
                <option value="">${c.t('contact.form.prestationAucune')}</option>
                ${c.donnees.prestations.prestations.map((p) => html`<option value="${p.id}" data-reseau="${c.donnees.prestations.familles.find((f) => f.id === p.famille).reseau}">${p.nom}</option>`)}
              </select>
            </div>
            <div class="fpe__grille">
              <div class="fpe__champ"><label for="fpe-piece">${c.t('contact.form.piece')}</label>
                <select id="fpe-piece" name="piece"><option value=""></option>${F.pieces.map((p) => html`<option>${p}</option>`)}</select></div>
              <div class="fpe__champ"><label for="fpe-delai">${c.t('contact.form.delai')}</label>
                <select id="fpe-delai" name="delai">${F.delais.map(([v, t]) => html`<option value="${v}">${t}</option>`)}</select></div>
            </div>
            <div class="fpe__champ">
              <label for="fpe-message">${c.t('contact.form.message')} <i aria-hidden="true">*</i></label>
              <textarea id="fpe-message" name="message" rows="4" minlength="10" required aria-describedby="fpe-message-aide"></textarea>
              <p class="fpe__aide" id="fpe-message-aide">${c.t('contact.form.messageAide')}</p>
            </div>
            <div class="fpe__champ"><label for="fpe-photos">${c.t('contact.form.photos')}</label><input id="fpe-photos" name="photos" type="file" accept="image/*" multiple></div>
          </fieldset>
          <fieldset class="fpe__etape" data-etape="${c.s('contact.form.e3')}">
            <legend class="fpe__legende"><h2 class="fpe__titre">${c.t('contact.form.q3')}</h2></legend>
            <div class="fpe__grille">
              <div class="fpe__champ"><label for="fpe-nom">${c.t('contact.form.nom')} <i aria-hidden="true">*</i></label><input id="fpe-nom" name="nom" autocomplete="family-name" required></div>
              <div class="fpe__champ"><label for="fpe-prenom">${c.t('contact.form.prenom')} <i aria-hidden="true">*</i></label><input id="fpe-prenom" name="prenom" autocomplete="given-name" required></div>
              <div class="fpe__champ"><label for="fpe-email">${c.t('contact.form.email')} <i aria-hidden="true">*</i></label><input id="fpe-email" name="email" type="email" autocomplete="email" required></div>
              <div class="fpe__champ"><label for="fpe-tel">${c.t('contact.form.tel')} <i aria-hidden="true">*</i></label><input id="fpe-tel" name="tel" type="tel" inputmode="tel" autocomplete="tel" required pattern="[0-9 +().\\-]{10,20}"></div>
            </div>
            <label class="fpe__case"><input type="checkbox" name="accord" value="oui" required data-libelle="${F.accord}" data-hors-recap><span class="fpe__choix-texte">${c.t('contact.form.accord')} <i aria-hidden="true">*</i></span></label>
            <p class="fpe__aide mention-donnees">${c.t('contact.form.donnees')}</p>
          </fieldset>
          <fieldset class="fpe__etape" data-etape="${c.s('contact.form.e4')}" data-recap>
            <legend class="fpe__legende"><h2 class="fpe__titre">${c.t('contact.form.q4')}</h2></legend>
            <div class="fpe__recap"></div>
          </fieldset>
          <div class="fpe__nav">
            <button class="fpe__bouton fpe__bouton--ligne" type="button" data-precedent>${c.t('contact.form.precedent')}</button>
            <button class="fpe__bouton" type="button" data-suivant>${c.t('contact.form.suivant')}</button>
            <button class="fpe__bouton" type="submit">${c.t('contact.form.envoyer')}</button>
          </div>
          <p class="fpe__note">${c.t('contact.form.simule')}</p>
        </form>
        <div class="fpe__fin" hidden data-message-envoi>
          <h2>${c.t('contact.form.finTitre')}</h2>
          <p>${c.t('contact.form.finTexte')}</p>
          <p data-resume></p>
          <button type="button" class="fpe__bouton fpe__bouton--ligne" data-recommencer>${c.t('contact.form.recommencer')}</button>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="acces conteneur" id="acces">
  <div class="acces-texte">
    <p class="surtitre" data-raccord-cible>${c.t('contact.acces.surtitre')}</p>
    <h2 data-anime="lignes">${c.t('contact.acces.titre')}</h2>
    <dl class="acces-liste" data-anime="cascade">
      <div><dt>${c.t('contact.acces.adresse')}</dt><dd>${c.site.contact.adresse}</dd></div>
      <div><dt>${c.t('contact.acces.telephone')}</dt><dd><a href="tel:${c.site.contact.telephoneLien}">${c.site.contact.telephone}</a></dd></div>
      <div><dt>${c.t('contact.acces.horaires')}</dt><dd class="a-completer">${c.t('contact.acces.horairesTexte')}</dd></div>
    </dl>
    <p><a class="lien-fleche" href="${c.site.contact.facebook}" target="_blank" rel="noopener">${c.t('contact.acces.facebook')} ${icone.fleche}</a></p>
  </div>
  <div class="acces-visuels">
    ${c.media({ nom: 'grok/accueil-sac', alt: c.donnees.images['grok/accueil-sac'].alt, cadrage: '55% 62%', classe: 'acces-media', sizes: '(max-width: 760px) 92vw, 24vw', attrs: 'data-anime="rideau"' })}
    <div data-effet="ondes-60">${carte(c, { id: 'carte-contact', libelle: c.s('contact.acces.carte') })}</div>
  </div>
</section>

<section class="fin-page fin-page--nuit" id="fin">
  <div class="conteneur fin-page-grille fin-page-grille--simple">
    ${c.media({ nom: 'grok/prestation-chauffe-eau', alt: c.donnees.images['grok/prestation-chauffe-eau'].alt, cadrage: '55% 45%', classe: 'fin-media', sizes: '(max-width: 760px) 92vw, 26vw', attrs: 'data-fx="zoom"' })}
    <div>
      <h2 data-anime="lignes" data-raccord-cible>${c.t('contact.fin.titre')}</h2>
      <p data-anime>${c.t('contact.fin.texte')}</p>
    </div>
    <p class="fin-actions" data-anime><a class="appel-numero appel-numero--moyen" href="tel:${c.site.contact.telephoneLien}" data-survol="magnetique">${icone.tel}<span>${c.site.contact.telephone}</span></a></p>
  </div>
</section>
`;
};
