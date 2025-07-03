
import React from 'react';
import { ResumeData } from '@/types/resume';

interface ExecutiveTemplateProps {
  data: ResumeData;
}

export const ExecutiveTemplate: React.FC<ExecutiveTemplateProps> = ({ data }) => {
  return (
    <div className="max-w-4xl mx-auto bg-white p-8 text-gray-900 font-serif">
      {/* Header */}
      <header className="text-center border-b-2 border-gray-800 pb-6 mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          {data.personalInfo.fullName || 'Your Name'}
        </h1>
        <div className="text-lg text-gray-600 space-x-4">
          {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
          {data.personalInfo.phone && <span>•</span>}
          {data.personalInfo.phone && <span>{data.personalInfo.phone}</span>}
          {data.personalInfo.location && <span>•</span>}
          {data.personalInfo.location && <span>{data.personalInfo.location}</span>}
        </div>
        {(data.personalInfo.linkedIn || data.personalInfo.website) && (
          <div className="text-sm text-gray-500 mt-2 space-x-4">
            {data.personalInfo.linkedIn && <span>{data.personalInfo.linkedIn}</span>}
            {data.personalInfo.website && <span>{data.personalInfo.website}</span>}
          </div>
        )}
      </header>

      {/* Executive Summary */}
      {data.summary && (
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b border-gray-300 pb-2">
            EXECUTIVE SUMMARY
          </h2>
          <p className="text-gray-700 leading-relaxed text-lg">{data.summary}</p>
        </section>
      )}

      {/* Professional Experience */}
      {data.experience.length > 0 && (
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b border-gray-300 pb-2">
            PROFESSIONAL EXPERIENCE
          </h2>
          <div className="space-y-6">
            {data.experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{exp.jobTitle}</h3>
                    <p className="text-lg text-gray-600 font-medium">{exp.company}</p>
                  </div>
                  <div className="text-right text-gray-600">
                    <p className="font-medium">
                      {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                    </p>
                    {exp.location && <p className="text-sm">{exp.location}</p>}
                  </div>
                </div>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  {exp.description.map((desc, index) => (
                    <li key={index} className="leading-relaxed">{desc}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {data.education.length > 0 && (
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b border-gray-300 pb-2">
            EDUCATION
          </h2>
          <div className="space-y-3">
            {data.education.map((edu) => (
              <div key={edu.id} className="flex justify-between">
                <div>
                  <h3 className="font-bold text-gray-800">{edu.degree}</h3>
                  <p className="text-gray-600">{edu.school}</p>
                  {edu.honors && <p className="text-sm text-gray-500 italic">{edu.honors}</p>}
                </div>
                <div className="text-right text-gray-600">
                  <p>{edu.graduationDate}</p>
                  {edu.gpa && <p className="text-sm">GPA: {edu.gpa}</p>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Core Competencies */}
      {data.skills.length > 0 && (
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b border-gray-300 pb-2">
            CORE COMPETENCIES
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(
              data.skills.reduce((acc, skill) => {
                if (!acc[skill.category]) acc[skill.category] = [];
                acc[skill.category].push(skill.name);
                return acc;
              }, {} as Record<string, string[]>)
            ).map(([category, skills]) => (
              <div key={category}>
                <h3 className="font-bold text-gray-700 mb-2">{category}</h3>
                <p className="text-gray-600">{skills.join(' • ')}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
