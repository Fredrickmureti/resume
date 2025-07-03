
import { ResumeData } from '@/types/resume';

export const getSampleResumeData = (): ResumeData => ({
  personalInfo: {
    fullName: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    linkedIn: 'linkedin.com/in/sarahjohnson',
    website: 'sarahjohnson.dev'
  },
  summary: 'Results-driven Software Engineer with 5+ years of experience developing scalable web applications and leading cross-functional teams. Proven track record of delivering high-quality solutions that improve user experience and drive business growth. Passionate about clean code, modern technologies, and mentoring junior developers.',
  experience: [
    {
      id: '1',
      jobTitle: 'Senior Software Engineer',
      company: 'TechCorp Solutions',
      location: 'San Francisco, CA',
      startDate: '2022-03',
      endDate: '',
      current: true,
      description: [
        'Led development of microservices architecture serving 1M+ daily active users',
        'Reduced application load time by 40% through code optimization and caching strategies',
        'Mentored 3 junior developers and conducted technical interviews for hiring',
        'Collaborated with product team to define technical requirements and project roadmaps'
      ]
    },
    {
      id: '2',
      jobTitle: 'Software Engineer',
      company: 'StartupXYZ',
      location: 'San Francisco, CA',
      startDate: '2020-06',
      endDate: '2022-02',
      current: false,
      description: [
        'Built responsive web applications using React, TypeScript, and Node.js',
        'Implemented automated testing suites, increasing code coverage from 60% to 95%',
        'Designed and developed RESTful APIs handling 10K+ requests per minute',
        'Participated in agile development process and sprint planning sessions'
      ]
    },
    {
      id: '3',
      jobTitle: 'Junior Developer',
      company: 'WebDev Agency',
      location: 'Oakland, CA',
      startDate: '2019-01',
      endDate: '2020-05',
      current: false,
      description: [
        'Developed client websites using HTML, CSS, JavaScript, and WordPress',
        'Collaborated with designers to implement pixel-perfect UI components',
        'Optimized website performance and SEO, improving search rankings by 30%',
        'Provided technical support and maintenance for 20+ client websites'
      ]
    }
  ],
  education: [
    {
      id: '1',
      degree: 'Bachelor of Science in Computer Science',
      school: 'University of California, Berkeley',
      location: 'Berkeley, CA',
      graduationDate: '2018-12',
      gpa: '3.8',
      honors: 'Magna Cum Laude'
    }
  ],
  skills: [
    { id: '1', name: 'JavaScript', level: 'Expert', category: 'Technical' },
    { id: '2', name: 'TypeScript', level: 'Expert', category: 'Technical' },
    { id: '3', name: 'React', level: 'Expert', category: 'Technical' },
    { id: '4', name: 'Node.js', level: 'Advanced', category: 'Technical' },
    { id: '5', name: 'Python', level: 'Advanced', category: 'Technical' },
    { id: '6', name: 'PostgreSQL', level: 'Advanced', category: 'Technical' },
    { id: '7', name: 'AWS', level: 'Intermediate', category: 'Technical' },
    { id: '8', name: 'Docker', level: 'Intermediate', category: 'Technical' },
    { id: '9', name: 'Leadership', level: 'Advanced', category: 'Soft' },
    { id: '10', name: 'Problem Solving', level: 'Expert', category: 'Soft' },
    { id: '11', name: 'Communication', level: 'Advanced', category: 'Soft' },
    { id: '12', name: 'Team Collaboration', level: 'Expert', category: 'Soft' }
  ],
  projects: [
    {
      id: '1',
      name: 'E-commerce Platform',
      description: 'Full-stack e-commerce application with payment processing, inventory management, and admin dashboard',
      technologies: ['React', 'Node.js', 'PostgreSQL', 'Stripe API', 'AWS'],
      url: 'https://github.com/sarahjohnson/ecommerce-platform',
      startDate: '2023-01',
      endDate: '2023-04'
    },
    {
      id: '2',
      name: 'Task Management App',
      description: 'Real-time collaborative task management application with drag-and-drop functionality',
      technologies: ['React', 'Socket.io', 'MongoDB', 'Express.js'],
      url: 'https://taskmanager-demo.com',
      startDate: '2022-08',
      endDate: '2022-11'
    }
  ],
  certifications: [
    {
      id: '1',
      name: 'AWS Certified Solutions Architect',
      issuer: 'Amazon Web Services',
      date: '2023-05',
      url: 'https://aws.amazon.com/certification/'
    }
  ],
  languages: [
    { id: '1', name: 'English', proficiency: 'Native' },
    { id: '2', name: 'Spanish', proficiency: 'Conversational' }
  ],
  references: [
    {
      id: '1',
      name: 'Michael Chen',
      title: 'Senior Engineering Manager',
      company: 'TechCorp Solutions',
      email: 'michael.chen@techcorp.com',
      phone: '+1 (555) 234-5678',
      relationship: 'Direct Supervisor'
    },
    {
      id: '2',
      name: 'Lisa Rodriguez',
      title: 'Lead Product Manager',
      company: 'StartupXYZ',
      email: 'lisa.rodriguez@startupxyz.com',
      phone: '+1 (555) 345-6789',
      relationship: 'Colleague'
    }
  ],
  keywords: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'AWS', 'Leadership', 'Agile']
});
