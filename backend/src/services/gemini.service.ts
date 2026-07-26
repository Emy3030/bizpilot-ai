import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env';

let client: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI | null {
  if (!env.geminiApiKey) return null;
  if (!client) client = new GoogleGenerativeAI(env.geminiApiKey);
  return client;
}

export const geminiService = {
  isConfigured(): boolean {
    return !!env.geminiApiKey;
  },

  async generate(systemPrompt: string, userMessage: string): Promise<string> {
    const genAI = getClient();

    if (!genAI) {
      return "The AI Assistant isn't fully set up yet — a Gemini API key needs to be added to the server's environment before I can respond. Once that's in place, I'll be able to answer questions about your business in real time.";
    }

        try {
      const model = genAI.getGenerativeModel({
        /* Target Google's modern stable engine version */
        model: 'gemini-3.5-flash',
        systemInstruction: systemPrompt,
      });

      const result = await model.generateContent(userMessage);
      const text = result.response.text().trim();

      return text || "I couldn't generate a response for that. Could you try rephrasing your question?";
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[Gemini] generation failed:', error);
      return "I ran into an issue reaching the AI service just now. Please try again in a moment.";
    }
  },
};
