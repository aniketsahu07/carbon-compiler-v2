'use server';

/**
 * @fileOverview AI-powered validation of carbon offset projects to prevent greenwashing.
 * Uses HuggingFace Inference Router (OpenAI-compatible) — same pipeline as ai-assistant.
 */

import OpenAI from 'openai';
import { z } from 'zod';

const ValidateCarbonOffsetProjectInputSchema = z.object({
  projectDetails: z
    .string()
    .describe('Detailed description of the carbon offset project.'),
});
export type ValidateCarbonOffsetProjectInput = z.infer<typeof ValidateCarbonOffsetProjectInputSchema>;

const ValidateCarbonOffsetProjectOutputSchema = z.object({
  legitimacyScore: z
    .number()
    .describe('A score indicating the legitimacy of the project (0-100).'),
  environmentalImpactAssessment: z
    .string()
    .describe('An assessment of the environmental impact of the project.'),
  redFlags: z.array(z.string()).describe('List of potential red flags identified in the project.'),
});
export type ValidateCarbonOffsetProjectOutput = z.infer<typeof ValidateCarbonOffsetProjectOutputSchema>;

export async function validateCarbonOffsetProject(
  input: ValidateCarbonOffsetProjectInput
): Promise<ValidateCarbonOffsetProjectOutput> {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) {
    throw new Error('HUGGINGFACE_API_KEY is not configured.');
  }

  const model = process.env.MAIN_MODEL || 'Qwen/Qwen2.5-7B-Instruct';
  const client = new OpenAI({ apiKey, baseURL: 'https://router.huggingface.co/v1' });

  const systemPrompt = `You are an expert auditor specializing in validating carbon offset projects and preventing greenwashing.

Analyze the project details and respond ONLY with a valid JSON object (no markdown, no explanation) in this exact format:
{
  "legitimacyScore": <number 0-100>,
  "environmentalImpactAssessment": "<string>",
  "redFlags": ["<string>", ...]
}

Rules:
- legitimacyScore: 0 = complete fraud/greenwashing, 100 = fully credible & certified
- environmentalImpactAssessment: 2-4 sentences about actual environmental benefit
- redFlags: array of specific concerns (empty array [] if none)`;

  const userMessage = `Validate this carbon offset project:\n\n${input.projectDetails}`;

  const completion = await client.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    temperature: 0.3,
    max_tokens: 600,
  });

  const raw = completion.choices[0]?.message?.content?.trim() ?? '';

  // Extract JSON — model may wrap in ```json ... ```
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('AI returned invalid response. Please try again.');
  }

  const parsed = JSON.parse(jsonMatch[0]);

  return {
    legitimacyScore: Math.min(100, Math.max(0, Number(parsed.legitimacyScore) || 50)),
    environmentalImpactAssessment: String(parsed.environmentalImpactAssessment || ''),
    redFlags: Array.isArray(parsed.redFlags) ? parsed.redFlags.map(String) : [],
  };
}
