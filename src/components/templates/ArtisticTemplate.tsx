
import React from 'react';
import { ResumeData } from '@/types/resume';
import { MapPin, Phone, Mail, Globe, Linkedin, Calendar, Palette } from 'lucide-react';

interface ArtisticTemplateProps {
  data: ResumeData;
}

export const ArtisticTemplate: React.FC<ArtisticTemplateProps> = ({ data }) => {
  return (
    <div className="max-w-4xl mx-auto bg-white shadow-lg print:shadow-none">
      {/* Creative Header with optional profile image */}
      <div className="relative overflow-hidden">
        <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 p-8">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-16 -translate-x-16"></div>
          <div className="absolute top-1/2 left-1/4 w-6 h-6 bg-yellow-300/60 rounded-full"></div>
          <div className="absolute top-1/4 right-1/3 w-4 h-4 bg-pink-300/60 rounded-full"></div>
          
          <div className="relative flex items-center gap-6 text-white">
            {data.personalInfo.profileImage && (
              <div className="flex-shrink-0">
                <img 
                  src={data.personalInfo.profileImage} 
                  alt="Profile" 
                  className="w-32 h-32 rounded-full border-4 border-white/50 object-cover shadow-2xl"
                />
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-5xl font-bold mb-4 text-shadow-lg">{data.personalInfo.fullName}</h1>
              <div className="grid md:grid-cols-2 gap-3 text-sm">
                {data.personalInfo.email && (
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                    <Mail className="h-4 w-4" />
                    <span>{data.personalInfo.email}</span>
                  </div>
                )}
                {data.personalInfo.phone && (
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                    <Phone className="h-4 w-4" />
                    <span>{data.personalInfo.phone}</span>
                  </div>
                )}
                {data.personalInfo.location && (
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                    <MapPin className="h-4 w-4" />
                    <span>{data.personalInfo.location}</span>
                  </div>
                )}
                {data.personalInfo.linkedIn && (
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                    <Linkedin className="h-4 w-4" />
                    <span>{data.personalInfo.linkedIn}</span>
                  </div>
                )}
                {data.personalInfo.website && (
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                    <Globe className="h-4 w-4" />
                    <span>{data.personalInfo.website}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* Creative Summary */}
        {data.summary && (
          <section className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Creative Vision
              </h2>
            </div>
            <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-orange-50 p-6 rounded-lg border-l-4 border-purple-500">
              <p className="text-gray-700 leading-relaxed text-lg italic">{data.summary}</p>
            </div>
          </section>
        )}

        {/* Experience */}
        {data.experience && data.experience.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Creative Journey
              </h2>
            </div>
            {data.experience.map((exp, index) => (
              <div key={index} className="mb-8 last:mb-0 relative">
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl shadow-sm border border-purple-100">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{exp.jobTitle}</h3>
                      <p className="text-purple-700 font-semibold text-lg">{exp.company}</p>
                    </div>
                    <div className="text-right text-sm text-gray-600 bg-white px-3 py-1 rounded-full shadow border">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</span>
                      </div>
                    </div>
                  </div>
                  {exp.description && exp.description.length > 0 && (
                    <ul className="space-y-2">
                      {exp.description.map((desc, i) => (
                        <li key={i} className="text-gray-700 flex items-start gap-2">
                          <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span>{desc}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </section>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {/* Education */}
          {data.education && data.education.length > 0 && (
            <section className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-2 h-6 bg-gradient-to-b from-orange-400 to-pink-500 rounded-full"></div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                  Education
                </h2>
              </div>
              {data.education.map((edu, index) => (
                <div key={index} className="mb-4 last:mb-0 bg-gradient-to-r from-orange-50 to-pink-50 p-4 rounded-lg border border-orange-200">
                  <h3 className="text-lg font-bold text-gray-800">{edu.degree}</h3>
                  <p className="text-orange-700 font-semibold">{edu.school}</p>
                  <div className="text-sm text-gray-600 mt-1">
                    <div>{edu.graduationDate}</div>
                    {edu.gpa && <div>GPA: {edu.gpa}</div>}
                    {edu.honors && <div className="text-orange-600 font-medium">{edu.honors}</div>}
                  </div>
                </div>
              ))}
            </section>
          )}

          {/* Skills */}
          {data.skills && data.skills.length > 0 && (
            <section className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-2 h-6 bg-gradient-to-b from-pink-400 to-purple-500 rounded-full"></div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                  Creative Skills
                </h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {data.skills.map((skill, index) => (
                  <span key={index} className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium border border-purple-200">
                    {skill.name}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Projects/Portfolio */}
        {data.projects && data.projects.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Portfolio Highlights
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {data.projects.map((project, index) => (
                <div key={index} className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-100 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <Palette className="h-5 w-5 text-purple-600" />
                    <h3 className="text-lg font-bold text-gray-800">{project.name}</h3>
                  </div>
                  <p className="text-gray-700 mb-3">{project.description}</p>
                  <div className="text-sm text-gray-600 mb-3">
                    {project.startDate} - {project.endDate}
                  </div>
                  {project.technologies && project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {project.technologies.map((tech, i) => (
                        <span key={i} className="bg-white text-purple-700 px-2 py-1 rounded text-xs border border-purple-200">
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
