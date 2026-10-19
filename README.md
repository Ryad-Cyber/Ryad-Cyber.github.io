# Portfolio — Ryad Boujenan

Portfolio statique, bilingue français / anglais, pour un profil **SOC / Blue Team**.
Pas de framework, pas de build, pas de dépendance : HTML + CSS + JavaScript natif.

**Une seule adresse, celle du CV :** <https://ryad-cyber.github.io/>
La version anglaise est à <https://ryad-cyber.github.io/en/>.

Il n'existe **pas** de seconde version du site. Tout vit dans ces deux pages.

---

## Structure

```
.
├── index.html              Portfolio complet — français
├── en/index.html           Portfolio complet — anglais, structure identique
│
├── assets/
│   ├── css/style.css       Toute la mise en forme des deux pages
│   ├── js/main.js          Filtres, section courante, formulaire, carrousels, visionneuse
│   ├── photo.jpg           Photo de profil
│   ├── favicon.svg         Favicon « RB »
│   ├── certifications/     Certificats rasterisés en JPEG (jamais de PDF brut)
│   ├── projets/            Captures des labs + photo KASBAH
│   ├── logos/              Logos des établissements (EMSI, lycée, Nethash)
│   ├── flags/              Drapeaux SVG de la section Voyages
│   └── voyages/            Photos et vidéos de voyage
│       └── thumbs/         Vignettes 480 px générées par tools/make-thumbs.ps1
│
├── tools/make-thumbs.ps1   Génère les vignettes de assets/voyages/
├── .nojekyll               Sert les fichiers tels quels
└── README.md
```

Chaque page est autonome : le texte est écrit directement dans le HTML, il n'y a pas de
fichier de contenu séparé ni de gabarit à compiler.

---

## La page

Une seule page par langue, six sections, six entrées de menu :
**Accueil · Projets · Compétences · Parcours · Voyages · Contact**.

Les ancres diffèrent selon la langue, le reste est identique :

| Section | FR | EN |
| --- | --- | --- |
| Accueil | `#accueil` | `#home` |
| Projets | `#projets` | `#projects` |
| Compétences | `#competences` | `#skills` |
| Parcours | `#parcours` | `#experience` |
| Voyages | `#voyages` | `#voyages` |
| Contact | `#contact` | `#contact` |

Le menu surligne la section courante (IntersectionObserver). Sous 860 px il est masqué :
la navigation se fait au défilement.

### Fond

Cinq calques empilés derrière le contenu, tous décoratifs (`aria-hidden`) :

1. `.bg-depth` — halo bleuté en haut, assombrissement en bas, pour la profondeur.
2. `.bg-grid` — grille technique de 64 px, estompée par un masque radial.
3. `.bg-layer--network` — nœuds reliés par des lignes fines.
4. `.bg-layer--clouds` — glyphes de nuage.
5. `.bg-layer--shields` — contours de boucliers.

Les trois derniers dérivent lentement vers le bas. Chacun est une tuile de 1800 × 1400 px
dessinée deux fois : une translation d'exactement une tuile boucle sans raccord.
**Tout est immobile** quand le visiteur a activé « réduire les animations ».

Les opacités sont basses à dessein (3 à 8 %). Les augmenter ferait passer le texte
secondaire sous le seuil AA dans la bannière, là où les calques se cumulent.

### Filtres de projets

Sept onglets : **Tous · SOC / Blue Team · Red Team / Pentest · Cloud · IA · GRC ·
Cryptographie**. Tous cliquables, même vides.

Chaque carte porte `data-cat="<clé>"`. Les clés sont **identiques dans les deux langues**
(`soc`, `redteam`, `cloud`, `ia`, `grc`, `crypto`) : seuls les libellés changent.

Trois cartes portent `data-placeholder` (Pentest, IA, Cryptographie). Elles annoncent un
projet en préparation, **ne comptent pas** dans les compteurs et **n'apparaissent pas** dans
« Tous ». Une catégorie sans projet affiche un état vide.

### Carte de projet

Visible sans déplier : image, catégorie, date, titre, description courte, **Objectif**,
**Résultat**, outils, lien. Le détail complet (contexte, étapes, scénarios de détection,
captures) est replié dans un `<details>`, qui fonctionne sans JavaScript.

### Section Voyages

Intégrée à la page, pas sur un site séparé. Un bloc par pays, drapeau SVG, défilement
horizontal des photos (flèches ou glissement au doigt), nom du lieu sur chaque photo,
visionneuse au clic. Le bouton « Mes voyages » de la bannière y mène par ancre.

### Formulaire de contact

Sans serveur : l'envoi ouvre la messagerie du visiteur avec le message prérempli (`mailto`).
Pour recevoir les messages directement, il faudrait un service externe type Formspree et
remplacer l'attribut `action` du formulaire.

