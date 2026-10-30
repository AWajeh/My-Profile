# WAjeh — QA Engineer Portfolio

A single-page portfolio site with a cyber/matrix terminal theme, built with plain HTML, CSS and JavaScript (no build step, no frameworks).

## Structure

```
index.html
css/style.css
js/script.js
assets/
  favicon.svg
  profile.jpg               <- your real profile photo (already wired in)
  profile-placeholder.svg   <- unused fallback avatar, safe to delete
  CV.pdf                    <- add your resume here (referenced by the "Download CV" button)
```

## Personalize before publishing

1. **Photo** — already set to `assets/profile.jpg`. To change it later, replace that file (keep the same name) or update the `src` in `index.html`. Adjust the `object-position` on `.avatar-img` in `css/style.css` if a different photo needs different framing inside the circular crop.
2. **CV** — drop your resume file at `assets/CV.pdf` (the Download CV button already links there).
3. **Projects & Skills** — currently filled with realistic placeholder QA content (`E-Commerce Test Automation Framework`, `REST API Test Suite`, etc.). Edit the `#projects` and `#skills` sections in `index.html` with your real work, and update the `Source` / `Report` links (currently `#`).
4. **Contact links** — Instagram, LinkedIn and Email are already wired to your real accounts in the hero and contact sections.

## Run locally

Just open `index.html` in a browser, or serve it:

```bash
npx serve .
```

## Deploy to GitHub Pages

```bash
git init
git add .
git commit -m "Initial portfolio site"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```

Then in the GitHub repo: **Settings → Pages → Source → Deploy from branch → main / (root)**.
Your site will be live at `https://<your-username>.github.io/<repo-name>/`.

## My Apps section

The **MY APPS** section (`#apps`, old `#games` links still work) is generated from metadata:

- `js/apps-data.js` — one object per app (name, category, platforms, version, status, logo, preview, downloads, details for the *Learn More* dialog). **To publish a new app, add an object here — no HTML changes needed.**
- `js/apps.js` — renders the cards, filters and the details dialog (`#app=<id>` deep links).
- `assets/apps/<app-id>/` — logo, previews and the Open Graph image.

### Automatic download switching (GitHub Releases)

An app with a `release: { repo, asset }` entry asks the GitHub API for the repository's latest release.
If that release contains the named asset (e.g. `Awajeh3D-Setup.exe`), the card shows **DOWNLOAD FOR WINDOWS**
pointing at the official release asset URL; otherwise it shows **COMING SOON**. The repository must be
**public** for visitors to download release assets.
