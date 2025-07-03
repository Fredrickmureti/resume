import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PanelLeft, PanelLeftClose, X, FileText, Wand2, MessageCircle, BarChart3, Target, Zap, Briefcase, Search, TrendingUp, Award, GraduationCap, Linkedin, Plus, Star } from 'lucide-react';
import { HeroSection } from '@/components/HeroSection';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Sidebar, SidebarContent, SidebarProvider, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { ResumeBuilder } from '@/components/ResumeBuilder';
import { CVBuilder } from '@/components/CVBuilder';
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
import { SkillsGapAnalyzer } from '@/components/SkillsGapAnalyzer';
import { LinkedInOptimizer } from '@/components/LinkedInOptimizer';

interface HeroSectionWithPanelProps {
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

export const HeroSectionWithPanel: React.FC<HeroSectionWithPanelProps> = ({
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
  const [documentType, setDocumentType] = useState<'resume' | 'cv'>('resume');

  const handleOptimizedBullets = (bullets: string[]) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to use AI features.",
        variant: "destructive"
      });
      return;
    }
    if (resumeData.experience.length === 0) {
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
        description: `${bullets.length} optimized bullet points have been applied to a new experience entry.`
      });
    } else {
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
        description: `${bullets.length} optimized bullet points have been applied to your experience.`
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
    onResumeUpdate(revampedData);
    toast({
      title: "CV Revamp Applied Successfully!",
      description: "Your resume has been updated with AI-optimized content. Review and make final adjustments as needed."
    });
  };

  const sidebarItems = [{
    title: "Content",
    icon: FileText,
    value: "content"
  }, {
    title: "CV Builder",
    icon: GraduationCap,
    value: "cv-builder"
  }, {
    title: "Design",
    icon: Target,
    value: "design"
  }, {
    title: "AI Suggestions",
    icon: Wand2,
    value: "ai"
  }, {
    title: "Optimize",
    icon: Zap,
    value: "optimize"
  }, {
    title: "Revamp",
    icon: TrendingUp,
    value: "revamp"
  }, {
    title: "Job Match",
    icon: Briefcase,
    value: "job-tailored"
  }, {
    title: "Skills Gap",
    icon: Target,
    value: "skills-gap"
  }, {
    title: "LinkedIn",
    icon: Linkedin,
    value: "linkedin"
  }, {
    title: "Cover Letter",
    icon: FileText,
    value: "cover-letter"
  }, {
    title: "AI Chat",
    icon: MessageCircle,
    value: "chat"
  }, {
    title: "Keywords",
    icon: Search,
    value: "keywords"
  }, {
    title: "Analytics",
    icon: BarChart3,
    value: "analytics"
  }, {
    title: "Scoring",
    icon: Award,
    value: "scoring"
  }];

  const navigationItems = [
    { title: "Dashboard", icon: BarChart3, path: "/dashboard", description: "Overview and stats" },
    { title: "Job Tracker", icon: Briefcase, path: "/job-tracker", description: "Track job applications" },
    { title: "Custom Branding", icon: Star, path: "/branding", description: "Customize your brand" },
    ...(isAdmin ? [{ title: "Admin Panel", icon: Star, path: "/admin", description: "Admin controls" }] : []),
  ];

  const navigate = useNavigate();

  const handleSidebarItemClick = (value: string) => {
    setActiveTab(value);
    setSidebarOpen(false);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setSidebarOpen(false);
  };

  return <div className="relative">
      {/* Fixed Panel Toggle Button with better dark mode contrast */}
      <div className="fixed top-20 left-4 z-50">
        <Button variant="outline" size="sm" onClick={() => setSidebarOpen(!sidebarOpen)} className="flex items-center gap-2 bg-background/95 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all border-2 border-border/50 mt-10">
          {sidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
          <span className="hidden xs:inline text-xs sm:text-sm font-medium">
            {sidebarOpen ? 'Hide Panel' : 'Show Panel'}
          </span>
        </Button>
      </div>

      {/* Hero Section */}
      <HeroSection />

      {/* Beautiful Professional Background Section */}
      <div className="relative h-64 sm:h-80 bg-cover bg-center bg-no-repeat" style={{
      backgroundImage: `linear-gradient(135deg, rgba(59, 130, 246, 0.8), rgba(147, 51, 234, 0.8)), url('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3')`
    }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white max-w-4xl mx-auto px-4">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
              Craft Your Perfect Career Story
            </h2>
            <p className="text-lg sm:text-xl mb-6 opacity-90 leading-relaxed">
              From ATS-optimized resumes to creative CVs with stunning visuals - 
              create documents that open doors to your dream job
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                <span className="text-sm font-medium">AI-Powered Tools Available</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <span className="text-sm font-medium">✨ Professional Templates</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-4 left-4 w-16 h-16 border-2 border-white/30 rounded-full animate-pulse"></div>
        <div className="absolute bottom-4 right-4 w-12 h-12 border-2 border-white/30 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-8 w-8 h-8 border-2 border-white/30 rounded-full animate-pulse delay-500"></div>
      </div>

      {/* Side Panel */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50" 
            onClick={() => setSidebarOpen(false)}
          />
          
          {/* Sidebar */}
          <div className="absolute left-0 top-0 h-full w-80 bg-background border-r shadow-xl">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">Tools & Features</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(false)}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="p-4 space-y-2 overflow-y-auto max-h-[calc(100vh-80px)]">
              {/* Navigation */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-muted-foreground mb-3">Navigation</h4>
                <div className="space-y-1">
                  {navigationItems.map((item) => (
                    <button
                      key={item.title}
                      onClick={() => handleNavigation(item.path)}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors hover:bg-accent hover:text-accent-foreground hover-scale"
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      <div className="min-w-0">
                        <span className="text-sm font-medium block">{item.title}</span>
                        <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tools */}
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3">Resume Tools</h4>
                <div className="space-y-1">
                  {sidebarItems.map((item) => (
                    <button
                      key={item.value}
                      onClick={() => handleSidebarItemClick(item.value)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors hover-scale ${
                        activeTab === item.value 
                          ? 'bg-primary text-primary-foreground' 
                          : 'hover:bg-accent hover:text-accent-foreground'
                      }`}
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      <span className="text-sm font-medium">{item.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Tools & Features Section */}
      <div className="container mx-auto px-4 py-8">
        {/* Document Type Selector */}
        <div className="mb-6 flex justify-center">
          <div className="bg-background rounded-lg p-1 shadow-md border">
            <button onClick={() => setDocumentType('resume')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${documentType === 'resume' ? 'bg-blue-600 text-white' : 'text-foreground hover:text-blue-600'}`}>
              Resume Builder
            </button>
            <button onClick={() => setDocumentType('cv')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${documentType === 'cv' ? 'bg-purple-600 text-white' : 'text-foreground hover:text-purple-600'}`}>
              CV Builder
            </button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="mb-4">
            <ScrollArea className="w-full">
              <TabsList className="inline-flex h-auto p-1 gap-1 w-max justify-start min-w-full">
                <TabsTrigger value="content" className="text-xs px-2 py-2 whitespace-nowrap flex-shrink-0">
                  <FileText className="h-3 w-3 mr-1" />
                  <span className="hidden xs:inline">Content</span>
                </TabsTrigger>
                <TabsTrigger value="cv-builder" className="text-xs px-2 py-2 whitespace-nowrap flex-shrink-0">
                  <GraduationCap className="h-3 w-3 mr-1" />
                  <span className="hidden xs:inline">CV Builder</span>
                </TabsTrigger>
                <TabsTrigger value="design" className="text-xs px-2 py-2 whitespace-nowrap flex-shrink-0">
                  <Target className="h-3 w-3 mr-1" />
                  <span className="hidden xs:inline">Design</span>
                </TabsTrigger>
                <TabsTrigger value="ai" className="text-xs px-2 py-2 whitespace-nowrap flex-shrink-0">
                  <Wand2 className="h-3 w-3 mr-1" />
                  <span className="hidden xs:inline">AI</span>
                </TabsTrigger>
                <TabsTrigger value="optimize" className="text-xs px-2 py-2 whitespace-nowrap flex-shrink-0">
                  <Zap className="h-3 w-3 mr-1" />
                  <span className="hidden xs:inline">Optimize</span>
                </TabsTrigger>
                <TabsTrigger value="revamp" className="text-xs px-2 py-2 whitespace-nowrap flex-shrink-0">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  <span className="hidden xs:inline">Revamp</span>
                </TabsTrigger>
                <TabsTrigger value="job-tailored" className="text-xs px-2 py-2 whitespace-nowrap flex-shrink-0">
                  <Briefcase className="h-3 w-3 mr-1" />
                  <span className="hidden xs:inline">Match</span>
                </TabsTrigger>
                <TabsTrigger value="skills-gap" className="text-xs px-2 py-2 whitespace-nowrap flex-shrink-0">
                  <Target className="h-3 w-3 mr-1" />
                  <span className="hidden xs:inline">Skills Gap</span>
                </TabsTrigger>
                <TabsTrigger value="linkedin" className="text-xs px-2 py-2 whitespace-nowrap flex-shrink-0">
                  <Linkedin className="h-3 w-3 mr-1" />
                  <span className="hidden xs:inline">LinkedIn</span>
                </TabsTrigger>
                <TabsTrigger value="cover-letter" className="text-xs px-2 py-2 whitespace-nowrap flex-shrink-0">
                  <FileText className="h-3 w-3 mr-1" />
                  <span className="hidden xs:inline">Cover</span>
                </TabsTrigger>
                <TabsTrigger value="chat" className="text-xs px-2 py-2 whitespace-nowrap flex-shrink-0">
                  <MessageCircle className="h-3 w-3 mr-1" />
                  <span className="hidden xs:inline">Chat</span>
                </TabsTrigger>
                <TabsTrigger value="keywords" className="text-xs px-2 py-2 whitespace-nowrap flex-shrink-0">
                  <Search className="h-3 w-3 mr-1" />
                  <span className="hidden xs:inline">Keywords</span>
                </TabsTrigger>
                <TabsTrigger value="analytics" className="text-xs px-2 py-2 whitespace-nowrap flex-shrink-0">
                  <BarChart3 className="h-3 w-3 mr-1" />
                  <span className="hidden xs:inline">Analytics</span>
                </TabsTrigger>
                <TabsTrigger value="scoring" className="text-xs px-2 py-2 whitespace-nowrap flex-shrink-0">
                  <Award className="h-3 w-3 mr-1" />
                  <span className="hidden xs:inline">Scoring</span>
                </TabsTrigger>
              </TabsList>
              <ScrollBar orientation="horizontal" className="h-2" />
            </ScrollArea>
          </div>
          
          <div className="space-y-4">
            {/* Active Tool Status */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 rounded-lg border">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-foreground">
                  Currently viewing: {sidebarItems.find(item => item.value === activeTab)?.title}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                {user ? 'Authenticated User' : 'Guest Mode'}
              </div>
            </div>

            <TabsContent value="content" className="mt-0">
              <Card className="overflow-hidden">
                <div className="p-3 sm:p-6">
                  {documentType === 'resume' ? <ResumeBuilder resumeData={resumeData} onUpdate={onResumeUpdate} /> : <CVBuilder resumeData={resumeData} onUpdate={onResumeUpdate} />}
                </div>
              </Card>
            </TabsContent>
            
            <TabsContent value="cv-builder" className="mt-0">
              <Card className="overflow-hidden">
                <div className="p-3 sm:p-6">
                  <CVBuilder resumeData={resumeData} onUpdate={onResumeUpdate} />
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="design" className="mt-0">
              <Card className="overflow-hidden">
                <div className="p-3 sm:p-6">
                  <TemplateSelector selectedTemplate={selectedTemplate} onTemplateChange={onTemplateChange} />
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="ai" className="mt-0">
              <Card className="overflow-hidden">
                <div className="p-3 sm:p-6">
                  <AIContentSuggestions onSuggestionApply={onAISuggestionApply} />
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="optimize" className="mt-0">
              <Card className="overflow-hidden">
                <div className="p-3 sm:p-6">
                  <ExperienceBulletOptimizer onOptimizedBullets={handleOptimizedBullets} />
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="revamp" className="mt-0">
              <Card className="overflow-hidden">
                <div className="p-3 sm:p-6">
                  <CVRevamp onRevampedDataApply={handleRevampedDataApply} />
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="job-tailored" className="mt-0">
              <Card className="overflow-hidden">
                <div className="p-3 sm:p-6">
                  <JobTailoredCVRevamp onRevampedDataApply={handleRevampedDataApply} />
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="linkedin" className="mt-0">
              <Card className="overflow-hidden">
                <div className="p-3 sm:p-6">
                  <LinkedInOptimizer resumeData={resumeData} />
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="cover-letter" className="mt-0">
              <Card className="overflow-hidden">
                <div className="p-3 sm:p-6">
                  <CoverLetterGenerator resumeData={resumeData} />
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="chat" className="mt-0">
              <Card className="overflow-hidden">
                <div className="p-3 sm:p-6">
                  <AIChatAssistant resumeData={resumeData} />
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="keywords" className="mt-0">
              <Card className="overflow-hidden">
                <div className="p-3 sm:p-6">
                  <KeywordAnalyzer resumeData={resumeData} onKeywordsUpdate={onKeywordsUpdate} />
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="mt-0">
              <Card className="overflow-hidden">
                <div className="p-3 sm:p-6">
                  <ResumeAnalytics resumeData={resumeData} targetKeywords={targetKeywords} />
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="scoring" className="mt-0">
              <Card className="overflow-hidden">
                <div className="p-3 sm:p-6">
                  <ResumeScoring resumeData={resumeData} targetIndustry="Technology" targetRole="Software Engineer" />
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="skills-gap" className="mt-0">
              <Card className="overflow-hidden">
                <div className="p-3 sm:p-6">
                  <SkillsGapAnalyzer
                    resumeData={resumeData}
                  />
                </div>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>;
};
