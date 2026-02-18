'use server';
/**
 * @fileOverview Generates carbon offset project suggestions based on user prompts.
 * Uses HuggingFace Inference Router (OpenAI-compatible) — same pipeline as ai-assistant.
 */

import OpenAI from 'openai';
import { z } from 'zod';

const GetCarbonOffsetProjectSuggestionsInputSchema = z.object({
  prompt: z.string().describe('A description of the desired carbon offset project.'),
});

export type GetCarbonOffsetProjectSuggestionsInput = z.infer<
  typeof GetCarbonOffsetProjectSuggestionsInputSchema
>;

const GetCarbonOffsetProjectSuggestionsOutputSchema = z.object({
  suggestions: z
    .array(z.string())
    .describe('A list of suggested carbon offset projects.'),
});

export type GetCarbonOffsetProjectSuggestionsOutput = z.infer<
  typeof GetCarbonOffsetProjectSuggestionsOutputSchema
>;

export async function getCarbonOffsetProjectSuggestions(
  input: GetCarbonOffsetProjectSuggestionsInput
): Promise<GetCarbonOffsetProjectSuggestionsOutput> {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) {
    throw new Error('HUGGINGFACE_API_KEY is not configured.');
  }

  const model = process.env.MAIN_MODEL || 'Qwen/Qwen2.5-7B-Instruct';
  const client = new OpenAI({ apiKey, baseURL: 'https://router.huggingface.co/v1' });

  const systemPrompt = `You are an expert in carbon offset projects and climate finance.

Based on the user's requirements, suggest specific carbon offset projects. Respond ONLY with a valid JSON object (no markdown, no explanation):
{
  "suggestions": ["<project suggestion 1>", "<project suggestion 2>", ...]
}

Each suggestion should be a clear, specific project description (1-2 sentences). Provide 4-6 suggestions.`;

  const completion = await client.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Suggest carbon offset projects for: ${input.prompt}` },
    ],
    temperature: 0.7,
    max_tokens: 500,
  });

  const raw = completion.choices[0]?.message?.content?.trim() ?? '';
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('AI returned invalid response. Please try again.');
  }

  const parsed = JSON.parse(jsonMatch[0]);
  return {
    suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions.map(String) : [],
  };
}
