
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { Experience } from '@/types/resume';

interface ExperienceFormProps {
  data: Experience[];
  onChange: (data: Experience[]) => void;
}

export const ExperienceForm: React.FC<ExperienceFormProps> = ({ data, onChange }) => {
  const addExperience = () => {
    const newExperience: Experience = {
      id: Date.now().toString(),
      jobTitle: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: ['']
    };
    onChange([...data, newExperience]);
  };

  const updateExperience = (id: string, field: keyof Experience, value: any) => {
    onChange(data.map(exp => 
      exp.id === id ? { ...exp, [field]: value } : exp
    ));
  };

  const removeExperience = (id: string) => {
    onChange(data.filter(exp => exp.id !== id));
  };

  const addBulletPoint = (id: string) => {
    const experience = data.find(exp => exp.id === id);
    if (experience) {
      updateExperience(id, 'description', [...experience.description, '']);
    }
  };

  const updateBulletPoint = (expId: string, index: number, value: string) => {
    const experience = data.find(exp => exp.id === expId);
    if (experience) {
      const newDescription = [...experience.description];
      newDescription[index] = value;
      updateExperience(expId, 'description', newDescription);
    }
  };

  const removeBulletPoint = (expId: string, index: number) => {
    const experience = data.find(exp => exp.id === expId);
    if (experience && experience.description.length > 1) {
      const newDescription = experience.description.filter((_, i) => i !== index);
      updateExperience(expId, 'description', newDescription);
    }
  };

  return (
    <div className="space-y-4">
      {data.map((experience, index) => (
        <Card key={experience.id} className="relative">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center space-x-2">
                <GripVertical className="h-4 w-4 text-gray-400" />
                <span>Experience {index + 1}</span>
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeExperience(experience.id)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Job Title *</Label>
                <Input
                  value={experience.jobTitle}
                  onChange={(e) => updateExperience(experience.id, 'jobTitle', e.target.value)}
                  placeholder="Software Engineer"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Company *</Label>
                <Input
                  value={experience.company}
                  onChange={(e) => updateExperience(experience.id, 'company', e.target.value)}
                  placeholder="Tech Corp"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label>Location</Label>
              <Input
                value={experience.location}
                onChange={(e) => updateExperience(experience.id, 'location', e.target.value)}
                placeholder="San Francisco, CA"
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Start Date *</Label>
                <Input
                  type="month"
                  value={experience.startDate}
                  onChange={(e) => updateExperience(experience.id, 'startDate', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>End Date</Label>
                <Input
                  type="month"
                  value={experience.endDate}
                  onChange={(e) => updateExperience(experience.id, 'endDate', e.target.value)}
                  disabled={experience.current}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id={`current-${experience.id}`}
                checked={experience.current}
                onCheckedChange={(checked) => updateExperience(experience.id, 'current', checked)}
              />
              <Label htmlFor={`current-${experience.id}`} className="text-sm">
                I currently work here
              </Label>
            </div>

            <div>
              <Label>Job Description & Achievements</Label>
              <div className="space-y-2 mt-2">
                {experience.description.map((bullet, bulletIndex) => (
                  <div key={bulletIndex} className="flex items-start space-x-2">
                    <span className="text-gray-400 mt-2">•</span>
                    <Textarea
                      value={bullet}
                      onChange={(e) => updateBulletPoint(experience.id, bulletIndex, e.target.value)}
                      placeholder="Describe your responsibilities and achievements using action verbs and quantifiable results..."
                      rows={2}
                      className="flex-1 resize-none"
                    />
                    {experience.description.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeBulletPoint(experience.id, bulletIndex)}
                        className="text-red-500 hover:text-red-700 mt-1"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addBulletPoint(experience.id)}
                  className="w-full"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Bullet Point
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <Button onClick={addExperience} className="w-full" variant="outline">
        <Plus className="h-4 w-4 mr-2" />
        Add Experience
      </Button>
    </div>
  );
};
