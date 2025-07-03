-- Create cover letters table for persistence
CREATE TABLE public.cover_letters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL DEFAULT 'Untitled Cover Letter',
  job_description TEXT,
  job_company TEXT,
  job_position TEXT,
  tone TEXT DEFAULT 'professional',
  content TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'final')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user credits table
CREATE TABLE public.user_credits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  current_credits INTEGER NOT NULL DEFAULT 50,
  total_used_credits INTEGER NOT NULL DEFAULT 0,
  daily_reset_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '1 day'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create credit transactions table
CREATE TABLE public.credit_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  action_type TEXT NOT NULL,
  credits_used INTEGER NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create credit settings table (admin configurable)
CREATE TABLE public.credit_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value INTEGER NOT NULL,
  description TEXT,
  updated_by UUID,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create admin messages table
CREATE TABLE public.admin_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'announcement' CHECK (message_type IN ('announcement', 'warning', 'maintenance', 'feature')),
  target_audience TEXT DEFAULT 'all' CHECK (target_audience IN ('all', 'free', 'premium')),
  is_active BOOLEAN DEFAULT true,
  send_email BOOLEAN DEFAULT false,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Create user notifications table
CREATE TABLE public.user_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  message_id UUID REFERENCES public.admin_messages(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add job tracking fields to resumes table
ALTER TABLE public.resumes 
ADD COLUMN job_company TEXT,
ADD COLUMN job_position TEXT,
ADD COLUMN job_description TEXT,
ADD COLUMN application_status TEXT DEFAULT 'draft' CHECK (application_status IN ('draft', 'applied', 'interviewing', 'rejected', 'accepted')),
ADD COLUMN tags TEXT[];

-- Enable RLS on all new tables
ALTER TABLE public.cover_letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies for cover_letters
CREATE POLICY "Users can view their own cover letters" 
ON public.cover_letters FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own cover letters" 
ON public.cover_letters FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cover letters" 
ON public.cover_letters FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cover letters" 
ON public.cover_letters FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all cover letters" 
ON public.cover_letters FOR SELECT 
USING (is_admin());

-- RLS policies for user_credits
CREATE POLICY "Users can view their own credits" 
ON public.user_credits FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can manage user credits" 
ON public.user_credits FOR ALL 
USING (true);

CREATE POLICY "Admins can view all credits" 
ON public.user_credits FOR SELECT 
USING (is_admin());

-- RLS policies for credit_transactions
CREATE POLICY "Users can view their own transactions" 
ON public.credit_transactions FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can create transactions" 
ON public.credit_transactions FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can view all transactions" 
ON public.credit_transactions FOR SELECT 
USING (is_admin());

-- RLS policies for credit_settings
CREATE POLICY "Anyone can view credit settings" 
ON public.credit_settings FOR SELECT 
USING (true);

CREATE POLICY "Only admins can modify settings" 
ON public.credit_settings FOR ALL 
USING (is_admin());

-- RLS policies for admin_messages
CREATE POLICY "Everyone can view active messages" 
ON public.admin_messages FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage all messages" 
ON public.admin_messages FOR ALL 
USING (is_admin());

-- RLS policies for user_notifications
CREATE POLICY "Users can view their own notifications" 
ON public.user_notifications FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
ON public.user_notifications FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" 
ON public.user_notifications FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can view all notifications" 
ON public.user_notifications FOR SELECT 
USING (is_admin());

-- Insert default credit settings
INSERT INTO public.credit_settings (setting_key, setting_value, description) VALUES
('free_daily_credits', 50, 'Daily credits for free users'),
('resume_generation_cost', 5, 'Credits for resume generation'),
('cover_letter_cost', 3, 'Credits for cover letter generation'),
('pdf_download_cost', 1, 'Credits for PDF download'),
('ai_suggestions_cost', 2, 'Credits for AI content suggestions'),
('ats_analysis_cost', 2, 'Credits for ATS analysis');

-- Create function to initialize user credits
CREATE OR REPLACE FUNCTION public.initialize_user_credits()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_credits (user_id, current_credits, daily_reset_at)
  VALUES (NEW.id, 50, now() + INTERVAL '1 day')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to initialize credits on user creation
CREATE TRIGGER initialize_user_credits_trigger
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.initialize_user_credits();

-- Create function to reset daily credits
CREATE OR REPLACE FUNCTION public.reset_daily_credits()
RETURNS void AS $$
DECLARE
  free_credits INTEGER;
BEGIN
  -- Get current free daily credits setting
  SELECT setting_value INTO free_credits 
  FROM public.credit_settings 
  WHERE setting_key = 'free_daily_credits';
  
  -- Reset credits for users whose reset time has passed
  UPDATE public.user_credits 
  SET 
    current_credits = free_credits,
    daily_reset_at = now() + INTERVAL '1 day',
    updated_at = now()
  WHERE daily_reset_at <= now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to deduct credits
CREATE OR REPLACE FUNCTION public.deduct_credits(
  p_user_id UUID,
  p_action_type TEXT,
  p_credits_amount INTEGER,
  p_description TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  current_balance INTEGER;
BEGIN
  -- Get current credit balance
  SELECT current_credits INTO current_balance
  FROM public.user_credits
  WHERE user_id = p_user_id;
  
  -- Check if user has enough credits
  IF current_balance >= p_credits_amount THEN
    -- Deduct credits
    UPDATE public.user_credits
    SET 
      current_credits = current_credits - p_credits_amount,
      total_used_credits = total_used_credits + p_credits_amount,
      updated_at = now()
    WHERE user_id = p_user_id;
    
    -- Log transaction
    INSERT INTO public.credit_transactions (user_id, action_type, credits_used, description)
    VALUES (p_user_id, p_action_type, p_credits_amount, p_description);
    
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_cover_letters_updated_at
  BEFORE UPDATE ON public.cover_letters
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_credits_updated_at
  BEFORE UPDATE ON public.user_credits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_cover_letters_user_id ON public.cover_letters(user_id);
CREATE INDEX idx_cover_letters_created_at ON public.cover_letters(created_at DESC);
CREATE INDEX idx_user_credits_user_id ON public.user_credits(user_id);
CREATE INDEX idx_credit_transactions_user_id ON public.credit_transactions(user_id);
CREATE INDEX idx_credit_transactions_created_at ON public.credit_transactions(created_at DESC);
CREATE INDEX idx_user_notifications_user_id ON public.user_notifications(user_id);
CREATE INDEX idx_user_notifications_unread ON public.user_notifications(user_id, is_read) WHERE is_read = false;