
import React from 'react';
import { ResumeData } from '@/types/resume';
import { Code, Github, ExternalLink } from 'lucide-react';

interface TechTemplateProps {
  data: ResumeData;
}

export const TechTemplate: React.FC<TechTemplateProps> = ({ data }) => {
  const formatDate = (date: string) => {
    if (!date) return '';
    const [year, month] = date.split('-');
    return `${month}/${year}`;
  };

  return (
    <div className="max-w-4xl mx-auto bg-gray-900 text-gray-100 p-8 font-mono">
      {/* Header */}
      <header className="mb-8 border-b border-green-400 pb-6">
        <div className="flex items-center mb-4">
          <Code className="h-8 w-8 text-green-400 mr-3" />
          <h1 className="text-3xl font-bold text-green-400">
            {data.personalInfo.fullName || 'Your Name'}
          </h1>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-300">
          <div>
            <p>📧 {data.personalInfo.email}</p>
            <p>📱 {data.personalInfo.phone}</p>
          </div>
          <div>
            <p>📍 {data.personalInfo.location}</p>
            {data.personalInfo.website && <p>🌐 {data.personalInfo.website}</p>}
          </div>
        </div>
      </header>

      {/* Summary */}
      {data.summary && (
        <section className="mb-8">
          <h2 className="text-xl font-bold text-green-400 mb-3 flex items-center">
            <span className="text-gray-500 mr-2">{'>'}</span> ABOUT
          </h2>
          <p className="text-gray-300 leading-relaxed pl-6">{data.summary}</p>
        </section>
      )}

      {/* Technical Skills */}
      {data.skills.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold text-green-400 mb-3 flex items-center">
            <span className="text-gray-500 mr-2">{'>'}</span> TECHNICAL_SKILLS
          </h2>
          <div className="pl-6 space-y-3">
            {Object.entries(
              data.skills.reduce((acc, skill) => {
                if (!acc[skill.category]) acc[skill.category] = [];
                acc[skill.category].push(skill.name);
                return acc;
              }, {} as Record<string, string[]>)
            ).map(([category, skills]) => (
              <div key={category}>
                <span className="text-blue-400 font-semibold">{category.toLowerCase()}: </span>
                <span className="text-gray-300">[{skills.join(', ')}]</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Experience */}
      {data.experience.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold text-green-400 mb-3 flex items-center">
            <span className="text-gray-500 mr-2">{'>'}</span> EXPERIENCE
          </h2>
          <div className="pl-6 space-y-6">
            {data.experience.map((exp) => (
              <div key={exp.id} className="border-l-2 border-blue-400 pl-4">
                <div className="flex justify-between mb-2">
                  <h3 className="text-lg font-semibold text-blue-400">{exp.jobTitle}</h3>
                  <span className="text-sm text-gray-400">
                    {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}
                  </span>
                </div>
                <p className="text-gray-300 mb-2">{exp.company} | {exp.location}</p>
                <ul className="text-sm text-gray-300 space-y-1">
                  {exp.description.map((desc, index) => (
                    <li key={index} className="flex">
                      <span className="text-green-400 mr-2">-</span>
                      <span>{desc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {data.projects.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold text-green-400 mb-3 flex items-center">
            <span className="text-gray-500 mr-2">{'>'}</span> PROJECTS
          </h2>
          <div className="pl-6 space-y-4">
            {data.projects.map((project) => (
              <div key={project.id} className="border border-gray-700 rounded p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-blue-400 flex items-center">
                    <Github className="h-4 w-4 mr-2" />
                    {project.name}
                  </h3>
                  {project.url && (
                    <ExternalLink className="h-4 w-4 text-gray-400 hover:text-green-400" />
                  )}
                </div>
                <p className="text-gray-300 mb-3">{project.description}</p>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech, index) => (
                    <span key={index} className="bg-gray-800 text-green-400 px-2 py-1 rounded text-xs">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {data.education.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-green-400 mb-3 flex items-center">
            <span className="text-gray-500 mr-2">{'>'}</span> EDUCATION
          </h2>
          <div className="pl-6 space-y-3">
            {data.education.map((edu) => (
              <div key={edu.id} className="flex justify-between">
                <div>
                  <h3 className="text-blue-400 font-semibold">{edu.degree}</h3>
                  <p className="text-gray-300">{edu.school}</p>
                </div>
                <span className="text-gray-400">{formatDate(edu.graduationDate)}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
