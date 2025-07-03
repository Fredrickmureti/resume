import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { HeaderSection } from '@/components/HeaderSection';
import { HeroSectionWithPanel } from '@/components/HeroSectionWithPanel';
import { ResumePreview } from '@/components/ResumePreview';
import { Footer } from '@/components/Footer';
import { ScrollToTop } from '@/components/ScrollToTop';
import { SaveResumeDialog } from '@/components/SaveResumeDialog';
import { ResumeLoaderDialog } from '@/components/ResumeLoaderDialog';
import { SaveStatusIndicator, SaveStatus } from '@/components/SaveStatusIndicator';
import { ChatStateProvider } from '@/contexts/ChatStateContext';
import { FormStateProvider } from '@/contexts/FormStateContext';
import { ResumeData, Template } from '@/types/resume';
import { generatePDF } from '@/utils/pdfGenerator';
import { performDetailedATSAnalysis } from '@/utils/enhancedATSScoring';
import { DocumentValidationService } from '@/services/documentValidationService';
import { ResumeService, SavedResume } from '@/services/resumeService';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Save, FolderOpen } from 'lucide-react';
import { LinkedInOptimizer } from '@/components/LinkedInOptimizer';
import { SavePromptDialog } from '@/components/SavePromptDialog';

const Index = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isAdmin, signOut, loading } = useAuth();
  
  // Add a timeout to prevent infinite loading
  const [forceLoaded, setForceLoaded] = useState(false);
  
  useEffect(() => {
    const timeout = setTimeout(() => {
      setForceLoaded(true);
    }, 5000); // Force load after 5 seconds

    return () => clearTimeout(timeout);
  }, []);

  const [resumeData, setResumeData] = useState<ResumeData>({
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      location: '',
      linkedIn: '',
      website: '',
      profileImage: ''
    },
    summary: '',
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
    languages: [],
    references: [],
    keywords: []
  });

  const [selectedTemplate, setSelectedTemplate] = useState<Template>('modern');
  const [isGenerating, setIsGenerating] = useState(false);
  const [targetKeywords, setTargetKeywords] = useState<string[]>([]);
  const [documentTitle, setDocumentTitle] = useState<string>('');
  const [documentType, setDocumentType] = useState<'resume' | 'cv'>('resume');
  const [validationResult, setValidationResult] = useState<any>(null);
  
  // Save-related state
  const [currentResumeId, setCurrentResumeId] = useState<string | undefined>();
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('unsaved');
  const [lastSaved, setLastSaved] = useState<Date | undefined>();

  // Auto-save functionality
  const { saveResume } = useAutoSave({
    resumeData,
    template: selectedTemplate,
    resumeId: currentResumeId,
    resumeTitle: documentTitle || 'My Resume',
    enabled: !!user && (!!currentResumeId || !!documentTitle.trim()),
    onSave: (savedResume) => {
      setCurrentResumeId(savedResume.id);
      setSaveStatus('saved');
      setLastSaved(new Date());
    },
    onStatusChange: setSaveStatus
  });

  // Load resume from URL if resumeId is provided
  useEffect(() => {
    const resumeId = searchParams.get('resumeId');
    const isEditMode = searchParams.get('edit') === 'true';
    
    if (resumeId && user) {
      console.log('Loading resume with ID:', resumeId, 'Edit mode:', isEditMode);
      loadResumeById(resumeId);
    }
  }, [searchParams, user]);

  const loadResumeById = async (resumeId: string) => {
    try {
      console.log('Fetching resume data for ID:', resumeId);
      const savedResume = await ResumeService.loadResume(resumeId);
      if (savedResume) {
        console.log('Resume loaded successfully:', savedResume);
        handleLoadSavedResume(savedResume);
      } else {
        console.log('No resume found for ID:', resumeId);
        toast({
          title: "Resume Not Found",
          description: "The requested resume could not be found.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error loading resume from URL:', error);
      toast({
        title: "Error Loading Resume",
        description: "Failed to load the requested resume.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    // Read data from localStorage when component mounts
    const storedTemplate = localStorage.getItem('selectedTemplate');
    const storedDocumentType = localStorage.getItem('documentType');
    const storedDocumentTitle = localStorage.getItem('documentTitle');
    
    if (storedTemplate) {
      setSelectedTemplate(storedTemplate as Template);
      localStorage.removeItem('selectedTemplate');
    }
    
    if (storedDocumentType) {
      setDocumentType(storedDocumentType as 'resume' | 'cv');
      localStorage.removeItem('documentType');
    }
    
    if (storedDocumentTitle) {
      setDocumentTitle(storedDocumentTitle);
      // Update the resume data with the document title as the name if personalInfo is empty
      if (!resumeData.personalInfo.fullName.trim()) {
        setResumeData(prev => ({
          ...prev,
          personalInfo: {
            ...prev.personalInfo,
            fullName: storedDocumentTitle
          }
        }));
      }
      localStorage.removeItem('documentTitle');
    }
  }, []);

  // Validate document content whenever resume data changes
  useEffect(() => {
    const validation = DocumentValidationService.validateResumeData(resumeData);
    setValidationResult(validation);
    
    // Update save status when data changes only if we have a currentResumeId
    if (currentResumeId && saveStatus === 'saved') {
      setSaveStatus('unsaved');
    }
  }, [resumeData, currentResumeId, saveStatus]);

  const validateResumeContent = (data: ResumeData): boolean => {
    const validation = DocumentValidationService.validateResumeData(data);
    return validation.isValid;
  };

  const handleSaveResume = async (savedResume: SavedResume) => {
    console.log('Resume saved successfully:', savedResume);
    setCurrentResumeId(savedResume.id);
    setDocumentTitle(savedResume.title);
    setSaveStatus('saved');
    setLastSaved(new Date());
    
    // Update URL to include resume ID without triggering a reload
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('resumeId', savedResume.id);
    setSearchParams(newSearchParams, { replace: true });
  };

  const handleLoadSavedResume = (savedResume: SavedResume) => {
    console.log('Loading saved resume data:', savedResume);
    setResumeData(savedResume.data);
    setSelectedTemplate(savedResume.template as Template);
    setDocumentTitle(savedResume.title);
    setCurrentResumeId(savedResume.id);
    setSaveStatus('saved');
    setLastSaved(new Date(savedResume.updated_at));
    
    // Update URL parameters
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('resumeId', savedResume.id);
    setSearchParams(newSearchParams, { replace: true });
    
    toast({
      title: "Resume Loaded",
      description: `Loaded "${savedResume.title}" successfully.`,
    });
  };

  const handleDownloadPDF = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to download your resume.",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }

    const validation = DocumentValidationService.validateResumeData(resumeData);
    
    if (!validation.isValid) {
      toast({
        title: "Document Incomplete",
        description: `Please complete the following: ${validation.missingFields.join(', ')}`,
        variant: "destructive"
      });
      return;
    }

    if (validation.score < 70) {
      toast({
        title: "Document Quality Low",
        description: "Your document quality score is low. Consider adding more content for better results.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      // Save before downloading if not already saved
      if (!currentResumeId && documentTitle.trim()) {
        setSaveStatus('saving');
        const savedResume = await ResumeService.saveResume(
          resumeData,
          selectedTemplate,
          documentTitle,
          currentResumeId
        );
        if (savedResume) {
          setCurrentResumeId(savedResume.id);
          setSaveStatus('saved');
          setLastSaved(new Date());
        }
      }

      await generatePDF(resumeData, selectedTemplate);
      toast({
        title: "Resume Downloaded",
        description: "Your resume has been successfully downloaded!",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Download Error",
        description: "There was an error generating your resume. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // New state for LinkedIn optimizer and save prompts
  const [showLinkedInOptimizer, setShowLinkedInOptimizer] = useState(false);
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<(() => void) | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Add unsaved changes detection
  useEffect(() => {
    const hasContent = 
      resumeData.personalInfo.fullName.trim() ||
      resumeData.summary.trim() ||
      resumeData.experience.length > 0 ||
      resumeData.education.length > 0 ||
      resumeData.skills.length > 0;

    const isUnsaved = hasContent && saveStatus === 'unsaved' && !currentResumeId;
    setHasUnsavedChanges(isUnsaved);
  }, [resumeData, saveStatus, currentResumeId]);

  // Add beforeunload event listener for unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleNavigationWithSaveCheck = (navigationFn: () => void) => {
    if (hasUnsavedChanges) {
      setPendingNavigation(() => navigationFn);
      setShowSavePrompt(true);
    } else {
      navigationFn();
    }
  };

  const handleSaveAndNavigate = async () => {
    try {
      setSaveStatus('saving');
      const title = documentTitle || `${resumeData.personalInfo.fullName || 'My'} Resume`;
      const savedResume = await ResumeService.saveResume(
        resumeData,
        selectedTemplate,
        title,
        currentResumeId
      );
      
      if (savedResume) {
        setCurrentResumeId(savedResume.id);
        setSaveStatus('saved');
        setLastSaved(new Date());
      }
    } catch (error) {
      console.error('Error saving before navigation:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save changes before navigation.",
        variant: "destructive"
      });
    }
    
    setShowSavePrompt(false);
    if (pendingNavigation) {
      pendingNavigation();
      setPendingNavigation(null);
    }
  };

  const handleDiscardAndNavigate = () => {
    setShowSavePrompt(false);
    if (pendingNavigation) {
      pendingNavigation();
      setPendingNavigation(null);
    }
  };

  // Modified sign out handler with save check
  const handleSignOut = async () => {
    const signOutAction = async () => {
      await signOut();
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });
    };

    handleNavigationWithSaveCheck(signOutAction);
  };

  const atsAnalysis = performDetailedATSAnalysis(resumeData, targetKeywords);

  const handleKeywordsUpdate = (keywords: string[]) => {
    setTargetKeywords(keywords);
    setResumeData(prev => ({ ...prev, keywords }));
  };

  const handleAISuggestionApply = (suggestion: any) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to use AI features.",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }

    try {
      switch (suggestion.type) {
        case 'summary':
          setResumeData(prev => ({
            ...prev,
            summary: suggestion.content
          }));
          toast({
            title: "Summary Applied",
            description: "AI-generated summary has been added to your resume.",
          });
          break;

        case 'skill':
          // Check if skill already exists to avoid duplicates
          const skillExists = resumeData.skills.includes(suggestion.content);
          if (!skillExists) {
            setResumeData(prev => ({
              ...prev,
              skills: [...prev.skills, suggestion.content]
            }));
            toast({
              title: "Skill Added",
              description: `"${suggestion.content}" has been added to your skills.`,
            });
          } else {
            toast({
              title: "Skill Already Exists",
              description: `"${suggestion.content}" is already in your skills list.`,
              variant: "default"
            });
          }
          break;

        case 'bullet':
          setResumeData(prev => {
            if (prev.experience.length === 0) {
              const newExperience = {
                id: Date.now().toString(),
                jobTitle: 'Your Job Title',
                company: 'Your Company',
                location: '',
                startDate: '',
                endDate: '',
                current: false,
                description: [suggestion.content]
              };
              return {
                ...prev,
                experience: [newExperience]
              };
            } else {
              const updatedExperience = [...prev.experience];
              updatedExperience[0] = {
                ...updatedExperience[0],
                description: [...updatedExperience[0].description, suggestion.content]
              };
              return {
                ...prev,
                experience: updatedExperience
              };
            }
          });
          toast({
            title: "Bullet Point Added",
            description: "AI-generated bullet point has been added to your experience.",
          });
          break;

        case 'achievement':
          setResumeData(prev => {
            if (prev.experience.length === 0) {
              const newExperience = {
                id: Date.now().toString(),
                jobTitle: 'Your Job Title',
                company: 'Your Company',
                location: '',
                startDate: '',
                endDate: '',
                current: false,
                description: [suggestion.content]
              };
              return {
                ...prev,
                experience: [newExperience]
              };
            } else {
              const updatedExperience = [...prev.experience];
              updatedExperience[0] = {
                ...updatedExperience[0],
                description: [...updatedExperience[0].description, suggestion.content]
              };
              return {
                ...prev,
                experience: updatedExperience
              };
            }
          });
          toast({
            title: "Achievement Added",
            description: "AI-generated achievement has been added to your experience.",
          });
          break;

        default:
          console.log('Unknown suggestion type:', suggestion.type);
          toast({
            title: "Suggestion Applied",
            description: "AI suggestion has been processed.",
          });
      }
    } catch (error) {
      console.error('Error applying suggestion:', error);
      toast({
        title: "Application Error",
        description: "Failed to apply AI suggestion. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleVersionLoad = (versionData: ResumeData, template: Template) => {
    setResumeData(versionData);
    setSelectedTemplate(template);
  };

  const hasMinimalContent = validateResumeContent(resumeData);

  // Show loading only if auth is loading AND we haven't force loaded yet
  if (loading && !forceLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <ChatStateProvider>
      <FormStateProvider>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <HeaderSection 
            user={user}
            isAdmin={isAdmin}
            atsScore={atsAnalysis.score}
            isGenerating={isGenerating}
            hasMinimalContent={hasMinimalContent}
            onDownloadPDF={handleDownloadPDF}
            onSignOut={handleSignOut}
            onOpenLinkedInOptimizer={() => setShowLinkedInOptimizer(true)}
          />

          {/* Save Controls */}
          {user && (
            <div className="container mx-auto px-4 py-2">
              <div className="flex items-center justify-between bg-white rounded-lg shadow-sm p-3 mb-4">
                <div className="flex items-center space-x-4">
                  <SaveStatusIndicator status={saveStatus} lastSaved={lastSaved} />
                  {documentTitle && (
                    <span className="text-sm font-medium text-gray-700">
                      {documentTitle}
                    </span>
                  )}
                  {hasUnsavedChanges && (
                    <Badge variant="destructive" className="text-xs">
                      Unsaved Changes
                    </Badge>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <ResumeLoaderDialog onLoadResume={handleLoadSavedResume}>
                    <Button variant="outline" size="sm">
                      <FolderOpen className="h-4 w-4 mr-2" />
                      Load
                    </Button>
                  </ResumeLoaderDialog>
                  {currentResumeId && documentTitle ? (
                    <Button 
                      size="sm" 
                      onClick={async () => {
                        setSaveStatus('saving');
                        const savedResume = await ResumeService.saveResume(
                          resumeData,
                          selectedTemplate,
                          documentTitle,
                          currentResumeId
                        );
                        if (savedResume) {
                          handleSaveResume(savedResume);
                        }
                      }}
                      disabled={saveStatus === 'saving'}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {saveStatus === 'saving' ? 'Saving...' : 'Save'}
                    </Button>
                  ) : (
                    <SaveResumeDialog
                      resumeData={resumeData}
                      template={selectedTemplate}
                      currentTitle={documentTitle}
                      resumeId={currentResumeId}
                      onSave={handleSaveResume}
                    >
                      <Button size="sm">
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                    </SaveResumeDialog>
                  )}
                </div>
              </div>
            </div>
          )}

          <HeroSectionWithPanel
            resumeData={resumeData}
            selectedTemplate={selectedTemplate}
            targetKeywords={targetKeywords}
            user={user}
            isAdmin={isAdmin}
            atsScore={atsAnalysis.score}
            isGenerating={isGenerating}
            hasMinimalContent={hasMinimalContent}
            onResumeUpdate={setResumeData}
            onTemplateChange={setSelectedTemplate}
            onKeywordsUpdate={handleKeywordsUpdate}
            onAISuggestionApply={handleAISuggestionApply}
            onVersionLoad={handleVersionLoad}
            onDownloadPDF={handleDownloadPDF}
            onSignOut={handleSignOut}
          />

          {/* Document Validation Status */}
          {validationResult && (
            <div className="container mx-auto px-4 mb-4">
              <Alert className={validationResult.isValid ? 'border-green-500' : 'border-yellow-500'}>
                {validationResult.isValid ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                )}
                <AlertDescription>
                  <div className="flex items-center justify-between">
                    <span>
                      Document Quality: {validationResult.score}/100 
                      {validationResult.isValid ? " - Ready to download!" : " - Needs improvement"}
                    </span>
                    {validationResult.missingFields.length > 0 && (
                      <span className="text-sm">
                        Missing: {validationResult.missingFields.join(', ')}
                      </span>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Full Width Preview */}
          <div className="container mx-auto px-4 py-8">
            <Card className="min-h-[400px] sm:min-h-[600px] lg:min-h-[800px] overflow-hidden">
              <div className="p-3 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
                  <h3 className="text-base font-semibold">
                    {documentTitle ? `${documentTitle} - Live Preview` : 'Live Preview'}
                  </h3>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span>Live updates</span>
                    </div>
                    {targetKeywords.length > 0 && (
                      <div className="text-xs text-gray-600">
                        <span className="font-medium">Keywords:</span> {targetKeywords.length}
                      </div>
                    )}
                    {validationResult && (
                      <div className="text-xs text-gray-600">
                        <span className="font-medium">Quality:</span> {validationResult.score}%
                      </div>
                    )}
                  </div>
                </div>
                <div className="bg-white shadow-lg rounded-lg overflow-hidden" id="resume-preview">
                  <ResumePreview 
                    data={resumeData}
                    template={selectedTemplate}
                  />
                </div>
              </div>
            </Card>
          </div>

          <Footer />
          <ScrollToTop />

          {/* LinkedIn Optimizer Modal */}
          {showLinkedInOptimizer && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <LinkedInOptimizer
                  resumeData={resumeData}
                  onClose={() => setShowLinkedInOptimizer(false)}
                />
              </div>
            </div>
          )}

          {/* Save Prompt Dialog */}
          <SavePromptDialog
            open={showSavePrompt}
            onOpenChange={setShowSavePrompt}
            onSave={handleSaveAndNavigate}
            onDiscard={handleDiscardAndNavigate}
          />
        </div>
      </FormStateProvider>
    </ChatStateProvider>
  );
};

export default Index;
