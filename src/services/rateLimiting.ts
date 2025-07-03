
import { supabase } from '@/integrations/supabase/client';
import { PerformanceService } from './performanceService';

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests allowed in the window
}

const defaultLimits: Record<string, RateLimitConfig> = {
  'ai-chat': { windowMs: 60000, maxRequests: 10 }, // 10 requests per minute
  'cover-letter': { windowMs: 300000, maxRequests: 5 }, // 5 requests per 5 minutes
  'resume-generation': { windowMs: 300000, maxRequests: 5 }, // 5 requests per 5 minutes
  'ats-analysis': { windowMs: 60000, maxRequests: 15 }, // 15 requests per minute
  'content-optimization': { windowMs: 180000, maxRequests: 8 }, // 8 requests per 3 minutes
};

export class RateLimitService {
  static async checkRateLimit(
    userId: string,
    endpoint: string,
    customConfig?: RateLimitConfig
  ): Promise<{ allowed: boolean; resetTime?: Date; remainingRequests?: number }> {
    const timer = PerformanceService.startTimer('/api/rate-limit/check');
    
    try {
      const config = customConfig || defaultLimits[endpoint] || defaultLimits['ai-chat'];
      const windowStart = new Date(Date.now() - config.windowMs);

      // Get current request count in the window
      const { data: existingLimits, error: selectError } = await supabase
        .from('rate_limits')
        .select('request_count, window_start')
        .eq('user_id', userId)
        .eq('endpoint', endpoint)
        .gte('window_start', windowStart.toISOString())
        .order('window_start', { ascending: false })
        .limit(1);

      if (selectError) {
        await timer.end(500, selectError.message);
        throw selectError;
      }

      let currentCount = 0;
      let resetTime = new Date(Date.now() + config.windowMs);

      if (existingLimits && existingLimits.length > 0) {
        currentCount = existingLimits[0].request_count;
        resetTime = new Date(new Date(existingLimits[0].window_start).getTime() + config.windowMs);
      }

      const allowed = currentCount < config.maxRequests;
      const remainingRequests = Math.max(0, config.maxRequests - currentCount - 1);

      await timer.end(200);
      return {
        allowed,
        resetTime,
        remainingRequests
      };
    } catch (error) {
      await timer.end(500, error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  static async recordRequest(
    userId: string,
    endpoint: string,
    customConfig?: RateLimitConfig
  ): Promise<void> {
    const timer = PerformanceService.startTimer('/api/rate-limit/record');
    
    try {
      const config = customConfig || defaultLimits[endpoint] || defaultLimits['ai-chat'];
      const windowStart = new Date(Date.now() - config.windowMs);

      // Use upsert to handle concurrent requests
      const { error } = await supabase
        .from('rate_limits')
        .upsert({
          user_id: userId,
          endpoint: endpoint,
          window_start: windowStart.toISOString(),
          request_count: 1
        }, {
          onConflict: 'user_id,endpoint,window_start',
          ignoreDuplicates: false
        });

      if (error) {
        // If upsert fails, try to increment existing record
        const { data: existingRecord, error: selectError } = await supabase
          .from('rate_limits')
          .select('request_count')
          .eq('user_id', userId)
          .eq('endpoint', endpoint)
          .gte('window_start', windowStart.toISOString())
          .single();

        if (!selectError && existingRecord) {
          const { error: updateError } = await supabase
            .from('rate_limits')
            .update({
              request_count: existingRecord.request_count + 1
            })
            .eq('user_id', userId)
            .eq('endpoint', endpoint)
            .gte('window_start', windowStart.toISOString());

          if (updateError) {
            await timer.end(500, updateError.message);
            throw updateError;
          }
        }
      }

      await timer.end(200);
    } catch (error) {
      await timer.end(500, error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  static async getRemainingRequests(
    userId: string,
    endpoint: string,
    customConfig?: RateLimitConfig
  ): Promise<number> {
    const timer = PerformanceService.startTimer('/api/rate-limit/remaining');
    
    try {
      const config = customConfig || defaultLimits[endpoint] || defaultLimits['ai-chat'];
      const windowStart = new Date(Date.now() - config.windowMs);

      const { data, error } = await supabase
        .from('rate_limits')
        .select('request_count')
        .eq('user_id', userId)
        .eq('endpoint', endpoint)
        .gte('window_start', windowStart.toISOString())
        .order('window_start', { ascending: false })
        .limit(1);

      if (error) {
        await timer.end(500, error.message);
        throw error;
      }

      const currentCount = data && data.length > 0 ? data[0].request_count : 0;
      const remaining = Math.max(0, config.maxRequests - currentCount);

      await timer.end(200);
      return remaining;
    } catch (error) {
      await timer.end(500, error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  static async cleanupExpiredLimits(): Promise<void> {
    const timer = PerformanceService.startTimer('/api/rate-limit/cleanup');
    
    try {
      const oneHourAgo = new Date(Date.now() - 3600000);
      
      const { error } = await supabase
        .from('rate_limits')
        .delete()
        .lt('window_start', oneHourAgo.toISOString());

      if (error) {
        await timer.end(500, error.message);
        throw error;
      }

      await timer.end(200);
    } catch (error) {
      await timer.end(500, error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }
}
