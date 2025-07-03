
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ResumeData } from '@/types/resume';
import { CheckCircle, AlertCircle, XCircle, Target, Lightbulb, Loader2 } from 'lucide-react';
import { GeminiAIService } from '@/services/geminiAI';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface ATSScorePanelProps {
  resumeData: ResumeData;
  score: number;
}

export const ATSScorePanel: React.FC<ATSScorePanelProps> = ({ resumeData, score }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [aiRecommendations, setAiRecommendations] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreStatus = (score: number) => {
    if (score >= 80) return { icon: CheckCircle, text: 'Excellent', color: 'bg-green-100 text-green-800' };
    if (score >= 60) return { icon: AlertCircle, text: 'Good', color: 'bg-yellow-100 text-yellow-800' };
    return { icon: XCircle, text: 'Needs Work', color: 'bg-red-100 text-red-800' };
  };

  const status = getScoreStatus(score);
  const StatusIcon = status.icon;

  const checks = [
    {
      title: 'Contact Information',
      passed: !!(resumeData.personalInfo.fullName && resumeData.personalInfo.email && resumeData.personalInfo.phone),
      tip: 'Include full name, email, and phone number'
    },
    {
      title: 'Professional Summary',
      passed: resumeData.summary.length > 50,
      tip: 'Add a compelling 2-3 sentence summary'
    },
    {
      title: 'Work Experience',
      passed: resumeData.experience.length > 0,
      tip: 'Add at least one work experience entry'
    },
    {
      title: 'Education',
      passed: resumeData.education.length > 0,
      tip: 'Include your educational background'
    },
    {
      title: 'Skills Section',
      passed: resumeData.skills.length >= 5,
      tip: 'Add at least 5 relevant skills'
    },
    {
      title: 'Quantified Achievements',
      passed: resumeData.experience.some(exp => 
        exp.description.some(desc => /\d/.test(desc))
      ),
      tip: 'Include numbers and metrics in your experience'
    },
    {
      title: 'Action Verbs',
      passed: resumeData.experience.some(exp => 
        exp.description.some(desc => 
          /^(achieved|managed|led|developed|created|improved|increased|reduced|implemented)/i.test(desc.trim())
        )
      ),
      tip: 'Start bullet points with strong action verbs'
    },
    {
      title: 'Keyword Optimization',
      passed: resumeData.skills.length >= 8,
      tip: 'Include industry-specific keywords and skills'
    }
  ];

  const passedChecks = checks.filter(check => check.passed).length;

  const analyzeWithAI = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to use AI analysis features.",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }

    setIsAnalyzing(true);
    try {
      const analysis = await GeminiAIService.analyzeATSScore(resumeData, resumeData.keywords || []);
      setAiRecommendations(analysis.recommendations);
      toast({
        title: "AI Analysis Complete",
        description: `Generated ${analysis.recommendations.length} personalized recommendations.`,
      });
    } catch (error) {
      console.error('Error analyzing with AI:', error);
      toast({
        title: "Analysis Failed",
        description: "Failed to generate AI recommendations. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Score Overview */}
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center space-x-2">
            <Target className="h-5 w-5 text-blue-600" />
            <span>ATS Score</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className={`text-4xl font-bold ${getScoreColor(score)}`}>
            {score}%
          </div>
          <Badge className={status.color}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {status.text}
          </Badge>
          <Progress value={score} className="h-3" />
          <p className="text-sm text-gray-600">
            {passedChecks} of {checks.length} checks passed
          </p>
        </CardContent>
      </Card>

      {/* Detailed Checks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            <span>Optimization Checklist</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {checks.map((check, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50">
                <div className="flex-shrink-0 mt-0.5">
                  {check.passed ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className={`text-sm font-medium ${check.passed ? 'text-green-800' : 'text-red-800'}`}>
                    {check.title}
                  </h4>
                  <p className="text-xs text-gray-600 mt-1">{check.tip}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Recommendations */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Lightbulb className="h-5 w-5 text-purple-500" />
              <span>AI Recommendations</span>
            </CardTitle>
            <Button 
              size="sm" 
              onClick={analyzeWithAI}
              disabled={isAnalyzing || !user}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Get AI Analysis'
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {aiRecommendations.length > 0 ? (
            <ul className="text-sm text-gray-700 space-y-2">
              {aiRecommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <span className="text-purple-500 mt-1">•</span>
                  <span>{recommendation}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500 mb-3">
                {!user 
                  ? "Sign in to get personalized AI recommendations to improve your ATS score."
                  : "Get personalized AI recommendations to improve your ATS score."
                }
              </p>
              <Button onClick={analyzeWithAI} disabled={isAnalyzing || !user}>
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing Resume...
                  </>
                ) : !user ? (
                  'Sign In for AI Analysis'
                ) : (
                  'Analyze with AI'
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Static Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Pro Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-xs text-gray-600 space-y-2">
            <li>• Use standard section headers (Experience, Education, Skills)</li>
            <li>• Keep formatting simple and consistent</li>
            <li>• Include relevant keywords from job postings</li>
            <li>• Use chronological order for experience</li>
            <li>• Save as PDF to preserve formatting</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};
