## Scope

Redesign only the public surfaces: `/` (landing) and `/auth`. Authenticated app pages, business logic, i18n keys, and routes stay unchanged.

## Design tokens (locked)

- Palette: paper `#fdfbf7`, espresso `#6b3a2a`, sienna `#a0522d`, copper `#cd7f32`, gold `#e8c07a`
- Type: Syne (700/800) for display + Plus Jakarta Sans (400/500/600) for body — loaded via `<link>` in `__root.tsx` head; keep existing Fraunces/Inter imports until landing/auth stop using them, then trim
- Radius: sharp / minimal (editorial slabs, not rounded cards)
- Motion: hover translate-y, gold underline draws, gentle scroll fade-in

Applied by adding CSS custom properties to `src/styles.css` under `:root` (e.g. `--paper`, `--espresso`, `--sienna`, `--copper`, `--gold`) and a `--font-display` var. Existing shadcn tokens stay so authenticated pages continue rendering.

## Premium imagery

Generate 4 warm editorial images via `imagegen`, saved under `src/assets/`:

1. `founder-hero.jpg` — Black woman founder in a sun-drenched minimalist studio (hero portrait, portrait orientation)
2. `mentors.jpg` — two Black women in a mentorship conversation, warm window light (feature 1)
3. `grants.jpg` — hands on a leather-bound ledger with gold accents, papers and coffee (feature 2)
4. `community.jpg` — small group of Black women founders around a walnut table, editorial (feature 3)

Imported as ES6 assets — no lovable-assets externalization for these.

## `/auth` — apply prototype v2 verbatim

Rebuild `src/routes/auth.tsx` as a two-column editorial spread:

- Left column (`col-span-5`): `founder-hero.jpg` with gradient overlay, "The Mastermind" eyebrow, tagline pulled from i18n
- Right column (`col-span-7`): masthead (brand + location/est line), "Private Access" chip, oversized display heading with sienna italic accent, existing role tab (Founder / Mentor), email + password fields (thin bottom-border underline style), primary button in espresso→sienna, Google button in the same editorial style, reset/apply row
- Keep all existing form state, Supabase calls, HIBP handling, role tabs, and Google OAuth wiring — only markup + classes change
- Keep the current `ssr: false` on this route

## `/` — magazine landing

Rebuild `src/routes/index.tsx` structure:

1. **Masthead header** — brand wordmark with copper stop, small metadata (Vol. / Est. 2026), right-aligned nav: LanguageSwitcher · Sign in · Join CTA
2. **Hero spread** — left: `Vol. 03` chip, oversized Syne headline (`t.landing.h1a` + italic sienna `t.landing.h1b`), lede paragraph, dual CTAs. Right: `founder-hero.jpg` in a bordered slab with copper caption card ("Featured Founder")
3. **Feature triptych** — three numbered editorial cards (01/02/03) each pairing an image (`mentors.jpg` / `grants.jpg` / `community.jpg`) with `t.landing.feature{1,2,3}Title/Body`. H2 tags kept for SEO
4. **Pull-quote band** — full-bleed espresso strip with a large italic Syne quote about community + gold rule
5. **Closing CTA** — cream section with headline, lede, gold underline CTA (existing i18n keys)
6. **Footer** — keep current copy incl. "Feito com propósito por Lannara Silva" purple link

Ticker/marquee optional — skip on first pass to keep motion restrained.

## Motion + micro-UX

- Add a small `.reveal` utility in `src/styles.css` (`opacity-0` → in-view via a lightweight `IntersectionObserver` hook in `src/hooks/use-reveal.ts`) applied to hero + section headings
- `story-link`-style gold underline draw already exists in animations; use for header nav
- Buttons: `hover:-translate-y-0.5` + subtle shadow

## Technical notes

- Fonts loaded via `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap">` in `__root.tsx` `head.links` (never `@import` in styles.css)
- All colors used in landing/auth come from the new CSS vars — no raw hex classes in JSX; add `--color-*` mappings in `@theme inline` so `bg-espresso`, `text-copper`, `border-gold` utilities exist
- SEO metadata on `/` and `/auth` unchanged (already tuned); update `og:image` on `/` to the new hero image
- No DB, RLS, server-function, or auth-flow changes
- Verify with `bun run build` + Playwright screenshot of `/` and `/auth` post-change

## Files touched

- `src/styles.css` — new tokens + `@theme inline` mapping + `.reveal`
- `src/routes/__root.tsx` — add Google Fonts `<link>` entries, update og:image
- `src/routes/index.tsx` — magazine landing rebuild
- `src/routes/auth.tsx` — editorial split rebuild (markup only)
- `src/hooks/use-reveal.ts` — new
- `src/assets/founder-hero.jpg`, `mentors.jpg`, `grants.jpg`, `community.jpg` — new (generated)

Out of scope: dashboard, mentors, grants, community, blog, admin, messages, profile.