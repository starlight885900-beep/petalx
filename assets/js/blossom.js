/**
 * blossom.js: the five-petal sakura mark, drawn on canvas.
 *
 * One petal path is defined pointing straight up, then stamped five times at
 * 72° intervals. `drawBloom` optionally lights one petal, which is how the
 * value cards in the Values section connect to their petal on hover/focus.
 */

import {palette} from './theme.js';

const PETALS = 5;
const TURN = (Math.PI * 2) / PETALS;

/**
 * Trace one sakura petal, tip up, origin at the flower's centre.
 * The two quadratics at the tip cut the notch that distinguishes a cherry
 * blossom from a generic flower.
 *
 * `spread` is the only thing that varies between uses. At the 0.62 default the
 * five petals just touch at 72°, which is the brand mark. The favicon, the
 * logo and make-images.py all assume it. The Five Petals diagram opens them
 * wider so a paragraph fits inside one without crossing the outline.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} R  petal length in px
 * @param {number} [spread=0.62]  petal width as a fraction of R
 */
export function petalPath(ctx, R, spread = 0.62){
  const w = R * spread;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(-w, -R * 0.34, -w * 0.92, -R * 0.86, -R * 0.17, -R);
  ctx.quadraticCurveTo(0, -R * 0.94, 0, -R * 0.8);   // notch
  ctx.quadraticCurveTo(0, -R * 0.94, R * 0.17, -R);
  ctx.bezierCurveTo(w * 0.92, -R * 0.86, w, -R * 0.34, 0, 0);
  ctx.closePath();
}

/** Ten stamens radiating from the centre, at three staggered lengths. */
function drawStamens(ctx, R){
  ctx.save();
  for (let k = 0; k < 10; k++){
    const ang = k * (Math.PI * 2 / 10) + 0.3;
    const len = R * (0.24 + (k % 3) * 0.05);
    const x = Math.cos(ang) * len;
    const y = Math.sin(ang) * len;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(x, y);
    ctx.strokeStyle = palette.stroke;
    ctx.lineWidth = R * 0.009;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x, y, R * 0.02, 0, Math.PI * 2);
    ctx.fillStyle = palette.hi;
    ctx.fill();
  }
  ctx.restore();
}

/**
 * Paint the blossom, filling the canvas.
 *
 * Two looks, same geometry. The petal path never changes, so the canvas, the
 * SVG favicon and the PNG social card stay the identical shape:
 *
 *   default  white→pink gradient. Decorative, used for the hero.
 *   flat     one solid face per petal. Used by the Five Petals diagram, where
 *            copy sits ON the petals and the gradient's midpoint would leave
 *            text on muddy mauve in dark mode.
 *
 * @param {HTMLCanvasElement} canvas
 * @param {number} highlight  index 0–4 to light, or -1 for none
 * @param {{flat?:boolean, stamens?:boolean, radius?:number, spread?:number}} [opts]
 */
export function drawBloom(canvas, highlight = -1, opts = {}){
  const {flat = false, stamens = true, radius = 0.46, spread = 0.62} = opts;

  const ctx = canvas.getContext('2d');
  const {width: W, height: H} = canvas;
  const cx = W / 2, cy = H / 2, R = Math.min(W, H) * radius;

  ctx.clearRect(0, 0, W, H);

  /** Run `paint` once per petal, inside its own rotated transform. */
  const eachPetal = (order, paint) => {
    for (const i of order){
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(i * TURN);
      if (highlight === i && !flat) ctx.scale(1.05, 1.05);
      petalPath(ctx, R, spread);
      paint(i, highlight === i);
      ctx.restore();
    }
  };

  // Highlighted petal goes last in both passes, so nothing overlaps it.
  const order = [0, 1, 2, 3, 4].filter((i) => i !== highlight);
  if (highlight >= 0) order.push(highlight);

  if (flat){
    // Two passes. Filling everything before stroking anything keeps the five
    // outlines symmetric. One pass would let each petal's fill bury the
    // outline of the one before it, and the blossom reads as a blob.
    eachPetal(order, (i, lit) => {
      ctx.fillStyle = lit ? palette.faceHi : palette.face;
      ctx.fill();
    });
    eachPetal(order, (i, lit) => {
      ctx.lineWidth = R * 0.0035;
      ctx.strokeStyle = lit ? palette.edgeHi : palette.edge;
      ctx.stroke();
    });
  } else {
    eachPetal(order, (i, lit) => {
      const grad = ctx.createLinearGradient(0, 0, 0, -R);
      grad.addColorStop(0, palette.a);
      grad.addColorStop(1, lit ? palette.hi : palette.b);
      ctx.fillStyle = grad;
      ctx.globalAlpha = lit ? 1 : 0.93;
      ctx.fill();

      ctx.globalAlpha = 1;
      ctx.lineWidth = R * 0.012;
      ctx.strokeStyle = palette.stroke;
      ctx.stroke();
    });
  }

  if (stamens){
    ctx.save();
    ctx.translate(cx, cy);
    drawStamens(ctx, R);
    ctx.restore();
  }
}

/**
 * Wire the strategy blocks to the blossom: hovering or tabbing to one lights
 * the petal it sits on.
 * @param {HTMLCanvasElement} canvas
 * @param {NodeListOf<HTMLElement>} cards  elements carrying data-petal="0..4"
 * @param {object} [opts]  forwarded to drawBloom
 */
export function linkCardsToPetals(canvas, cards, opts = {}){
  let active = -1;
  const paint = () => drawBloom(canvas, active, opts);
  const set = (i) => { active = i; paint(); };

  cards.forEach((card) => {
    const index = parseInt(card.dataset.petal, 10);
    card.addEventListener('mouseenter', () => set(index));
    card.addEventListener('mouseleave', () => set(-1));
    card.addEventListener('focusin',   () => set(index));
    card.addEventListener('focusout',  () => set(-1));
  });

  paint();   // resting state; hover only re-paints
  return {redraw: paint};
}
