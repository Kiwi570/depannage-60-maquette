/* Composants partagés par les pages : prix, carte des communes, fiche prestation, image d'une prestation. */
import { html, brut } from '../../outils/gabarit.mjs';

export const fmt = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

/* Prix affiché : « dès 100 € TTC », « 149 € TTC » ou « Prix sur demande ». Jamais inventé. */
export function prix(c, p, { classe = 'prix' } = {}) {
  if (!p || p.prix == null) return html`<span class="${classe} ${classe}--demande" data-prix>${c.t('commun.surDemande')}</span>`;
  return html`<span class="${classe}" data-prix>${p.des ? html`<small>${c.t('commun.des')}</small> ` : ''}<b><span class="prix-n" data-compte-prix="${p.prix}">${fmt(p.prix)}</span> €</b> <small>${c.t('commun.ttc')}</small></span>`;
}

export const trouver = (c, id) => c.donnees.prestations.prestations.find((p) => p.id === id);
export const famille = (c, id) => c.donnees.prestations.familles.find((f) => f.id === id);

/* Image d'une prestation : photo du site, sinon image de la famille, sinon pictogramme du site. */
const FAMILLE_IMAGE = { prises: 'site/prises' }; /* familles sans pictogramme du site */
export function imagePrestation(c, p, { classe = '', sizes = '(max-width: 760px) 92vw, 30vw' } = {}) {
  const f = famille(c, p.famille);
  const nom = p.photo || FAMILLE_IMAGE[p.famille];
  const altFamille = (n) => (c.donnees.images[n] && c.donnees.images[n].alt) || f.nom;
  if (nom) return c.media({ nom, alt: p.photo ? altFamille(nom) : '', cadrage: (c.donnees.images[nom] && c.donnees.images[nom].cadrage) || '50% 50%', classe, sizes, ratio: '4 / 3' });
  return html`<div class="picto ${classe}" data-visuel>${f.picto ? html`<img src="/assets/images/pictos/${f.picto}-320.webp" alt="" width="320" height="320" loading="lazy">` : ''}</div>`;
}

/* Carte des communes (schéma, distances à vol d'oiseau). Coordonnées en km autour de Longueil-Sainte-Marie. */
const ETIQUETTES = {
  'longueil-sainte-marie': [-1.2, -2.4, 'fin', true], rivecourt: [1.8, 1.5, 'debut'], 'le-meux': [3.2, -2.6, 'debut'], chevrieres: [-3.4, 2.4, 'fin'],
  houdancourt: [-6.6, -0.6, 'fin'], verberie: [2.6, 4.4, 'debut'], 'saint-vaast-de-longmont': [3.6, 7.2, 'debut'], compiegne: [8.1, -9.2, 'milieu', true],
  creil: [-17.8, 8.2, 'milieu', true], lamorlaye: [-17.4, 23.4, 'debut', true],
};
const BOITE = { x: -26, y: -13, w: 42, h: 40 };
export function projeter(c, lat, lon) {
  const d = c.donnees.communes.depart;
  return [(lon - d.lon) * Math.cos(d.lat * Math.PI / 180) * 111.32, -(lat - d.lat) * 110.57];
}
export const distance = (c, m) => { const [x, y] = projeter(c, m.lat, m.lon); return Math.round(Math.hypot(x, y)); };
const pc = (v, o, t) => (((v - o) / t) * 100).toFixed(2);

export function carte(c, { id = 'carte', classe = '', ondes = true, libelle } = {}) {
  const k = c.donnees.communes;
  const riviere = k.riviere.map(([la, lo]) => projeter(c, la, lo));
  const dR = 'M' + riviere.map(([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`).join(' L');
  const anneaux = [10, 20, 30];
  return html`<div class="carte ${classe}" id="${id}" role="img" aria-label="${libelle || c.s('rayon.tete.carte')}" data-visuel data-carte>
  <svg viewBox="${BOITE.x} ${BOITE.y} ${BOITE.w} ${BOITE.h}" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">
    <defs><pattern id="${id}-grille" width="2" height="2" patternUnits="userSpaceOnUse"><path d="M2 0H0V2" fill="none" class="carte-grille"/></pattern></defs>
    <rect x="${BOITE.x}" y="${BOITE.y}" width="${BOITE.w}" height="${BOITE.h}" fill="url(#${id}-grille)"/>
    ${anneaux.map((r) => brut(`<circle class="carte-anneau" cx="0" cy="0" r="${r}" pathLength="1"/>`))}
    <path class="carte-riviere" d="${dR}" pathLength="1"/>
    <g class="carte-ondes" data-ondes>${ondes ? brut('<circle r="1"/><circle r="1"/><circle r="1"/>') : ''}</g>
    <path class="carte-trajet" data-trajet d="M0 0" pathLength="1"/>
    ${k.liste.map((m) => { const [x, y] = projeter(c, m.lat, m.lon); return brut(`<circle class="carte-point${m.id === 'longueil-sainte-marie' ? ' carte-point--depart' : ''}" data-point="${m.id}" cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="${m.id === 'longueil-sainte-marie' ? 1.1 : 0.7}"/>`); })}
  </svg>
  ${anneaux.filter((r) => r < 30).map((r) => html`<span class="carte-km" style="left:${pc(r * 0.5, BOITE.x, BOITE.w)}%;top:${pc(r * 0.866, BOITE.y, BOITE.h)}%" aria-hidden="true">${r} km</span>`)}
  <span class="carte-km carte-km--riviere" style="left:${pc(riviere[2][0] + 1.5, BOITE.x, BOITE.w)}%;top:${pc(riviere[2][1], BOITE.y, BOITE.h)}%" aria-hidden="true">${c.t('rayon.tete.riviere')}</span>
  ${k.liste.map((m) => { const [ex, ey, ancre, principale] = ETIQUETTES[m.id]; return html`<span class="carte-etiquette carte-etiquette--${ancre}${principale ? '' : ' carte-etiquette--secondaire'}" data-etiquette="${m.id}" data-repere style="left:${pc(ex, BOITE.x, BOITE.w)}%;top:${pc(ey, BOITE.y, BOITE.h)}%" aria-hidden="true">${m.nom}</span>`; })}
  <span class="carte-note" aria-hidden="true">${c.t('rayon.tete.schema')}</span>
</div>`;
}
