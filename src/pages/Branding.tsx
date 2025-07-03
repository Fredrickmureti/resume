import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { PanelLeft, X, FileText, Wand2, MessageCircle, BarChart3, Target, Zap, Briefcase, Search, TrendingUp, Award, GraduationCap, Linkedin, Star, Plus } from 'lucide-react';
import { CustomBrandingManager } from '@/components/CustomBrandingManager';

export const Branding: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading, isAdmin } = useAuth();
  const [showToolsPanel, setShowToolsPanel] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const toolsItems = [
    { title: "Resume Builder", icon: FileText, path: "/?tab=content", description: "Build your resume content" },
    { title: "CV Builder", icon: GraduationCap, path: "/?tab=cv-builder", description: "Create academic CVs" },
    { title: "Templates", icon: Target, path: "/?tab=design", description: "Choose design templates" },
    { title: "AI Suggestions", icon: Wand2, path: "/?tab=ai", description: "Get AI-powered suggestions" },
    { title: "Optimize", icon: Zap, path: "/?tab=optimize", description: "Optimize bullet points" },
    { title: "Revamp", icon: TrendingUp, path: "/?tab=revamp", description: "AI-powered revamp" },
    { title: "Job Match", icon: Briefcase, path: "/?tab=job-tailored", description: "Tailor to job descriptions" },
    { title: "Skills Gap", icon: Target, path: "/?tab=skills-gap", description: "Analyze skill gaps" },
    { title: "LinkedIn", icon: Linkedin, path: "/?tab=linkedin", description: "Optimize LinkedIn profile" },
    { title: "Cover Letter", icon: FileText, path: "/?tab=cover-letter", description: "Generate cover letters" },
    { title: "AI Chat", icon: MessageCircle, path: "/?tab=chat", description: "Chat with AI assistant" },
    { title: "Keywords", icon: Search, path: "/?tab=keywords", description: "Analyze keywords" },
    { title: "Analytics", icon: BarChart3, path: "/?tab=analytics", description: "View resume analytics" },
    { title: "Scoring", icon: Award, path: "/?tab=scoring", description: "Get ATS scores" },
  ];

  const navigationItems = [
    { title: "Dashboard", icon: BarChart3, path: "/dashboard", description: "Overview and stats" },
    { title: "Job Tracker", icon: Briefcase, path: "/job-tracker", description: "Track job applications" },
    { title: "Custom Branding", icon: Star, path: "/branding", description: "Customize your brand" },
    ...(isAdmin ? [{ title: "Admin Panel", icon: Star, path: "/admin", description: "Admin controls" }] : []),
  ];

  const handleToolNavigation = (path: string) => {
    setShowToolsPanel(false);
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Fixed Panel Toggle Button */}
      <div className="fixed top-20 left-4 z-50">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShowToolsPanel(true)}
          className="flex items-center gap-2 bg-background/95 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all border-2 border-border/50"
        >
          <PanelLeft className="h-4 w-4" />
          <span className="hidden xs:inline text-xs sm:text-sm font-medium">
            Resume Tools
          </span>
        </Button>
      </div>

      <div className="container mx-auto px-4 py-8">
        <CustomBrandingManager />
      </div>

      {/* Tools Navigation Panel */}
      {showToolsPanel && (
        <div className="fixed inset-0 z-50 animate-fade-in">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
            onClick={() => setShowToolsPanel(false)}
          />
          
          {/* Panel */}
          <div className="absolute left-0 top-0 h-full w-80 bg-background border-r shadow-xl animate-slide-in-right">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">Resume Tools & Navigation</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowToolsPanel(false)}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="p-4 space-y-2 overflow-y-auto max-h-[calc(100vh-80px)]">
              {/* Quick Actions */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-muted-foreground mb-3">Quick Actions</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => handleToolNavigation('/')}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors bg-primary/10 text-primary hover:bg-primary/20"
                  >
                    <Plus className="h-4 w-4" />
                    <div>
                      <span className="text-sm font-medium">Create New Resume</span>
                      <p className="text-xs text-muted-foreground">Start from scratch</p>
                    </div>
                  </button>
                  <button
                    onClick={() => handleToolNavigation('/templates')}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    <Star className="h-4 w-4" />
                    <div>
                      <span className="text-sm font-medium">Browse Templates</span>
                      <p className="text-xs text-muted-foreground">Professional designs</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Navigation */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-muted-foreground mb-3">Navigation</h4>
                <div className="space-y-1">
                  {navigationItems.map((item) => (
                    <button
                      key={item.title}
                      onClick={() => handleToolNavigation(item.path)}
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
                <h4 className="text-sm font-medium text-muted-foreground mb-3">AI-Powered Tools</h4>
                <div className="space-y-1">
                  {toolsItems.map((item) => (
                    <button
                      key={item.title}
                      onClick={() => handleToolNavigation(item.path)}
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
};