# Dépannage 60 — maquette v1 (direction « Deux réseaux »)

Maquette du futur site de Dépannage 60 (plomberie, électricité et rénovation, Longueil-Sainte-Marie, Oise).
Site statique, prêt pour Vercel (`cleanUrls`), sans étape de construction : les pages HTML sont générées à l'avance.

## Pages de la v1

| Page | Adresse | Ouverture |
|---|---|---|
| Accueil | `/` | Photo plein cadre sous une eau WebGL, intro « mise en service » (tuyau bleu et câble jaune, le nom qui se remplit d'eau, « 60 » qui s'allume, manomètre à 45 min) |
| Prestations et tarifs | `/prestations` | Fond bleu nuit, étiquettes de prix suspendues qui tombent et se balancent ; catalogue filtrable des 69 prestations |
| Décrivez votre besoin | `/decrivez-votre-besoin` | Carrelage dont les carreaux se retournent ; questionnaire en 3 questions qui mène à la prestation et son prix |
| Rayon d'action | `/rayon-d-action` | Carte des 10 communes, ondes depuis Longueil-Sainte-Marie, vérification de la commune |
| Contact | `/contact` | Fond jaune, la fiche se branche et le formulaire en 3 étapes s'allume (simulé) |
| 404 | `/404` | Coude de cuivre qui fuit |

Pages du site actuel non reprises en v1 (disponibles en v2) : les 10 pages de communes (regroupées dans « Rayon d'action »), l'espace pro (connexion), l'outil PMR de Budgetravaux, les comptes clients, les mentions légales et CGV.

## Mettre à jour

- Textes : `donnees/textes/fr.json` ; prestations et prix : `donnees/prestations.json` (source : `outils/prestations-source.mjs`, puis `node outils/prestations-source.mjs` ; prix relevés sur le site actuel le 5 novembre 2026) ; communes : `donnees/communes.json` ; questionnaire : `donnees/besoin.json`.
- Puis `node outils/generer.mjs` (jamais de modification à la main des pages `.html` générées).
- Images : `plan-images.json`, puis le pipeline de la bibliothèque (`produire.mjs`, `partage.mjs`).
- Audit : `node _audit/audit.mjs` (standard), `--complet` pour la version finale.

## À fournir ou confirmer par le client (à compléter)

| Information | État |
|---|---|
| Mentions légales : raison sociale et forme juridique, SIRET (le site affiche SIREN 538 098 245 et 538 098 245 00045), directeur de la publication | à compléter |
| Hébergeur du site final : Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis (adresse vérifiée sur vercel.com/legal/dpa le 5 novembre 2026) | à reprendre dans les mentions |
| Politique de confidentialité (RGPD) : données du formulaire, durée de conservation, droits | à compléter |
| Assurance décennale et responsabilité civile : assureur, numéro de contrat, zone couverte | à compléter |
| Horaires d'ouverture et jours de fermeture (aucun horaire fiable sur le site : rien n'est affiché) | à compléter |
| E-mail de contact (aucun sur le site actuel) | à compléter |
| Crédits des illustrations générées (Grok) : la mention « Illustration générée » est à garder sur le site final | à reporter |

### Promesses du site actuel reprises, à confirmer

1. **« Déplacement inclus »** : la fiche débouchage WC dit « déplacement jusqu'à 30 km compris », mais les fiches débouchage évier, lavabo, douche, baignoire, recherche de fuite et chauffe-eau détaillent une ligne « Déplacement 49 € ». La maquette écrit « compris dans le prix affiché ».
2. **« Moins de 45 minutes »** autour de Longueil-Sainte-Marie (accueil du site actuel) : repris tel quel. Le « 24 h/24, 7 j/7 » des pages de communes n'est pas repris.
3. **Garantie décennale et « garantie sur intervention »** : reprises ; « entreprise agréée, reconnue au niveau national » n'est pas reprise (aucune preuve fournie).
4. **Qui intervient** : les CGV disent que Dépannage 60 met en relation avec des professionnels partenaires ; l'accueil parle de « notre équipe ». La maquette dit « Pedro Ricardo dos Reis Oliveira, et un réseau d'intervenants ».
5. **Prix** : seules 10 prestations sur 69 ont un prix sur le site actuel ; les autres sont « prix sur demande ». Le prix « 155 € TTC » des prises standard est repris sans précision de ce qu'il couvre.
6. Orthographe : « Longueil-Sainte-Marie » (le site écrit aussi Longeuil et Longueuil). Les fautes des intitulés de prestations ont été corrigées.
7. Le lien Twitter du site actuel est celui de Budgetravaux : non repris.

## À retirer à la mise en ligne définitive

- `noindex` : balise robots dans `source/gabarits/commun.mjs` et en-tête `X-Robots-Tag` dans `vercel.json`.
- Le formulaire simulé (contact) : brancher un vrai envoi.
- La phrase « Maquette de démonstration… » du pied de page et les mentions « à compléter ».
- Les distances « à vol d'oiseau » sont calculées depuis des coordonnées approximatives : à vérifier ou à retirer.

À garder : la mention « Illustration générée » sur chaque image créée par IA.

## Crédits

- Photos de prestations et pictogrammes : site actuel depannage-60.com.
- Illustrations générées (Grok) : ouverture, rénovation, matières, rues ; marquées « Illustration générée ».
- Polices : Bricolage Grotesque et IBM Plex Mono (licence SIL OFL), hébergées avec le site.
- GSAP (ScrollTrigger, SplitText, Flip) et OGL, hébergés avec le site.
