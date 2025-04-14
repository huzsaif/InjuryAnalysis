import OpenAI from 'openai';

// Clean the API key to handle any line breaks or whitespace
const cleanApiKey = (key: string | undefined): string => {
  if (!key) return '';
  // Replace newlines, spaces, tabs with empty string
  return key.replace(/[\n\r\s\t]+/g, '');
};

const apiKey = cleanApiKey(import.meta.env.VITE_OPENAI_API_KEY);

const openai = new OpenAI({
  apiKey,
  dangerouslyAllowBrowser: true, // Note: In production, calls should be made through a backend
  timeout: 30000, // 30 second timeout to avoid hanging requests
});

console.log('OpenAI API key length:', apiKey.length);

export interface InjuryDetails {
  bodyPart: string;
  cause: string;
  date: Date;
  sport: string;
  symptoms: string[];
}

export const analyzeInjury = async (injuryDetails: InjuryDetails) => {
  try {
    console.log('Starting analyzeInjury with data:', JSON.stringify(injuryDetails, null, 2));
    
    // Validation check
    if (!apiKey || apiKey.length < 5) {
      console.error('Invalid OpenAI API key');
      throw new Error('API configuration error. Please contact support.');
    }
    
    console.log('OpenAI API Key length:', openai.apiKey?.length || 'Not set');
    
    // Ensure date is properly formatted
    const formattedDate = injuryDetails.date instanceof Date 
      ? injuryDetails.date.toLocaleDateString() 
      : 'Unknown date';
    
    // Ensure symptoms are properly joined and validate
    if (!Array.isArray(injuryDetails.symptoms) || injuryDetails.symptoms.length === 0) {
      throw new Error('Please provide at least one symptom');
    }
    
    const symptomsString = injuryDetails.symptoms.join(", ");
    
    // Validate other required fields
    if (!injuryDetails.bodyPart) {
      throw new Error('Please select at least one body part');
    }
    
    if (!injuryDetails.cause) {
      throw new Error('Please describe how the injury occurred');
    }
    
    if (!injuryDetails.sport) {
      throw new Error('Please select a sport or activity');
    }
    
    console.log('Creating OpenAI request...');
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are RecovrAI, a specialized assistant for sports injury recovery. Provide helpful information about possible injuries and recovery plans, but always remind users to seek professional medical advice for proper diagnosis and treatment."
          },
          {
            role: "user",
            content: `Analyze this injury:
              Body Part: ${injuryDetails.bodyPart}
              Cause: ${injuryDetails.cause}
              Date: ${formattedDate}
              Sport: ${injuryDetails.sport}
              Symptoms: ${symptomsString}
              
              Please provide:
              1. Possible injuries (not as diagnosis)
              2. Initial recovery recommendations
              3. Warning signs that would require immediate medical attention`
          }
        ],
        temperature: 0.7,
      }, { signal: controller.signal });
      
      clearTimeout(timeoutId);
      
      console.log('Received response from OpenAI:', response.choices.length > 0 ? 'Success' : 'No choices returned');
      
      const content = response.choices[0].message.content;
      if (!content) {
        console.error('OpenAI returned empty content');
        throw new Error('Failed to generate analysis. Please try again.');
      }
      
      return content;
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error?.name === 'AbortError') {
        throw new Error('Analysis request timed out. Please try again later.');
      }
      throw error;
    }
  } catch (error: any) {
    console.error('Error in analyzeInjury:', error);
    
    // Provide more specific error messages based on common issues
    if (error?.status === 401 || error?.status === 403) {
      throw new Error('Authentication error. Please check your API configuration.');
    } else if (error?.status === 429) {
      throw new Error('Too many requests. Please try again later.');
    } else if (error?.status === 500) {
      throw new Error('OpenAI service error. Please try again later.');
    } else if (error?.code === 'ECONNABORTED' || error?.code === 'ETIMEDOUT' || 
               (typeof error?.message === 'string' && error.message.includes('timeout'))) {
      throw new Error('Request timed out. Please check your network connection and try again.');
    }
    
    // If it's already an Error object with a message, pass it through
    throw error;
  }
};

export const generateRecoveryPlan = async (
  injuryDetails: any,
  additionalInfo: string
) => {
  try {
    // Create a clean version of the injury details with properly formatted date
    const formattedInjuryDetails = {
      bodyPart: injuryDetails.bodyPart,
      cause: injuryDetails.cause,
      date: injuryDetails.date instanceof Date 
        ? injuryDetails.date.toLocaleDateString() 
        : 'Unknown date',
      sport: injuryDetails.sport,
      symptoms: Array.isArray(injuryDetails.symptoms) ? injuryDetails.symptoms : [],
      severity: injuryDetails.severity || 'Not specified',
      status: injuryDetails.status || 'active'
    };

    console.log('Sending injury details to OpenAI:', JSON.stringify(formattedInjuryDetails, null, 2));
    
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are RecovrAI, a specialized assistant for sports injury recovery. Create personalized recovery plans while emphasizing the importance of professional medical guidance."
        },
        {
          role: "user",
          content: `Create a recovery plan for:
            Body Part: ${formattedInjuryDetails.bodyPart}
            Cause: ${formattedInjuryDetails.cause}
            Date of Injury: ${formattedInjuryDetails.date}
            Sport: ${formattedInjuryDetails.sport}
            Symptoms: ${Array.isArray(formattedInjuryDetails.symptoms) ? formattedInjuryDetails.symptoms.join(", ") : 'Not specified'}
            Status: ${formattedInjuryDetails.status}
            
            Additional Information: 
            ${additionalInfo}
            
            Include:
            1. Daily exercises and stretches
            2. Recovery timeline expectations
            3. Milestones to track
            4. Prevention tips for future
            5. Importance of sleep and rest`
        }
      ],
      temperature: 0.7,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error generating recovery plan:', error);
    throw new Error('Failed to generate recovery plan. Please try again later.');
  }
};

export const analyzeProgress = async (
  originalInjury: InjuryDetails,
  progressData: {
    painLevels: number[];
    dates: string[];
    notes: string[];
  }
) => {
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: "You are RecovrAI, a recovery progress analyst. Analyze recovery trends and provide recommendations based on the user's data."
      },
      {
        role: "user",
        content: `Analyze this recovery progress:
          Original Injury: 
          - Body Part: ${originalInjury.bodyPart}
          - Cause: ${originalInjury.cause}
          - Date: ${originalInjury.date instanceof Date ? originalInjury.date.toLocaleDateString() : 'Unknown date'}
          - Sport: ${originalInjury.sport}
          - Symptoms: ${originalInjury.symptoms.join(", ")}
          
          Pain Levels: ${progressData.painLevels.join(", ")}
          Dates: ${progressData.dates.join(", ")}
          Notes: ${progressData.notes.join(", ")}
          
          Please provide:
          1. Analysis of recovery trajectory
          2. Recommendations for adjustment if needed
          3. Warning signs to watch for
          4. Suggested next steps`
      }
    ],
    temperature: 0.7,
  });

  return response.choices[0].message.content;
};
