import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GeminiAIService } from '@/services/geminiAI';
import { Sparkles, Copy, Plus, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useFormState } from '@/contexts/FormStateContext';
import { useNavigate } from 'react-router-dom';
import { useCredits } from '@/hooks/useCredits';

interface ContentSuggestion {
  type: 'bullet' | 'skill' | 'summary' | 'achievement';
  content: string;
  category?: string;
}

interface AIContentSuggestionsProps {
  onSuggestionApply: (suggestion: ContentSuggestion) => void;
}

export const AIContentSuggestions: React.FC<AIContentSuggestionsProps> = ({
  onSuggestionApply
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { formState, updateFormState } = useFormState();
  const { checkAndDeductCredits, hasEnoughCredits } = useCredits();
  const [suggestions, setSuggestions] = useState<ContentSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const generateSuggestions = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to use AI content suggestions.",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }

    if (!formState.jobTitle.trim()) {
      toast({
        title: "Job Title Required",
        description: "Please enter a job title to generate AI suggestions.",
        variant: "destructive"
      });
      return;
    }

    // Check and deduct credits before proceeding
    const canProceed = await checkAndDeductCredits('ai_suggestions', 'AI content suggestions generation');
    if (!canProceed) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await GeminiAIService.getContentSuggestions(
        formState.jobTitle,
        formState.selectedType === 'all' ? 'bullet' : formState.selectedType as 'bullet' | 'skill' | 'summary' | 'achievement'
      );

      const newSuggestions: ContentSuggestion[] = [];

      // Add summary suggestion
      if (response.suggestions.summary && (formState.selectedType === 'all' || formState.selectedType === 'summary')) {
        newSuggestions.push({
          type: 'summary',
          content: response.suggestions.summary
        });
      }

      // Add bullet suggestions
      if (response.suggestions.bullets.length > 0 && (formState.selectedType === 'all' || formState.selectedType === 'bullet')) {
        response.suggestions.bullets.forEach(bullet => {
          newSuggestions.push({
            type: 'bullet',
            content: bullet
          });
        });
      }

      // Add skill suggestions with proper categorization
      if (formState.selectedType === 'all' || formState.selectedType === 'skill') {
        // Technical skills
        response.suggestions.skills.technical.forEach(skill => {
          newSuggestions.push({
            type: 'skill',
            content: skill,
            category: 'Technical'
          });
        });

        // Soft skills
        response.suggestions.skills.soft.forEach(skill => {
          newSuggestions.push({
            type: 'skill',
            content: skill,
            category: 'Soft'
          });
        });

        // Other skills
        response.suggestions.skills.other.forEach(skill => {
          newSuggestions.push({
            type: 'skill',
            content: skill,
            category: 'Other'
          });
        });
      }

      setSuggestions(newSuggestions);
      toast({
        title: "AI Suggestions Generated",
        description: `Generated ${newSuggestions.length} suggestions for ${formState.jobTitle}`,
      });
    } catch (error) {
      console.error('Error generating suggestions:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate AI suggestions. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Content copied to clipboard",
    });
  };

  const handleApplySuggestion = (suggestion: ContentSuggestion) => {
    console.log('Applying suggestion:', suggestion);
    onSuggestionApply(suggestion);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            <span>AI Content Suggestions</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Job Title</label>
              <Input
                value={formState.jobTitle}
                onChange={(e) => updateFormState({ jobTitle: e.target.value })}
                placeholder="e.g., Software Engineer"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Content Type</label>
              <Select 
                value={formState.selectedType} 
                onValueChange={(value) => updateFormState({ selectedType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="bullet">Bullet Points</SelectItem>
                  <SelectItem value="skill">Skills</SelectItem>
                  <SelectItem value="summary">Summary</SelectItem>
                  <SelectItem value="achievement">Achievements</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button 
            onClick={generateSuggestions}
            disabled={!formState.jobTitle.trim() || isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating AI Suggestions...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate AI Suggestions
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>AI-Generated Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {suggestions.map((suggestion, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="outline" className="capitalize">
                          {suggestion.type}
                        </Badge>
                        {suggestion.category && (
                          <Badge variant="secondary">{suggestion.category}</Badge>
                        )}
                      </div>
                      <p className="text-gray-700">{suggestion.content}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(suggestion.content)}
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleApplySuggestion(suggestion)}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Apply
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
