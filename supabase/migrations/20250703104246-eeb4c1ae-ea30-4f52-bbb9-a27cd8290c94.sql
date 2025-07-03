-- Create custom branding table
CREATE TABLE public.custom_branding (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL DEFAULT 'My Brand',
  primary_color TEXT NOT NULL DEFAULT '#3b82f6',
  secondary_color TEXT NOT NULL DEFAULT '#1e40af',
  accent_color TEXT NOT NULL DEFAULT '#f59e0b',
  background_color TEXT NOT NULL DEFAULT '#ffffff',
  text_color TEXT NOT NULL DEFAULT '#1f2937',
  font_family TEXT NOT NULL DEFAULT 'inter',
  logo_url TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.custom_branding ENABLE ROW LEVEL SECURITY;

-- Create policies for custom branding
CREATE POLICY "Users can view their own branding" 
ON public.custom_branding 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own branding" 
ON public.custom_branding 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own branding" 
ON public.custom_branding 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own branding" 
ON public.custom_branding 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_custom_branding_updated_at
BEFORE UPDATE ON public.custom_branding
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add branding_id to resumes table to link resumes with custom branding
ALTER TABLE public.resumes 
ADD COLUMN branding_id UUID REFERENCES public.custom_branding(id) ON DELETE SET NULL;