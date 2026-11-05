// Eau qui réfracte : l'image d'ouverture vue à travers une eau vive (WebGL, OGL).
// Surface d'eau en champ de hauteur (houle déformée par un bruit + ronds), normale analytique, réfraction avec léger
// décalage chromatique et reflet spéculaire ; une goutte ouvre l'eau depuis le centre, le pointeur y dépose des ronds,
// l'eau se calme au défilement. Sans WebGL, en mode calme ou sous « réduire les animations » : image nette ou légère
// distorsion SVG figée ; sans JavaScript : image nette.
import { pret } from '../socle.js?v=1';

const N = 10; // ronds simultanés
const VERT = 'attribute vec2 uv; attribute vec2 position; varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position, 0.0, 1.0); }';
const FRAG = `precision highp float;
uniform sampler2D tMap; uniform vec2 uRes; uniform vec2 uImg; uniform vec2 uFocus;
uniform float uTime; uniform float uAgite; uniform float uIntro; uniform float uForce;
uniform vec3 uReflet; uniform vec3 uTeinte; uniform float uTeinteForce;
uniform vec4 uRonds[${N}];
varying vec2 vUv;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float bruit(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y); }
// Une vague : ajoute sa pente (dérivée analytique) à g.
void vague(inout vec2 g, vec2 p, vec2 d, float k, float v, float a){ g += d * (a * k * cos(dot(d, p) * k + uTime * v)); }
void main(){
  float rs = uRes.x / uRes.y;
  vec2 asp = vec2(rs, 1.0);
  vec2 p = vUv * asp;
  // Houle : quatre vagues de directions différentes, domaine déformé par un bruit lent (courant).
  vec2 q = p + 0.45 * vec2(bruit(p * 1.6 + uTime * 0.05), bruit(p * 1.6 + vec2(4.1, 1.7) - uTime * 0.04));
  vec2 g = vec2(0.0);
  vague(g, q, vec2(0.94, 0.34), 5.0, 0.62, 0.016);
  vague(g, q, vec2(-0.45, 0.89), 7.3, -0.48, 0.011);
  vague(g, q, vec2(0.71, -0.71), 11.0, 0.9, 0.006);
  vague(g, q, vec2(-0.2, -0.98), 17.0, -1.2, 0.003);
  g *= mix(0.12, 1.0, uAgite);
  // Ronds : onde circulaire amortie (pente analytique le long du rayon).
  float lum = 0.0;
  for (int i = 0; i < ${N}; i++){
    vec4 r = uRonds[i];
    float age = uTime - r.z;
    if (r.w <= 0.0 || age < 0.0 || age > 4.0) continue;
    vec2 d = p - r.xy * asp;
    float dist = length(d);
    float x = dist - age * 0.36;
    float env = exp(-x * x * 60.0) * exp(-age * 0.75) * r.w;
    float pente = cos(x * 52.0) * env * 0.02 * 52.0;
    g += d / (dist + 1e-4) * pente;
    lum += sin(x * 52.0) * env;
  }
  // Goutte d'ouverture : l'eau gagne l'image depuis le centre, l'extérieur reste net.
  vec2 dc = (vUv - 0.5) * asp; float dC = length(dc);
  float R = uIntro * (0.62 * max(rs, 1.0) + 0.7);
  float masque = smoothstep(R, R - 0.16, dC);
  float anneau = exp(-pow((dC - R) * 20.0, 2.0)) * (1.0 - uIntro);
  g = g * masque + dc / (dC + 1e-4) * anneau * 0.9;
  vec3 n = normalize(vec3(-g * uForce, 1.0));
  vec2 dec = n.xy * 0.06;
  // Image en « cover » autour du point focal, petite marge pour la déformation.
  float ri = uImg.x / uImg.y;
  vec2 ech = rs < ri ? vec2(rs / ri, 1.0) : vec2(1.0, ri / rs);
  vec2 f = vec2(uFocus.x, 1.0 - uFocus.y);
  vec2 uv = (vUv - 0.5) * ech + 0.5 + (f - 0.5) * (1.0 - ech);
  uv = (uv - 0.5) * 0.96 + 0.5;
  dec /= asp;
  vec3 col;
  col.r = texture2D(tMap, uv + dec * 1.12).r;
  col.g = texture2D(tMap, uv + dec).g;
  col.b = texture2D(tMap, uv + dec * 0.88).b;
  // Lumière : léger modelé, reflet spéculaire, crêtes des ronds.
  vec3 L = normalize(vec3(-0.3, 0.6, 0.75));
  vec3 H = normalize(L + vec3(0.0, 0.0, 1.0));
  float spec = pow(max(dot(n, H), 0.0), 150.0);
  col *= 0.94 + 0.12 * dot(n, L);
  col += uReflet * (spec * 0.55 * masque + max(lum, 0.0) * 0.1 + anneau * 0.35);
  col = mix(col, col * uTeinte * 1.6, uTeinteForce * masque);
  gl_FragColor = vec4(col, 1.0);
}`;

