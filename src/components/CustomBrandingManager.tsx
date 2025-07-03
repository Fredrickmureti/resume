import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { 
  Palette, 
  Upload, 
  Save, 
  Plus, 
  Trash2, 
  Eye,
  Star,
  Image as ImageIcon,
  FileText,
  Link,
  X
} from 'lucide-react';

interface CustomBranding {
  id: string;
  name: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  text_color: string;
  font_family: string;
  logo_url: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

const fontOptions = [
  { value: 'inter', label: 'Inter (Modern)' },
  { value: 'roboto', label: 'Roboto (Clean)' },
  { value: 'arial', label: 'Arial (Classic)' },
  { value: 'times', label: 'Times New Roman (Traditional)' },
  { value: 'calibri', label: 'Calibri (Professional)' },
  { value: 'georgia', label: 'Georgia (Elegant)' },
  { value: 'helvetica', label: 'Helvetica (Minimal)' }
];

const colorPresets = [
  {
    name: 'Professional Blue',
    primary_color: '#3b82f6',
    secondary_color: '#1e40af',
    accent_color: '#f59e0b',
    background_color: '#ffffff',
    text_color: '#1f2937'
  },
  {
    name: 'Corporate Gray',
    primary_color: '#6b7280',
    secondary_color: '#374151',
    accent_color: '#10b981',
    background_color: '#f9fafb',
    text_color: '#111827'
  },
  {
    name: 'Creative Purple',
    primary_color: '#8b5cf6',
    secondary_color: '#5b21b6',
    accent_color: '#f59e0b',
    background_color: '#ffffff',
    text_color: '#1f2937'
  },
  {
    name: 'Tech Green',
    primary_color: '#10b981',
    secondary_color: '#047857',
    accent_color: '#3b82f6',
    background_color: '#ffffff',
    text_color: '#1f2937'
  }
];

export const CustomBrandingManager: React.FC = () => {
  const { user } = useAuth();
  const [brandings, setBrandings] = useState<CustomBranding[]>([]);
  const [currentBranding, setCurrentBranding] = useState<Partial<CustomBranding>>({
    name: '',
    primary_color: '#3b82f6',
    secondary_color: '#1e40af',
    accent_color: '#f59e0b',
    background_color: '#ffffff',
    text_color: '#1f2937',
    font_family: 'inter',
    logo_url: null,
    is_default: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedBrandingId, setSelectedBrandingId] = useState<string | null>(null);
  const [resumes, setResumes] = useState<Array<{id: string, title: string, branding_id: string | null}>>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchBrandings();
    fetchResumes();
  }, [user]);

