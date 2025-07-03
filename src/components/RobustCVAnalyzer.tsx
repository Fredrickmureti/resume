import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, Zap, Loader2, AlertCircle, RefreshCw, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { GeminiAIService } from '@/services/geminiAI';
import { FileExtractor } from '@/utils/fileExtractor';
import { ResumeData } from '@/types/resume';
import { normalizeResumeDataDates } from '@/utils/dateNormalizer';

interface RobustCVAnalyzerProps {
  onAnalysisComplete: (data: ResumeData) => void;
}

interface AnalysisAttempt {
  attempt: number;
  status: 'pending' | 'success' | 'failed';
  error?: string;
  timestamp: Date;
}

export const RobustCVAnalyzer: React.FC<RobustCVAnalyzerProps> = ({ onAnalysisComplete }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [currentCV, setCurrentCV] = useState('');
  const [extractedContent, setExtractedContent] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisAttempts, setAnalysisAttempts] = useState<AnalysisAttempt[]>([]);
  const [currentAttempt, setCurrentAttempt] = useState(0);
  const [maxRetries] = useState(3);
  const [retryDelay, setRetryDelay] = useState(1000);

  const validateContent = (content: string): { isValid: boolean; reason?: string } => {
    if (!content || content.trim().length === 0) {
      return { isValid: false, reason: 'No content provided' };
    }
    
    if (content.length < 100) {
      return { isValid: false, reason: 'Content too short (minimum 100 characters required)' };
    }
    
    // Check for common CV/Resume indicators
    const cvIndicators = [
      /name/i, /email/i, /phone/i, /experience/i, /education/i, 
      /skills/i, /work/i, /employment/i, /university/i, /college/i,
      /project/i, /certification/i, /qualification/i
    ];
    
    const hasIndicators = cvIndicators.some(indicator => indicator.test(content));
    if (!hasIndicators) {
      return { 
        isValid: false, 
        reason: 'Content does not appear to be a CV/Resume. Please ensure it contains typical CV sections like experience, education, or skills.' 
      };
    }
    
    return { isValid: true };
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
        description: "Please upload a PDF, DOC, DOCX, or TXT file.",
        variant: "destructive"
      });
      return;
    }
    
    setFile(uploadedFile);
    setIsExtracting(true);
    setExtractedContent('');
    setCurrentCV('');
    
    try {
      console.log('Starting file extraction for:', uploadedFile.name);
      const extractedText = await FileExtractor.extractContent(uploadedFile);
      
      const validation = validateContent(extractedText);
      if (!validation.isValid) {
        throw new Error(validation.reason);
      }
      
      setExtractedContent(extractedText);
      setCurrentCV(extractedText);
      
      console.log('Successfully extracted content. Length:', extractedText.length);
      
      toast({
        title: "CV Content Extracted Successfully",
        description: `Extracted ${extractedText.length} characters. Content validated and ready for analysis.`,
      });
      
    } catch (error) {
      console.error('File extraction error:', error);
      toast({
        title: "File Extraction Failed",
        description: error instanceof Error ? error.message : "Could not extract content from the file. Please try again or paste your CV content manually.",
        variant: "destructive"
      });
      setFile(null);
      setExtractedContent('');
      setCurrentCV('');
    } finally {
      setIsExtracting(false);
    }
  };

  const analyzeWithRetry = async (content: string, attemptNumber: number = 1): Promise<ResumeData> => {
    const attempt: AnalysisAttempt = {
      attempt: attemptNumber,
      status: 'pending',
      timestamp: new Date()
    };
    
    setAnalysisAttempts(prev => [...prev, attempt]);
    setCurrentAttempt(attemptNumber);

    try {
      console.log(`Analysis attempt ${attemptNumber}/${maxRetries}...`);
      
      // Add slight delay for retry attempts
      if (attemptNumber > 1) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * attemptNumber));
      }
      
      const aiResponse = await GeminiAIService.extractCompleteResumeData(content);
      
      // Validate AI response
      if (!aiResponse.extractedData || 
          (!aiResponse.extractedData.personalInfo?.fullName && 
           (!aiResponse.extractedData.experience || aiResponse.extractedData.experience.length === 0))) {
        throw new Error('AI analysis did not extract meaningful data from your CV');
      }

      // Mark attempt as successful
      setAnalysisAttempts(prev => 
        prev.map(a => a.attempt === attemptNumber ? { ...a, status: 'success' } : a)
      );

      // Create structured data with proper date normalization
      const structuredData: ResumeData = {
        personalInfo: {
          fullName: aiResponse.extractedData.personalInfo?.fullName || '',
          email: aiResponse.extractedData.personalInfo?.email || '',
          phone: aiResponse.extractedData.personalInfo?.phone || '',
          location: aiResponse.extractedData.personalInfo?.location || '',
          linkedIn: aiResponse.extractedData.personalInfo?.linkedIn || '',
          website: aiResponse.extractedData.personalInfo?.website || ''
        },
        summary: aiResponse.suggestions.summary || '',
        experience: (aiResponse.extractedData.experience || []).map((exp: any, index: number) => ({
          id: `exp-${index}-${Date.now()}`,
          jobTitle: exp.jobTitle || '',
          company: exp.company || '',
          location: exp.location || '',
          startDate: exp.startDate || '',
          endDate: exp.endDate || (exp.current ? 'Present' : ''),
          current: exp.current || false,
          description: Array.isArray(exp.description) ? exp.description : []
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
          ...(aiResponse.suggestions.skills.technical || []).map((skill: string, index: number) => ({
            id: `tech-${index}-${Date.now()}`,
            name: skill,
            level: 'Intermediate' as const,
            category: 'Technical' as const
          })),
          ...(aiResponse.suggestions.skills.soft || []).map((skill: string, index: number) => ({
            id: `soft-${index}-${Date.now()}`,
            name: skill,
            level: 'Advanced' as const,
            category: 'Soft' as const
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
        keywords: aiResponse.suggestions.keywords || []
      };
      
      // Normalize all dates in the structured data
      const normalizedData = normalizeResumeDataDates(structuredData);
      
      console.log('Structured data with normalized dates:', normalizedData);
      
      return normalizedData;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error(`Analysis attempt ${attemptNumber} failed:`, errorMessage);
      
      // Mark attempt as failed
      setAnalysisAttempts(prev => 
        prev.map(a => a.attempt === attemptNumber ? { ...a, status: 'failed', error: errorMessage } : a)
      );

      // If we haven't reached max retries, try again
      if (attemptNumber < maxRetries) {
        toast({
          title: `Analysis Attempt ${attemptNumber} Failed`,
          description: `Retrying... (${attemptNumber + 1}/${maxRetries})`,
        });
        return analyzeWithRetry(content, attemptNumber + 1);
      } else {
        // All attempts failed
        throw new Error(`Analysis failed after ${maxRetries} attempts. Last error: ${errorMessage}`);
      }
    }
  };

  const analyzeCV = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to use the CV Analysis feature.",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }

    const contentToAnalyze = extractedContent || currentCV.trim();
    
    // Validate content before analysis
    const validation = validateContent(contentToAnalyze);
    if (!validation.isValid) {
      toast({
        title: "Content Validation Failed",
        description: validation.reason,
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    setAnalysisAttempts([]);
    setCurrentAttempt(0);
    
    try {
      const structuredData = await analyzeWithRetry(contentToAnalyze);
      
      toast({
        title: "CV Analysis Complete!",
        description: `Successfully extracted and analyzed your CV data in ${currentAttempt} attempt(s).`,
      });
      
      onAnalysisComplete(structuredData);
      
      // Reset state
      setFile(null);
      setCurrentCV('');
      setExtractedContent('');
      setAnalysisAttempts([]);
      
    } catch (error) {
      console.error('All analysis attempts failed:', error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Analysis failed after multiple attempts. Please check your CV content and try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
      setCurrentAttempt(0);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Upload className="h-5 w-5 text-blue-600" />
          <span>Robust CV Analysis</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!user && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-yellow-800 text-center">
              <AlertCircle className="h-4 w-4 inline mr-2" />
              Sign in to access AI-powered CV analysis features.
            </p>
            <Button 
              onClick={() => navigate('/auth')} 
              className="w-full mt-2" 
              size="sm"
            >
              Sign In Now
            </Button>
          </div>
        )}
        
        <div>
          <label className="text-sm font-medium mb-2 block">
            Upload Your CV (PDF, DOC, DOCX, TXT)
          </label>
          <Input
            type="file"
            accept=".pdf,.txt,.doc,.docx"
            onChange={handleFileUpload}
            className="cursor-pointer"
            disabled={isExtracting || !user}
          />
          {isExtracting && (
            <div className="mt-2 flex items-center text-sm text-blue-600">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Extracting and validating content from your CV...
            </div>
          )}
          {file && extractedContent && !isExtracting && (
            <div className="mt-2 space-y-1">
              <p className="text-sm text-green-600 flex items-center">
                <CheckCircle className="h-4 w-4 mr-1" />
                {file.name} - Content validated and ready for analysis
              </p>
              <p className="text-xs text-gray-500">
                {extractedContent.length} characters extracted
              </p>
            </div>
          )}
        </div>

        <div className="text-center text-gray-500">
          <span>OR</span>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">
            Paste Your CV Content
          </label>
          <Textarea
            value={currentCV}
            onChange={(e) => setCurrentCV(e.target.value)}
            placeholder="Paste your complete CV content here..."
            className="min-h-32"
            disabled={!user}
          />
        </div>

        {isAnalyzing && analysisAttempts.length > 0 && (
          <div className="space-y-3">
            <div className="text-center">
              <p className="text-sm font-medium">Analysis in Progress</p>
              <p className="text-xs text-gray-600">
                Attempt {currentAttempt} of {maxRetries}
              </p>
            </div>
            <div className="space-y-2">
              {analysisAttempts.map((attempt, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm">
                  <div className="flex items-center space-x-1">
                    {attempt.status === 'pending' && <Loader2 className="h-3 w-3 animate-spin text-blue-500" />}
                    {attempt.status === 'success' && <CheckCircle className="h-3 w-3 text-green-500" />}
                    {attempt.status === 'failed' && <AlertCircle className="h-3 w-3 text-red-500" />}
                    <span>Attempt {attempt.attempt}</span>
                  </div>
                  {attempt.status === 'failed' && attempt.error && (
                    <span className="text-xs text-red-600 truncate">{attempt.error}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <Button 
          onClick={analyzeCV}
          disabled={isAnalyzing || (!extractedContent && !currentCV.trim()) || isExtracting || !user}
          className="w-full"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Analyzing CV with Enhanced Date Processing...
            </>
          ) : !user ? (
            'Sign In to Analyze CV'
          ) : (
            <>
              <Zap className="h-4 w-4 mr-2" />
              Analyze CV with AI
            </>
          )}
        </Button>

        <div className="text-xs text-gray-500 space-y-1">
          <p>✓ Automatic retry logic with exponential backoff</p>
          <p>✓ Enhanced date normalization and formatting</p>
          <p>✓ Content validation and error handling</p>
          <p>✓ Progressive analysis with detailed feedback</p>
        </div>
      </CardContent>
    </Card>
  );
};
