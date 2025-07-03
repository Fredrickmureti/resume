
import React from 'react';
import { ResumeData } from '@/types/resume';
import { MapPin, Phone, Mail, Globe, Linkedin, Calendar, Award } from 'lucide-react';

interface LuxuryTemplateProps {
  data: ResumeData;
}

export const LuxuryTemplate: React.FC<LuxuryTemplateProps> = ({ data }) => {
  return (
    <div className="max-w-4xl mx-auto bg-white shadow-lg print:shadow-none">
      {/* Header with gold accent and optional profile image */}
      <div className="bg-gradient-to-r from-yellow-600 to-yellow-800 text-white p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/20 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-yellow-400/20 rounded-full translate-y-12 -translate-x-12"></div>
        
        <div className="relative flex items-center gap-6">
          {data.personalInfo.profileImage && (
            <div className="flex-shrink-0">
              <img 
                src={data.personalInfo.profileImage} 
                alt="Profile" 
                className="w-28 h-28 rounded-full border-4 border-yellow-300/50 object-cover shadow-xl"
              />
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-3 text-shadow">{data.personalInfo.fullName}</h1>
            <div className="grid md:grid-cols-2 gap-2 text-sm opacity-90">
              {data.personalInfo.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-yellow-200" />
                  <span>{data.personalInfo.email}</span>
                </div>
              )}
              {data.personalInfo.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-yellow-200" />
                  <span>{data.personalInfo.phone}</span>
                </div>
              )}
              {data.personalInfo.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-yellow-200" />
                  <span>{data.personalInfo.location}</span>
                </div>
              )}
              {data.personalInfo.linkedIn && (
                <div className="flex items-center gap-2">
                  <Linkedin className="h-4 w-4 text-yellow-200" />
                  <span>{data.personalInfo.linkedIn}</span>
                </div>
              )}
              {data.personalInfo.website && (
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-yellow-200" />
                  <span>{data.personalInfo.website}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* Executive Summary */}
        {data.summary && (
          <section className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-8 bg-gradient-to-b from-yellow-600 to-yellow-800"></div>
              <h2 className="text-2xl font-bold text-gray-800">Executive Summary</h2>
            </div>
            <p className="text-gray-700 leading-relaxed text-lg">{data.summary}</p>
          </section>
        )}

        {/* Professional Experience */}
        {data.experience && data.experience.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-8 bg-gradient-to-b from-yellow-600 to-yellow-800"></div>
              <h2 className="text-2xl font-bold text-gray-800">Professional Experience</h2>
            </div>
            {data.experience.map((exp, index) => (
              <div key={index} className="mb-8 last:mb-0 relative pl-6">
                <div className="absolute left-0 top-2 w-3 h-3 bg-yellow-600 rounded-full"></div>
                <div className="bg-gradient-to-r from-yellow-50 to-transparent p-6 rounded-lg border-l-4 border-yellow-600">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{exp.jobTitle}</h3>
                      <p className="text-yellow-700 font-semibold text-lg">{exp.company}</p>
                    </div>
                    <div className="text-right text-sm text-gray-600 bg-white px-3 py-1 rounded-full shadow">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</span>
                      </div>
                    </div>
                  </div>
                  {exp.description && exp.description.length > 0 && (
                    <ul className="list-disc pl-5 space-y-2">
                      {exp.description.map((desc, i) => (
                        <li key={i} className="text-gray-700">{desc}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Education */}
        {data.education && data.education.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-8 bg-gradient-to-b from-yellow-600 to-yellow-800"></div>
              <h2 className="text-2xl font-bold text-gray-800">Education</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {data.education.map((edu, index) => (
                <div key={index} className="bg-gradient-to-br from-yellow-50 to-white p-6 rounded-lg border border-yellow-200 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-800 mb-1">{edu.degree}</h3>
                  <p className="text-yellow-700 font-semibold mb-2">{edu.school}</p>
                  <div className="text-sm text-gray-600">
                    <div>{edu.graduationDate}</div>
                    {edu.gpa && <div>GPA: {edu.gpa}</div>}
                    {edu.honors && <div className="text-yellow-600 font-medium mt-1">{edu.honors}</div>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills */}
        {data.skills && data.skills.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-8 bg-gradient-to-b from-yellow-600 to-yellow-800"></div>
              <h2 className="text-2xl font-bold text-gray-800">Core Competencies</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {data.skills.map((skill, index) => (
                <span key={index} className="bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 px-4 py-2 rounded-full font-medium border border-yellow-300 shadow-sm">
                  {skill.name}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Certifications */}
        {data.certifications && data.certifications.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-8 bg-gradient-to-b from-yellow-600 to-yellow-800"></div>
              <h2 className="text-2xl font-bold text-gray-800">Professional Certifications</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {data.certifications.map((cert, index) => (
                <div key={index} className="flex items-center gap-3 p-4 bg-gradient-to-r from-yellow-50 to-white rounded-lg border border-yellow-200">
                  <Award className="h-6 w-6 text-yellow-600 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-gray-800">{cert.name}</h3>
                    <p className="text-yellow-700 text-sm">{cert.issuer}</p>
                    <p className="text-gray-600 text-xs">{cert.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
