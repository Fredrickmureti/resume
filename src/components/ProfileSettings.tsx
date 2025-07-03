
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { VideoBioManager } from './VideoBioManager';
import { 
  User, 
  Mail, 
  Globe, 
  Share2, 
  Copy, 
  Eye,
  ExternalLink,
  Camera,
  Upload,
  Video
} from 'lucide-react';

interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  username: string | null;
  avatar_url: string | null;
  public_resume_enabled: boolean | null;
  public_resume_id: string | null;
}

interface Resume {
  id: string;
  title: string;
  template: string;
}

export const ProfileSettings: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [website, setWebsite] = useState('');
  const [activeTab, setActiveTab] = useState<'profile' | 'bio' | 'sharing'>('profile');
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const tabs = [
    { id: 'profile', label: 'Profile Info', icon: User },
    { id: 'bio', label: 'Video Bio', icon: Video },
    { id: 'sharing', label: 'Public Sharing', icon: Share2 },
  ];

  const fetchProfile = async () => {
    if (!user?.id) return;

    try {
      console.log('ProfileSettings: Fetching profile for user:', user.id);
      // Parallel data fetching for better performance
      const [profileResult, resumesResult] = await Promise.all([
        supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle(),
        supabase
          .from('resumes')
          .select('id, title, template')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })
          .limit(20) // Limit to prevent loading too many resumes
      ]);

      console.log('ProfileSettings: Profile fetch result:', { profileData: profileResult.data, profileError: profileResult.error });
      console.log('ProfileSettings: Resumes fetch result:', { resumesData: resumesResult.data, resumeCount: resumesResult.data?.length, resumesError: resumesResult.error });

      if (profileResult.error && profileResult.error.code !== 'PGRST116') {
        throw profileResult.error;
      }
      
      if (profileResult.data) {
        setProfile(profileResult.data);
        setWebsite(profileResult.data.website || '');
      }

      if (resumesResult.error) throw resumesResult.error;
      setResumes(resumesResult.data || []);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile information.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const checkUsernameAvailability = async (username: string): Promise<boolean> => {
    if (!username.trim()) return true;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username.toLowerCase())
        .neq('id', user?.id); // Exclude current user

      if (error) throw error;
      return data.length === 0; // Available if no results found
    } catch (error) {
      console.error('Error checking username:', error);
      return false;
    }
  };

  const generateUniqueUsername = async (baseName: string): Promise<string> => {
    let baseUsername = baseName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '') // Remove special characters
      .substring(0, 20); // Limit length
    
    if (!baseUsername) baseUsername = 'user';
    
    let username = baseUsername;
    let counter = 1;
    
    while (!(await checkUsernameAvailability(username))) {
      username = `${baseUsername}${counter}`;
      counter++;
      if (counter > 999) break; // Safety limit
    }
    
    return username;
  };

  const handleUsernameChange = async (newUsername: string) => {
    setProfile(prev => prev ? { ...prev, username: newUsername } : null);
    setUsernameError(null);
    
    if (!newUsername.trim()) return;
    
    // Validate format
    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!usernameRegex.test(newUsername)) {
      setUsernameError('Username can only contain letters, numbers, hyphens, and underscores');
      return;
    }
    
    if (newUsername.length < 3) {
      setUsernameError('Username must be at least 3 characters long');
      return;
    }
    
    setCheckingUsername(true);
    const isAvailable = await checkUsernameAvailability(newUsername);
    setCheckingUsername(false);
    
    if (!isAvailable) {
      setUsernameError('This username is already taken');
    }
  };

  const handleGenerateUsername = async () => {
    if (!profile?.full_name) {
      toast({
        title: "Error",
        description: "Please enter your full name first to generate a username.",
        variant: "destructive"
      });
      return;
    }
    
    setCheckingUsername(true);
    const generatedUsername = await generateUniqueUsername(profile.full_name);
    setCheckingUsername(false);
    
    setProfile(prev => prev ? { ...prev, username: generatedUsername } : null);
    setUsernameError(null);
    
    toast({
      title: "Username Generated",
      description: `Generated unique username: ${generatedUsername}`,
    });
  };

  const saveProfile = async () => {
    if (!user?.id || !profile) return;
    
    // Check for username errors before saving
    if (usernameError) {
      toast({
        title: "Error",
        description: "Please fix the username error before saving.",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      console.log('Saving profile with data:', {
        full_name: profile.full_name,
        username: profile.username,
        website: website,
        public_resume_enabled: profile.public_resume_enabled,
        public_resume_id: profile.public_resume_id
      });

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          username: profile.username?.toLowerCase(), // Store as lowercase
          website: website,
          public_resume_enabled: profile.public_resume_enabled,
          public_resume_id: profile.public_resume_id,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        console.error('Database error:', error);
        if (error.code === '23505') { // Unique constraint violation
          setUsernameError('This username is already taken');
          return;
        }
        throw error;
      }

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });

      // Refetch the profile to ensure local state is in sync
      await fetchProfile();
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user?.id) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please select an image file.",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      // Delete existing avatar if it exists
      if (profile?.avatar_url) {
        const existingPath = profile.avatar_url.split('/').pop();
        if (existingPath) {
          await supabase.storage
            .from('avatars')
            .remove([`${user.id}/${existingPath}`]);
        }
      }

      // Upload new avatar
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          avatar_url: urlData.publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Update local state
      setProfile(prev => prev ? { ...prev, avatar_url: urlData.publicUrl } : null);

      toast({
        title: "Avatar Updated",
        description: "Your profile picture has been updated successfully.",
      });

    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload profile picture. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const copyPublicUrl = () => {
    if (!profile?.username) return;
    
    const url = `${window.location.origin}/${profile.username}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "URL Copied",
      description: "Public profile URL copied to clipboard.",
    });
  };

  const handleWebsiteLinkClick = (websiteUrl: string) => {
    let url = websiteUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  useEffect(() => {
    fetchProfile();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-10 flex-1" />
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-4">
              <Skeleton className="w-20 h-20 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-3 w-64" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">Profile not found</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
        {tabs.map(tab => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex-1 ${
              activeTab !== tab.id 
                ? 'text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white' 
                : ''
            }`}
          >
            <tab.icon className="h-4 w-4 mr-2" />
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'profile' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Upload Section */}
            <div className="flex items-center space-x-4">
              <Avatar className="w-20 h-20">
                <AvatarImage 
                  src={profile.avatar_url || ''} 
                  alt="Profile picture"
                  loading="lazy"
                />
                <AvatarFallback className="text-lg">
                  {profile.full_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <Label>Profile Picture</Label>
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="flex items-center space-x-2"
                    >
                      {uploading ? (
                        <>
                          <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Camera className="h-4 w-4" />
                          <span>Upload Photo</span>
                        </>
                      )}
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="avatarUrl">Or paste image URL</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="avatarUrl"
                        value={profile?.avatar_url || ''}
                        onChange={(e) => setProfile(prev => prev ? { ...prev, avatar_url: e.target.value } : null)}
                        placeholder="https://example.com/image.jpg"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Upload a file (JPG, PNG, GIF max 5MB) or paste an image URL
                </p>
              </div>
            </div>

            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={profile?.full_name || ''}
                  onChange={(e) => setProfile(prev => prev ? { ...prev, full_name: e.target.value } : null)}
                  placeholder="Enter your full name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    value={profile?.email || ''}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="website"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="e.g., devfredrick.me"
                />
                {website && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleWebsiteLinkClick(website)}
                    className="flex items-center gap-1"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Visit
                  </Button>
                )}
              </div>
            </div>

            <Button onClick={saveProfile} disabled={saving}>
              {saving ? 'Saving...' : 'Save Profile'}
            </Button>
          </CardContent>
        </Card>
      )}

      {activeTab === 'bio' && (
        <VideoBioManager onUpdate={fetchProfile} />
      )}

      {activeTab === 'sharing' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Public Profile Sharing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username (for public URL)</Label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    id="username"
                    value={profile?.username || ''}
                    onChange={(e) => handleUsernameChange(e.target.value)}
                    placeholder="e.g., johndoe"
                    className={usernameError ? 'border-red-500' : ''}
                  />
                  {checkingUsername && (
                    <p className="text-xs text-blue-600 mt-1">Checking availability...</p>
                  )}
                  {usernameError && (
                    <p className="text-xs text-red-600 mt-1">{usernameError}</p>
                  )}
                  {profile?.username && !usernameError && !checkingUsername && (
                    <p className="text-xs text-green-600 mt-1">✓ Username is available</p>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateUsername}
                  disabled={checkingUsername}
                  className="shrink-0"
                >
                  Generate
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Username must be at least 3 characters and can only contain letters, numbers, hyphens, and underscores
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Enable Public Profile</Label>
                <p className="text-sm text-muted-foreground">
                  Allow others to view your public resume
                </p>
              </div>
              <Switch
                checked={profile?.public_resume_enabled || false}
                onCheckedChange={(checked) => 
                  setProfile(prev => prev ? { ...prev, public_resume_enabled: checked } : null)
                }
              />
            </div>

            {profile?.public_resume_enabled && (
              <>
                <div className="space-y-2">
                  <Label>Select Resume to Share</Label>
                  <Select
                    value={profile?.public_resume_id || ''}
                    onValueChange={async (value) => {
                      setProfile(prev => prev ? { ...prev, public_resume_id: value } : null);
                      // Auto-save the resume selection immediately
                      if (user?.id) {
                        try {
                          const { error } = await supabase
                            .from('profiles')
                            .update({
                              public_resume_id: value,
                              updated_at: new Date().toISOString()
                            })
                            .eq('id', user.id);
                          
                          if (error) throw error;
                          
                          toast({
                            title: "Resume Updated",
                            description: "Your public resume has been updated successfully.",
                          });
                        } catch (error) {
                          console.error('Error updating public resume:', error);
                          toast({
                            title: "Error",
                            description: "Failed to update public resume.",
                            variant: "destructive"
                          });
                        }
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a resume to share publicly" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                      {resumes.map((resume) => (
                        <SelectItem key={resume.id} value={resume.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{resume.title}</span>
                            <span className="text-sm text-muted-foreground">Template: {resume.template}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {profile?.username && (
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Your Public Profile URL:</p>
                        <p className="text-sm text-muted-foreground break-all">
                          {window.location.origin}/{profile.username}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={copyPublicUrl}
                        >
                          <Copy className="h-4 w-4 mr-1" />
                          Copy
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`${window.location.origin}/${profile?.username}`, '_blank')}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Preview
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
