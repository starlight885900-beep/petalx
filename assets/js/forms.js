/**
 * forms.js: the contact form, on both the English and Japanese pages.
 *
 * The form is FRONT-END ONLY today: it populates, validates, and swaps in a
 * success panel, but nothing leaves the browser. `submitForm` below is the one
 * function to replace when a backend exists. See README.md → "Wiring up the
 * form" for the payload it produces.
 *
 * Both language pages use the same ids, and every label lives in the HTML,
 * so this module needs no per-page branching at all.
 */

import {scrollBehavior} from './motion.js';

/* ------------------------------------------------------------------ helpers */

const fieldOf = (el) => el.closest('.field');

/** Validate one control and toggle its error message. Returns validity. */
function validateField(el){
  const wrap = fieldOf(el);
  if (!wrap) return true;
  const ok = el.checkValidity();
  wrap.classList.toggle('invalid', !ok);
  return ok;
}

/** Validate a whole form, focusing and scrolling to the first problem. */
function validateForm(form){
  let ok = true;
  let first = null;
  form.querySelectorAll('input, select, textarea').forEach((el) => {
    if (validateField(el)) return;
    ok = false;
    if (!first) first = el;
  });
  if (first){
    first.focus({preventScroll: true});
    first.scrollIntoView({behavior: scrollBehavior, block: 'center'});
  }
  return ok;
}

/** Validate on blur, and clear a shown error as soon as it is fixed. */
function watchFields(form){
  form.querySelectorAll('input, select, textarea').forEach((el) => {
    el.addEventListener('blur', () => validateField(el));
    el.addEventListener('input', () => {
      const wrap = fieldOf(el);
      if (wrap && wrap.classList.contains('invalid')) validateField(el);
    });
  });
}

/* --------------------------------------------------------------- submission */

/**
 * The backend seam. Today it resolves immediately; swap the body for a fetch:
 *
 *   const res = await fetch('/api/contact', {method:'POST', body: new FormData(form)});
 *   if (!res.ok) throw new Error(await res.text());
 *
 * Re-validate everything server side. Client-side validation is a
 * convenience, never a guarantee.
 *
 * @param {HTMLFormElement} form
 */
async function submitForm(form){
  const payload = Object.fromEntries(new FormData(form).entries());
  payload.locale = document.documentElement.lang;
  console.info('[petalx] contact submitted (demo, not persisted)', payload);
  return {ok: true};
}

/* --------------------------------------------------------------------- form */

export function initForms(){
  const form = document.getElementById('contactForm');
  if (!form) return;

  const inner = document.getElementById('contactInner');
  const done = document.getElementById('contactDone');

  watchFields(form);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!validateForm(form)) return;

    await submitForm(form);

    inner.style.display = 'none';
    done.classList.add('on');
    done.scrollIntoView({behavior: scrollBehavior, block: 'center'});
  });
}
