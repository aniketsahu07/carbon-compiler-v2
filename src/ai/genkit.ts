import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

// API key .env.local se aata hai — kabhi hardcode mat karo
const googleApiKey = process.env.GOOGLE_GENAI_API_KEY;
if (!googleApiKey) {
  throw new Error('GOOGLE_GENAI_API_KEY missing in .env.local');
}

export const ai = genkit({
  plugins: [googleAI({ apiKey: googleApiKey })],
  model: 'googleai/gemini-2.0-flash-lite',
});

// Pipeline mein use hone wale model names (env se ya default)
export const MEDIATOR_MODEL = (process.env.MEDIATOR_MODEL || 'googleai/gemini-2.0-flash-lite') as string;
export const MAIN_MODEL     = (process.env.MAIN_MODEL     || 'googleai/gemini-2.0-flash-lite') as string;
