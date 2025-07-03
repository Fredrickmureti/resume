
import React from 'react';
import { FileText, Heart, ExternalLink, Mail, Github, Linkedin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4">
        {/* Main Footer Content */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  ResumeAI Pro
                </h3>
                <p className="text-sm text-gray-400">Advanced ATS-Optimized Resume Builder</p>
              </div>
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              Create professional, ATS-optimized resumes with AI-powered suggestions. 
              Stand out from the crowd and land your dream job with our advanced resume builder.
            </p>
            <div className="flex items-center space-x-4">
              <a 
                href="mailto:contact@devfredrick.me" 
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </a>
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-gray-400 hover:text-white transition-colors">
                  Resume Builder
                </a>
              </li>
              <li>
                <a href="/dashboard" className="text-gray-400 hover:text-white transition-colors">
                  Dashboard
                </a>
              </li>
              <li>
                <a href="/templates" className="text-gray-400 hover:text-white transition-colors">
                  Templates
                </a>
              </li>
              <li>
                <a href="/auth" className="text-gray-400 hover:text-white transition-colors">
                  Sign In
                </a>
              </li>
            </ul>
          </div>

          {/* Features */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Features</h4>
            <ul className="space-y-2">
              <li className="text-gray-400">AI-Powered Suggestions</li>
              <li className="text-gray-400">ATS Optimization</li>
              <li className="text-gray-400">Multiple Templates</li>
              <li className="text-gray-400">Real-time Preview</li>
              <li className="text-gray-400">PDF Export</li>
            </ul>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-gray-800 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2 text-gray-400">
              <span>Made with</span>
              <Heart className="h-4 w-4 text-red-500 fill-current" />
              <span>by</span>
              <a 
                href="https://devfredrick.me" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 transition-colors font-medium flex items-center space-x-1"
              >
                <span>Fredrick Mureti</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            
            <div className="text-gray-400 text-sm">
              © {new Date().getFullYear()} ResumeAI Pro. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
