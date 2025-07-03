import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PersonalInfoForm } from '@/components/forms/PersonalInfoForm';
import { SummaryForm } from '@/components/forms/SummaryForm';
import { ExperienceForm } from '@/components/forms/ExperienceForm';
import { EducationForm } from '@/components/forms/EducationForm';
import { SkillsForm } from '@/components/forms/SkillsForm';
import { ProjectsForm } from '@/components/forms/ProjectsForm';
import { ReferencesForm } from '@/components/forms/ReferencesForm';
import { ResumeData } from '@/types/resume';
import { FileText, User, Briefcase, GraduationCap, Award, FolderOpen, Users, BookOpen } from 'lucide-react';

interface CVBuilderProps {
  resumeData: ResumeData;
  onUpdate: (data: ResumeData) => void;
}

export const CVBuilder: React.FC<CVBuilderProps> = ({ resumeData, onUpdate }) => {
  const [activeTab, setActiveTab] = useState('personal');

  const cvSections = [
    { id: 'personal', label: 'Personal Info', icon: User, required: true },
    { id: 'summary', label: 'Research Profile', icon: FileText, required: true },
    { id: 'education', label: 'Education', icon: GraduationCap, required: true },
    { id: 'experience', label: 'Academic Experience', icon: Briefcase, required: false },
    { id: 'research', label: 'Research & Publications', icon: BookOpen, required: false },
    { id: 'skills', label: 'Skills & Competencies', icon: Award, required: false },
    { id: 'projects', label: 'Projects', icon: FolderOpen, required: false },
    { id: 'references', label: 'References', icon: Users, required: false },
  ];

  const getCompletionStatus = (sectionId: string) => {
    switch (sectionId) {
      case 'personal':
        return resumeData.personalInfo.fullName && resumeData.personalInfo.email;
      case 'summary':
        return resumeData.summary.length > 0;
      case 'education':
        return resumeData.education.length > 0;
      case 'experience':
        return resumeData.experience.length > 0;
      case 'skills':
        return resumeData.skills.length > 0;
      case 'projects':
      case 'research':
        return resumeData.projects.length > 0;
      case 'references':
        return resumeData.references.length > 0;
      default:
        return false;
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">CV Builder</h2>
        <p className="text-gray-600 dark:text-gray-300">
          Create a comprehensive Curriculum Vitae for academic and research positions
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 gap-1 h-auto p-1">
          {cvSections.map((section) => {
            const IconComponent = section.icon;
            const isCompleted = getCompletionStatus(section.id);
            
            return (
              <TabsTrigger
                key={section.id}
                value={section.id}
                className="flex flex-col items-center gap-1 p-2 text-xs relative"
              >
                <IconComponent className="h-4 w-4" />
                <span className="hidden sm:inline">{section.label}</span>
                <span className="sm:hidden">{section.label.split(' ')[0]}</span>
                {isCompleted && (
                  <Badge variant="secondary" className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-xs">
                    ✓
                  </Badge>
                )}
                {section.required && !isCompleted && (
                  <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-xs">
                    !
                  </Badge>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <div className="mt-6">
          <TabsContent value="personal">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                  <Badge variant="destructive" className="ml-2">Required</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PersonalInfoForm
                  data={resumeData.personalInfo}
                  onChange={(personalInfo) => onUpdate({ ...resumeData, personalInfo })}
                  showImageUpload={true}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="summary">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Research Profile & Interests
                  <Badge variant="destructive" className="ml-2">Required</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SummaryForm
                  data={resumeData.summary}
                  onChange={(summary) => onUpdate({ ...resumeData, summary })}
                  placeholder="Describe your research interests, academic background, and scholarly objectives. This section should provide a comprehensive overview of your academic profile and research focus areas."
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="education">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Education
                  <Badge variant="destructive" className="ml-2">Required</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <EducationForm
                  data={resumeData.education}
                  onChange={(education) => onUpdate({ ...resumeData, education })}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="experience">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Academic & Professional Experience
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ExperienceForm
                  data={resumeData.experience}
                  onChange={(experience) => onUpdate({ ...resumeData, experience })}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="research">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Research & Publications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ProjectsForm
                  data={resumeData.projects}
                  onChange={(projects) => onUpdate({ ...resumeData, projects })}
                  isCV={true}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="skills">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Skills & Competencies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SkillsForm
                  data={resumeData.skills}
                  onChange={(skills) => onUpdate({ ...resumeData, skills })}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FolderOpen className="h-5 w-5" />
                  Projects & Research Work
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ProjectsForm
                  data={resumeData.projects}
                  onChange={(projects) => onUpdate({ ...resumeData, projects })}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="references">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Academic References
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ReferencesForm
                  data={resumeData.references}
                  onChange={(references) => onUpdate({ ...resumeData, references })}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </div>

        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={() => {
              const currentIndex = cvSections.findIndex(s => s.id === activeTab);
              if (currentIndex > 0) {
                setActiveTab(cvSections[currentIndex - 1].id);
              }
            }}
            disabled={cvSections.findIndex(s => s.id === activeTab) === 0}
          >
            Previous
          </Button>
          
          <Button
            onClick={() => {
              const currentIndex = cvSections.findIndex(s => s.id === activeTab);
              if (currentIndex < cvSections.length - 1) {
                setActiveTab(cvSections[currentIndex + 1].id);
              }
            }}
            disabled={cvSections.findIndex(s => s.id === activeTab) === cvSections.length - 1}
          >
            Next
          </Button>
        </div>
      </Tabs>
    </div>
  );
};
