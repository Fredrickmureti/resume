import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const geminiApiKey = Deno.env.get('GEMINI_API_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Inline the Gemini API call function to avoid import issues
const callGeminiAPI = async (prompt: string, apiKey: string): Promise<any> => {
  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: prompt
          }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 4096,
      responseMimeType: 'application/json'
    }
  };

  console.log('Making request to Gemini API...');

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  console.log('Gemini API response status:', response.status);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API_ERROR:${response.status}:${errorText}`);
  }

  return await response.json();
};

// Inline the prompt building function
const buildPromptForType = (type: string, prompt: string, context?: any): string => {
  if (type === 'cover_letter_generation') {
    return `Generate a professional cover letter based on the provided information:
    
    ${prompt}
    
    Create a compelling, tailored cover letter that highlights relevant experience and skills.
    Format the response as JSON with a "coverLetter" field containing the complete letter.`;
  }

  if (type === 'chat_assistant') {
    return `You are a helpful resume and career advisor. Answer this question:
    
    ${prompt}
    
    Provide helpful, actionable advice. Format your response as JSON with an "advice" field.`;
  }

  if (type === 'resume_optimization') {
    return `Optimize this resume content:
    
    ${prompt}
    
    Provide improved, ATS-friendly content. Format as JSON with "content" and "bullets" fields.`;
  }

  if (type === 'ats_analysis') {
    return `Analyze this resume for ATS compatibility:
    
    ${prompt}
    
    Provide analysis, score, and recommendations. Format as JSON with "analysis", "score", and "recommendations" fields.`;
  }

  return prompt;
};

// Simplified response parser for job processor
const parseJobResponse = (data: any): any => {
  try {
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!content) {
      throw new Error('No content in Gemini response');
    }
    
    console.log('Raw AI content for job:', content.substring(0, 200));
    
    let parsedContent;
    try {
      parsedContent = JSON.parse(content);
    } catch (parseError) {
      // If JSON parsing fails, treat as plain text
      return { content: content };
    }
    
    // Extract cover letter from various possible response formats
    if (parsedContent.coverLetter) {
      return { coverLetter: parsedContent.coverLetter };
    }
    
    if (parsedContent.cover_letter) {
      return { coverLetter: parsedContent.cover_letter };
    }
    
    if (parsedContent.suggestions && parsedContent.suggestions.summary) {
      return { coverLetter: parsedContent.suggestions.summary };
    }
    
    // For chat responses
    if (parsedContent.advice) {
      return { content: parsedContent.advice };
    }
    
    if (parsedContent.content) {
      return { content: parsedContent.content };
    }
    
    // Fallback to raw content
    return { content: content };
    
  } catch (error) {
    console.error('Error parsing job response:', error);
    throw error;
  }
};

async function processJob(job: any) {
  console.log(`Processing job ${job.id} of type ${job.job_type}`);
  
  try {
    // Update job status to processing
    await supabase
      .from('job_queue')
      .update({ 
        status: 'processing',
        updated_at: new Date().toISOString()
      })
      .eq('id', job.id);

    let result;
    const inputData = job.input_data;

    switch (job.job_type) {
      case 'cover_letter_generation':
        result = await processCoverLetterGeneration(inputData);
        break;
      case 'content_optimization':
        result = await processContentOptimization(inputData);
        break;
      case 'resume_generation':
        result = await processResumeGeneration(inputData);
        break;
      case 'ats_analysis':
        result = await processATSAnalysis(inputData);
        break;
      default:
        throw new Error(`Unknown job type: ${job.job_type}`);
    }

    // Cache the result if cache key is provided
    if (inputData.cacheKey && result) {
      await supabase
        .from('app_cache')
        .upsert({
          cache_key: inputData.cacheKey,
          cache_data: result,
          expires_at: new Date(Date.now() + 3600000).toISOString() // 1 hour
        });
    }

    // Update job status to completed
    await supabase
      .from('job_queue')
      .update({
        status: 'completed',
        result_data: result,
        processed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', job.id);

    console.log(`Job ${job.id} completed successfully`);
    return result;

  } catch (error) {
    console.error(`Job ${job.id} failed:`, error);
    
    // Update retry count
    const newRetryCount = job.retry_count + 1;
    
    if (newRetryCount <= job.max_retries) {
      // Retry the job
      await supabase
        .from('job_queue')
        .update({
          status: 'pending',
          retry_count: newRetryCount,
          error_message: error.message,
          updated_at: new Date().toISOString()
        })
        .eq('id', job.id);
      
      console.log(`Job ${job.id} will be retried (attempt ${newRetryCount})`);
    } else {
      // Mark as failed
      await supabase
        .from('job_queue')
        .update({
          status: 'failed',
          error_message: error.message,
          processed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', job.id);
      
      console.log(`Job ${job.id} failed permanently after ${newRetryCount} attempts`);
    }
    
    throw error;
  }
}

async function processCoverLetterGeneration(inputData: any) {
  const { resumeData, jobDescription, tone } = inputData;
  
  const prompt = `Write a professional cover letter for this job application.

