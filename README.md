# PetalX

The company site for PetalX, an IT company in Tsuwano, Shimane, Japan, building
and running software for companies in the United States.

Bilingual (English + 日本語), static, one page per language. No framework, no
dependencies, no build step required. Five petals, five strategies:
**Craftsmanship · Global Reach · Technology · Trust · Roots**.

The visual language, navy and brass, serif display type, hairline rules
instead of shadows, was aligned to `a3technologygroup.com` as a style
reference. PetalX remains its own company: its own copy, its own positioning,
and the sakura it is named for.

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
│   │   ├── forms.js            contact form validation + the backend seam
│   │   └── data/countries.js   48 countries, each as [english, 日本語]
│   ├── img/                    favicon, logo, social card, touch icon
│   └── fonts/                  empty, fonts load from Google Fonts (see below)
├── tools/
│   ├── build.py                bundles source → dist/ single files
│   └── make-images.py          regenerates the PNG assets
├── dist/                       build output, gitignored
├── site.webmanifest
├── robots.txt
└── sitemap.xml
```

**The rule that keeps this tidy:** page copy belongs in the HTML, not in JS.
Crawlers and screen readers both get everything without executing a script. The
only exception is the country list, which is 48 `<option>` tags of no SEO value.

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
`c-country`, …), so `assets/js/` needs no per-page branching. The one place
language matters is the country list, which reads `document.documentElement.lang`
to pick a label, while always submitting the **English** name as the value, so
your backend sees one consistent spelling from either page.

**If you edit copy in one language, edit the other.** Nothing enforces this.

### Japanese typography

The Latin pages pair **Playfair Display** (serif) for display headings with
**Inter** for everything else. That pairing is most of what makes the page read
institutional rather than startup-y.

`base.css` keys off `html[lang="ja"]` to mirror that split in Japanese:
**Noto Serif JP** (明朝) for headings, **Noto Sans JP** (ゴシック) for body, the
`--jp-display` and `--jp` stacks, each falling back through Hiragino / Yu / MS
before the Latin stack. It also resets the negative letter-spacing that is a
Latin convention and mangles kana, loosens the line height for mixed script,
and steps the heading sizes down, since CJK carries more weight per character
and the Latin display scale reads as shouting.

Only the JA page loads the Noto families; the EN page loads Inter and Playfair
alone.

---

## Page architecture

One scrolling page per language. The section sequence follows
`a3technologygroup.com`; the content is PetalX's own.

| # | Section | id | Mirrors the reference's |
|---|---------|----|--------------------------|
| 1 | Hero | n/a | Company name as `h1`, the triad as an italic subtitle, one paragraph, "Learn more". |
| 2 | At a glance | n/a | *(no equivalent, four PetalX facts: location, clients, time zone, languages)* |
| 3 | Who we are | `#about` | "We connect technology with human potential", heading left, narrative right. |
| 4 | Quote | n/a | The definitional pull quote, on a navy band. |
| 5 | Triad | n/a | Foundation / Strength / Purpose, in three ruled columns. |
| 6 | What we believe | `#beliefs` | "Innovation does not come from technology alone" plus three belief blocks. |
| 7 | Five Petals | `#petals` | *(no equivalent. PetalX's own symbol and five strategies)* |
| 8 | What we do | `#services` | The practice list. |
| 9 | Our mission | `#mission` | "Helping people and organizations mobilize their full potential", plus three points. |
| 10 | Invitation | n/a | The long "whether you are…" sentence and the line to remember. |
| 11 | Contact | `#contact` | *(the reference has a contact page; PetalX keeps the form inline)* |

**Deliberate differences from the reference**

- **One page, not five.** The reference splits Home / About / What We Do /
  Our Philosophy / Contact. Keeping one page per language halves the surface
  that has to stay in sync across two languages.
- **Four practices, not seven.** The reference lists seven. PetalX lists the
  four it actually does; padding that list would be inventing capabilities.
- **The blossom stays.** The reference has no motif at all. The sakura is
  PetalX's name and symbol, so it is kept, restyled in brass.
- **The facts strip stays.** The reference makes no concrete claims. Location,
  clients, time zone and working languages are facts, and they are what a US
  buyer evaluating an overseas vendor actually needs.
- **No copied lines.** The register is matched; the sentences are not. The
  reference signs off "Together, we create new value.". PetalX says
  "Together, we build things that last."

**The blossom is not in the hero.** It was, and having it twice weakened both
places. All that remains up top is the drifting petal field at half opacity.
`main.js` treats every canvas as optional, so removing one does not break the
page.

---

## The design system

Everything resolves through custom properties in `assets/css/tokens.css`. No
component file contains a raw hex value except the charcoal contact band, which
deliberately looks identical in both themes.

| Token           | Light     | Role                                      |
|-----------------|-----------|-------------------------------------------|
| `--ground`      | `#FFFFFF` | Page background                           |
| `--surface-2`   | `#EAF0F7` | Mist, pale blue, for tinted panels       |
| `--ink`         | `#0B2545` | Navy. Body copy is set in it, not in black |
| `--ink-2`       | `#52606D` | Secondary text                            |
| `--accent`      | `#C8A04D` | Brass, rules, marks, petals              |
| `--accent-ink`  | `#8A6D2E` | Brass dark enough to use **as text**      |
| `--primary`     | `#0B2545` | Buttons                                   |
| `--r`           | `4px`     | Corner radius, a hint, not a shape       |

**Why two brasses.** `#C8A04D` on white measures about 2.6:1, under the 4.5:1
needed for body text. So brass does every rule, mark and petal, and the derived
`#8A6D2E` (4.9:1) carries eyebrows, links and small type. Same hue, no visible
break. This is the same discipline the old pink palette used.

**Why `--primary` is separate from `--accent`.** A navy button is invisible on a
navy-black page, so `--primary` flips to brass in the dark theme while
`--accent` stays brass in both. Buttons are always high-contrast against the
page they sit on.

**Dark theme.** Tokens are redefined in two places in `tokens.css`: a
`prefers-color-scheme` media query for viewers on the system default, and a
`[data-theme="dark"]` block for an explicit choice. Component rules never appear
inside either, only token definitions. To ship light-only, delete both blocks.

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
- **`flat`**, one flat face per petal instead of the white→pink gradient. Copy
  sits on these petals, and the gradient's midpoint leaves text on muddy mauve
  in dark mode. The faces are the translucent `--petal-face*` / `--petal-edge*`
  tokens: the five petals deepen where they overlap, and the copy reads against
  the page ground rather than against the petal, so `--ink` works in either
  theme. **`--petal-face` is the one value to change if the blossom wants to be
  stronger or fainter.**
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

## Wiring up the form

**The contact form is front-end only right now.** It validates and shows a
success panel, but nothing is stored or emailed, and both pages say so in small
print under the submit button, delete those two `<p class="fine">` lines once a
backend exists.

One function is the seam. In `assets/js/forms.js`:

```js
async function submitForm(form){
  const res = await fetch('/api/contact', {method: 'POST', body: new FormData(form)});
  if (!res.ok) throw new Error(await res.text());
  return {ok: true};
}
```

Payload, keyed by the `name` attributes already on the inputs:

| Field     | Notes                                              |
|-----------|----------------------------------------------------|
| `name`    |                                                    |
| `company` |                                                    |
| `email`   |                                                    |
| `country` | always the English name, from either page          |
| `message` |                                                    |
| `locale`  | added by `submitForm`, `en` or `ja`, so you can reply in the right language |

Client-side validation is a convenience, never a guarantee, **re-validate
everything server side** and rate-limit the endpoint.

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
- **Cache-Control** on `/assets/*`. One hour with a day of
  `stale-while-revalidate`, and a day for images. These files have no content
  hash in their names, so a long `immutable` cache would strand viewers on stale
  CSS after a deploy.

The CSP allows `'unsafe-inline'` for scripts and styles, which is required by
three things the page genuinely uses: the reveal bootstrap in `<head>`, the
`onerror` attribute on the module tag, and the inline `--x`/`--y` position
styles on the petal cards. Tightening it further means moving those to hashes
or a nonce, which a static host cannot generate per request.

**If you add anything third-party** (analytics, a form backend, embedded video,
a web font from another host), it will be blocked until you add its origin to
the matching CSP directive.

---

## Before the first deploy

- [ ] **Commit.** The repository has no commits yet, so there is nothing for
      Vercel to build from. `git add -A && git commit` then push.
- [ ] **Attach the domain.** Every page declares `https://petalx.ai/` as its
      canonical and in its `hreflang` pair. Until that domain points at the
      deployment, those tags name a site that is not the one being served,
      which will confuse crawlers that reach the `.vercel.app` URL.
- [ ] Replace the `hello@petalx.ai` placeholder.
- [ ] Point `submitForm` at a real endpoint and delete the two demo notices.

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

- [ ] `hello@petalx.ai`, invented. Appears in both footers and both contact
      sections. Replace with the real address.
- [ ] `https://petalx.ai/`, in both pages, `robots.txt` and `sitemap.xml`.
- [ ] The footer address is town + prefecture only. Add the full postal address,
      and whatever company registration details Japanese practice expects.

Then:

- [ ] Point `submitForm` at a real endpoint; remove the two demo disclaimers
- [ ] Have a native speaker review the Japanese page (it was not written by one)
- [ ] Re-export `og-image.png` with Inter installed
- [ ] Consider adding what this site deliberately does not claim: founding year,
      team size, named clients, case studies, certifications. Every one of those
      is load-bearing for a US buyer evaluating an overseas vendor, and none of
      them was invented here.
