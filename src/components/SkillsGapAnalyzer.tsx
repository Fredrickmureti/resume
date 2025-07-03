
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle, TrendingUp, Loader2, Target } from 'lucide-react';
import { GeminiAIService } from '@/services/geminiAI';
import { ResumeData } from '@/types/resume';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface SkillGap {
  skill: string;
  importance: 'High' | 'Medium' | 'Low';
  reason: string;
  learningResource?: string;
}

interface SkillsAnalysis {
  matchingSkills: string[];
  missingSkills: SkillGap[];
  overallMatch: number;
  recommendations: string[];
}

interface SkillsGapAnalyzerProps {
  resumeData: ResumeData;
}

export const SkillsGapAnalyzer: React.FC<SkillsGapAnalyzerProps> = ({ resumeData }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobDescription, setJobDescription] = useState('');
  const [analysis, setAnalysis] = useState<SkillsAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeSkillsGap = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to use AI skills gap analysis.",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }

    if (!jobDescription.trim()) {
      toast({
        title: "Job Description Required",
        description: "Please enter a job description to analyze skills gap.",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const currentSkills = resumeData.skills.map(skill => skill.name);
      
      const prompt = `
        Analyze the skills gap between the candidate's current skills and the job requirements.
        
        Current Skills: ${currentSkills.join(', ')}
        
        Job Description: ${jobDescription}
        
        Please provide a detailed analysis in the following format:
        1. List matching skills that the candidate already has
        2. Identify missing skills with importance level (High/Medium/Low) and explanation
        3. Calculate an overall match percentage
        4. Provide specific recommendations for skill development
        
        Format the response as JSON with the following structure:
        {
          "matchingSkills": ["skill1", "skill2"],
          "missingSkills": [
            {
              "skill": "skill name",
              "importance": "High|Medium|Low",
              "reason": "explanation why this skill is important",
              "learningResource": "suggested learning path or resource"
            }
          ],
          "overallMatch": number (0-100),
          "recommendations": ["recommendation1", "recommendation2"]
        }
      `;

      const response = await GeminiAIService.callAI(prompt, 'skills_gap_analysis');
      
      // The response is already an AIResponse object, try to extract the analysis from it
      let parsedAnalysis: SkillsAnalysis;
      
      if (response.content) {
        // Try to parse the content as JSON
        try {
          parsedAnalysis = JSON.parse(response.content);
        } catch {
          // If parsing fails, create a basic analysis from the response
          parsedAnalysis = {
            matchingSkills: response.suggestions?.skills?.technical || [],
            missingSkills: [],
            overallMatch: response.suggestions?.ats_score || 75,
            recommendations: response.suggestions?.recommendations || []
          };
        }
      } else {
        // Fallback analysis structure
        parsedAnalysis = {
          matchingSkills: response.suggestions?.skills?.technical || [],
          missingSkills: [],
          overallMatch: response.suggestions?.ats_score || 75,
          recommendations: response.suggestions?.recommendations || []
        };
      }
      
      setAnalysis(parsedAnalysis);
      
      toast({
        title: "Skills Gap Analysis Complete",
        description: `Analysis complete! Overall match: ${parsedAnalysis.overallMatch}%`,
      });
      
    } catch (error) {
      console.error('Error analyzing skills gap:', error);
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze skills gap. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMatchColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-blue-600" />
            <span>Skills Gap Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Job Description
            </label>
            <Textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here to analyze which skills you need to develop..."
              rows={4}
            />
          </div>
          
          <Button 
            onClick={analyzeSkillsGap}
            disabled={isAnalyzing || !jobDescription.trim() || !user}
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing Skills Gap...
              </>
            ) : !user ? (
              'Sign In for Skills Analysis'
            ) : (
              <>
                <TrendingUp className="h-4 w-4 mr-2" />
                Analyze Skills Gap
              </>
            )}
          </Button>

          {!user && (
            <p className="text-sm text-gray-500 text-center">
              Sign in to use AI-powered skills gap analysis and get personalized recommendations.
            </p>
          )}
        </CardContent>
      </Card>

      {analysis && (
        <>
          {/* Overall Match Score */}
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Overall Skills Match</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className={`text-4xl font-bold ${getMatchColor(analysis.overallMatch)}`}>
                {analysis.overallMatch}%
              </div>
              <Progress value={analysis.overallMatch} className="h-3" />
              <p className="text-sm text-gray-600">
                Skills compatibility with the job requirements
              </p>
            </CardContent>
          </Card>

          {/* Matching Skills */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span>Your Matching Skills ({analysis.matchingSkills.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {analysis.matchingSkills.map((skill, index) => (
                  <Badge key={index} className="bg-green-100 text-green-800">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Missing Skills */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                <span>Skills to Develop ({analysis.missingSkills.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysis.missingSkills.map((skillGap, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{skillGap.skill}</h4>
                      <Badge className={getImportanceColor(skillGap.importance)}>
                        {skillGap.importance} Priority
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{skillGap.reason}</p>
                    {skillGap.learningResource && (
                      <p className="text-sm text-blue-600">
                        💡 {skillGap.learningResource}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                <span>Development Recommendations</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {analysis.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-purple-600 mt-1">•</span>
                    <span className="text-sm">{recommendation}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};
