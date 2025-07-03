import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, Loader2 } from 'lucide-react';
import { GeminiAIService } from '@/services/geminiAI';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useFormState } from '@/contexts/FormStateContext';
import { useNavigate } from 'react-router-dom';

interface SummaryFormProps {
  data: string;
  onChange: (data: string) => void;
  placeholder?: string;
}

export const SummaryForm: React.FC<SummaryFormProps> = ({ data, onChange, placeholder }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { formState, updateFormState } = useFormState();
  const [isGenerating, setIsGenerating] = useState(false);

  const defaultPlaceholder = "Write a compelling summary that highlights your key strengths, experience, and career objectives...";

  const generateAISummary = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to use AI features.",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }

    if (!formState.jobTitle.trim()) {
      toast({
        title: "Job Title Required",
        description: "Please enter your job title to generate an AI summary.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const summary = await GeminiAIService.generateProfessionalSummary(
        formState.jobTitle,
        formState.industry || 'Technology',
        formState.experienceLevel || 'mid-level'
      );
      
      onChange(summary);
      toast({
        title: "AI Summary Generated",
        description: "Professional summary has been generated and applied.",
      });
    } catch (error) {
      console.error('Error generating summary:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate AI summary. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="summary">Professional Summary</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={generateAISummary}
          disabled={isGenerating}
          className="text-xs"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-3 w-3 mr-1" />
              AI Generate
            </>
          )}
        </Button>
      </div>

      {/* AI Input Fields */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-blue-50 rounded-lg">
        <div>
          <Label htmlFor="jobTitle" className="text-xs">Job Title</Label>
          <Input
            id="jobTitle"
            value={formState.jobTitle}
            onChange={(e) => updateFormState({ jobTitle: e.target.value })}
            placeholder="Software Engineer"
            className="text-xs"
          />
        </div>
        <div>
          <Label htmlFor="industry" className="text-xs">Industry</Label>
          <Input
            id="industry"
            value={formState.industry}
            onChange={(e) => updateFormState({ industry: e.target.value })}
            placeholder="Technology"
            className="text-xs"
          />
        </div>
        <div>
          <Label htmlFor="experience" className="text-xs">Experience</Label>
          <Input
            id="experience"
            value={formState.experienceLevel}
            onChange={(e) => updateFormState({ experienceLevel: e.target.value })}
            placeholder="5 years"
            className="text-xs"
          />
        </div>
      </div>

      <Textarea
        id="summary"
        value={data}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || defaultPlaceholder}
        rows={4}
        className="resize-none"
      />
      <div className="text-xs text-gray-500">
        Tip: Use the AI Generate button above with your job details for a personalized summary, or write your own.
      </div>
    </div>
  );
};