// Couleur CSS (variables, color-mix…) → [r, g, b] entre 0 et 1, résolue par le navigateur.
function rgb(root, valeur) {
  const i = document.createElement('i'); i.style.cssText = 'position:absolute;visibility:hidden;color:' + valeur;
  root.appendChild(i); const c = getComputedStyle(i).color; i.remove();
  const ctx = document.createElement('canvas').getContext('2d'); ctx.fillStyle = c; ctx.fillRect(0, 0, 1, 1);
  const d = ctx.getImageData(0, 0, 1, 1).data; return [d[0] / 255, d[1] / 255, d[2] / 255];
}
const css = ([r, g, b], a = 1) => `rgba(${r * 255 | 0},${g * 255 | 0},${b * 255 | 0},${a})`;

// Image de démonstration neutre, peinte d'après les variables : fond de bassin (dégradé, lueurs, carrelage, cercles).
function imageNeutre(root, w, h) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const x = c.getContext('2d');
  const fond = rgb(root, 'var(--couleur-fond)'), sec = rgb(root, 'var(--couleur-secondaire)'), acc = rgb(root, 'var(--couleur-accent)'), txt = rgb(root, 'var(--couleur-texte)');
  const lg = x.createLinearGradient(0, 0, 0, h);
  lg.addColorStop(0, css(sec.map((v, i) => v * .55 + fond[i] * .45))); lg.addColorStop(1, css(fond));
  x.fillStyle = lg; x.fillRect(0, 0, w, h);
  const lueur = (cx, cy, r, col, a) => { const g = x.createRadialGradient(cx, cy, 0, cx, cy, r); g.addColorStop(0, css(col, a)); g.addColorStop(1, css(col, 0)); x.fillStyle = g; x.fillRect(0, 0, w, h); };
  lueur(w * .78, h * .22, h * .75, acc, .55); lueur(w * .18, h * .85, h * .7, sec, .6);
  const pas = Math.round(h / 9);
  x.strokeStyle = css(txt, .16); x.lineWidth = Math.max(2, h / 400);
  x.beginPath();
  for (let i = pas / 2; i < w; i += pas) { x.moveTo(i, 0); x.lineTo(i, h); }
  for (let j = pas / 2; j < h; j += pas) { x.moveTo(0, j); x.lineTo(w, j); }
  x.stroke();
  x.strokeStyle = css(txt, .22); x.lineWidth = Math.max(3, h / 260);
  for (let k = 1; k <= 4; k++) { x.beginPath(); x.arc(w * .7, h * .52, k * h * .09, 0, Math.PI * 2); x.stroke(); }
  return c;
}

// Filtre SVG de distorsion figée (repli), injecté une seule fois dans la page.
function filtreFige() {
  if (document.getElementById('eau-figee')) return;
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('aria-hidden', 'true'); svg.setAttribute('width', '0'); svg.setAttribute('height', '0');
  svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
  svg.innerHTML = '<filter id="eau-figee" x="-2%" y="-2%" width="104%" height="104%"><feTurbulence type="fractalNoise" baseFrequency="0.006 0.012" numOctaves="2" seed="7"/><feDisplacementMap in="SourceGraphic" scale="14" xChannelSelector="R" yChannelSelector="G"/></filter>';
  document.body.appendChild(svg);
}

