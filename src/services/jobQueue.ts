
import { supabase } from '@/integrations/supabase/client';
import { PerformanceService } from './performanceService';

export interface JobQueueItem {
  id: string;
  user_id: string;
  job_type: 'resume_generation' | 'cover_letter_generation' | 'ats_analysis' | 'content_optimization';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  input_data: any;
  result_data?: any;
  error_message?: string;
  retry_count: number;
  max_retries: number;
  created_at: string;
  updated_at: string;
  processed_at?: string;
  priority: number;
}

export class JobQueueService {
  static async createJob(
    userId: string,
    jobType: JobQueueItem['job_type'],
    inputData: any,
    priority: number = 0
  ): Promise<JobQueueItem> {
    const timer = PerformanceService.startTimer('/api/job-queue/create');
    
    try {
      const { data, error } = await supabase
        .from('job_queue')
        .insert({
          user_id: userId,
          job_type: jobType,
          input_data: inputData,
          priority: priority
        })
        .select()
        .single();

      if (error) {
        await timer.end(500, error.message);
        throw error;
      }

      await timer.end(200);
      return data as JobQueueItem;
    } catch (error) {
      await timer.end(500, error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  static async getJob(jobId: string): Promise<JobQueueItem | null> {
    const timer = PerformanceService.startTimer('/api/job-queue/get');
    
    try {
      const { data, error } = await supabase
        .from('job_queue')
        .select('*')
        .eq('id', jobId)
        .single();

      if (error) {
        await timer.end(404, error.message);
        return null;
      }

      await timer.end(200);
      return data as JobQueueItem;
    } catch (error) {
      await timer.end(500, error instanceof Error ? error.message : 'Unknown error');
      return null;
    }
  }

  static async getUserJobs(
    userId: string,
    jobType?: JobQueueItem['job_type'],
    limit: number = 10,
    offset: number = 0
  ): Promise<JobQueueItem[]> {
    const timer = PerformanceService.startTimer('/api/job-queue/user-jobs');
    
    try {
      let query = supabase
        .from('job_queue')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (jobType) {
        query = query.eq('job_type', jobType);
      }

      const { data, error } = await query;

      if (error) {
        await timer.end(500, error.message);
        throw error;
      }

      await timer.end(200);
      return data as JobQueueItem[];
    } catch (error) {
      await timer.end(500, error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  static async updateJobStatus(
    jobId: string,
    status: JobQueueItem['status'],
    resultData?: any,
    errorMessage?: string
  ): Promise<void> {
    const timer = PerformanceService.startTimer('/api/job-queue/update');
    
    try {
      const { error } = await supabase
        .from('job_queue')
        .update({
          status,
          result_data: resultData,
          error_message: errorMessage,
          updated_at: new Date().toISOString(),
          processed_at: ['completed', 'failed'].includes(status) ? new Date().toISOString() : undefined
        })
        .eq('id', jobId);

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

  static async retryJob(jobId: string): Promise<void> {
    const timer = PerformanceService.startTimer('/api/job-queue/retry');
    
    try {
      // First get the current retry count
      const { data: currentJob, error: selectError } = await supabase
        .from('job_queue')
        .select('retry_count')
        .eq('id', jobId)
        .single();

      if (selectError) {
        await timer.end(500, selectError.message);
        throw selectError;
      }

      // Then update with incremented retry count
      const { error } = await supabase
        .from('job_queue')
        .update({
          status: 'pending',
          retry_count: (currentJob.retry_count || 0) + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', jobId);

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

  static async getNextPendingJob(): Promise<JobQueueItem | null> {
    const timer = PerformanceService.startTimer('/api/job-queue/next-pending');
    
    try {
      const { data, error } = await supabase
        .from('job_queue')
        .select('*')
        .eq('status', 'pending')
        .lt('retry_count', 3)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: true })
        .limit(1)
        .single();

      if (error) {
        await timer.end(404, error.message);
        return null;
      }

      await timer.end(200);
      return data as JobQueueItem;
    } catch (error) {
      await timer.end(500, error instanceof Error ? error.message : 'Unknown error');
      return null;
    }
  }

  static async subscribeToJobUpdates(jobId: string, callback: (job: JobQueueItem) => void) {
    return supabase
      .channel(`job_${jobId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'job_queue',
        filter: `id=eq.${jobId}`
      }, (payload) => {
        callback(payload.new as JobQueueItem);
      })
      .subscribe();
  }
}
