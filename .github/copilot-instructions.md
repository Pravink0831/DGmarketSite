# Copilot Instructions — WEBARTISTA Website

> These are project-wide rules for GitHub Copilot. Follow them on **every** request,
> for **every** file in this repository, without being reminded.

---

## 1. Project Overview

- **Project:** WEBARTISTA — a single-page cinematic marketing website.
- **Core experience:** scroll-driven motion, section reveal animations, and a WebGL/Three.js
  3D background effect.
- **Build engine:** Vite. **Styling:** Tailwind CSS. **Language:** modern vanilla JS (ES modules).
- **Design language:** clean, modern, high-contrast. Light layouts with crisp black fonts,
  brand-blue glow accents, readable typography, larger feature containers, minimal
  distracting effects (no shake, no blur, no floating transitions).

---

## 2. 🔒 LOCKED FILE & FOLDER STRUCTURE — DO NOT CHANGE

The structure below is **frozen**. Never rename, move, delete, or restructure files.
Motion and animation modules may be added or updated under `src/js/` when needed for a
requested section or interaction. Animation styles may be added or updated in
`src/css/input.css`.

```
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── eslint.config.js
├── .prettierrc.json
├── .nvmrc
├── .gitignore
├── .env.example
├── README.md
└── src/
    ├── css/
    │   └── input.css
    └── js/
        ├── main.js
        ├── motion.js
        ├── fonts.js
        ├── topography.js
        ├── fluid.js
        └── slider.js
```

**Rules:**
- ✅ You **may** add or update motion and animation files under `src/js/` when required by the requested work.
- ❌ Do **not** create unrelated files or new folders.
- ❌ Do **not** rename or move any file.
- ❌ Do **not** add CDN `<script>`/`<link>` tags to `index.html` — it stays a single module entry.
- ❌ Do **not** change build config: `vite.config.js`, `tailwind.config.js`, `postcss.config.js`,
  `eslint.config.js`, `.prettierrc.json`, `.nvmrc`.
- ✅ You **may** edit: `index.html` (section markup, nav, footer), `src/css/input.css`,
  motion and animation modules under `src/js/`, and the section-level contents inside
  `src/js/main.js`.

---

## 3. 🔒 DO-NOT-TOUCH ENGINE LOGIC

These modules contain the animation/render engine. Their internal logic is **off-limits**
unless I explicitly ask you to modify that specific file by name.

- `src/js/topography.js` — background topography effect engine.
- `src/js/fluid.js` — fluid/WebGL background engine.
- `src/js/slider.js` — hero slider engine (arrow navigation + glass motion transition).
- `src/js/fonts.js` — font loading logic.

Motion and animation modules such as `src/js/motion.js` are explicitly editable. Their
logic may be updated or extended to support section reveals, transitions, staggered
entrances, scroll interactions, and other requested motion behavior.

**Rules:**
- Never refactor, "optimize," rewrite, or reformat the protected engine files as a side effect of another task.
- Never change their public function signatures, exports, init order, or config constants.
- If a task *seems* to require an engine change, **stop and ask me first** — describe the change
  and wait for approval before editing.

---

## 4. Section-by-Section Workflow (prevents overwriting finished work)

This is the most important behavioral rule.

- Work on **one section at a time**. When I ask for a section, modify **only** that section.
- **Never** modify, re-order, restyle, or "improve" sections I did not ask about — even if you
  think they could be better. Leave completed sections **byte-for-byte unchanged**.
- Produce **complete, self-contained blocks** for the requested section (full markup and/or the
  relevant slice of `main.js`), not partial snippets, so I can drop them in cleanly.
- Preserve all existing functionality. Do not remove existing IDs, classes, data-attributes,
  event bindings, or nav/footer wiring unless I ask.
- Assume every prior section is **shipped and locked**. Treat the repo as production.

---

## 5. Brand & Design Rules

- **Brand name:** WEBARTISTA (do not silently rename the brand or the site title).
- **Logo:** use the provided **PNG** logo, embedded in both the nav and the footer.
- **Accent:** brand-blue glow for outlines, active states, and hero slide outlines.
- **Hero slides:** keep the original slide headlines. Next-arrow navigation uses a
  **glass motion** transition.
- **Typography:** crisp, highly readable black fonts on light backgrounds; larger feature cards.
- **Avoid:** dark/overly-stylized themes, shake, blur, and floating/overwriting transitions.
  Feature showcases should reveal cleanly, not overwrite one another.

---

## 6. Code Quality Standards

- Follow the existing **ESLint** and **Prettier** config already in the repo — do not add
  new lint/format tooling or override rules.
- Use **ES module** syntax consistently with the current `src/js` files.
- Prefer **environment variables** (`.env` / `.env.example`) over hardcoded values;
  never hardcode secrets or endpoints.
- Keep changes **minimal and surgical** — the smallest diff that accomplishes the task.
- Match the existing code style, naming, and indentation of the file being edited.
- Add error handling for anything that can fail (asset loads, WebGL init, DOM lookups).

---

## 7. When In Doubt

- If a request is ambiguous, or would require touching a locked file or the engine logic,
  **ask a clarifying question first** instead of guessing.
- Never expand scope beyond what was explicitly requested.
- If you believe a structural change is genuinely needed, propose it in a comment/chat —
  **do not** implement it unilaterally.
