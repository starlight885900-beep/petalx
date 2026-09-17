# PetalX

The company site for PetalX, an IT company in Tsuwano, Shimane, Japan, building
and running software for companies in the United States.

Bilingual (English + 日本語), static, one page per language. No framework, no
dependencies, no build step required. Five petals, five strategies:
**Craftsmanship · Global Reach · Technology · Trust · Roots**.

The visual language is aligned to `a3techgroup.com` at the owner's request:
accent blue on white, soft 12px cards that lift on hover, one grotesk carrying
the hierarchy by weight. The palette that came before it was navy and brass.
PetalX remains its own company: its own copy, its own positioning, and the
sakura it is named for, now drawn in the accent blue.

---

## Run it

The pages load ES modules, which browsers refuse to fetch over `file://`. Serve
them:

```bash
python3 -m http.server 8000     # then open http://localhost:8000
```

Opening `index.html` straight from disk will *not* leave you with a blank
page; see [The reveal safety net](#the-reveal-safety-net). But the canvas
blossom, the drifting petals and the theme-aware repainting all stay dead,
so serve it.

Any static host works as-is: Netlify, Vercel, GitHub Pages, S3, nginx. Upload
the repo root; there is nothing to compile.

---

## Structure

```
Sakura/
├── index.html                  the English page, all copy lives here, for SEO
├── ja/
│   └── index.html              the Japanese page, same structure and ids
├── assets/
│   ├── css/                    loaded in this order; the cascade depends on it
│   │   ├── tokens.css          ← design system. Change colours HERE, only here.
│   │   ├── base.css            reset, typography (incl. JA), layout, reveal
│   │   ├── components.css      buttons, nav, language switch, cards, forms, footer
│   │   └── sections.css        hero, glance, blossom, flow, contact band
│   ├── js/
│   │   ├── main.js             entry point; wires modules to the DOM
│   │   ├── motion.js           single source of truth for reduced-motion
│   │   ├── theme.js            bridges CSS tokens into <canvas>
│   │   ├── blossom.js          the five-petal mark + card↔petal linking
│   │   ├── petal-field.js      drifting petals behind the hero
│   │   ├── reveal.js           scroll reveals, sticky nav, anchor scrolling
│   │   ├── nav.js              the mobile menu disclosure
│   │   └── forms.js            contact form validation + the backend seam
│   ├── img/                    favicon, logo, social card, touch icon
│   └── fonts/                  empty, fonts load from Google Fonts (see below)
├── api/
│   └── contact.js              the contact form's endpoint; emails via Resend
├── tools/
│   ├── build.py                bundles source → dist/ single files
│   ├── make-images.py          regenerates the PNG assets
│   └── test-contact.js         exercises the endpoint; `node tools/test-contact.js`
├── dist/                       build output, gitignored
├── site.webmanifest
├── robots.txt
└── sitemap.xml
```

**The rule that keeps this tidy:** page copy belongs in the HTML, not in JS.
Crawlers and screen readers both get everything without executing a script.
Nothing on either page is injected at runtime.

---

## Bilingual

Two real pages at two real URLs, not a JavaScript toggle, so each language is
independently crawlable, shareable and translatable.

| | English | 日本語 |
|---|---|---|
| URL | `/` | `/ja/` |
| Source | `index.html` | `ja/index.html` |
| `<html lang>` | `en` | `ja` |

Both carry `hreflang` alternates pointing at each other plus `x-default` → `/`,
and `sitemap.xml` repeats those pairings. The nav shows a `.lang` link to the
other language.

**Both pages use the same element ids** (`contactForm`, `bloomHero`,
`c-topic`, …), so `assets/js/` needs no per-page branching at all. Where a
control carries language, the HTML handles it: the topic `<option>` labels are
translated, while every `value` stays **English**, so your backend sees one
consistent spelling from either page.

**If you edit copy in one language, edit the other.** Nothing enforces this.

### Japanese typography

The Latin pages set everything in **Inter**, with display headings separated
from body copy by weight (800) and tight negative tracking rather than by a
change of face. The old Playfair pairing read institutional in the wrong
direction for an IT company.

`base.css` keys off `html[lang="ja"]` to mirror that in Japanese: **Noto Sans
JP** (ゴシック) for both headings and body, via the `--jp-display` and `--jp`
stacks, each falling back through Hiragino / Yu / MS before the Latin stack.
Headings take weight 700 rather than a Mincho face, matching the Latin
weight-not-face split. It also resets the negative letter-spacing that is a
Latin convention and mangles kana, loosens the line height for mixed script,
and steps the heading sizes down, since CJK carries more weight per character
and the Latin display scale reads as shouting.

Only the JA page loads Noto Sans JP; the EN page loads Inter alone.

---

## Page architecture

One scrolling page per language. The section sequence follows
`a3technologygroup.com`; the content is PetalX's own.

| # | Section | id | Notes |
|---|---------|----|-------|
| 1 | Hero | n/a | Pill, offer-led `h1`, lead, two CTAs, three stats, code-window anchor. |
| 2 | Industries | n/a | The strip where a client-logo row would go. **Placeholders.** |
| 3 | News | `#news` | Dated updates. **Placeholders.** |
| 4 | Strategy | `#petals` | The five petals, on the navy band. *Kept from the old site.* |
| 5 | What we do | `#services` | The six practices. *Kept from the old site.* |
| 6 | Track record | `#track` | Named engagements. **Placeholders.** |
| 7 | Why us | `#why` | Three reasons to choose PetalX. |
| 8 | Approach | `#approach` | Three numbered steps. |
| 9 | Stack | `#stack` | Four groups of tools, drawn from the practice list. |
| 10 | Partnership | `#partnership` | Engagement shape. **Commercial terms are placeholders.** |
| 11 | Company | `#about` | The narrative that used to be "Who we are". |
| 12 | Founders | `#founders` | **Placeholders. Never ship invented names.** |
| 13 | FAQ | `#faq` | Real questions, **placeholder answers**. |
| 14 | Contact | `#contact` | The inline form. |

The section order mirrors `a3techgroup.com`, at the owner's request. Note this
is a **different site** from the `a3technologygroup.com` that the original
visual language was aligned to.

**Everything marked "placeholders" renders as bracketed text or em-dashes on
purpose**, styled by `.tbd`: muted andhalf-transparent, so an accidental deploy
looks obviously unfinished rather than quietly false. Search the HTML for
`TODO(petalx)` to find every one.

Sections removed in this restructure: the pull quote, the Foundation /
Strength / Purpose triad, "What we believe", "Our mission" and the closing
invitation. Their CSS went with them.

**Deliberate differences from the reference**

- **One page, not five.** The reference splits Home / About / What We Do /
  Our Philosophy / Contact. Keeping one page per language halves the surface
  that has to stay in sync across two languages.
- **Six practices, not seven.** The reference lists seven. PetalX lists the
  six it actually does; padding that list would be inventing capabilities.
- **The blossom stays.** The reference has no motif at all. The sakura is
  PetalX's name and symbol, so it is kept, restyled in the accent blue.
- **The facts strip stays.** The reference makes no concrete claims. Location,
  clients and working languages are facts, and they are what a US
  buyer evaluating an overseas vendor actually needs.
- **No copied lines.** The register is matched; the sentences are not. The
  reference signs off "Together, we create new value.". PetalX says
  "Together, we build things that last."

**The blossom is in the hero again.** An earlier pass removed it for
duplicating Five Petals; it came back when the hero was rebuilt as two columns,
because the right half was otherwise empty. It earns the repeat by being
treated differently in each place: in the hero it is a large, cropped,
unlabelled graphic field drawn with its own dark-ground colours via `drawBloom`'s
`colors` option; in Five Petals it is the labelled diagram you actually read.
`main.js` treats every canvas as optional, so removing one does not break the
page.

---

## The design system

Everything resolves through custom properties in `assets/css/tokens.css`. No
component file contains a raw hex value except the few literals inside the dark
band and the footer, which are white-on-dark by definition.

| Token          | Value     | Role                                        |
|----------------|-----------|---------------------------------------------|
| `--ground`     | `#FFFFFF` | Page background                             |
| `--surface-2`  | `#F3F6FB` | The alternating band                        |
| `--ink`        | `#0F1B2E` | Headings, body copy, and the footer ground  |
| `--ink-2`      | `#3A4A5F` | Secondary text                              |
| `--ink-3`      | `#6B7888` | Labels, captions, placeholders              |
| `--accent`     | `#1A56DB` | Buttons, kickers, marks, petals             |
| `--accent-ink` | `#1546B0` | Hover, and accent used as text              |
| `--line`       | `#E3E8EF` | Every hairline on the site                  |
| `--r`          | `12px`    | Cards and panels                            |
| `--r-sm`       | `8px`     | Buttons                                     |

**Elevation, not outline.** The card is the unit the whole page is built from:
white, a 1px `--line` border, 12px corners, and a 3px accent bar that grows down
the left edge on hover while the border fades out and a far-thrown shadow takes
over. Buttons carry a shadow tinted in the accent itself. This replaced a
hairline-only system that used no shadows at all.

**Section rhythm.** White by default, with tinted bands breaking the run and one
dark band carrying the brand:

| Section | Background |
|---------|------------|
| Nav, hero | white |
| Industries strip | `--surface-2`, ruled top and bottom |
| News | white |
| Five Petals | the navy gradient `--band`, white type |
| What we do, Track record, Why us | white |
| Approach | `--surface-2` |
| Stack | white |
| Partnership, Company | `--surface-2` |
| Founders | white |
| FAQ | `--surface-2` |
| Contact | white, two cards |
| Footer | `--ink`, white type |

**One dark band.** The section that explains the company's name sits on a navy
gradient with an accent bloom behind the heading, which is what the reference
does with the block that explains its own name. It is the only dark section
above the footer, so it reads as the brand statement rather than as a stripe.

**The nav is light in every state.** It sits above a white hero, so `.stuck`
only adds the bottom hairline once the page scrolls. The inverted nav that the
old navy hero needed is gone, along with the `.js`-scoped overrides that made it
safe.

**Light only.** The reference ships no dark theme, so neither does this. The
`prefers-color-scheme` and `[data-theme="dark"]` blocks that used to sit in
`tokens.css` are gone, and the pages declare a single `theme-color`. To add a
dark theme back, redefine the semantic tokens (and only those) inside a media
query; `theme.js` already re-reads them and repaints the canvas on a change.

---

## The blossom

The Five Petals section is the one non-obvious piece of layout. One large
blossom fills the container and **each strategy is written on its own petal**.
The petal is the card, set at normal body size. Hovering or tabbing to a
strategy lights the petal under it.

Text sits 0.56R along each petal's axis at 72° intervals; those centres are the
`--x`/`--y` pairs set inline in the HTML and documented in `sections.css`.
Below 900px a blossom this size cannot hold readable text, so it shrinks to a
mark and the strategies become ordinary cards.

The mark itself is one bezier petal in `blossom.js`, stamped five times, and
`drawBloom` takes three options that matter here:

- **`spread`**, petal width. The 0.62 default is the brand mark, where the five
  petals just touch; the favicon, the logo and `make-images.py` all assume it.
  The diagram opens to 0.74 so a paragraph at body size fits inside a petal
  without crossing the outline. **Do not change the default**, it would change
  the logo. Past about 0.8 the petals merge and the blossom reads as a blob.
- **`flat`**, one flat face per petal instead of the white→blue gradient. Copy
  sits on these petals, so a gradient would leave text on a moving ground. The
  faces are the translucent `--petal-face*` / `--petal-edge*` tokens: the five
  petals deepen where they overlap. On the dark band the diagram overrides both
  with lighter values passed as `drawBloom`'s `colors` option, because tokens
  tuned for white go muddy on navy; `main.js` holds that override.
- **`stamens`**, off for the diagram; at this size they clutter the centre where
  the five petals converge.

Flat mode fills every petal before stroking any of them. A single pass lets each
petal's fill bury the outline of the one before it, and the blossom reads as a
blob rather than five overlapping petals.

---

## The reveal safety net

Sections fade in on scroll via `.rv` → `.in`, which means they start at
`opacity:0`. That is a trap: anything stopping the JS leaves a page whose entire
`<main>` is invisible.

So the `opacity:0` rule is **gated on a `.js` class**:

1. A small inline script in `<head>` adds `.js` before first paint, so reveals
   arm with no flash of un-hidden content.
2. `reveal.js` sets `data-reveal-ready` on `<html>` to confirm it is running.
3. If that confirmation never arrives, the class comes straight back off and the
   page renders as plain, fully visible HTML. Two things trigger this: `onerror`
   on the module tag (a failed fetch, this is the `file://` case), and a `load`
   handler (a runtime error, or a browser with no `IntersectionObserver`).

**If you add a new entrance animation, gate it the same way.** A reveal that can
only be undone by JS is a blank page waiting to happen.

---

## The contact form

The form POSTs JSON to **`/api/contact/`** — with the trailing slash, because
`vercel.json` sets `trailingSlash: true` and would otherwise 308 every
submission — a Vercel Function that hands the
enquiry to [Resend](https://resend.com), which emails it. Nothing is stored,
and no third party sees the message: the endpoint is same-origin, which is why
the CSP's `connect-src 'self'` needed no widening.

### Before it can send

Set these in Vercel → Project → Settings → Environment Variables:

| Variable | Required | Notes |
|----------|----------|-------|
| `RESEND_API_KEY` | yes | From resend.com/api-keys. Without it the endpoint logs loudly and answers the visitor with a generic failure. |
| `TO_EMAIL` | no | Where enquiries land. Defaults to `hirotanaka@petalxtech.com`. |
| `FROM_EMAIL` | no | Defaults to `noreply@petalxtech.com`. **Must** be on a domain verified in Resend, which means adding their DNS records at GoDaddy. Until that is done, `onboarding@resend.dev` sends to your own account's address. |

`reply_to` is set to whatever the visitor typed, so replying in your mail client
reaches them rather than the noreply address.

### The payload

Keyed by the `name` attributes already on the inputs:

| Field     | Notes                                                        |
|-----------|--------------------------------------------------------------|
| `name`    | required                                                      |
| `company` | optional                                                      |
| `email`   | required                                                      |
| `topic`   | required; the value is always English, from either page       |
| `message` | required                                                      |
| `website` | the honeypot. People never see it; a filled one gets a silent 200 and no email |
| `locale`  | added by the client, `en` or `ja`, so you can reply in the right language |

### What the endpoint enforces

Client-side validation is a convenience, never a guarantee, so `api/contact.js`
re-checks every field, caps each length, rejects a topic outside the list both
pages offer, and rate-limits to three posts per IP per minute. That limiter is
an in-memory Map inside one warm instance, so treat it as a speed bump rather
than a control; put something real in front if the endpoint is ever abused.

### Checking it without deploying

    node tools/test-contact.js

Mocks the request and response and stubs `fetch`, so it covers the validation,
the honeypot, the rate limit, the subject line and every failure path without
sending mail or needing a key. No runner, no dependencies.

### What the visitor sees

The button disables and reads "Sending…" while the request is in flight, so one
click sends once. On success the form is replaced by the thank-you panel. **On
failure the form stays exactly as it was, still filled in, with the reason in a
tinted box above the button** — a failed send must never look like a successful
one.

---

## Booking calls

The contact band carries Calendly's inline embed under the form, on both pages:
a `.calendly-inline-widget` div whose `data-url` names the event type, plus
`widget.js` from `assets.calendly.com`.

Both pages point at `https://calendly.com/hirotanaka-petalxtech/30min`, which
lives in *two* places per page: the widget's `data-url` and the plain link
beneath it. Change one and you must change the other. That link is deliberately
ordinary HTML, so anyone whose browser blocks the third-party script can still
book a call.

The `data-url` carries `background_color`, `text_color` and `primary_color`, so
the iframe matches the navy band around it. Those are Calendly's own embed
parameters; the widget is an iframe, so CSS in this repo cannot reach inside it.

`vercel.json` allows `assets.calendly.com` in `script-src` and `style-src`, and
`calendly.com` in `frame-src` and `connect-src`. Without all four the widget is
blocked silently.

---

## Deploying (Vercel)

The site is already static, so there is nothing to build. In the Vercel project
settings:

| Setting | Value |
|---------|-------|
| Framework preset | Other |
| Build command | *(leave empty)* |
| Output directory | *(leave empty, i.e. the repo root)* |
| Install command | *(leave empty)* |

`ja/index.html` is served at `/ja/` automatically; no rewrite rule is needed.
`dist/` is gitignored and excluded in `.vercelignore`, so Vercel deploys the
split source rather than the single-file bundles. That is deliberate: separate
CSS and JS files cache independently, which is better over HTTP than one large
document.

### vercel.json

- **`trailingSlash: true`** so `/ja` redirects to `/ja/`, matching the
  `canonical` and `hreflang` URLs the pages declare. Without it the same page is
  reachable at two paths.
- **Security headers** on every route: `nosniff`, `Referrer-Policy`,
  `X-Frame-Options`, a `Permissions-Policy`, and a Content Security Policy.
- **Cache-Control**, split by asset type. CSS and JS are
  `max-age=0, must-revalidate`; images and fonts keep a day with a week of
  `stale-while-revalidate`. None of these files carries a content hash in its
  name, and the HTML revalidates on every load, so any real cache lifetime on
  the CSS means a returning viewer gets **new HTML styled by old CSS** until it
  expires. That happened on the first production deploy: the contact section
  rendered in the previous palette, with the honeypot field visible, because
  `.hp-field` existed only in the newer stylesheet. ETags make revalidation a
  304 and a few bytes, which is the right trade for files this small. If these
  ever get content-hashed names, put the long `immutable` cache back.

The CSP allows `'unsafe-inline'` for scripts and styles, which is required by
three things the page genuinely uses: the reveal bootstrap in `<head>`, the
`onerror` attribute on the module tag, and the inline `--x`/`--y` position
styles on the petal cards. Tightening it further means moving those to hashes
or a nonce, which a static host cannot generate per request.

**If you add anything third-party** (analytics, a form backend, embedded video,
a web font from another host), it will be blocked until you add its origin to
the matching CSP directive. Calendly is already allowed; see
[Booking calls](#booking-calls).

---

## Before the first deploy

- [ ] **Commit.** The repository has no commits yet, so there is nothing for
      Vercel to build from. `git add -A && git commit` then push.
- [ ] **Attach the domain.** Every page declares `https://petalxtech.com/` as its
      canonical and in its `hreflang` pair. Until that domain points at the
      deployment, those tags name a site that is not the one being served,
      which will confuse crawlers that reach the `.vercel.app` URL.
- [ ] Replace the `hello@petalxtech.com` placeholder.

---

## Rebuilding assets

```bash
python3 tools/build.py         # → dist/index.html, dist/ja/index.html, dist/artifact.html
python3 tools/make-images.py   # → og-image.png and apple-touch-icon.png
```

`build.py` inlines the CSS and JS into self-contained files, useful for hosts
with no directory structure, and for publishing as a Claude Artifact. It
concatenates modules with their `import`/`export` keywords stripped, which works
because every exported name is unique. **Add a new module to `JS_ORDER` in
`tools/build.py`, in dependency order, or it will be silently left out.**

The bundle is wrapped in a `DOMContentLoaded` listener. The source loads
`main.js` as `<script type="module" defer>`, which runs after parsing; inlined
into `<head>` as a classic script it would otherwise run against an empty
`<body>` and every `getElementById` would return null.

`make-images.py` needs Pillow. It falls back to Liberation Sans when Inter is
not installed, so re-run it somewhere with Inter if the social card typography
has to match the site exactly.

---

## Before going live

Placeholders that are **not** real and must be replaced:

- [ ] `hello@petalxtech.com`, invented. Appears in both footers and both contact
      sections. Replace with the real address.
- [ ] The footer address is town + prefecture only. Add the full postal address,
      and whatever company registration details Japanese practice expects.

Then:

- [ ] Set `RESEND_API_KEY` in Vercel and verify petalxtech.com with Resend,
      or the contact form cannot send
- [ ] Have a native speaker review the Japanese page (it was not written by one)
- [ ] Re-export `og-image.png` with Inter installed
- [ ] Consider adding what this site deliberately does not claim: founding year,
      team size, named clients, case studies, certifications. Every one of those
      is load-bearing for a US buyer evaluating an overseas vendor, and none of
      them was invented here.