APPLICANT INFORMATION:
Name: ${resumeData.personalInfo.fullName || 'Applicant'}
Phone: ${resumeData.personalInfo.phone || ''}
Email: ${resumeData.personalInfo.email || ''}
Location: ${resumeData.personalInfo.location || ''}

PROFESSIONAL SUMMARY:
${resumeData.summary || 'Experienced professional with relevant skills and background.'}

EXPERIENCE:
${resumeData.experience?.map(exp => `${exp.jobTitle} at ${exp.company} (${exp.startDate} - ${exp.endDate || 'Present'})`).join('\n') || 'Relevant work experience'}

EDUCATION:
${resumeData.education?.map(edu => `${edu.degree} from ${edu.school} (${edu.graduationDate})`).join('\n') || 'Educational background'}

SKILLS:
${resumeData.skills?.map(skill => skill.name).join(', ') || 'Professional skills'}

JOB DESCRIPTION:
${jobDescription}

INSTRUCTIONS:
- Write a complete, professional cover letter
- Use a ${tone} tone
- Address the specific requirements mentioned in the job description
- Highlight relevant experience and skills
- Make it compelling and personalized
- Format as a proper business letter
- Do NOT include JSON formatting or technical symbols
- Return ONLY the cover letter text, ready to copy and use

The cover letter should be approximately 3-4 paragraphs and follow this structure:
1. Opening paragraph introducing yourself and the position
2. Body paragraph(s) highlighting relevant experience and skills
3. Closing paragraph expressing interest and next steps`;

  const data = await callGeminiAPI(prompt, geminiApiKey);
  const response = parseJobResponse(data);
  
  // Extract clean cover letter text
  let coverLetterText = response.coverLetter || response.content || '';
  
  // Clean up any JSON artifacts or formatting issues
  coverLetterText = coverLetterText
    .replace(/^["']|["']$/g, '') // Remove quotes at start/end
    .replace(/\\n/g, '\n') // Convert escaped newlines
    .replace(/\\\"/g, '"') // Convert escaped quotes
    .trim();
  
  return {
    coverLetter: coverLetterText,
    content: coverLetterText
  };
}

async function processContentOptimization(inputData: any) {
  const { message, resumeData, conversationContext } = inputData;
  
  const prompt = `You are an expert resume and career advisor AI assistant. Help the user with their resume and career questions.

USER'S RESUME DATA:
Name: ${resumeData.personalInfo.fullName}
Summary: ${resumeData.summary}
Experience: ${JSON.stringify(resumeData.experience)}
Education: ${JSON.stringify(resumeData.education)}
Skills: ${JSON.stringify(resumeData.skills)}

USER QUESTION: ${message}

Provide helpful, actionable advice based on their resume data. Keep responses concise but informative.`;

  const specificPrompt = buildPromptForType('chat_assistant', prompt, inputData);
  const data = await callGeminiAPI(specificPrompt, geminiApiKey);
  const response = parseJobResponse(data);
  
  return {
    content: response.content || response.advice,
    advice: response.advice,
    response: response.content
  };
}

async function processResumeGeneration(inputData: any) {
  const { contentType, inputData: content } = inputData;
  
  const prompt = `Generate optimized resume content of type: ${contentType}
Input data: ${JSON.stringify(content)}
Provide professional, ATS-optimized content.`;

  const specificPrompt = buildPromptForType('resume_optimization', prompt, inputData);
  const data = await callGeminiAPI(specificPrompt, geminiApiKey);
  const response = parseJobResponse(data);
  
  return {
    content: response.content,
    bullets: response.bullets || []
  };
}

async function processATSAnalysis(inputData: any) {
  const { resumeData, jobDescription } = inputData;
  
  const prompt = `Analyze the resume against the job description for ATS compatibility.
Resume: ${JSON.stringify(resumeData)}
Job Description: ${jobDescription}
Provide analysis and recommendations.`;

  const specificPrompt = buildPromptForType('ats_analysis', prompt, inputData);
  const data = await callGeminiAPI(specificPrompt, geminiApiKey);
  const response = parseJobResponse(data);
  
  return {
    analysis: response.analysis || response.content,
    score: response.score || 0,
    recommendations: response.recommendations || []
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Job processor invoked - checking for pending jobs...');
    
    // Get pending jobs
    const { data: jobs, error } = await supabase
      .from('job_queue')
      .select('*')
      .eq('status', 'pending')
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(5);

    if (error) {
      console.error('Error fetching jobs:', error);
      throw error;
    }

    if (!jobs || jobs.length === 0) {
      console.log('No pending jobs found');
      return new Response(JSON.stringify({ message: 'No pending jobs' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Found ${jobs.length} pending jobs to process`);
    
    const results = [];
    for (const job of jobs) {
      try {
        console.log(`Starting to process job ${job.id} of type ${job.job_type}`);
        const result = await processJob(job);
        results.push({ jobId: job.id, status: 'completed', result });
        console.log(`Successfully completed job ${job.id}`);
      } catch (error) {
        console.error(`Failed to process job ${job.id}:`, error);
        results.push({ jobId: job.id, status: 'failed', error: error.message });
      }
    }

    return new Response(JSON.stringify({ 
      processed: results.length,
      results 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Job processor error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
