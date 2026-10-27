DROP POLICY IF EXISTS "Profiles readable by authenticated" ON public.profiles;
CREATE POLICY "Profiles readable by self, connections, or mentors"
ON public.profiles FOR SELECT TO authenticated
USING (
  id = auth.uid()
  OR EXISTS (SELECT 1 FROM public.mentor_profiles mp WHERE mp.user_id = profiles.id)
  OR EXISTS (SELECT 1 FROM public.messages m WHERE (m.sender_id = auth.uid() AND m.recipient_id = profiles.id) OR (m.recipient_id = auth.uid() AND m.sender_id = profiles.id))
  OR EXISTS (SELECT 1 FROM public.mentorship_requests r WHERE (r.founder_id = auth.uid() AND r.mentor_id = profiles.id) OR (r.mentor_id = auth.uid() AND r.founder_id = profiles.id))
  OR EXISTS (SELECT 1 FROM public.sessions s WHERE (s.founder_id = auth.uid() AND s.mentor_id = profiles.id) OR (s.mentor_id = auth.uid() AND s.founder_id = profiles.id))
);