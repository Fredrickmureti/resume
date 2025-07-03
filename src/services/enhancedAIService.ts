
import { JobQueueService } from './jobQueue';
import { CacheService } from './cacheService';
import { RateLimitService } from './rateLimiting';
import { PerformanceService } from './performanceService';
import { ResumeData } from '@/types/resume';

export class EnhancedAIService {
  static async generateCoverLetter(
    userId: string,
    resumeData: ResumeData,
    jobDescription: string,
    tone: string = 'professional'
  ): Promise<{ jobId: string } | { result: string }> {
    const timer = PerformanceService.startTimer('/api/ai/cover-letter');
    
    try {
      // Check rate limiting
      const rateLimitResult = await RateLimitService.checkRateLimit(userId, 'cover-letter');
      if (!rateLimitResult.allowed) {
        await timer.end(429, 'Rate limit exceeded');
        throw new Error(`Rate limit exceeded. Try again after ${rateLimitResult.resetTime?.toLocaleTimeString()}`);
      }

      // Check cache first
      const cacheKey = `cover_letter_${userId}_${Buffer.from(jobDescription).toString('base64').substring(0, 20)}`;
      const cachedResult = await CacheService.get(cacheKey);
      
      if (cachedResult) {
        await RateLimitService.recordRequest(userId, 'cover-letter');
        await timer.end(200);
        return { result: cachedResult as string };
      }

      // Create background job
      const job = await JobQueueService.createJob(
        userId,
        'cover_letter_generation',
        {
          resumeData,
          jobDescription,
          tone,
          cacheKey
        }
      );

      await RateLimitService.recordRequest(userId, 'cover-letter');
      await timer.end(202);
      
      return { jobId: job.id };
    } catch (error) {
      await timer.end(500, error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  static async processChatMessage(
    userId: string,
    message: string,
    resumeData: ResumeData,
    conversationContext: any[] = []
  ): Promise<{ jobId: string } | { result: string }> {
    const timer = PerformanceService.startTimer('/api/ai/chat');
    
    try {
      // Check rate limiting
      const rateLimitResult = await RateLimitService.checkRateLimit(userId, 'ai-chat');
      if (!rateLimitResult.allowed) {
        await timer.end(429, 'Rate limit exceeded');
        throw new Error(`Rate limit exceeded. Try again after ${rateLimitResult.resetTime?.toLocaleTimeString()}`);
      }

      // Check cache for similar messages
      const cacheKey = `chat_${userId}_${Buffer.from(message).toString('base64').substring(0, 20)}`;
      const cachedResult = await CacheService.get(cacheKey);
      
      if (cachedResult) {
        await RateLimitService.recordRequest(userId, 'ai-chat');
        await timer.end(200);
        return { result: cachedResult as string };
      }

      // Create background job for complex processing
      const job = await JobQueueService.createJob(
        userId,
        'ats_analysis',
        {
          message,
          resumeData,
          conversationContext,
          cacheKey
        }
      );

      await RateLimitService.recordRequest(userId, 'ai-chat');
      await timer.end(202);
      
      return { jobId: job.id };
    } catch (error) {
      await timer.end(500, error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  static async optimizeContent(
    userId: string,
    contentType: string,
    inputData: any
  ): Promise<{ jobId: string } | { result: any }> {
    const timer = PerformanceService.startTimer('/api/ai/optimize');
    
    try {
      // Check rate limiting
      const rateLimitResult = await RateLimitService.checkRateLimit(userId, 'content-optimization');
      if (!rateLimitResult.allowed) {
        await timer.end(429, 'Rate limit exceeded');
        throw new Error(`Rate limit exceeded. Try again after ${rateLimitResult.resetTime?.toLocaleTimeString()}`);
      }

      // Check cache
      const cacheKey = `optimize_${contentType}_${userId}_${JSON.stringify(inputData).substring(0, 50)}`;
      const cachedResult = await CacheService.get(cacheKey);
      
      if (cachedResult) {
        await RateLimitService.recordRequest(userId, 'content-optimization');
        await timer.end(200);
        return { result: cachedResult };
      }

      // Create background job
      const job = await JobQueueService.createJob(
        userId,
        'content_optimization',
        {
          contentType,
          inputData,
          cacheKey
        }
      );

      await RateLimitService.recordRequest(userId, 'content-optimization');
      await timer.end(202);
      
      return { jobId: job.id };
    } catch (error) {
      await timer.end(500, error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }
}
