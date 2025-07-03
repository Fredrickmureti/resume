
export interface ContentSuggestion {
  type: 'bullet' | 'skill' | 'summary' | 'achievement';
  content: string;
  category?: string;
}

export const getJobTitleSuggestions = (jobTitle: string): ContentSuggestion[] => {
  const suggestions: Record<string, ContentSuggestion[]> = {
    'software engineer': [
      { type: 'bullet', content: 'Developed and maintained scalable web applications using React, Node.js, and PostgreSQL' },
      { type: 'bullet', content: 'Collaborated with cross-functional teams to deliver features that improved user experience by 40%' },
      { type: 'bullet', content: 'Implemented automated testing strategies that reduced bug reports by 60%' },
      { type: 'skill', content: 'JavaScript', category: 'Technical' },
      { type: 'skill', content: 'React', category: 'Technical' },
      { type: 'skill', content: 'Node.js', category: 'Technical' },
      { type: 'summary', content: 'Passionate software engineer with expertise in full-stack development and agile methodologies. Proven track record of building scalable applications and leading technical initiatives.' }
    ],
    'product manager': [
      { type: 'bullet', content: 'Led product strategy and roadmap development for B2B SaaS platform serving 50,000+ users' },
      { type: 'bullet', content: 'Coordinated with engineering, design, and marketing teams to launch 5 major features on schedule' },
      { type: 'bullet', content: 'Analyzed user feedback and market research to prioritize product features, increasing user retention by 25%' },
      { type: 'skill', content: 'Product Strategy', category: 'Other' },
      { type: 'skill', content: 'Agile/Scrum', category: 'Other' },
      { type: 'skill', content: 'Data Analysis', category: 'Technical' },
      { type: 'summary', content: 'Strategic product manager with experience driving product vision and execution. Expert in user research, data analysis, and cross-functional team leadership.' }
    ],
    'data scientist': [
      { type: 'bullet', content: 'Built machine learning models that improved customer segmentation accuracy by 35%' },
      { type: 'bullet', content: 'Developed predictive analytics solutions using Python, TensorFlow, and AWS' },
      { type: 'bullet', content: 'Presented data insights to executive team, influencing strategic business decisions' },
      { type: 'skill', content: 'Python', category: 'Technical' },
      { type: 'skill', content: 'Machine Learning', category: 'Technical' },
      { type: 'skill', content: 'SQL', category: 'Technical' },
      { type: 'summary', content: 'Data scientist with expertise in machine learning, statistical analysis, and predictive modeling. Proven ability to transform complex data into actionable business insights.' }
    ]
  };

  const key = jobTitle.toLowerCase();
  return suggestions[key] || [];
};

export const getAchievementSuggestions = (description: string): string[] => {
  const patterns = [
    'Increased [metric] by [X]%',
    'Reduced [process] time by [X] hours/days',
    'Generated $[X] in revenue/savings',
    'Managed team of [X] people',
    'Served [X] customers/users',
    'Processed [X] transactions/requests',
    'Improved [metric] from [X] to [Y]',
    'Led [X] projects/initiatives'
  ];

  return patterns.map(pattern => 
    pattern.replace('[metric]', 'efficiency')
           .replace('[process]', 'development')
           .replace('[X]', '25')
           .replace('[Y]', '40')
  );
};

export const getKeywordSuggestions = (industry: string): string[] => {
  const keywords: Record<string, string[]> = {
    'technology': [
      'Agile', 'Scrum', 'DevOps', 'CI/CD', 'Cloud Computing', 'API Development',
      'Microservices', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'Git'
    ],
    'marketing': [
      'Digital Marketing', 'SEO/SEM', 'Content Strategy', 'Social Media Marketing',
      'Email Marketing', 'Marketing Automation', 'Analytics', 'Brand Management'
    ],
    'finance': [
      'Financial Analysis', 'Risk Management', 'Financial Modeling', 'Budgeting',
      'Forecasting', 'Excel', 'SQL', 'Regulatory Compliance', 'Investment Analysis'
    ],
    'healthcare': [
      'Patient Care', 'Medical Records', 'Healthcare Compliance', 'HIPAA',
      'Electronic Health Records', 'Clinical Research', 'Quality Improvement'
    ]
  };

  return keywords[industry.toLowerCase()] || [];
};

export const analyzeKeywordDensity = (resumeText: string, targetKeywords: string[]): Record<string, number> => {
  const text = resumeText.toLowerCase();
  const density: Record<string, number> = {};

  targetKeywords.forEach(keyword => {
    const regex = new RegExp(keyword.toLowerCase(), 'gi');
    const matches = text.match(regex) || [];
    density[keyword] = matches.length;
  });

  return density;
};
