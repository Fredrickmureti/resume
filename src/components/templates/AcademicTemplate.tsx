
import React from 'react';
import { ResumeData } from '@/types/resume';
import { MapPin, Phone, Mail, Globe, Linkedin, Calendar, User } from 'lucide-react';

interface AcademicTemplateProps {
  data: ResumeData;
}

export const AcademicTemplate: React.FC<AcademicTemplateProps> = ({ data }) => {
  return (
    <div className="max-w-4xl mx-auto bg-white shadow-lg print:shadow-none">
      {/* Header with optional profile image */}
      <div className="bg-gradient-to-r from-indigo-700 to-purple-800 text-white p-8">
        <div className="flex items-center gap-6">
          {data.personalInfo.profileImage && (
            <div className="flex-shrink-0">
              <img 
                src={data.personalInfo.profileImage} 
                alt="Profile" 
                className="w-24 h-24 rounded-full border-4 border-white/30 object-cover"
              />
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-3">{data.personalInfo.fullName}</h1>
            <div className="grid md:grid-cols-2 gap-2 text-sm">
              {data.personalInfo.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>{data.personalInfo.email}</span>
                </div>
              )}
              {data.personalInfo.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>{data.personalInfo.phone}</span>
                </div>
              )}
              {data.personalInfo.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{data.personalInfo.location}</span>
                </div>
              )}
              {data.personalInfo.linkedIn && (
                <div className="flex items-center gap-2">
                  <Linkedin className="h-4 w-4" />
                  <span>{data.personalInfo.linkedIn}</span>
                </div>
              )}
              {data.personalInfo.website && (
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  <span>{data.personalInfo.website}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* Research Summary */}
        {data.summary && (
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-indigo-800 border-b-2 border-indigo-200 pb-2 mb-4">
              Research Summary
            </h2>
            <p className="text-gray-700 leading-relaxed">{data.summary}</p>
          </section>
        )}

        {/* Academic Experience */}
        {data.experience && data.experience.length > 0 && (
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-indigo-800 border-b-2 border-indigo-200 pb-2 mb-4">
              Academic Experience
            </h2>
            {data.experience.map((exp, index) => (
              <div key={index} className="mb-6 last:mb-0">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{exp.jobTitle}</h3>
                    <p className="text-indigo-700 font-medium">{exp.company}</p>
                  </div>
                  <div className="text-right text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</span>
                    </div>
                  </div>
                </div>
                {exp.description && exp.description.length > 0 && (
                  <ul className="list-disc pl-5 space-y-1">
                    {exp.description.map((desc, i) => (
                      <li key={i} className="text-gray-700 text-sm">{desc}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </section>
        )}

        {/* Education */}
        {data.education && data.education.length > 0 && (
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-indigo-800 border-b-2 border-indigo-200 pb-2 mb-4">
              Education
            </h2>
            {data.education.map((edu, index) => (
              <div key={index} className="mb-4 last:mb-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{edu.degree}</h3>
                    <p className="text-indigo-700 font-medium">{edu.school}</p>
                    {edu.honors && <p className="text-sm text-gray-600">{edu.honors}</p>}
                  </div>
                  <div className="text-right text-sm text-gray-600">
                    <div>{edu.graduationDate}</div>
                    {edu.gpa && <div>GPA: {edu.gpa}</div>}
                  </div>
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Research Projects */}
        {data.projects && data.projects.length > 0 && (
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-indigo-800 border-b-2 border-indigo-200 pb-2 mb-4">
              Research Projects
            </h2>
            {data.projects.map((project, index) => (
              <div key={index} className="mb-6 last:mb-0">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-gray-800">{project.name}</h3>
                  <span className="text-sm text-gray-600">
                    {project.startDate} - {project.endDate}
                  </span>
                </div>
                <p className="text-gray-700 mb-2">{project.description}</p>
                {project.technologies && project.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech, i) => (
                      <span key={i} className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-xs">
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </section>
        )}

        {/* Skills */}
        {data.skills && data.skills.length > 0 && (
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-indigo-800 border-b-2 border-indigo-200 pb-2 mb-4">
              Skills & Expertise
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {['Technical', 'Soft', 'Language', 'Other'].map((category) => {
                const categorySkills = data.skills.filter(skill => skill.category === category);
                if (categorySkills.length === 0) return null;
                
                return (
                  <div key={category}>
                    <h3 className="font-bold text-gray-800 mb-2">{category} Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {categorySkills.map((skill, i) => (
                        <span key={i} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Publications/Certifications */}
        {data.certifications && data.certifications.length > 0 && (
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-indigo-800 border-b-2 border-indigo-200 pb-2 mb-4">
              Publications & Certifications
            </h2>
            {data.certifications.map((cert, index) => (
              <div key={index} className="mb-4 last:mb-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{cert.name}</h3>
                    <p className="text-indigo-700 font-medium">{cert.issuer}</p>
                  </div>
                  <span className="text-sm text-gray-600">{cert.date}</span>
                </div>
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  );
};
