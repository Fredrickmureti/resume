export const callOpenRouterAPI = async (prompt: string, apiKey: string): Promise<any> => {
  const requestBody = {
    model: 'google/gemini-2.0-flash-exp',
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.7,
    max_tokens: 4096
  };

  console.log('Making request to OpenRouter API...');

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://airesumecraft.lovable.app',
      'X-Title': 'AI Resume Craft',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  console.log('OpenRouter API response status:', response.status);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OPENROUTER_API_ERROR:${response.status}:${errorText}`);
  }

  const data = await response.json();
  
  // Transform OpenRouter response to match Gemini format
  const transformedResponse = {
    candidates: [
      {
        content: {
          parts: [
            {
              text: data.choices[0].message.content
            }
          ]
        }
      }
    ]
  };

  return transformedResponse;
};