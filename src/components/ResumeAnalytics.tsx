
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ResumeData } from '@/types/resume';
import { BarChart, Brain, Loader2 } from 'lucide-react';
import { AIAnalyticsService, AIAnalytics } from '@/services/aiAnalytics';
import { calculateBasicMetrics } from '@/utils/resumeMetrics';
import { MetricsDisplay } from './MetricsDisplay';
import { AIInsights } from './AIInsights';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface ResumeAnalyticsProps {
  resumeData: ResumeData;
  targetKeywords: string[];
}

export const ResumeAnalytics: React.FC<ResumeAnalyticsProps> = ({
  resumeData,
  targetKeywords
}) => {
  const { user } = useAuth();
  const [aiAnalytics, setAiAnalytics] = useState<AIAnalytics | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAnalyzed, setLastAnalyzed] = useState<Date | null>(null);

  const basicMetrics = calculateBasicMetrics(resumeData, targetKeywords);

  const performAIAnalysis = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to use AI analytics.",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      console.log('Starting AI analytics analysis...');
      
      const analytics = await AIAnalyticsService.performComprehensiveAnalysis(
        resumeData, 
        targetKeywords
      );

      setAiAnalytics(analytics);
      setLastAnalyzed(new Date());
      
      toast({
        title: "AI Analysis Complete!",
        description: "Resume analytics have been updated with AI insights.",
      });
      
    } catch (error) {
      console.error('Error performing AI analysis:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <BarChart className="h-5 w-5 text-purple-600" />
              <span>Resume Analytics</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              {lastAnalyzed && (
                <span className="text-xs text-gray-500">
                  Last analyzed: {lastAnalyzed.toLocaleTimeString()}
                </span>
              )}
              <Button 
                size="sm" 
                onClick={performAIAnalysis}
                disabled={isAnalyzing}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Brain className="h-3 w-3 mr-1" />
                    AI Analysis
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <MetricsDisplay basicMetrics={basicMetrics} aiAnalytics={aiAnalytics} />
          
          {aiAnalytics ? (
            <AIInsights aiAnalytics={aiAnalytics} />
          ) : (
            <div className="text-center py-4 bg-purple-50 rounded-lg">
              <Brain className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-sm text-purple-700 mb-3">
                Get detailed AI-powered analytics and personalized recommendations
              </p>
              <Button onClick={performAIAnalysis} disabled={isAnalyzing}>
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing Resume...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Run AI Analysis
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
