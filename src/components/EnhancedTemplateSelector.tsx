
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Template } from '@/types/resume';
import { Check, ArrowRight, Briefcase, Palette, Minimize, Crown, Star, Zap, Globe, Users, Code, GraduationCap } from 'lucide-react';

interface EnhancedTemplateSelectorProps {
  selectedTemplate: Template;
  onTemplateChange: (template: Template) => void;
  documentType?: 'resume' | 'cv';
  showAllTemplates?: boolean;
  onBrowseAllClick?: () => void;
}

interface TemplateData {
  id: Template;
  name: string;
  description: string;
  preview: string;
  icon: any;
  category: string;
  industries: string[];
  isPopular?: boolean;
  documentTypes: ('resume' | 'cv')[];
}

export const EnhancedTemplateSelector: React.FC<EnhancedTemplateSelectorProps> = ({ 
  selectedTemplate, 
  onTemplateChange,
  documentType = 'resume',
  showAllTemplates = false,
  onBrowseAllClick
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const allTemplates: TemplateData[] = [
    {
      id: 'modern' as Template,
      name: 'Modern Professional',
      description: 'Clean and contemporary design perfect for tech and creative industries',
      preview: 'bg-gradient-to-br from-blue-500 to-purple-600',
      icon: Star,
      category: 'Professional',
      industries: ['Technology', 'Marketing', 'Design'],
      isPopular: true,
      documentTypes: ['resume', 'cv']
    },
    {
      id: 'classic' as Template,
      name: 'Classic Business',
      description: 'Traditional and conservative layout ideal for corporate positions',
      preview: 'bg-gray-800',
      icon: Briefcase,
      category: 'Traditional',
      industries: ['Finance', 'Law', 'Consulting'],
      isPopular: true,
      documentTypes: ['resume', 'cv']
    },
    {
      id: 'creative' as Template,
      name: 'Creative Designer',
      description: 'Vibrant and artistic template for creative professionals',
      preview: 'bg-gradient-to-br from-purple-500 to-pink-500',
      icon: Palette,
      category: 'Creative',
      industries: ['Design', 'Arts', 'Media'],
      isPopular: true,
      documentTypes: ['resume', 'cv']
    },
    {
      id: 'minimal' as Template,
      name: 'Minimal Clean',
      description: 'Simplified design focusing on content and readability',
      preview: 'bg-gray-100 border-2 border-gray-300',
      icon: Minimize,
      category: 'Minimal',
      industries: ['Academic', 'Research', 'Consulting'],
      isPopular: true,
      documentTypes: ['resume', 'cv']
    },
    {
      id: 'executive' as Template,
      name: 'Executive Premium',
      description: 'Sophisticated layout for senior-level positions and executives',
      preview: 'bg-gradient-to-br from-gray-800 to-gray-900',
      icon: Crown,
      category: 'Executive',
      industries: ['Executive', 'C-Suite', 'Board'],
      isPopular: true,
      documentTypes: ['resume', 'cv']
    },
    // Additional templates for comprehensive selection
    {
      id: 'tech' as Template,
      name: 'Tech Innovator',
      description: 'Modern tech-focused design with clean lines and data visualization elements',
      preview: 'bg-gradient-to-br from-green-500 to-blue-500',
      icon: Code,
      category: 'Technology',
      industries: ['Software', 'Data Science', 'Engineering'],
      documentTypes: ['resume', 'cv']
    },
    {
      id: 'academic' as Template,
      name: 'Academic Scholar',
      description: 'Professional academic template with emphasis on publications and research',
      preview: 'bg-gradient-to-br from-indigo-600 to-purple-700',
      icon: GraduationCap,
      category: 'Academic',
      industries: ['Academia', 'Research', 'Education'],
      documentTypes: ['cv']
    },
    {
      id: 'startup' as Template,
      name: 'Startup Hustler',
      description: 'Dynamic template perfect for startup environments and entrepreneurial roles',
      preview: 'bg-gradient-to-br from-orange-500 to-red-500',
      icon: Zap,
      category: 'Startup',
      industries: ['Startup', 'Entrepreneurship', 'Innovation'],
      documentTypes: ['resume']
    },
    {
      id: 'international' as Template,
      name: 'Global Professional',
      description: 'International-friendly design suitable for global job markets',
      preview: 'bg-gradient-to-br from-teal-500 to-cyan-500',
      icon: Globe,
      category: 'International',
      industries: ['International', 'Remote', 'Consulting'],
      documentTypes: ['resume', 'cv']
    },
    {
      id: 'manager' as Template,
      name: 'Team Leader',
      description: 'Leadership-focused template highlighting management and team achievements',
      preview: 'bg-gradient-to-br from-amber-600 to-orange-600',
      icon: Users,
      category: 'Leadership',
      industries: ['Management', 'Operations', 'Project Management'],
      documentTypes: ['resume', 'cv']
    }
  ];

  // Filter templates based on document type
  const filteredByType = allTemplates.filter(template => 
    template.documentTypes.includes(documentType)
  );

  // Get popular templates for quick selection
  const popularTemplates = filteredByType.filter(template => template.isPopular);

  // Filter by category if selected
  const displayTemplates = showAllTemplates 
    ? (selectedCategory === 'all' ? filteredByType : filteredByType.filter(t => t.category === selectedCategory))
    : popularTemplates;

  const categories = ['all', ...Array.from(new Set(filteredByType.map(t => t.category)))];

  return (
    <div className="space-y-4">
      {showAllTemplates && (
        <>
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">
              Choose {documentType === 'cv' ? 'CV' : 'Resume'} Template
            </h3>
            <p className="text-sm text-gray-600">
              Browse all {documentType} templates and find the perfect match for your industry
            </p>
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category === 'all' ? 'All Categories' : category}
              </Button>
            ))}
          </div>
        </>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayTemplates.map((template) => {
          const IconComponent = template.icon;
          return (
            <Card 
              key={template.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                selectedTemplate === template.id 
                  ? 'ring-2 ring-blue-500 shadow-md' 
                  : 'hover:ring-1 hover:ring-gray-300'
              }`}
              onClick={() => onTemplateChange(template.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`w-12 h-16 rounded ${template.preview} flex-shrink-0 flex items-center justify-center`}>
                    <IconComponent className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-sm">{template.name}</h4>
                      {selectedTemplate === template.id && (
                        <Check className="h-4 w-4 text-blue-500" />
                      )}
                    </div>
                    <div className="flex items-center gap-1 mb-2">
                      <Badge variant="outline" className="text-xs">
                        {template.category}
                      </Badge>
                      {template.isPopular && (
                        <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                          Popular
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-600 mb-2">{template.description}</p>
                <div className="text-xs text-gray-500">
                  <span className="font-medium">Best for:</span> {template.industries.slice(0, 2).join(', ')}
                  {template.industries.length > 2 && '...'}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {!showAllTemplates && onBrowseAllClick && (
        <div className="text-center pt-2">
          <p className="text-xs text-gray-500">
            Showing {popularTemplates.length} popular templates • {filteredByType.length} total available for {documentType}s
          </p>
        </div>
      )}
    </div>
  );
};
