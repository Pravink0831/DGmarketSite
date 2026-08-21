# WEBARTISTA

A cinematic web design studio landing page combining a **Three.js topographic wave grid** and a **raw WebGL Navier-Stokes fluid simulation**, styled with **Tailwind CSS** and self-hosted fonts.

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
webartista/
├── index.html               # Markup (module entry, WEBARTISTA logo in nav + footer)
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
    ├── assets/
    │   └── logo.svg         # Reusable WEBARTISTA wordmark (vector)
    ├── css/
    │   └── input.css        # @tailwind directives + all custom styles
    └── js/
        ├── main.js          # Entry: imports fonts, css, both canvas layers
        ├── fonts.js         # Self-hosted @fontsource imports
        ├── topography.js    # LAYER 1 — Three.js wave grid (ES module)
        └── fluid.js         # LAYER 2 — WebGL fluid sim (no dependency)
```

---

## 🎨 Brand logo

The **WEBARTISTA** wordmark is a self-contained inline **SVG** — "WEB" in teal `#22C3D6`,
"ARTISTA" in white, followed by the double-chevron mark. It is embedded directly in the
nav and footer (no external image request) and also provided as a standalone reusable
asset at `src/assets/logo.svg`. Because it is vector, it stays crisp at any size and is
trivial to recolor via the `fill`/`stroke` attributes.

---

## 📜 License of dependencies

| Dependency | License | Commercial use |
|---|---|---|
| Tailwind CSS | MIT | ✅ |
| Three.js | MIT | ✅ |
| Space Grotesk / JetBrains Mono / Orbitron | SIL OFL 1.1 | ✅ |
| Fluid simulation (`fluid.js`) | Your own code | ✅ |

All free for commercial use. Retain upstream MIT/OFL notices in `node_modules`.
