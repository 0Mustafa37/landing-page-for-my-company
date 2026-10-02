# Company Landing Page

A fast, responsive landing page for a software/SaaS company. Plain HTML, CSS, and JavaScript, with no build step and no dependencies.

## Structure

```
index.html          Page markup (hero, features, how it works, contact, footer)
css/styles.css      Styles; theme colors live in :root at the top
js/main.js          Mobile nav, scroll effects, contact form handling
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
- **Brand colors:** edit `--brand`, `--brand-2`, and `--brand-dark` at the top of `css/styles.css`. Dark mode follows the visitor's system setting.
- **Logo:** replace `assets/favicon.svg`.
- **Contact form:** in `js/main.js`, set `CONTACT_EMAIL` to your address. To receive submissions without opening the visitor's email app, create a free form at a service like [Formspree](https://formspree.io) and paste its URL into `FORM_ENDPOINT`.

## Deploy

Because this is a static site, you can host it anywhere:

- **GitHub Pages:** Settings → Pages → Deploy from branch → pick the branch and `/ (root)`.
- **Netlify / Vercel / Cloudflare Pages:** connect the repo; no build command needed, publish directory is the root.
