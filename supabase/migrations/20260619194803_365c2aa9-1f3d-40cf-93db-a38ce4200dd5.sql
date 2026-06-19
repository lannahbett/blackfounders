
ALTER TABLE public.mentor_profiles ADD CONSTRAINT mentor_profiles_user_id_profile_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.mentorship_requests ADD CONSTRAINT mentorship_requests_founder_id_profile_fkey FOREIGN KEY (founder_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.mentorship_requests ADD CONSTRAINT mentorship_requests_mentor_id_profile_fkey FOREIGN KEY (mentor_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.sessions ADD CONSTRAINT sessions_founder_id_profile_fkey FOREIGN KEY (founder_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.sessions ADD CONSTRAINT sessions_mentor_id_profile_fkey FOREIGN KEY (mentor_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.messages ADD CONSTRAINT messages_sender_id_profile_fkey FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.messages ADD CONSTRAINT messages_recipient_id_profile_fkey FOREIGN KEY (recipient_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.posts ADD CONSTRAINT posts_author_id_profile_fkey FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.post_comments ADD CONSTRAINT post_comments_author_id_profile_fkey FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
