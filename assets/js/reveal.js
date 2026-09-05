/**
 * reveal.js: scroll behaviour. fade-up reveals, the sticky nav hairline,
 * and smooth in-page anchor jumps. No parallax, no scroll-jacking.
 */

import {scrollBehavior} from './motion.js';

/** Fade every .rv element up once, the first time it enters the viewport. */
export function initReveal(){
  // Tells the bootstrap in index.html that reveals are handled here, so it
  // leaves the .js class on. Without this the page un-hides itself and the
  // content is shown rather than stranded at opacity:0.
  if (!('IntersectionObserver' in window)) return;
  document.documentElement.setAttribute('data-reveal-ready', '');

  const io = new IntersectionObserver((entries) => {
    for (const entry of entries){
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('in');
      io.unobserve(entry.target);
    }
  }, {rootMargin: '0px 0px -8% 0px', threshold: 0.08});

  document.querySelectorAll('.rv').forEach((el) => io.observe(el));
}

/** Add a hairline under the nav once the page has scrolled past the top. */
export function initStickyNav(nav, sentinel){
  if (!nav || !sentinel) return;
  const io = new IntersectionObserver(
    ([entry]) => nav.classList.toggle('stuck', !entry.isIntersecting),
    {rootMargin: '-71px 0px 0px 0px'}
  );
  io.observe(sentinel);
}

/** Smooth-scroll same-page anchors and keep the URL hash in step. */
export function initSmoothScroll(){
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const hash = link.getAttribute('href');
      if (!hash || hash.length < 2) return;
      const target = document.querySelector(hash);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({behavior: scrollBehavior, block: 'start'});
      history.replaceState(null, '', hash);
    });
  });
}
