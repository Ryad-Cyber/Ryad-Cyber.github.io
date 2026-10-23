# Ryad Boujenan | Cybersecurity Portfolio

**SOC Analyst · Blue Team · Cybersecurity & Cloud Security**

Welcome to my personal portfolio, where I present my cybersecurity projects, technical skills, certifications, academic background, and professional development.

The portfolio is designed to showcase my learning journey in cybersecurity, with a particular interest in security operations, threat detection, incident investigation, and cloud security.

🌐 **Portfolio:** https://ryad-cyber.github.io/
🇫🇷 French version available by default · 🇬🇧 English version: https://ryad-cyber.github.io/en/

---

## About the Portfolio

This website brings together the main elements of my cybersecurity journey in one place.

It provides an overview of:

* **Cybersecurity projects:** practical labs, security scenarios, investigations, and technical exercises.
* **SOC & Blue Team:** security monitoring, log analysis, threat detection, and incident investigation.
* **Technical skills:** security tools, technologies, and concepts studied or practiced.
* **Education & experience:** academic background, professional experience, and career development.
* **Certifications:** training achievements and relevant credentials.
* **Travel:** a personal section reflecting experiences beyond technology.
* **Contact:** ways to connect with me professionally.

The goal is to present my work clearly and demonstrate a practical, hands-on approach to learning cybersecurity.

> This portfolio is a work in progress. Projects and skills are presented according to my actual experience and learning progress.

## Technologies

The portfolio is built with standard web technologies:

| Technology   | Purpose                                                  |
| ------------ | -------------------------------------------------------- |
| HTML5        | Structure and content                                    |
| CSS3         | Responsive layout, visual design, and animations         |
| JavaScript   | Project filters, navigation, carousels, and image viewer |
| Git & GitHub | Version control and source code hosting                  |
| GitHub Pages | Website hosting                                          |

The website uses no front-end framework or build process. Its lightweight architecture makes it straightforward to maintain and deploy.

## Features

* **Bilingual website:** French and English versions with matching content and structure.
* **Editorial technical design:** deep green introduction, warm paper surfaces, condensed typography, numbered case studies and readable screenshots.
* **Interactive project portfolio:** category filters and expandable project details.
* **Project documentation:** objectives, results, tools, and practical scenarios.
* **Responsive design:** adapted to desktop, tablet, and mobile screens.
* **Travel gallery:** country-based photo carousels and an image viewer.
* **Accessibility considerations:** semantic HTML, keyboard-friendly native elements, and support for reduced motion.
* **Simple deployment:** published through GitHub Pages without a build step.

## Repository Structure

```text
.
├── index.html              # French portfolio
├── en/
│   └── index.html          # English portfolio
├── assets/
│   ├── css/
│   │   ├── style.css       # Shared styles and component behavior
│   │   └── editorial.css   # Shared visual direction and responsive layouts
│   ├── js/
│   │   └── main.js         # Interactive features
│   ├── certifications/     # Certification images
│   ├── projets/            # Project screenshots and visuals
│   ├── logos/              # Education and organization logos
│   ├── flags/              # Travel section flags
│   └── voyages/             # Travel photos, videos, and thumbnails
├── tools/
│   └── make-thumbs.ps1     # Travel thumbnail generation script
├── .nojekyll
└── README.md
```

Both language versions share the same CSS and JavaScript files. Content is written directly in each HTML page, so there is no separate content management system or compilation process.

## Local Development

To run the portfolio locally:

1. Clone the repository.
2. Open `index.html` in a browser to view the French version.
3. Open `en/index.html` to view the English version.
4. Test navigation, project filters, galleries, and responsive behavior.

No package installation or build command is required.

### Adding Travel Photos

Travel images are stored in `assets/voyages/`, with generated thumbnails in `assets/voyages/thumbs/`.

To regenerate thumbnails on Windows, run the following command from the repository root:

```powershell
powershell -ExecutionPolicy Bypass -File tools\make-thumbs.ps1
```

Remember to update the corresponding country section in both language versions when adding new photos.

## Deployment

The website is hosted using GitHub Pages.

Changes committed and pushed to the `main` branch are published at:

**https://ryad-cyber.github.io/**

Typical deployment workflow:

```bash
git add index.html en/index.html assets/
git commit -m "Update portfolio"
git push origin main
```

Only stage the files intended for publication. Source documents, unused images, and working files should not be committed accidentally.

## Contact

If you would like to discuss cybersecurity, security operations, cloud security, or professional opportunities, feel free to connect with me through the contact information available on my portfolio.

🔗 **Portfolio:** https://ryad-cyber.github.io/

---

*Built and maintained by Ryad Boujenan.*
