/**
 * api/contact.js: the contact form's backend.
 *
 * A Vercel Function. Anything under /api is deployed as one automatically, so
 * the site stays a static build with a single endpoint beside it. The page
 * POSTs JSON here; this hands it to Resend, which emails it to the address in
 * TO_EMAIL. Nothing is stored.
 *
 * CommonJS on purpose: the repo has no package.json, so there is no
 * "type":"module" to make `export default` legal. `fetch` is global on the
 * Node 18+ runtimes Vercel uses, so there are no dependencies to install.
 *
 * Environment variables (Vercel → Project → Settings → Environment Variables):
 *
 *   RESEND_API_KEY   required. From resend.com/api-keys.
 *   TO_EMAIL         optional, defaults below. Where enquiries land.
 *   FROM_EMAIL       optional, defaults below. MUST be on a domain verified
 *                    in Resend, or Resend rejects the send. Before petalxtech.com
 *                    is verified, "PetalX <onboarding@resend.dev>" works for
 *                    mail addressed to your own account.
 *
 * Client-side validation is a convenience, never a guarantee, so everything is
 * re-validated here.
 */

const TO_EMAIL = process.env.TO_EMAIL || 'hirotanaka@petalxtech.com';
const FROM_EMAIL = process.env.FROM_EMAIL || 'PetalX site <noreply@petalxtech.com>';

/** The topic values both pages submit. The JA page submits English too. */
const TOPICS = [
  'Software Development', 'Cloud & Infrastructure', 'Web & Mobile',
  'AI & Data', 'IT Consulting', 'Business Automation', 'Something else',
];

const LIMITS = {name: 200, company: 200, email: 320, message: 5000};

/* Best-effort rate limit: 3 posts per IP per minute. The Map lives in one warm
   instance, so a determined sender who hits several instances gets more than
   three. It is here to blunt accidental double-submits and casual spam, not as
   a security control; put a real limiter in front if this gets abused. */
const RECENT = new Map();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 3;

function rateLimited(ip){
  const now = Date.now();
  const hits = (RECENT.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  hits.push(now);
  RECENT.set(ip, hits);
  if (RECENT.size > 5000) RECENT.clear();          // crude ceiling on memory
  return hits.length > MAX_PER_WINDOW;
}

/** Trim, coerce to string, and cap. Returns '' for anything missing. */
const clean = (value, max) => String(value == null ? '' : value).trim().slice(0, max);

/** Deliberately loose: the only real test of an address is sending to it. */
const looksLikeEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);

/** Header injection guard for the values that reach the subject line. */
const oneLine = (value) => value.replace(/[\r\n]+/g, ' ');

module.exports = async function handler(req, res){
  if (req.method !== 'POST'){
    res.setHeader('Allow', 'POST');
    return res.status(405).json({error: 'Method not allowed'});
  }

  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  if (rateLimited(ip)){
    return res.status(429).json({error: 'Too many messages. Please try again in a minute.'});
  }

  let body = req.body;
  if (typeof body === 'string'){
    try { body = JSON.parse(body); } catch { body = null; }
  }
  if (!body || typeof body !== 'object'){
    return res.status(400).json({error: 'Malformed request.'});
  }

  // The honeypot: a field hidden from people and irresistible to bots. A bot
  // that fills it gets a 200 and no email, so it has nothing to learn from.
  if (clean(body.website, 200)){
    console.info('[contact] honeypot tripped', {ip});
    return res.status(200).json({ok: true});
  }

  const name = clean(body.name, LIMITS.name);
  const company = clean(body.company, LIMITS.company);
  const email = clean(body.email, LIMITS.email);
  const topic = clean(body.topic, 80);
  const message = clean(body.message, LIMITS.message);
  const locale = body.locale === 'ja' ? 'ja' : 'en';

  if (!name || !email || !message || !topic){
    return res.status(400).json({error: 'Please fill in every required field.'});
  }
  if (!looksLikeEmail(email)){
    return res.status(400).json({error: 'That email address does not look right.'});
  }
  if (!TOPICS.includes(topic)){
    return res.status(400).json({error: 'Unknown topic.'});
  }

  const key = process.env.RESEND_API_KEY;
  if (!key){
    // Loud in the logs, vague to the sender: a misconfigured server is not
    // the visitor's problem, and naming the missing variable helps nobody
    // except someone probing the endpoint.
    console.error('[contact] RESEND_API_KEY is not set; nothing was sent');
    return res.status(500).json({error: 'Could not send the message. Please email us directly.'});
  }

  const text = [
    `Name:     ${name}`,
    `Company:  ${company || '(not given)'}`,
    `Email:    ${email}`,
    `Topic:    ${topic}`,
    `Language: ${locale === 'ja' ? 'Japanese (replied in JA)' : 'English'}`,
    '',
    message,
    '',
    `— sent from the ${locale === 'ja' ? '/ja/' : '/'} contact form`,
  ].join('\n');

  try {
    const resend = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {Authorization: `Bearer ${key}`, 'Content-Type': 'application/json'},
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [TO_EMAIL],
        reply_to: email,           // replying in your mail client reaches them
        subject: `PetalX enquiry — ${oneLine(topic)} — ${oneLine(name)}`,
        text,
      }),
    });

    if (!resend.ok){
      const detail = await resend.text();
      console.error('[contact] resend rejected the send', resend.status, detail);
      return res.status(502).json({error: 'Could not send the message. Please email us directly.'});
    }
  } catch (err){
    console.error('[contact] resend request failed', err);
    return res.status(502).json({error: 'Could not send the message. Please email us directly.'});
  }

  return res.status(200).json({ok: true});
};
