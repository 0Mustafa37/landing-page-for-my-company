# Tanzim · تنظيم — Landing Page

Landing page for **Tanzim (تنظيم)**, a cloud system that helps companies track employee attendance (check-in/check-out), warehouses and inventory, and custody (assets held by employees), and automate routine tasks.

A premium, animated page. Plain HTML, CSS, and JavaScript with no build step. Animations use [GSAP](https://gsap.com) + ScrollTrigger and [Lenis](https://lenis.darkroom.engineering) smooth scrolling, bundled locally in `js/vendor/`. Every animation turns off for visitors who prefer reduced motion, and the page still works fully if JavaScript fails.

## Structure

```
index.html          Page markup (hero, features, how it works, contact, footer)
css/styles.css      Styles; theme colors live in :root at the top
js/main.js          Animations, particle hero, live dashboard, nav, contact form
js/i18n.js          English translations + UI strings for both languages
js/vendor/          GSAP, ScrollTrigger, Lenis (minified)
assets/favicon.svg  Logo / favicon
```

## Languages

Arabic is the default (right-to-left). Visitors can switch to English with the **EN** button in the header or the link in the footer; their choice is remembered. Link straight to English with `?lang=en`.

- **Arabic copy** is written directly in `index.html`.
- **English copy** is in `js/i18n.js`, matched by the `data-i18n` keys on each element.
- Messages shown by JavaScript (form errors, live dashboard feed) are in `js/i18n.js` under `ui` for both languages.

When you change text, update both places.

## Theme

Dark mode is the default. Visitors can switch to light mode with the sun/moon button in the header; their choice is remembered. Colors for both themes are CSS variables at the top of `css/styles.css` (`:root` for dark, `:root[data-theme="light"]` for light).

## Run locally

Open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Customize

- **Copy:** Arabic text is in `index.html`, English in `js/i18n.js`. Live-dashboard names, branches, and warehouses are in `js/i18n.js` under `ui`.
- **Brand colors:** edit `--violet`, `--cyan`, and `--pink` at the top of `css/styles.css` (particle colors are in `js/main.js`).
- **Logo:** replace `assets/favicon.svg`.
- **Contact:** the form opens a WhatsApp chat to `WHATSAPP_NUMBER` in `js/main.js` with the visitor's details filled in. WhatsApp numbers and the email shown on the page are in `index.html` (contact section and floating button). To collect submissions on a server instead, set `FORM_ENDPOINT` (e.g. Formspree).

## Deploy

Because this is a static site, you can host it anywhere:

- **GitHub Pages (set up):** `.github/workflows/pages.yml` publishes the site on every push to the default branch. One-time setup: Settings → Pages → Source → **GitHub Actions**. Private repos need a paid GitHub plan for Pages; otherwise make the repo public.
- **Netlify / Vercel / Cloudflare Pages:** connect the repo; no build command needed, publish directory is the root.
