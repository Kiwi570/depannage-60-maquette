// Formulaire par étapes : les étapes sont décrites dans le HTML (fieldset[data-etape="Titre"]), le module ajoute
// la progression (repères + barre), la navigation Retour / Continuer, la validation native par étape (messages
// en français, liés aux champs par aria-describedby), le récapitulatif modifiable et un envoi simulé :
// aucun envoi réel, un événement « formulaire:envoye » porte les données, et un lien mailto: de repli est possible.
// Sans JavaScript : toutes les étapes sont visibles et le formulaire reste un formulaire HTML ordinaire.
import { pret } from '../socle.js?v=1';

const MESSAGES = {
  obligatoire: 'Ce champ est obligatoire.',
  choix: 'Choisissez une option pour continuer.',
  plusieurs: 'Choisissez au moins {n} option(s).',
  case: 'Cochez cette case pour continuer.',
  email: "Vérifiez l'adresse e-mail (exemple : nom@domaine.fr).",
  tel: 'Vérifiez le numéro de téléphone.',
  url: "Vérifiez l'adresse (exemple : https://exemple.fr).",
  court: 'Écrivez au moins {n} caractères.',
  format: "Le format n'est pas reconnu.",
  nombre: 'Vérifiez la valeur saisie.',
  erreurs: '{n} champ(s) à corriger.',
  etape: 'Étape {n} sur {total}',
  vide: 'Non précisé',
};

/**
 * @param {HTMLElement} root  section.fpe contenant un form.fpe__form
 * @param {object} [options]
 * @param {boolean} [options.animation=true]   glissement entre les étapes (coupé en mode calme)
 * @param {number}  [options.decalage=32]      amplitude du glissement, en px
 * @param {boolean} [options.defilement=true]  remet le haut du formulaire à l'écran quand l'étape change
 * @param {string}  [options.mailto='']        adresse de repli : affiche un lien « envoyer par e-mail » prérempli après l'envoi simulé
 * @param {string}  [options.sujet='Demande depuis le site']  objet du mail de repli
 * @param {object}  [options.messages]         remplace tout ou partie des messages (voir MESSAGES)
 * @returns {Promise<{ aller(n:number):void, donnees():object, recommencer():void, detruire():void }>}
 */
