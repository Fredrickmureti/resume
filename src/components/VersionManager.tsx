
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ResumeData, ResumeVersion, Template } from '@/types/resume';
import { Copy, Save, Clock, Star, Trash2, Plus, Eye } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface VersionManagerProps {
  currentResumeData: ResumeData;
  currentTemplate: Template;
  onLoadVersion: (versionData: ResumeData, template: Template) => void;
}

export const VersionManager: React.FC<VersionManagerProps> = ({
  currentResumeData,
  currentTemplate,
  onLoadVersion
}) => {
  const [versions, setVersions] = useState<ResumeVersion[]>([]);
  const [newVersionName, setNewVersionName] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const saveCurrentVersion = () => {
    if (!newVersionName.trim()) {
      toast({
        title: "Version Name Required",
        description: "Please enter a name for this version.",
        variant: "destructive"
      });
      return;
    }

    const newVersion: ResumeVersion = {
      id: Date.now().toString(),
      name: newVersionName,
      data: { ...currentResumeData },
      template: currentTemplate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setVersions(prev => [newVersion, ...prev]);
    setNewVersionName('');
    setIsDialogOpen(false);

    toast({
      title: "Version Saved",
      description: `Resume version "${newVersionName}" has been saved successfully.`,
    });
  };

  const loadVersion = (version: ResumeVersion) => {
    onLoadVersion(version.data, version.template);
    toast({
      title: "Version Loaded",
      description: `Loaded resume version "${version.name}".`,
    });
  };

  const duplicateVersion = (version: ResumeVersion) => {
    const duplicatedVersion: ResumeVersion = {
      ...version,
      id: Date.now().toString(),
      name: `${version.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setVersions(prev => [duplicatedVersion, ...prev]);
    
    toast({
      title: "Version Duplicated",
      description: `Created a copy of "${version.name}".`,
    });
  };

  const deleteVersion = (versionId: string) => {
    setVersions(prev => prev.filter(v => v.id !== versionId));
    toast({
      title: "Version Deleted",
      description: "Resume version has been deleted.",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getVersionPreview = (data: ResumeData) => {
    const experienceCount = data.experience.length;
    const skillsCount = data.skills.length;
    const hasProjects = data.projects.length > 0;
    
    return `${experienceCount} positions, ${skillsCount} skills${hasProjects ? ', projects' : ''}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-blue-600" />
            <span>Version Manager</span>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Save className="h-4 w-4 mr-2" />
                Save Version
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Save Resume Version</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Version Name
                  </label>
                  <Input
                    value={newVersionName}
                    onChange={(e) => setNewVersionName(e.target.value)}
                    placeholder="e.g., Software Engineer - Google, Marketing Manager - Tech Startup"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={saveCurrentVersion}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Version
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {versions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="font-medium">No saved versions yet</p>
            <p className="text-sm">Save different versions of your resume for different job applications</p>
          </div>
        ) : (
          <div className="space-y-3">
            {versions.map((version) => (
              <div key={version.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-medium text-gray-900">{version.name}</h4>
                      <Badge variant="outline" className="text-xs">
                        {version.template}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {getVersionPreview(version.data)}
                    </p>
                    <p className="text-xs text-gray-500">
                      Created: {formatDate(version.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => loadVersion(version)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => duplicateVersion(version)}
                      className="text-green-600 hover:text-green-700"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteVersion(version.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
