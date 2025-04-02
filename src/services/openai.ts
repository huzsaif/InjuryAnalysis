import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Note: In production, calls should be made through a backend
});

export interface InjuryDetails {
  bodyPart: string;
  cause: string;
  date: Date;
  sport: string;
  symptoms: string[];
}

export const analyzeInjury = async (injuryDetails: InjuryDetails) => {
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: "You are a sports injury analysis assistant. Provide helpful information about possible injuries and recovery plans, but always remind users to seek professional medical advice for proper diagnosis and treatment."
      },
      {
        role: "user",
        content: `Analyze this injury:
          Body Part: ${injuryDetails.bodyPart}
          Cause: ${injuryDetails.cause}
          Date: ${injuryDetails.date}
          Sport: ${injuryDetails.sport}
          Symptoms: ${injuryDetails.symptoms.join(", ")}
          
          Please provide:
          1. Possible injuries (not as diagnosis)
          2. Follow-up questions to better understand the situation
          3. Initial recovery recommendations
          4. Warning signs that would require immediate medical attention`
      }
    ],
    temperature: 0.7,
  });

  return response.choices[0].message.content;
};

export const generateRecoveryPlan = async (
  injuryDetails: InjuryDetails,
  additionalInfo: string
) => {
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: "You are a sports injury recovery specialist. Create personalized recovery plans while emphasizing the importance of professional medical guidance."
      },
      {
        role: "user",
        content: `Create a recovery plan for:
          ${JSON.stringify(injuryDetails)}
          Additional Information: ${additionalInfo}
          
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
        content: "You are a recovery progress analyst. Analyze recovery trends and provide recommendations."
      },
      {
        role: "user",
        content: `Analyze this recovery progress:
          Original Injury: ${JSON.stringify(originalInjury)}
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
