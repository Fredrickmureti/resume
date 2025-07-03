
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, LogOut, User, Settings, LayoutDashboard, Linkedin, Palette, Briefcase } from 'lucide-react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { NotificationCenter } from '@/components/NotificationCenter';
import { ThemeToggle } from '@/components/ThemeToggle';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface HeaderSectionProps {
  user: SupabaseUser | null;
  isAdmin: boolean;
  atsScore: number;
  isGenerating: boolean;
  hasMinimalContent: boolean;
  onDownloadPDF: () => void;
  onSignOut: () => void;
  onOpenLinkedInOptimizer?: () => void;
}

export const HeaderSection: React.FC<HeaderSectionProps> = ({
  user,
  isAdmin,
  atsScore,
  isGenerating,
  hasMinimalContent,
  onDownloadPDF,
  onSignOut,
  onOpenLinkedInOptimizer
}) => {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<{ avatar_url?: string; full_name?: string } | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.id || profileLoading) return;
      
      setProfileLoading(true);
      try {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('avatar_url, full_name')
          .eq('id', user.id)
          .maybeSingle();
        
        if (profileData) {
          setUserProfile(profileData);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setProfileLoading(false);
      }
    };

    // Debounce profile fetch to avoid multiple calls
    const timeoutId = setTimeout(fetchUserProfile, 100);
    return () => clearTimeout(timeoutId);
  }, [user?.id]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">RA</span>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ResumeAI Pro
            </h1>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-3">
            {/* ATS Score Badge */}
            {atsScore > 0 && (
              <Badge 
                variant={atsScore >= 80 ? "default" : atsScore >= 60 ? "secondary" : "destructive"}
                className="text-xs font-medium"
              >
                ATS: {atsScore}%
              </Badge>
            )}

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Notification Center */}
            {user && <NotificationCenter />}

            {/* LinkedIn Optimizer Button */}
            {user && hasMinimalContent && onOpenLinkedInOptimizer && (
              <Button
                onClick={onOpenLinkedInOptimizer}
                size="sm"
                variant="outline"
                className="hidden sm:flex items-center space-x-2 text-blue-600 border-blue-600 hover:bg-blue-50"
              >
                <Linkedin className="h-4 w-4" />
                <span>LinkedIn</span>
              </Button>
            )}

            {/* Download PDF Button */}
            <Button
              onClick={onDownloadPDF}
              disabled={isGenerating || !hasMinimalContent}
              size="sm"
              variant="outline"
              className="hidden sm:flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>{isGenerating ? 'Generating...' : 'Download PDF'}</span>
            </Button>

            {/* User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage 
                        src={userProfile?.avatar_url || ''} 
                        alt="Profile picture"
                        loading="lazy"
                      />
                      <AvatarFallback className="text-xs">
                        {userProfile?.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/branding')}>
                    <Palette className="mr-2 h-4 w-4" />
                    <span>Custom Branding</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/job-tracker')}>
                    <Briefcase className="mr-2 h-4 w-4" />
                    <span>Job Tracker</span>
                  </DropdownMenuItem>
                  {onOpenLinkedInOptimizer && (
                    <DropdownMenuItem onClick={onOpenLinkedInOptimizer}>
                      <Linkedin className="mr-2 h-4 w-4 text-blue-600" />
                      <span>LinkedIn Optimizer</span>
                    </DropdownMenuItem>
                  )}
                  {isAdmin && (
                    <DropdownMenuItem onClick={() => navigate('/admin')}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Admin Panel</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button size="sm" variant="outline" onClick={() => navigate('/auth')}>
                <User className="h-4 w-4 mr-2" />
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
