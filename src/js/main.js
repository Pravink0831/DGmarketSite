/* =====================================================================
   DGmarket · Application entry point
   Vite bundles everything imported here:
     1. Self-hosted fonts (CSS)
     2. Tailwind-compiled stylesheet (CSS)
     3. Layer 1 — Three.js topographic wave grid
     4. Layer 2 — WebGL fluid simulation
     5. Hero slide controller (4 rotating headlines + glass motion)
   ===================================================================== */
import './fonts.js';
import '../css/input.css';

import './topography.js';
import './fluid.js';
import './slider.js';
import './motion.js';