/**
 * @param {HTMLElement} root  section.eau (contient .eau__fond et canvas.eau__canvas)
 * @param {object} [options]
 * @param {string} [options.image]        URL d'une image ; sinon l'<img> présente dans .eau__fond ; sinon image neutre générée
 * @param {number[]} [options.focus=[.5,.5]] point focal de l'image (x, y entre 0 et 1) pour le recadrage
 * @param {number} [options.force=1]      intensité de la réfraction (0,4 à 1,6)
 * @param {boolean} [options.ouverture=true]  une goutte ouvre l'eau depuis le centre
 * @param {boolean} [options.clarifie=true]   l'eau se calme à mesure qu'on défile
 * @param {boolean} [options.gouttes=true]    gouttes spontanées de temps en temps (l'eau vit aussi sans souris)
 * @param {string} [options.reflet]       couleur CSS des reflets, --couleur-texte par défaut
 * @param {string} [options.teinte]       couleur CSS de l'eau, --couleur-secondaire par défaut
 * @param {number} [options.teinteForce=.18] part de la teinte (0 à .5)
 * @param {number} [options.dpr=1.5]      densité de pixels maximale sur ordinateur (1 sous 700 px)
 * @param {'svg'|'net'} [options.repli='svg'] repli sans WebGL / mode calme : distorsion SVG figée ou image nette
 * @returns {Promise<{detruire: Function, mesure: Function}>}
 */
