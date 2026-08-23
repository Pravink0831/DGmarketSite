# DGmarket — Web Design Studio

A cinematic landing page combining a **Three.js topographic wave grid**, a **raw WebGL Navier-Stokes fluid simulation**, and a **WEBARTISTA-style 4-slide hero with a glass-motion transition**, styled with **Tailwind CSS** and self-hosted fonts.

Configured for **production** with [Vite](https://vitejs.dev/): all dependencies installed locally and version-pinned — **no runtime CDNs**.

---

## 🚀 Quick start

```bash
nvm use            # optional — reads .nvmrc (Node 20)
npm install        # install pinned dependencies
npm run dev        # dev server + hot reload → http://localhost:5173
npm run build      # optimized static build → ./dist
npm run preview    # preview the build → http://localhost:4173
```

---

## 📁 Project structure (LOCKED — only content/logo/sections change)

```
dgmarket/
├── index.html               # Markup (module entry) + 4-slide hero + glass overlay
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
    │   └── input.css        # @tailwind directives + styles + hero/slider + glass sweep
    └── js/
        ├── main.js          # Entry: fonts → css → topography → fluid → slider
        ├── fonts.js         # Self-hosted @fontsource imports
        ├── topography.js    # LAYER 1 — Three.js wave grid (engine, unchanged)
        ├── fluid.js         # LAYER 2 — WebGL fluid sim (engine, unchanged)
        └── slider.js        # HERO — 4-slide controller + glass-motion trigger
```

---

## 🎬 Hero slider + glass motion

Four rotating headlines (original) over the live Three.js + fluid background.
Each headline has an **outlined middle word** with a **brand-blue glow**.

| # | Headline (middle word outlined) | Sub-label |
|---|---|---|
| 1 | Web **Design** Studio | Get In Touch |
| 2 | Precision **Performance** Progress | About Us |
| 3 | What **We** Do | Our Expertise |
| 4 | Explore **Our** Work | Discover Work |

**Glass motion:** on every slide change (arrow click, dot, keyboard, swipe, or
auto-advance) a translucent **frosted-glass pane sweeps across** the hero in the
direction of travel — real `backdrop-filter` blur + a specular streak — while the
outgoing headline blurs out and the incoming one "refracts" in. The content swap
is masked mid-sweep for a seamless morph.

Tuning knobs:
- Duration → `--glass-dur` in `input.css` **and** `GLASS_MS` in `slider.js` (keep in sync).
- Autoplay → `AUTOPLAY_MS` in `slider.js`.
- Blur strength / tint → `.hero-glass` + `glassSweep`/`glassSweepLeft` keyframes.

Respects `prefers-reduced-motion` (glass hidden, simple fade fallback).

---

## 🎨 Glow utilities

| Class | Effect | Used on |
|---|---|---|
| `.outline-word` | Transparent fill + brand-blue stroke + outer glow | Hero middle words |
| `.brand-glow` | Solid brand-blue text with layered halo | Hero eyebrow labels |
| `.brand-glow-text` | Gradient-filled glow | Section accents |
| `.gradient-text` | White→blue vertical gradient | Headlines |

---

## 📜 Dependency licenses

| Dependency | License | Commercial use |
|---|---|---|
| Tailwind CSS | MIT | ✅ |
| Three.js | MIT | ✅ |
| Space Grotesk / JetBrains Mono / Orbitron | SIL OFL 1.1 | ✅ |
| Fluid + slider (own code) | — | ✅ |
