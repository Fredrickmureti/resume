import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Plus, Eye, Edit, Trash2, TrendingUp, Clock, Star, Coins, PanelLeft, X, Wand2, Zap, Briefcase, Search, Award, Target, MessageCircle, GraduationCap, Linkedin } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { ResumeTemplates } from '@/components/ResumeTemplates';
import { DocumentLibrary } from '@/components/DocumentLibrary';
import { useCredits } from '@/hooks/useCredits';
import { NotificationCenter } from '@/components/NotificationCenter';
import { ProfileSettings } from '@/components/ProfileSettings';
import { UserMessages } from '@/components/UserMessages';
import { ResumeService } from '@/services/resumeService';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import { BarChart3, User, MessageSquare } from 'lucide-react';

interface Resume {
  id: string;
  title: string;
  template: string;
  created_at: string;
  updated_at: string;
  data?: any;
}

const Dashboard = () => {
  const { user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { credits } = useCredits();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [showTemplates, setShowTemplates] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'analytics' | 'profile' | 'messages'>('overview');
  const [unreadCount, setUnreadCount] = useState(0);
  const [showToolsPanel, setShowToolsPanel] = useState(false);

  // Add a timeout to prevent infinite loading
  const [forceLoaded, setForceLoaded] = useState(false);
  
  useEffect(() => {
    const timeout = setTimeout(() => {
      setForceLoaded(true);
    }, 5000); // Force load after 5 seconds

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }

    if (user) {
      fetchResumes();
    }
  }, [user, loading, navigate]);

  const fetchResumes = async () => {
    try {
      console.log('Fetching resumes for user:', user?.id);
      const { data, error } = await supabase
        .from('resumes')
        .select('id, title, template, created_at, updated_at, data')
        .eq('user_id', user?.id)
        .order('updated_at', { ascending: false });

      console.log('Resume fetch result:', { data, error, userCount: data?.length });
      if (error) throw error;
      setResumes(data || []);
    } catch (error) {
      console.error('Error fetching resumes:', error);
      toast({
        title: "Error",
        description: "Failed to load your resumes.",
        variant: "destructive"
      });
    } finally {
      setLoadingResumes(false);
    }
  };

  const handleViewResume = (resume: Resume) => {
    // Navigate to home with resume data in URL params
    navigate(`/?resumeId=${resume.id}`);
  };

  const handleEditResume = (resume: Resume) => {
    // Navigate to home with resume data in URL params for editing
    navigate(`/?resumeId=${resume.id}&edit=true`);
  };

  const deleteResume = async (id: string) => {
    const success = await ResumeService.deleteResume(id);
    if (success) {
      setResumes(prev => prev.filter(resume => resume.id !== id));
      toast({
        title: "Resume Deleted",
        description: "Your resume has been successfully deleted.",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Show loading only if auth is loading AND we haven't force loaded yet
  if (loading && !forceLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'profile', label: 'Profile & Sharing', icon: User },
    { id: 'messages', label: 'Messages', icon: MessageSquare, badge: unreadCount > 0 ? unreadCount : undefined },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Quick Stats */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">{resumes.length}</p>
                    <p className="text-sm text-gray-600">Total Resumes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Coins className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">{credits?.current_credits || 0}</p>
                    <p className="text-sm text-gray-600">Credits Remaining</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Clock className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold">{resumes.length > 0 ? formatDate(resumes[0].updated_at) : 'N/A'}</p>
                    <p className="text-sm text-gray-600">Last Activity</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case 'documents':
        return <DocumentLibrary />;
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'profile':
        return <ProfileSettings />;
      case 'messages':
        return <UserMessages />;
      default:
        return null;
    }
  };

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
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
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">Welcome back, {user?.email}</p>
            </div>
            <div className="flex items-center space-x-3">
              <NotificationCenter />
              <Button 
                onClick={() => setShowTemplates(true)}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <Star className="h-4 w-4" />
                <span>Browse Templates</span>
              </Button>
              <Button 
                onClick={() => navigate('/')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New Resume
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          {tabs.map(tab => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex-1 ${
                activeTab !== tab.id 
                  ? 'text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white' 
                  : ''
              }`}
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {renderTabContent()}

        {activeTab === 'overview' && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {resumes.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No activity yet</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">Create your first resume to get started</p>
                  <Button 
                    onClick={() => navigate('/')}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Resume
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {resumes.slice(0, 5).map((resume) => (
                    <div
                      key={resume.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
                          <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h4 className="font-medium text-sm text-gray-900 dark:text-white">{resume.title}</h4>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Updated {formatDate(resume.updated_at)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 px-2"
                          onClick={() => handleViewResume(resume)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 px-2"
                          onClick={() => handleEditResume(resume)}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {resumes.length > 5 && (
                    <div className="text-center pt-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setActiveTab('documents')}
                      >
                        View All Documents
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}
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

      {/* Resume Templates Modal */}
      {showTemplates && (
        <ResumeTemplates onClose={() => setShowTemplates(false)} />
      )}
    </div>
  );
};

export default Dashboard;
