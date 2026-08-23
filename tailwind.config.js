/* =====================================================================
   DGmarket · Tailwind CSS theme configuration (build-time)
   Compiled by PostCSS. `content` globs enable tree-shaking.
   ===================================================================== */

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts}'],
  theme: {
    extend: {
      colors: {
        brand: '#345793',
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
