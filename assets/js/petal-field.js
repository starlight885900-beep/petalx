/**
 * petal-field.js: ambient petals drifting down behind the hero.
 *
 * The one piece of continuous motion on the page. Slow, low-opacity and
 * skipped entirely for viewers who ask for reduced motion (they get a single
 * static frame instead of a bare canvas).
 */

import {palette} from './theme.js';
import {petalPath} from './blossom.js';
import {REDUCED_MOTION} from './motion.js';

export function initPetalField(canvas){
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let petals = [];
  let frame = null;

  /** Match the backing store to the CSS box so petals aren't blurry. */
  function resize(){
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return rect;
  }

  /** Deterministic scatter: no Math.random, so first paint is stable. */
  function seed(){
    const rect = resize();
    const count = rect.width < 700 ? 9 : 16;
    petals = Array.from({length: count}, (_, i) => ({
      x: Math.abs((Math.sin(i * 12.9898) * 43758.5453) % 1) * rect.width,
      y: (i / count) * rect.height + (i % 5) * 11,
      r: 5 + (i % 4) * 2.6,
      vy: 0.14 + (i % 5) * 0.035,
      vx: -0.09 - (i % 3) * 0.035,
      rot: i * 0.9,
      vr: 0.0016 + (i % 4) * 0.0007,
      alpha: 0.16 + (i % 4) * 0.06
    }));
    return rect;
  }

  function paint(rect){
    ctx.clearRect(0, 0, rect.width, rect.height);
    for (const p of petals){
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = p.alpha;
      petalPath(ctx, p.r);
      ctx.fillStyle = palette.b;
      ctx.fill();
      ctx.restore();
    }
  }

  function tick(){
    const rect = canvas.getBoundingClientRect();
    for (const p of petals){
      p.y += p.vy;
      p.x += p.vx;
      p.rot += p.vr;
      if (p.y - p.r > rect.height){ p.y = -p.r * 2; p.x = Math.random() * rect.width; }
      if (p.x + p.r < 0) p.x = rect.width + p.r;
    }
    paint(rect);
    frame = requestAnimationFrame(tick);
  }

  function start(){
    const rect = seed();
    if (frame) cancelAnimationFrame(frame);
    if (REDUCED_MOTION){ paint(rect); return; }
    tick();
  }

  start();
  return {restart: start};
}
