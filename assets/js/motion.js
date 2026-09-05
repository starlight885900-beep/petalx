/**
 * motion.js: the site's single source of truth for motion preference.
 *
 * Imported anywhere a decision depends on `prefers-reduced-motion`, so the
 * answer can never drift between modules.
 */

/** True when the viewer has asked their OS to reduce motion. */
export const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Scroll behaviour for jumps and focus moves. */
export const scrollBehavior = REDUCED_MOTION ? 'auto' : 'smooth';
