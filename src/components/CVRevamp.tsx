
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, CheckCircle, RefreshCw, Loader2, Save, Eye } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { ResumeData } from '@/types/resume';
import { RobustCVAnalyzer } from './RobustCVAnalyzer';
import { ResumeService } from '@/services/resumeService';

interface CVRevampProps {
  onRevampedDataApply?: (data: ResumeData) => void;
}

export const CVRevamp: React.FC<CVRevampProps> = ({ onRevampedDataApply }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [extractedData, setExtractedData] = useState<ResumeData | null>(null);
  const [isApplyingRevamp, setIsApplyingRevamp] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedResumeId, setSavedResumeId] = useState<string | null>(null);

  const handleAnalysisComplete = (data: ResumeData) => {
    setExtractedData(data);
    setAnalysisComplete(true);
    
    toast({
      title: "CV Analysis Complete!",
      description: "Your CV has been successfully analyzed and structured. Ready to apply!",
    });
  };

  const generateResumeTitle = (data: ResumeData): string => {
    const name = data.personalInfo.fullName || 'Unknown';
    const role = data.experience[0]?.jobTitle || 'Professional';
    return `${name} - ${role} (Revamped CV)`;
  };

  const autoSaveRevampedCV = async (data: ResumeData) => {
    if (!user) return null;

    setIsSaving(true);
    try {
      const title = generateResumeTitle(data);
      const savedResume = await ResumeService.saveResume(
        data,
        'modern', // Default template for revamped CVs
        title
      );

      if (savedResume) {
        setSavedResumeId(savedResume.id);
        toast({
          title: "CV Saved Successfully!",
          description: `Your revamped CV "${title}" has been saved to your dashboard.`,
          action: (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/dashboard')}
            >
              <Eye className="h-4 w-4 mr-2" />
              View in Dashboard
            </Button>
          ),
        });
        return savedResume;
      }
    } catch (error) {
      console.error('Error auto-saving revamped CV:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save your revamped CV automatically.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
    return null;
  };

  const applyRevampSuggestions = async () => {
    if (!extractedData || !onRevampedDataApply) {
      toast({
        title: "No Data to Apply",
        description: "Please analyze your CV first to get revamp suggestions.",
        variant: "destructive"
      });
      return;
    }

    setIsApplyingRevamp(true);
    
    try {
      console.log('Applying extracted data:', extractedData);
      
      // Apply the data to the form
      onRevampedDataApply(extractedData);
      
      // Auto-save to database
      await autoSaveRevampedCV(extractedData);
      
      toast({
        title: "Complete CV Revamp Applied Successfully!",
        description: "Your resume has been fully populated with AI-extracted and optimized content from your CV.",
      });
      
      // Reset the revamp state
      setAnalysisComplete(false);
      setExtractedData(null);
      
    } catch (error) {
      console.error('Error applying revamp:', error);
      toast({
        title: "Application Failed",
        description: "There was an error applying the revamp suggestions. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsApplyingRevamp(false);
    }
  };

  return (
    <div className="space-y-6">
      {!analysisComplete ? (
        <RobustCVAnalyzer onAnalysisComplete={handleAnalysisComplete} />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>Analysis Complete</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {extractedData && (
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">📊 Extracted Data Summary</h4>
                <div className="text-sm text-green-800 grid grid-cols-2 gap-2">
                  <div>• Contact Info: {extractedData.personalInfo.fullName ? '✓ Extracted' : '○ Missing'}</div>
                  <div>• Professional Summary: {extractedData.summary ? '✓ Generated' : '○ Not found'}</div>
                  <div>• Work Experience: {extractedData.experience.length} positions</div>
                  <div>• Education: {extractedData.education.length} entries</div>
                  <div>• Skills: {extractedData.skills.length} skills</div>
                  <div>• Projects: {extractedData.projects.length} projects</div>
                  <div>• Certifications: {extractedData.certifications.length} certs</div>
                  <div>• Languages: {extractedData.languages.length} languages</div>
                </div>
              </div>
            )}

            <div className="flex space-x-2">
              <Button
                onClick={applyRevampSuggestions}
                disabled={isApplyingRevamp || isSaving}
                className="bg-green-600 hover:bg-green-700 flex-1"
              >
                {isApplyingRevamp || isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {isSaving ? 'Saving...' : 'Applying Complete Revamp...'}
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Apply Complete Revamp
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setAnalysisComplete(false);
                  setExtractedData(null);
                  setSavedResumeId(null);
                }}
              >
                Analyze Another CV
              </Button>
            </div>

            {savedResumeId && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Save className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-blue-800">
                      CV saved successfully to your dashboard
                    </span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate('/dashboard')}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View in Dashboard
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
