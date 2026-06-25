# IvosArt — Ivaylo Peytchev

Portfolio site for the original abstract works of **Ivaylo Peytchev**.

- Single-file static site: [`index.html`](index.html)
- Artwork lives in [`images/`](images/) — see [`images/HOW-TO-ADD-YOUR-ART.txt`](images/HOW-TO-ADD-YOUR-ART.txt)
- No build step, no dependencies (fonts load from Google Fonts)

## Edit works
Open `index.html`, find the `works` array near the bottom, and edit titles / medium / tags.
Mark a piece as sold by adding `sold:true` to its entry.

## Deploy
Hosted on Vercel. Pushing to `main` redeploys automatically once the GitHub repo is connected.
