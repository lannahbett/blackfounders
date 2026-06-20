# Black Founders Hub

A community platform connecting Black and underrepresented founders with grants, mentors, and peers.

## Features

- **Grants** — curated funding opportunities, savable to your profile
- **Mentors** — discover and book sessions with vetted operators
- **Community** — discussion threads and direct messaging
- **Blog** — founder stories and platform updates
- **Amara** — AI companion for navigation, fundraising, and founder guidance
- **Feedback** — in-app feedback surfaced in the admin dashboard

## Stack

- **TanStack Start** (React 19, Vite 7) — SSR + file-based routing
- **Tailwind CSS v4** + **shadcn/ui** — design system
- **Lovable Cloud** (Supabase) — Postgres, Auth, Storage, RLS
- **Lovable AI Gateway** — model access for Amara
- **TanStack Query** — server state, hydrated via route loaders

## Getting Started

```bash
bun install
bun run dev      # http://localhost:8080
bun run build    # production build
bun run lint
```

## Project Structure

```
src/
  routes/                file-based routes (TanStack Router)
    _authenticated/      gated routes (auth required)
    api/                 HTTP endpoints & webhooks
  components/            UI components
  lib/                   server functions (*.functions.ts) & utils
  integrations/supabase/ generated client & auth middleware
supabase/migrations/     database schema & RLS policies
```

## Conventions

- App-internal backend logic uses `createServerFn` from `@tanstack/react-start`.
- Every `public` table ships with explicit `GRANT`s + RLS policies.
- Roles live in `user_roles`; checks go through `public.has_role()`.
- Design tokens are defined in `src/styles.css` — never hardcode colors.

## Deployment

Managed via [Lovable](https://lovable.dev). Push to `main` deploys to preview; publish from the editor for production.

## License

Proprietary — all rights reserved.