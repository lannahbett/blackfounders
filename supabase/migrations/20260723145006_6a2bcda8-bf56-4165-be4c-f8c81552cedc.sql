
-- grants
DROP POLICY IF EXISTS "Admins manage grants" ON public.grants;
CREATE POLICY "Admins manage grants" ON public.grants FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'));

-- blog_posts
DROP POLICY IF EXISTS "Admins read all posts" ON public.blog_posts;
CREATE POLICY "Admins read all posts" ON public.blog_posts FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'));
DROP POLICY IF EXISTS "Admins manage posts" ON public.blog_posts;
CREATE POLICY "Admins manage posts" ON public.blog_posts FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'));

-- feedback
DROP POLICY IF EXISTS "Admins read all feedback" ON public.feedback;
CREATE POLICY "Admins read all feedback" ON public.feedback FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'));
DROP POLICY IF EXISTS "Admins update feedback" ON public.feedback;
CREATE POLICY "Admins update feedback" ON public.feedback FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'));

-- mentor_profiles
DROP POLICY IF EXISTS "Mentors insert own profile" ON public.mentor_profiles;
CREATE POLICY "Mentors insert own profile" ON public.mentor_profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'mentor'));
DROP POLICY IF EXISTS "Mentors update own profile" ON public.mentor_profiles;
CREATE POLICY "Mentors update own profile" ON public.mentor_profiles FOR UPDATE TO authenticated
  USING (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'mentor'))
  WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'mentor'));
DROP POLICY IF EXISTS "Mentors delete own profile" ON public.mentor_profiles;
CREATE POLICY "Mentors delete own profile" ON public.mentor_profiles FOR DELETE TO authenticated
  USING (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'mentor'));

-- mentorship_requests
DROP POLICY IF EXISTS "Founders create requests" ON public.mentorship_requests;
CREATE POLICY "Founders create requests" ON public.mentorship_requests FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = founder_id AND EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'founder'));

-- sessions
DROP POLICY IF EXISTS "Founder books session" ON public.sessions;
CREATE POLICY "Founder books session" ON public.sessions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = founder_id AND EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'founder'));

-- Drop SECURITY DEFINER functions callable by authenticated users
DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);
DROP FUNCTION IF EXISTS public.apply_for_mentor(text[], text[], integer, numeric, text, boolean);
