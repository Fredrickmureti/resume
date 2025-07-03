import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Download,
  Eye,
  Copy,
  Calendar,
  Building,
  Briefcase
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { CoverLetterService, CoverLetter } from '@/services/coverLetterService';
import { ResumeService } from '@/services/resumeService';
import { toast } from '@/components/ui/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { CreateDocumentDialog } from '@/components/CreateDocumentDialog';
import { useNavigate } from 'react-router-dom';

interface Resume {
  id: string;
  title: string;
  template: string;
  job_company?: string;
  job_position?: string;
  application_status?: string;
  created_at: string;
  updated_at: string;
  data?: any;
}

export const DocumentLibrary: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [coverLetters, setCoverLetters] = useState<CoverLetter[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'resumes' | 'cover-letters'>('resumes');
  const [loading, setLoading] = useState(true);

  const fetchDocuments = async () => {
    if (!user?.id) {
      console.log('DocumentLibrary: No user ID available');
      return;
    }

    try {
      setLoading(true);
      console.log('DocumentLibrary: Starting document fetch for user:', user.id);
      console.log('DocumentLibrary: User email:', user.email);
      
      // Debug: First, let's check if user exists in profiles table
      const { data: profileCheck, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      console.log('DocumentLibrary: Profile check result:', { profileCheck, profileError });

      // Fetch resumes with detailed debugging
      console.log('DocumentLibrary: Fetching resumes...');
      const { data: resumesData, error: resumesError } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      console.log('DocumentLibrary: Resume query executed');
      console.log('DocumentLibrary: Resume data:', resumesData);
      console.log('DocumentLibrary: Resume error:', resumesError);
      console.log('DocumentLibrary: Resume count:', resumesData?.length || 0);

      if (resumesError) {
        console.error('DocumentLibrary: Resume fetch error details:', {
          code: resumesError.code,
          message: resumesError.message,
          details: resumesError.details,
          hint: resumesError.hint
        });
        throw resumesError;
      }

      // Fetch cover letters with detailed debugging
      console.log('DocumentLibrary: Fetching cover letters...');
      const coverLettersData = await CoverLetterService.getUserCoverLetters(user.id);
      console.log('DocumentLibrary: Cover letters data:', coverLettersData);
      console.log('DocumentLibrary: Cover letters count:', coverLettersData?.length || 0);

      // Debug: Let's also check what resumes exist for ANY user to see if there's data at all
      const { data: allResumes, error: allResumesError } = await supabase
        .from('resumes')
        .select('id, user_id, title, created_at')
        .limit(10);
      
      console.log('DocumentLibrary: Sample of all resumes in database:', allResumes);
      console.log('DocumentLibrary: All resumes query error:', allResumesError);

      if (resumesData) {
        console.log('DocumentLibrary: Setting resumes data:', resumesData);
        setResumes(resumesData);
      } else {
        console.log('DocumentLibrary: No resume data returned, setting empty array');
        setResumes([]);
      }
      
      setCoverLetters(coverLettersData);
      
      console.log('DocumentLibrary: Final state - Resumes:', resumesData?.length || 0, 'Cover letters:', coverLettersData?.length || 0);
    } catch (error) {
      console.error('DocumentLibrary: Error in fetchDocuments:', error);
      console.error('DocumentLibrary: Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      toast({
        title: "Error",
        description: "Failed to load your documents.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
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

  const deleteCoverLetter = async (id: string) => {
    const success = await CoverLetterService.deleteCoverLetter(id);
    if (success) {
      setCoverLetters(prev => prev.filter(letter => letter.id !== id));
      toast({
        title: "Cover Letter Deleted",
        description: "Your cover letter has been successfully deleted.",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to delete cover letter.",
        variant: "destructive"
      });
    }
  };

  const duplicateCoverLetter = async (id: string) => {
    const duplicate = await CoverLetterService.duplicateCoverLetter(id);
    if (duplicate) {
      setCoverLetters(prev => [duplicate, ...prev]);
      toast({
        title: "Cover Letter Duplicated",
        description: "A copy of your cover letter has been created.",
      });
    }
  };

  const handleViewResume = (resume: Resume) => {
    navigate('/', { 
      state: { 
        resumeData: resume.data, 
        template: resume.template,
        resumeId: resume.id,
        title: resume.title
      } 
    });
  };

  const handleEditResume = (resume: Resume) => {
    navigate('/', { 
      state: { 
        resumeData: resume.data, 
        template: resume.template,
        resumeId: resume.id,
        title: resume.title,
        editMode: true
      } 
    });
  };

  const handleDownloadResume = async (resume: Resume) => {
    try {
      const resumeElement = document.createElement('div');
      resumeElement.innerHTML = `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
          <h1>${resume.title}</h1>
          <p>Template: ${resume.template}</p>
          <p>Last updated: ${new Date(resume.updated_at).toLocaleDateString()}</p>
          <p>This is a basic text export. For better formatting, please use the full resume builder.</p>
        </div>
      `;
      
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(resumeElement.innerHTML);
        printWindow.document.close();
        printWindow.print();
      }
      
      toast({
        title: "Download Started",
        description: "Your resume is being prepared for download.",
      });
    } catch (error) {
      console.error('Error downloading resume:', error);
      toast({
        title: "Download Error",
        description: "Failed to download resume. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'applied': return 'bg-blue-100 text-blue-800';
      case 'interviewing': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredResumes = resumes.filter(resume =>
    resume.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resume.job_company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resume.job_position?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCoverLetters = coverLetters.filter(letter =>
    letter.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    letter.job_company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    letter.job_position?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    fetchDocuments();
  }, [user?.id]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-foreground">
              <FileText className="h-5 w-5" />
              Document Library
            </CardTitle>
            <CreateDocumentDialog onDocumentCreated={fetchDocuments} />
          </div>
        </CardHeader>
        <CardContent>
          {/* Debug Info */}
          {user && (
            <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-800 rounded text-xs">
              <strong>Debug Info:</strong><br />
              User ID: {user.id}<br />
              Email: {user.email}<br />
              Resumes: {resumes.length}<br />
              Cover Letters: {coverLetters.length}
            </div>
          )}

          {/* Search and Filter */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-background text-foreground"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 bg-muted p-1 rounded-lg">
            <Button
              variant={activeTab === 'resumes' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('resumes')}
              className="flex-1"
            >
              Resumes ({filteredResumes.length})
            </Button>
            <Button
              variant={activeTab === 'cover-letters' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('cover-letters')}
              className="flex-1"
            >
              Cover Letters ({filteredCoverLetters.length})
            </Button>
          </div>

          {/* Document Grid */}
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading documents...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeTab === 'resumes' ? (
                filteredResumes.length === 0 ? (
                  <div className="col-span-full text-center py-8 text-muted-foreground">
                    No resumes found
                  </div>
                ) : (
                  filteredResumes.map((resume) => (
                    <Card key={resume.id} className="hover:shadow-md transition-shadow bg-card">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-medium text-sm line-clamp-1 mb-1 text-card-foreground">
                              {resume.title}
                            </h3>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                              <Calendar className="h-3 w-3" />
                              {formatDistanceToNow(new Date(resume.updated_at), { addSuffix: true })}
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {resume.template}
                          </Badge>
                        </div>

                        {resume.job_company && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                            <Building className="h-3 w-3" />
                            {resume.job_company}
                          </div>
                        )}

                        {resume.job_position && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                            <Briefcase className="h-3 w-3" />
                            {resume.job_position}
                          </div>
                        )}

                        {resume.application_status && (
                          <Badge className={`text-xs mb-3 ${getStatusColor(resume.application_status)}`}>
                            {resume.application_status}
                          </Badge>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-7 w-7 p-0"
                              onClick={() => handleViewResume(resume)}
                              title="View Resume"
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-7 w-7 p-0"
                              onClick={() => handleEditResume(resume)}
                              title="Edit Resume"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-7 w-7 p-0"
                              onClick={() => handleDownloadResume(resume)}
                              title="Download Resume"
                            >
                              <Download className="h-3 w-3" />
                            </Button>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                            onClick={() => deleteResume(resume.id)}
                            title="Delete Resume"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )
              ) : (
                filteredCoverLetters.length === 0 ? (
                  <div className="col-span-full text-center py-8 text-muted-foreground">
                    No cover letters found
                  </div>
                ) : (
                  filteredCoverLetters.map((letter) => (
                    <Card key={letter.id} className="hover:shadow-md transition-shadow bg-card">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-medium text-sm line-clamp-1 mb-1 text-card-foreground">
                              {letter.title}
                            </h3>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                              <Calendar className="h-3 w-3" />
                              {formatDistanceToNow(new Date(letter.updated_at), { addSuffix: true })}
                            </div>
                          </div>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${letter.status === 'final' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : ''}`}
                          >
                            {letter.status}
                          </Badge>
                        </div>

                        {letter.job_company && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                            <Building className="h-3 w-3" />
                            {letter.job_company}
                          </div>
                        )}

                        {letter.job_position && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                            <Briefcase className="h-3 w-3" />
                            {letter.job_position}
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-7 w-7 p-0"
                              onClick={() => duplicateCoverLetter(letter.id)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                            onClick={() => deleteCoverLetter(letter.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
