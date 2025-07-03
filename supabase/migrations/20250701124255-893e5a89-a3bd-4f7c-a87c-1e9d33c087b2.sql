
-- Create job queue table for background processing
CREATE TABLE public.job_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  job_type TEXT NOT NULL CHECK (job_type IN ('resume_generation', 'cover_letter_generation', 'ats_analysis', 'content_optimization')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  input_data JSONB NOT NULL DEFAULT '{}',
  result_data JSONB DEFAULT NULL,
  error_message TEXT DEFAULT NULL,
  retry_count INTEGER NOT NULL DEFAULT 0,
  max_retries INTEGER NOT NULL DEFAULT 3,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  priority INTEGER NOT NULL DEFAULT 0
);

-- Create index for efficient job processing
CREATE INDEX idx_job_queue_status_priority ON public.job_queue (status, priority DESC, created_at ASC);
CREATE INDEX idx_job_queue_user_type ON public.job_queue (user_id, job_type);

-- Create rate limiting table
CREATE TABLE public.rate_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  endpoint TEXT NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, endpoint, window_start)
);

-- Create index for rate limiting lookups
CREATE INDEX idx_rate_limits_user_endpoint ON public.rate_limits (user_id, endpoint, window_start);

-- Create cache table for frequently accessed data
CREATE TABLE public.app_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cache_key TEXT NOT NULL UNIQUE,
  cache_data JSONB NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for cache lookups
CREATE INDEX idx_app_cache_key_expires ON public.app_cache (cache_key, expires_at);

-- Create performance logs table
CREATE TABLE public.performance_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users DEFAULT NULL,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  response_time_ms INTEGER NOT NULL,
  status_code INTEGER NOT NULL,
  error_message TEXT DEFAULT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for performance monitoring
CREATE INDEX idx_performance_logs_endpoint_created ON public.performance_logs (endpoint, created_at DESC);

-- Add RLS policies for job_queue
ALTER TABLE public.job_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own jobs" 
  ON public.job_queue 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own jobs" 
  ON public.job_queue 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update job status" 
  ON public.job_queue 
  FOR UPDATE 
  USING (true);

-- Add RLS policies for rate_limits
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own rate limits" 
  ON public.rate_limits 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "System can manage rate limits" 
  ON public.rate_limits 
  FOR ALL 
  USING (true);

-- Add RLS policies for app_cache
ALTER TABLE public.app_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "System can manage cache" 
  ON public.app_cache 
  FOR ALL 
  USING (true);

-- Add RLS policies for performance_logs
ALTER TABLE public.performance_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view performance logs" 
  ON public.performance_logs 
  FOR SELECT 
  USING (is_admin());

CREATE POLICY "System can create performance logs" 
  ON public.performance_logs 
  FOR INSERT 
  WITH CHECK (true);

-- Create function to clean up old records
CREATE OR REPLACE FUNCTION cleanup_old_records() RETURNS void AS $$
BEGIN
  -- Clean up old rate limiting records (older than 1 hour)
  DELETE FROM public.rate_limits 
  WHERE window_start < now() - INTERVAL '1 hour';
  
  -- Clean up expired cache entries
  DELETE FROM public.app_cache 
  WHERE expires_at < now();
  
  -- Clean up old performance logs (older than 30 days)
  DELETE FROM public.performance_logs 
  WHERE created_at < now() - INTERVAL '30 days';
  
  -- Clean up old completed jobs (older than 7 days)
  DELETE FROM public.job_queue 
  WHERE status = 'completed' AND processed_at < now() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

-- Create function to update job status
CREATE OR REPLACE FUNCTION update_job_status(
  job_id UUID,
  new_status TEXT,
  result_data JSONB DEFAULT NULL,
  error_msg TEXT DEFAULT NULL
) RETURNS void AS $$
BEGIN
  UPDATE public.job_queue 
  SET 
    status = new_status,
    result_data = COALESCE(update_job_status.result_data, job_queue.result_data),
    error_message = error_msg,
    updated_at = now(),
    processed_at = CASE WHEN new_status IN ('completed', 'failed') THEN now() ELSE processed_at END
  WHERE id = job_id;
END;
$$ LANGUAGE plpgsql;
