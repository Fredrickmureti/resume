import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarProvider, 
  SidebarTrigger,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton
} from '@/components/ui/sidebar';
import { PanelLeft, PanelLeftClose, X, FileText, Wand2, MessageCircle, BarChart3, Target, Zap, Briefcase, Search, TrendingUp, Award } from 'lucide-react';
import { ResumeBuilder } from '@/components/ResumeBuilder';
import { ResumePreview } from '@/components/ResumePreview';
import { TemplateSelector } from '@/components/TemplateSelector';
import { KeywordAnalyzer } from '@/components/KeywordAnalyzer';
import { AIContentSuggestions } from '@/components/AIContentSuggestions';
import { ResumeAnalytics } from '@/components/ResumeAnalytics';
import { VersionManager } from '@/components/VersionManager';
import { CVRevamp } from '@/components/CVRevamp';
import { JobTailoredCVRevamp } from '@/components/JobTailoredCVRevamp';
import { ResumeData, Template } from '@/types/resume';
import { ExperienceBulletOptimizer } from '@/components/ExperienceBulletOptimizer';
import { User } from '@supabase/supabase-js';
import { toast } from '@/components/ui/use-toast';
import { ResumeScoring } from '@/components/ResumeScoring';
import { CoverLetterGenerator } from '@/components/CoverLetterGenerator';
import { AIChatAssistant } from '@/components/AIChatAssistant';
import { HeaderSection } from '@/components/HeaderSection';
import { SkillsGapAnalyzer } from '@/components/SkillsGapAnalyzer';

interface MainLayoutProps {
  resumeData: ResumeData;
  selectedTemplate: Template;
  targetKeywords: string[];
  user: User | null;
  isAdmin: boolean;
  atsScore: number;
  isGenerating: boolean;
  hasMinimalContent: boolean;
  onResumeUpdate: (data: ResumeData) => void;
  onTemplateChange: (template: Template) => void;
  onKeywordsUpdate: (keywords: string[]) => void;
  onAISuggestionApply: (suggestion: any) => void;
  onVersionLoad: (versionData: ResumeData, template: Template) => void;
  onDownloadPDF: () => void;
  onSignOut: () => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  resumeData,
  selectedTemplate,
  targetKeywords,
  user,
  isAdmin,
  atsScore,
  isGenerating,
  hasMinimalContent,
  onResumeUpdate,
  onTemplateChange,
  onKeywordsUpdate,
  onAISuggestionApply,
  onVersionLoad,
  onDownloadPDF,
  onSignOut
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('content');

