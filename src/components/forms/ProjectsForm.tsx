
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Plus, BookOpen, Code } from 'lucide-react';
import { Project } from '@/types/resume';

interface ProjectsFormProps {
  data: Project[];
  onChange: (projects: Project[]) => void;
  isCV?: boolean;
}

export const ProjectsForm: React.FC<ProjectsFormProps> = ({ data, onChange, isCV = false }) => {
  const [projects, setProjects] = useState<Project[]>(data);

  const addProject = () => {
    const newProject: Project = {
      id: Date.now().toString(),
      name: '',
      description: '',
      technologies: [],
      url: '',
      startDate: '',
      endDate: ''
    };
    const updatedProjects = [...projects, newProject];
    setProjects(updatedProjects);
    onChange(updatedProjects);
  };

  const updateProject = (id: string, field: keyof Project, value: any) => {
    const updatedProjects = projects.map(project => 
      project.id === id ? { ...project, [field]: value } : project
    );
    setProjects(updatedProjects);
    onChange(updatedProjects);
  };

  const removeProject = (id: string) => {
    const updatedProjects = projects.filter(project => project.id !== id);
    setProjects(updatedProjects);
    onChange(updatedProjects);
  };

  const updateTechnologies = (id: string, techString: string) => {
    const technologies = techString.split(',').map(tech => tech.trim()).filter(tech => tech);
    updateProject(id, 'technologies', technologies);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          {isCV ? <BookOpen className="h-5 w-5" /> : <Code className="h-5 w-5" />}
          {isCV ? 'Research & Publications' : 'Projects'}
        </h3>
        <Button onClick={addProject} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add {isCV ? 'Publication' : 'Project'}
        </Button>
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-gray-500">
            <p>{isCV ? 'No publications added yet.' : 'No projects added yet.'}</p>
            <p className="text-sm mt-2">
              {isCV 
                ? 'Add your research papers, publications, and academic work.'
                : 'Add personal projects, open-source contributions, or significant work.'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => (
            <Card key={project.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-base">
                  {isCV ? 'Publication Details' : 'Project Details'}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeProject(project.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`name-${project.id}`}>
                      {isCV ? 'Publication Title' : 'Project Name'}
                    </Label>
                    <Input
                      id={`name-${project.id}`}
                      value={project.name}
                      onChange={(e) => updateProject(project.id, 'name', e.target.value)}
                      placeholder={isCV ? 'Enter publication title' : 'Enter project name'}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`url-${project.id}`}>
                      {isCV ? 'Publication URL/DOI' : 'Project URL'}
                    </Label>
                    <Input
                      id={`url-${project.id}`}
                      value={project.url}
                      onChange={(e) => updateProject(project.id, 'url', e.target.value)}
                      placeholder={isCV ? 'DOI or publication link' : 'https://github.com/...'}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor={`description-${project.id}`}>
                    {isCV ? 'Abstract/Description' : 'Description'}
                  </Label>
                  <Textarea
                    id={`description-${project.id}`}
                    value={project.description}
                    onChange={(e) => updateProject(project.id, 'description', e.target.value)}
                    placeholder={isCV 
                      ? 'Brief abstract or description of the research/publication'
                      : 'Describe what the project does and your role in it'
                    }
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor={`tech-${project.id}`}>
                    {isCV ? 'Keywords/Technologies' : 'Technologies Used'}
                  </Label>
                  <Input
                    id={`tech-${project.id}`}
                    value={project.technologies.join(', ')}
                    onChange={(e) => updateTechnologies(project.id, e.target.value)}
                    placeholder={isCV 
                      ? 'Machine Learning, Data Science, Python'
                      : 'React, Node.js, PostgreSQL'
                    }
                  />
                  <p className="text-sm text-gray-500 mt-1">Separate with commas</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`startDate-${project.id}`}>
                      {isCV ? 'Publication Date' : 'Start Date'}
                    </Label>
                    <Input
                      id={`startDate-${project.id}`}
                      type="month"
                      value={project.startDate}
                      onChange={(e) => updateProject(project.id, 'startDate', e.target.value)}
                    />
                  </div>
                  {!isCV && (
                    <div>
                      <Label htmlFor={`endDate-${project.id}`}>End Date</Label>
                      <Input
                        id={`endDate-${project.id}`}
                        type="month"
                        value={project.endDate}
                        onChange={(e) => updateProject(project.id, 'endDate', e.target.value)}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
