## Black Founders Hub — MVP Plan

A warm, empowering platform connecting Black Women Founders with verified mentors, grants, peer community, and 1:1 scheduling.

### Visual direction
- **Palette**: deep espresso `#2B1B17`, gold `#E8C547`, terracotta `#D96C3E`, cream `#FBF6EE`.
- **Typography**: editorial serif headings (Fraunces) + clean sans body (Inter).
- **Feel**: warm, confident, magazine-style cards with generous spacing and gold accents on CTAs.

### Backend (Lovable Cloud)
Enable Lovable Cloud and create:

- `profiles` — id (FK auth.users), full_name, headline, bio, avatar_url, location, industry, stage, linkedin_url, website
- `user_roles` — separate roles table (`founder` | `mentor` | `admin`) using the secure `has_role()` pattern
- `mentor_profiles` — user_id, expertise[], industries[], years_experience, hourly_rate (nullable, free OK), availability_note, verified (bool)
- `mentorship_requests` — founder_id, mentor_id, message, status (pending/accepted/declined), timestamps
- `sessions` — mentor_id, founder_id, scheduled_at, duration_min, status, meeting_link, notes
- `messages` — sender_id, recipient_id, body, read_at, created_at (realtime)
- `grants` — title, organization, amount, deadline, eligibility, description, url, tags[], region
- `posts` — author_id, title, body, tag (ask/win/resource), created_at
- `post_comments` — post_id, author_id, body
- `post_likes` — post_id, user_id

RLS on every table; GRANTs to authenticated; admin-only writes for `grants` via `has_role`. Auto-create profile on signup via trigger.

### Auth
- Email/password + Google sign-in (via Lovable broker).
- Sign-up flow: choose role (Founder or Mentor) → role-specific onboarding (industry/stage for founders; expertise/experience for mentors).
- `/auth` route public; everything else under `_authenticated/`.

### Routes
```
/                              landing (mission + CTA to sign up)
/auth                          sign in / sign up + role select
/_authenticated/dashboard      role-aware home (founder vs mentor)
/_authenticated/mentors        directory + filters (industry, expertise, free/paid)
/_authenticated/mentors/$id    mentor profile + "Request mentorship" + "Book session"
/_authenticated/requests       inbox of mentorship requests (mentor view) / sent (founder view)
/_authenticated/sessions       upcoming + past sessions
/_authenticated/messages       conversation list + thread (realtime)
/_authenticated/grants         searchable grant directory (filters: amount, deadline, region)
/_authenticated/grants/$id     grant detail
/_authenticated/community      founder feed (posts, comments, likes)
/_authenticated/community/$id  post thread
/_authenticated/profile        edit own profile + mentor-specific fields
```

### Server functions (`createServerFn` + `requireSupabaseAuth`)
- mentor search/list, request mentorship, accept/decline, list requests
- create/list sessions, cancel session
- send/list messages (plus realtime channel subscription client-side)
- grants list/search (public read), grant CRUD (admin)
- posts CRUD, comments, likes

### Phasing
1. Cloud + schema + auth + role selection + profile pages
2. Mentor directory + profiles + request flow
3. Scheduling (sessions) + messaging (realtime)
4. Grants directory (seeded with ~10 real grants for Black women founders)
5. Community feed
6. Landing page polish + SEO metadata per route

### Out of scope for MVP
- Payments / paid bookings (rate is display-only)
- Video calling (store external meeting link)
- Email notifications (in-app only)
- Mentor verification workflow (admin manually flips `verified`)

Ready to build when you approve.