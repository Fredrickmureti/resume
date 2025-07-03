
import { useState, useEffect } from 'react';
import { RateLimitService } from '@/services/rateLimiting';
import { useAuth } from '@/contexts/AuthContext';

interface RateLimitState {
  allowed: boolean;
  remainingRequests: number;
  resetTime?: Date;
  loading: boolean;
}

export const useRateLimit = (endpoint: string) => {
  const { user } = useAuth();
  const [state, setState] = useState<RateLimitState>({
    allowed: true,
    remainingRequests: 0,
    loading: false
  });

  const checkRateLimit = async (endpointOverride?: string): Promise<boolean> => {
    if (!user) return false;

    const targetEndpoint = endpointOverride || endpoint;

    try {
      setState(prev => ({ ...prev, loading: true }));
      const result = await RateLimitService.checkRateLimit(user.id, targetEndpoint);
      
      setState({
        allowed: result.allowed,
        remainingRequests: result.remainingRequests || 0,
        resetTime: result.resetTime,
        loading: false
      });

      return result.allowed;
    } catch (error) {
      console.error('Error checking rate limit:', error);
      setState(prev => ({ ...prev, loading: false }));
      return false;
    }
  };

  const recordRequest = async (endpointOverride?: string): Promise<void> => {
    if (!user) return;

    const targetEndpoint = endpointOverride || endpoint;

    try {
      await RateLimitService.recordRequest(user.id, targetEndpoint);
      // Update remaining requests
      const remaining = await RateLimitService.getRemainingRequests(user.id, targetEndpoint);
      setState(prev => ({ 
        ...prev, 
        remainingRequests: remaining,
        allowed: remaining > 0 
      }));
    } catch (error) {
      console.error('Error recording request:', error);
    }
  };

  const getRemainingRequests = async (endpointOverride?: string): Promise<number> => {
    if (!user) return 0;

    const targetEndpoint = endpointOverride || endpoint;

    try {
      return await RateLimitService.getRemainingRequests(user.id, targetEndpoint);
    } catch (error) {
      console.error('Error getting remaining requests:', error);
      return 0;
    }
  };

  useEffect(() => {
    if (user) {
      checkRateLimit();
    }
  }, [user, endpoint]);

  return {
    ...state,
    checkRateLimit,
    recordRequest,
    getRemainingRequests
  };
};
