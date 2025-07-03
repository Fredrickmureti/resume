
import React from 'react';
import { ResumeData } from '@/types/resume';

interface ClassicTemplateProps {
  data: ResumeData;
}

export const ClassicTemplate: React.FC<ClassicTemplateProps> = ({ data }) => {
  const formatDate = (date: string) => {
    if (!date) return '';
    const [year, month] = date.split('-');
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  return (
    <div className="max-w-4xl mx-auto bg-white text-black font-serif p-8">
      {/* Header */}
      <header className="text-center border-b-2 border-black pb-4 mb-6">
        <h1 className="text-3xl font-bold mb-2">{data.personalInfo.fullName || 'Your Name'}</h1>
        <div className="text-sm space-y-1">
          <div>{data.personalInfo.email} | {data.personalInfo.phone}</div>
          {data.personalInfo.location && <div>{data.personalInfo.location}</div>}
          {(data.personalInfo.linkedIn || data.personalInfo.website) && (
            <div>
              {data.personalInfo.linkedIn && <span>{data.personalInfo.linkedIn}</span>}
              {data.personalInfo.linkedIn && data.personalInfo.website && <span> | </span>}
              {data.personalInfo.website && <span>{data.personalInfo.website}</span>}
            </div>
          )}
        </div>
      </header>

      {/* Summary */}
      {data.summary && (
        <section className="mb-6">
          <h2 className="text-lg font-bold mb-2 uppercase tracking-wide">Summary</h2>
          <p className="text-sm leading-relaxed">{data.summary}</p>
        </section>
      )}

      {/* Experience */}
      {data.experience.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-bold mb-3 uppercase tracking-wide">Experience</h2>
          {data.experience.map((exp) => (
            <div key={exp.id} className="mb-4">
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-bold">{exp.jobTitle}</h3>
                <span className="text-sm">
                  {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}
                </span>
              </div>
              <p className="font-semibold text-sm mb-2">{exp.company} {exp.location && `• ${exp.location}`}</p>
              <ul className="text-sm space-y-1 ml-4">
                {exp.description.filter(desc => desc.trim()).map((desc, index) => (
                  <li key={index} className="list-disc">{desc}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}

      {/* Education */}
      {data.education.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-bold mb-3 uppercase tracking-wide">Education</h2>
          {data.education.map((edu) => (
            <div key={edu.id} className="mb-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-sm">{edu.degree}</h3>
                  <p className="text-sm">{edu.school} {edu.location && `• ${edu.location}`}</p>
                  {(edu.gpa || edu.honors) && (
                    <p className="text-xs">
                      {edu.gpa && `GPA: ${edu.gpa}`}
                      {edu.gpa && edu.honors && ' • '}
                      {edu.honors}
                    </p>
                  )}
                </div>
                <span className="text-sm">{formatDate(edu.graduationDate)}</span>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Skills */}
      {data.skills.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-bold mb-3 uppercase tracking-wide">Skills</h2>
          {['Technical', 'Soft', 'Language', 'Other'].map(category => {
            const categorySkills = data.skills.filter(skill => skill.category === category);
            if (categorySkills.length === 0) return null;
            
            return (
              <div key={category} className="mb-2">
                <span className="font-semibold text-sm">{category}: </span>
                <span className="text-sm">
                  {categorySkills.map(skill => skill.name).join(', ')}
                </span>
              </div>
            );
          })}
        </section>
      )}

      {/* Projects */}
      {data.projects.length > 0 && (
        <section>
          <h2 className="text-lg font-bold mb-3 uppercase tracking-wide">Projects</h2>
          {data.projects.map((project) => (
            <div key={project.id} className="mb-4">
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-bold text-sm">{project.name}</h3>
                <span className="text-xs">
                  {formatDate(project.startDate)} - {formatDate(project.endDate)}
                </span>
              </div>
              <p className="text-xs mb-2">{project.description}</p>
              {project.technologies.length > 0 && (
                <p className="text-xs">
                  <span className="font-semibold">Technologies: </span>
                  {project.technologies.join(', ')}
                </p>
              )}
              {project.url && <p className="text-xs">{project.url}</p>}
            </div>
          ))}
        </section>
      )}
    </div>
  );
};
