
import React from 'react';
import { ResumeData, Template } from '@/types/resume';
import { formatDistanceToNow } from 'date-fns';
import { MapPin, Mail, Phone, Globe, Linkedin, User } from 'lucide-react';

interface ModernTemplateProps {
  data: ResumeData;
}

export const ModernTemplate: React.FC<ModernTemplateProps> = ({ data }) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    if (dateString.toLowerCase() === 'present' || dateString.toLowerCase() === 'current') {
      return 'Present';
    }
    try {
      // Handle YYYY-MM format
      if (dateString.includes('-')) {
        const [year, month] = dateString.split('-');
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthIndex = parseInt(month) - 1;
        if (monthIndex >= 0 && monthIndex < 12) {
          return `${monthNames[monthIndex]} ${year}`;
        }
      }
      return dateString;
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-lg" style={{ minHeight: '842px' }}>
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-8">
        <div className="flex items-start gap-6">
          {/* Profile Image */}
          {data.personalInfo.profileImage && (
            <div className="flex-shrink-0">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
                <img 
                  src={data.personalInfo.profileImage} 
                  alt="Profile"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to placeholder if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.parentElement!.innerHTML = `
                      <div class="w-full h-full bg-blue-100 flex items-center justify-center">
                        <svg class="w-12 h-12 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                        </svg>
                      </div>
                    `;
                  }}
                />
              </div>
            </div>
          )}
          
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-2">{data.personalInfo.fullName}</h1>
            
            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4 text-blue-100">
              {data.personalInfo.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">{data.personalInfo.email}</span>
                </div>
              )}
              {data.personalInfo.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span className="text-sm">{data.personalInfo.phone}</span>
                </div>
              )}
              {data.personalInfo.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{data.personalInfo.location}</span>
                </div>
              )}
              {data.personalInfo.website && (
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  <span className="text-sm">{data.personalInfo.website}</span>
                </div>
              )}
              {data.personalInfo.linkedIn && (
                <div className="flex items-center gap-2">
                  <Linkedin className="w-4 h-4" />
                  <span className="text-sm">{data.personalInfo.linkedIn}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* Professional Summary */}
        {data.summary && (
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-blue-800 mb-4 pb-2 border-b-2 border-blue-200">
              Professional Summary
            </h2>
            <p className="text-gray-700 leading-relaxed">{data.summary}</p>
          </section>
        )}

        {/* Experience */}
        {data.experience && data.experience.length > 0 && (
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-blue-800 mb-4 pb-2 border-b-2 border-blue-200">
              Professional Experience
            </h2>
            <div className="space-y-6">
              {data.experience.map((exp, index) => (
                <div key={index} className="relative pl-6">
                  <div className="absolute left-0 top-0 w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-2">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{exp.jobTitle}</h3>
                      <p className="text-lg text-blue-600 font-medium">{exp.company}</p>
                      {exp.location && <p className="text-sm text-gray-600">{exp.location}</p>}
                    </div>
                    <div className="text-sm text-gray-600 md:text-right">
                      <p>
                        {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}
                      </p>
                    </div>
                  </div>
                  {exp.description && exp.description.length > 0 && (
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      {exp.description.map((desc, descIndex) => (
                        <li key={descIndex} className="text-sm leading-relaxed">{desc}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {data.education && data.education.length > 0 && (
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-blue-800 mb-4 pb-2 border-b-2 border-blue-200">
              Education
            </h2>
            <div className="space-y-4">
              {data.education.map((edu, index) => (
                <div key={index} className="relative pl-6">
                  <div className="absolute left-0 top-0 w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{edu.degree}</h3>
                      <p className="text-blue-600 font-medium">{edu.school}</p>
                      {edu.location && <p className="text-sm text-gray-600">{edu.location}</p>}
                      {edu.gpa && <p className="text-sm text-gray-600">GPA: {edu.gpa}</p>}
                    </div>
                    {edu.graduationDate && (
                      <div className="text-sm text-gray-600 md:text-right">
                        <p>{formatDate(edu.graduationDate)}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills */}
        {data.skills && data.skills.length > 0 && (
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-blue-800 mb-4 pb-2 border-b-2 border-blue-200">
              Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {data.skills.map((skill, index) => (
                <span 
                  key={index} 
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                >
                  {skill.name}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {data.projects && data.projects.length > 0 && (
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-blue-800 mb-4 pb-2 border-b-2 border-blue-200">
              Projects
            </h2>
            <div className="space-y-4">
              {data.projects.map((project, index) => (
                <div key={index} className="relative pl-6">
                  <div className="absolute left-0 top-0 w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                      {project.url && (
                        <p className="text-blue-600 text-sm">{project.url}</p>
                      )}
                    </div>
                    {(project.startDate || project.endDate) && (
                      <div className="text-sm text-gray-600 md:text-right">
                        <p>
                          {formatDate(project.startDate)} - {formatDate(project.endDate)}
                        </p>
                      </div>
                    )}
                  </div>
                  {project.description && (
                    <p className="text-sm text-gray-700 mb-2">{project.description}</p>
                  )}
                  {project.technologies && project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {project.technologies.map((tech, techIndex) => (
                        <span 
                          key={techIndex} 
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                        >
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

        {/* Certifications */}
        {data.certifications && data.certifications.length > 0 && (
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-blue-800 mb-4 pb-2 border-b-2 border-blue-200">
              Certifications
            </h2>
            <div className="space-y-3">
              {data.certifications.map((cert, index) => (
                <div key={index} className="flex flex-col md:flex-row md:justify-between md:items-center">
                  <div>
                    <h3 className="font-semibold text-gray-900">{cert.name}</h3>
                    <p className="text-blue-600">{cert.issuer}</p>
                  </div>
                  {cert.date && (
                    <p className="text-sm text-gray-600">{formatDate(cert.date)}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Languages */}
        {data.languages && data.languages.length > 0 && (
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-blue-800 mb-4 pb-2 border-b-2 border-blue-200">
              Languages
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {data.languages.map((lang, index) => (
                <div key={index} className="flex justify-between">
                  <span className="font-medium text-gray-900">{lang.name}</span>
                  <span className="text-gray-600">{lang.proficiency}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
