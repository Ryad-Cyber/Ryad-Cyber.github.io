# Portfolio — Ryad Boujenan

Portfolio statique, bilingue français / anglais, pour un profil **SOC / Blue Team**.
Pas de framework, pas de build, pas de dépendance : HTML + CSS + JavaScript natif.
Les pages fonctionnent aussi bien en ligne qu'en double-cliquant sur le fichier en local.

**En ligne :** <https://ryad-cyber.github.io/>

---

## Deux versions coexistent

Le dépôt contient **le site publié** et **la refonte en cours de validation**. Elles sont
indépendantes : modifier l'une ne change rien à l'autre.

| | Site publié | Refonte (`_preview/`) |
| --- | --- | --- |
| Pages | `index.html`, `en/index.html` | `_preview/index-fr.html`, `_preview/index-en.html` |
| Style | `assets/css/style.css` | `_preview/site.css` |
| Script | `assets/js/main.js` | `_preview/site.js` |
| Thème | clair, « dossier papier » | sombre, bleu nuit |
| Menu | 8 entrées, Voyages intégré | 5 entrées, Voyages sur sa propre page |
| URL | `/` et `/en/` | `/_preview/index-fr.html` et `/_preview/index-en.html` |

Les deux partagent le même dossier `assets/` (photos, captures, logos, certifications).

---

## Structure

```
.
├── index.html              Site publié — français
├── en/index.html           Site publié — anglais
│
├── _preview/               Refonte, zone de test publiée mais non référencée
│   ├── index-fr.html       Page d'accueil FR (une seule page, 5 sections)
│   ├── index-en.html       Page d'accueil EN, structure identique
│   ├── voyages-fr.html     Page Voyages FR (carrousels par pays)
│   ├── voyages-en.html     Page Voyages EN
│   ├── site.css            Feuille de style unique des 4 pages
│   └── site.js             Filtres, section courante, formulaire, carrousels, visionneuse
│
├── assets/
│   ├── css/style.css       Style du site publié
│   ├── js/main.js          Script du site publié
│   ├── photo.jpg           Photo de profil
│   ├── favicon.svg         Favicon « RB »
│   ├── certifications/     Certificats rasterisés en JPEG (jamais de PDF brut)
│   ├── projets/            Captures des labs + photo KASBAH
│   ├── logos/              Logos des établissements (EMSI, lycée, Nethash)
│   ├── flags/              Drapeaux SVG de la page Voyages
│   └── voyages/            Photos et vidéos de voyage
│       └── thumbs/         Vignettes 480 px générées par tools/make-thumbs.ps1
│
├── tools/make-thumbs.ps1   Génère les vignettes de assets/voyages/
├── .nojekyll               Sert les fichiers tels quels (nécessaire pour _preview/)
└── README.md
```

---

## La refonte (`_preview/`)

### Page d'accueil

Une seule page, cinq sections, cinq entrées de menu :
**Accueil · Projets · Compétences · Parcours · Contact**.

Les ancres diffèrent selon la langue :

| Section | FR | EN |
| --- | --- | --- |
| Accueil | `#accueil` | `#home` |
| Projets | `#projets` | `#projects` |
| Compétences | `#competences` | `#skills` |
| Parcours | `#parcours` | `#experience` |
| Contact | `#contact` | `#contact` |

Le menu surligne la section courante (IntersectionObserver). Sous 860 px il est masqué :
le menu burger viendra avec l'intégration finale.

### Fond animé

Trois calques SVG en ligne — boucliers, nuages, réseau de nœuds — à 6-8 % d'opacité, qui
dérivent lentement vers le bas. Chaque calque est une tuile de 1800 × 1400 px dessinée deux
fois : une translation d'exactement une tuile boucle sans raccord. **Immobile** quand le
visiteur a activé « réduire les animations ».

### Filtres de projets

Sept onglets : **Tous · SOC / Blue Team · Red Team / Pentest · Cloud · IA · GRC ·
Cryptographie**. Tous cliquables, même vides.

Chaque carte porte `data-cat="<clé>"`. Les clés sont **identiques dans les deux langues**
(`soc`, `redteam`, `cloud`, `ia`, `grc`, `crypto`) : seuls les libellés changent.

Trois cartes portent `data-placeholder` (Pentest, IA, Cryptographie). Elles annoncent un
projet en préparation, **ne comptent pas** dans les compteurs et **n'apparaissent pas** dans
« Tous ». Une catégorie sans projet affiche un état vide.

### Page Voyages

Page séparée, atteinte par **un seul lien** : le bouton « Mes voyages » du hero. Un bloc par
pays, drapeau SVG, défilement horizontal des photos (flèches ou glissement au doigt), nom du
lieu sur chaque photo, visionneuse au clic.

### Formulaire de contact

