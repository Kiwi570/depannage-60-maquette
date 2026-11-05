/* Pont entre les modules de la bibliothèque (qui attendent pret([...]) de leur socle) et le socle du projet.
   GSAP et ScrollTrigger sont déjà chargés par la page ; Flip et OGL sont chargés à la demande depuis /assets/vendor.
   Mode calme, mesures et rafraîchissement regroupé : ceux du socle du projet, jamais recalculés ici. */
import { etat, rafraichir, boucle as boucleSocle } from '../socle/index.js?v=2';

const FICHIERS = { flip: 'Flip.min.js', ogl: 'ogl.min.js' };
const charges = {};
function script(nom) {
  return (charges[nom] ??= new Promise((ok, ko) => {
    const s = document.createElement('script');
    s.src = '/assets/vendor/' + FICHIERS[nom];
    s.onload = ok; s.onerror = () => ko(new Error('module : ' + nom + ' introuvable'));
    document.head.appendChild(s);
  }));
}

const html = document.documentElement;
export const socle = {
  gsap: null, ScrollTrigger: null, SplitText: null, Flip: null, OGL: null, lenis: null,
  get calme() { return etat.calme || html.classList.contains('calme'); },
  get souris() { return matchMedia('(hover: hover) and (pointer: fine)').matches; },
  get telephone() { return innerWidth < 700; },
  webgl() {
    if (/[?&]sanswebgl\b/.test(location.search)) return false;
    try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; }
  },
  rafraichir,
  /* Boucle des modules : fn(t, dt) en millisecondes, portée par la boucle unique du socle (arrêt hors écran, onglet caché, mode calme). */
  boucle(el, fn) {
    const b = boucleSocle(el, (dt, t) => fn(t * 1000, dt * 1000), { lourde: true });
    return { arreter: () => b.arreter() };
  },
  mesurer: rafraichir,
};

export async function pret(besoins = []) {
  const voulus = new Set(besoins.map((b) => b.toLowerCase()));
  for (const nom of ['flip', 'ogl']) if (voulus.has(nom)) { try { await script(nom); } catch (e) { console.warn(e); } }
  const g = window.gsap || null;
  socle.gsap = g;
  if (g && window.ScrollTrigger) socle.ScrollTrigger = window.ScrollTrigger;
  if (g && window.SplitText) socle.SplitText = window.SplitText;
  if (g && window.Flip && !socle.Flip) { g.registerPlugin(window.Flip); socle.Flip = window.Flip; }
  if (window.OGL) socle.OGL = window.OGL;
  return socle;
}
