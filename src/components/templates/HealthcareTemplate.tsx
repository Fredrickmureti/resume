
import React from 'react';
import { ResumeData } from '@/types/resume';
import { Heart, Award, Users } from 'lucide-react';

interface HealthcareTemplateProps {
  data: ResumeData;
}

export const HealthcareTemplate: React.FC<HealthcareTemplateProps> = ({ data }) => {
  const formatDate = (date: string) => {
    if (!date) return '';
    const [year, month] = date.split('-');
    return `${month}/${year}`;
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 text-gray-800 font-serif">
      {/* Header */}
      <header className="text-center mb-8 border-b-2 border-teal-600 pb-6">
        <div className="flex justify-center mb-4">
          <Heart className="h-12 w-12 text-teal-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {data.personalInfo.fullName || 'Your Name'}
        </h1>
        <div className="text-gray-600 space-y-1">
          <p>{data.personalInfo.email} | {data.personalInfo.phone}</p>
          <p>{data.personalInfo.location}</p>
        </div>
      </header>

      {/* Professional Summary */}
      {data.summary && (
        <section className="mb-8">
          <h2 className="text-xl font-bold text-teal-600 mb-3 flex items-center">
            <Users className="h-5 w-5 mr-2" />
            PROFESSIONAL SUMMARY
          </h2>
          <p className="text-gray-700 leading-relaxed italic border-l-4 border-teal-200 pl-4">
            {data.summary}
          </p>
        </section>
      )}

      {/* Clinical Experience */}
      {data.experience.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold text-teal-600 mb-4">CLINICAL EXPERIENCE</h2>
          <div className="space-y-6">
            {data.experience.map((exp) => (
              <div key={exp.id} className="bg-teal-50 p-4 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{exp.jobTitle}</h3>
                    <p className="text-teal-700 font-semibold">{exp.company}</p>
                  </div>
                  <div className="text-right text-gray-600">
                    <p className="font-medium">
                      {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}
                    </p>
                    <p className="text-sm">{exp.location}</p>
                  </div>
                </div>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  {exp.description.map((desc, index) => (
                    <li key={index}>{desc}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education & Certifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Education */}
        {data.education.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-teal-600 mb-4">EDUCATION</h2>
            <div className="space-y-3">
              {data.education.map((edu) => (
                <div key={edu.id} className="border-l-4 border-teal-600 pl-4">
                  <h3 className="font-bold text-gray-900">{edu.degree}</h3>
                  <p className="text-gray-600">{edu.school}</p>
                  <p className="text-sm text-gray-500">{formatDate(edu.graduationDate)}</p>
                  {edu.honors && <p className="text-sm text-teal-600 italic">{edu.honors}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Certifications */}
        {data.certifications.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-teal-600 mb-4 flex items-center">
              <Award className="h-5 w-5 mr-2" />
              CERTIFICATIONS
            </h2>
            <div className="space-y-3">
              {data.certifications.map((cert) => (
                <div key={cert.id} className="bg-gray-50 p-3 rounded">
                  <h3 className="font-semibold text-gray-900">{cert.name}</h3>
                  <p className="text-gray-600 text-sm">{cert.issuer}</p>
                  <p className="text-gray-500 text-sm">{formatDate(cert.date)}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Skills */}
      {data.skills.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-teal-600 mb-4">CORE COMPETENCIES</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {data.skills.map((skill) => (
              <div key={skill.id} className="flex items-center">
                <div className="w-2 h-2 bg-teal-600 rounded-full mr-2"></div>
                <span className="text-gray-700">{skill.name}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
