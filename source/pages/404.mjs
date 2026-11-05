/* 404 : le coude de cuivre qui fuit. */
import { html } from '../../outils/gabarit.mjs';
import { icone } from '../gabarits/commun.mjs';

export const page = { cle: '404', fichier: '404', partage: false };

export default (c) => html`
<section class="introuvable" id="introuvable">
  ${c.media({ nom: 'grok/404', alt: c.donnees.images['grok/404'].alt, cadrage: '62% 58%', cadrageMobile: '58% 50%', priorite: true, classe: 'introuvable-media', sizes: '100vw', attrs: 'data-fx="zoom"' })}
  <div class="conteneur introuvable-texte">
    <p class="surtitre">${c.t('introuvable.surtitre')}</p>
    <h1 data-anime="lignes">${c.t('introuvable.titre')}</h1>
    <p data-info-cle>${c.t('introuvable.texte')}</p>
    <p class="introuvable-actions">${c.lien('accueil', { classe: 'bouton bouton--jaune', texte: c.t('introuvable.retour'), attrs: 'data-action-principale' })} ${c.lien('prestations', { classe: 'lien-fleche', texte: html`${c.s('introuvable.prestations')} ${icone.fleche}` })}</p>
  </div>
</section>
`;
