INSERT INTO public.blog_posts (slug, title, excerpt, body_md, tags, published_at) VALUES
('first-grant-playbook',
 'The First-Grant Playbook for Black Women Founders',
 'A practical guide to landing your first non-dilutive check — from picking the right grant to writing a story that wins.',
 E'# The First-Grant Playbook\n\nMost founders treat grants like lotteries. The ones who win treat them like sales cycles.\n\n## 1. Pick fewer, better grants\n\nDon''t apply to twenty. Pick **three** where your story, stage, and sector are an obvious fit. A bullseye fit beats volume every time.\n\n## 2. Lead with traction, not vision\n\nReviewers read hundreds of applications. Open with one sentence of proof: revenue, users, pilots, partnerships. Then go to vision.\n\n## 3. Numbers belong in the first paragraph\n\n- MRR or ARR\n- Active users or customers\n- Growth rate over the last 90 days\n\n## 4. Reuse, don''t rewrite\n\nKeep a living **grant doc** with reusable answers for: problem, solution, market, traction, team, use of funds. Tailor only the top.\n\n## 5. Follow up\n\nA short, warm thank-you after submitting is rare and remembered.\n\n> You don''t need to be early-stage forever. Get the first check. Momentum compounds.',
 ARRAY['grants','fundraising','playbook'],
 now() - interval '6 days'),

('cold-intro-that-converts',
 'The Cold Intro That Actually Gets a Mentor to Reply',
 'A 5-line template that has booked hundreds of mentor calls — plus the three mistakes that kill your reply rate.',
 E'# The Cold Intro That Converts\n\nMost intros die in the first sentence. Here is the structure that works.\n\n## The 5-line template\n\n1. **Who you are** — one line, with proof.\n2. **Why them** — something specific they''ve done, not a flattery generality.\n3. **The ask** — small, time-boxed, easy to say yes to.\n4. **The why-now** — a real reason this week.\n5. **The out** — make it easy to decline without guilt.\n\n## Example\n\n> Hi Maya — I''m Ada, building a payroll tool for African SMBs (now at $4K MRR). I loved your talk on hiring your first ten. Could I borrow 20 minutes next week to ask how you sequenced your first three roles? Totally fine if not.\n\n## Three mistakes to avoid\n\n- **No proof.** "I''m building something in fintech" tells them nothing.\n- **Open-ended ask.** "Pick your brain" = instant no.\n- **No deadline.** Without a window, your email rots in the inbox.\n\nKeep it short. Respect their time. Reply rates go up.',
 ARRAY['mentorship','networking','templates'],
 now() - interval '3 days'),

('runway-math-that-doesnt-lie',
 'Runway Math That Doesn''t Lie',
 'The runway calculation most founders get wrong — and the simple model that keeps you honest.',
 E'# Runway Math That Doesn''t Lie\n\nMost founders calculate runway with last month''s burn. That number is almost always wrong.\n\n## Use a 3-month trailing average\n\nLast month was probably anomalous (a big invoice, a delayed hire, a one-off). Take the average of the last 3 months of net burn.\n\n```\nrunway_months = cash_on_hand / avg_net_burn_last_3_months\n```\n\n## Subtract the things you''re pretending aren''t happening\n\n- That hire you''re definitely making in 6 weeks\n- The tools renewal you forgot about\n- Taxes\n\n## Two numbers, not one\n\n- **Default-alive runway:** what you have today.\n- **Plan runway:** what you have if your next 90-day plan plays out.\n\nIf those two numbers diverge by more than 3 months, your plan is the fantasy.\n\n## The honesty checkpoint\n\nEvery month, write down the runway you reported last month and the runway you have now. If it drops faster than 1 month per month, you''re burning faster than you think.\n\nMoney lies to founders who want it to. Math doesn''t.',
 ARRAY['finance','fundraising','operations'],
 now() - interval '1 day');