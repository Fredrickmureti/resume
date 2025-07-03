
import React from 'react';
import { ResumeData } from '@/types/resume';

interface CorporateTemplateProps {
  data: ResumeData;
}

export const CorporateTemplate: React.FC<CorporateTemplateProps> = ({ data }) => {
  return (
    <div className="max-w-4xl mx-auto bg-white text-gray-900 font-sans">
      {/* Professional Header */}
      <header className="bg-slate-900 text-white p-8 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-3 tracking-tight">
              {data.personalInfo.fullName || 'Your Name'}
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-200">
              {data.personalInfo.email && (
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                  {data.personalInfo.email}
                </div>
              )}
              {data.personalInfo.phone && (
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                  {data.personalInfo.phone}
                </div>
              )}
              {data.personalInfo.location && (
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                  {data.personalInfo.location}
                </div>
              )}
              {data.personalInfo.linkedIn && (
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                  {data.personalInfo.linkedIn}
                </div>
              )}
            </div>
          </div>
          
          {data.personalInfo.profileImage && (
            <div className="ml-8">
              <img 
                src={data.personalInfo.profileImage} 
                alt="Profile" 
                className="w-28 h-28 rounded-lg object-cover border-2 border-slate-700 shadow-lg"
              />
            </div>
          )}
        </div>
      </header>

      <div className="px-8 pb-8">
        {/* Professional Summary */}
        {data.summary && (
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b-2 border-blue-600">
              PROFESSIONAL SUMMARY
            </h2>
            <p className="text-lg leading-relaxed text-gray-700 bg-slate-50 p-6 rounded-lg">
              {data.summary}
            </p>
          </section>
        )}

        {/* Professional Experience */}
        {data.experience.length > 0 && (
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 pb-2 border-b-2 border-blue-600">
              PROFESSIONAL EXPERIENCE
            </h2>
            <div className="space-y-8">
              {data.experience.map((exp) => (
                <div key={exp.id} className="border-l-4 border-blue-600 pl-6 pb-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">{exp.jobTitle}</h3>
                      <p className="text-lg font-semibold text-blue-600">{exp.company}</p>
                      {exp.location && <p className="text-gray-600">{exp.location}</p>}
                    </div>
                    <div className="bg-slate-100 px-4 py-2 rounded-lg text-right">
                      <p className="font-semibold text-slate-800">
                        {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                      </p>
                    </div>
                  </div>
                  <ul className="space-y-2">
                    {exp.description.map((desc, index) => (
                      <li key={index} className="flex items-start text-gray-700">
                        <span className="w-2 h-2 bg-blue-600 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                        <span>{desc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Two Column Layout for Education and Skills */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Education */}
          {data.education.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4 pb-2 border-b-2 border-blue-600">
                EDUCATION
              </h2>
              <div className="space-y-4">
                {data.education.map((edu) => (
                  <div key={edu.id} className="bg-slate-50 p-4 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-slate-900">{edu.degree}</h3>
                        <p className="text-blue-600 font-semibold">{edu.school}</p>
                        {edu.honors && <p className="text-sm text-gray-600 italic">{edu.honors}</p>}
                      </div>
                      <div className="text-right text-sm">
                        <p className="font-medium text-slate-700">{edu.graduationDate}</p>
                        {edu.gpa && <p className="text-gray-600">GPA: {edu.gpa}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Core Competencies */}
          {data.skills.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4 pb-2 border-b-2 border-blue-600">
                CORE COMPETENCIES
              </h2>
              <div className="space-y-4">
                {Object.entries(
                  data.skills.reduce((acc, skill) => {
                    if (!acc[skill.category]) acc[skill.category] = [];
                    acc[skill.category].push(skill.name);
                    return acc;
                  }, {} as Record<string, string[]>)
                ).map(([category, skills]) => (
                  <div key={category} className="bg-slate-50 p-4 rounded-lg">
                    <h3 className="font-bold text-blue-600 mb-2">{category}</h3>
                    <div className="grid grid-cols-1 gap-1">
                      {skills.map((skill, idx) => (
                        <div key={idx} className="flex items-center">
                          <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></span>
                          <span className="text-sm text-gray-700">{skill}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Projects Section */}
        {data.projects.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-6 pb-2 border-b-2 border-blue-600">
              KEY PROJECTS
            </h2>
            <div className="grid gap-6">
              {data.projects.map((project) => (
                <div key={project.id} className="bg-slate-50 p-6 rounded-lg border-l-4 border-blue-600">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-bold text-slate-900">{project.name}</h3>
                    <span className="text-sm text-gray-600">
                      {project.startDate} - {project.endDate}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-3">{project.description}</p>
                  {project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech, idx) => (
                        <span key={idx} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
