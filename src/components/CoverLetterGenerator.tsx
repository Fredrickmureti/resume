
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ResumeData } from '@/types/resume';
import { FileText, Wand2, Loader2, Copy, Download, RefreshCw, Clock, AlertTriangle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useJobQueue } from '@/hooks/useJobQueue';
import { useRateLimit } from '@/hooks/useRateLimit';
import { useThrottle } from '@/hooks/useThrottle';
import { supabase } from '@/integrations/supabase/client';
import { CoverLetterService } from '@/services/coverLetterService';

interface CoverLetterGeneratorProps {
  resumeData: ResumeData;
}

type ToneType = 'formal' | 'friendly' | 'bold' | 'enthusiastic' | 'professional' | 'conversational';

const toneDescriptions = {
  formal: 'Traditional, respectful, and corporate-appropriate',
  friendly: 'Warm, approachable, and personable',
  bold: 'Confident, assertive, and impactful',
  enthusiastic: 'Energetic, passionate, and motivated',
  professional: 'Polished, competent, and business-focused',
  conversational: 'Natural, engaging, and authentic'
};

export const CoverLetterGenerator: React.FC<CoverLetterGeneratorProps> = ({
  resumeData
}) => {
  const { user } = useAuth();
  const { createJob, jobs } = useJobQueue();
  const { checkRateLimit } = useRateLimit('cover-letter');
  const [jobDescription, setJobDescription] = useState('');
  const [selectedTone, setSelectedTone] = useState<ToneType>('professional');
  const [generatedLetter, setGeneratedLetter] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);

  const validateInputs = (): boolean => {
    if (!resumeData.personalInfo.fullName.trim()) {
      toast({
        title: "Resume Required",
        description: "Please add your name to your resume before generating a cover letter.",
        variant: "destructive"
      });
      return false;
    }

    if (!jobDescription.trim()) {
      toast({
        title: "Job Description Required",
        description: "Please paste the job description to generate a tailored cover letter.",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const triggerJobProcessor = async () => {
    try {
      console.log('Triggering job processor...');
      const { data, error } = await supabase.functions.invoke('trigger-job-processor');
      
      if (error) {
        console.error('Error triggering job processor:', error);
      } else {
        console.log('Job processor triggered successfully:', data);
      }
    } catch (error) {
      console.error('Failed to trigger job processor:', error);
    }
  };

  const throttledGenerate = useThrottle(async () => {
    if (!user) {
      toast({
        title: "Premium Feature",
        description: "Please sign in to generate cover letters.",
        variant: "destructive"
      });
      return;
    }

    if (!validateInputs()) {
      return;
    }

    // Check rate limit first
    const canProceed = await checkRateLimit();
    if (!canProceed) {
      return;
    }

    setIsGenerating(true);
    
    try {
      // Create job for background processing
      const job = await createJob('cover_letter_generation', {
        resumeData,
        jobDescription,
        tone: selectedTone
      }, 1);

      if (!job) {
        throw new Error('Failed to create job');
      }

      setCurrentJobId(job.id);
      
      // Immediately trigger job processing
      await triggerJobProcessor();
      
      // Set up a fallback trigger after 2 seconds
      setTimeout(async () => {
        await triggerJobProcessor();
      }, 2000);
      
      // Set up another fallback trigger after 5 seconds
      setTimeout(async () => {
        await triggerJobProcessor();
      }, 5000);
      
      toast({
        title: "Cover Letter Generation Started",
        description: "Your cover letter is being generated. This should take just a moment.",
      });
      
    } catch (error) {
      console.error('Error creating cover letter job:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to start cover letter generation. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  }, 2000);

  // Save cover letter to database
  const saveCoverLetterToDatabase = async (content: string, jobCompany?: string, jobPosition?: string) => {
    if (!user) return;

    try {
      const title = `Cover Letter - ${jobCompany || 'Unknown Company'} ${jobPosition ? `- ${jobPosition}` : ''}`;
      const coverLetter = await CoverLetterService.createCoverLetter(user.id, {
        title,
        job_description: jobDescription,
        job_company: jobCompany,
        job_position: jobPosition,
        tone: selectedTone,
        content,
        status: 'final'
      });

      if (coverLetter) {
        console.log('Cover letter saved to database:', coverLetter.id);
      }
    } catch (error) {
      console.error('Error saving cover letter to database:', error);
    }
  };

  // Check if current job is completed and extract result
  React.useEffect(() => {
    if (currentJobId) {
      const job = jobs.find(j => j.id === currentJobId);
      if (job && job.status === 'completed' && job.result_data) {
        // Extract clean cover letter text
        const coverLetter = job.result_data.coverLetter || job.result_data.content || '';
        
        // Additional cleanup to ensure no JSON artifacts
        const cleanLetter = typeof coverLetter === 'string' 
          ? coverLetter.replace(/^["']|["']$/g, '').trim()
          : String(coverLetter).trim();
        
        setGeneratedLetter(cleanLetter);
        setCurrentJobId(null);
        
        // Auto-save the generated cover letter to database
        if (cleanLetter.trim()) {
          // Extract company and position from job description
          const lines = jobDescription.split('\n');
          const companyLine = lines.find(line => 
            line.toLowerCase().includes('company:') || 
            line.toLowerCase().includes('organization:') ||
            line.toLowerCase().includes('employer:')
          );
          const positionLine = lines.find(line => 
            line.toLowerCase().includes('position:') || 
            line.toLowerCase().includes('role:') ||
            line.toLowerCase().includes('title:')
          );
          
          const company = companyLine?.split(':')[1]?.trim() || 'Unknown Company';
          const position = positionLine?.split(':')[1]?.trim() || 'Unknown Position';
          
          saveCoverLetterToDatabase(cleanLetter, company, position);
        }
        
        toast({
          title: "Cover Letter Generated!",
          description: "Your cover letter is ready to copy and use, and has been saved to your documents.",
        });
      }
      
      if (job && job.status === 'failed') {
        setCurrentJobId(null);
        
        // Check if it's a quota exceeded error
        const errorMessage = job.error_message || '';
        if (errorMessage.includes('exceeded your current quota') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
          toast({
            title: "API Quota Exceeded",
            description: "The AI service has reached its daily limit. Please try again tomorrow or upgrade your API plan.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Generation Failed",
            description: "Failed to generate cover letter. Please try again.",
            variant: "destructive"
          });
        }
      }
    }
  }, [jobs, currentJobId, user, jobDescription, selectedTone]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedLetter);
      toast({
        title: "Copied!",
        description: "Cover letter copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard. Please select and copy manually.",
        variant: "destructive"
      });
    }
  };

  const downloadAsText = () => {
    const blob = new Blob([generatedLetter], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${resumeData.personalInfo.fullName.replace(/\s+/g, '_')}_Cover_Letter.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Downloaded!",
      description: "Cover letter downloaded as text file.",
    });
  };

  const currentJob = currentJobId ? jobs.find(j => j.id === currentJobId) : null;
  const isJobPending = currentJob && currentJob.status === 'pending';
  const isJobProcessing = currentJob && currentJob.status === 'processing';
  const isJobFailed = currentJob && currentJob.status === 'failed';

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <span>AI Cover Letter Generator</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                Premium AI Feature
              </Badge>
              {(isJobPending || isJobProcessing) && (
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                  <Clock className="h-3 w-3 mr-1" />
                  {isJobPending ? 'Processing...' : 'Writing Letter...'}
                </Badge>
              )}
              {isJobFailed && (
                <Badge variant="destructive" className="bg-red-50 text-red-700">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Failed
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* API Quota Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yellow-800">AI Service Notice</p>
                <p className="text-yellow-700 mt-1">
                  The AI service has a daily usage limit. If generation fails due to quota limits, please try again tomorrow.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Job Description *
              </label>
              <Textarea
                placeholder="Paste the job description here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="min-h-32"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Cover Letter Tone
              </label>
              <Select value={selectedTone} onValueChange={(value) => setSelectedTone(value as ToneType)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select tone" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(toneDescriptions).map(([tone, description]) => (
                    <SelectItem key={tone} value={tone}>
                      <div>
                        <div className="font-medium capitalize">{tone}</div>
                        <div className="text-xs text-gray-500">{description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={throttledGenerate} 
              disabled={isGenerating || isJobPending || isJobProcessing}
              className="w-full"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Starting Generation...
                </>
              ) : isJobPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : isJobProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  AI is Writing Your Cover Letter...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Generate Cover Letter
                </>
              )}
            </Button>
          </div>

          {generatedLetter && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Generated Cover Letter</h4>
                <div className="flex space-x-2">
                  <Button
                    onClick={copyToClipboard}
                    variant="outline"
                    size="sm"
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </Button>
                  <Button
                    onClick={downloadAsText}
                    variant="outline"
                    size="sm"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                  <Button
                    onClick={throttledGenerate}
                    variant="outline"
                    size="sm"
                    disabled={isGenerating || isJobPending || isJobProcessing}
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Regenerate
                  </Button>                
                </div>
              </div>
              
              <div className="border rounded-lg p-6 bg-gray-50 min-h-96 max-h-96 overflow-y-auto">
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {generatedLetter}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
