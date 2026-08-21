/* =====================================================================
   WEBARTISTA · Tailwind CSS theme configuration (build-time)
   ---------------------------------------------------------------------
   Compiled by PostCSS at build time (NOT the runtime Play CDN).
   The `content` globs enable tree-shaking so only classes actually used
   in the markup/JS are emitted — producing a small, static stylesheet.
   ===================================================================== */

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts}'],
  theme: {
    extend: {
      colors: {
        brand: '#345793',
        teal1: '#22C3D6',
        slate1: '#64748B',
        slate2: '#475569',
      },
      fontFamily: {
        sans: ['Space Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        display: ['Orbitron', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
