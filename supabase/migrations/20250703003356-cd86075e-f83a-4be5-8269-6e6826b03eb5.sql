
-- Add LinkedIn optimization to credit costs
INSERT INTO public.credit_settings (setting_key, setting_value, description) VALUES 
('linkedin_optimization_cost', 3, 'Credits required for LinkedIn profile optimization')
ON CONFLICT (setting_key) DO UPDATE SET 
  setting_value = EXCLUDED.setting_value,
  description = EXCLUDED.description;

-- Add real-time activity tracking
CREATE TABLE IF NOT EXISTS public.user_activity (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  activity_type text NOT NULL,
  endpoint text,
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on user_activity
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_activity
CREATE POLICY "Admins can view all activity" 
  ON public.user_activity 
  FOR SELECT 
  USING (is_admin());

CREATE POLICY "System can create activity logs" 
  ON public.user_activity 
  FOR INSERT 
  WITH CHECK (true);

-- Add function to log user activity
CREATE OR REPLACE FUNCTION public.log_user_activity(
  p_user_id uuid,
  p_activity_type text,
  p_endpoint text DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_activity (user_id, activity_type, endpoint, metadata)
  VALUES (p_user_id, p_activity_type, p_endpoint, p_metadata);
END;
$$;

-- Update profiles table to track online status
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_online boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_activity_at timestamp with time zone DEFAULT now();

-- Function to update user online status
CREATE OR REPLACE FUNCTION public.update_user_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles 
  SET 
    last_activity_at = now(),
    is_online = true
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$;

-- Create trigger to update user activity when activity is logged
CREATE TRIGGER update_user_activity_on_log
  AFTER INSERT ON public.user_activity
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_activity();