export async function init(root, options = {}) {
  const o = { animation: true, decalage: 32, defilement: true, mailto: '', sujet: 'Demande depuis le site', ...options };
  const M = { ...MESSAGES, ...(options.messages || {}) };
  const s = await pret(['gsap']);
  const { gsap } = s;
  const form = root.querySelector('form');
  const etapes = form ? [...form.querySelectorAll('fieldset[data-etape]')] : [];
  if (!etapes.length) return { aller() {}, donnees: () => ({}), recommencer() {}, detruire() {} };

  const uid = root.id || 'fpe' + Math.random().toString(36).slice(2, 7);
  const fin = root.querySelector('.fpe__fin');
  const precedent = form.querySelector('[data-precedent]');
  const suivant = form.querySelector('[data-suivant]');
  const envoyer = form.querySelector('[type="submit"]');
  const texteSuivant = suivant?.textContent;
  const total = etapes.length;
  const recapIndex = etapes.findIndex(e => e.hasAttribute('data-recap'));
  let cur = 0, retourRecap = false, anim = null;
  const fmt = (t, v) => t.replace(/\{(\w+)\}/g, (_, k) => v[k] ?? '');
  const calme = () => s.calme || !o.animation;

  // ---------- Progression : repères, barre, annonce ----------
  let reperes = root.querySelector('.fpe__reperes');
  if (!reperes) {
    const prog = document.createElement('div'); prog.className = 'fpe__progression';
    prog.innerHTML = `<ol class="fpe__reperes" aria-label="Progression"></ol><div class="fpe__barre" aria-hidden="true"><span></span></div><p class="fpe__etat" aria-live="polite"></p>`;
    form.prepend(prog);
    reperes = prog.querySelector('.fpe__reperes');
  }
  reperes.innerHTML = etapes.map((e, i) => `<li class="fpe__repere"><span class="fpe__num" aria-hidden="true">${i + 1}</span><span class="fpe__nom">${esc(e.dataset.etape)}</span></li>`).join('');
  const lis = [...reperes.children];
  const barre = root.querySelector('.fpe__barre > span');
  const etat = root.querySelector('.fpe__etat');
  const alerte = document.createElement('p'); alerte.className = 'socle-sr'; alerte.setAttribute('aria-live', 'assertive'); form.append(alerte);

  // ---------- Titres d'étape focalisables, erreurs liées aux champs ----------
  const titres = etapes.map(e => {
    const t = e.querySelector('.fpe__titre') || e.querySelector('legend') || e;
    t.setAttribute('tabindex', '-1');
    return t;
  });
  const conteneur = c => (c.type === 'radio' || c.type === 'checkbox') && !c.closest('.fpe__case') ? (c.closest('.fpe__groupe') || c.closest('fieldset')) : (c.closest('.fpe__champ, .fpe__case') || c.parentElement);
  // Un message par conteneur (champ, groupe de choix ou case) ; déjà présent dans le HTML (.fpe__erreur) ou créé.
  // Il est placé après une grille de cartes ou une case, à la fin d'un champ sinon.
  const erreurs = new Map();
  const erreurDe = c => {
    const box = conteneur(c);
    let e = erreurs.get(box);
    if (!e) {
      const dehors = box.matches('.fpe__cartes, .fpe__puces, .fpe__case');
      e = (dehors ? box.nextElementSibling : box.querySelector(':scope > .fpe__erreur'));
      if (!e?.classList.contains('fpe__erreur')) {
        e = document.createElement('p'); e.className = 'fpe__erreur'; e.hidden = true;
        if (dehors) box.after(e); else box.append(e);
      }
      e.id ||= `${uid}-err-${(c.name || c.id || 'champ').replace(/\W/g, '')}`;
      erreurs.set(box, e);
    }
    return e;
  };
  const controles = e => [...e.querySelectorAll('input, select, textarea')].filter(c => c.name && !c.disabled && c.type !== 'hidden' && c.type !== 'submit' && c.type !== 'button');
  for (const e of etapes) for (const c of controles(e)) {
    const err = erreurDe(c);
    const d = (c.getAttribute('aria-describedby') || '').split(' ').filter(Boolean);
    if (!d.includes(err.id)) c.setAttribute('aria-describedby', [...d, err.id].join(' '));
  }

  // ---------- Validation (contraintes natives, messages en français) ----------
  const groupeMin = c => { const g = c.closest('[data-min]'); return g ? +g.dataset.min || 1 : 0; };
  function message(c) {
    if (c.type === 'checkbox' && groupeMin(c)) {
      const g = c.closest('[data-min]'), n = groupeMin(c);
      return g.querySelectorAll('input[type="checkbox"]:checked').length >= n ? '' : fmt(M.plusieurs, { n });
    }
    c.setCustomValidity('');
    const v = c.validity;
    if (v.valid) return '';
    if (c.dataset.message) return c.dataset.message;
    if (v.valueMissing) return c.type === 'radio' || c.tagName === 'SELECT' ? M.choix : c.type === 'checkbox' ? M.case : M.obligatoire;
    if (v.typeMismatch) return M[c.type] || M.format;
    if (v.tooShort) return fmt(M.court, { n: c.minLength });
    if (v.patternMismatch) return c.type === 'tel' ? M.tel : M.format;
    return M.nombre;
  }
  function marquer(c, msg) {
    const box = conteneur(c), err = erreurDe(c);
    const membres = (c.type === 'radio' || c.type === 'checkbox') && !c.closest('.fpe__case') ? [...box.querySelectorAll(`input[name="${CSS.escape(c.name)}"]`)] : [c];
    for (const m of membres) { m.setAttribute('aria-invalid', msg ? 'true' : 'false'); m.setCustomValidity(msg && m.type === 'checkbox' && groupeMin(m) ? msg : ''); }
    box.classList.toggle('est-invalide', !!msg);
    err.textContent = msg; err.hidden = !msg;
  }
  function valider(i) {
    const vus = new Set(); const fautifs = [];
    for (const c of controles(etapes[i])) {
      const cle = (c.type === 'radio' || (c.type === 'checkbox' && groupeMin(c))) ? c.name : c;
      if (vus.has(cle)) continue; vus.add(cle);
      const msg = message(c); marquer(c, msg);
      if (msg) fautifs.push(c.type === 'radio' ? (etapes[i].querySelector(`input[name="${CSS.escape(c.name)}"]:checked`) || c) : c);
    }
    if (fautifs.length) { annoncer(fmt(M.erreurs, { n: fautifs.length })); fautifs[0].focus(); }
    return !fautifs.length;
  }
  // Une fois signalé, un champ se revalide à la saisie (l'erreur disparaît dès qu'elle est corrigée).
  const surSaisie = e => {
    const c = e.target; if (!c.name) return;
    const box = conteneur(c);
    if (box?.classList.contains('est-invalide')) marquer(c, message(c));
  };
  form.addEventListener('input', surSaisie);
  form.addEventListener('change', surSaisie);
  let minuterie = 0;
  function annoncer(t) { alerte.textContent = ''; clearTimeout(minuterie); minuterie = setTimeout(() => { alerte.textContent = t; }, 60); }

  // ---------- Données et récapitulatif ----------
  const nettoie = t => (t || '').replace(/\s*\*\s*$/, '').replace(/\s+/g, ' ').trim();
  function libelle(c) {
    if (c.dataset.libelle) return c.dataset.libelle;
    const g = c.closest('[data-libelle]'); if (g) return g.dataset.libelle;
    if ((c.type === 'radio' || c.type === 'checkbox') && !c.closest('.fpe__case')) { const f = c.closest('.fpe__groupe, fieldset'); const l = f?.querySelector('legend, .fpe__groupe-titre'); return nettoie(l?.textContent); }
    const l = c.labels?.[0]; return nettoie((l?.querySelector('.fpe__libelle') || l)?.textContent);
  }
  const texteChoix = c => nettoie((c.closest('label')?.querySelector('.fpe__carte-titre, .fpe__choix-texte') || c.closest('label'))?.textContent) || c.value;
  function donnees() {
    const valeurs = {}, resume = [];
    etapes.forEach((e, i) => {
      if (i === recapIndex) return;
      const champs = [], vus = new Set();
      for (const c of controles(e)) {
        if (vus.has(c.name)) continue; vus.add(c.name);
        let brut, lu;
        if (c.type === 'radio') { const x = e.querySelector(`input[name="${CSS.escape(c.name)}"]:checked`); brut = x ? x.value : ''; lu = x ? texteChoix(x) : ''; }
        else if (c.type === 'checkbox' && !c.closest('.fpe__case')) { const xs = [...e.querySelectorAll(`input[name="${CSS.escape(c.name)}"]:checked`)]; brut = xs.map(x => x.value); lu = xs.map(texteChoix).join(', '); }
        else if (c.type === 'checkbox') { brut = c.checked; lu = c.checked ? 'Oui' : 'Non'; }
        else if (c.type === 'file') { brut = [...c.files].map(f => f.name); lu = brut.join(', '); }
        else if (c.tagName === 'SELECT') { brut = c.value; lu = c.selectedOptions[0]?.textContent.trim() || ''; }
        else { brut = c.value.trim(); lu = brut; }
        valeurs[c.name] = brut;
        if (!c.hasAttribute('data-hors-recap')) champs.push({ nom: c.name, libelle: libelle(c), valeur: lu });
      }
      resume.push({ etape: i, titre: e.dataset.etape, champs });
    });
    const texte = resume.map(g => `${g.titre}\n` + g.champs.map(c => `- ${c.libelle} : ${c.valeur || M.vide}`).join('\n')).join('\n\n');
    return { valeurs, resume, texte };
  }
  function remplirRecap() {
    const zone = recapIndex >= 0 && etapes[recapIndex].querySelector('.fpe__recap'); if (!zone) return;
    zone.innerHTML = donnees().resume.map(g => `<div class="fpe__recap-groupe"><div class="fpe__recap-tete"><h4>${esc(g.titre)}</h4><button type="button" class="fpe__modifier" data-aller="${g.etape}">Modifier<span class="socle-sr"> : ${esc(g.titre)}</span></button></div><dl>${g.champs.map(c => `<div><dt>${esc(c.libelle)}</dt><dd>${c.valeur ? esc(c.valeur) : `<em>${esc(M.vide)}</em>`}</dd></div>`).join('')}</dl></div>`).join('');
  }

  // ---------- Navigation ----------
  root.classList.add('fpe--actif');
  function afficher(n, dir) {
    const avant = etapes[cur], apres = etapes[n];
    cur = n;
    if (n === recapIndex) { remplirRecap(); retourRecap = false; }
    anim?.kill();
    etapes.forEach((e, i) => { e.hidden = i !== n; });
    lis.forEach((li, i) => { li.classList.toggle('est-fait', i < n); li.classList.toggle('est-actif', i === n); if (i === n) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current'); });
    if (barre) barre.style.transform = `scaleX(${(n + 1) / total})`;
    if (etat) etat.textContent = fmt(M.etape, { n: n + 1, total }) + ' · ' + apres.dataset.etape;
    if (precedent) precedent.hidden = n === 0;
    const derniere = n === total - 1;
    if (suivant) { suivant.hidden = derniere; suivant.textContent = retourRecap && recapIndex > n ? (suivant.dataset.retour || 'Revenir au récapitulatif') : texteSuivant; }
    if (envoyer) envoyer.hidden = !derniere;
    if (dir && avant !== apres && !calme() && gsap) anim = gsap.fromTo(apres, { x: o.decalage * dir, opacity: 0 }, { x: 0, opacity: 1, duration: .5, ease: 'power3.out', clearProps: 'transform,opacity' });
    if (dir) {
      if (o.defilement) ramener();
      titres[n].focus({ preventScroll: true });
    }
  }
  function ramener() {
    const eh = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--entete-h')) || 0;
    const haut = form.getBoundingClientRect().top;
    if (haut >= eh && haut < innerHeight * .5) return;
    const y = scrollY + haut - eh - 16;
    if (s.lenis) s.lenis.scrollTo(y, { immediate: s.calme }); else scrollTo({ top: y, behavior: s.calme ? 'auto' : 'smooth' });
  }
  function aller(n) {
    n = Math.max(0, Math.min(total - 1, n));
    if (n === cur) return;
    if (n > cur) { for (let i = cur; i < n; i++) if (i !== recapIndex && !valider(i)) { if (i !== cur) { afficher(i, -1); valider(i); } return; } }
    afficher(n, n > cur ? 1 : -1);
  }
  const avancer = () => aller(retourRecap && recapIndex > cur ? recapIndex : cur + 1);
  const surClic = e => {
    if (e.target.closest('[data-suivant]')) avancer();
    else if (e.target.closest('[data-precedent]')) aller(cur - 1);
    else { const m = e.target.closest('[data-aller]'); if (m) { retourRecap = true; aller(+m.dataset.aller); } }
  };
  form.addEventListener('click', surClic);
  // Entrée dans un champ : étape suivante (jamais d'envoi prématuré).
  const surEnvoi = e => {
    e.preventDefault();
    if (cur < total - 1) { avancer(); return; }
    for (let i = 0; i < total; i++) if (i !== recapIndex && !valider(i)) { afficher(i, -1); valider(i); return; }
    terminer();
  };
  form.addEventListener('submit', surEnvoi);

  // ---------- Envoi simulé ----------
  function terminer() {
    const d = donnees();
    root.dispatchEvent(new CustomEvent('formulaire:envoye', { bubbles: true, detail: d }));
    if (!fin) { annoncer('Demande prête.'); return; }
    const res = fin.querySelector('[data-resume]');
    if (res) res.textContent = d.resume.map(g => g.champs.find(c => c.valeur)?.valeur).filter(Boolean).join(' · ');
    const lien = fin.querySelector('[data-mailto]');
    if (lien) {
      lien.hidden = !o.mailto;
      if (o.mailto) lien.href = `mailto:${o.mailto}?subject=${encodeURIComponent(o.sujet)}&body=${encodeURIComponent(d.texte.slice(0, 1800))}`;
    }
    form.hidden = true; fin.hidden = false;
    if (!calme() && gsap) gsap.fromTo(fin, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: .5, ease: 'power3.out', clearProps: 'all' });
    if (o.defilement) ramenerFin();
    (fin.querySelector('h3, h2') || fin).setAttribute('tabindex', '-1');
    (fin.querySelector('h3, h2') || fin).focus({ preventScroll: true });
  }
  function ramenerFin() {
    const eh = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--entete-h')) || 0;
    const haut = fin.getBoundingClientRect().top;
    if (haut < eh || haut > innerHeight * .6) { const y = scrollY + haut - eh - 16; if (s.lenis) s.lenis.scrollTo(y, { immediate: s.calme }); else scrollTo({ top: y, behavior: s.calme ? 'auto' : 'smooth' }); }
  }
  function recommencer() {
    form.reset();
    for (const e of etapes) for (const c of controles(e)) marquer(c, '');
    retourRecap = false;
    if (fin) fin.hidden = true;
    form.hidden = false;
    cur = -1; afficher(0, 0);
    titres[0].focus({ preventScroll: true });
  }
  const surFin = e => { if (e.target.closest('[data-recommencer]')) recommencer(); };
  fin?.addEventListener('click', surFin);

  afficher(0, 0);
  s.rafraichir();

  return {
    aller,
    donnees,
    recommencer,
    detruire() {
      anim?.kill(); clearTimeout(minuterie);
      form.removeEventListener('click', surClic); form.removeEventListener('submit', surEnvoi); form.removeEventListener('input', surSaisie); form.removeEventListener('change', surSaisie);
      fin?.removeEventListener('click', surFin);
      root.classList.remove('fpe--actif'); etapes.forEach(e => { e.hidden = false; });
    },
  };
}

function esc(t) { return String(t ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
