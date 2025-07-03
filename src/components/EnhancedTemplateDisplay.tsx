
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExternalLink, Eye, Palette, FileText, GraduationCap } from 'lucide-react';
import { Template } from '@/types/resume';
import { useNavigate } from 'react-router-dom';

interface TemplateInfo {
  id: Template;
  name: string;
  description: string;
  category: 'resume' | 'cv' | 'both';
  features: string[];
  preview: string;
  bestFor: string[];
}

const templateData: TemplateInfo[] = [
  {
    id: 'modern',
    name: 'Modern Professional',
    description: 'Clean, contemporary design with bold headers and structured layout',
    category: 'both',
    features: ['Clean typography', 'Color accents', 'Structured sections'],
    preview: '/templates/modern-preview.jpg',
    bestFor: ['Technology', 'Creative', 'Business']
  },
  {
    id: 'classic',
    name: 'Classic Traditional',
    description: 'Timeless design perfect for conservative industries',
    category: 'both',
    features: ['Traditional layout', 'Professional fonts', 'Minimal styling'],
    preview: '/templates/classic-preview.jpg',
    bestFor: ['Finance', 'Law', 'Government']
  },
  {
    id: 'creative',
    name: 'Creative Showcase',
    description: 'Vibrant design to showcase creativity and personality',
    category: 'resume',
    features: ['Colorful design', 'Creative layouts', 'Visual elements'],
    preview: '/templates/creative-preview.jpg',
    bestFor: ['Design', 'Marketing', 'Media']
  },
  {
    id: 'executive',
    name: 'Executive Elite',
    description: 'Sophisticated design for senior-level positions',
    category: 'both',
    features: ['Premium styling', 'Executive focus', 'Leadership emphasis'],
    preview: '/templates/executive-preview.jpg',
    bestFor: ['Executive', 'Management', 'Consulting']
  },
  {
    id: 'academic',
    name: 'Academic Scholar',
    description: 'Comprehensive format for academic and research positions',
    category: 'cv',
    features: ['Detailed sections', 'Publication focus', 'Research emphasis'],
    preview: '/templates/academic-preview.jpg',
    bestFor: ['Academia', 'Research', 'Education']
  },
  {
    id: 'tech',
    name: 'Tech Innovator',
    description: 'Modern design tailored for technology professionals',
    category: 'resume',
    features: ['Tech-focused', 'Skills emphasis', 'Project showcase'],
    preview: '/templates/tech-preview.jpg',
    bestFor: ['Software', 'Engineering', 'IT']
  }
];

interface EnhancedTemplateDisplayProps {
  selectedTemplate: Template;
  onTemplateChange: (template: Template) => void;
  documentType?: 'resume' | 'cv';
  showBrowseAll?: boolean;
}

export const EnhancedTemplateDisplay: React.FC<EnhancedTemplateDisplayProps> = ({
  selectedTemplate,
  onTemplateChange,
  documentType = 'resume',
  showBrowseAll = true
}) => {
  const [activeTab, setActiveTab] = useState<'resume' | 'cv'>(documentType);
  const navigate = useNavigate();

  const filteredTemplates = templateData.filter(template => 
    template.category === activeTab || template.category === 'both'
  );

  const handleBrowseAllTemplates = () => {
    navigate('/templates');
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'cv': return <GraduationCap className="h-4 w-4" />;
      case 'resume': return <FileText className="h-4 w-4" />;
      default: return <Palette className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Choose Template
          </CardTitle>
          {showBrowseAll && (
            <Button variant="outline" size="sm" onClick={handleBrowseAllTemplates}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Browse All Templates
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="resume" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Resume Templates
            </TabsTrigger>
            <TabsTrigger value="cv" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              CV Templates
            </TabsTrigger>
          </TabsList>

          <TabsContent value="resume" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                    selectedTemplate === template.id
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => onTemplateChange(template.id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(template.category)}
                      <h3 className="font-semibold">{template.name}</h3>
                    </div>
                    {selectedTemplate === template.id && (
                      <Badge variant="default" className="bg-blue-500">
                        Selected
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                  
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs font-medium text-gray-700 mb-1">Features:</p>
                      <div className="flex flex-wrap gap-1">
                        {template.features.map((feature, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-xs font-medium text-gray-700 mb-1">Best for:</p>
                      <p className="text-xs text-gray-600">
                        {template.bestFor.join(', ')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Could implement preview modal here
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="cv" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                    selectedTemplate === template.id
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => onTemplateChange(template.id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(template.category)}
                      <h3 className="font-semibold">{template.name}</h3>
                    </div>
                    {selectedTemplate === template.id && (
                      <Badge variant="default" className="bg-blue-500">
                        Selected
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                  
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs font-medium text-gray-700 mb-1">Features:</p>
                      <div className="flex flex-wrap gap-1">
                        {template.features.map((feature, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-xs font-medium text-gray-700 mb-1">Best for:</p>
                      <p className="text-xs text-gray-600">
                        {template.bestFor.join(', ')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Could implement preview modal here
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Palette className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No templates available for {activeTab}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
