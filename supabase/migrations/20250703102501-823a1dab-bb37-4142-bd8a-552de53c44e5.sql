-- Add voice/video bio columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN voice_bio_url TEXT,
ADD COLUMN voice_bio_duration INTEGER, -- in seconds
ADD COLUMN video_bio_url TEXT,
ADD COLUMN bio_intro_text TEXT;