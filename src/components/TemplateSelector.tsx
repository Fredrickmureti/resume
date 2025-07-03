
import React, { useState } from 'react';
import { Template } from '@/types/resume';
import { EnhancedTemplateSelector } from './EnhancedTemplateSelector';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, GraduationCap, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TemplateSelectorProps {
  selectedTemplate: Template;
  onTemplateChange: (template: Template) => void;
  documentType?: 'resume' | 'cv';
  onBrowseAllClick?: () => void;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({ 
  selectedTemplate, 
  onTemplateChange,
  documentType = 'resume',
  onBrowseAllClick
}) => {
  const [currentDocumentType, setCurrentDocumentType] = useState<'resume' | 'cv'>(documentType);
  const navigate = useNavigate();

  const handleBrowseAllTemplates = () => {
    if (onBrowseAllClick) {
      onBrowseAllClick();
    } else {
      navigate('/templates');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Document Type Toggle */}
      <div className="text-center space-y-4">
        <h3 className="text-xl font-semibold">Choose Your Template</h3>
        <p className="text-sm text-gray-600">
          Select the perfect template for your professional document
        </p>
        
        {/* Document Type Toggle */}
        <div className="flex items-center justify-center gap-2">
          <Button
            variant={currentDocumentType === 'resume' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCurrentDocumentType('resume')}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Resume
            {currentDocumentType === 'resume' && (
              <Badge variant="secondary" className="ml-1 text-xs">
                Active
              </Badge>
            )}
          </Button>
          <Button
            variant={currentDocumentType === 'cv' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCurrentDocumentType('cv')}
            className="flex items-center gap-2"
          >
            <GraduationCap className="h-4 w-4" />
            CV
            {currentDocumentType === 'cv' && (
              <Badge variant="secondary" className="ml-1 text-xs">
                Active
              </Badge>
            )}
          </Button>
        </div>
        
        {/* Document Type Description */}
        <div className="text-xs text-gray-500 max-w-md mx-auto">
          {currentDocumentType === 'resume' ? (
            <p>Resume templates are concise and focused on key achievements, perfect for most job applications.</p>
          ) : (
            <p>CV templates provide comprehensive academic and professional history, ideal for academic and research positions.</p>
          )}
        </div>
      </div>

      {/* Template Selector */}
      <EnhancedTemplateSelector
        selectedTemplate={selectedTemplate}
        onTemplateChange={onTemplateChange}
        documentType={currentDocumentType}
        showAllTemplates={false}
        onBrowseAllClick={handleBrowseAllTemplates}
      />

      {/* Browse All Templates Button */}
      <div className="text-center pt-4 border-t">
        <Button 
          variant="outline" 
          onClick={handleBrowseAllTemplates}
          className="flex items-center gap-2 mx-auto"
          size="lg"
        >
          <span>Explore More Templates</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
        <p className="text-xs text-gray-500 mt-2">
          Browse our complete collection of professional templates
        </p>
      </div>

      {/* Template Tips */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
          <span>💡</span>
          Template Selection Tips
        </h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>Tech/Startup:</strong> Modern Professional or Tech templates work best</li>
          <li>• <strong>Corporate/Finance:</strong> Classic Business for traditional industries</li>
          <li>• <strong>Creative Fields:</strong> Creative templates showcase your artistic side</li>
          <li>• <strong>Academic/Research:</strong> Academic or Minimal templates focus on content</li>
        </ul>
      </div>
    </div>
  );
};
