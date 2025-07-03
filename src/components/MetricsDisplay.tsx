
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Target, Eye, TrendingUp, Award } from 'lucide-react';
import { BasicMetrics } from '@/utils/resumeMetrics';
import { AIAnalytics } from '@/services/aiAnalytics';

interface MetricsDisplayProps {
  basicMetrics: BasicMetrics;
  aiAnalytics?: AIAnalytics;
}

export const MetricsDisplay: React.FC<MetricsDisplayProps> = ({
  basicMetrics,
  aiAnalytics
}) => {
  return (
    <div className="space-y-4">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{basicMetrics.wordCount}</div>
          <div className="text-sm text-blue-700">Total Words</div>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{basicMetrics.keywordMatchCount}</div>
          <div className="text-sm text-green-700">Keywords Matched</div>
        </div>
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{basicMetrics.sections.filter(s => s.name === 'Experience')[0]?.completed ? 'Complete' : 'Incomplete'}</div>
          <div className="text-sm text-purple-700">Experience Section</div>
        </div>
        <div className="text-center p-4 bg-orange-50 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">{basicMetrics.sections.filter(s => s.name === 'Skills')[0]?.completed ? 'Complete' : 'Incomplete'}</div>
          <div className="text-sm text-orange-700">Skills Section</div>
        </div>
      </div>

      {/* Progress Bars */}
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-blue-600" />
              <span className="font-medium">Keyword Match</span>
            </div>
            <span className="text-sm font-medium">{basicMetrics.keywordMatchPercentage}%</span>
          </div>
          <Progress value={basicMetrics.keywordMatchPercentage} className="h-2" />
        </div>

        {aiAnalytics ? (
          <>
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Eye className="h-4 w-4 text-green-600" />
                  <span className="font-medium">Readability (AI)</span>
                </div>
                <span className="text-sm font-medium">{aiAnalytics.readabilityScore}%</span>
              </div>
              <Progress value={aiAnalytics.readabilityScore} className="h-2" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                  <span className="font-medium">Impact Score (AI)</span>
                </div>
                <span className="text-sm font-medium">{aiAnalytics.impactScore}%</span>
              </div>
              <Progress value={aiAnalytics.impactScore} className="h-2" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Target className="h-4 w-4 text-indigo-600" />
                  <span className="font-medium">ATS Optimization (AI)</span>
                </div>
                <span className="text-sm font-medium">{aiAnalytics.atsOptimization}%</span>
              </div>
              <Progress value={aiAnalytics.atsOptimization} className="h-2" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Award className="h-4 w-4 text-orange-600" />
                  <span className="font-medium">Industry Alignment (AI)</span>
                </div>
                <span className="text-sm font-medium">{aiAnalytics.industryAlignment}%</span>
              </div>
              <Progress value={aiAnalytics.industryAlignment} className="h-2" />
            </div>
          </>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Award className="h-4 w-4 text-orange-600" />
                <span className="font-medium">Completeness</span>
              </div>
              <span className="text-sm font-medium">{basicMetrics.completionPercentage}%</span>
            </div>
            <Progress value={basicMetrics.completionPercentage} className="h-2" />
          </div>
        )}
      </div>

      {/* Section Status */}
      <div>
        <h4 className="font-medium mb-3">Section Status</h4>
        <div className="grid grid-cols-2 gap-2">
          {basicMetrics.sections.map((section) => (
            <div key={section.name} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span className="text-sm">{section.name}</span>
              <Badge variant={section.completed ? 'default' : 'outline'}>
                {section.completed ? 'Complete' : 'Missing'}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
