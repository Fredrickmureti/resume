import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ResumeData } from '@/types/resume';
import { Trophy, Target, TrendingUp, Loader2, Star, Users, Award } from 'lucide-react';
import { GeminiAIService } from '@/services/geminiAI';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface CompetitorAnalysis {
  industryBenchmark: number;
  topPerformers: string[];
  improvementAreas: string[];
  competitiveAdvantages: string[];
  marketTrends: string[];
}

interface DetailedScoring {
  overallScore: number;
  categories: {
    professionalSummary: number;
    experienceQuality: number;
    skillsRelevance: number;
    achievementImpact: number;
    formatOptimization: number;
    keywordDensity: number;
  };
  competitorAnalysis: CompetitorAnalysis;
  actionableInsights: string[];
  industrySpecificTips: string[];
}

interface ResumeScoringProps {
  resumeData: ResumeData;
  targetIndustry?: string;
  targetRole?: string;
}

export const ResumeScoring: React.FC<ResumeScoringProps> = ({
  resumeData,
  targetIndustry = 'Technology',
  targetRole = 'Software Engineer'
}) => {
  const { user } = useAuth();
  const [scoring, setScoring] = useState<DetailedScoring | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const validateResumeData = (): boolean => {
    if (!resumeData.personalInfo.fullName.trim()) {
      toast({
        title: "Incomplete Resume",
        description: "Please add your name before scoring your resume.",
        variant: "destructive"
      });
      return false;
    }

    const hasContent = resumeData.experience.length > 0 || 
                      resumeData.education.length > 0 || 
                      resumeData.skills.length > 0 || 
                      resumeData.summary.trim().length > 0;

    if (!hasContent) {
      toast({
        title: "Empty Resume",
        description: "Please add some content (experience, education, skills, or summary) before scoring.",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const performDetailedScoring = async () => {
    if (!user) {
      toast({
        title: "Premium Feature",
        description: "Please sign in to access detailed resume scoring.",
        variant: "destructive"
      });
      return;
    }

    if (!validateResumeData()) {
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const scoringPrompt = `Perform a comprehensive resume scoring and competitive analysis for a ${targetRole} position in the ${targetIndustry} industry.

RESUME DATA ANALYSIS:
Personal Info: ${JSON.stringify(resumeData.personalInfo)}
Summary: ${resumeData.summary}
Experience: ${JSON.stringify(resumeData.experience)}
Education: ${JSON.stringify(resumeData.education)}
Skills: ${JSON.stringify(resumeData.skills)}
Projects: ${JSON.stringify(resumeData.projects)}

TARGET ROLE: ${targetRole}
TARGET INDUSTRY: ${targetIndustry}

Analyze this SPECIFIC resume data and provide detailed scoring (0-100) for each category:

1. PROFESSIONAL SUMMARY QUALITY (0-100):
   - Rate the current summary: "${resumeData.summary}"
   - Consider relevance to ${targetRole} role
   - Assess keyword usage and impact

2. EXPERIENCE QUALITY & RELEVANCE (0-100):
   - Analyze ${resumeData.experience.length} experience entries
   - Evaluate job relevance to target role
   - Assess bullet point quality and quantification

3. SKILLS RELEVANCE & DEPTH (0-100):
   - Review ${resumeData.skills.length} listed skills
   - Match against ${targetIndustry} requirements
   - Assess skill categorization and depth

4. ACHIEVEMENT IMPACT (0-100):
   - Evaluate quantified achievements across all sections
   - Assess impact statements and results
   - Review project outcomes and contributions

5. FORMAT & ATS OPTIMIZATION (0-100):
   - Analyze overall structure and organization
   - Assess ATS compatibility
   - Review section completeness

6. KEYWORD DENSITY & SEO (0-100):
   - Analyze industry-specific keywords
   - Match against ${targetRole} requirements
   - Assess keyword distribution

COMPETITIVE ANALYSIS:
- Calculate industry benchmark for ${targetIndustry}
- Identify top performer characteristics
- Highlight improvement areas vs competitors
- List competitive advantages of this resume
- Identify current market trends

Provide 5-7 specific actionable insights and industry-specific tips.

Return ONLY valid JSON in this exact format:
{
  "overallScore": [calculated average of all categories],
  "categories": {
    "professionalSummary": [0-100 based on actual summary analysis],
    "experienceQuality": [0-100 based on actual experience data],
    "skillsRelevance": [0-100 based on actual skills analysis],
    "achievementImpact": [0-100 based on actual achievements],
    "formatOptimization": [0-100 based on structure analysis],
    "keywordDensity": [0-100 based on keyword analysis]
  },
  "competitorAnalysis": {
    "industryBenchmark": [realistic benchmark for ${targetIndustry}],
    "topPerformers": ["trait1", "trait2", "trait3"],
    "improvementAreas": ["area1", "area2", "area3"],
    "competitiveAdvantages": ["advantage1", "advantage2"],
    "marketTrends": ["trend1", "trend2", "trend3", "trend4", "trend5"]
  },
  "actionableInsights": ["insight1", "insight2", "insight3", "insight4", "insight5"],
  "industrySpecificTips": ["tip1", "tip2", "tip3", "tip4"]
}`;

      const response = await GeminiAIService.callAI(scoringPrompt, 'detailed_resume_scoring', {
        resumeData,
        targetRole,
        targetIndustry,
        analysisType: 'comprehensive_scoring'
      });

      // Parse the response more carefully
      let scoringData: DetailedScoring;
      
      try {
        // Try to parse if it's a JSON string
        const parsedData = typeof response === 'string' ? JSON.parse(response) : response;
        
        if (parsedData.overallScore && parsedData.categories) {
          scoringData = parsedData;
        } else {
          throw new Error('Invalid response structure');
        }
      } catch (parseError) {
        // Fallback with realistic scoring based on resume content
        const baseScore = calculateBaseScore(resumeData);
        scoringData = {
          overallScore: baseScore,
          categories: {
            professionalSummary: resumeData.summary.length > 50 ? baseScore + 5 : baseScore - 15,
            experienceQuality: resumeData.experience.length > 0 ? baseScore + 10 : baseScore - 20,
            skillsRelevance: resumeData.skills.length > 5 ? baseScore + 8 : baseScore - 10,
            achievementImpact: hasQuantifiedAchievements(resumeData) ? baseScore + 12 : baseScore - 15,
            formatOptimization: baseScore,
            keywordDensity: baseScore - 5
          },
          competitorAnalysis: {
            industryBenchmark: Math.max(60, baseScore - 10),
            topPerformers: ['Strong quantified achievements', 'Industry-specific keywords', 'Leadership experience'],
            improvementAreas: generateImprovementAreas(resumeData),
            competitiveAdvantages: generateCompetitiveAdvantages(resumeData),
            marketTrends: ['AI/ML skills in high demand', 'Remote collaboration expertise', 'Data-driven decision making']
          },
          actionableInsights: generateActionableInsights(resumeData),
          industrySpecificTips: [
            `Focus on ${targetIndustry}-specific technologies`,
            'Emphasize problem-solving capabilities',
            'Include relevant certifications',
            'Showcase continuous learning mindset'
          ]
        };
      }

      setScoring(scoringData);
      
      toast({
        title: "Scoring Complete!",
        description: "Your resume has been analyzed with detailed competitive insights.",
      });
      
    } catch (error) {
      console.error('Error performing detailed scoring:', error);
      toast({
        title: "Analysis Failed",
        description: "Failed to generate detailed scoring. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const calculateBaseScore = (data: ResumeData): number => {
    let score = 40; // Base score
    
    if (data.personalInfo.fullName) score += 5;
    if (data.personalInfo.email) score += 5;
    if (data.summary.length > 50) score += 10;
    if (data.experience.length > 0) score += 15;
    if (data.education.length > 0) score += 10;
    if (data.skills.length > 3) score += 10;
    if (data.projects.length > 0) score += 5;
    
    return Math.min(85, score);
  };

  const hasQuantifiedAchievements = (data: ResumeData): boolean => {
    const numberRegex = /\d+/;
    return data.experience.some(exp => 
      exp.description.some(desc => numberRegex.test(desc))
    );
  };

  const generateImprovementAreas = (data: ResumeData): string[] => {
    const areas = [];
    if (data.summary.length < 50) areas.push('Strengthen professional summary');
    if (!hasQuantifiedAchievements(data)) areas.push('Add quantified achievements');
    if (data.skills.length < 5) areas.push('Expand skills section');
    return areas.slice(0, 3);
  };

  const generateCompetitiveAdvantages = (data: ResumeData): string[] => {
    const advantages = [];
    if (data.experience.length > 2) advantages.push('Diverse experience');
    if (data.projects.length > 0) advantages.push('Project portfolio');
    if (data.education.length > 0) advantages.push('Educational background');
    return advantages.slice(0, 2);
  };

  const generateActionableInsights = (data: ResumeData): string[] => {
    const insights = [];
    if (data.summary.length < 50) insights.push('Expand your professional summary with more details');
    if (!hasQuantifiedAchievements(data)) insights.push('Add specific metrics and numbers to your achievements');
    if (data.skills.length < 5) insights.push('Include more relevant technical and soft skills');
    insights.push('Optimize for ATS keyword scanning');
    insights.push('Highlight leadership and collaboration experiences');
    return insights.slice(0, 5);
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Good';
    if (score >= 70) return 'Average';
    return 'Needs Improvement';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-yellow-600" />
              <span>Resume Scoring & Competitive Analysis</span>
            </CardTitle>
            <Badge variant="secondary" className="bg-purple-100 text-purple-700">
              Premium AI Feature
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {!scoring ? (
            <div className="text-center py-8 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg">
              <Trophy className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Get Your Competitive Edge</h3>
              <p className="text-gray-600 mb-4 max-w-md mx-auto">
                Get detailed scoring across 6 key areas and see how you stack up against industry competitors.
              </p>
              <Button onClick={performDetailedScoring} disabled={isAnalyzing} size="lg">
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing Resume...
                  </>
                ) : (
                  <>
                    <Target className="h-4 w-4 mr-2" />
                    Analyze My Resume
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Overall Score */}
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
                <div className="text-4xl font-bold mb-2 text-blue-600">
                  {scoring.overallScore}
                </div>
                <div className="text-lg font-medium text-gray-700 mb-2">
                  Overall Resume Score
                </div>
                <Badge className={`${getScoreColor(scoring.overallScore)} bg-white`}>
                  {getScoreLabel(scoring.overallScore)}
                </Badge>
              </div>

              {/* Category Breakdown */}
              <div>
                <h4 className="font-semibold mb-4 flex items-center">
                  <Star className="h-4 w-4 mr-2 text-yellow-600" />
                  Category Breakdown
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(scoring.categories).map(([category, score]) => (
                    <div key={category} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium capitalize">
                          {category.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <span className={`font-bold ${getScoreColor(score)}`}>
                          {score}
                        </span>
                      </div>
                      <Progress value={score} className="h-2" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Competitive Analysis */}
              <div>
                <h4 className="font-semibold mb-4 flex items-center">
                  <Users className="h-4 w-4 mr-2 text-blue-600" />
                  Competitive Analysis
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Industry Benchmark</div>
                    <div className="text-2xl font-bold text-gray-800">
                      {scoring.competitorAnalysis.industryBenchmark}
                    </div>
                    <div className="text-xs text-gray-500">
                      Your score: {scoring.overallScore > scoring.competitorAnalysis.industryBenchmark ? '+' : ''}
                      {scoring.overallScore - scoring.competitorAnalysis.industryBenchmark} vs average
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="text-sm text-gray-600 mb-2">Top Performer Traits</div>
                    <div className="space-y-1">
                      {scoring.competitorAnalysis.topPerformers.slice(0, 3).map((trait, index) => (
                        <div key={index} className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded">
                          {trait}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                  <h5 className="font-medium text-yellow-800 mb-2">Market Trends</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {scoring.competitorAnalysis.marketTrends.map((trend, index) => (
                      <div key={index} className="text-sm text-yellow-700 flex items-center">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {trend}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actionable Insights */}
              <div>
                <h4 className="font-semibold mb-4 flex items-center">
                  <Award className="h-4 w-4 mr-2 text-purple-600" />
                  Actionable Insights
                </h4>
                <div className="space-y-3">
                  {scoring.actionableInsights.map((insight, index) => (
                    <div key={index} className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                      <p className="text-sm text-blue-800">{insight}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Industry-Specific Tips */}
              <div>
                <h4 className="font-semibold mb-4">Industry-Specific Tips</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {scoring.industrySpecificTips.map((tip, index) => (
                    <div key={index} className="p-3 bg-purple-50 rounded-lg">
                      <p className="text-sm text-purple-800">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>

              <Button 
                onClick={performDetailedScoring} 
                variant="outline" 
                disabled={isAnalyzing}
                className="w-full"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Re-analyzing...
                  </>
                ) : (
                  <>
                    <Target className="h-4 w-4 mr-2" />
                    Re-analyze Resume
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
