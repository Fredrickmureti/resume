
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { buildPromptForType } from './prompts.ts';
import { parseAIResponse, createFallbackResponse } from './response-parser.ts';
import { createErrorResponse, handleGeminiAPIError } from './error-handler.ts';
import { callGeminiAPI } from './gemini-client.ts';
import { callOpenRouterAPI } from './openrouter-client.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, type, context } = await req.json();

    console.log('AI Request:', { type, prompt: prompt?.substring(0, 100), context });

    // Build the specific prompt based on the request type
    const specificPrompt = buildPromptForType(type, prompt, context);

    let aiResponse;
    let usedAPI = 'none';

    // Try Gemini first if available
    if (GEMINI_API_KEY) {
      try {
        console.log('Attempting Gemini API...');
        const data = await callGeminiAPI(specificPrompt, GEMINI_API_KEY);
        aiResponse = parseAIResponse(data);
        usedAPI = 'gemini';
        console.log('Successfully used Gemini API');
      } catch (geminiError) {
        console.error('Gemini API failed:', geminiError.message);
        
        // Check if it's a quota/rate limit error
        if (geminiError.message.includes('RESOURCE_EXHAUSTED') || 
            geminiError.message.includes('exceeded your current quota') ||
            geminiError.message.includes('API_ERROR:429')) {
          console.log('Gemini quota exceeded, trying OpenRouter fallback...');
          
          if (OPENROUTER_API_KEY) {
            try {
              const data = await callOpenRouterAPI(specificPrompt, OPENROUTER_API_KEY);
              aiResponse = parseAIResponse(data);
              usedAPI = 'openrouter';
              console.log('Successfully used OpenRouter API as fallback');
            } catch (openrouterError) {
              console.error('OpenRouter API also failed:', openrouterError.message);
              throw geminiError; // Throw original Gemini error
            }
          } else {
            throw new Error('Gemini quota exceeded and OpenRouter API key not configured');
          }
        } else {
          throw geminiError; // Re-throw non-quota errors
        }
      }
    } else if (OPENROUTER_API_KEY) {
      // Use OpenRouter if Gemini is not available
      try {
        console.log('Using OpenRouter API (Gemini not configured)...');
        const data = await callOpenRouterAPI(specificPrompt, OPENROUTER_API_KEY);
        aiResponse = parseAIResponse(data);
        usedAPI = 'openrouter';
        console.log('Successfully used OpenRouter API');
      } catch (openrouterError) {
        console.error('OpenRouter API failed:', openrouterError.message);
        throw openrouterError;
      }
    } else {
      throw new Error('No AI API keys configured');
    }

    // Add metadata about which API was used
    if (aiResponse) {
      aiResponse.metadata = {
        ...aiResponse.metadata,
        usedAPI,
        timestamp: new Date().toISOString()
      };
    }

    return new Response(JSON.stringify(aiResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('AI Service Error:', error);
    
    // Handle API-specific errors
    if (error.message.startsWith('API_ERROR:') || error.message.startsWith('OPENROUTER_API_ERROR:')) {
      const [, status, errorText] = error.message.split(':');
      const apiError = handleGeminiAPIError({ status: parseInt(status) } as Response, errorText);
      const errorResponse = createErrorResponse(apiError);
      
      return new Response(JSON.stringify(errorResponse), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const errorResponse = createErrorResponse(error);
    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
