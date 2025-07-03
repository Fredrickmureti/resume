import { useState, useEffect, useCallback } from 'react';
import { CreditService, UserCredits, CreditTransaction } from '@/services/creditService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

export const useCredits = () => {
  const { user } = useAuth();
  const [credits, setCredits] = useState<UserCredits | null>(null);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [costs, setCosts] = useState({
    resume_generation_cost: 5,
    cover_letter_cost: 3,
    pdf_download_cost: 1,
    ai_suggestions_cost: 2,
    ats_analysis_cost: 2,
    linkedin_optimization_cost: 3
  });

  const fetchCredits = useCallback(async () => {
    if (!user?.id) return;

    try {
      const [userCredits, creditCosts] = await Promise.all([
        CreditService.getUserCredits(user.id),
        CreditService.getCreditCosts()
      ]);

      setCredits(userCredits);
      setCosts(creditCosts);

      // Log user activity
      CreditService.logUserActivity(user.id, 'dashboard_visit', '/dashboard');
    } catch (error) {
      console.error('Error fetching credits:', error);
      toast({
        title: "Error",
        description: "Failed to fetch credit information.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const fetchTransactions = useCallback(async () => {
    if (!user?.id) return;

    try {
      const userTransactions = await CreditService.getCreditTransactions(user.id);
      setTransactions(userTransactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  }, [user?.id]);

  const checkAndDeductCredits = useCallback(async (
    actionType: string,
    description?: string
  ): Promise<boolean> => {
    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to continue.",
        variant: "destructive"
      });
      return false;
    }

    try {
      const result = await CreditService.checkCreditsAndDeduct(user.id, actionType, description);
      
      if (result.success) {
        // Update local credits state
        setCredits(prev => prev ? {
          ...prev,
          current_credits: result.remainingCredits || prev.current_credits,
          total_used_credits: prev.total_used_credits + (costs[`${actionType}_cost` as keyof typeof costs] || 0)
        } : null);

        // Refresh transactions
        fetchTransactions();

        toast({
          title: "Credits Deducted",
          description: result.message,
        });
        return true;
      } else {
        toast({
          title: "Insufficient Credits",
          description: result.message,
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error('Error deducting credits:', error);
      toast({
        title: "Error",
        description: "Failed to process credits.",
        variant: "destructive"
      });
      return false;
    }
  }, [user?.id, costs, fetchTransactions]);

  const hasEnoughCredits = useCallback((actionType: string): boolean => {
    if (!credits) return false;
    const requiredCredits = costs[`${actionType}_cost` as keyof typeof costs] || 0;
    return credits.current_credits >= requiredCredits;
  }, [credits, costs]);

  const getRequiredCredits = useCallback((actionType: string): number => {
    return costs[`${actionType}_cost` as keyof typeof costs] || 0;
  }, [costs]);

  useEffect(() => {
    fetchCredits();
    fetchTransactions();
  }, [fetchCredits, fetchTransactions]);

  return {
    credits,
    transactions,
    loading,
    costs,
    fetchCredits,
    fetchTransactions,
    checkAndDeductCredits,
    hasEnoughCredits,
    getRequiredCredits
  };
};
