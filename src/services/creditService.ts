import { supabase } from '@/integrations/supabase/client';

export interface UserCredits {
  id: string;
  user_id: string;
  current_credits: number;
  total_used_credits: number;
  daily_reset_at: string;
  created_at: string;
  updated_at: string;
}

export interface CreditTransaction {
  id: string;
  user_id: string;
  action_type: string;
  credits_used: number;
  description?: string;
  metadata?: any;
  created_at: string;
}

export interface CreditCosts {
  resume_generation_cost: number;
  cover_letter_cost: number;
  pdf_download_cost: number;
  ai_suggestions_cost: number;
  ats_analysis_cost: number;
  linkedin_optimization_cost: number;
}

export class CreditService {
  static async getUserCredits(userId: string): Promise<UserCredits | null> {
    const { data, error } = await supabase
      .from('user_credits')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching user credits:', error);
      return null;
    }

    return data;
  }

  static async getCreditCosts(): Promise<CreditCosts> {
    const { data, error } = await supabase
      .from('credit_settings')
      .select('setting_key, setting_value')
      .in('setting_key', [
        'resume_generation_cost',
        'cover_letter_cost', 
        'pdf_download_cost',
        'ai_suggestions_cost',
        'ats_analysis_cost',
        'linkedin_optimization_cost'
      ]);

    if (error) {
      console.error('Error fetching credit costs:', error);
      // Return default costs
      return {
        resume_generation_cost: 5,
        cover_letter_cost: 3,
        pdf_download_cost: 1,
        ai_suggestions_cost: 2,
        ats_analysis_cost: 2,
        linkedin_optimization_cost: 3
      };
    }

    const costs: any = {};
    data.forEach(item => {
      costs[item.setting_key] = item.setting_value;
    });

    return {
      resume_generation_cost: costs.resume_generation_cost || 5,
      cover_letter_cost: costs.cover_letter_cost || 3,
      pdf_download_cost: costs.pdf_download_cost || 1,
      ai_suggestions_cost: costs.ai_suggestions_cost || 2,
      ats_analysis_cost: costs.ats_analysis_cost || 2,
      linkedin_optimization_cost: costs.linkedin_optimization_cost || 3
    };
  }

  static async deductCredits(
    userId: string,
    actionType: string,
    amount: number,
    description?: string
  ): Promise<boolean> {
    const { data, error } = await supabase.rpc('deduct_credits', {
      p_user_id: userId,
      p_action_type: actionType,
      p_credits_amount: amount,
      p_description: description
    });

    if (error) {
      console.error('Error deducting credits:', error);
      return false;
    }

    return data;
  }

  static async getCreditTransactions(userId: string, limit = 20): Promise<CreditTransaction[]> {
    const { data, error } = await supabase
      .from('credit_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching credit transactions:', error);
      return [];
    }

    return data || [];
  }

  static async checkCreditsAndDeduct(
    userId: string,
    actionType: string,
    description?: string
  ): Promise<{ success: boolean; message: string; remainingCredits?: number }> {
    try {
      // Get current credits and costs
      const [userCredits, costs] = await Promise.all([
        this.getUserCredits(userId),
        this.getCreditCosts()
      ]);

      if (!userCredits) {
        return { success: false, message: 'Unable to fetch credit information' };
      }

      // Get cost for this action
      const costKey = `${actionType}_cost` as keyof CreditCosts;
      const requiredCredits = costs[costKey] || 0;

      if (userCredits.current_credits < requiredCredits) {
        return { 
          success: false, 
          message: `Insufficient credits. You need ${requiredCredits} credits but only have ${userCredits.current_credits}.` 
        };
      }

      // Deduct credits
      const success = await this.deductCredits(userId, actionType, requiredCredits, description);
      
      if (success) {
        return { 
          success: true, 
          message: `${requiredCredits} credits deducted successfully`,
          remainingCredits: userCredits.current_credits - requiredCredits
        };
      } else {
        return { success: false, message: 'Failed to deduct credits' };
      }
    } catch (error) {
      console.error('Error in checkCreditsAndDeduct:', error);
      return { success: false, message: 'An error occurred while processing credits' };
    }
  }

  static async resetDailyCredits(): Promise<void> {
    const { error } = await supabase.rpc('reset_daily_credits');
    if (error) {
      console.error('Error resetting daily credits:', error);
    }
  }

  static async logUserActivity(userId: string, activityType: string, endpoint?: string, metadata?: any): Promise<void> {
    try {
      await supabase.rpc('log_user_activity', {
        p_user_id: userId,
        p_activity_type: activityType,
        p_endpoint: endpoint,
        p_metadata: metadata || {}
      });
    } catch (error) {
      console.error('Error logging user activity:', error);
    }
  }

  // Admin functions
  static async updateCreditSetting(settingKey: string, value: number): Promise<boolean> {
    const { error } = await supabase
      .from('credit_settings')
      .update({ setting_value: value, updated_at: new Date().toISOString() })
      .eq('setting_key', settingKey);

    return !error;
  }

  static async getAllUserCredits(): Promise<UserCredits[]> {
    const { data, error } = await supabase
      .from('user_credits')
      .select(`
        *,
        profiles!inner(email, full_name)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all user credits:', error);
      return [];
    }

    return data || [];
  }

  static async adjustUserCredits(userId: string, newAmount: number): Promise<boolean> {
    const { error } = await supabase
      .from('user_credits')
      .update({ 
        current_credits: newAmount,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    return !error;
  }
}
