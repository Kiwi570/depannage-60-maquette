// Vue éclatée : la section s'épingle, l'objet se décompose pièce par pièce au défilement, chaque pièce reçoit
// un trait qui se dessine (stroke-dashoffset, sans plugin) et une étiquette, puis l'objet se recompose.
// La liste des légendes (boutons) est l'équivalent lisible du schéma : survol ou focus met la pièce en valeur, clic la garde.
// Téléphone ou écran bas : pas d'épinglage, l'objet s'éclate pendant que le schéma traverse l'écran (sans recomposition).
// Mode calme : objet éclaté, tous les traits et toutes les étiquettes visibles, rien ne bouge.
import { pret } from '../socle.js?v=2';

const NS = 'http://www.w3.org/2000/svg';

/**
 * @param {HTMLElement} root  section.vec
 * @param {object} [options]
 * @param {number} [options.ecart=68]          écartement entre deux pièces voisines, en unités du viewBox (data-ecart sur une pièce pour la régler seule)
 * @param {number} [options.longueur=3]        durée de l'épinglage, en hauteurs d'écran
 * @param {number|boolean} [options.lissage=.6] valeur scrub de ScrollTrigger
 * @param {boolean} [options.recomposer=true]  l'objet se recompose en fin d'épinglage
 * @param {number} [options.leve=10]           soulèvement de la pièce mise en valeur, en unités du viewBox (0 pour couper)
 * @param {number} [options.largeurMin=700]    largeur à partir de laquelle la section s'épingle
 * @param {number} [options.hauteurMin=520]    hauteur à partir de laquelle la section s'épingle
 */
