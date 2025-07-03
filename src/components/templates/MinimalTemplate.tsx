
import React from 'react';
import { ResumeData } from '@/types/resume';

interface MinimalTemplateProps {
  data: ResumeData;
}

export const MinimalTemplate: React.FC<MinimalTemplateProps> = ({ data }) => {
  const formatDate = (date: string) => {
    if (!date) return '';
    const [year, month] = date.split('-');
    return `${month}/${year}`;
  };

  return (
    <div className="max-w-4xl mx-auto bg-white text-gray-800 font-sans p-8">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-2xl font-light mb-1">{data.personalInfo.fullName || 'Your Name'}</h1>
        <div className="text-xs text-gray-600 space-x-2">
          <span>{data.personalInfo.email}</span>
          {data.personalInfo.phone && <span>• {data.personalInfo.phone}</span>}
          {data.personalInfo.location && <span>• {data.personalInfo.location}</span>}
        </div>
      </header>

      {/* Summary */}
      {data.summary && (
        <section className="mb-6">
          <p className="text-sm leading-relaxed text-gray-700">{data.summary}</p>
        </section>
      )}

      {/* Experience */}
      {data.experience.length > 0 && (
        <section className="mb-6">
          <h2 className="text-sm font-semibold mb-3 text-gray-900">EXPERIENCE</h2>
          {data.experience.map((exp) => (
            <div key={exp.id} className="mb-4">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="text-sm font-medium">{exp.jobTitle}, {exp.company}</h3>
                <span className="text-xs text-gray-500">
                  {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}
                </span>
              </div>
              <ul className="text-xs text-gray-700 space-y-1">
                {exp.description.filter(desc => desc.trim()).map((desc, index) => (
                  <li key={index}>• {desc}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}

      {/* Education */}
      {data.education.length > 0 && (
        <section className="mb-6">
          <h2 className="text-sm font-semibold mb-3 text-gray-900">EDUCATION</h2>
          {data.education.map((edu) => (
            <div key={edu.id} className="mb-2">
              <div className="flex justify-between items-baseline">
                <span className="text-sm">{edu.degree}, {edu.school}</span>
                <span className="text-xs text-gray-500">{formatDate(edu.graduationDate)}</span>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Skills */}
      {data.skills.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold mb-3 text-gray-900">SKILLS</h2>
          <div className="text-xs text-gray-700">
            {data.skills.map(skill => skill.name).join(' • ')}
          </div>
        </section>
      )}
    </div>
  );
};
