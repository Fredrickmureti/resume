
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Zap, Download, Shield, Palette } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const HeroSection = () => {
  const navigate = useNavigate();

  const scrollToBuilder = () => {
    const element = document.getElementById('resume-builder');
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <section className="py-12 sm:py-16 px-4 bg-gradient-to-br from-blue-50/80 via-white/90 to-purple-50/80 dark:from-gray-900/80 dark:via-gray-800/90 dark:to-gray-900/80">
      <div className="container mx-auto text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Build Your Perfect Resume with AI
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 max-w-3xl mx-auto px-4">
            Create ATS-optimized resumes that get you noticed. Our AI-powered platform helps you craft 
            compelling content, optimize for keywords, and choose the perfect template for your industry.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8 sm:mb-12 px-4">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-6 sm:px-8 py-3 text-base sm:text-lg"
              onClick={scrollToBuilder}
            >
              <FileText className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Start Building
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="px-6 sm:px-8 py-3 text-base sm:text-lg border-2 dark:border-gray-600 dark:text-gray-200"
              onClick={() => navigate('/templates')}
            >
              <Palette className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Browse Templates
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto px-4">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-4 sm:p-6 text-center">
                <div className="bg-blue-100 dark:bg-blue-900/50 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold text-base sm:text-lg mb-2 text-gray-900 dark:text-white">AI-Powered Content</h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                  Generate compelling bullet points, summaries, and skills tailored to your industry
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-4 sm:p-6 text-center">
                <div className="bg-purple-100 dark:bg-purple-900/50 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-semibold text-base sm:text-lg mb-2 text-gray-900 dark:text-white">ATS Optimized</h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                  Built-in ATS scoring and keyword optimization to pass applicant tracking systems
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-4 sm:p-6 text-center">
                <div className="bg-green-100 dark:bg-green-900/50 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Download className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-semibold text-base sm:text-lg mb-2 text-gray-900 dark:text-white">Professional PDF</h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                  Download high-quality PDFs ready for job applications and networking
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};
