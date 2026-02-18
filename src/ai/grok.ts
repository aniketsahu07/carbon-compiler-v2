/**
 * @fileOverview xAI Grok client for BCX AI Assistant
 *
 * xAI ka API OpenAI-compatible hai —
 * base URL change karke Grok models use possible hain.
 *
 * Models available (free tier):
 *   - grok-3-mini      → fast, cheap, best for assistant
 *   - grok-3           → powerful, slower
 *   - grok-2-1212      → previous gen, stable
 */

import OpenAI from 'openai';

const xaiApiKey = process.env.XAI_API_KEY;
if (!xaiApiKey) {
  throw new Error('XAI_API_KEY missing in .env.local — get it from console.x.ai');
}

// xAI Grok client — OpenAI SDK with xAI base URL
export const grokClient = new OpenAI({
  apiKey: xaiApiKey,
  baseURL: 'https://api.x.ai/v1',
});

export const GROK_MODEL = process.env.MAIN_MODEL || 'grok-3-mini';
