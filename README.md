# Portfolio — Ryad Boujenan

Site portfolio statique, une page, bilingue français / anglais.
Pas de framework, pas de build, pas de dépendance externe : HTML + CSS + ~70 lignes de JavaScript.
Il fonctionne aussi bien en ligne qu'en double-cliquant sur `index.html` en local.

**En ligne :** <https://ryad-cyber.github.io/> · **English:** <https://ryad-cyber.github.io/en/>

---

## Structure

```
.
├── index.html              Page française (contenu + structure)
├── en/
│   └── index.html          Page anglaise (traduction complète)
├── assets/
│   ├── css/style.css       Toute la mise en forme, partagée par les deux pages
│   ├── js/main.js          Menu mobile + surlignage de la section courante
│   ├── photo.jpg           Photo de profil (placeholder à remplacer)
│   └── favicon.svg         Favicon « RB »
├── .nojekyll               Demande à GitHub Pages de servir les fichiers tels quels
└── README.md
```

Chaque page est autonome : le texte est écrit directement dans le HTML, il n'y a pas de fichier de
contenu séparé ni de gabarit à compiler.

## Modifier le contenu

Le texte français est dans `index.html`, le texte anglais dans `en/index.html`.
**Toute modification de fond doit être reportée dans les deux fichiers**, sinon les deux versions
divergent. Les sections portent les mêmes commentaires (`<!-- ============ PROJETS ============ -->`)
dans les deux fichiers, ce qui permet de retrouver vite l'endroit correspondant.

Quelques repères :

| Ce que tu veux changer | Où |
| --- | --- |
| Nom, titre, phrase d'accroche | bloc `<section class="hero" id="accueil">` |
| Bandeau « en recherche » | balise `<p class="badge">` |
| Un projet | un bloc `<article class="project">` dans `#projets` |
| Une compétence | une `<li>` dans le groupe concerné de `#competences` |
| Une expérience ou un diplôme | une `<li>` de `<ul class="timeline">` dans `#parcours` |
| Une certification | un bloc `<article class="cert">` dans `#formations` |
| E-mail, LinkedIn, GitHub | `#contact`, plus les liens du hero et du JSON-LD en bas de page |

### Ajouter un projet

Copier un bloc `<article class="project">` existant et remplacer son contenu. La structure attendue
est toujours la même : titre + date, `Contexte`, `Ce que j'ai fait`, `Stack`, puis le lien vers le
dépôt. Si le projet n'a pas de dépôt public, garder la ligne
`<span class="no-repo">…</span>` à la place du lien.

### Ajouter une section

1. Ajouter la `<section class="section" id="mon-ancre">` dans les deux fichiers.
2. Ajouter l'entrée correspondante dans `<nav class="site-nav">` (`<li><a href="#mon-ancre">…</a></li>`).

Le surlignage automatique dans le menu fonctionne sans configuration : le JavaScript relie chaque
lien `#ancre` à la section qui porte cet `id`.

## Remplacer la photo

Déposer la photo sous `assets/photo.jpg` (même nom, en écrasant le placeholder).
Format conseillé : **portrait 4:5, environ 560 × 700 px, moins de 200 Ko**, visage cadré au centre.
L'image est recadrée automatiquement (`object-fit: cover`) et devient carrée sur mobile.

## Changer les couleurs ou les polices

Tout est centralisé dans le bloc `:root` en haut de `assets/css/style.css`.
Changer `--accent` suffit à modifier la couleur d'accent de tout le site. Aucune police n'est
téléchargée : le site utilise les polices système, ce qui évite une requête réseau et un
changement d'apparence au chargement.

## Déployer sur GitHub Pages

Le dépôt doit s'appeler exactement `Ryad-Cyber.github.io` pour que l'URL soit
`https://ryad-cyber.github.io/` (sans sous-dossier dans l'adresse).

```bash
git init -b main
git add .
git commit -m "Portfolio bilingue FR/EN"
git remote add origin https://github.com/Ryad-Cyber/Ryad-Cyber.github.io.git
git push -u origin main
```

Puis, dans le dépôt sur GitHub : **Settings → Pages → Build and deployment → Source :
« Deploy from a branch », Branch : `main` / `/ (root)` → Save**.
La mise en ligne prend une à deux minutes.

Pour toute mise à jour ultérieure :

```bash
git add .
git commit -m "Mise à jour du contenu"
git push
```

### Si le dépôt porte un autre nom

Avec un dépôt nommé par exemple `portfolio`, l'URL devient
`https://ryad-cyber.github.io/portfolio/`. Dans ce cas, mettre à jour les balises
`<link rel="canonical">`, `<link rel="alternate">`, `og:url` et `og:image` en haut des deux fichiers
HTML, ainsi que le champ `url` du JSON-LD en bas de page. Les liens internes du site sont tous
relatifs : ils continuent de fonctionner sans modification.

## Vérifications avant de publier

- Ouvrir `index.html` et `en/index.html` en local, vérifier la bascule FR/EN dans les deux sens.
- Réduire la fenêtre sous 640 px : le menu burger doit s'ouvrir et se fermer après un clic.
- Vérifier que tous les liens externes (GitHub, LinkedIn, certificat) s'ouvrent correctement.
- Vérifier que la photo n'est plus le placeholder.
