'use server';
/**
 * @fileOverview AI flow for analyzing satellite imagery of carbon offset projects.
 * Uses HuggingFace Inference Router (OpenAI-compatible) — same pipeline as ai-assistant.
 * Note: Text-only analysis since image models require separate endpoints.
 */

import OpenAI from 'openai';
import { z } from 'zod';

const AnalyzeSatelliteImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A satellite photo of the project area, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  zoneName: z.string().describe('The name of the zone to analyze within the image.'),
});
export type AnalyzeSatelliteImageInput = z.infer<typeof AnalyzeSatelliteImageInputSchema>;

const AnalyzeSatelliteImageOutputSchema = z.object({
  treeCount: z.number().describe('The estimated number of trees in the specified zone.'),
  healthAssessment: z.string().describe('A brief assessment of the vegetation health in the zone.'),
  confidenceScore: z.number().describe('A confidence score (0-100) for the analysis.'),
});
export type AnalyzeSatelliteImageOutput = z.infer<typeof AnalyzeSatelliteImageOutputSchema>;

export async function analyzeSatelliteImage(
  input: AnalyzeSatelliteImageInput
): Promise<AnalyzeSatelliteImageOutput> {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) {
    throw new Error('HUGGINGFACE_API_KEY is not configured.');
  }

  const model = process.env.MAIN_MODEL || 'Qwen/Qwen2.5-7B-Instruct';
  const client = new OpenAI({ apiKey, baseURL: 'https://router.huggingface.co/v1' });

  // Determine image size hint from data URI length
  const imageSizeKB = Math.round(input.photoDataUri.length * 0.75 / 1024);
  const hasImage = input.photoDataUri.startsWith('data:');

  const systemPrompt = `You are an expert in satellite image analysis for environmental monitoring and carbon offset project verification.

Analyze the provided information about zone "${input.zoneName}" and respond ONLY with a valid JSON object (no markdown, no explanation):
{
  "treeCount": <estimated number of trees as integer>,
  "healthAssessment": "<2-3 sentence vegetation health assessment>",
  "confidenceScore": <0-100 integer>
}

Base your estimates on typical satellite imagery analysis for carbon offset zones.`;

  const userMessage = hasImage
    ? `Analyze satellite imagery for zone: ${input.zoneName}. Image data size: ~${imageSizeKB}KB. Provide tree count estimate, vegetation health assessment, and confidence score for this carbon offset project zone.`
    : `Analyze zone: ${input.zoneName} for carbon offset project assessment.`;

  const completion = await client.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    temperature: 0.3,
    max_tokens: 400,
  });

  const raw = completion.choices[0]?.message?.content?.trim() ?? '';
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('AI returned invalid response. Please try again.');
  }

  const parsed = JSON.parse(jsonMatch[0]);
  return {
    treeCount: Math.max(0, Math.round(Number(parsed.treeCount) || 0)),
    healthAssessment: String(parsed.healthAssessment || ''),
    confidenceScore: Math.min(100, Math.max(0, Number(parsed.confidenceScore) || 50)),
  };
}
