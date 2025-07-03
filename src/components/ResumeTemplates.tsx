
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Template } from '@/types/resume';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { EnhancedTemplateSelector } from './EnhancedTemplateSelector';

interface ResumeTemplatesProps {
  onClose: () => void;
  documentType?: 'resume' | 'cv';
}

export const ResumeTemplates: React.FC<ResumeTemplatesProps> = ({ 
  onClose,
  documentType = 'resume' 
}) => {
  const navigate = useNavigate();
  const [selectedTemplate, setSelectedTemplate] = useState<Template>('modern');

  const handleUseTemplate = (template: Template) => {
    localStorage.setItem('selectedTemplate', template);
    localStorage.setItem('documentType', documentType);
    navigate('/');
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">
              Choose Your {documentType === 'cv' ? 'CV' : 'Resume'} Template
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="mt-6">
          <EnhancedTemplateSelector
            selectedTemplate={selectedTemplate}
            onTemplateChange={setSelectedTemplate}
            documentType={documentType}
            showAllTemplates={true}
          />
        </div>

        <div className="flex justify-end gap-2 mt-6 p-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={() => handleUseTemplate(selectedTemplate)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            Use Selected Template
          </Button>
        </div>

        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">💡 Template Selection Tips</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>Tech/Startup:</strong> Choose Modern Professional or Tech Innovator</li>
            <li>• <strong>Corporate/Finance:</strong> Classic Business template is ideal for traditional industries</li>
            <li>• <strong>Creative Fields:</strong> Creative Designer template showcases your artistic side</li>
            <li>• <strong>Academic/Research:</strong> Academic Scholar or Minimal Clean focuses on content</li>
            <li>• <strong>Executive Roles:</strong> Executive Premium for senior-level positions</li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
};
