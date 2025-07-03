
export const createErrorResponse = (error: Error): any => {
  console.error('Error in AI function:', error);
  
  let errorMessage = "AI service temporarily unavailable. Please try again.";
  let recommendations = ["Service temporarily unavailable. Please try again later."];

  if (error.message.includes('Rate limit') || error.message.includes('RESOURCE_EXHAUSTED')) {
    errorMessage = "AI service rate limit exceeded. Please wait a moment and try again.";
    recommendations = ["Rate limit exceeded. Please wait about 1 minute before trying again."];
  } else if (error.message.includes('exceeded your current quota')) {
    errorMessage = "AI service quota exceeded. Trying OpenRouter backup service...";
    recommendations = ["AI service quota exceeded. The system is attempting to use OpenRouter backup service."];
  } else if (error.message.includes('No AI API keys configured')) {
    errorMessage = "AI service not configured properly.";
    recommendations = ["AI service configuration issue. Please contact support."];
  }
  
  return {
    suggestions: {
      summary: errorMessage,
      bullets: [],
      skills: { technical: [], soft: [], other: [] },
      keywords: [],
      ats_score: null,
      recommendations
    },
    extractedData: null,
    confidence: 0,
    template_optimized: false,
    error: error.message,
    metadata: {
      errorType: 'ai_service_error',
      timestamp: new Date().toISOString()
    }
  };
};

export const handleGeminiAPIError = (response: Response, errorText: string): Error => {
  console.error('API error:', response.status, errorText);
  
  if (response.status === 429) {
    return new Error(`Rate limit exceeded. Please wait a moment and try again.`);
  }
  
  if (errorText.includes('RESOURCE_EXHAUSTED') || errorText.includes('exceeded your current quota')) {
    return new Error(`API quota exceeded. Trying OpenRouter backup service...`);
  }
  
  return new Error(`API error: ${response.status} - ${errorText}`);
};
