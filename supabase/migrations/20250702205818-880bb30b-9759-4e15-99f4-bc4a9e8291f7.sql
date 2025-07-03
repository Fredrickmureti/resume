
-- Create admin_user_messages table for direct messaging between admin and users
CREATE TABLE public.admin_user_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id uuid NOT NULL,
  user_id uuid NOT NULL,
  subject text NOT NULL,
  content text NOT NULL,
  message_type text DEFAULT 'direct' CHECK (message_type IN ('direct', 'support', 'warning', 'info')),
  is_read boolean DEFAULT false,
  read_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on admin_user_messages
ALTER TABLE public.admin_user_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for admin_user_messages
CREATE POLICY "Admins can manage all messages" 
  ON public.admin_user_messages 
  FOR ALL 
  USING (is_admin());

CREATE POLICY "Users can view their own messages" 
  ON public.admin_user_messages 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update read status" 
  ON public.admin_user_messages 
  FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add trigger to update updated_at column
CREATE TRIGGER update_admin_user_messages_updated_at
  BEFORE UPDATE ON public.admin_user_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Modify resumes table to require content validation
ALTER TABLE public.resumes 
ADD COLUMN is_complete boolean DEFAULT false,
ADD COLUMN content_validation_score integer DEFAULT 0;

-- Modify cover_letters table to require content validation  
ALTER TABLE public.cover_letters 
ADD COLUMN is_complete boolean DEFAULT false,
ADD COLUMN content_validation_score integer DEFAULT 0;

-- Add profile image support to resumes data
-- This will be handled in the JSON structure, no schema change needed for this
