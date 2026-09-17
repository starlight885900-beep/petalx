/**
 * forms.js: the contact form, on both the English and Japanese pages.
 *
 * The form POSTs JSON to /api/contact, which emails the enquiry (see
 * api/contact.js). Same origin, so the CSP's `connect-src 'self'` already
 * allows it and no third party sees the message.
 *
 * Both language pages use the same ids, and every label lives in the HTML, so
 * this module needs no per-page branching beyond the two strings below, which
 * are shown only when the request fails.
 */

import {scrollBehavior} from './motion.js';

// Trailing slash on purpose. vercel.json sets `trailingSlash: true`, so a
// POST to /api/contact is answered with a 308 to /api/contact/. Browsers do
// follow that and keep the body, but it costs every submission an extra
// round trip for nothing.
const ENDPOINT = '/api/contact/';

const isJapanese = () => document.documentElement.lang === 'ja';

const TEXT = {
  sending: ['Sending…', '送信中…'],
  failed: [
    'Could not send your message. Please try again, or email hirotanaka@petalxtech.com directly.',
    '送信できませんでした。時間をおいて再度お試しいただくか、hirotanaka@petalxtech.com までメールでご連絡ください。',
  ],
};
const say = (key) => TEXT[key][isJapanese() ? 1 : 0];

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
 * POST the form and resolve only if the server actually accepted it.
 *
 * The server's own message is used on the English page; the Japanese page
 * shows its own line, because api/contact.js answers in English.
 *
 * @param {HTMLFormElement} form
 * @throws {Error} with a message fit to show the visitor
 */
async function submitForm(form){
  const payload = Object.fromEntries(new FormData(form).entries());
  payload.locale = document.documentElement.lang;

  let res;
  try {
    res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error(say('failed'));       // offline, DNS, blocked request
  }

  let data = null;
  try { data = await res.json(); } catch { /* an error page, not JSON */ }

  if (!res.ok || !data || !data.ok){
    const detail = data && data.error;
    throw new Error(!detail || isJapanese() ? say('failed') : detail);
  }
  return data;
}

/* --------------------------------------------------------------------- form */

export function initForms(){
  const form = document.getElementById('contactForm');
  if (!form) return;

  const inner = document.getElementById('contactInner');
  const done = document.getElementById('contactDone');
  const error = document.getElementById('contactError');
  const button = form.querySelector('button[type="submit"]');
  const buttonLabel = button ? button.innerHTML : '';

  watchFields(form);

  /** Disable the button while the request is in flight, so one click sends once. */
  const setPending = (pending) => {
    if (!button) return;
    button.disabled = pending;
    if (pending) button.textContent = say('sending');
    else button.innerHTML = buttonLabel;
  };

  const showError = (message) => {
    if (!error) return;
    error.textContent = message;
    error.hidden = false;
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (error) error.hidden = true;
    if (!validateForm(form)) return;

    setPending(true);
    try {
      await submitForm(form);
    } catch (err){
      // The form stays on screen with everything the visitor typed still in
      // it: a failed send must never look like a successful one.
      showError(err.message);
      setPending(false);
      return;
    }
    setPending(false);

    inner.style.display = 'none';
    done.classList.add('on');
    done.scrollIntoView({behavior: scrollBehavior, block: 'center'});
  });
}
