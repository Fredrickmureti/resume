export const buildPromptForType = (type: string, prompt: string, context?: any): string => {
  if (type === 'chat_message') {
    return `You are a helpful AI Resume Assistant. Answer the user's question about resumes, CVs, career advice, or job searching.

User Question: ${prompt}

Context: The user is asking for help with their resume or career. Provide a helpful, informative response that directly answers their question.

IMPORTANT: Respond with plain text that directly answers the user's question. Do not use JSON format for chat messages. Be conversational and helpful.

If the question is about the difference between CV and Resume, explain:
- CV (Curriculum Vitae): A comprehensive document that includes all your academic and professional history, publications, research, etc. Used mainly in academia and research. Can be multiple pages.
- Resume: A concise 1-2 page document focused on relevant work experience and skills for a specific job. Used for most job applications.

Provide a clear, direct answer to: ${prompt}`;
  }

  if (type === 'job_tailored_cv_analysis') {
    const jobDescription = context?.jobContext?.jobDescription || context?.jobContext?.extractedJobContent || '';
    const jobTitle = context?.jobContext?.jobTitle || '';
    const jobType = context?.jobContext?.jobType || '';
    const targetCompany = context?.jobContext?.targetCompany || '';

    return `JOB-TAILORED CV OPTIMIZATION AND ANALYSIS

You are an expert CV optimization specialist. Analyze this CV and tailor it specifically to match the provided job requirements.

CV CONTENT TO ANALYZE:
${context?.cvContent || prompt}

JOB REQUIREMENTS:
Job Description: ${jobDescription}
Job Title: ${jobTitle}
Job Type/Industry: ${jobType}
Target Company: ${targetCompany}

CRITICAL INSTRUCTIONS:
1. Extract ALL information from the CV exactly as written
2. Analyze job requirements and identify key skills, keywords, and qualifications
3. Calculate a job match percentage based on current CV alignment
4. Optimize the CV content specifically for this job while maintaining truthfulness
5. Enhance experience descriptions with job-relevant keywords and achievements
6. Suggest missing skills and keywords that would improve job match
7. Provide ATS optimization specifically for this job posting

OPTIMIZATION REQUIREMENTS:

MATCH ANALYSIS:
- Calculate percentage match between current CV and job requirements
- Identify strengths that align with job requirements
- Identify gaps and missing elements

PROFESSIONAL SUMMARY OPTIMIZATION:
- Rewrite professional summary to match job requirements
- Include relevant keywords from job description
- Highlight experience most relevant to target role
- Keep truthful but optimize for job alignment

EXPERIENCE OPTIMIZATION:
- Enhance bullet points with job-specific keywords
- Quantify achievements where possible
- Prioritize experiences most relevant to target job
- Add technical keywords that match job requirements

SKILLS OPTIMIZATION:
- Identify missing skills mentioned in job description
- Recommend skills to add based on job requirements
- Categorize skills by relevance to target job

KEYWORD OPTIMIZATION:
- Extract important keywords from job description
- Identify which keywords are missing from current CV
- Provide keyword recommendations for better ATS performance

ATS OPTIMIZATION:
- Suggest formatting improvements for ATS compatibility
- Recommend section restructuring if needed
- Provide tips for better keyword density

RESPONSE FORMAT (JSON):
{
  "suggestions": {
    "optimizedSummary": "Job-tailored professional summary with relevant keywords and focus areas",
    "matchScore": 75,
    "missingKeywords": ["keyword1", "keyword2", "keyword3"],
    "recommendedSkills": ["skill1", "skill2", "skill3"],
    "recommendedKeywords": ["ats-keyword1", "ats-keyword2"],
    "atsOptimizations": [
      "Specific ATS optimization recommendation 1",
      "Specific ATS optimization recommendation 2"
    ]
  },
  "extractedData": {
    "personalInfo": {
      "fullName": "EXACT name from CV",
      "email": "exact.email@found.com",
      "phone": "exact phone number found",
      "location": "exact location from CV",
      "linkedIn": "exact LinkedIn URL if found",
      "website": "exact website URL if found"
    },
    "summary": "Original summary from CV",
    "experience": [
      {
        "jobTitle": "EXACT job title from CV",
        "company": "EXACT company name from CV",
        "location": "Job location from CV",
        "startDate": "MM/YYYY format",
        "endDate": "MM/YYYY or Present",
        "current": false,
        "description": [
          "EXACT original bullet point 1 from CV",
          "EXACT original bullet point 2 from CV"
        ],
        "optimizedDescription": [
          "Job-tailored enhanced bullet point 1 with relevant keywords",
          "Job-tailored enhanced bullet point 2 with quantified achievements"
        ]
      }
    ],
    "education": [
      {
        "degree": "EXACT degree name from CV",
        "school": "EXACT institution name from CV",
        "location": "School location if mentioned",
        "graduationDate": "MM/YYYY",
        "gpa": "GPA if mentioned",
        "honors": "Honors if mentioned"
      }
    ],
    "skills": [
      {
        "name": "EXACT skill name from CV",
        "level": "skill level from CV or estimated",
        "category": "Technical/Soft/Other"
      }
    ],
    "projects": [
      {
        "name": "EXACT project name from CV",
        "description": "EXACT project description from CV",
        "technologies": ["Tech 1", "Tech 2"],
        "url": "project URL if provided",
        "startDate": "MM/YYYY",
        "endDate": "MM/YYYY"
      }
    ],
    "certifications": [
      {
        "name": "EXACT certification name from CV",
        "issuer": "EXACT issuing organization from CV",
        "date": "MM/YYYY",
        "url": "certification URL if provided"
      }
    ],
    "languages": [
      {
        "name": "EXACT language name from CV",
        "proficiency": "EXACT proficiency level from CV"
      }
    ]
  },
  "confidence": 0.95
}

IMPORTANT:
- Only extract information that actually exists in the CV
- Optimize content while maintaining truthfulness
- Focus on job-specific improvements
- Provide actionable, specific recommendations
- Calculate realistic match percentage based on actual alignment`;
  }

  if (type === 'comprehensive_cv_extraction') {
    return `COMPREHENSIVE CV ANALYSIS AND EXTRACTION

You are an expert CV/Resume analyzer. Analyze this COMPLETE CV/Resume content and extract EVERY piece of information with high accuracy.

CV CONTENT TO ANALYZE:
${context?.cvContent || prompt}

CRITICAL INSTRUCTIONS:
1. Read through EVERY single line and section of the CV content above
2. Extract ALL information - do not miss any details
3. Map extracted data intelligently to the response format
4. DO NOT use placeholder data - only use what's actually in the CV
5. If information is missing, leave fields empty rather than making up data
6. Focus on accuracy over completeness

EXTRACTION REQUIREMENTS:

PERSONAL INFORMATION:
- Extract exact full name from CV header/title
- Find email address (look for @ symbol)
- Extract phone number (any format)
- Location/address information
- LinkedIn profile URL
- Website/portfolio URL

PROFESSIONAL SUMMARY:
- Extract existing summary if present
- If no summary exists, create one based on experience and skills found
- Keep it concise and professional (2-3 sentences)

WORK EXPERIENCE:
- Extract ALL job positions with complete details
- Job titles exactly as written
- Company names exactly as written  
- Employment dates (start and end)
- Job locations
- ALL bullet points and responsibilities
- Look for quantified achievements

EDUCATION:
- All degrees, diplomas, certifications
- Institution names exactly as written
- Graduation dates
- GPAs if mentioned
- Honors or distinctions

SKILLS:
- Technical skills (programming, software, tools)
- Soft skills (leadership, communication, etc.)
- Industry-specific skills
- Categorize appropriately

PROJECTS (if mentioned):
- Project names and descriptions
- Technologies used
- URLs if provided
- Project dates

CERTIFICATIONS:
- Certification names exactly as written
- Issuing organizations
- Dates obtained
- Certification URLs/IDs if provided

LANGUAGES:
- Language names
- Proficiency levels if mentioned

RESPONSE FORMAT (JSON):
{
  "suggestions": {
    "summary": "Professional summary based on CV content or extracted existing summary",
    "bullets": [
      "Enhanced bullet point 1 from experience section",
      "Enhanced bullet point 2 from experience section", 
      "Enhanced bullet point 3 from experience section"
    ],
    "skills": {
      "technical": ["Technical skill 1", "Technical skill 2", "Technical skill 3"],
      "soft": ["Soft skill 1", "Soft skill 2", "Soft skill 3"],
      "other": ["Other skill 1", "Other skill 2"]
    },
    "keywords": ["Keyword 1", "Keyword 2", "Keyword 3"],
    "ats_score": 85,
    "recommendations": [
      "Specific recommendation based on CV analysis",
      "Another actionable recommendation"
    ]
  },
  "extractedData": {
    "personalInfo": {
      "fullName": "EXACT name from CV",
      "email": "exact.email@found.com",
      "phone": "exact phone number found",
      "location": "exact location from CV",
      "linkedIn": "exact LinkedIn URL if found",
      "website": "exact website URL if found"
    },
    "experience": [
      {
        "jobTitle": "EXACT job title from CV",
        "company": "EXACT company name from CV",
        "location": "Job location from CV",
        "startDate": "MM/YYYY format",
        "endDate": "MM/YYYY or Present",
        "current": false,
        "description": [
          "EXACT bullet point 1 from CV",
          "EXACT bullet point 2 from CV",
          "EXACT bullet point 3 from CV"
        ]
      }
    ],
    "education": [
      {
        "degree": "EXACT degree name from CV",
        "school": "EXACT institution name from CV",
        "location": "School location if mentioned",
        "graduationDate": "MM/YYYY",
        "gpa": "GPA if mentioned",
        "honors": "Honors if mentioned"
      }
    ],
    "projects": [
      {
        "name": "EXACT project name from CV",
        "description": "EXACT project description from CV",
        "technologies": ["Tech 1", "Tech 2"],
        "url": "project URL if provided",
        "startDate": "MM/YYYY",
        "endDate": "MM/YYYY"
      }
    ],
    "certifications": [
      {
        "name": "EXACT certification name from CV",
        "issuer": "EXACT issuing organization from CV",
        "date": "MM/YYYY",
        "url": "certification URL if provided"
      }
    ],
    "languages": [
      {
        "name": "EXACT language name from CV",
        "proficiency": "EXACT proficiency level from CV or 'Conversational'"
      }
    ]
  },
  "confidence": 0.95,
  "template_optimized": true
}

REMEMBER: Only extract information that actually exists in the CV content. Do not fabricate or assume any information.`;
  }

  if (type === 'professional_summary') {
    return `Generate a professional summary for a ${context?.jobTitle || 'professional'} with ${context?.experienceLevel || '5 years'} experience in ${context?.industry || 'Technology'}.
    
Requirements:
- 2-3 compelling sentences
- 50-150 words
- Include relevant keywords for ${context?.industry || 'Technology'}
- ATS-optimized
- No first-person pronouns
- Professional and impactful

Respond with a JSON object in this exact format:
{
  "suggestions": {
    "summary": "Your generated professional summary here",
    "bullets": [],
    "skills": {
      "technical": [],
      "soft": [],
      "other": []
    },
    "keywords": [],
    "ats_score": null,
    "recommendations": []
  },
  "confidence": 0.9,
  "template_optimized": true
}`;
  }

  if (type === 'content_suggestions') {
    return `Generate content suggestions for a ${context?.jobTitle || 'professional'} role.

Create a JSON response with this exact structure:
{
  "suggestions": {
    "summary": "A professional summary for this role",
    "bullets": ["bullet point 1", "bullet point 2", "bullet point 3"],
    "skills": {
      "technical": ["skill1", "skill2", "skill3"],
      "soft": ["skill1", "skill2", "skill3"],
      "other": ["skill1", "skill2"]
    },
    "keywords": ["keyword1", "keyword2", "keyword3"],
    "ats_score": null,
    "recommendations": ["recommendation 1", "recommendation 2"]
  },
  "confidence": 0.9,
  "template_optimized": true
}

Focus on: ${prompt}`;
  }

  if (type === 'skills_gap_analysis') {
    const resumeData = context?.resumeData;
    const jobDescription = context?.jobDescription;

    return `COMPREHENSIVE SKILLS GAP ANALYSIS

You are an expert career analyst. Perform a detailed skills gap analysis between this candidate's resume and the target job description.

CANDIDATE'S RESUME DATA:
${JSON.stringify(resumeData)}

TARGET JOB DESCRIPTION:
${jobDescription}

ANALYSIS REQUIREMENTS:

1. SKILLS MATCHING ANALYSIS:
   - Calculate overall match percentage (0-100%)
   - Identify exact skill matches between resume and job description
   - Categorize missing skills by importance level (high/medium/low)
   - Analyze both technical and soft skills gaps

2. MISSING SKILLS IDENTIFICATION:
   - Technical skills required but not present in resume
   - Soft skills mentioned in job description but not demonstrated
   - Certifications or qualifications that are missing
   - Experience gaps in specific areas

3. STRENGTH AREAS:
   - Skills where candidate exceeds requirements
   - Relevant experience that aligns well
   - Educational background advantages
   - Unique value propositions

4. LEARNING RECOMMENDATIONS:
   - Immediate actions (1-2 weeks): Quick wins and resume updates
   - Short-term goals (1-3 months): Courses, certifications, projects
   - Long-term development (3-6 months): Advanced skills, specializations

5. ACTIONABLE ADVICE:
   - Specific recommendations for skill development
   - Learning resource suggestions
   - Portfolio or project ideas
   - Interview preparation tips

RESPONSE FORMAT (JSON):
{
  "suggestions": {
    "summary": "Brief overview of skills gap analysis",
    "bullets": ["Key strength areas", "Major advantages", "Competitive edges"],
    "skills": {
      "technical": ["Missing technical skill 1", "Missing technical skill 2"],
      "soft": ["Missing soft skill 1", "Missing soft skill 2"],
      "other": ["Certification gaps", "Experience gaps"]
    },
    "keywords": [
      "Immediate action 1", "Immediate action 2", "Immediate action 3",
      "Short-term goal 1", "Short-term goal 2", "Short-term goal 3",
      "Long-term goal 1", "Long-term goal 2", "Long-term goal 3"
    ],
    "ats_score": 75,
    "recommendations": [
      "Specific recommendation 1 for skill development",
      "Specific recommendation 2 for experience building",
      "Specific recommendation 3 for portfolio enhancement",
      "Specific recommendation 4 for certification pursuit"
    ]
  },
  "confidence": 0.9,
  "template_optimized": true
}

IMPORTANT:
- Be specific and actionable in recommendations
- Prioritize skills by their importance to the role
- Provide realistic timelines for skill development
- Focus on practical learning approaches
- Consider the candidate's current level and background`;
  }

  return prompt;
};
