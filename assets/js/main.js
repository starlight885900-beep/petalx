/**
 * main.js: entry point. Wires the modules to the DOM and nothing else.
 * Loaded as <script type="module" defer>, so the DOM is ready on execution.
 */

import {readPalette, onThemeChange} from './theme.js';
import {linkCardsToPetals} from './blossom.js';
import {initPetalField} from './petal-field.js';
import {initReveal, initStickyNav, initSmoothScroll} from './reveal.js';
import {initNav} from './nav.js';
import {initForms} from './forms.js';

const coreBloom = document.getElementById('bloomCore');
const petalField = document.getElementById('petalField');

readPalette();

// The Five Petals diagram carries copy on its petals, so it draws flat and
// without stamens. See drawBloom's options. Every element here is optional:
// a page without one simply skips that piece.
const DIAGRAM = {
  flat: true, stamens: false, radius: 0.48, spread: 0.74,
  // The diagram sits on the navy band, where the page's petal tokens (accent
  // at 12% for a white ground) would all but vanish. These are the accent's
  // lighter tints, tuned for the dark ground. They were brass until the blue
  // redesign, and painted the blossom a muddy olive on navy until a headless
  // render made it visible: check canvases in a browser, not just in CSS.
  colors: {
    face: 'rgba(96,150,255,.13)',
    faceHi: 'rgba(96,150,255,.34)',
    edge: 'rgba(138,174,241,.42)',
    edgeHi: 'rgba(170,198,255,.85)'
  }
};
const values = coreBloom
  ? linkCardsToPetals(coreBloom, document.querySelectorAll('.petal-card'), DIAGRAM)
  : null;

const field = petalField ? initPetalField(petalField) : null;

initReveal();
initNav(document.getElementById('nav'));
// The sentinel is the hero, not #top: the nav only turns into its light bar
// once the dark hero has scrolled out from under it.
initStickyNav(document.getElementById('nav'), document.querySelector('.hero'));
initSmoothScroll();
initForms();

// Repaint the canvas when the viewer switches theme; CSS can't reach it.
onThemeChange(() => values && values.redraw());

// Re-seed the petal field when the hero changes size.
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    if (field) field.restart();
    if (values) values.redraw();
  }, 180);
});
