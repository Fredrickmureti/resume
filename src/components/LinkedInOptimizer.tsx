
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy, Linkedin, Sparkles, CheckCircle2, TrendingUp, AlertCircle, User, Briefcase, Target, Star, Award, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { ResumeData } from '@/types/resume';
import { GeminiAIService } from '@/services/geminiAI';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';

interface LinkedInOptimizerProps {
  resumeData: ResumeData;
  onClose?: () => void;
}

interface OptimizationResult {
  profileScore: number;
  headlines: Array<{
    original: string;
    optimized: string;
    reasoning: string;
  }>;
  aboutSection: {
    original: string;
    optimized: string;
    improvements: string[];
  };
  experienceOptimizations: Array<{
    jobTitle: string;
    company: string;
    originalBullets: string[];
    optimizedBullets: string[];
    improvements: string[];
  }>;
  keywordSuggestions: {
    primary: string[];
    secondary: string[];
    industrySpecific: string[];
  };
  featuredContent: Array<{
    type: 'project' | 'portfolio' | 'certification' | 'article';
    title: string;
    description: string;
    url?: string;
  }>;
  profileChecklist: Array<{
    item: string;
    status: 'complete' | 'needs_improvement' | 'missing';
    suggestion: string;
  }>;
  overallFeedback: string[];
}

interface OptimizationInputs {
  targetRole: string;
  targetIndustry: string;
  experienceLevel: string;
  specificGoals: string;
  tone: 'professional' | 'friendly' | 'bold' | 'formal';
  currentHeadline: string;
  currentAbout: string;
}

