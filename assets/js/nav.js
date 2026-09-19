/**
 * nav.js: the mobile navigation disclosure.
 *
 * Below the 768px (md) breakpoint the link list collapses behind a Menu button.
 * The panel is a plain disclosure, not a modal: it pushes nothing, traps
 * nothing, and closes on Escape, on choosing a link, and on growing past the
 * breakpoint.
 *
 * The CSS that hides the list is scoped to `.js`, so if this module never
 * runs the links simply stack in the bar and stay reachable. A menu that can
 * only be opened by script must never be the only way to navigate.
 */

// Tailwind's md breakpoint, where the header shows the links inline.
const DESKTOP = 768;

export function initNav(nav){
  if (!nav) return;

  const toggle = nav.querySelector('.nav-toggle');
  const panel = nav.querySelector('.nav-links');
  if (!toggle || !panel) return;

  const setOpen = (open) => {
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  };

  toggle.addEventListener('click', () => setOpen(!nav.classList.contains('open')));

  // Choosing a destination closes the menu; the anchor scroll happens anyway.
  panel.addEventListener('click', (event) => {
    if (event.target.closest('a')) setOpen(false);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || !nav.classList.contains('open')) return;
    setOpen(false);
    toggle.focus();
  });

  // Growing past the breakpoint would otherwise strand the panel open.
  let timer;
  window.addEventListener('resize', () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (window.innerWidth > DESKTOP) setOpen(false);
    }, 150);
  });
}
