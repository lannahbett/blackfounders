## Goal

Replace the heavy editorial look on `/` and `/auth` with a calm, premium, mostly-typographic design. Fewer images, more whitespace, quieter accent color. No changes to authenticated logic, data, or routes.

## Locked design decisions

- **Palette**: ivory `#FBFAF7` background, ink `#1C1A17` text, muted terracotta `#B5613C` accent, soft stone `#E6E1D8` borders/surfaces
- **Type**: Outfit (headings, 500/600 — not 800) + Figtree (body, 400/500). Drops Syne / Plus Jakarta and the Fraunces/Inter leftovers
- **Layout**: stacked full-width sections, generous vertical rhythm, hairline dividers instead of boxed slabs
- **Radius**: small but not sharp (6px) — modern rather than brutalist
- **Motion**: restrained — soft fade/rise on scroll, subtle hover states only

## Images

Keep two: `founder-hero.jpg` (landing hero) and `community.jpg` (one supporting band lower down). `mentors.jpg` and `grants.jpg` stop being used; feature sections become clean icon + text instead of image cards.

## `/` landing rebuild

1. **Header** — light, ivory, hairline bottom border: wordmark, then LanguageSwitcher · Sign in · Join
2. **Hero** — asymmetric two columns: left small eyebrow label, large light-weight Outfit headline, lede, two CTAs (solid ink primary, quiet text-link secondary). Right the founder portrait, softly rounded, no border frame, no caption card
3. **Trust line** — one hairline row of short stat/labels in small caps
4. **Three features** — one full-width section, three text columns with a small line icon each, hairline separators, H2s kept for SEO
5. **Community band** — calm section using `community.jpg` at reduced height with an ivory-tinted overlay and a short quote
6. **Closing CTA** — centered, whitespace-heavy, single button
7. **Footer** — keep existing copy including "Feito com propósito por **Lannara Silva**" purple link

All existing i18n keys reused; no new copy keys needed.

## `/auth` rebuild

Move from the full-bleed 5/7 image spread to a centered single-column card on ivory: wordmark, mode chip, quiet heading, Google button, divider, standard inputs with soft stone borders and small radius, ink primary button, role tabs kept for signup. The image column is removed (that's the "hero + one" image budget). All form state, backend calls, breached-password handling, role logic, and Google sign-in wiring stay untouched.

## Technical notes

- `src/styles.css`: replace the editorial vars (`--paper`, `--espresso`, `--sienna`, `--copper`, `--gold-warm`) with `--ivory`, `--ink`, `--terracotta`, `--stone` in oklch, mapped in `@theme inline`. Set `--font-display: Outfit`, `--font-editorial: Figtree` (keeping var names avoids touching unrelated files). Also retune the shadcn `--primary`/`--accent`/`--border`/`--background` tokens to the new palette so authenticated pages inherit the calmer look without markup changes. Add a `.reveal` fade utility.
- `src/routes/__root.tsx`: swap the Google Fonts `<link>` to Outfit + Figtree; drop the old font links; keep og:image on the hero.
- `src/routes/index.tsx` and `src/routes/auth.tsx`: markup + class rewrites only.
- Remove now-unused `mentors.jpg` / `grants.jpg` imports (files left in place in case they're wanted later).
- Verify with a production build plus screenshots of `/` and `/auth` at mobile and desktop widths.

Out of scope: dashboard, mentors, grants, community, messages, profile, blog, admin, database, auth flow.
