
import { supabase } from '@/integrations/supabase/client';

export class CacheService {
  static async get<T>(key: string): Promise<T | null> {
    try {
      const { data, error } = await supabase
        .from('app_cache')
        .select('cache_data')
        .eq('cache_key', key)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error || !data) {
        return null;
      }

      return data.cache_data as T;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  static async set(
    key: string,
    data: any,
    ttlSeconds: number = 3600
  ): Promise<void> {
    try {
      const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

      await supabase
        .from('app_cache')
        .upsert({
          cache_key: key,
          cache_data: data,
          expires_at: expiresAt.toISOString()
        }, {
          onConflict: 'cache_key'
        });
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  static async invalidate(key: string): Promise<void> {
    try {
      await supabase
        .from('app_cache')
        .delete()
        .eq('cache_key', key);
    } catch (error) {
      console.error('Cache invalidate error:', error);
    }
  }

  static async invalidatePattern(pattern: string): Promise<void> {
    try {
      await supabase
        .from('app_cache')
        .delete()
        .like('cache_key', `%${pattern}%`);
    } catch (error) {
      console.error('Cache invalidate pattern error:', error);
    }
  }

  static generateKey(prefix: string, params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}:${JSON.stringify(params[key])}`)
      .join('|');
    
    return `${prefix}:${sortedParams}`;
  }
}
