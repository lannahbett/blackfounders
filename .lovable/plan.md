# Black Founders Hub — Phase 2

## 1. Runtime-safe query guards
Wrap every `createServerFn` handler in `src/lib/hub.functions.ts` with a small `safeQuery()` helper that catches Supabase/PostgREST errors (missing FK relationships, RLS denial, schema-cache misses) and returns `{ data: null, error: { code, message } }` instead of throwing.

On the client:
- Add a shared `<DataErrorState />` component (warm, on-brand) that routes render when a query returns an error.
- Update each `_authenticated` route to check `error` and render the friendly state instead of blanking.
- Add a route-level `errorComponent` + `notFoundComponent` to every route under `_authenticated/` so SSR failures never produce a blank screen.

## 2. Grants from the LinkedIn post
LinkedIn blocks automated scraping (403), so I cannot read that specific post. **Please paste the list of funds/grants from the post** (name, amount, deadline, link) into the chat and I'll seed them into the `grants` table in the same step. As a fallback I can add a vetted set of 2026 funds for Black/female founders from public directories — say the word if you prefer that.

## 3. AI Companion ("Ask Amara")
A floating chat widget available on every authenticated route.
- Server route `src/routes/api/chat.ts` streaming via Lovable AI (`google/gemini-3-flash-preview`, free during promo window).
- System prompt: founder coach for Black women founders — navigates the platform (mentors, grants, community, sessions), shares founder tips, surfaces relevant opportunities.
- Tools: `searchGrants`, `searchMentors`, `searchPosts` (call existing server fns) so the assistant can ground answers in the user's actual data.
- Frontend: `<AmaraDock />` in `_authenticated/route.tsx`, uses `@ai-sdk/react` `useChat`, renders markdown with `react-markdown`, persists conversation in `ai_conversations` + `ai_messages` tables scoped to `auth.uid()`.

## 4. Blog
- New tables `blog_posts` (slug, title, excerpt, cover_url, body_md, author_id, published_at, tags[]) and `blog_post_likes`.
- Public routes: `/blog` (index, SSR for SEO) and `/blog/$slug` (article with JSON-LD, OG tags from loader data).
- Authoring: admins (via `has_role`) can create/edit at `/_authenticated/blog/new` and `/_authenticated/blog/$slug/edit` using a markdown editor.
- Public reads via a server publishable client with a narrow `TO anon SELECT` policy on `published_at IS NOT NULL`.

## 5. Feedback form
- New table `feedback` (user_id nullable, category enum: bug/idea/love/other, rating 1–5, message, page_url, created_at).
- `<FeedbackButton />` fixed bottom-left on authenticated routes opening a dialog form (zod-validated, 1000-char cap).
- Insert via authenticated server fn; RLS lets users insert/read their own, admins read all.
- Admin view at `/_authenticated/admin/feedback` (guarded by `has_role('admin')`) with filters, status (new/triaged/resolved), and CSV export.

## 6. Engagement boosters
- **Weekly digest email** (opt-in): new grants, top community posts, upcoming sessions. Cron-triggered server route under `/api/public/cron/*` using Lovable AI to summarize.
- **Streaks & badges**: lightweight `user_activity` table; badges for first post, first mentor booked, 7-day streak. Surface on profile and dashboard.
- **Weekly community prompt**: a pinned post auto-created Mondays ("This week's win?") to drive feed activity.
- **Grant deadline reminders**: users can "save" a grant; in-app notification 7 days before deadline.
- **Notifications center**: bell icon in the header, realtime via Supabase channels for new messages, request status changes, saved-grant reminders.
- **Onboarding checklist** on the dashboard (complete profile → join community → request first mentor → save a grant) to drive first-week retention.

## Technical notes
- All new tables get GRANTs + RLS in the same migration; admin-only tables policy-gated via `has_role`.
- AI calls go through Lovable AI Gateway server-side; `LOVABLE_API_KEY` already provisioned.
- Companion + chat persistence reuses the `attachSupabaseAuth` middleware already wired in `src/start.ts`.
- New routes added under `_authenticated/` inherit the existing auth gate; blog index/article are public for SEO.

## Open questions
1. **Grants list** from the LinkedIn post — paste it, or want me to use a vetted 2026 fallback set?
2. **AI companion name** — "Amara" is a placeholder; prefer something else?
3. **Blog authoring** — admin-only, or open to mentors too?
