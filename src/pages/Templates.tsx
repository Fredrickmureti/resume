
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Template } from '@/types/resume';
import { ArrowLeft, Star, Briefcase, Palette, Minimize, Crown, Eye, Code, Heart, GraduationCap, Calculator, TrendingUp, Target, Sparkles, Brush, Building, Gem } from 'lucide-react';
import { ResumePreview } from '@/components/ResumePreview';
import { getSampleResumeData } from '@/utils/sampleData';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';

const Templates = () => {
  const navigate = useNavigate();
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const sampleData = getSampleResumeData();

  const templates = [
    // Resume Templates (ATS-friendly, no images)
    {
      id: 'modern' as Template,
      name: 'Modern Professional',
      description: 'Clean and contemporary design perfect for tech and creative industries',
      preview: 'bg-gradient-to-br from-blue-500 to-purple-600',
      icon: Star,
      category: 'Popular',
      features: ['ATS Optimized', 'Color Accents', 'Modern Layout'],
      type: 'Resume',
      atsScore: 95
    },
    {
      id: 'classic' as Template,
      name: 'Classic Business',
      description: 'Traditional and conservative layout ideal for corporate positions',
      preview: 'bg-gray-800',
      icon: Briefcase,
      category: 'Professional',
      features: ['Conservative Design', 'Formal Structure', 'Universal Appeal'],
      type: 'Resume',
      atsScore: 98
    },
    {
      id: 'minimal' as Template,
      name: 'Minimal Clean',
      description: 'Simplified design focusing on content and readability',
      preview: 'bg-gray-100 border-2 border-gray-300',
      icon: Minimize,
      category: 'Simple',
      features: ['Clean Typography', 'Minimal Design', 'Focus on Content'],
      type: 'Resume',
      atsScore: 96
    },
    {
      id: 'executive' as Template,
      name: 'Executive Premium',
      description: 'Sophisticated layout for senior-level positions and executives',
      preview: 'bg-gradient-to-br from-gray-800 to-gray-900',
      icon: Crown,
      category: 'Premium',
      features: ['Premium Design', 'Executive Level', 'Sophisticated Layout'],
      type: 'Resume',
      atsScore: 94
    },
    {
      id: 'tech' as Template,
      name: 'Tech Developer',
      description: 'Code-inspired design perfect for software developers and engineers',
      preview: 'bg-gradient-to-br from-green-600 to-blue-800',
      icon: Code,
      category: 'Industry',
      features: ['Developer Focused', 'Technical Layout', 'Project Showcase'],
      type: 'Resume',
      atsScore: 93
    },
    {
      id: 'healthcare' as Template,
      name: 'Healthcare Professional',
      description: 'Medical-focused template for healthcare professionals',
      preview: 'bg-gradient-to-br from-teal-500 to-cyan-600',
      icon: Heart,
      category: 'Industry',
      features: ['Medical Focus', 'Clinical Experience', 'Certification Focused'],
      type: 'Resume',
      atsScore: 95
    },
    {
      id: 'finance' as Template,
      name: 'Finance Professional',
      description: 'Conservative template for banking and finance roles',
      preview: 'bg-gradient-to-br from-emerald-700 to-green-800',
      icon: Calculator,
      category: 'Industry',
      features: ['Professional', 'Numbers Focused', 'Conservative Design'],
      type: 'Resume',
      atsScore: 97
    },
    {
      id: 'consulting' as Template,
      name: 'Management Consulting',
      description: 'Strategic template for consulting professionals',
      preview: 'bg-gradient-to-br from-slate-700 to-gray-900',
      icon: TrendingUp,
      category: 'Industry',
      features: ['Strategic Focus', 'Problem Solving', 'Executive Style'],
      type: 'Resume',
      atsScore: 94
    },
    {
      id: 'marketing' as Template,
      name: 'Marketing & Sales',
      description: 'Dynamic template for marketing and sales professionals',
      preview: 'bg-gradient-to-br from-orange-500 to-red-600',
      icon: Target,
      category: 'Industry',
      features: ['Brand Focused', 'Creative Elements', 'Results Driven'],
      type: 'Resume',
      atsScore: 92
    },
    {
      id: 'sales' as Template,
      name: 'Sales Professional',
      description: 'Results-oriented template for sales roles',
      preview: 'bg-gradient-to-br from-blue-600 to-indigo-700',
      icon: TrendingUp,
      category: 'Industry',
      features: ['Achievement Focused', 'Numbers Driven', 'Performance Based'],
      type: 'Resume',
      atsScore: 93
    },

    // CV Templates (Can include images, more creative)
    {
      id: 'academic' as Template,
      name: 'Academic CV',
      description: 'Comprehensive template for academic and research positions',
      preview: 'bg-gradient-to-br from-indigo-600 to-purple-700',
      icon: GraduationCap,
      category: 'Academic',
      features: ['Research Focused', 'Publications', 'Academic Experience', 'Optional Photo'],
      type: 'CV',
      atsScore: 89
    },
    {
      id: 'luxury' as Template,
      name: 'Luxury Executive',
      description: 'Premium design with gold accents for high-end positions',
      preview: 'bg-gradient-to-br from-yellow-600 to-yellow-800',
      icon: Gem,
      category: 'Luxury',
      features: ['Premium Design', 'Gold Accents', 'Executive Level', 'Photo Support'],
      type: 'CV',
      atsScore: 85
    },
    {
      id: 'artistic' as Template,
      name: 'Creative Artist',
      description: 'Vibrant and expressive template for creative professionals',
      preview: 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400',
      icon: Brush,
      category: 'Creative',
      features: ['Artistic Design', 'Colorful Layout', 'Creative Focus', 'Photo Integration'],
      type: 'CV',
      atsScore: 78
    },
    {
      id: 'corporate' as Template,
      name: 'Corporate Executive',
      description: 'Professional corporate design with modern elements',
      preview: 'bg-gradient-to-br from-slate-600 to-slate-800',
      icon: Building,
      category: 'Corporate',
      features: ['Corporate Design', 'Professional Layout', 'Modern Elements', 'Optional Photo'],
      type: 'CV',
      atsScore: 88
    },
    {
      id: 'elegant' as Template,
      name: 'Elegant Classic',
      description: 'Sophisticated and refined design for distinguished professionals',
      preview: 'bg-gradient-to-br from-gray-400 to-gray-600',
      icon: Sparkles,
      category: 'Elegant',
      features: ['Sophisticated Design', 'Refined Typography', 'Classic Layout', 'Photo Support'],
      type: 'CV',
      atsScore: 82
    },
    {
      id: 'creative' as Template,
      name: 'Creative Professional',
      description: 'Dynamic template for designers and creative professionals',
      preview: 'bg-gradient-to-br from-purple-500 to-pink-500',
      icon: Palette,
      category: 'Creative',
      features: ['Creative Design', 'Visual Appeal', 'Portfolio Focus', 'Image Integration'],
      type: 'CV',
      atsScore: 80
    }
  ];

  const handleUseTemplate = (template: Template) => {
    localStorage.setItem('selectedTemplate', template);
    toast({
      title: "Template Selected",
      description: `${templates.find(t => t.id === template)?.name} template has been selected!`,
    });
    navigate('/');
  };

  const resumeTemplates = templates.filter(t => t.type === 'Resume');
  const cvTemplates = templates.filter(t => t.type === 'CV');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Builder
          </Button>
          
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Choose Your Template
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto px-4">
              Select from our professional templates designed for different industries and career levels.
            </p>
          </div>
        </div>

        {/* Resume Templates */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Resume Templates</h2>
            <p className="text-gray-600 dark:text-gray-300">ATS-optimized templates without photos for maximum compatibility</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {resumeTemplates.map((template) => {
              const IconComponent = template.icon;
              return (
                <Card 
                  key={template.id}
                  className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 dark:bg-gray-800 dark:border-gray-700"
                >
                  <CardContent className="p-0">
                    <div className={`h-32 sm:h-48 ${template.preview} rounded-t-lg flex items-center justify-center relative`}>
                      <IconComponent className="h-8 w-8 sm:h-12 sm:w-12 text-white" />
                      <Badge 
                        variant="secondary" 
                        className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-white/20 text-white border-white/30 text-xs"
                      >
                        {template.category}
                      </Badge>
                      <Badge 
                        variant="secondary" 
                        className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 bg-green-500 text-white border-none text-xs"
                      >
                        ATS {template.atsScore}%
                      </Badge>
                    </div>
                    
                    <div className="p-4 sm:p-6">
                      <h3 className="font-semibold text-lg sm:text-xl mb-2 sm:mb-3 dark:text-white">{template.name}</h3>
                      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-3 sm:mb-4">{template.description}</p>
                      
                      <div className="flex flex-wrap gap-1 sm:gap-2 mb-4 sm:mb-6">
                        {template.features.map((feature, index) => (
                          <Badge key={index} variant="outline" className="text-xs dark:border-gray-600 dark:text-gray-300">
                            {feature}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline"
                              className="flex-1 text-sm"
                              onClick={() => setPreviewTemplate(template.id)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Preview
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>{template.name} Template Preview</DialogTitle>
                            </DialogHeader>
                            <div className="mt-4">
                              <ResumePreview 
                                data={sampleData}
                                template={template.id}
                              />
                            </div>
                          </DialogContent>
                        </Dialog>
                        
                        <Button 
                          onClick={() => handleUseTemplate(template.id)}
                          className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-sm"
                        >
                          Use Template
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* CV Templates */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">CV Templates</h2>
            <p className="text-gray-600 dark:text-gray-300">Creative templates with optional photo support for academic and creative fields</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {cvTemplates.map((template) => {
              const IconComponent = template.icon;
              return (
                <Card 
                  key={template.id}
                  className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 dark:bg-gray-800 dark:border-gray-700"
                >
                  <CardContent className="p-0">
                    <div className={`h-32 sm:h-48 ${template.preview} rounded-t-lg flex items-center justify-center relative`}>
                      <IconComponent className="h-8 w-8 sm:h-12 sm:w-12 text-white" />
                      <Badge 
                        variant="secondary" 
                        className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-white/20 text-white border-white/30 text-xs"
                      >
                        {template.category}
                      </Badge>
                      <Badge 
                        variant="secondary" 
                        className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 bg-yellow-500 text-white border-none text-xs"
                      >
                        ATS {template.atsScore}%
                      </Badge>
                    </div>
                    
                    <div className="p-4 sm:p-6">
                      <h3 className="font-semibold text-lg sm:text-xl mb-2 sm:mb-3 dark:text-white">{template.name}</h3>
                      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-3 sm:mb-4">{template.description}</p>
                      
                      <div className="flex flex-wrap gap-1 sm:gap-2 mb-4 sm:mb-6">
                        {template.features.map((feature, index) => (
                          <Badge key={index} variant="outline" className="text-xs dark:border-gray-600 dark:text-gray-300">
                            {feature}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline"
                              className="flex-1 text-sm"
                              onClick={() => setPreviewTemplate(template.id)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Preview
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>{template.name} Template Preview</DialogTitle>
                            </DialogHeader>
                            <div className="mt-4">
                              <ResumePreview 
                                data={sampleData}
                                template={template.id}
                              />
                            </div>
                          </DialogContent>
                        </Dialog>
                        
                        <Button 
                          onClick={() => handleUseTemplate(template.id)}
                          className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-sm"
                        >
                          Use Template
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-blue-50 dark:bg-gray-800 rounded-lg">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-4 text-base sm:text-lg">💡 Template Selection Guide</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800 dark:text-blue-200">
            <div>
              <h5 className="font-semibold mb-2">Resume vs CV:</h5>
              <ul className="space-y-1">
                <li>• <strong>Resume:</strong> 1-2 pages, ATS-optimized, no photos</li>
                <li>• <strong>CV:</strong> Comprehensive, can include photos</li>
                <li>• <strong>ATS Score:</strong> Higher = better job board compatibility</li>
                <li>• <strong>Photo Support:</strong> Only available in CV templates</li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-2">When to Use CVs:</h5>
              <ul className="space-y-1">
                <li>• <strong>Academic:</strong> Research positions, professorships</li>
                <li>• <strong>Creative:</strong> Design, art, photography roles</li>
                <li>• <strong>Executive:</strong> C-level positions in creative industries</li>
                <li>• <strong>International:</strong> European and other global markets</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Templates;
