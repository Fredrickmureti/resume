
-- Add tracking columns to the resumes table for download/generation stats
ALTER TABLE public.resumes ADD COLUMN IF NOT EXISTS downloaded_count INTEGER DEFAULT 0;
ALTER TABLE public.resumes ADD COLUMN IF NOT EXISTS generated_count INTEGER DEFAULT 1;

-- Update profiles table to track last login
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE;

-- Create a function to update last login time
CREATE OR REPLACE FUNCTION public.update_last_login()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  UPDATE public.profiles 
  SET last_login_at = now()
  WHERE id = new.id;
  RETURN new;
END;
$$;

-- Create trigger to update last login on auth state change
DROP TRIGGER IF EXISTS on_auth_user_login ON auth.users;
CREATE TRIGGER on_auth_user_login
  AFTER UPDATE OF last_sign_in_at ON auth.users
  FOR EACH ROW 
  WHEN (OLD.last_sign_in_at IS DISTINCT FROM NEW.last_sign_in_at)
  EXECUTE FUNCTION public.update_last_login();

-- Create admin-specific RLS policies for profiles table
CREATE POLICY "Admins can view all profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND email = 'fredrickmureti612@gmail.com'
    )
  );

-- Create admin-specific RLS policies for resumes table  
CREATE POLICY "Admins can view all resumes" 
  ON public.resumes 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND email = 'fredrickmureti612@gmail.com'
    )
  );
