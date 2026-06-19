WITH ranked AS (
  SELECT id,
         first_value(id) OVER (PARTITION BY lower(trim(title)), lower(trim(coalesce(organization,''))) ORDER BY created_at ASC, id ASC) AS keeper,
         row_number() OVER (PARTITION BY lower(trim(title)), lower(trim(coalesce(organization,''))) ORDER BY created_at ASC, id ASC) AS rn
  FROM public.grants
)
UPDATE public.saved_grants sg SET grant_id = r.keeper
FROM ranked r WHERE sg.grant_id = r.id AND r.rn > 1;

WITH ranked AS (
  SELECT id, row_number() OVER (PARTITION BY lower(trim(title)), lower(trim(coalesce(organization,''))) ORDER BY created_at ASC, id ASC) AS rn
  FROM public.grants
)
DELETE FROM public.grants g USING ranked r WHERE g.id = r.id AND r.rn > 1;

CREATE UNIQUE INDEX IF NOT EXISTS grants_title_org_unique
  ON public.grants (lower(trim(title)), lower(trim(coalesce(organization,''))));

INSERT INTO public.grants (title, organization, amount, deadline, region, description, eligibility, tags, url) VALUES
('Spark Women in Business Grants','Spark','Varies by grant round','2026-05-31','Global','Funding for women-owned businesses; amount varies by round.','Women-owned businesses',ARRAY['women','small-business'],'https://www.google.com/search?q=Spark+Women+in+Business+Grants'),
('Cellnex Community Fund','Cellnex','£2,500–£10,000',NULL,'UK','Grants for UK not-for-profits in Digital Inclusion & Skills, Circular Economy, Biodiversity & Conservation, and AI & Education. Rolling 2026 rounds.','UK not-for-profit organisations',ARRAY['uk','nonprofit','digital','climate'],'https://www.google.com/search?q=Cellnex+Community+Fund'),
('Together Women Rise Grants','Together Women Rise','Up to $35,000','2026-06-05','Global','Funds gender equality projects including maternal health, gender-based violence, and women-led businesses.','Gender equality projects',ARRAY['women','global','impact'],'https://togetherwomenrise.org/grants/'),
('Women in Tech Accelerator 2026','Standard Chartered Foundation & Village Capital','Share of $600,000+ in grant funding','2026-06-30','Africa','Accelerator and grants for women-led tech startups across Africa.','Women-led tech startups across Africa',ARRAY['women','africa','tech','accelerator'],'https://vilcap.com/programs'),
('QEST Sanderson Rising Star Craft Award 2026','QEST','£10,000 + mentorship support','2026-06-05','UK','Award and mentorship for early-to-mid career craftspeople in the UK.','Early-to-mid career craftspeople (UK)',ARRAY['uk','craft','award','mentorship'],'https://www.qest.org.uk'),
('TBAT Innovation Challenge','TBAT','£50,000','2026-06-24','UK','Competition / grant for UK businesses engaged in R&D or tech innovation.','UK businesses in R&D or tech innovation',ARRAY['uk','innovation','tech','competition'],'https://www.tbat.co.uk/innovation-challenge/'),
('Black Equity Organisation F100 Growth Fund','Black Equity Organisation','Up to £15,000','2026-06-02','UK','Growth fund supporting Black entrepreneurs in the UK.','Black entrepreneurs in the UK',ARRAY['uk','black-founders','growth'],'https://blackequityorg.com'),
('Women''s Empire Community Impact Grant','Women''s Empire','Varies by project','2026-06-01','US','Grants for community projects benefiting women and girls in New York City.','Community projects in NYC',ARRAY['women','us','nyc','community'],'https://www.google.com/search?q=Women%27s+Empire+Community+Impact+Grant'),
('United Women in Faith Just Energy for All Seed Grants','United Women in Faith','Up to $10,000','2026-06-17','Global','Seed grants for climate justice and just energy transition projects.','Climate justice projects',ARRAY['climate','seed','global'],'https://uwfaith.org'),
('Made Smarter Adoption Programme','Made Smarter','Up to £20,000 matched funding',NULL,'UK','Matched funding for SME manufacturers in the East of England adopting digital technologies. Rolling — 2026 applications open.','SME manufacturing businesses (East of England)',ARRAY['uk','manufacturing','digital','sme'],'https://www.madesmarter.uk')
ON CONFLICT DO NOTHING;