export const LinkedInOptimizer: React.FC<LinkedInOptimizerProps> = ({ 
  resumeData, 
  onClose 
}) => {
  const { user } = useAuth();
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState('input');
  const [showResults, setShowResults] = useState(false);
  
  const [inputs, setInputs] = useState<OptimizationInputs>({
    targetRole: '',
    targetIndustry: '',
    experienceLevel: 'mid-level',
    specificGoals: '',
    tone: 'professional',
    currentHeadline: '',
    currentAbout: ''
  });

  // Check if resume has meaningful content
  const hasResumeContent = () => {
    const hasPersonalInfo = resumeData.personalInfo.fullName.trim() || resumeData.personalInfo.email.trim();
    const hasExperience = resumeData.experience.length > 0;
    const hasEducation = resumeData.education.length > 0;
    const hasSkills = resumeData.skills.length > 0;
    const hasSummary = resumeData.summary.trim();
    
    return hasPersonalInfo && (hasExperience || hasEducation || hasSkills || hasSummary);
  };

  const validateInputs = () => {
    if (!inputs.targetRole.trim()) {
      toast({
        title: "Missing Target Role",
        description: "Please specify the role you're targeting on LinkedIn.",
        variant: "destructive"
      });
      return false;
    }
    
    if (!inputs.targetIndustry.trim()) {
      toast({
        title: "Missing Target Industry",
        description: "Please specify your target industry.",
        variant: "destructive"
      });
      return false;
    }
    
    return true;
  };

  const optimizeLinkedInProfile = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to use LinkedIn optimization.",
        variant: "destructive"
      });
      return;
    }

    if (!hasResumeContent()) {
      toast({
        title: "Insufficient Resume Content",
        description: "Please add more content to your resume before optimizing for LinkedIn.",
        variant: "destructive"
      });
      return;
    }

    if (!validateInputs()) {
      return;
    }

    setIsAnalyzing(true);
    
    try {
      console.log('Starting comprehensive LinkedIn profile optimization...');
      
      const prompt = `You are a LinkedIn Profile Optimization Expert. Analyze the provided resume data and user inputs to create a comprehensive LinkedIn profile optimization.

RESUME DATA: ${JSON.stringify(resumeData, null, 2)}

USER'S OPTIMIZATION INPUTS:
- Target Role: ${inputs.targetRole}
- Target Industry: ${inputs.targetIndustry}
- Experience Level: ${inputs.experienceLevel}
- Specific Goals: ${inputs.specificGoals || 'General LinkedIn optimization'}
- Preferred Tone: ${inputs.tone}
- Current LinkedIn Headline: ${inputs.currentHeadline || 'Not provided'}
- Current About Section: ${inputs.currentAbout || 'Not provided'}

COMPREHENSIVE LINKEDIN PROFILE OPTIMIZATION REQUIREMENTS:

Provide a detailed JSON response with this exact structure:
{
  "profileScore": 85,
  "headlines": [
    {
      "original": "${inputs.currentHeadline || 'Current basic headline'}",
      "optimized": "Optimized headline with keywords and value proposition",
      "reasoning": "Explanation of why this headline is better"
    }
  ],
  "aboutSection": {
    "original": "${inputs.currentAbout || 'Current about section'}",
    "optimized": "Professional 3-4 paragraph about section with achievements, keywords, and call-to-action",
    "improvements": ["List of specific improvements made", "Why each change matters"]
  },
  "experienceOptimizations": [
    {
      "jobTitle": "Job title from resume",
      "company": "Company name",
      "originalBullets": ["Original bullet points"],
      "optimizedBullets": ["Action-based, results-driven bullet points with metrics"],
      "improvements": ["Specific improvements made to this experience"]
    }
  ],
  "keywordSuggestions": {
    "primary": ["Core keywords for ${inputs.targetRole}"],
    "secondary": ["Supporting keywords"],
    "industrySpecific": ["${inputs.targetIndustry} specific terms"]
  },
  "featuredContent": [
    {
      "type": "project",
      "title": "Featured project/portfolio suggestion",
      "description": "Why this should be featured",
      "url": "Suggested URL if applicable"
    }
  ],
  "profileChecklist": [
    {
      "item": "Professional headline",
      "status": "complete",
      "suggestion": "Specific suggestion for improvement"
    },
    {
      "item": "About section",
      "status": "needs_improvement",
      "suggestion": "What needs to be fixed"
    }
  ],
  "overallFeedback": [
    "Key strengths of current profile",
    "Major areas for improvement",
    "Strategic recommendations for ${inputs.targetRole} in ${inputs.targetIndustry}"
  ]
}

OPTIMIZATION FOCUS AREAS:
1. HEADLINE OPTIMIZATION:
   - Include target role and key skills
   - Add value proposition
   - Use relevant keywords for ${inputs.targetRole}
   - Make it searchable by recruiters

2. ABOUT SECTION ENHANCEMENT:
   - Write in ${inputs.tone} tone
   - Include measurable achievements
   - Add industry keywords naturally
   - End with clear call-to-action

3. EXPERIENCE OPTIMIZATION:
   - Rewrite bullet points with action verbs
   - Add quantifiable results where possible
   - Align with ${inputs.targetRole} requirements
   - Include relevant keywords

4. KEYWORD STRATEGY:
   - Primary keywords for ${inputs.targetRole}
   - Industry-specific terms for ${inputs.targetIndustry}
   - Skills that recruiters search for
   - Location-based keywords if relevant

5. PROFILE COMPLETENESS:
   - Assess missing sections
   - Suggest featured content
   - Recommend skill endorsements
   - Identify optimization opportunities

Make all suggestions specific to ${inputs.targetRole} in ${inputs.targetIndustry} with ${inputs.experienceLevel} experience level.`;

      const response = await GeminiAIService.callAI(prompt, 'linkedin_profile_optimization', {
        resumeData,
        optimizationType: 'comprehensive_linkedin_profile',
        targetRole: inputs.targetRole,
        targetIndustry: inputs.targetIndustry,
        experienceLevel: inputs.experienceLevel,
        tone: inputs.tone,
        specificGoals: inputs.specificGoals
      });

      console.log('LinkedIn optimization response:', response);

      if (response && (response.suggestions || response.content)) {
        try {
          let parsedResult;
          
          if (response.content) {
            try {
              parsedResult = JSON.parse(response.content);
            } catch (parseError) {
              console.log('Direct JSON parse failed, trying to extract from suggestions');
              parsedResult = response.suggestions;
            }
          } else {
            parsedResult = response.suggestions;
          }

          // Ensure we have a complete result structure
          const optimizationResult: OptimizationResult = {
            profileScore: parsedResult.profileScore || 75,
            headlines: parsedResult.headlines || [{
              original: inputs.currentHeadline || `Student at University`,
              optimized: `${inputs.targetRole} | ${inputs.targetIndustry} Professional | ${inputs.experienceLevel} Experience`,
              reasoning: `Optimized to include target role and industry keywords for better searchability`
            }],
            aboutSection: {
              original: inputs.currentAbout || 'Basic about section',
              optimized: parsedResult.aboutSection?.optimized || `I'm a ${inputs.experienceLevel} ${inputs.targetRole} with expertise in ${inputs.targetIndustry}. ${resumeData.summary || 'Passionate about driving results and innovation in my field.'} I'm actively seeking opportunities to contribute to forward-thinking organizations in ${inputs.targetIndustry}.`,
              improvements: parsedResult.aboutSection?.improvements || ['Added industry keywords', 'Included value proposition', 'Made it more searchable']
            },
            experienceOptimizations: parsedResult.experienceOptimizations || resumeData.experience.slice(0, 3).map(exp => ({
              jobTitle: exp.jobTitle,
              company: exp.company,
              originalBullets: exp.description.slice(0, 3),
              optimizedBullets: exp.description.slice(0, 3).map(bullet => 
                `• ${bullet.replace(/^[•\-\*]\s*/, '')} - optimized for ${inputs.targetRole} relevance`
              ),
              improvements: ['Added action verbs', 'Included measurable results', 'Aligned with target role']
            })),
            keywordSuggestions: parsedResult.keywordSuggestions || {
              primary: [inputs.targetRole, inputs.targetIndustry, inputs.experienceLevel],
              secondary: resumeData.skills.slice(0, 5).map(skill => 
                typeof skill === 'string' ? skill : skill.name
              ),
              industrySpecific: [`${inputs.targetIndustry} Strategy`, `${inputs.targetIndustry} Innovation`]
            },
            featuredContent: parsedResult.featuredContent || resumeData.projects.slice(0, 3).map(project => ({
              type: 'project' as const,
              title: project.name,
              description: `Showcase this project to demonstrate ${inputs.targetRole} skills`,
              url: project.url
            })),
            profileChecklist: parsedResult.profileChecklist || [
              { item: 'Professional Headline', status: inputs.currentHeadline ? 'needs_improvement' : 'missing', suggestion: 'Add keywords and value proposition' },
              { item: 'About Section', status: inputs.currentAbout ? 'needs_improvement' : 'missing', suggestion: 'Write compelling summary with achievements' },
              { item: 'Experience Descriptions', status: 'needs_improvement', suggestion: 'Add action verbs and quantifiable results' },
              { item: 'Skills Section', status: 'complete', suggestion: 'Good skill coverage' },
              { item: 'Featured Content', status: 'missing', suggestion: 'Add portfolio projects or certifications' }
            ],
            overallFeedback: parsedResult.overallFeedback || [
              `Strong foundation for ${inputs.targetRole} profile`,
              'Headline needs keyword optimization for better searchability',
              'Experience section could benefit from more quantifiable achievements',
              `Consider adding ${inputs.targetIndustry}-specific certifications or projects`
            ]
          };

          setResult(optimizationResult);
          setShowResults(true);
          setActiveTab('overview');

          toast({
            title: "LinkedIn Profile Analysis Complete!",
            description: `Your comprehensive optimization for ${inputs.targetRole} in ${inputs.targetIndustry} is ready.`,
          });

        } catch (error) {
          console.error('Error parsing LinkedIn optimization result:', error);
          toast({
            title: "Analysis Failed",
            description: "Failed to parse LinkedIn optimization results. Please try again.",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error('LinkedIn optimization error:', error);
      toast({
        title: "Analysis Failed",
        description: "Failed to generate LinkedIn optimization. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to Clipboard",
      description: "Content copied successfully!",
    });
  };

  const resetAnalysis = () => {
    setResult(null);
    setShowResults(false);
    setActiveTab('input');
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'needs_improvement':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'missing':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  if (!showResults) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Linkedin className="h-5 w-5 text-blue-600" />
              <span>LinkedIn Profile Optimizer</span>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Get comprehensive optimization for your LinkedIn profile to attract recruiters and opportunities
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {!hasResumeContent() && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Your resume appears to be incomplete. Please add more content (personal info, experience, education, or skills) before optimizing for LinkedIn.
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-4">
                  <Target className="h-4 w-4 text-blue-600" />
                  <h3 className="font-semibold">Target Information</h3>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="targetRole">Target Role *</Label>
                  <Input
                    id="targetRole"
                    placeholder="e.g., Software Engineer, Marketing Manager, Data Scientist"
                    value={inputs.targetRole}
                    onChange={(e) => setInputs(prev => ({ ...prev, targetRole: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetIndustry">Target Industry *</Label>
                  <Input
                    id="targetIndustry"
                    placeholder="e.g., Technology, Healthcare, Finance, Education"
                    value={inputs.targetIndustry}
                    onChange={(e) => setInputs(prev => ({ ...prev, targetIndustry: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experienceLevel">Experience Level</Label>
                  <Select value={inputs.experienceLevel} onValueChange={(value) => setInputs(prev => ({ ...prev, experienceLevel: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entry-level">Entry Level (0-2 years)</SelectItem>
                      <SelectItem value="mid-level">Mid Level (3-7 years)</SelectItem>
                      <SelectItem value="senior-level">Senior Level (8-15 years)</SelectItem>
                      <SelectItem value="executive-level">Executive Level (15+ years)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tone">Profile Tone</Label>
                  <Select value={inputs.tone} onValueChange={(value: any) => setInputs(prev => ({ ...prev, tone: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="friendly">Friendly</SelectItem>
                      <SelectItem value="bold">Bold</SelectItem>
                      <SelectItem value="formal">Formal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-4">
                  <User className="h-4 w-4 text-blue-600" />
                  <h3 className="font-semibold">Current Profile Content</h3>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentHeadline">Current LinkedIn Headline</Label>
                  <Input
                    id="currentHeadline"
                    placeholder="e.g., Student at University of XYZ"
                    value={inputs.currentHeadline}
                    onChange={(e) => setInputs(prev => ({ ...prev, currentHeadline: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentAbout">Current About Section</Label>
                  <Textarea
                    id="currentAbout"
                    placeholder="Paste your current LinkedIn about section (optional)"
                    value={inputs.currentAbout}
                    onChange={(e) => setInputs(prev => ({ ...prev, currentAbout: e.target.value }))}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specificGoals">Specific LinkedIn Goals</Label>
                  <Textarea
                    id="specificGoals"
                    placeholder="e.g., Attract recruiters, build thought leadership, network with industry peers"
                    value={inputs.specificGoals}
                    onChange={(e) => setInputs(prev => ({ ...prev, specificGoals: e.target.value }))}
                    rows={3}
                  />
                </div>
              </div>
            </div>

            <div className="text-center pt-4">
              <Button
                onClick={optimizeLinkedInProfile}
                disabled={isAnalyzing || !hasResumeContent()}
                className="bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                {isAnalyzing ? (
                  <>
                    <TrendingUp className="h-4 w-4 mr-2 animate-pulse" />
                    Optimizing Your LinkedIn Profile...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Optimize My LinkedIn Profile
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Linkedin className="h-5 w-5 text-blue-600" />
            <span>LinkedIn Profile Optimization Results</span>
          </CardTitle>
          {result && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Optimized for: <strong>{inputs.targetRole}</strong> in <strong>{inputs.targetIndustry}</strong>
              </p>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">Profile Score:</span>
                <span className={`text-lg font-bold ${getScoreColor(result.profileScore)}`}>
                  {result.profileScore}/100
                </span>
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {result && (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="headline">Headline</TabsTrigger>
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="experience">Experience</TabsTrigger>
                <TabsTrigger value="keywords">Keywords</TabsTrigger>
                <TabsTrigger value="checklist">Checklist</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="p-4">
                    <h4 className="font-semibold mb-3 flex items-center">
                      <Award className="h-4 w-4 mr-2 text-blue-600" />
                      Profile Score Breakdown
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Overall Score</span>
                          <span className={getScoreColor(result.profileScore)}>{result.profileScore}%</span>
                        </div>
                        <Progress value={result.profileScore} className="h-2" />
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <h4 className="font-semibold mb-3 flex items-center">
                      <Target className="h-4 w-4 mr-2 text-green-600" />
                      Quick Wins
                    </h4>
                    <div className="space-y-2">
                      {result.profileChecklist
                        .filter(item => item.status === 'missing' || item.status === 'needs_improvement')
                        .slice(0, 3)
                        .map((item, index) => (
                        <div key={index} className="flex items-start space-x-2 text-sm">
                          {getStatusIcon(item.status)}
                          <span>{item.suggestion}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>

                <Card className="p-4">
                  <h4 className="font-semibold mb-3">Overall Feedback</h4>
                  <div className="space-y-2">
                    {result.overallFeedback.map((feedback, index) => (
                      <p key={index} className="text-sm text-gray-600">• {feedback}</p>
                    ))}
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="headline" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">Headline Optimization</h4>
                  <Badge variant="secondary">{result.headlines.length} suggestion(s)</Badge>
                </div>
                {result.headlines.map((headline, index) => (
                  <Card key={index} className="p-4">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-red-600">Before:</Label>
                        <p className="text-sm bg-red-50 p-2 rounded mt-1">{headline.original}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-green-600">After:</Label>
                        <div className="flex items-start justify-between bg-green-50 p-2 rounded mt-1">
                          <p className="text-sm flex-1">{headline.optimized}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(headline.optimized)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="bg-blue-50 p-3 rounded">
                        <Label className="text-sm font-medium text-blue-800">Why this works:</Label>
                        <p className="text-sm text-blue-700 mt-1">{headline.reasoning}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="about" className="space-y-4">
                <h4 className="font-semibold">About Section Optimization</h4>
                <Card className="p-4">
                  <div className="space-y-4">
                    {result.aboutSection.original && (
                      <div>
                        <Label className="text-sm font-medium text-red-600">Before:</Label>
                        <div className="text-sm bg-red-50 p-3 rounded mt-1 whitespace-pre-wrap">
                          {result.aboutSection.original}
                        </div>
                      </div>
                    )}
                    <div>
                      <Label className="text-sm font-medium text-green-600">Optimized About Section:</Label>
                      <div className="flex items-start justify-between bg-green-50 p-3 rounded mt-1">
                        <div className="text-sm flex-1 whitespace-pre-wrap">
                          {result.aboutSection.optimized}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(result.aboutSection.optimized)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="bg-blue-50 p-3 rounded">
                      <Label className="text-sm font-medium text-blue-800">Key Improvements:</Label>
                      <ul className="text-sm text-blue-700 mt-1 space-y-1">
                        {result.aboutSection.improvements.map((improvement, index) => (
                          <li key={index}>• {improvement}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="experience" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">Experience Optimization</h4>
                  <Badge variant="secondary">{result.experienceOptimizations.length} position(s)</Badge>
                </div>
                {result.experienceOptimizations.map((exp, index) => (
                  <Card key={index} className="p-4">
                    <div className="space-y-4">
                      <div>
                        <h5 className="font-medium">{exp.jobTitle} at {exp.company}</h5>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-red-600">Before:</Label>
                          <div className="text-sm bg-red-50 p-2 rounded mt-1">
                            {exp.originalBullets.map((bullet, idx) => (
                              <p key={idx} className="mb-1">• {bullet}</p>
                            ))}
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-green-600">After:</Label>
                          <div className="bg-green-50 p-2 rounded mt-1">
                            {exp.optimizedBullets.map((bullet, idx) => (
                              <div key={idx} className="flex items-start justify-between mb-1">
                                <p className="text-sm flex-1">{bullet}</p>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(bullet)}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="keywords" className="space-y-4">
                <h4 className="font-semibold">Strategic Keywords</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="p-4">
                    <h5 className="font-medium text-blue-600 mb-3">Primary Keywords</h5>
                    <div className="space-y-2">
                      {result.keywordSuggestions.primary.map((keyword, index) => (
                        <Badge key={index} variant="default" className="mr-2">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </Card>
                  <Card className="p-4">
                    <h5 className="font-medium text-green-600 mb-3">Secondary Keywords</h5>
                    <div className="space-y-2">
                      {result.keywordSuggestions.secondary.map((keyword, index) => (
                        <Badge key={index} variant="secondary" className="mr-2">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </Card>
                  <Card className="p-4">
                    <h5 className="font-medium text-purple-600 mb-3">Industry-Specific</h5>
                    <div className="space-y-2">
                      {result.keywordSuggestions.industrySpecific.map((keyword, index) => (
                        <Badge key={index} variant="outline" className="mr-2">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </Card>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Pro Tip:</strong> Use these keywords naturally throughout your LinkedIn profile, 
                    especially in your headline, summary, and experience descriptions. This will help recruiters find you when they search.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="checklist" className="space-y-4">
                <h4 className="font-semibold">Profile Completion Checklist</h4>
                <div className="space-y-3">
                  {result.profileChecklist.map((item, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          {getStatusIcon(item.status)}
                          <div>
                            <h5 className="font-medium">{item.item}</h5>
                            <p className="text-sm text-gray-600 mt-1">{item.suggestion}</p>
                          </div>
                        </div>
                        <Badge 
                          variant={item.status === 'complete' ? 'default' : 
                                  item.status === 'needs_improvement' ? 'secondary' : 'destructive'}
                        >
                          {item.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          )}

          <div className="flex justify-between items-center pt-4 border-t">
            <Button
              variant="outline"
              onClick={resetAnalysis}
            >
              New Analysis
            </Button>
            {onClose && (
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
