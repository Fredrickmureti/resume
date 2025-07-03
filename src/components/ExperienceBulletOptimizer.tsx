
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GeminiAIService } from '@/services/geminiAI';
import { Zap, Loader2, Copy, Check } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface ExperienceBulletOptimizerProps {
  onOptimizedBullets: (bullets: string[]) => void;
}

export const ExperienceBulletOptimizer: React.FC<ExperienceBulletOptimizerProps> = ({
  onOptimizedBullets
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [originalBullets, setOriginalBullets] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [optimizedBullets, setOptimizedBullets] = useState<string[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const optimizeBullets = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to use AI bullet point optimization.",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }

    if (!originalBullets.trim() || !jobTitle.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide your job title and bullet points to optimize.",
        variant: "destructive"
      });
      return;
    }

    setIsOptimizing(true);
    try {
      const bullets = originalBullets.split('\n').filter(bullet => bullet.trim());
      const optimized = await GeminiAIService.optimizeExperienceBullets(
        bullets,
        jobTitle,
        company || 'Company'
      );
      
      setOptimizedBullets(optimized);
      toast({
        title: "Bullets Optimized",
        description: `Generated ${optimized.length} optimized bullet points.`,
      });
    } catch (error) {
      console.error('Error optimizing bullets:', error);
      toast({
        title: "Optimization Failed",
        description: "Failed to optimize bullet points. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  const copyBullet = (bullet: string) => {
    navigator.clipboard.writeText(bullet);
    toast({
      title: "Copied",
      description: "Bullet point copied to clipboard",
    });
  };

  const applyAllBullets = () => {
    onOptimizedBullets(optimizedBullets);
    toast({
      title: "Applied",
      description: "All optimized bullet points have been applied.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Zap className="h-5 w-5 text-orange-600" />
          <span>Experience Bullet Point Optimizer</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Job Title *</Label>
            <Input
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="Software Engineer"
            />
          </div>
          <div>
            <Label>Company</Label>
            <Input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Tech Corp"
            />
          </div>
        </div>

        <div>
          <Label>Original Bullet Points</Label>
          <Textarea
            value={originalBullets}
            onChange={(e) => setOriginalBullets(e.target.value)}
            placeholder="Enter your current job responsibilities, one per line..."
            rows={6}
            className="resize-none"
          />
        </div>

        <Button 
          onClick={optimizeBullets}
          disabled={!originalBullets.trim() || !jobTitle.trim() || isOptimizing}
          className="w-full"
        >
          {isOptimizing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Optimizing Bullet Points...
            </>
          ) : (
            <>
              <Zap className="h-4 w-4 mr-2" />
              Optimize with AI
            </>
          )}
        </Button>

        {optimizedBullets.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Optimized Bullet Points</Label>
              <Button size="sm" onClick={applyAllBullets}>
                <Check className="h-3 w-3 mr-1" />
                Apply All
              </Button>
            </div>
            <div className="space-y-3">
              {optimizedBullets.map((bullet, index) => (
                <div key={index} className="border rounded-lg p-3 bg-green-50">
                  <div className="flex items-start justify-between">
                    <p className="text-gray-700 flex-1">• {bullet}</p>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyBullet(bullet)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
