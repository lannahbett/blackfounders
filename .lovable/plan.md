# Multilingual support: EN / pt-BR / es

Make every static UI string translatable across all routes and components, add a language switcher, and clean up wording along the way.

## Scope

**Translated (static UI):**
- Public routes: landing (`/`), auth, blog list & post, root layout, 404 / error boundaries.
- Authenticated routes: dashboard, mentors (list + profile), grants (list + detail), community (feed + thread), messages, sessions, requests, profile, admin (blog + feedback).
- Components: `amara-dock`, `feedback-button`, `save-grant-button`, `page-header`, `blog-editor`, `data-error-state`, `avatar-pill`, all shared UI copy.
- Toasts, form labels, placeholders, buttons, empty states, error messages.
- SEO `head()` per route (title, description, og:title, og:description) — one set per language.

**Not translated (user-generated / data):**
- Blog post bodies, grant descriptions, mentor bios, community posts and comments, chat messages. These stay in whatever language the author wrote them.
- Grants seed data — kept as originally sourced (English).
- Amara replies — the system prompt is updated to reply in the user's active UI language, so answers follow the switch automatically.

## User experience

- Language switcher (globe icon + code: EN / PT / ES) placed in:
  - The public header on `/`, `/auth`, `/blog`.
  - The authenticated top nav (next to the profile/avatar).
- First visit: auto-detect from `navigator.language` (`pt*` → pt-BR, `es*` → es, otherwise en).
- Selection persists in `localStorage` and applies immediately without reload.
- `<html lang="...">` updates to match the active language.

## Copy pass

Alongside the translation, tighten wording in all three languages:
- Fix minor English issues (e.g. tagline "closing the gap, together" kept; verify capitalization/consistency across CTAs like "Sign in" vs "Sign In").
- Ensure pt-BR uses natural Brazilian phrasing (não pt-PT): "Entrar", "Cadastre-se", "Mentores", "Editais e bolsas", "Comunidade", "Mensagens", "Meu perfil".
- Ensure es uses neutral Latin-American Spanish: "Iniciar sesión", "Crear cuenta", "Mentoras", "Becas y financiación", "Comunidad".
- Preserve product name "Black Founders Hub" and "Amara" untouched in all languages.

## Technical details

**Library:** `react-i18next` + `i18next` + `i18next-browser-languagedetector`.

**File layout:**

```text
src/i18n/
  index.ts              # i18next init, detector, fallback = en
  useLocale.ts          # thin hook: { t, lang, setLang }
  LanguageSwitcher.tsx  # dropdown / segmented control
  locales/
    en.json
    pt-BR.json
    es.json
```

**Key namespacing:** one flat JSON per language, keys grouped by area (`nav.*`, `landing.*`, `auth.*`, `mentors.*`, `grants.*`, `community.*`, `messages.*`, `sessions.*`, `profile.*`, `admin.*`, `blog.*`, `common.*`, `errors.*`, `toasts.*`, `seo.<route>.*`).

**Wiring:**
- Initialize i18n once in `src/router.tsx` (or an import in `src/routes/__root.tsx`) before the tree renders.
- Persist choice in `localStorage` key `bfh.lang`.
- Sync `document.documentElement.lang` on change.
- Route `head()` functions read the active language from a small helper so titles/descriptions swap when the user changes language client-side. `og:type`, `og:url`, canonical, and `og:image` stay identical across languages (single-URL strategy — no `/pt`, `/es` routes, no `hreflang` alternates). This keeps SEO simple; if you want per-locale URLs later that's a separate plan.
- Amara system prompt in `src/routes/api/chat.ts` receives the caller's `lang` from the client and gets a "reply in {lang}" instruction appended.

**Refactor pattern:** each route/component adds `const { t } = useLocale()` and replaces string literals with `t("area.key")`. No behavior changes. Toast messages migrate to keys too.

**Out of scope:**
- Translating database rows (blog posts, grants, mentor profiles, community content).
- Per-language URLs / hreflang / server-side language negotiation.
- RTL languages.

## Deliverables

1. i18n setup files under `src/i18n/`.
2. Three complete locale JSONs with every UI string.
3. `LanguageSwitcher` mounted in public + authenticated shells.
4. All 22 route files and 8 components refactored to use `t()`.
5. Route `head()` metadata localized (title + description + og:title + og:description) for each route in all three languages.
6. Amara system prompt updated to respect the user's UI language.
7. Manual pass through every page in each language to catch any missed strings or awkward phrasing before handing off.

