
import React from 'react';
import { Brain } from 'lucide-react';
import { AIAnalytics } from '@/services/aiAnalytics';

interface AIInsightsProps {
  aiAnalytics: AIAnalytics;
}

export const AIInsights: React.FC<AIInsightsProps> = ({ aiAnalytics }) => {
  return (
    <div className="space-y-4">
      {/* AI Insights */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <h4 className="font-medium text-green-800 flex items-center space-x-1">
            <span>✅</span>
            <span>Strengths</span>
          </h4>
          <ul className="text-sm text-green-700 space-y-1">
            {aiAnalytics.strengths.map((strength, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="text-green-500 mt-1">•</span>
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3">
          <h4 className="font-medium text-orange-800 flex items-center space-x-1">
            <span>🔄</span>
            <span>Improvements</span>
          </h4>
          <ul className="text-sm text-orange-700 space-y-1">
            {aiAnalytics.improvements.map((improvement, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="text-orange-500 mt-1">•</span>
                <span>{improvement}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* AI Recommendations */}
      {aiAnalytics.recommendations.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-3 flex items-center space-x-2">
            <Brain className="h-4 w-4" />
            <span>AI Recommendations</span>
          </h4>
          <ul className="text-sm text-blue-700 space-y-2">
            {aiAnalytics.recommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>{recommendation}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
