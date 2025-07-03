
import { supabase } from '@/integrations/supabase/client';

interface PerformanceMetrics {
  endpoint: string;
  method: string;
  responseTime: number;
  statusCode: number;
  errorMessage?: string;
  metadata?: Record<string, any>;
}

export class PerformanceService {
  static async logMetrics(metrics: PerformanceMetrics): Promise<void> {
    try {
      await supabase
        .from('performance_logs')
        .insert({
          endpoint: metrics.endpoint,
          method: metrics.method,
          response_time_ms: metrics.responseTime,
          status_code: metrics.statusCode,
          error_message: metrics.errorMessage,
          metadata: metrics.metadata || {}
        });
    } catch (error) {
      console.error('Failed to log performance metrics:', error);
    }
  }

  static startTimer(endpoint: string, method: string = 'POST') {
    const startTime = performance.now();
    
    return {
      end: async (statusCode: number, errorMessage?: string, metadata?: Record<string, any>) => {
        const endTime = performance.now();
        const responseTime = Math.round(endTime - startTime);
        
        await this.logMetrics({
          endpoint,
          method,
          responseTime,
          statusCode,
          errorMessage,
          metadata
        });
      }
    };
  }
}
