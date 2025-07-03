
export const parseAIResponse = (data: any): any => {
  try {
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!content) {
      console.error('No content in Gemini response:', JSON.stringify(data, null, 2));
      throw new Error('No content in Gemini response');
    }
    
    console.log('Raw AI content:', content.substring(0, 500));
    
    let parsedContent;
    try {
      parsedContent = JSON.parse(content);
    } catch (parseError) {
      // If JSON parsing fails, treat as plain text response
      console.log('Content is not JSON, treating as text:', content.substring(0, 200));
      return {
        suggestions: {
          summary: content,
          bullets: [],
          skills: {
            technical: [],
            soft: [],
            other: []
          },
          keywords: [],
          ats_score: null,
          recommendations: []
        },
        content: content,
        extractedData: null,
        confidence: 0.8,
        template_optimized: true
      };
    }
    
    // Check if the response is already in the expected format
    if (parsedContent.suggestions && parsedContent.suggestions.summary) {
      console.log('Found properly formatted response with summary:', parsedContent.suggestions.summary.substring(0, 100));
      return parsedContent;
    }
    
    // Handle chat message responses - check for common response patterns
    if (parsedContent.cv || parsedContent.resume) {
      // This is a CV/Resume comparison response
      const cvInfo = parsedContent.cv || '';
      const resumeInfo = parsedContent.resume || '';
      const combinedResponse = cvInfo && resumeInfo 
        ? `**CV (Curriculum Vitae):** ${cvInfo}\n\n**Resume:** ${resumeInfo}`
        : cvInfo || resumeInfo;
      
      return {
        suggestions: {
          summary: combinedResponse,
          bullets: [],
          skills: {
            technical: [],
            soft: [],
            other: []
          },
          keywords: [],
          ats_score: null,
          recommendations: []
        },
        content: combinedResponse,
        extractedData: null,
        confidence: 0.9,
        template_optimized: true
      };
    }
    
    // Handle direct text responses
    if (typeof parsedContent === 'string') {
      return {
        suggestions: {
          summary: parsedContent,
          bullets: [],
          skills: {
            technical: [],
            soft: [],
            other: []
          },
          keywords: [],
          ats_score: null,
          recommendations: []
        },
        content: parsedContent,
        extractedData: null,
        confidence: 0.9,
        template_optimized: true
      };
    }
    
    // Handle other response types
    if (parsedContent.advice) {
      return {
        suggestions: {
          summary: parsedContent.advice,
          bullets: [],
          skills: {
            technical: [],
            soft: [],
            other: []
          },
          keywords: [],
          ats_score: null,
          recommendations: []
        },
        content: parsedContent.advice,
        extractedData: null,
        confidence: 0.9,
        template_optimized: true
      };
    }
    
    if (parsedContent.resume_advice) {
      return {
        suggestions: {
          summary: parsedContent.resume_advice,
          bullets: [],
          skills: {
            technical: [],
            soft: [],
            other: []
          },
          keywords: [],
          ats_score: null,
          recommendations: []
        },
        content: parsedContent.resume_advice,
        extractedData: null,
        confidence: 0.9,
        template_optimized: true
      };
    }
    
    if (parsedContent.resume_feedback) {
      const feedback = parsedContent.resume_feedback;
      return {
        suggestions: {
          summary: feedback.summary || feedback.advice || feedback.feedback || JSON.stringify(feedback),
          bullets: feedback.bullets || [],
          skills: feedback.skills || {
            technical: [],
            soft: [],
            other: []
          },
          keywords: feedback.keywords || [],
          ats_score: feedback.ats_score || null,
          recommendations: feedback.recommendations || []
        },
        extractedData: null,
        confidence: 0.9,
        template_optimized: true
      };
    }
    
    if (parsedContent.coverLetter || parsedContent.cover_letter) {
      const coverLetter = parsedContent.coverLetter || parsedContent.cover_letter;
      return {
        suggestions: {
          summary: typeof coverLetter === 'string' ? coverLetter : JSON.stringify(coverLetter),
          bullets: [],
          skills: {
            technical: [],
            soft: [],
            other: []
          },
          keywords: [],
          ats_score: null,
          recommendations: []
        },
        coverLetter: coverLetter,
        cover_letter: coverLetter,
        extractedData: null,
        confidence: 0.9,
        template_optimized: true
      };
    }
    
    // Fallback: try to extract any meaningful text from the response
    const meaningfulText = parsedContent.answer || parsedContent.response || parsedContent.text || parsedContent.message;
    if (meaningfulText) {
      return {
        suggestions: {
          summary: meaningfulText,
          bullets: [],
          skills: {
            technical: [],
            soft: [],
            other: []
          },
          keywords: [],
          ats_score: null,
          recommendations: []
        },
        content: meaningfulText,
        extractedData: null,
        confidence: 0.8,
        template_optimized: true
      };
    }
    
    // If no specific pattern matches, return the entire parsed content as a string
    return {
      suggestions: {
        summary: JSON.stringify(parsedContent),
        bullets: [],
        skills: {
          technical: [],
          soft: [],
          other: []
        },
        keywords: [],
        ats_score: null,
        recommendations: []
      },
      content: JSON.stringify(parsedContent),
      extractedData: null,
      confidence: 0.7,
      template_optimized: true
    };
    
  } catch (parseError) {
    console.error('Error parsing AI response:', parseError);
    throw parseError;
  }
};

export const createFallbackResponse = (): any => {
  return {
    suggestions: {
      summary: "I'm here to help you with your resume and career questions. Could you please provide more specific details about what you'd like assistance with?",
      bullets: [
        "• Developed and implemented strategic initiatives that improved operational efficiency",
        "• Collaborated with cross-functional teams to deliver projects on time and within budget",
        "• Demonstrated strong problem-solving skills in fast-paced environments"
      ],
      skills: { 
        technical: ["JavaScript", "React", "Node.js"], 
        soft: ["Communication", "Leadership", "Problem Solving"], 
        other: ["Project Management", "Strategic Planning"] 
      },
      keywords: ["Professional", "Leadership", "Strategic", "Results-driven"],
      ats_score: null,
      recommendations: ["Add quantified achievements to demonstrate impact and value."]
    },
    extractedData: null,
    confidence: 0.5,
    template_optimized: false
  };
};