  const fetchBrandings = async () => {
    if (!user) return;

    try {
      console.log('CustomBrandingManager: Fetching brandings for user:', user.id);
      const { data, error } = await supabase
        .from('custom_branding')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      console.log('CustomBrandingManager: Branding fetch result:', { data, error, brandingCount: data?.length });
      if (error) throw error;
      setBrandings(data || []);

      // Set default branding if exists, otherwise show form for new brand
      const defaultBranding = data?.find(b => b.is_default);
      if (defaultBranding) {
        setCurrentBranding(defaultBranding);
        setSelectedBrandingId(defaultBranding.id);
      } else if (data && data.length === 0) {
        // No brandings exist, set default name for new brand
        setCurrentBranding(prev => ({ ...prev, name: 'My Brand' }));
      }
    } catch (error) {
      console.error('Error fetching brandings:', error);
      toast({
        title: "Error",
        description: "Failed to load custom brandings.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchResumes = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('resumes')
        .select('id, title, branding_id')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setResumes(data || []);
    } catch (error) {
      console.error('Error fetching resumes:', error);
    }
  };

  const saveBranding = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const brandingData = {
        ...currentBranding,
        user_id: user.id,
        updated_at: new Date().toISOString()
      };

      let result;
      if (selectedBrandingId && brandings.find(b => b.id === selectedBrandingId)) {
        // Update existing
        result = await supabase
          .from('custom_branding')
          .update(brandingData)
          .eq('id', selectedBrandingId)
          .select()
          .single();
      } else {
        // Create new
        result = await supabase
          .from('custom_branding')
          .insert(brandingData)
          .select()
          .single();
      }

      if (result.error) throw result.error;

      // If this is set as default, unset other defaults
      if (currentBranding.is_default) {
        await supabase
          .from('custom_branding')
          .update({ is_default: false })
          .neq('id', result.data.id)
          .eq('user_id', user.id);
      }

      await fetchBrandings();
      await fetchResumes();
      setSelectedBrandingId(result.data.id);

      toast({
        title: "Branding Saved",
        description: "Your custom branding has been saved successfully.",
      });
    } catch (error) {
      console.error('Error saving branding:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save custom branding.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const deleteBranding = async (id: string) => {
    try {
      const { error } = await supabase
        .from('custom_branding')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchBrandings();
      
      if (selectedBrandingId === id) {
        setSelectedBrandingId(null);
        setCurrentBranding({
          name: 'New Brand',
          primary_color: '#3b82f6',
          secondary_color: '#1e40af',
          accent_color: '#f59e0b',
          background_color: '#ffffff',
          text_color: '#1f2937',
          font_family: 'inter',
          logo_url: null,
          is_default: false
        });
      }

      toast({
        title: "Branding Deleted",
        description: "Custom branding has been deleted.",
      });
    } catch (error) {
      console.error('Error deleting branding:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete custom branding.",
        variant: "destructive"
      });
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please select an image file.",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 2MB.",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/branding-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      setCurrentBranding(prev => ({ ...prev, logo_url: urlData.publicUrl }));

      toast({
        title: "Logo Uploaded",
        description: "Your logo has been uploaded successfully.",
      });
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload logo.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const loadBranding = (branding: CustomBranding) => {
    setCurrentBranding(branding);
    setSelectedBrandingId(branding.id);
  };

  const applyColorPreset = (preset: typeof colorPresets[0]) => {
    setCurrentBranding(prev => ({
      ...prev,
      ...preset
    }));
  };

  const createNewBranding = () => {
    setCurrentBranding({
      name: 'New Brand',
      primary_color: '#3b82f6',
      secondary_color: '#1e40af',
      accent_color: '#f59e0b',
      background_color: '#ffffff',
      text_color: '#1f2937',
      font_family: 'inter',
      logo_url: null,
      is_default: false
    });
    setSelectedBrandingId(null);
  };

  const applyBrandingToResume = async () => {
    if (!selectedBrandingId || !selectedResumeId || !user) return;

    try {
      const { error } = await supabase
        .from('resumes')
        .update({ branding_id: selectedBrandingId })
        .eq('id', selectedResumeId)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchResumes();
      toast({
        title: "Branding Applied",
        description: "Branding has been applied to the selected resume.",
      });
    } catch (error) {
      console.error('Error applying branding:', error);
      toast({
        title: "Apply Failed",
        description: "Failed to apply branding to resume.",
        variant: "destructive"
      });
    }
  };

  const removeBrandingFromResume = async (resumeId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('resumes')
        .update({ branding_id: null })
        .eq('id', resumeId)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchResumes();
      toast({
        title: "Branding Removed",
        description: "Branding has been removed from the resume.",
      });
    } catch (error) {
      console.error('Error removing branding:', error);
      toast({
        title: "Remove Failed",
        description: "Failed to remove branding from resume.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Custom Branding</h2>
          <p className="text-muted-foreground">Create and manage your custom brand themes for resumes</p>
        </div>
        <Button onClick={createNewBranding} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Brand
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Saved Brandings */}
        <Card className="lg:col-span-1 space-y-4">
          <div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Saved Brands
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {brandings.map((branding) => (
              <div
                key={branding.id}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedBrandingId === branding.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:bg-muted/50'
                }`}
                onClick={() => loadBranding(branding)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div
                        className="w-3 h-3 rounded-full border"
                        style={{ backgroundColor: branding.primary_color }}
                      />
                      <div
                        className="w-3 h-3 rounded-full border"
                        style={{ backgroundColor: branding.secondary_color }}
                      />
                      <div
                        className="w-3 h-3 rounded-full border"
                        style={{ backgroundColor: branding.accent_color }}
                      />
                    </div>
                    <span className="text-sm font-medium">{branding.name}</span>
                    {branding.is_default && (
                      <Star className="h-3 w-3 text-yellow-500 fill-current" />
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteBranding(branding.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
            {brandings.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No custom brandings yet. Create your first one!
              </p>
            )}
          </CardContent>
          </div>

          {/* Resume Branding Manager */}
          <div>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Apply to Resumes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedBrandingId && (
                <div className="space-y-3">
                  <Label>Select Resume</Label>
                  <Select
                    value={selectedResumeId || ''}
                    onValueChange={setSelectedResumeId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a resume" />
                    </SelectTrigger>
                    <SelectContent>
                      {resumes.map((resume) => (
                        <SelectItem key={resume.id} value={resume.id}>
                          {resume.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Button
                    onClick={applyBrandingToResume}
                    disabled={!selectedResumeId}
                    className="w-full"
                    size="sm"
                  >
                    <Link className="h-4 w-4 mr-2" />
                    Apply Branding
                  </Button>
                </div>
              )}

              {/* Currently Branded Resumes */}
              <div className="space-y-2">
                <Label>Branded Resumes</Label>
                {resumes.filter(r => r.branding_id).length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-2">
                    No resumes have branding applied
                  </p>
                ) : (
                  <div className="space-y-2">
                    {resumes
                      .filter(r => r.branding_id)
                      .map((resume) => {
                        const branding = brandings.find(b => b.id === resume.branding_id);
                        return (
                          <div key={resume.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                            <div className="flex items-center gap-2">
                              <div className="flex gap-1">
                                {branding && (
                                  <>
                                    <div
                                      className="w-2 h-2 rounded-full border"
                                      style={{ backgroundColor: branding.primary_color }}
                                    />
                                    <div
                                      className="w-2 h-2 rounded-full border"
                                      style={{ backgroundColor: branding.secondary_color }}
                                    />
                                  </>
                                )}
                              </div>
                              <span className="text-xs font-medium">{resume.title}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeBrandingFromResume(resume.id)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            </CardContent>
          </div>
        </Card>

        {/* Brand Editor */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Brand Editor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="brand-name">Brand Name</Label>
                <Input
                  id="brand-name"
                  value={currentBranding.name || ''}
                  onChange={(e) => setCurrentBranding(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter brand name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="font-family">Font Family</Label>
                <Select
                  value={currentBranding.font_family || 'inter'}
                  onValueChange={(value) => setCurrentBranding(prev => ({ ...prev, font_family: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fontOptions.map((font) => (
                      <SelectItem key={font.value} value={font.value}>
                        {font.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Logo Upload */}
            <div className="space-y-4">
              <Label>Brand Logo</Label>
              <div className="flex items-center gap-4">
                {currentBranding.logo_url ? (
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={currentBranding.logo_url} alt="Brand logo" />
                    <AvatarFallback>
                      <ImageIcon className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="w-16 h-16 border-2 border-dashed border-border rounded-lg flex items-center justify-center">
                    <ImageIcon className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Logo
                      </>
                    )}
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  <p className="text-xs text-muted-foreground">PNG, JPG up to 2MB</p>
                </div>
              </div>
            </div>

            {/* Color Presets */}
            <div className="space-y-4">
              <Label>Color Presets</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {colorPresets.map((preset) => (
                  <Button
                    key={preset.name}
                    variant="outline"
                    className="h-auto p-3 flex flex-col items-center gap-2"
                    onClick={() => applyColorPreset(preset)}
                  >
                    <div className="flex gap-1">
                      <div
                        className="w-4 h-4 rounded-full border"
                        style={{ backgroundColor: preset.primary_color }}
                      />
                      <div
                        className="w-4 h-4 rounded-full border"
                        style={{ backgroundColor: preset.secondary_color }}
                      />
                      <div
                        className="w-4 h-4 rounded-full border"
                        style={{ backgroundColor: preset.accent_color }}
                      />
                    </div>
                    <span className="text-xs font-medium">{preset.name}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Custom Colors */}
            <div className="space-y-4">
              <Label>Custom Colors</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primary-color">Primary Color</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="primary-color"
                      type="color"
                      value={currentBranding.primary_color || '#3b82f6'}
                      onChange={(e) => setCurrentBranding(prev => ({ ...prev, primary_color: e.target.value }))}
                      className="w-12 h-10 p-1 border rounded"
                    />
                    <Input
                      value={currentBranding.primary_color || '#3b82f6'}
                      onChange={(e) => setCurrentBranding(prev => ({ ...prev, primary_color: e.target.value }))}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondary-color">Secondary Color</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="secondary-color"
                      type="color"
                      value={currentBranding.secondary_color || '#1e40af'}
                      onChange={(e) => setCurrentBranding(prev => ({ ...prev, secondary_color: e.target.value }))}
                      className="w-12 h-10 p-1 border rounded"
                    />
                    <Input
                      value={currentBranding.secondary_color || '#1e40af'}
                      onChange={(e) => setCurrentBranding(prev => ({ ...prev, secondary_color: e.target.value }))}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accent-color">Accent Color</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="accent-color"
                      type="color"
                      value={currentBranding.accent_color || '#f59e0b'}
                      onChange={(e) => setCurrentBranding(prev => ({ ...prev, accent_color: e.target.value }))}
                      className="w-12 h-10 p-1 border rounded"
                    />
                    <Input
                      value={currentBranding.accent_color || '#f59e0b'}
                      onChange={(e) => setCurrentBranding(prev => ({ ...prev, accent_color: e.target.value }))}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="background-color">Background Color</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="background-color"
                      type="color"
                      value={currentBranding.background_color || '#ffffff'}
                      onChange={(e) => setCurrentBranding(prev => ({ ...prev, background_color: e.target.value }))}
                      className="w-12 h-10 p-1 border rounded"
                    />
                    <Input
                      value={currentBranding.background_color || '#ffffff'}
                      onChange={(e) => setCurrentBranding(prev => ({ ...prev, background_color: e.target.value }))}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="text-color">Text Color</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="text-color"
                      type="color"
                      value={currentBranding.text_color || '#1f2937'}
                      onChange={(e) => setCurrentBranding(prev => ({ ...prev, text_color: e.target.value }))}
                      className="w-12 h-10 p-1 border rounded"
                    />
                    <Input
                      value={currentBranding.text_color || '#1f2937'}
                      onChange={(e) => setCurrentBranding(prev => ({ ...prev, text_color: e.target.value }))}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Settings */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is-default"
                  checked={currentBranding.is_default || false}
                  onChange={(e) => setCurrentBranding(prev => ({ ...prev, is_default: e.target.checked }))}
                  className="rounded border-border"
                />
                <Label htmlFor="is-default">Set as default brand</Label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button onClick={saveBranding} disabled={saving} className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Brand'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};