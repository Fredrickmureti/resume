
-- Add username and public sharing columns to profiles table
ALTER TABLE public.profiles ADD COLUMN username TEXT UNIQUE;
ALTER TABLE public.profiles ADD COLUMN public_resume_enabled BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN public_resume_id UUID REFERENCES public.resumes(id);

-- Create index for faster username lookups
CREATE INDEX idx_profiles_username ON public.profiles(username) WHERE username IS NOT NULL;

-- Add RLS policy for public profile access
CREATE POLICY "Public profiles can be viewed by anyone" 
  ON public.profiles 
  FOR SELECT 
  USING (public_resume_enabled = true AND username IS NOT NULL);

-- Add RLS policy for public resume access
CREATE POLICY "Public resumes can be viewed by anyone" 
  ON public.resumes 
  FOR SELECT 
  USING (
    id IN (
      SELECT public_resume_id 
      FROM public.profiles 
      WHERE public_resume_enabled = true 
      AND username IS NOT NULL
    )
  );
