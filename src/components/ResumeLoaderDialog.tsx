
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FolderOpen, Calendar, Building, Briefcase } from 'lucide-react';
import { ResumeService, SavedResume } from '@/services/resumeService';
import { formatDistanceToNow } from 'date-fns';

interface ResumeLoaderDialogProps {
  onLoadResume: (resume: SavedResume) => void;
  children?: React.ReactNode;
}

export const ResumeLoaderDialog: React.FC<ResumeLoaderDialogProps> = ({
  onLoadResume,
  children
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [resumes, setResumes] = useState<SavedResume[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchResumes = async () => {
    setLoading(true);
    try {
      const userResumes = await ResumeService.getUserResumes();
      setResumes(userResumes);
    } catch (error) {
      console.error('Error fetching resumes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchResumes();
    }
  }, [isOpen]);

  const handleLoadResume = (resume: SavedResume) => {
    onLoadResume(resume);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" className="flex items-center space-x-2">
            <FolderOpen className="h-4 w-4" />
            <span>Load Resume</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Load Existing Resume</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your resumes...</p>
            </div>
          ) : resumes.length === 0 ? (
            <div className="text-center py-8">
              <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No saved resumes found</p>
              <p className="text-sm text-gray-500">Create and save your first resume to see it here</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {resumes.map((resume) => (
                <Card key={resume.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleLoadResume(resume)}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-2">{resume.title}</h3>
                        <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDistanceToNow(new Date(resume.updated_at), { addSuffix: true })}
                          </div>
                          {resume.job_company && (
                            <div className="flex items-center gap-1">
                              <Building className="h-3 w-3" />
                              {resume.job_company}
                            </div>
                          )}
                          {resume.job_position && (
                            <div className="flex items-center gap-1">
                              <Briefcase className="h-3 w-3" />
                              {resume.job_position}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="outline" className="text-xs">
                            {resume.template}
                          </Badge>
                          <Badge 
                            variant={resume.is_complete ? "default" : "secondary"} 
                            className="text-xs"
                          >
                            {resume.is_complete ? "Complete" : "Draft"}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Score: {resume.content_validation_score}%
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
