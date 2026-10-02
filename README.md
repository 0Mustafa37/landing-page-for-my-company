# Company Landing Page

A premium, animated landing page for a software/SaaS company. Plain HTML, CSS, and JavaScript with no build step. Animations use [GSAP](https://gsap.com) + ScrollTrigger and [Lenis](https://lenis.darkroom.engineering) smooth scrolling, bundled locally in `js/vendor/`. Every animation turns off for visitors who prefer reduced motion, and the page still works fully if JavaScript fails.

## Structure

```
index.html          Page markup (hero, features, how it works, contact, footer)
css/styles.css      Styles; theme colors live in :root at the top
js/main.js          Animations, particle hero, live dashboard, nav, contact form
js/vendor/          GSAP, ScrollTrigger, Lenis (minified)
assets/favicon.svg  Logo / favicon
```

## Run locally

Open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Customize

- **Company name and copy:** search `index.html` for `Nimbus` and replace the placeholder text.
- **Brand colors:** edit `--violet`, `--cyan`, and `--pink` at the top of `css/styles.css` (particle colors are in `js/main.js`).
- **Logo:** replace `assets/favicon.svg`.
- **Contact form:** in `js/main.js`, set `CONTACT_EMAIL` to your address. To receive submissions without opening the visitor's email app, create a free form at a service like [Formspree](https://formspree.io) and paste its URL into `FORM_ENDPOINT`.

## Deploy

Because this is a static site, you can host it anywhere:

- **GitHub Pages (set up):** `.github/workflows/pages.yml` publishes the site on every push to the default branch. One-time setup: Settings → Pages → Source → **GitHub Actions**. Private repos need a paid GitHub plan for Pages; otherwise make the repo public.
- **Netlify / Vercel / Cloudflare Pages:** connect the repo; no build command needed, publish directory is the root.
