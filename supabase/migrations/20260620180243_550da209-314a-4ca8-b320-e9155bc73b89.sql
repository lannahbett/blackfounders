
-- 1) mentor_profiles: replace ALL policy with operation-specific ones that include role check in USING
DROP POLICY IF EXISTS "Mentors manage own mentor profile" ON public.mentor_profiles;

CREATE POLICY "Mentors insert own profile"
  ON public.mentor_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND public.has_role(auth.uid(), 'mentor'));

CREATE POLICY "Mentors update own profile"
  ON public.mentor_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND public.has_role(auth.uid(), 'mentor'))
  WITH CHECK (auth.uid() = user_id AND public.has_role(auth.uid(), 'mentor'));

CREATE POLICY "Mentors delete own profile"
  ON public.mentor_profiles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id AND public.has_role(auth.uid(), 'mentor'));

-- 2) mentorship_requests: add founder role check to INSERT
DROP POLICY IF EXISTS "Founders create requests" ON public.mentorship_requests;
CREATE POLICY "Founders create requests"
  ON public.mentorship_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = founder_id AND public.has_role(auth.uid(), 'founder'));

-- 3) sessions: add founder role check on INSERT; add DELETE policy
DROP POLICY IF EXISTS "Founder books session" ON public.sessions;
CREATE POLICY "Founder books session"
  ON public.sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = founder_id AND public.has_role(auth.uid(), 'founder'));

CREATE POLICY "Session parties delete"
  ON public.sessions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = founder_id OR auth.uid() = mentor_id);

-- 4) SECURITY DEFINER functions: revoke from public/anon
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.apply_for_mentor(text[], text[], integer, numeric, text, boolean) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