  const scrollToSection = (tabValue: string) => {
    // Set the active tab first
    setActiveTab(tabValue);
    
    // Small delay to ensure the tab content is rendered
    setTimeout(() => {
      const element = document.getElementById(`tab-${tabValue}`);
      if (element) {
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start',
          inline: 'nearest'
        });
      }
    }, 100);
  };

  const handleOptimizedBullets = (bullets: string[]) => {
    // Restrict AI features to authenticated users
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to use AI features.",
        variant: "destructive"
      });
      return;
    }

    // Apply the optimized bullets to the most recent experience entry
    if (resumeData.experience.length === 0) {
      // Create a new experience entry if none exists
      const newExperience = {
        id: Date.now().toString(),
        jobTitle: 'Your Job Title',
        company: 'Your Company',
        location: '',
        startDate: '',
        endDate: '',
        current: false,
        description: bullets
      };
      
      const updatedResumeData = {
        ...resumeData,
        experience: [newExperience]
      };
      
      onResumeUpdate(updatedResumeData);
      
      toast({
        title: "Bullets Applied",
        description: `${bullets.length} optimized bullet points have been applied to a new experience entry.`,
      });
    } else {
      // Apply to the first experience entry
      const updatedExperience = [...resumeData.experience];
      updatedExperience[0] = {
        ...updatedExperience[0],
        description: bullets
      };
      
      const updatedResumeData = {
        ...resumeData,
        experience: updatedExperience
      };
      
      onResumeUpdate(updatedResumeData);
      
      toast({
        title: "Bullets Applied",
        description: `${bullets.length} optimized bullet points have been applied to your experience.`,
      });
    }
  };

  const handleRevampedDataApply = (revampedData: ResumeData) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to use CV Revamp features.",
        variant: "destructive"
      });
      return;
    }

    // Apply the revamped data to replace current resume data
    onResumeUpdate(revampedData);
    
    toast({
      title: "CV Revamp Applied Successfully!",
      description: "Your resume has been updated with AI-optimized content. Review and make final adjustments as needed.",
    });
  };

  const sidebarItems = [
    { title: "Content", icon: FileText, value: "content" },
    { title: "Design", icon: Target, value: "design" },
    { title: "AI Suggestions", icon: Wand2, value: "ai" },
    { title: "Optimize", icon: Zap, value: "optimize" },
    { title: "Revamp", icon: TrendingUp, value: "revamp" },
    { title: "Job Match", icon: Briefcase, value: "job-tailored" },
    { title: "Skills Gap", icon: Target, value: "skills-gap" },
    { title: "Cover Letter", icon: FileText, value: "cover-letter" },
    { title: "AI Chat", icon: MessageCircle, value: "chat" },
    { title: "Keywords", icon: Search, value: "keywords" },
    { title: "Analytics", icon: BarChart3, value: "analytics" },
    { title: "Scoring", icon: Award, value: "scoring" },
  ];

  const handleSidebarItemClick = (value: string) => {
    scrollToSection(value);
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <HeaderSection
        user={user}
        isAdmin={isAdmin}
        atsScore={atsScore}
        isGenerating={isGenerating}
        hasMinimalContent={hasMinimalContent}
        onDownloadPDF={onDownloadPDF}
        onSignOut={onSignOut}
      />
      
      <SidebarProvider>
        <div className="flex-1 flex w-full overflow-x-hidden">
          {/* Side Panel */}
          <Sidebar className={`${sidebarOpen ? "w-64" : "w-0"} transition-all duration-300 ease-in-out fixed md:static z-40 h-full`} collapsible="none">
            <SidebarHeader className="p-3 border-b">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">Navigation</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(false)}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </SidebarHeader>
            <SidebarContent>
              <SidebarMenu>
                {sidebarItems.map((item) => (
                  <SidebarMenuItem key={item.value}>
                    <SidebarMenuButton
                      onClick={() => handleSidebarItemClick(item.value)}
                      className={`w-full justify-start cursor-pointer hover:bg-accent hover:text-accent-foreground ${
                        activeTab === item.value ? 'bg-accent text-accent-foreground font-medium' : ''
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                      <span className="text-sm">{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarContent>
          </Sidebar>

          {/* Overlay for mobile */}
          {sidebarOpen && (
            <div 
              className="fixed inset-0 bg-black/50 z-30 md:hidden" 
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0 w-full">
            <div className="flex-1 p-2 sm:p-4 space-y-4 sm:space-y-6 overflow-x-hidden">
              {/* Tools & Features with Horizontal Scrolling */}
              <div className="w-full">
                <Tabs value={activeTab} onValueChange={(value) => scrollToSection(value)} className="w-full">
                  <div className="mb-4">
                    <ScrollArea className="w-full">
                      <TabsList className="inline-flex h-auto p-1 gap-1 w-max justify-start min-w-full">
                        {sidebarItems.map((item) => (
                          <TabsTrigger 
                            key={item.value}
                            value={item.value} 
                            className="text-xs px-2 py-2 whitespace-nowrap flex-shrink-0"
                          >
                            <item.icon className="h-3 w-3 mr-1" />
                            <span className="hidden xs:inline">{item.title}</span>
                          </TabsTrigger>
                        ))}
                      </TabsList>
                      <ScrollBar orientation="horizontal" className="h-2" />
                    </ScrollArea>
                  </div>
                  
                  <div className="space-y-4">
                    <TabsContent value="content" className="mt-0" id="tab-content">
                      <Card className="overflow-hidden">
                        <div className="p-3 sm:p-6">
                          <ResumeBuilder 
                            resumeData={resumeData}
                            onUpdate={onResumeUpdate}
                          />
                        </div>
                      </Card>
                    </TabsContent>
                    
                    <TabsContent value="design" className="mt-0" id="tab-design">
                      <Card className="overflow-hidden">
                        <div className="p-3 sm:p-6">
                          <TemplateSelector
                            selectedTemplate={selectedTemplate}
                            onTemplateChange={onTemplateChange}
                          />
                        </div>
                      </Card>
                    </TabsContent>

                    <TabsContent value="ai" className="mt-0" id="tab-ai">
                      <Card className="overflow-hidden">
                        <div className="p-3 sm:p-6">
                          <AIContentSuggestions
                            onSuggestionApply={onAISuggestionApply}
                          />
                        </div>
                      </Card>
                    </TabsContent>

                    <TabsContent value="optimize" className="mt-0" id="tab-optimize">
                      <Card className="overflow-hidden">
                        <div className="p-3 sm:p-6">
                          <ExperienceBulletOptimizer
                            onOptimizedBullets={handleOptimizedBullets}
                          />
                        </div>
                      </Card>
                    </TabsContent>

                    <TabsContent value="revamp" className="mt-0" id="tab-revamp">
                      <Card className="overflow-hidden">
                        <div className="p-3 sm:p-6">
                          <CVRevamp 
                            onRevampedDataApply={handleRevampedDataApply}
                          />
                        </div>
                      </Card>
                    </TabsContent>

                    <TabsContent value="job-tailored" className="mt-0" id="tab-job-tailored">
                      <Card className="overflow-hidden">
                        <div className="p-3 sm:p-6">
                          <JobTailoredCVRevamp 
                            onRevampedDataApply={handleRevampedDataApply}
                          />
                        </div>
                      </Card>
                    </TabsContent>

                    <TabsContent value="skills-gap" className="mt-0" id="tab-skills-gap">
                      <Card className="overflow-hidden">
                        <div className="p-3 sm:p-6">
                          <SkillsGapAnalyzer
                            resumeData={resumeData}
                          />
                        </div>
                      </Card>
                    </TabsContent>

                    <TabsContent value="cover-letter" className="mt-0" id="tab-cover-letter">
                      <Card className="overflow-hidden">
                        <div className="p-3 sm:p-6">
                          <CoverLetterGenerator
                            resumeData={resumeData}
                          />
                        </div>
                      </Card>
                    </TabsContent>

                    <TabsContent value="chat" className="mt-0" id="tab-chat">
                      <Card className="overflow-hidden">
                        <div className="p-3 sm:p-6">
                          <AIChatAssistant
                            resumeData={resumeData}
                          />
                        </div>
                      </Card>
                    </TabsContent>

                    <TabsContent value="keywords" className="mt-0" id="tab-keywords">
                      <Card className="overflow-hidden">
                        <div className="p-3 sm:p-6">
                          <KeywordAnalyzer
                            resumeData={resumeData}
                            onKeywordsUpdate={onKeywordsUpdate}
                          />
                        </div>
                      </Card>
                    </TabsContent>

                    <TabsContent value="analytics" className="mt-0" id="tab-analytics">
                      <Card className="overflow-hidden">
                        <div className="p-3 sm:p-6">
                          <ResumeAnalytics
                            resumeData={resumeData}
                            targetKeywords={targetKeywords}
                          />
                        </div>
                      </Card>
                    </TabsContent>

                    <TabsContent value="scoring" className="mt-0" id="tab-scoring">
                      <Card className="overflow-hidden">
                        <div className="p-3 sm:p-6">
                          <ResumeScoring
                            resumeData={resumeData}
                            targetIndustry="Technology"
                            targetRole="Software Engineer"
                          />
                        </div>
                      </Card>
                    </TabsContent>
                  </div>
                </Tabs>
              </div>

              {/* Full Width Preview */}
              <div className="w-full">
                <Card className="min-h-[400px] sm:min-h-[600px] lg:min-h-[800px] overflow-hidden">
                  <div className="p-3 sm:p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
                      <h3 className="text-base font-semibold">Live Preview</h3>
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
            </div>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
};
