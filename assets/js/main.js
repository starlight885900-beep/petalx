/**
 * main.js: entry point. Wires the modules to the DOM and nothing else.
 * Loaded as <script type="module" defer>, so the DOM is ready on execution.
 */

import {readPalette, onThemeChange} from './theme.js';
import {drawBloom, linkCardsToPetals} from './blossom.js';
import {initPetalField} from './petal-field.js';
import {initReveal, initStickyNav, initSmoothScroll} from './reveal.js';
import {initNav} from './nav.js';
import {initForms} from './forms.js';

const coreBloom = document.getElementById('bloomCore');
const heroBloom = document.getElementById('bloomHero');
const petalField = document.getElementById('petalField');

readPalette();

// The Five Petals diagram carries copy on its petals, so it draws flat and
// without stamens. See drawBloom's options. Every element here is optional:
// a page without one simply skips that piece.
const DIAGRAM = {
  flat: true, stamens: false, radius: 0.48, spread: 0.74,
  // Strategy moved onto the navy band, so the light-theme petal tokens (brass
  // at 20% on white) would go olive. These are tuned for the dark ground and
  // are identical in both themes, as the band itself is.
  colors: {
    face: 'rgba(221,190,126,.22)',
    faceHi: 'rgba(221,190,126,.50)',
    edge: 'rgba(221,190,126,.34)',
    edgeHi: 'rgba(221,190,126,.66)'
  }
};
const values = coreBloom
  ? linkCardsToPetals(coreBloom, document.querySelectorAll('.petal-card'), DIAGRAM)
  : null;

// The hero mark: the brand blossom at its 0.62 default spread, drawn large as
// the hero's visual anchor. No stamens and no highlight, because nothing here
// is interactive; the labelled, selectable blossom is the one in Five Petals.
const paintHero = () => {
  if (!heroBloom) return;
  drawBloom(heroBloom, -1, {
    radius: 0.45,
    stamens: false,
    // Transparent at the centre, brass at the tips: the navy reads through the
    // middle and the mark glows at its edge instead of sitting on the band.
    colors: {
      a: 'rgba(200,160,77,.03)',
      b: 'rgba(221,190,126,.82)',
      stroke: 'rgba(221,190,126,.26)'
    }
  });
};
paintHero();

const field = petalField ? initPetalField(petalField) : null;

initReveal();
initNav(document.getElementById('nav'));
// The sentinel is the hero, not #top: the nav only turns into its light bar
// once the dark hero has scrolled out from under it.
initStickyNav(document.getElementById('nav'), document.querySelector('.hero'));
initSmoothScroll();
initForms();

// Repaint the canvas when the viewer switches theme; CSS can't reach it.
onThemeChange(() => {
  paintHero();
  if (values) values.redraw();
});

// Re-seed the petal field when the hero changes size.
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    if (field) field.restart();
    if (values) values.redraw();
    paintHero();
  }, 180);
});
