import { config } from 'dotenv';
config();

import '@/ai/flows/validate-carbon-offset-projects.ts';
import '@/ai/flows/get-carbon-offset-project-suggestions.ts';
import '@/ai/flows/analyze-satellite-image.ts';
import '@/ai/flows/ai-assistant.ts';
