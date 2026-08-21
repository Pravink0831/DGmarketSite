/* =====================================================================
   WEBARTISTA · Application entry point
   ---------------------------------------------------------------------
   Vite resolves and bundles everything imported here:
     1. Self-hosted fonts (CSS)
     2. Tailwind-compiled stylesheet (CSS)
     3. Layer 1 — Three.js topographic wave grid
     4. Layer 2 — WebGL fluid simulation
   ===================================================================== */
import './fonts.js';
import '../css/input.css';

import './topography.js';
import './fluid.js';
