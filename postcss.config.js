/* =====================================================================
   NEUFORM · PostCSS configuration
   Runs Tailwind (compilation + purge) then Autoprefixer for vendor
   prefixes. Invoked automatically by Vite during dev and build.
   ===================================================================== */
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
