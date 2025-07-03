
import { useState, useEffect } from 'react';
import { JobQueueService, JobQueueItem } from '@/services/jobQueue';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useJobQueue = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<JobQueueItem[]>([]);
  const [loading, setLoading] = useState(false);

  const triggerJobProcessor = async () => {
    try {
      await supabase.functions.invoke('trigger-job-processor');
    } catch (error) {
      console.error('Error triggering job processor:', error);
    }
  };

  const createJob = async (
    jobType: 'resume_generation' | 'cover_letter_generation' | 'ats_analysis' | 'content_optimization',
    inputData: any,
    priority: number = 0
  ): Promise<JobQueueItem | null> => {
    if (!user) return null;

    try {
      setLoading(true);
      const job = await JobQueueService.createJob(user.id, jobType, inputData, priority);
      
      // Subscribe to job updates
      const subscription = await JobQueueService.subscribeToJobUpdates(job.id, (updatedJob) => {
        setJobs(prev => prev.map(j => j.id === updatedJob.id ? updatedJob : j));
      });

      setJobs(prev => [job, ...prev]);
      
      // Automatically trigger job processing
      setTimeout(() => triggerJobProcessor(), 500);
      
      return job;
    } catch (error) {
      console.error('Error creating job:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getJob = async (jobId: string): Promise<JobQueueItem | null> => {
    try {
      return await JobQueueService.getJob(jobId);
    } catch (error) {
      console.error('Error getting job:', error);
      return null;
    }
  };

  const getUserJobs = async (
    jobType?: 'resume_generation' | 'cover_letter_generation' | 'ats_analysis' | 'content_optimization',
    limit: number = 10,
    offset: number = 0
  ): Promise<JobQueueItem[]> => {
    if (!user) return [];

    try {
      setLoading(true);
      const userJobs = await JobQueueService.getUserJobs(user.id, jobType, limit, offset);
      setJobs(userJobs);
      return userJobs;
    } catch (error) {
      console.error('Error getting user jobs:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const loadUserJobs = async () => {
    await getUserJobs();
  };

  useEffect(() => {
    if (user) {
      getUserJobs();
    }
  }, [user]);

  return {
    jobs,
    loading,
    createJob,
    getJob,
    getUserJobs,
    loadUserJobs,
  };
};
