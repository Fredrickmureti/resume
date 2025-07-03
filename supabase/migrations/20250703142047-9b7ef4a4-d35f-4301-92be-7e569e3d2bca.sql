
-- First, drop the existing foreign key constraint
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_public_resume_id_fkey;

-- Recreate the foreign key constraint with CASCADE behavior
-- This will automatically set public_resume_id to NULL when the referenced resume is deleted
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_public_resume_id_fkey 
FOREIGN KEY (public_resume_id) 
REFERENCES public.resumes(id) 
ON DELETE SET NULL;
