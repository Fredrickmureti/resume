
import React from 'react';
import { ResumeData, Template } from '@/types/resume';
import { ModernTemplate } from './templates/ModernTemplate';
import { ClassicTemplate } from './templates/ClassicTemplate';
import { CreativeTemplate } from './templates/CreativeTemplate';
import { MinimalTemplate } from './templates/MinimalTemplate';
import { ExecutiveTemplate } from './templates/ExecutiveTemplate';
import { TechTemplate } from './templates/TechTemplate';
import { HealthcareTemplate } from './templates/HealthcareTemplate';
import { AcademicTemplate } from './templates/AcademicTemplate';
import { LuxuryTemplate } from './templates/LuxuryTemplate';
import { ArtisticTemplate } from './templates/ArtisticTemplate';
import { CorporateTemplate } from './templates/CorporateTemplate';
import { ElegantTemplate } from './templates/ElegantTemplate';

interface ResumePreviewProps {
  data: ResumeData;
  template: Template;
}

export const ResumePreview: React.FC<ResumePreviewProps> = ({ data, template }) => {
  const renderTemplate = () => {
    switch (template) {
      case 'modern':
        return <ModernTemplate data={data} />;
      case 'classic':
        return <ClassicTemplate data={data} />;
      case 'creative':
        return <CreativeTemplate data={data} />;
      case 'minimal':
        return <MinimalTemplate data={data} />;
      case 'executive':
        return <ExecutiveTemplate data={data} />;
      case 'tech':
        return <TechTemplate data={data} />;
      case 'healthcare':
        return <HealthcareTemplate data={data} />;
      case 'academic':
        return <AcademicTemplate data={data} />;
      case 'luxury':
        return <LuxuryTemplate data={data} />;
      case 'artistic':
        return <ArtisticTemplate data={data} />;
      case 'corporate':
        return <CorporateTemplate data={data} />;
      case 'elegant':
        return <ElegantTemplate data={data} />;
      case 'finance':
        return <ClassicTemplate data={data} />; // Use classic for finance
      case 'consulting':
        return <ExecutiveTemplate data={data} />; // Use executive for consulting
      case 'marketing':
        return <CreativeTemplate data={data} />; // Use creative for marketing
      case 'sales':
        return <ModernTemplate data={data} />; // Use modern for sales
      case 'bold':
        return <ArtisticTemplate data={data} />; // Use artistic for bold
      case 'contemporary':
        return <ModernTemplate data={data} />; // Use modern for contemporary
      case 'professional':
        return <CorporateTemplate data={data} />; // Use corporate for professional
      case 'stylish':
        return <ElegantTemplate data={data} />; // Use elegant for stylish
      case 'sophisticated':
        return <LuxuryTemplate data={data} />; // Use luxury for sophisticated
      case 'vibrant':
        return <ArtisticTemplate data={data} />; // Use artistic for vibrant
      case 'premium':
        return <LuxuryTemplate data={data} />; // Use luxury for premium
      default:
        return <ModernTemplate data={data} />;
    }
  };

  return (
    <div 
      id="resume-preview" 
      className="w-full bg-white print:shadow-none"
      style={{
        // Optimize for PDF generation
        minHeight: 'auto',
        maxWidth: '210mm', // A4 width
        margin: '0 auto',
        fontSize: '14px',
        lineHeight: '1.4'
      }}
    >
      {renderTemplate()}
    </div>
  );
};
