# geshijoker.github.io

Ge Shi's personal site. A static site with no build step: plain HTML, CSS and JS, served by GitHub Pages from `master`.

The previous Jekyll site is kept on the `personal-page-v1` branch.

## Files
- `content.js`: all text, links, publications and life stories. This is the only file you need to edit for content.
- `world.js`: the sandbox world in the background (pixel island, bots, A* paths).
- `app.js`: renders the content, tabs, filters, photo viewer and the day/night switch.
- `styles.css`: layout and theme colors.
- `assets/photos/`: photos referenced from `content.js`. Strip location metadata before adding new ones.
- `assets/resume.pdf`: the resume linked from the About tab.
- `.nojekyll`: tells GitHub Pages to serve the files as they are, without a Jekyll build.

## Preview locally
    python3 -m http.server 8765
    # open http://localhost:8765

After changing a file, bump the `?v=` number on the asset links in `index.html` so browsers fetch the new version.

## Publish
Commit and push to `master`. GitHub Pages updates the live site within a minute or two.
