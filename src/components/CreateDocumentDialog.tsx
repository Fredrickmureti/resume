
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, FileText, Mail, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';

interface CreateDocumentDialogProps {
  onDocumentCreated: () => void;
}

export const CreateDocumentDialog: React.FC<CreateDocumentDialogProps> = ({ onDocumentCreated }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [docType, setDocType] = useState<'resume' | 'cover-letter'>('resume');
  const [title, setTitle] = useState('');

  const handleCreate = () => {
    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create documents.",
        variant: "destructive"
      });
      return;
    }

    if (!title.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter a title for your document.",
        variant: "destructive"
      });
      return;
    }

    if (docType === 'resume') {
      // Store the document type and title for the builder
      localStorage.setItem('documentType', 'resume');
      localStorage.setItem('documentTitle', title.trim());
      
      // Navigate to the resume builder
      navigate('/');
      
      toast({
        title: "Redirecting to Resume Builder",
        description: "Choose a template and start building your resume!",
      });
    } else {
      // For cover letters, we can create them directly since they're simpler
      // This would be handled by the existing cover letter creation logic
      toast({
        title: "Cover Letter Creation",
        description: "Cover letter creation coming soon!",
      });
    }

    setOpen(false);
    setTitle('');
    onDocumentCreated();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Create New
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Document</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="docType">Document Type</Label>
            <Select value={docType} onValueChange={(value: 'resume' | 'cover-letter') => setDocType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="resume">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Resume/CV
                  </div>
                </SelectItem>
                <SelectItem value="cover-letter">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Cover Letter
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="title">Document Title</Label>
            <Input
              id="title"
              placeholder={`Enter ${docType === 'resume' ? 'resume' : 'cover letter'} title`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800">
              {docType === 'resume' 
                ? "📝 You'll be redirected to the resume builder where you can choose a template and build your resume step by step."
                : "📝 This will create a new cover letter document that you can edit and customize."
              }
            </p>
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreate} 
              disabled={!title.trim()}
              className="flex items-center gap-2"
            >
              {docType === 'resume' ? 'Start Building' : 'Create'}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
