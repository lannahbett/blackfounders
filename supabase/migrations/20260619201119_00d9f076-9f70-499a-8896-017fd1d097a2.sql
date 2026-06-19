
CREATE TABLE public.feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  category text NOT NULL CHECK (category IN ('bug','idea','love','other')),
  rating int CHECK (rating BETWEEN 1 AND 5),
  message text NOT NULL CHECK (char_length(message) <= 2000),
  page_url text,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new','triaged','resolved')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.feedback TO authenticated;
GRANT ALL ON public.feedback TO service_role;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users insert own feedback" ON public.feedback FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users read own feedback" ON public.feedback FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Admins read all feedback" ON public.feedback FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update feedback" ON public.feedback FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER feedback_touch BEFORE UPDATE ON public.feedback
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  excerpt text,
  cover_url text,
  body_md text NOT NULL,
  author_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  tags text[] NOT NULL DEFAULT '{}',
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.blog_posts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blog_posts TO authenticated;
GRANT ALL ON public.blog_posts TO service_role;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read published posts" ON public.blog_posts FOR SELECT TO anon, authenticated
  USING (published_at IS NOT NULL AND published_at <= now());
CREATE POLICY "Admins read all posts" ON public.blog_posts FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage posts" ON public.blog_posts FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER blog_posts_touch BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE INDEX blog_posts_published_idx ON public.blog_posts (published_at DESC NULLS LAST);

CREATE TABLE public.saved_grants (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  grant_id uuid NOT NULL REFERENCES public.grants(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, grant_id)
);
GRANT SELECT, INSERT, DELETE ON public.saved_grants TO authenticated;
GRANT ALL ON public.saved_grants TO service_role;
ALTER TABLE public.saved_grants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own saved grants" ON public.saved_grants FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.ai_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'New conversation',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_conversations TO authenticated;
GRANT ALL ON public.ai_conversations TO service_role;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own conversations" ON public.ai_conversations FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER ai_conversations_touch BEFORE UPDATE ON public.ai_conversations
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.ai_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user','assistant','system','tool')),
  content text NOT NULL DEFAULT '',
  parts jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.ai_messages TO authenticated;
GRANT ALL ON public.ai_messages TO service_role;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users access own ai messages" ON public.ai_messages FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.ai_conversations c WHERE c.id = conversation_id AND c.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.ai_conversations c WHERE c.id = conversation_id AND c.user_id = auth.uid()));
CREATE INDEX ai_messages_conversation_idx ON public.ai_messages (conversation_id, created_at);

INSERT INTO public.grants (title, organization, description, amount, region, tags, url)
VALUES
  ('Fearless Strivers Grant', 'Fearless Fund', 'Grants of $20,000 plus digital tools and mentorship for Black women-owned small businesses.', '$20,000', 'US', ARRAY['black-women','small-business','mentorship'], 'https://www.fearless.fund/strivers-grant'),
  ('Amber Grant for Women', 'WomensNet', 'Monthly $10,000 grants plus a $25,000 year-end grant for women entrepreneurs.', '$10,000 monthly', 'US', ARRAY['women','monthly','small-business'], 'https://ambergrantsforwomen.com'),
  ('Tory Burch Foundation Fellows Program', 'Tory Burch Foundation', 'Year-long fellowship with $5,000 grant, business education, and network access for women founders.', '$5,000 + Fellowship', 'US', ARRAY['fellowship','women','education'], 'https://www.toryburchfoundation.org/programs/fellows-program'),
  ('Cartier Women''s Initiative Awards', 'Cartier', 'Up to $100,000 in grant funding plus coaching and global community for women impact entrepreneurs.', 'Up to $100,000', 'Global', ARRAY['global','impact','women'], 'https://www.cartierwomensinitiative.com'),
  ('SoGal Black Founder Startup Grant', 'SoGal Foundation', 'Cash grants of $5,000 or $10,000 for Black women and nonbinary entrepreneurs.', '$5,000 – $10,000', 'Global', ARRAY['black-women','nonbinary','startup'], 'https://www.ifundwomen.com/grants/sogal-black-founder-startup-grant'),
  ('IFundWomen Universal Grants', 'IFundWomen', 'Apply once and be considered for multiple grants from corporate partners supporting women-owned businesses.', 'Varies', 'Global', ARRAY['database','women','recurring'], 'https://ifundwomen.com/grants'),
  ('Hello Alice Boost Camp & Grants', 'Hello Alice', 'Recurring grants and a free Boost Camp accelerator for small business owners from underrepresented backgrounds.', '$5,000+', 'US', ARRAY['accelerator','recurring','small-business'], 'https://helloalice.com/grants'),
  ('Visible Hands Fellowship', 'Visible Hands', '14-week venture fellowship with $25,000 in non-dilutive capital for pre-seed founders of color.', '$25,000', 'US', ARRAY['fellowship','pre-seed','founders-of-color'], 'https://www.visiblehandsvc.com/fellowship')
ON CONFLICT DO NOTHING;
