import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Video, ExternalLink, Save } from 'lucide-react';

interface VideoBioManagerProps {
  onUpdate?: () => void;
}

export const VideoBioManager: React.FC<VideoBioManagerProps> = ({ onUpdate }) => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [bioText, setBioText] = useState('');
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      console.log('VideoBioManager: Fetching profile for user:', user.id);
      const { data, error } = await supabase
        .from('profiles')
        .select('video_bio_url, bio_intro_text')
        .eq('id', user.id)
        .single();

      console.log('VideoBioManager: Profile fetch result:', { data, error });

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setProfile(data);
        setVideoUrl(data.video_bio_url || '');
        setBioText(data.bio_intro_text || '');
        console.log('VideoBioManager: Profile data loaded:', { video_bio_url: data.video_bio_url, bio_intro_text: data.bio_intro_text });
      }
    } catch (error) {
      console.error('VideoBioManager: Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveVideoUrl = async () => {
    if (!user) return;
    
    try {
      setUploading(true);
      console.log('VideoBioManager: Saving video bio for user:', user.id, { videoUrl, bioText });
      
      const { error } = await supabase
        .from('profiles')
        .update({
          video_bio_url: videoUrl || null,
          bio_intro_text: bioText,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        console.error('VideoBioManager: Database error:', error);
        throw error;
      }

      console.log('VideoBioManager: Video bio saved successfully');
      await fetchProfile();
      onUpdate?.();

      toast({
        title: "Bio Saved",
        description: "Your video bio and introduction have been saved successfully.",
      });
    } catch (error) {
      console.error('VideoBioManager: Error saving video bio:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save video bio. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Video Bio URL */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Video Introduction
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="video-url">Video URL</Label>
            <Input
              id="video-url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Paste a link to your introduction video hosted on YouTube, Vimeo, Loom, or other platforms
            </p>
          </div>
          
          {videoUrl && isValidUrl(videoUrl) && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Video className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Video URL Added</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(videoUrl, '_blank')}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Preview
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bio Text */}
      <Card>
        <CardHeader>
          <CardTitle>Introduction Text</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="bio-text">Brief Introduction</Label>
              <Textarea
                id="bio-text"
                value={bioText}
                onChange={(e) => setBioText(e.target.value)}
                placeholder="Write a brief introduction about yourself that will appear alongside your video..."
                rows={4}
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">
                {bioText.length}/500 characters
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Card>
        <CardContent className="p-4">
          <Button
            onClick={saveVideoUrl}
            disabled={uploading}
            className="w-full"
          >
            <Save className="h-4 w-4 mr-2" />
            {uploading ? 'Saving...' : 'Save Video Bio & Introduction'}
          </Button>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Tips for a Great Video Introduction</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-600">
          <ul className="space-y-1">
            <li>• Keep it under 60 seconds for best engagement</li>
            <li>• Introduce yourself and mention your key skills</li>
            <li>• Use good lighting and clear audio</li>
            <li>• Smile and be authentic</li>
            <li>• Upload to YouTube/Vimeo as unlisted if you prefer privacy</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};