
import React from 'react';
import { ResumeData } from '@/types/resume';

interface ElegantTemplateProps {
  data: ResumeData;
}

export const ElegantTemplate: React.FC<ElegantTemplateProps> = ({ data }) => {
  return (
    <div className="max-w-4xl mx-auto bg-white text-gray-800 font-serif">
      {/* Elegant Header */}
      <header className="text-center py-12 border-b-2 border-gray-200">
        <div className="flex flex-col items-center">
          {data.personalInfo.profileImage && (
            <img 
              src={data.personalInfo.profileImage} 
              alt="Profile" 
              className="w-24 h-24 rounded-full object-cover border-4 border-gray-200 shadow-lg mb-6"
            />
          )}
          
          <h1 className="text-5xl font-light mb-4 tracking-wide text-gray-900">
            {data.personalInfo.fullName || 'Your Name'}
          </h1>
          
          <div className="flex flex-wrap justify-center gap-6 text-gray-600 text-sm uppercase tracking-wider">
            {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
            {data.personalInfo.phone && <span>•</span>}
            {data.personalInfo.phone && <span>{data.personalInfo.phone}</span>}
            {data.personalInfo.location && <span>•</span>}
            {data.personalInfo.location && <span>{data.personalInfo.location}</span>}
          </div>
          
          {(data.personalInfo.linkedIn || data.personalInfo.website) && (
            <div className="flex flex-wrap justify-center gap-6 text-gray-500 text-sm mt-2">
              {data.personalInfo.linkedIn && <span>{data.personalInfo.linkedIn}</span>}
              {data.personalInfo.website && <span>{data.personalInfo.website}</span>}
            </div>
          )}
        </div>
      </header>

      <div className="p-12">
        {/* Professional Summary */}
        {data.summary && (
          <section className="mb-12 text-center">
            <div className="max-w-3xl mx-auto">
              <div className="w-16 h-0.5 bg-gray-400 mx-auto mb-6"></div>
              <p className="text-xl leading-relaxed text-gray-700 italic font-light">
                "{data.summary}"
              </p>
              <div className="w-16 h-0.5 bg-gray-400 mx-auto mt-6"></div>
            </div>
          </section>
        )}

        {/* Professional Experience */}
        {data.experience.length > 0 && (
          <section className="mb-12">
            <h2 className="text-3xl font-light text-center mb-8 text-gray-900 uppercase tracking-wider">
              Professional Experience
            </h2>
            <div className="space-y-10">
              {data.experience.map((exp) => (
                <div key={exp.id} className="text-center">
                  <h3 className="text-2xl font-light mb-2 text-gray-900">{exp.jobTitle}</h3>
                  <p className="text-lg text-gray-600 mb-2 uppercase tracking-wide">{exp.company}</p>
                  <p className="text-gray-500 mb-4 text-sm uppercase tracking-wider">
                    {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                    {exp.location && ` • ${exp.location}`}
                  </p>
                  <div className="max-w-3xl mx-auto">
                    <div className="w-12 h-0.5 bg-gray-300 mx-auto mb-4"></div>
                    <ul className="space-y-3 text-gray-700 leading-relaxed">
                      {exp.description.map((desc, index) => (
                        <li key={index} className="text-center">{desc}</li>
                      ))}
                    </ul>
                    <div className="w-12 h-0.5 bg-gray-300 mx-auto mt-4"></div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Education */}
          {data.education.length > 0 && (
            <section>
              <h2 className="text-2xl font-light text-center mb-8 text-gray-900 uppercase tracking-wider">
                Education
              </h2>
              <div className="space-y-6">
                {data.education.map((edu) => (
                  <div key={edu.id} className="text-center">
                    <h3 className="text-lg font-light text-gray-900 mb-1">{edu.degree}</h3>
                    <p className="text-gray-600 uppercase tracking-wide text-sm">{edu.school}</p>
                    <p className="text-gray-500 text-sm mt-1">{edu.graduationDate}</p>
                    {edu.gpa && <p className="text-gray-500 text-sm">GPA: {edu.gpa}</p>}
                    {edu.honors && <p className="text-gray-600 text-sm italic mt-1">{edu.honors}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Skills */}
          {data.skills.length > 0 && (
            <section>
              <h2 className="text-2xl font-light text-center mb-8 text-gray-900 uppercase tracking-wider">
                Expertise
              </h2>
              <div className="space-y-6">
                {Object.entries(
                  data.skills.reduce((acc, skill) => {
                    if (!acc[skill.category]) acc[skill.category] = [];
                    acc[skill.category].push(skill.name);
                    return acc;
                  }, {} as Record<string, string[]>)
                ).map(([category, skills]) => (
                  <div key={category} className="text-center">
                    <h3 className="text-lg font-light text-gray-900 mb-3 uppercase tracking-wide">
                      {category}
                    </h3>
                    <div className="space-y-1">
                      {skills.map((skill, idx) => (
                        <p key={idx} className="text-gray-600 text-sm">{skill}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Projects */}
        {data.projects.length > 0 && (
          <section className="mt-16">
            <h2 className="text-3xl font-light text-center mb-8 text-gray-900 uppercase tracking-wider">
              Notable Projects
            </h2>
            <div className="space-y-8">
              {data.projects.map((project) => (
                <div key={project.id} className="text-center max-w-3xl mx-auto">
                  <h3 className="text-xl font-light mb-2 text-gray-900">{project.name}</h3>
                  <p className="text-gray-500 text-sm mb-3 uppercase tracking-wider">
                    {project.startDate} - {project.endDate}
                  </p>
                  <div className="w-8 h-0.5 bg-gray-300 mx-auto mb-4"></div>
                  <p className="text-gray-700 leading-relaxed mb-4">{project.description}</p>
                  {project.technologies.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-3">
                      {project.technologies.map((tech, idx) => (
                        <span key={idx} className="text-xs text-gray-500 uppercase tracking-wider border border-gray-300 px-2 py-1 rounded">
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