---

## Modifier le contenu

**Toute modification de fond doit être reportée dans les deux langues**, sinon les versions
divergent. Les sections portent les mêmes commentaires dans les deux fichiers.

| Ce que tu veux changer | Où |
| --- | --- |
| Nom, rôle, phrase d'accroche | `<section class="hero">` |
| Fiche synthèse (4 lignes) | `<div class="stats">` |
| Un projet | un `<article class="card panel">` |
| Une compétence | un `<div class="skill-group panel">` |
| Une expérience, un diplôme | un `<li>` de `<ol class="timeline">` |
| Une certification | un `<article class="cert">` |
| Un pays, une photo | un `<section class="country panel">` |
| Disponibilité, contact | `<div class="availability">` et `.contact-rows` |

### Ajouter un projet

Copier un `<article class="card panel">` existant et remplacer son contenu. Le compteur de
l'onglet se met à jour tout seul. Si la catégorie avait une carte `data-placeholder`, la
retirer. Penser à mettre à jour la ligne « Projets » de la fiche synthèse, écrite en dur.

### Ajouter une photo de voyage

Déposer l'image dans `assets/voyages/`, en **minuscules, sans accent ni espace** : GitHub
Pages est sensible à la casse, une majuscule oubliée casse l'image en ligne alors qu'elle
s'affiche en local.

Régénérer les vignettes depuis la racine :

```powershell
powershell -ExecutionPolicy Bypass -File tools\make-thumbs.ps1
```

Le script réduit à 480 px sur le grand côté, redresse l'orientation EXIF, n'écrit que dans
`thumbs/` et affiche les dimensions obtenues — à reporter dans `width`/`height`.

Puis ajouter la vignette dans le bloc pays, **dans les deux langues** :

```html
<li><a class="photo" href="assets/voyages/lisbonne-1.jpeg" data-caption="Lisbonne, Portugal">
  <img src="assets/voyages/thumbs/lisbonne-1.jpeg" alt="Lisbonne, Portugal"
       width="360" height="480" loading="lazy" decoding="async">
  <span class="photo-label" aria-hidden="true">Lisbonne</span>
</a></li>
```

Dans `en/index.html`, les chemins commencent par `../assets/`. Une vidéo porte
`data-type="video"`, et la classe `photo--tall` si elle est verticale.

### Ajouter une certification

Les certificats sont **rasterisés en JPEG** dans `assets/certifications/`, jamais liés en PDF
brut. Le visuel n'est un lien que si une vérification publique existe (Coursera, Credly) ;
sinon c'est une simple image.

---

## Couleurs et polices

Tout est dans le bloc `:root` en haut de `assets/css/style.css` :

| Variable | Usage |
| --- | --- |
| `--bg` `#060b14` | fond général, bleu nuit |
| `--panel` `#0d1420` | cartes et panneaux |
| `--text` `#e6edf5` / `--muted` `#8698ad` | textes |
| `--accent` `#35a7e8` | liens, onglet actif, bordures actives |
| `--accent-2` `#28d17c` | points d'état uniquement |
| `--gold` `#d9a441` | certifications uniquement |

Les contrastes sont vérifiés AA (≥ 4,5:1) sur tous les textes, y compris dans le pire cas :
du texte secondaire par-dessus la lueur de la bannière, le halo de profondeur, la grille et
un trait de motif cumulés. Changer une couleur ou une opacité de fond impose de revérifier.

Polices : **IBM Plex** (Sans, Sans Condensed, Mono) via Google Fonts — seule dépendance
réseau du site. Hors ligne, le navigateur retombe sur les polices système.

---

## Déployer

Le dépôt s'appelle `Ryad-Cyber.github.io`, donc tout push sur `main` publie immédiatement à
la racine du domaine. Aucune configuration supplémentaire n'est nécessaire.

```bash
git add <les fichiers modifiés>
git commit -m "Description du changement"
git push
```

Éviter `git add .` : le dossier contient des fichiers de travail non destinés au site
(PDF sources des certifications, captures d'écran de référence, photos non utilisées).

### Vérifications avant de publier

- Ouvrir `index.html` et `en/index.html` en local, tester la bascule FR/EN dans les deux sens.
- Réduire la fenêtre à 390 px : aucun débordement horizontal.
- Cliquer chaque onglet de filtre, ouvrir un cas, ouvrir une photo dans la visionneuse.
- Vérifier que les liens externes (GitHub, LinkedIn, Coursera, Credly, certificat KASBAH)
  répondent.
- Après le push, recharger la page **en ligne** en forçant le cache : GitHub Pages met une
  à deux minutes à publier.