export async function init(root, options = {}) {
  const o = { image: null, focus: [.5, .5], force: 1, ouverture: true, clarifie: true, gouttes: true, reflet: 'var(--couleur-texte)', teinte: 'var(--couleur-secondaire)', teinteForce: .18, dpr: 1.5, repli: 'svg', ...options };
  const fondEl = root.querySelector('.eau__fond');
  const canvas = root.querySelector('.eau__canvas');
  let img = fondEl?.querySelector('img');
  if (o.image && fondEl) {
    img = document.createElement('img'); img.alt = ''; img.decoding = 'async';
    if (new URL(o.image, location.href).origin !== location.origin) img.crossOrigin = 'anonymous';
    img.src = o.image; fondEl.appendChild(img);
  }
  const rien = { detruire() {}, mesure: () => null };
  const figer = () => { if (o.repli === 'svg') { filtreFige(); root.classList.add('eau--fige'); } return rien; };

  const s = await pret([]);
  if (!canvas || s.calme || !s.webgl()) return figer();
  await pret(['ogl']);
  if (!s.OGL) return figer();

  // Source de la texture : image décodée (pas de second téléchargement) ou image neutre générée.
  let source = null;
  if (img) {
    try { await (img.complete && img.naturalWidth ? Promise.resolve() : new Promise((ok, ko) => { img.addEventListener('load', ok, { once: true }); img.addEventListener('error', ko, { once: true }); })); await img.decode?.().catch(() => {}); source = img; }
    catch { source = null; }
  }
  if (!source) source = s.telephone ? imageNeutre(root, 720, 1200) : imageNeutre(root, 1600, 1000);
  const sw = source.naturalWidth || source.width, sh = source.naturalHeight || source.height;

  // Démarrage après le premier affichage.
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
  const O = s.OGL;
  let renderer, gl, program;
  try {
    renderer = new O.Renderer({ canvas, alpha: false, antialias: false, depth: false, dpr: Math.min(devicePixelRatio || 1, s.telephone ? 1 : o.dpr) });
    gl = renderer.gl;
  } catch { return figer(); }
  if (!gl) return figer();
  const tex = new O.Texture(gl, { image: source, generateMipmaps: false, minFilter: gl.LINEAR, magFilter: gl.LINEAR, wrapS: gl.CLAMP_TO_EDGE, wrapT: gl.CLAMP_TO_EDGE });
  const ronds = new Array(N * 4).fill(0);
  const u = {
    tMap: { value: tex }, uRes: { value: [1, 1] }, uImg: { value: [sw, sh] }, uFocus: { value: o.focus },
    uTime: { value: 0 }, uAgite: { value: 1 }, uIntro: { value: o.ouverture ? 0 : 1 }, uForce: { value: o.force },
    uReflet: { value: rgb(root, o.reflet) }, uTeinte: { value: rgb(root, o.teinte) }, uTeinteForce: { value: o.teinteForce },
    uRonds: { value: ronds },
  };
  try { program = new O.Program(gl, { vertex: VERT, fragment: FRAG, uniforms: u }); }
  catch { return figer(); }
  const mesh = new O.Mesh(gl, { geometry: new O.Triangle(gl), program });

  // Mesures gardées (aucune lecture de mise en page pendant le défilement) : taille, haut et hauteur de la section.
  let haut = 0, hauteur = 1;
  const mesurer = () => { const r = root.getBoundingClientRect(); renderer.setSize(r.width, r.height); u.uRes.value = [r.width, r.height]; haut = r.top + scrollY; hauteur = Math.max(1, r.height); };
  mesurer();
  // Premier rendu sous surveillance (image d'une autre origine sans CORS, contexte perdu…) : sinon repli.
  try { renderer.render({ scene: mesh }); if (gl.getError() === gl.CONTEXT_LOST_WEBGL) throw 0; }
  catch { try { gl.getExtension('WEBGL_lose_context')?.loseContext(); } catch {} return figer(); }

  const t0 = performance.now();
  const temps = () => (performance.now() - t0) / 1000;
  let indice = 0;
  const rond = (x, y, force) => { const i = indice++ % N * 4; ronds[i] = x; ronds[i + 1] = y; ronds[i + 2] = u.uTime.value; ronds[i + 3] = force; };
  const local = e => { const top = haut - scrollY; return [e.clientX / Math.max(1, u.uRes.value[0]), 1 - (e.clientY - top) / hauteur]; };

  // Pointeur : ronds dans le sillage (souris et doigt), goutte plus forte au clic, jamais sur un lien ou un bouton.
  let dernier = { x: -1, y: -1, t: 0 };
  const survol = e => {
    const [x, y] = local(e); const t = u.uTime.value;
    if (Math.hypot((x - dernier.x) * u.uRes.value[0], (y - dernier.y) * u.uRes.value[1]) > 40 && t - dernier.t > .07) { rond(x, y, e.pointerType === 'mouse' ? .5 : .8); dernier = { x, y, t }; }
  };
  const appui = e => { if (e.target.closest('a, button, input, select, textarea, label')) return; const [x, y] = local(e); rond(x, y, 1.3); };
  root.addEventListener('pointermove', survol, { passive: true });
  root.addEventListener('pointerdown', appui, { passive: true });
  const ro = new ResizeObserver(() => { mesurer(); renderer.render({ scene: mesh }); });
  ro.observe(root);

  // Garde-fou : si l'appareil peine (médiane > 34 ms), on baisse la densité, puis on revient au repli figé.
  let intervalles = [], arret = false, prochaine = 2.6, mediane = 0, images = 0;
  const surveiller = dt => {
    if (u.uTime.value < 1) return;
    intervalles.push(dt); if (intervalles.length < 40) return;
    mediane = intervalles.sort((a, b) => a - b)[20]; intervalles = [];
    if (mediane <= 34) return;
    if (renderer.dpr > .75) { renderer.dpr = Math.max(.75, renderer.dpr * .7); mesurer(); return; }
    arreter(); root.classList.remove('eau--actif'); figer();
  };

  const b = s.boucle(root, (t, dt) => {
    if (arret) return;
    const tt = temps(); u.uTime.value = tt; images++;
    if (o.ouverture && u.uIntro.value < 1) { const k = Math.min(1, Math.max(0, (tt - .15) / 1.8)); u.uIntro.value = 1 - Math.pow(1 - k, 3); }
    // L'eau se pose d'elle-même après l'ouverture, puis se clarifie au défilement.
    const base = .45 + .55 * Math.exp(-Math.max(0, tt - 1.5) / 2.5);
    let defil = 0;
    if (o.clarifie) defil = Math.min(1, Math.max(0, (scrollY - haut) / hauteur) * 1.6);
    u.uAgite.value = base * (1 - .8 * defil);
    if (o.gouttes && tt > prochaine) { rond(.15 + Math.random() * .7, .2 + Math.random() * .6, .55); prochaine = tt + 3 + Math.random() * 3; }
    surveiller(dt);
    renderer.render({ scene: mesh });
  });
  if (o.ouverture) rond(.5, .5, 1);
  function arreter() { arret = true; b.arreter(); ro.disconnect(); root.removeEventListener('pointermove', survol); root.removeEventListener('pointerdown', appui); }
  root.classList.add('eau--actif');

  return {
    /** dernière médiane mesurée (ms entre deux images), densité de pixels en cours, images rendues */
    mesure: () => ({ mediane, dpr: renderer.dpr, images, arret }),
    detruire() {
      arreter(); root.classList.remove('eau--actif', 'eau--fige');
      try { gl.getExtension('WEBGL_lose_context')?.loseContext(); } catch {}
    },
  };
}