export async function init(root, options = {}) {
  const o = { ecart: 68, longueur: 3, lissage: .6, recomposer: true, leve: 10, largeurMin: 700, hauteurMin: 520, ...options };
  const s = await pret(['scrolltrigger']);
  const { gsap, ScrollTrigger } = s;
  const svg = root.querySelector('.vec__svg');
  const plan = root.querySelector('.vec__plan');
  const boutons = [...root.querySelectorAll('.vec__legende[data-piece]')];
  if (!svg || !plan || !boutons.length) return { detruire() {} };

  // Pièces : l'ordre de la liste (du haut vers le bas) donne l'écartement ; le trait part de data-ancre (repère du viewBox).
  const vb = svg.viewBox.baseVal;
  const xE = svg.dataset.etiquettes != null ? +svg.dataset.etiquettes : vb.x + vb.width * .64;
  const milieu = (boutons.length - 1) / 2;
  const pieces = boutons.map((b, i) => {
    const id = b.dataset.piece;
    const g = svg.querySelector(`.vec__piece[data-piece="${id}"]`);
    if (!g) return null;
    const [ax, ay] = (g.dataset.ancre || '0 0').trim().split(/[\s,]+/).map(Number);
    const dy = g.dataset.ecart != null ? +g.dataset.ecart : (i - milieu) * o.ecart;
    const trait = document.createElementNS(NS, 'path');
    trait.setAttribute('class', 'vec__trait'); trait.setAttribute('d', `M${ax} ${ay}H${xE}`); trait.setAttribute('pathLength', '1');
    const point = document.createElementNS(NS, 'circle');
    point.setAttribute('class', 'vec__point'); point.setAttribute('cx', ax); point.setAttribute('cy', ay); point.setAttribute('r', '3.5');
    g.append(trait, point);
    const et = document.createElement('span');
    et.className = 'vec__etiquette'; et.dataset.piece = id; et.setAttribute('aria-hidden', 'true');
    const num = document.createElement('b'); num.textContent = b.querySelector('.vec__num')?.textContent.trim() || String(i + 1).padStart(2, '0');
    const nom = document.createElement('span'); nom.textContent = b.querySelector('.vec__nom')?.textContent.trim() || b.textContent.trim();
    et.append(num, nom);
    et.style.setProperty('--x', ((xE - vb.x) / vb.width * 100).toFixed(3) + '%');
    plan.appendChild(et);
    return { id, b, g, trait, point, et, ay, dy, e: 0, t: 0, a: 0, l: 0 };
  }).filter(Boolean);

  // Rendu : e = éclatement (0 → 1), t = trait dessiné, a = étiquette visible, l = soulèvement de mise en valeur.
  const rendre = () => {
    for (const p of pieces) {
      const y = p.e * p.dy - p.l * o.leve;
      p.g.setAttribute('transform', `translate(0 ${y.toFixed(2)})`);
      p.trait.style.strokeDashoffset = String(1 - p.t);
      p.point.style.opacity = p.t > .01 ? '1' : '0';
      p.et.style.setProperty('--y', ((p.ay + y - vb.y) / vb.height * 100).toFixed(3) + '%');
      p.et.style.setProperty('--a', p.a.toFixed(3));
      p.et.style.visibility = p.a > .01 ? 'visible' : 'hidden';
      p.b.classList.toggle('est-vue', p.a > .5);
    }
  };

  // Mise en valeur : survol ou focus (temporaire), clic (gardée, aria-pressed), Échap pour relâcher.
  let survol = null, fixe = null;
  const montrer = () => {
    const id = survol ?? fixe;
    root.classList.toggle('vec--focus', id != null);
    for (const p of pieces) {
      const on = p.id === id;
      p.g.classList.toggle('est-mise', on); p.et.classList.toggle('est-mise', on); p.b.classList.toggle('est-mise', on);
      p.b.setAttribute('aria-pressed', String(p.id === fixe));
      if (s.calme || !o.leve) { p.l = on ? 1 : 0; rendre(); }
      else gsap.to(p, { l: on ? 1 : 0, duration: .35, ease: 'power2.out', overwrite: 'auto', onUpdate: rendre });
    }
  };
  const ecouteurs = [];
  const ecouter = (el, type, fn) => { el.addEventListener(type, fn); ecouteurs.push(() => el.removeEventListener(type, fn)); };
  for (const p of pieces) {
    ecouter(p.b, 'pointerenter', () => { survol = p.id; montrer(); });
    ecouter(p.b, 'pointerleave', () => { survol = null; montrer(); });
    ecouter(p.b, 'focus', () => { survol = p.id; montrer(); });
    ecouter(p.b, 'blur', () => { survol = null; montrer(); });
    ecouter(p.b, 'click', () => { fixe = fixe === p.id ? null : p.id; montrer(); });
  }
  ecouter(plan, 'pointerover', e => { const c = e.target.closest?.('[data-piece]'); const id = c && plan.contains(c) ? c.dataset.piece : null; if (id !== survol) { survol = id; montrer(); } });
  ecouter(plan, 'pointerleave', () => { survol = null; montrer(); });
  ecouter(root, 'keydown', e => { if (e.key === 'Escape' && fixe != null) { fixe = null; montrer(); } });
  const nettoyer = () => {
    ecouteurs.forEach(f => f());
    for (const p of pieces) { p.trait.remove(); p.point.remove(); p.et.remove(); p.g.removeAttribute('transform'); p.g.classList.remove('est-mise'); p.b.classList.remove('est-mise', 'est-vue'); p.b.setAttribute('aria-pressed', 'false'); }
    root.classList.remove('vec--focus', 'vec--vivant');
  };

  if (s.calme) {
    // État final : objet éclaté, tout est légendé, rien ne bouge.
    for (const p of pieces) { p.e = 1; p.t = 1; p.a = 1; }
    rendre();
    return { detruire: nettoyer };
  }

  // Scénario commun (unités arbitraires) : éclatement depuis le centre, traits puis étiquettes l'un après l'autre,
  // pause lisible, puis (épinglé seulement) les étiquettes s'effacent et l'objet se recompose.
  const construire = recompose => {
    const tl = gsap.timeline({ paused: true, defaults: { ease: 'power2.inOut' }, onUpdate: rendre });
    pieces.forEach((p, i) => tl.to(p, { e: 1, duration: 3 }, .25 * Math.abs(i - milieu)));
    pieces.forEach((p, i) => {
      tl.to(p, { t: 1, duration: 1, ease: 'power1.inOut' }, 2.4 + i * .45);
      tl.to(p, { a: 1, duration: .7, ease: 'power1.out' }, 2.9 + i * .45);
    });
    if (recompose) {
      const r = tl.duration() + 1.6;
      pieces.forEach((p, i) => {
        tl.to(p, { a: 0, duration: .5, ease: 'power1.in' }, r);
        tl.to(p, { t: 0, duration: .6, ease: 'power1.in' }, r + .1);
        tl.to(p, { e: 0, duration: 2.4 }, r + .6 + .2 * (milieu - Math.abs(i - milieu)));
      });
      tl.to({}, { duration: .4 });
    }
    return tl;
  };

  root.classList.add('vec--vivant');
  rendre();
  const grand = `(min-width: ${o.largeurMin}px) and (min-height: ${o.hauteurMin}px)`;
  const mm = gsap.matchMedia();
  mm.add(grand, () => {
    root.classList.add('vec--epinglee');
    const tl = construire(o.recomposer);
    const st = ScrollTrigger.create({
      trigger: root, start: 'top top', end: () => '+=' + Math.round(innerHeight * o.longueur), pin: true, scrub: o.lissage, animation: tl, invalidateOnRefresh: true,
      onToggle: self => root.classList.toggle('est-epingle', self.isActive),
    });
    return () => { st.kill(); tl.progress(0).kill(); root.classList.remove('vec--epinglee', 'est-epingle'); };
  });
  mm.add(`(max-width: ${o.largeurMin - 1}px), (max-height: ${o.hauteurMin - 1}px)`, () => {
    const tl = construire(false);
    const st = ScrollTrigger.create({ trigger: plan, start: 'top 85%', end: 'bottom 45%', scrub: o.lissage, animation: tl });
    return () => { st.kill(); tl.progress(0).kill(); };
  });
  s.rafraichir();
  return { detruire() { mm.revert(); nettoyer(); } };
}
