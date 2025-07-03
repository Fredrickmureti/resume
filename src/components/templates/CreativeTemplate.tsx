
import React from 'react';
import { ResumeData } from '@/types/resume';
import { ModernTemplate } from './ModernTemplate';

interface CreativeTemplateProps {
  data: ResumeData;
}

export const CreativeTemplate: React.FC<CreativeTemplateProps> = ({ data }) => {
  // For now, use the modern template as base - can be customized later
  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50">
      <ModernTemplate data={data} />
    </div>
  );
};
