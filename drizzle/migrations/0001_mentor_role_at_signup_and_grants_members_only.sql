DROP POLICY IF EXISTS "Grants public read" ON public.grants;
CREATE POLICY "Grants readable by members" ON public.grants FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
REVOKE SELECT ON public.grants FROM anon;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', ''),
    NEW.raw_user_meta_data ->> 'avatar_url')
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, CASE WHEN NEW.raw_user_meta_data ->> 'intended_role' = 'mentor' THEN 'mentor'::app_role ELSE 'founder'::app_role END)
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END $function$;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'mentor'::app_role FROM auth.users u
WHERE u.raw_user_meta_data ->> 'intended_role' = 'mentor'
ON CONFLICT (user_id, role) DO NOTHING;