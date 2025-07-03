
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Coins, Clock, TrendingUp } from 'lucide-react';
import { useCredits } from '@/hooks/useCredits';
import { Skeleton } from '@/components/ui/skeleton';

export const CreditDisplay: React.FC = () => {
  const { credits, loading, costs } = useCredits();

  if (loading) {
    return <Skeleton className="h-16 w-full" />;
  }

  if (!credits) {
    return null;
  }

  const resetTime = new Date(credits.daily_reset_at);
  const hoursUntilReset = Math.max(0, Math.ceil((resetTime.getTime() - Date.now()) / (1000 * 60 * 60)));

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Coins className="h-4 w-4 text-blue-600" />
          Your Credits
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-blue-700">{credits.current_credits}</div>
            <div className="text-xs text-gray-600 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Resets in {hoursUntilReset}h
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">Total Used</div>
            <div className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              {credits.total_used_credits}
            </div>
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-blue-200">
          <div className="text-xs text-gray-600 mb-1">Credit Costs:</div>
          <div className="grid grid-cols-3 gap-1 text-xs">
            <div>Resume: {costs.resume_generation_cost}</div>
            <div>Cover Letter: {costs.cover_letter_cost}</div>
            <div>PDF: {costs.pdf_download_cost}</div>
            <div>AI Suggestions: {costs.ai_suggestions_cost}</div>
            <div>ATS Analysis: {costs.ats_analysis_cost}</div>
            <div>LinkedIn: {costs.linkedin_optimization_cost}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
