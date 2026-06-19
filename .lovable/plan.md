## Goal
Clean up the grants list, seed the 10 new opportunities from the LinkedIn screenshots, then perform a QA + security sweep of the platform and fix anything that breaks the user journey.

## 1. Grants cleanup (database migration)
- Deduplicate the `grants` table by `lower(trim(title))` + `organization`, keeping the earliest `created_at` row and deleting the rest. Cascades any `saved_grants` rows referencing dropped IDs onto the surviving row first via an UPDATE.
- Add a partial unique index on `lower(title), lower(organization)` to prevent future duplicate seeds.

## 2. Seed the 10 new grants from the screenshots
Insert these into `public.grants` (skip on conflict with the new unique index):

| # | Title | Org | Amount | Deadline | Region |
|---|---|---|---|---|---|
| 1 | Spark Women in Business Grants | Spark | Varies by round | 2026-05-31 | Global |
| 2 | Cellnex Community Fund | Cellnex | £2,500–£10,000 | Rolling | UK |
| 3 | Together Women Rise Grants | Together Women Rise | up to $35,000 | 2026-06-05 | Global |
| 4 | Women in Tech Accelerator 2026 | Standard Chartered Foundation & Village Capital | Share of $600,000+ | 2026-06-30 | Africa |
| 5 | QEST Sanderson Rising Star Craft Award 2026 | QEST | £10,000 + mentorship | 2026-06-05 | UK |
| 6 | TBAT Innovation Challenge | TBAT | £50,000 | 2026-06-24 | UK |
| 7 | Black Equity Organisation F100 Growth Fund | Black Equity Organisation | up to £15,000 | 2026-06-02 | UK |
| 8 | Women's Empire — Community Impact Grant | Women's Empire | Varies | 2026-06-01 | US (NYC) |
| 9 | United Women in Faith — Just Energy for All Seed Grants | United Women in Faith | up to $10,000 | 2026-06-17 | Global |
| 10 | Made Smarter Adoption Programme | Made Smarter | up to £20,000 matched | Rolling | UK |

Tags inferred from focus (e.g. `women`, `uk`, `black-founders`, `climate`, `tech`). URLs left null where the post doesn't include one — admins can edit later.

## 3. QA pass (Playwright against localhost)
Walk the signed-in user journey end-to-end with screenshots at each step using the pre-injected Supabase session:
1. `/auth` → `/dashboard` (onboarding checklist renders, no errors)
2. `/grants` list + filter + open detail + Save grant toggle
3. `/mentors` list + detail + Send request
4. `/requests` accept/decline
5. `/sessions` book + cancel
6. `/messages` thread send
7. `/community` create post + like + comment
8. `/blog` public list + slug detail
9. Amara AI dock: open, send a prompt, verify stream
10. Feedback button: submit, verify row lands in `feedback`
11. Admin routes (`/admin/feedback`, `/admin/blog`) — gated by `has_role('admin')`

Capture console + network errors, log any 4xx/5xx from `_serverFn/*`, screenshot final state of each step. File issues for anything broken and fix in the same pass (typical: missing `<Outlet />`, FK joins, RLS gaps).

## 4. Security sweep
- Run `security--run_security_scan` and address every High/Critical finding tied to the new tables (`grants`, `saved_grants`, `feedback`, `blog_posts`, `ai_conversations`, `ai_messages`).
- Confirm RLS + GRANTs on every public table; verify admin-only writes on `grants` and `blog_posts`.
- Verify `/api/chat` validates auth, rate-limits per user (simple in-memory token bucket is not enough on workers — use a `ai_messages` count check over the last minute).
- Confirm no service-role key reaches the client bundle; check no `mem://` secrets or env leaks in network responses.
- Validate Zod input on `feedback`, `createPost`, `sendMessage`, `addComment` server fns (length caps, trim, enum checks).

## 5. Bug-fix pass
Anything QA or the security scan turns up gets fixed in the same iteration: missing error/notFound components, unsafe `select` joins, missing GRANTs, over-broad RLS, etc. Final deliverable: a green QA run with screenshots + a clean security scan summary.

## Technical notes
- Migration is idempotent: dedupe runs before the unique index creation; seed uses `ON CONFLICT DO NOTHING` on `(lower(title), lower(organization))`.
- Saved-grants remap step: `UPDATE saved_grants SET grant_id = <keeper> WHERE grant_id = <dup>` before `DELETE FROM grants`.
- Playwright scripts live under `/tmp/browser/qa-*`; screenshots only, no full-page captures.