Sans serveur : l'envoi ouvre la messagerie du visiteur avec le message prérempli (`mailto`).
Pour recevoir les messages directement, il faudrait un service externe type Formspree et
remplacer l'attribut `action` du formulaire.

---

## Modifier le contenu

Le texte est écrit directement dans le HTML, il n'y a pas de fichier de contenu séparé.
**Toute modification de fond doit être reportée dans les deux langues**, sinon les versions
divergent.

| Ce que tu veux changer | Où, dans `_preview/index-fr.html` et `index-en.html` |
| --- | --- |
| Nom, rôle, phrase d'accroche | `<section class="hero" id="accueil">` / `id="home"` |
| Fiche synthèse (4 lignes) | `<div class="stats">` |
| Un projet | un bloc `<article class="card panel">` |
| Une compétence | un `<div class="skill-group panel">` |
| Une expérience, un diplôme | un `<li>` de `<ol class="timeline">` |
| Une certification | un `<article class="cert">` |
| Disponibilité, contact | `<div class="availability">` et `.contact-rows` |

### Ajouter un projet

Copier un bloc `<article class="card panel">` et remplacer son contenu :

```html
<article class="card panel" data-cat="cloud" aria-labelledby="p-exemple">
  <figure class="card-media card-media--screenshot">
    <img src="../assets/projets/mon-projet.jpg" alt="…" width="900" height="400" loading="lazy" decoding="async">
    <figcaption>Légende courte</figcaption>
  </figure>
  <div class="card-badges">
    <span class="badge badge-cat"><svg class="i" aria-hidden="true"><use href="#i-cloud"/></svg>Cloud</span>
    <span class="badge">2027 · Projet personnel</span>
  </div>
  <h3 id="p-exemple"><span class="case-no">CAS Nº4</span>Titre du projet</h3>
  <p class="card-desc">Une à deux phrases.</p>
  <ul class="tags"><li>Outil</li><li>Outil</li></ul>
  <div class="card-actions">
    <details class="card-detail">…</details>
    <a class="btn btn-ghost" href="…" target="_blank" rel="noopener">Code</a>
  </div>
</article>
```

Le compteur de l'onglet se met à jour tout seul. Si la catégorie avait une carte
`data-placeholder`, la retirer. Penser à mettre à jour la ligne « Projets » de la fiche
synthèse, qui est écrite en dur.

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
<li><a class="photo" href="../assets/voyages/lisbonne-1.jpeg" data-caption="Lisbonne, Portugal">
  <img src="../assets/voyages/thumbs/lisbonne-1.jpeg" alt="Lisbonne, Portugal"
       width="360" height="480" loading="lazy" decoding="async">
  <span class="photo-label" aria-hidden="true">Lisbonne</span>
</a></li>
```

Une vidéo porte `data-type="video"` et la classe `photo--tall` si elle est verticale.

### Ajouter une certification

Les certificats sont **rasterisés en JPEG** dans `assets/certifications/`, jamais liés en PDF
brut. Le visuel n'est un lien que si une vérification publique existe (Coursera, Credly) ;
sinon c'est une simple image.

---

## Couleurs et polices

Tout est dans le bloc `:root` en haut de `_preview/site.css` :

| Variable | Usage |
| --- | --- |
| `--bg` `#060b14` | fond général |
| `--panel` `#0d1420` | cartes et panneaux |
| `--text` `#e6edf5` / `--muted` `#8698ad` | textes |
| `--accent` `#35a7e8` | liens, onglet actif, bordures actives |
| `--accent-2` `#28d17c` | points d'état uniquement |
| `--gold` `#d9a441` | certifications uniquement |

Les contrastes sont vérifiés AA (≥ 4,5:1) sur tous les textes, y compris par-dessus la lueur
du hero. Changer une couleur impose de revérifier.

Polices : **IBM Plex** (Sans, Sans Condensed, Mono) via Google Fonts — seule dépendance
réseau du site. Hors ligne, le navigateur retombe sur les polices système.

---

## Déployer

Le dépôt s'appelle `Ryad-Cyber.github.io`, donc tout push sur `main` publie immédiatement.

```bash
git add <les fichiers modifiés>
git commit -m "Description du changement"
git push
```

Éviter `git add .` : le dossier contient des fichiers de travail non destinés au site
(PDF sources des certifications, captures d'écran de référence, photos non utilisées).

### Vérifications avant de publier

- Ouvrir les 4 pages de `_preview/` en local, tester la bascule FR/EN dans les deux sens.
- Réduire la fenêtre à 390 px : aucun débordement horizontal.
- Vérifier que les liens externes (GitHub, LinkedIn, Coursera, Credly, certificat KASBAH)
  répondent.
- Après le push, recharger la page **en ligne** en forçant le cache : GitHub Pages met une
  à deux minutes à publier.
