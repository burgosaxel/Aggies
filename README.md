# Aggie’s Ice Cream — Static Site Prototype

This repository contains a responsive, single-page static prototype for Aggie’s Ice Cream (South Berwick, ME) built to the redesign brief.

Quick start (preview locally):

1. Open a terminal in this folder.
2. Run a simple static server, for example with Python 3:

```bash
python -m http.server 8000

# then open http://localhost:8000 in your browser
```

Image optimization
------------------

This project includes a Node.js helper to download remote images referenced in the site (from `index.html` and `data/flavors.json`) and generate optimized JPEG and WebP variants.

Install dependencies and run the optimizer:

```bash
npm install
npm run optimize-images
```

Notes:
- The script saves originals to `assets/images/originals/` and optimized outputs to `assets/images/optimized/`.
- If you already have local images, place them in `assets/images/originals/` and run the script; it will skip downloads and still generate WebP/JPEG sizes.
- `sharp` requires a native binary; if the install fails on Windows, follow the `sharp` troubleshooting guide: https://sharp.pixelplumbing.com/install


What’s included:
- `index.html` — main page scaffold with sections: hero, flavors, flight, menu, story, visit, gallery, footer.
- `assets/css/styles.css` — responsive styles and palette.
- `assets/js/script.js` — lightweight interactions (mobile nav, flavor browser, search & filters).
- `data/flavors.json` — editable JSON used by the flavor browser. Owners can add/remove flavors and update tags/badges.

Notes for the owner or developer:
- Replace the Unsplash image URLs with your own photography in `index.html` and `data/flavors.json`.
- Do not present stock photos as images of Aggie’s; replace with authentic photos when available.
- To update flavors, edit `data/flavors.json`. Fields: `name`, `description`, `tags` (e.g., "new", "fan", "dairy-free"), `badges`, `image`, `available`.
- For Google Maps embed customization or a more sophisticated CMS, integrate with a lightweight headless CMS or a small admin UI.

SEO & schema:
- Basic OpenGraph tags and `IceCreamShop` JSON-LD are included in `index.html`. Update the `url` and `openingHours` when you have authoritative information.

Next steps I can take for you:
- Add a simple CMS (Netlify CMS or Forestry) to let the owner edit flavors and hours.
- Wire up a verified reviews integration (Google / Facebook) so reviews display automatically.
- Optimize images and create a photo gallery manager.
