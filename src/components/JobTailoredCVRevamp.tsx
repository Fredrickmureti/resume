
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Upload, FileText, Briefcase, Zap, CheckCircle, Loader2, RefreshCw, Target } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { GeminiAIService } from '@/services/geminiAI';
import { FileExtractor } from '@/utils/fileExtractor';
import { ResumeData } from '@/types/resume';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface JobTailoredRevampSuggestion {
  type: 'match' | 'optimization' | 'keyword' | 'structure';
  section: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  matchScore?: number;
  suggestedContent?: string;
}

interface JobTailoredCVRevampProps {
  onRevampedDataApply?: (data: ResumeData) => void;
}

export const JobTailoredCVRevamp: React.FC<JobTailoredCVRevampProps> = ({ onRevampedDataApply }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // CV Upload States
  const [cvFile, setCVFile] = useState<File | null>(null);
  const [cvContent, setCVContent] = useState('');
  const [isExtractingCV, setIsExtractingCV] = useState(false);
  const [extractedCVContent, setExtractedCVContent] = useState('');

  // Job Description States
  const [jobFile, setJobFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [jobType, setJobType] = useState('');
  const [targetCompany, setTargetCompany] = useState('');
  const [isExtractingJob, setIsExtractingJob] = useState(false);
  const [extractedJobContent, setExtractedJobContent] = useState('');

  // Analysis States
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState<JobTailoredRevampSuggestion[]>([]);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [tailoredResumeData, setTailoredResumeData] = useState<ResumeData | null>(null);
  const [isApplyingRevamp, setIsApplyingRevamp] = useState(false);
  const [matchScore, setMatchScore] = useState<number>(0);

  const handleCVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (!uploadedFile) return;

    // Validate file type
    const validTypes = ['application/pdf', 'text/plain'];
    const validExtensions = ['.pdf', '.doc', '.docx', '.txt'];
    const fileName = uploadedFile.name.toLowerCase();
    
    const isValidType = validTypes.some(type => uploadedFile.type.includes(type)) ||
                       uploadedFile.type.includes('officedocument') ||
                       uploadedFile.type.includes('msword');
    
    const isValidExtension = validExtensions.some(ext => fileName.endsWith(ext));
    
    if (!isValidType && !isValidExtension) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a PDF, DOC, DOCX, or TXT file for your CV.",
        variant: "destructive"
      });
      return;
    }
    
    setCVFile(uploadedFile);
    setIsExtractingCV(true);
    
    try {
      console.log('Extracting CV content from:', uploadedFile.name);
      const extractedText = await FileExtractor.extractContent(uploadedFile);
      
      if (!extractedText || extractedText.length < 50) {
        throw new Error('CV content is too short or empty. Please ensure your CV contains readable text.');
      }
      
      setExtractedCVContent(extractedText);
      setCVContent(extractedText);
      
      console.log('CV content extracted successfully. Length:', extractedText.length);
      
      toast({
        title: "CV Content Extracted Successfully",
        description: `Extracted ${extractedText.length} characters from your CV. Ready for analysis.`,
      });
      
    } catch (error) {
      console.error('CV extraction error:', error);
      toast({
        title: "CV Extraction Failed",
        description: error instanceof Error ? error.message : "Could not extract content from CV file.",
        variant: "destructive"
      });
      setCVFile(null);
      setExtractedCVContent('');
      setCVContent('');
    } finally {
      setIsExtractingCV(false);
    }
  };

  const handleJobDescriptionUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (!uploadedFile) return;

    // Validate file type
    const validTypes = ['application/pdf', 'text/plain'];
    const validExtensions = ['.pdf', '.doc', '.docx', '.txt'];
    const fileName = uploadedFile.name.toLowerCase();
    
    const isValidType = validTypes.some(type => uploadedFile.type.includes(type)) ||
                       uploadedFile.type.includes('officedocument') ||
                       uploadedFile.type.includes('msword');
    
    const isValidExtension = validExtensions.some(ext => fileName.endsWith(ext));
    
    if (!isValidType && !isValidExtension) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a PDF, DOC, DOCX, or TXT file for the job description.",
        variant: "destructive"
      });
      return;
    }
    
    setJobFile(uploadedFile);
    setIsExtractingJob(true);
    
    try {
      console.log('Extracting job description from:', uploadedFile.name);
      const extractedText = await FileExtractor.extractContent(uploadedFile);
      
      if (!extractedText || extractedText.length < 30) {
        throw new Error('Job description content is too short or empty.');
      }
      
      setExtractedJobContent(extractedText);
      setJobDescription(extractedText);
      
      console.log('Job description extracted successfully. Length:', extractedText.length);
      
      toast({
        title: "Job Description Extracted Successfully",
        description: `Extracted ${extractedText.length} characters from job description file.`,
      });
      
    } catch (error) {
      console.error('Job description extraction error:', error);
      toast({
        title: "Job Description Extraction Failed",
        description: error instanceof Error ? error.message : "Could not extract content from job description file.",
        variant: "destructive"
      });
      setJobFile(null);
      setExtractedJobContent('');
      setJobDescription('');
    } finally {
      setIsExtractingJob(false);
    }
  };

  const analyzeJobTailoredCV = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to use the Job-Tailored CV Revamp feature.",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }

    const cvContentToAnalyze = extractedCVContent || cvContent.trim();
    const jobContentToAnalyze = extractedJobContent || jobDescription.trim();
    
    if (!cvContentToAnalyze) {
      toast({
        title: "No CV Content",
        description: "Please upload a CV file or paste your CV content first.",
        variant: "destructive"
      });
      return;
    }

    if (!jobContentToAnalyze && !jobTitle && !jobType) {
      toast({
        title: "No Job Information",
        description: "Please provide job description, job title, or job type for tailoring.",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      console.log('Starting job-tailored CV analysis...');
      console.log('CV content length:', cvContentToAnalyze.length);
      console.log('Job content length:', jobContentToAnalyze.length);
      
      // Create comprehensive job context
      const jobContext = {
        jobDescription: jobContentToAnalyze,
        jobTitle: jobTitle,
        jobType: jobType,
        targetCompany: targetCompany,
        extractedJobContent: extractedJobContent
      };

      // Use the job-tailored CV analysis method
      const aiResponse = await GeminiAIService.analyzeJobTailoredCV(cvContentToAnalyze, jobContext);
      
      console.log('Job-tailored AI Response received:', aiResponse);

      // Validate response
      if (!aiResponse.extractedData || !aiResponse.suggestions) {
        throw new Error('AI failed to analyze your CV for job tailoring. Please try again.');
      }

      // Process job-tailored suggestions
      const processedSuggestions: JobTailoredRevampSuggestion[] = [];

      // Job Match Analysis
      if (aiResponse.suggestions.matchScore !== undefined) {
        setMatchScore(aiResponse.suggestions.matchScore);
        processedSuggestions.push({
          type: 'match',
          section: 'Overall Match',
          title: `${aiResponse.suggestions.matchScore}% Job Match Score`,
          description: `Your CV matches ${aiResponse.suggestions.matchScore}% of the job requirements. AI has optimized it for better alignment.`,
          priority: aiResponse.suggestions.matchScore > 70 ? 'low' : 'high',
          matchScore: aiResponse.suggestions.matchScore
        });
      }

      // Professional Summary Optimization
      if (aiResponse.suggestions.optimizedSummary) {
        processedSuggestions.push({
          type: 'optimization',
          section: 'Professional Summary',
          title: 'Job-Tailored Professional Summary',
          description: 'AI-optimized professional summary specifically tailored to match the job requirements and company culture.',
          priority: 'high',
          suggestedContent: aiResponse.suggestions.optimizedSummary
        });
      }

      // Keywords Analysis
      if (aiResponse.suggestions.missingKeywords && aiResponse.suggestions.missingKeywords.length > 0) {
        processedSuggestions.push({
          type: 'keyword',
          section: 'Keywords',
          title: `${aiResponse.suggestions.missingKeywords.length} Key Job Keywords Missing`,
          description: `Important keywords from job description: ${aiResponse.suggestions.missingKeywords.slice(0, 5).join(', ')}${aiResponse.suggestions.missingKeywords.length > 5 ? '...' : ''}`,
          priority: 'high'
        });
      }

      // Experience Optimization
      if (aiResponse.extractedData.experience && aiResponse.extractedData.experience.length > 0) {
        aiResponse.extractedData.experience.forEach((exp: any, index: number) => {
          processedSuggestions.push({
            type: 'optimization',
            section: 'Experience',
            title: `Optimized: ${exp.jobTitle} at ${exp.company}`,
            description: `AI-enhanced experience bullets with job-specific keywords and quantified achievements.`,
            priority: 'high'
          });
        });
      }

      // Skills Optimization
      if (aiResponse.suggestions.recommendedSkills && aiResponse.suggestions.recommendedSkills.length > 0) {
        processedSuggestions.push({
          type: 'optimization',
          section: 'Skills',
          title: `${aiResponse.suggestions.recommendedSkills.length} Job-Specific Skills Added`,
          description: `Recommended skills: ${aiResponse.suggestions.recommendedSkills.slice(0, 5).join(', ')}${aiResponse.suggestions.recommendedSkills.length > 5 ? '...' : ''}`,
          priority: 'medium'
        });
      }

      // ATS Optimization
      if (aiResponse.suggestions.atsOptimizations && Array.isArray(aiResponse.suggestions.atsOptimizations)) {
        aiResponse.suggestions.atsOptimizations.forEach((optimization: string, index: number) => {
          processedSuggestions.push({
            type: 'structure',
            section: 'ATS Optimization',
            title: `ATS Enhancement ${index + 1}`,
            description: optimization,
            priority: 'medium'
          });
        });
      }

      setSuggestions(processedSuggestions);
      
      // Create job-tailored structured data
      const jobTailoredData: ResumeData = {
        personalInfo: {
          fullName: aiResponse.extractedData.personalInfo?.fullName || '',
          email: aiResponse.extractedData.personalInfo?.email || '',
          phone: aiResponse.extractedData.personalInfo?.phone || '',
          location: aiResponse.extractedData.personalInfo?.location || '',
          linkedIn: aiResponse.extractedData.personalInfo?.linkedIn || '',
          website: aiResponse.extractedData.personalInfo?.website || ''
        },
        summary: aiResponse.suggestions.optimizedSummary || aiResponse.extractedData.summary || '',
        experience: (aiResponse.extractedData.experience || []).map((exp: any, index: number) => ({
          id: `exp-${index}-${Date.now()}`,
          jobTitle: exp.jobTitle || '',
          company: exp.company || '',
          location: exp.location || '',
          startDate: exp.startDate || '',
          endDate: exp.endDate || exp.current ? 'Present' : '',
          current: exp.current || false,
          description: Array.isArray(exp.optimizedDescription) ? exp.optimizedDescription : 
                      Array.isArray(exp.description) ? exp.description : []
        })),
        education: (aiResponse.extractedData.education || []).map((edu: any, index: number) => ({
          id: `edu-${index}-${Date.now()}`,
          degree: edu.degree || '',
          school: edu.school || '',
          location: edu.location || '',
          graduationDate: edu.graduationDate || '',
          gpa: edu.gpa || '',
          honors: edu.honors || ''
        })),
        skills: [
          ...(aiResponse.suggestions.recommendedSkills || []).map((skill: string, index: number) => ({
            id: `job-skill-${index}-${Date.now()}`,
            name: skill,
            level: 'Advanced' as const,
            category: 'Technical' as const
          })),
          ...(aiResponse.extractedData.skills || []).map((skill: any, index: number) => ({
            id: `skill-${index}-${Date.now()}`,
            name: typeof skill === 'string' ? skill : skill.name,
            level: (skill.level as any) || 'Intermediate' as const,
            category: (skill.category as any) || 'Technical' as const
          }))
        ],
        projects: (aiResponse.extractedData.projects || []).map((project: any, index: number) => ({
          id: `proj-${index}-${Date.now()}`,
          name: project.name || '',
          description: project.description || '',
          technologies: Array.isArray(project.technologies) ? project.technologies : [],
          url: project.url || '',
          startDate: project.startDate || '',
          endDate: project.endDate || ''
        })),
        certifications: (aiResponse.extractedData.certifications || []).map((cert: any, index: number) => ({
          id: `cert-${index}-${Date.now()}`,
          name: cert.name || '',
          issuer: cert.issuer || '',
          date: cert.date || '',
          url: cert.url || ''
        })),
        languages: (aiResponse.extractedData.languages || []).map((lang: any, index: number) => ({
          id: `lang-${index}-${Date.now()}`,
          name: lang.name || '',
          proficiency: (lang.proficiency as any) || 'Conversational'
        })),
        references: [],
        keywords: [
          ...(aiResponse.suggestions.recommendedKeywords || []),
          ...(aiResponse.suggestions.missingKeywords || [])
        ]
      };
      
      console.log('Job-tailored structured data created:', jobTailoredData);
      setTailoredResumeData(jobTailoredData);
      setAnalysisComplete(true);
      
      toast({
        title: "Job-Tailored CV Analysis Complete!",
        description: `Successfully analyzed and optimized your CV for the target job. Match score: ${aiResponse.suggestions.matchScore || 0}%`,
      });
      
    } catch (error) {
      console.error('Error in job-tailored CV analysis:', error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "There was an error analyzing your CV for the job. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const applyJobTailoredRevamp = async () => {
    if (!tailoredResumeData || !onRevampedDataApply) {
      toast({
        title: "No Data to Apply",
        description: "Please analyze your CV first to get job-tailored suggestions.",
        variant: "destructive"
      });
      return;
    }

    setIsApplyingRevamp(true);
    
    try {
      console.log('Applying job-tailored data:', tailoredResumeData);
      
      // Apply the job-tailored data
      onRevampedDataApply(tailoredResumeData);
      
      toast({
        title: "Job-Tailored CV Applied Successfully!",
        description: `Your resume has been optimized for the target job with a ${matchScore}% match score. Ready to download!`,
      });
      
      // Reset the state
      setAnalysisComplete(false);
      setSuggestions([]);
      setCVFile(null);
      setJobFile(null);
      setCVContent('');
      setJobDescription('');
      setJobTitle('');
      setJobType('');
      setTargetCompany('');
      setTailoredResumeData(null);
      setExtractedCVContent('');
      setExtractedJobContent('');
      setMatchScore(0);
      
    } catch (error) {
      console.error('Error applying job-tailored revamp:', error);
      toast({
        title: "Application Failed",
        description: "There was an error applying the job-tailored suggestions. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsApplyingRevamp(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'match': return <Target className="h-4 w-4" />;
      case 'optimization': return <Zap className="h-4 w-4" />;
      case 'keyword': return <FileText className="h-4 w-4" />;
      case 'structure': return <CheckCircle className="h-4 w-4" />;
      default: return <Briefcase className="h-4 w-4" />;
    }
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-blue-600" />
            <span>Job-Tailored CV Optimization</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {!analysisComplete && (
            <>
              {/* CV Upload Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Step 1: Upload Your CV</h3>
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Upload Your CV (PDF, DOC, DOCX, TXT)
                  </Label>
                  <Input
                    type="file"
                    accept=".pdf,.txt,.doc,.docx"
                    onChange={handleCVUpload}
                    className="cursor-pointer"
                    disabled={isExtractingCV}
                  />
                  {isExtractingCV && (
                    <div className="mt-2 flex items-center text-sm text-blue-600">
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Extracting CV content...
                    </div>
                  )}
                  {cvFile && extractedCVContent && !isExtractingCV && (
                    <div className="mt-2 space-y-1">
                      <p className="text-sm text-green-600 flex items-center">
                        <FileText className="h-4 w-4 mr-1" />
                        {cvFile.name} - Content extracted successfully
                      </p>
                      <p className="text-xs text-gray-500">
                        {extractedCVContent.length} characters extracted
                      </p>
                    </div>
                  )}
                </div>

                <div className="text-center text-gray-500">
                  <span>OR</span>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Paste Your CV Content
                  </Label>
                  <Textarea
                    value={cvContent}
                    onChange={(e) => setCVContent(e.target.value)}
                    placeholder="Paste your complete CV content here..."
                    className="min-h-32"
                  />
                </div>
              </div>

              {/* Job Information Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Step 2: Provide Job Information</h3>
                
                <Tabs defaultValue="upload" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="upload">Upload Job Description</TabsTrigger>
                    <TabsTrigger value="manual">Enter Job Details</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="upload" className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium mb-2 block">
                        Upload Job Description (PDF, DOC, DOCX, TXT)
                      </Label>
                      <Input
                        type="file"
                        accept=".pdf,.txt,.doc,.docx"
                        onChange={handleJobDescriptionUpload}
                        className="cursor-pointer"
                        disabled={isExtractingJob}
                      />
                      {isExtractingJob && (
                        <div className="mt-2 flex items-center text-sm text-blue-600">
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Extracting job description...
                        </div>
                      )}
                      {jobFile && extractedJobContent && !isExtractingJob && (
                        <div className="mt-2 space-y-1">
                          <p className="text-sm text-green-600 flex items-center">
                            <FileText className="h-4 w-4 mr-1" />
                            {jobFile.name} - Content extracted successfully
                          </p>
                          <p className="text-xs text-gray-500">
                            {extractedJobContent.length} characters extracted
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="text-center text-gray-500">
                      <span>OR</span>
                    </div>

                    <div>
                      <Label className="text-sm font-medium mb-2 block">
                        Paste Job Description
                      </Label>
                      <Textarea
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        placeholder="Paste the complete job description here..."
                        className="min-h-32"
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="manual" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium mb-2 block">
                          Job Title
                        </Label>
                        <Input
                          value={jobTitle}
                          onChange={(e) => setJobTitle(e.target.value)}
                          placeholder="e.g., Senior Software Engineer"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium mb-2 block">
                          Job Type/Industry
                        </Label>
                        <Input
                          value={jobType}
                          onChange={(e) => setJobType(e.target.value)}
                          placeholder="e.g., Technology, Healthcare, Finance"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium mb-2 block">
                        Target Company (Optional)
                      </Label>
                      <Input
                        value={targetCompany}
                        onChange={(e) => setTargetCompany(e.target.value)}
                        placeholder="e.g., Google, Microsoft, startup"
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              <Button 
                onClick={analyzeJobTailoredCV}
                disabled={isAnalyzing || (!extractedCVContent && !cvContent.trim()) || isExtractingCV || isExtractingJob}
                className="w-full"
                size="lg"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    AI is tailoring your CV to the job...
                  </>
                ) : (
                  <>
                    <Target className="h-4 w-4 mr-2" />
                    Analyze & Tailor CV to Job
                  </>
                )}
              </Button>
            </>
          )}

          {analysisComplete && suggestions.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Job-Tailored Analysis Results</h3>
                  {matchScore > 0 && (
                    <p className={`text-2xl font-bold ${getMatchScoreColor(matchScore)}`}>
                      {matchScore}% Job Match Score
                    </p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={applyJobTailoredRevamp}
                    disabled={isApplyingRevamp}
                    className="bg-green-600 hover:bg-green-700"
                    size="lg"
                  >
                    {isApplyingRevamp ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Applying Tailored CV...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Apply Job-Tailored CV
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setAnalysisComplete(false);
                      setSuggestions([]);
                      setCVFile(null);
                      setJobFile(null);
                      setCVContent('');
                      setJobDescription('');
                      setJobTitle('');
                      setJobType('');
                      setTargetCompany('');
                      setTailoredResumeData(null);
                      setExtractedCVContent('');
                      setExtractedJobContent('');
                      setMatchScore(0);
                    }}
                  >
                    Start Over
                  </Button>
                </div>
              </div>

              {tailoredResumeData && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">🎯 Job-Tailored Optimization Summary</h4>
                  <div className="text-sm text-blue-800 grid grid-cols-2 gap-2">
                    <div>• Match Score: {matchScore}% compatibility</div>
                    <div>• Professional Summary: ✓ Optimized</div>
                    <div>• Work Experience: {tailoredResumeData.experience.length} positions</div>
                    <div>• Skills: {tailoredResumeData.skills.length} targeted skills</div>
                    <div>• Keywords: {tailoredResumeData.keywords.length} job-specific terms</div>
                    <div>• ATS Optimization: ✓ Applied</div>
                  </div>
                </div>
              )}

              <div className="grid gap-4">
                {suggestions.map((suggestion, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getTypeIcon(suggestion.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-medium text-gray-900">{suggestion.title}</h4>
                          <Badge className={getPriorityColor(suggestion.priority)}>
                            {suggestion.priority} priority
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {suggestion.section}
                          </Badge>
                          {suggestion.matchScore && (
                            <Badge variant="outline" className={`text-xs ${getMatchScoreColor(suggestion.matchScore)}`}>
                              {suggestion.matchScore}% match
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{suggestion.description}</p>
                        {suggestion.suggestedContent && (
                          <div className="bg-gray-50 p-2 rounded text-xs">
                            <strong>AI Optimized Content:</strong> 
                            <p className="mt-1">{suggestion.suggestedContent.substring(0, 300)}...</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
