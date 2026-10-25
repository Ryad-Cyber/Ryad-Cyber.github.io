"""Validate local links, assets, IDs and project integration without dependencies."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
from collections import Counter
import re

ROOT = Path(__file__).resolve().parents[1]

class Page(HTMLParser):
    def __init__(self, source):
        super().__init__(convert_charrefs=True)
        self.ids, self.links, self.projects, self.telephones = [], [], [], []
        self.feed(source)

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if 'id' in a: self.ids.append(a['id'])
        if tag == 'article' and 'data-cat' in a and 'data-placeholder' not in a:
            self.projects.append(a['data-cat'])
        for key in ('href', 'src', 'poster'):
            if a.get(key): self.links.append(a[key])
        if a.get('href', '').startswith('tel:'): self.telephones.append(a['href'])

pages = {p: Page(p.read_text(encoding='utf-8')) for p in ROOT.rglob('*.html')}
errors, checked = [], 0
for path, page in pages.items():
    source = path.read_text(encoding='utf-8')
    if source.count('class="menu-toggle"') != 1 or 'class="menu-glyph"' not in source:
        errors.append(f'{path}: navigation must use one menu button and one glyph')
    if 'security.css?v=20261025-contact' not in source or 'main.js?v=20261025-contact' not in source:
        errors.append(f'{path}: missing shared, versioned styles or script')
    duplicates = [key for key, n in Counter(page.ids).items() if n > 1]
    if duplicates: errors.append(f'{path}: duplicate IDs: {duplicates}')
    for link in page.links:
        url = urlsplit(link)
        if url.scheme or url.netloc: continue
        target = (ROOT/unquote(url.path.lstrip('/'))) if url.path.startswith('/') else (path.parent/unquote(url.path))
        target = target.resolve()
        if target.is_dir(): target /= 'index.html'
        checked += 1
        if not target.exists():
            errors.append(f'{path.relative_to(ROOT)}: missing {link}')
        elif url.fragment and target in pages and unquote(url.fragment) not in pages[target].ids:
            errors.append(f'{path.relative_to(ROOT)}: missing anchor {link}')
    if page.projects:
        if 'card--featured' in source:
            errors.append(f'{path}: project cards must not use a featured layout')
        if Counter(page.projects) != Counter({'soc': 2, 'redteam': 2, 'grc': 1, 'cloud': 2}):
            errors.append(f'{path}: unexpected projects {page.projects}')
        cards = re.findall(r'<article class="card [^"]+" data-cat="(?:soc|redteam|grc|cloud)"[^>]*>(.*?)</article>', source, re.S)
        for card in cards:
            cover = re.search(r'<figure class="card-media[^"]*">\s*<img src="([^"]+)"', card)
            detail_images = re.findall(r'<figure class="detail-fig">\s*<a href="([^"]+)"', card)
            if not cover or detail_images.count(cover[1]) != 1:
                errors.append(f'{path}: project cover missing or duplicated in case gallery: {cover[1] if cover else "unknown"}')
        if len(cards) != 7:
            errors.append(f'{path}: expected seven cards with image galleries, found {len(cards)}')
        summaries = re.findall(r'<summary class="btn btn-soft">(.*?)</summary>', source, re.S)
        expected = 'Read the case in detail' if path.relative_to(ROOT).parts[0] == 'en' else 'Lire le cas en détail'
        if len(summaries) != 7 or any(expected not in summary for summary in summaries):
            errors.append(f'{path}: inconsistent project buttons')
        juice = next((card for card in cards if 'id="p-juice-shop"' in card), '')
        juice_images = re.findall(r'<figure class="detail-fig">\s*<a href="([^"]+)"', juice)
        if [Path(urlsplit(url).path).name for url in juice_images] != [
            '01-juice-shop-lab.png', '02-burp-repeater-http.png',
            '03-sqli-product-disclosure.png', '04-xss-reflected.png',
            '05-idor-basket-access.jpeg', '06-http-security-headers.png',
            '07-api-error-information-disclosure.jpeg', '08-negative-quantity-api.jpeg',
            '09-negative-quantity-persisted.jpeg', '10-cart-ui-quantity-mismatch.jpeg',
        ]:
            errors.append(f'{path}: Juice Shop gallery is incomplete or out of order')
        if 'https://github.com/Ryad-Cyber/OWASP-Juice-Shop-Pentest' not in juice:
            errors.append(f'{path}: Juice Shop repository link missing')
        terraform = next((card for card in cards if 'id="p-terraform-docker"' in card), '')
        terraform_images = re.findall(r'<figure class="detail-fig">\s*<a href="([^"]+)"', terraform)
        if [Path(urlsplit(url).path).name for url in terraform_images] != [
            'terraform-01-deployment.png', 'terraform-02-security-controls.png',
            'terraform-03-network-configuration.png', 'terraform-04-secure-web-server.png',
            'terraform-05-backend-isolation.png', 'terraform-06-internal-network.png',
        ]:
            errors.append(f'{path}: Terraform gallery is incomplete or out of order')
        if 'https://github.com/Ryad-Cyber/terraform-security-lab' not in terraform:
            errors.append(f'{path}: Terraform repository link missing')
        if 'id="capture-dialog"' not in source:
            errors.append(f'{path}: missing screenshot gallery')
    if path in (ROOT/'index.html', ROOT/'en/index.html'):
        role = re.search(r'<p class="hero-role">(.*?)<br><span>(.*?)</span></p>', source)
        expected_role = (('Cybersecurity engineering student', 'Cloud Security · SOC · Penetration Testing')
                         if path.parent.name == 'en' else ('Élève ingénieur en cybersécurité', 'Cloud Security · SOC · Pentest'))
        if not role or (role[1], role[2]) != expected_role:
            errors.append(f'{path}: hero positioning missing or changed')
        if 'data-words=' in source or 'class="hero-typed"' in source:
            errors.append(f'{path}: animated job titles must not return')
        cv = re.search(r'<a class="btn btn-ghost" data-cv-link([^>]*)>', source)
        if not cv or ' hidden' not in cv[1] or 'href=' in cv[1]:
            errors.append(f'{path}: CV button must stay hidden and unlinked until a final PDF exists')
        if page.telephones or re.search(r'(?:0[67]|\+33[67])(?:[ .-]?\d){8}', source):
            errors.append(f'{path}: personal phone number must not be published')
        if 'class="contact-email"' not in source or 'class="contact-mini"' not in source or 'action="mailto:ryadboujenan@outlook.com"' not in source:
            errors.append(f'{path}: direct contact and mailto mini-form expected')
        if 'SOC / CLOUD SECURITY' in source or 'class="signal-map"' in source or 'class="skills-note panel"' in source:
            errors.append(f'{path}: removed specialization, circular portrait or approach section remains')
        if '<h3>Programmation</h3>' not in source and '<h3>Programming</h3>' not in source:
            errors.append(f'{path}: programming skills missing')
        language_grid = re.search(r'<dl class="language-grid">(.*?)</dl>', source, re.S)
        expected_levels = ['Fluent', 'C1', 'Fluent', 'Basic', 'Beginner'] if path.parent.name == 'en' else ['Courant', 'C1', 'Courant', 'Notions', 'Débutant']
        if not language_grid or re.findall(r'<dd>(.*?)</dd>', language_grid[1]) != expected_levels:
            errors.append(f'{path}: language levels changed or missing')

for filename in ('aws-iam-policy-json.png', 'aws-vpc-architecture-routes.jpeg', 'aws-ec2-security-groups.png'):
    if not (ROOT/'assets/projets'/filename).is_file(): errors.append(f'Missing AWS screenshot: {filename}')
if errors:
    raise SystemExit('\n'.join(errors))
print(f'PASS: {len(pages)} HTML pages; {checked} local references; unique IDs; 7 projects and matching buttons; screenshot galleries; FR/EN contact and unchanged language levels; consistent navigation and versioned assets.')
