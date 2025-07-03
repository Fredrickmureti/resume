-- Remove voice bio columns from profiles table
ALTER TABLE public.profiles 
DROP COLUMN IF EXISTS voice_bio_url,
DROP COLUMN IF EXISTS voice_bio_duration;