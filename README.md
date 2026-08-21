# NEUFORM — Structural Intelligence

A cinematic landing page combining a **Three.js topographic wave grid** and a **raw WebGL Navier-Stokes fluid simulation**, styled with **Tailwind CSS** and self-hosted fonts.

This repository is configured for **production** using [Vite](https://vitejs.dev/): all dependencies are installed locally and version-pinned — **no runtime CDNs**.

---

## 🚀 Quick start

```bash
# 1. Use the pinned Node version (optional, if you use nvm)
nvm use            # reads .nvmrc (Node 20)

# 2. Install dependencies
npm install

# 3. Start the dev server (hot reload) → http://localhost:5173
npm run dev

# 4. Produce an optimized production build → ./dist
npm run build

# 5. Preview the production build locally → http://localhost:4173
npm run preview
```

---

## 📁 Project structure

```
neuform/
├── index.html               # Markup (module entry, no CDN tags)
├── package.json             # Scripts + pinned dependencies
├── vite.config.js           # Build/dev/preview config
├── tailwind.config.js       # Theme (brand colors, fonts) + content globs
├── postcss.config.js        # Tailwind + Autoprefixer pipeline
├── eslint.config.js         # Lint rules (flat config, ESLint 9)
├── .prettierrc.json         # Formatting rules
├── .nvmrc                   # Node version pin
├── .env.example             # Environment variable template (copy → .env)
├── .gitignore
└── src/
    ├── css/
    │   └── input.css        # @tailwind directives + all custom styles
    └── js/
        ├── main.js          # Entry: imports fonts, css, both canvas layers
        ├── fonts.js         # Self-hosted @fontsource imports
        ├── topography.js    # LAYER 1 — Three.js wave grid (ES module)
        └── fluid.js         # LAYER 2 — WebGL fluid sim (no dependency)
```

---

## 🔧 What changed from the CDN prototype

| Area | Before (prototype) | After (production) |
|---|---|---|
| **Tailwind** | Play CDN (runtime, dev-only) | Compiled + purged at build time via PostCSS |
| **Three.js** | `cdnjs` global `<script>` (r128) | `npm i three`, ES-module import, own vendor chunk |
| **Fonts** | Google Fonts `<link>` (runtime CDN) | Self-hosted via `@fontsource` (bundled) |
| **Styling** | Separate `styles.css` | Merged into `src/css/input.css` w/ Tailwind directives |
| **Config** | Inline `tailwind.config.js` script | Standard config consumed by the build |
| **Versioning** | Floating CDN URLs | Pinned in `package.json` |

---

## 🧱 Deployment

`npm run build` outputs a fully static site to `./dist` (relative asset paths via `base: './'`), deployable to:

- **Azure Static Web Apps** (recommended) — set build output to `dist`, framework preset "Custom".
- **Azure App Service / Storage static website / CDN**.
- **GitHub Pages** — serve the `dist` folder (relative paths already handled).
- Any static host / SharePoint hosted site.

Environment variables (see `.env.example`) must be prefixed `VITE_` to be exposed to the client. **Never** place server secrets in a client bundle.

---

## ⚠️ Notes & risks

- **WebGL requirement**: both layers require WebGL. `fluid.js` and `topography.js` degrade gracefully (console warning + skip) when the context/canvas is unavailable.
- **Three.js major version**: pinned to `^0.171`. The APIs used are stable, but review the [migration guide](https://github.com/mrdoob/three.js/wiki/Migration-Guide) before bumping a major.
- **Accessibility**: a `prefers-reduced-motion` block disables heavy animations. The fluid/topography canvases are decorative (behind `pointer-events` / `aria-hidden` friendly overlays).
- **Performance**: two continuous `requestAnimationFrame` GPU loops. Consider pausing on `document.hidden` for battery-sensitive contexts (future enhancement).

---

## 📜 License of dependencies

| Dependency | License | Commercial use |
|---|---|---|
| Tailwind CSS | MIT | ✅ |
| Three.js | MIT | ✅ |
| Space Grotesk / JetBrains Mono / Orbitron | SIL OFL 1.1 | ✅ |
| Fluid simulation (`fluid.js`) | Your own code | ✅ |

All free for commercial use. Retain upstream MIT/OFL notices in `node_modules`.
