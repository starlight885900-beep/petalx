/**
 * theme.js: bridges CSS custom properties into <canvas>.
 *
 * The blossom is painted in JS, so it cannot inherit theme tokens the way CSS
 * does. This module reads the resolved token values off :root and re-reads them
 * whenever the viewer's theme changes, from either source:
 *   • the OS setting  (prefers-color-scheme)
 *   • an explicit choice stamped as data-theme on <html>
 */

/** Resolved canvas colours. Mutated in place so importers keep a live handle. */
export const palette = {
  a:'#FFFFFF', b:'#DDBE7E', hi:'#C8A04D', stroke:'rgba(138,109,46,.24)',
  face:'rgba(200,160,77,.20)', faceHi:'rgba(200,160,77,.46)',
  edge:'rgba(138,109,46,.11)', edgeHi:'rgba(138,109,46,.32)'
};

function token(name){
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/** Re-read every --petal-* token into `palette`. */
export function readPalette(){
  palette.a      = token('--petal-a')      || palette.a;
  palette.b      = token('--petal-b')      || palette.b;
  palette.hi     = token('--petal-hi')     || palette.hi;
  palette.stroke = token('--petal-stroke') || palette.stroke;
  palette.face   = token('--petal-face')     || palette.face;
  palette.faceHi = token('--petal-face-hi')  || palette.faceHi;
  palette.edge   = token('--petal-edge')     || palette.edge;
  palette.edgeHi = token('--petal-edge-hi')  || palette.edgeHi;
  return palette;
}

/** Run `onChange` after the palette is refreshed, on every theme switch. */
export function onThemeChange(onChange){
  const handler = () => { readPalette(); onChange(); };

  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  if (mq.addEventListener) mq.addEventListener('change', handler);
  else if (mq.addListener) mq.addListener(handler);

  new MutationObserver(handler).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
  });
}
