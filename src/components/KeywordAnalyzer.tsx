
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResumeData } from '@/types/resume';
import { analyzeKeywordDensity } from '@/utils/aiSuggestions';
import { JobDescriptionUploader } from './JobDescriptionUploader';
import { Target, TrendingUp, AlertTriangle, Upload, Type, Zap, Loader2, Brain } from 'lucide-react';
import { GeminiAIService } from '@/services/geminiAI';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

interface KeywordAnalyzerProps {
  resumeData: ResumeData;
  onKeywordsUpdate: (keywords: string[]) => void;
}

export const KeywordAnalyzer: React.FC<KeywordAnalyzerProps> = ({ 
  resumeData, 
  onKeywordsUpdate 
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobDescription, setJobDescription] = useState('');
  const [extractedKeywords, setExtractedKeywords] = useState<string[]>([]);
  const [analysis, setAnalysis] = useState<Record<string, number>>({});
  const [isExtractingKeywords, setIsExtractingKeywords] = useState(false);

  const extractKeywordsWithAI = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to use AI keyword extraction.",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }

    if (!jobDescription.trim()) {
      toast({
        title: "No Content to Analyze",
        description: "Please provide job description content for keyword extraction.",
        variant: "destructive"
      });
      return;
    }

    setIsExtractingKeywords(true);
    
    try {
      console.log('Starting AI keyword extraction...');
      console.log('Job description length:', jobDescription.length);
      
      // Use AI to extract keywords intelligently
      const aiKeywords = await GeminiAIService.extractKeywords(jobDescription);
      
      console.log('AI extracted keywords:', aiKeywords);
      
      if (!aiKeywords || aiKeywords.length === 0) {
        throw new Error('AI failed to extract keywords. Please try again.');
      }

      setExtractedKeywords(aiKeywords);
      onKeywordsUpdate(aiKeywords);

      // Analyze current resume against extracted keywords
      const resumeText = [
        resumeData.summary,
        ...resumeData.experience.flatMap(exp => exp.description),
        ...resumeData.skills.map(skill => skill.name),
        resumeData.personalInfo.fullName,
        resumeData.projects.map(proj => `${proj.name} ${proj.description}`).join(' '),
        resumeData.certifications.map(cert => cert.name).join(' ')
      ].join(' ');

      const density = analyzeKeywordDensity(resumeText, aiKeywords);
      setAnalysis(density);

      toast({
        title: "AI Keyword Extraction Complete!",
        description: `Successfully extracted ${aiKeywords.length} relevant keywords using AI analysis.`,
      });
      
    } catch (error) {
      console.error('Error extracting keywords with AI:', error);
      toast({
        title: "AI Extraction Failed",
        description: error instanceof Error ? error.message : "There was an error extracting keywords. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsExtractingKeywords(false);
    }
  };

  const extractKeywordsBasic = () => {
    // Fallback basic keyword extraction
    const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'will', 'would', 'could', 'should'];
    const words = jobDescription
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !commonWords.includes(word));

    const wordFreq = words.reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const keywords = Object.entries(wordFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 15)
      .map(([word]) => word);

    setExtractedKeywords(keywords);
    onKeywordsUpdate(keywords);

    // Analyze current resume
    const resumeText = [
      resumeData.summary,
      ...resumeData.experience.flatMap(exp => exp.description),
      ...resumeData.skills.map(skill => skill.name)
    ].join(' ');

    const density = analyzeKeywordDensity(resumeText, keywords);
    setAnalysis(density);

    toast({
      title: "Basic Keyword Extraction Complete",
      description: `Extracted ${keywords.length} keywords. Consider using AI extraction for better results.`,
    });
  };

  const handleJobDescriptionUpload = (uploadedJobDescription: string, uploadedKeywords: string[]) => {
    setJobDescription(uploadedJobDescription);
    setExtractedKeywords(uploadedKeywords);
    onKeywordsUpdate(uploadedKeywords);

    // Analyze current resume with uploaded keywords
    const resumeText = [
      resumeData.summary,
      ...resumeData.experience.flatMap(exp => exp.description),
      ...resumeData.skills.map(skill => skill.name)
    ].join(' ');

    const density = analyzeKeywordDensity(resumeText, uploadedKeywords);
    setAnalysis(density);
  };

  const getMatchPercentage = () => {
    if (extractedKeywords.length === 0) return 0;
    const matched = extractedKeywords.filter(keyword => analysis[keyword] > 0).length;
    return Math.round((matched / extractedKeywords.length) * 100);
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
            <span>AI-Powered Keyword Analyzer</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload" className="flex items-center space-x-2">
                <Upload className="h-4 w-4" />
                <span>Upload File</span>
              </TabsTrigger>
              <TabsTrigger value="paste" className="flex items-center space-x-2">
                <Type className="h-4 w-4" />
                <span>Paste Text</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="upload" className="mt-4">
              <JobDescriptionUploader onJobDescriptionExtracted={handleJobDescriptionUpload} />
            </TabsContent>
            
            <TabsContent value="paste" className="mt-4 space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Paste the job description here:
                </label>
                <Textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the complete job description to extract relevant keywords using AI analysis..."
                  rows={8}
                  className="resize-none"
                />
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  onClick={extractKeywordsWithAI}
                  disabled={!jobDescription.trim() || isExtractingKeywords}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {isExtractingKeywords ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      AI Analyzing...
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4 mr-2" />
                      Extract with AI
                    </>
                  )}
                </Button>
                
                <Button 
                  onClick={extractKeywordsBasic}
                  disabled={!jobDescription.trim() || isExtractingKeywords}
                  variant="outline"
                  className="flex-1"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Basic Extract
                </Button>
              </div>
              
              <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded">
                <strong>💡 AI vs Basic Extraction:</strong> AI extraction provides more accurate, context-aware keywords and identifies industry-specific terms, while basic extraction uses simple frequency analysis.
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {extractedKeywords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span>Keyword Match Analysis</span>
              </div>
              <Badge 
                variant={getMatchPercentage() >= 70 ? 'default' : 'destructive'}
                className={`${getMatchPercentage() >= 70 ? 'bg-green-100 text-green-800' : ''}`}
              >
                <span className={getMatchColor(getMatchPercentage())}>
                  {getMatchPercentage()}% Match
                </span>
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Keyword Coverage</span>
                <span className={getMatchColor(getMatchPercentage())}>
                  {getMatchPercentage()}%
                </span>
              </div>
              <Progress 
                value={getMatchPercentage()} 
                className="h-3"
              />
            </div>

            <div>
              <h4 className="font-medium mb-3 flex items-center space-x-2">
                <span>Extracted Keywords</span>
                <span className="text-xs text-gray-500">({extractedKeywords.length} total)</span>
              </h4>
              <div className="flex flex-wrap gap-2">
                {extractedKeywords.map((keyword) => (
                  <Badge
                    key={keyword}
                    variant={analysis[keyword] > 0 ? 'default' : 'outline'}
                    className={`${
                      analysis[keyword] > 0 
                        ? 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200' 
                        : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                    } transition-colors`}
                  >
                    {keyword}
                    {analysis[keyword] > 0 && (
                      <span className="ml-1 text-xs font-bold">({analysis[keyword]})</span>
                    )}
                  </Badge>
                ))}
              </div>
            </div>

            {getMatchPercentage() < 70 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h5 className="font-medium text-orange-800 mb-2">Improvement Recommendations</h5>
                    <ul className="text-sm text-orange-700 space-y-1">
                      <li>• <strong>Missing Keywords:</strong> Add highlighted keywords to your experience descriptions</li>
                      <li>• <strong>Skills Section:</strong> Include relevant technical and soft skills from the job posting</li>
                      <li>• <strong>Professional Summary:</strong> Incorporate key terms naturally in your summary</li>
                      <li>• <strong>ATS Optimization:</strong> Ensure keywords appear in context throughout your resume</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {getMatchPercentage() >= 70 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <Target className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h5 className="font-medium text-green-800 mb-2">Great Job! Strong Keyword Match</h5>
                    <p className="text-sm text-green-700">
                      Your resume has excellent keyword coverage. This should help with ATS systems and recruiter searches.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
