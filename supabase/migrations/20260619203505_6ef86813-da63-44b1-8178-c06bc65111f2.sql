DROP POLICY IF EXISTS "Users self-assign non-admin roles" ON public.user_roles;

CREATE POLICY "Users self-assign founder role"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id AND role = 'founder'::app_role);