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

const MIN_WORD_COUNT = 30;

export async function validateCarbonOffsetProject(
  input: ValidateCarbonOffsetProjectInput
): Promise<ValidateCarbonOffsetProjectOutput> {
  // Pre-check: reject descriptions that are too short or clearly lack project details
  const wordCount = input.projectDetails.trim().split(/\s+/).filter(Boolean).length;
  if (wordCount < MIN_WORD_COUNT) {
    return {
      legitimacyScore: 0,
      environmentalImpactAssessment:
        'Insufficient information provided. A valid project description must contain at least 30 words covering the project type, methodology, location, and measurable environmental impact. Please provide complete project details.',
      redFlags: [
        'Description is too short to perform a meaningful assessment',
        'No identifiable carbon offset project details found',
        'Missing required information: project type, methodology, location, and impact metrics',
      ],
    };
  }

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

CRITICAL RULES — read carefully before scoring:
1. If the input is NOT a description of a carbon offset project (e.g., random text, greetings, lorem ipsum, unrelated content, or any text that does not describe an actual project), you MUST set legitimacyScore to 0 and include "Input does not describe a carbon offset project" as the first red flag.
2. If the input lacks essential project details (project type, location, methodology, certifications, measurable impact), you MUST lower the score significantly and list each missing element as a red flag.
3. legitimacyScore: 0 = complete fraud/greenwashing/irrelevant input, 100 = fully credible & certified with all details
4. environmentalImpactAssessment: 2-4 sentences about actual environmental benefit — if the input is irrelevant or insufficient, state clearly that no meaningful assessment can be made.
5. redFlags: array of specific concerns (empty array [] only if the project description is fully detailed and credible)`;

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
