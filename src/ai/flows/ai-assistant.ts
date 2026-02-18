'use server';
/**
 * @fileOverview BCX AI Assistant — HuggingFace Inference Pipeline
 * Uses HuggingFace Inference Providers (OpenAI-compatible generic endpoint)
 * Model: Qwen/Qwen2.5-7B-Instruct — confirmed working, auto-routed by HF
 * Env vars: HUGGINGFACE_API_KEY, MAIN_MODEL (.env.local)
 */

import OpenAI from 'openai';
import { z } from 'zod';

const ChatWithAssistantInputSchema = z.object({
  history: z
    .array(z.object({
      role: z.enum(['user', 'model']),
      content: z.array(z.object({ text: z.string() })),
    }))
    .optional(),
  message: z.string(),
});
export type ChatWithAssistantInput = z.infer<typeof ChatWithAssistantInputSchema>;

const ChatWithAssistantOutputSchema = z.object({
  response: z.string(),
});
export type ChatWithAssistantOutput = z.infer<typeof ChatWithAssistantOutputSchema>;

const SYSTEM_PROMPT = `You are a specialized AI assistant for the Bharat Carbon Exchange (BCX), a platform for trading carbon credits in India.

RULES:
1. Answer ONLY questions related to: BCX platform, carbon credits, carbon markets, carbon offset projects, climate finance, NDC compliance, Verra, Gold Standard, sustainability, and environmental topics.
2. If asked anything unrelated (cooking, sports, general knowledge, geography, etc.), politely decline and redirect to BCX topics.
3. Be helpful, accurate, and concise.`;

export async function chatWithAssistant(
  input: ChatWithAssistantInput
): Promise<ChatWithAssistantOutput> {
  const { message, history } = input;

  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) {
    return { response: 'HUGGINGFACE_API_KEY missing in .env.local.' };
  }

  // HuggingFace generic router — auto-selects fastest provider for the model
  const client = new OpenAI({
    apiKey,
    baseURL: 'https://router.huggingface.co/v1',
  });

  const model = process.env.MAIN_MODEL || 'Qwen/Qwen2.5-7B-Instruct';

  // Build messages: system + history + current message
  const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...(history || []).map((m) => ({
      role: (m.role === 'model' ? 'assistant' : 'user') as 'user' | 'assistant',
      content: m.content.map((p) => p.text).join(''),
    })),
    { role: 'user', content: message },
  ];

  try {
    const completion = await client.chat.completions.create({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 1024,
    });

    const response = completion.choices[0]?.message?.content ?? 'No response received.';
    console.log('[BCX AI] Success! Model:', model, '| Response length:', response.length, '| Preview:', response.slice(0, 100));
    return { response };

  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    const errFull = JSON.stringify(err, Object.getOwnPropertyNames(err as object));
    console.error('[BCX AI] Error message:', errMsg);
    console.error('[BCX AI] Error full:', errFull);

    if (errMsg.includes('429') || errMsg.includes('Too Many') || errMsg.includes('rate')) {
      return { response: 'Rate limit reached. Please wait a moment and try again.' };
    }
    if (errMsg.includes('401') || errMsg.includes('403') || errMsg.includes('Unauthorized')) {
      return { response: 'Invalid HuggingFace API key. Please check HUGGINGFACE_API_KEY in .env.local.' };
    }
    if (errMsg.includes('503') || errMsg.includes('loading')) {
      return { response: 'AI model is loading (first request takes ~20s). Please try again in a moment.' };
    }
    return { response: 'Something went wrong. Please try again.' };
  }
}
