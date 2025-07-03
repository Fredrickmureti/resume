
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save } from 'lucide-react';
import { ResumeData, Template } from '@/types/resume';
import { ResumeService } from '@/services/resumeService';
import { toast } from '@/components/ui/use-toast';

interface SaveResumeDialogProps {
  resumeData: ResumeData;
  template: Template;
  currentTitle?: string;
  resumeId?: string;
  onSave: (savedResume: any) => void;
  children?: React.ReactNode;
}

export const SaveResumeDialog: React.FC<SaveResumeDialogProps> = ({
  resumeData,
  template,
  currentTitle = '',
  resumeId,
  onSave,
  children
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState(currentTitle);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter a title for your resume.",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      const savedResume = await ResumeService.saveResume(
        resumeData,
        template,
        title.trim(),
        resumeId
      );

      if (savedResume) {
        onSave(savedResume);
        setIsOpen(false);
        toast({
          title: "Resume Saved",
          description: `Your resume "${title}" has been saved successfully.`,
        });
      }
    } catch (error) {
      console.error('Error saving resume:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" className="flex items-center space-x-2">
            <Save className="h-4 w-4" />
            <span>{resumeId ? 'Update Resume' : 'Save Resume'}</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {resumeId ? 'Update Resume' : 'Save Resume'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="resume-title">Resume Title</Label>
            <Input
              id="resume-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Software Engineer - Google, Marketing Manager - Tech Startup"
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              Choose a descriptive title to help you identify this resume later
            </p>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : (resumeId ? 'Update' : 'Save')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
