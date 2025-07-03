import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ThemeToggle } from '@/components/ThemeToggle';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Linkedin, 
  Globe,
  Calendar,
  GraduationCap,
  Briefcase,
  Award,
  Code,
  User,
  ExternalLink,
  Play,
  Video,
  X
} from 'lucide-react';
import { ResumeData } from '@/types/resume';
import { toast } from '@/components/ui/use-toast';

interface PublicProfile {
  id: string;
  full_name: string;
  email: string;
  username: string;
  avatar_url: string | null;
  website: string | null;
  public_resume_id: string | null;
  video_bio_url: string | null;
  bio_intro_text: string | null;
}

interface CustomBranding {
  name: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  text_color: string;
  font_family: string;
  logo_url: string | null;
}

interface PublicResumeData {
  id: string;
  title: string;
  data: ResumeData;
  template: string;
  updated_at: string;
  branding_id: string | null;
  custom_branding?: CustomBranding | null;
}

export const PublicResume: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [resumeData, setResumeData] = useState<PublicResumeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPublicProfile = async () => {
      if (!username) {
        setError('Username not provided');
        setLoading(false);
        return;
      }

      try {
        console.log('PublicResume: Fetching public profile for username:', username);
        
        // First, get the public profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, full_name, email, username, avatar_url, website, public_resume_id, public_resume_enabled, video_bio_url, bio_intro_text')
          .eq('username', username)
          .eq('public_resume_enabled', true)
          .single();

        if (profileError) {
          console.error('PublicResume: Profile error:', profileError);
          console.error('PublicResume: Error details:', {
            message: profileError.message,
            code: profileError.code,
            details: profileError.details,
            hint: profileError.hint
          });
          setError('Public profile not found or not enabled');
          setLoading(false);
          return;
        }

        if (!profileData) {
          console.log('PublicResume: No profile data returned');
          setError('Public profile not found');
          setLoading(false);
          return;
        }

        console.log('PublicResume: Profile data found:', profileData);
        setProfile(profileData);

        // If there's a resume selected, fetch it with branding
        if (profileData.public_resume_id) {
          console.log('PublicResume: Fetching resume with ID:', profileData.public_resume_id);
          
          const { data: resumeData, error: resumeError } = await supabase
            .from('resumes')
            .select(`
              id, title, data, template, updated_at, branding_id,
              custom_branding (
                name, primary_color, secondary_color, accent_color,
                background_color, text_color, font_family, logo_url
              )
            `)
            .eq('id', profileData.public_resume_id)
            .single();

          if (resumeError) {
            console.error('PublicResume: Resume error:', resumeError);
            console.error('PublicResume: Resume error details:', {
              message: resumeError.message,
              code: resumeError.code,
              details: resumeError.details,
              hint: resumeError.hint
            });
            
            // Even if resume fetch fails, show the profile
            console.log('PublicResume: Resume fetch failed, but showing profile anyway');
          } else if (resumeData) {
            console.log('PublicResume: Resume data found:', resumeData);
            // Type cast the Json data to ResumeData
            const typedResumeData: PublicResumeData = {
              ...resumeData,
              data: resumeData.data as unknown as ResumeData
            };
            setResumeData(typedResumeData);
          } else {
            console.log('PublicResume: No resume data found for ID:', profileData.public_resume_id);
          }
        } else {
          console.log('PublicResume: No public resume selected');
        }
      } catch (err) {
        console.error('PublicResume: Error fetching public profile:', err);
        setError('Failed to load public profile');
      } finally {
        setLoading(false);
      }
    };

    fetchPublicProfile();
  }, [username]);

  const handleDownloadPDF = () => {
    toast({
      title: "Download Feature",
      description: "PDF download will be available soon!",
    });
  };

  const handleWebsiteClick = (websiteUrl: string) => {
    let url = websiteUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4">😔</div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Profile Not Found</h1>
            <p className="text-muted-foreground mb-4">
              {error || 'This public profile is not available or has been disabled.'}
            </p>
            <Button onClick={() => window.location.href = '/'} variant="outline">
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If no resume is selected, show profile-only view
  if (!resumeData || !resumeData.data) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-card shadow-sm border-b border-border">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center space-x-4 min-w-0 flex-1">
                <Avatar className="w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0">
                  <AvatarImage src={profile.avatar_url || ''} alt="Profile picture" />
                  <AvatarFallback>
                    {profile.full_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg sm:text-2xl font-bold text-foreground truncate">
                    {profile.full_name || 'User Profile'}
                  </h1>
                  <p className="text-muted-foreground text-sm sm:text-base">@{profile.username}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 flex-shrink-0">
                <ThemeToggle />
                <Button variant="outline" onClick={() => window.location.href = '/'} size="sm">
                  Create Your Own
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <User className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-bold text-foreground mb-2">
                {profile.full_name || 'Welcome'}
              </h2>
              <p className="text-muted-foreground mb-6">
                This is {profile.full_name}'s public profile. They haven't shared a resume yet.
              </p>
              
              {/* Contact Information */}
              <div className="space-y-3 max-w-md mx-auto">
                {profile.email && (
                  <div className="flex items-center justify-center space-x-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">{profile.email}</span>
                  </div>
                )}
                {profile.website && (
                  <div className="flex items-center justify-center space-x-2">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <button 
                      onClick={() => handleWebsiteClick(profile.website)}
                      className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                      Personal Website
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-8">
                <Button onClick={() => window.location.href = '/'} className="bg-primary hover:bg-primary/90">
                  Create Your Resume
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="bg-card border-t border-border mt-12">
          <div className="max-w-4xl mx-auto px-4 py-6 text-center">
            <p className="text-muted-foreground text-sm">
              Powered by{' '}
              <a href="/" className="text-primary hover:underline font-medium">
                Resume AI Pro
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // If resume is selected, show full resume view
  const resume = resumeData.data;
  const branding = resumeData.custom_branding;

  // Apply custom branding styles
  const brandingStyles = branding ? {
    '--brand-primary': branding.primary_color,
    '--brand-secondary': branding.secondary_color,
    '--brand-accent': branding.accent_color,
    '--brand-background': branding.background_color,
    '--brand-text': branding.text_color,
    fontFamily: branding.font_family
  } as React.CSSProperties : {};

  return (
    <div 
      className="min-h-screen bg-background text-foreground" 
      style={branding ? { 
        backgroundColor: branding.background_color,
        color: branding.text_color,
        ...brandingStyles
      } : {}}
    >
      {/* Header */}
      <div 
        className="shadow-sm border-b border-border" 
        style={branding ? { backgroundColor: branding.background_color } : {}}
      >
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center space-x-4 min-w-0 flex-1">
              <Avatar className="w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0">
                <AvatarImage src={profile.avatar_url || resume.personalInfo?.profileImage || ''} alt="Profile picture" />
                <AvatarFallback>
                  {resume.personalInfo?.fullName?.charAt(0) || profile.full_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <h1 
                  className="text-lg sm:text-2xl font-bold truncate"
                  style={branding ? { color: branding.primary_color } : {}}
                >
                  {resume.personalInfo?.fullName || profile.full_name || 'User'}
                </h1>
                <p className="text-muted-foreground text-sm sm:text-base" style={branding ? { color: branding.text_color } : {}}>@{profile.username}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0">
              <ThemeToggle />
              <Button variant="outline" onClick={() => window.location.href = '/'} size="sm">
                Create Your Own
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Contact & Skills */}
          <div className="space-y-6">
            {/* Contact Information */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4">Contact</h3>
                <div className="space-y-3">
                  {resume.personalInfo?.email && (
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">{resume.personalInfo.email}</span>
                    </div>
                  )}
                  {resume.personalInfo?.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">{resume.personalInfo.phone}</span>
                    </div>
                  )}
                  {resume.personalInfo?.location && (
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">{resume.personalInfo.location}</span>
                    </div>
                  )}
                  {resume.personalInfo?.linkedIn && (
                    <div className="flex items-center space-x-2">
                      <Linkedin className="w-4 h-4 text-gray-500" />
                      <button 
                        onClick={() => handleWebsiteClick(resume.personalInfo.linkedIn)}
                        className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                      >
                        LinkedIn Profile
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  {resume.personalInfo?.website && (
                    <div className="flex items-center space-x-2">
                      <Globe className="w-4 h-4 text-gray-500" />
                      <button 
                        onClick={() => handleWebsiteClick(resume.personalInfo.website)}
                        className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                      >
                        Portfolio
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Video Bio */}
            {(profile.video_bio_url || profile.bio_intro_text) && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-4">Introduction</h3>
                  
                  {profile.bio_intro_text && (
                    <div className="mb-4">
                      <p className="text-gray-700 leading-relaxed">{profile.bio_intro_text}</p>
                    </div>
                  )}

                  {profile.video_bio_url && (
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Video className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-medium">Video Introduction</span>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                          >
                            <Play className="h-3 w-3 mr-1" />
                            Watch Video
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-4xl">
                          <DialogHeader>
                            <DialogTitle>Video Introduction</DialogTitle>
                          </DialogHeader>
                          <div className="aspect-video w-full">
                            <iframe
                              src={profile.video_bio_url}
                              className="w-full h-full rounded-lg"
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              title="Video Introduction"
                            />
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Skills */}
            {(resume.skills && resume.skills.length > 0) && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-4 flex items-center">
                    <Code className="w-5 h-5 mr-2" />
                    Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {resume.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {skill.name}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Summary */}
            {resume.summary && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-4">Professional Summary</h3>
                  <p className="text-gray-700 leading-relaxed">{resume.summary}</p>
                </CardContent>
              </Card>
            )}

            {/* Experience */}
            {(resume.experience && resume.experience.length > 0) && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-4 flex items-center">
                    <Briefcase className="w-5 h-5 mr-2" />
                    Experience
                  </h3>
                  <div className="space-y-6">
                    {resume.experience.map((exp, index) => (
                      <div key={index} className="border-l-2 border-blue-200 pl-4">
                        <h4 className="font-medium text-gray-900">{exp.jobTitle}</h4>
                        <p className="text-blue-600 font-medium">{exp.company}</p>
                        <p className="text-sm text-gray-500 flex items-center mt-1">
                          <Calendar className="w-3 h-3 mr-1" />
                          {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                        </p>
                        <div className="mt-2 space-y-1">
                          {exp.description.map((desc, i) => (
                            <p key={i} className="text-sm text-gray-700">• {desc}</p>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Education */}
            {(resume.education && resume.education.length > 0) && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-4 flex items-center">
                    <GraduationCap className="w-5 h-5 mr-2" />
                    Education
                  </h3>
                  <div className="space-y-4">
                    {resume.education.map((edu, index) => (
                      <div key={index}>
                        <h4 className="font-medium text-gray-900">{edu.degree}</h4>
                        <p className="text-blue-600">{edu.school}</p>
                        <p className="text-sm text-gray-500">{edu.graduationDate}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Projects */}
            {(resume.projects && resume.projects.length > 0) && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-4 flex items-center">
                    <Award className="w-5 h-5 mr-2" />
                    Projects
                  </h3>
                  <div className="space-y-4">
                    {resume.projects.map((project, index) => (
                      <div key={index}>
                        <h4 className="font-medium text-gray-900">{project.name}</h4>
                        <p className="text-sm text-gray-700 mt-1">{project.description}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {project.technologies.map((tech, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-card border-t border-border mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center">
          <p className="text-muted-foreground text-sm">
            Powered by{' '}
            <a href="/" className="text-primary hover:underline font-medium">
              Resume AI Pro
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
