CREATE OR REPLACE FUNCTION public.apply_for_mentor(
  _expertise text[],
  _industries text[],
  _years_experience int,
  _hourly_rate numeric,
  _availability_note text,
  _accepting_mentees boolean
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (_uid, 'mentor')
  ON CONFLICT (user_id, role) DO NOTHING;

  INSERT INTO public.mentor_profiles (
    user_id, expertise, industries, years_experience,
    hourly_rate, availability_note, accepting_mentees, verified
  ) VALUES (
    _uid, _expertise, _industries, _years_experience,
    _hourly_rate, _availability_note, COALESCE(_accepting_mentees, true), false
  )
  ON CONFLICT (user_id) DO UPDATE SET
    expertise = EXCLUDED.expertise,
    industries = EXCLUDED.industries,
    years_experience = EXCLUDED.years_experience,
    hourly_rate = EXCLUDED.hourly_rate,
    availability_note = EXCLUDED.availability_note,
    accepting_mentees = EXCLUDED.accepting_mentees;
END;
$$;

REVOKE ALL ON FUNCTION public.apply_for_mentor(text[],text[],int,numeric,text,boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.apply_for_mentor(text[],text[],int,numeric,text,boolean) TO authenticated;