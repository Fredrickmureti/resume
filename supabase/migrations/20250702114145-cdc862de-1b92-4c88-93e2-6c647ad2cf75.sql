-- First, ensure we have the credit settings initialized
INSERT INTO public.credit_settings (setting_key, setting_value, description) VALUES 
('free_daily_credits', 50, 'Daily credits allocated to free users'),
('resume_generation_cost', 5, 'Credits required for resume generation'),
('cover_letter_cost', 3, 'Credits required for cover letter generation'),
('pdf_download_cost', 1, 'Credits required for PDF download'),
('ai_suggestions_cost', 2, 'Credits required for AI suggestions'),
('ats_analysis_cost', 2, 'Credits required for ATS analysis')
ON CONFLICT (setting_key) DO UPDATE SET 
  setting_value = EXCLUDED.setting_value,
  description = EXCLUDED.description;

-- Create trigger to automatically initialize user credits when profile is created
CREATE OR REPLACE FUNCTION public.initialize_user_credits()
RETURNS TRIGGER AS $$
DECLARE
  free_credits INTEGER;
BEGIN
  -- Get current free daily credits setting
  SELECT setting_value INTO free_credits 
  FROM public.credit_settings 
  WHERE setting_key = 'free_daily_credits';
  
  -- Default to 50 if not found
  IF free_credits IS NULL THEN
    free_credits := 50;
  END IF;
  
  -- Insert initial credits for the new user
  INSERT INTO public.user_credits (user_id, current_credits, daily_reset_at)
  VALUES (NEW.id, free_credits, now() + INTERVAL '1 day')
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on profiles table to initialize credits
DROP TRIGGER IF EXISTS initialize_credits_on_profile_creation ON public.profiles;
CREATE TRIGGER initialize_credits_on_profile_creation
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.initialize_user_credits();

-- Also create a function to ensure existing users get credits
CREATE OR REPLACE FUNCTION public.ensure_all_users_have_credits()
RETURNS void AS $$
DECLARE
  free_credits INTEGER;
  user_record RECORD;
BEGIN
  -- Get current free daily credits setting
  SELECT setting_value INTO free_credits 
  FROM public.credit_settings 
  WHERE setting_key = 'free_daily_credits';
  
  -- Default to 50 if not found
  IF free_credits IS NULL THEN
    free_credits := 50;
  END IF;
  
  -- Initialize credits for all existing users who don't have credit records
  FOR user_record IN 
    SELECT p.id 
    FROM public.profiles p 
    LEFT JOIN public.user_credits uc ON p.id = uc.user_id 
    WHERE uc.user_id IS NULL
  LOOP
    INSERT INTO public.user_credits (user_id, current_credits, daily_reset_at)
    VALUES (user_record.id, free_credits, now() + INTERVAL '1 day');
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Run the function to initialize credits for existing users
SELECT public.ensure_all_users_have_credits();