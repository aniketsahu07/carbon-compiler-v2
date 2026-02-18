'use server';
/**
 * @fileOverview An AI flow for analyzing satellite imagery of carbon offset projects.
 *
 * - analyzeSatelliteImage - A function that analyzes a zone within a satellite image to generate a report.
 * - AnalyzeSatelliteImageInput - The input type for the analyzeSatelliteImage function.
 * - AnalyzeSatelliteImageOutput - The return type for the analyzeSatelliteImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

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
  return analyzeSatelliteImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'satelliteImageAnalysisPrompt',
  input: {schema: AnalyzeSatelliteImageInputSchema},
  output: {schema: AnalyzeSatelliteImageOutputSchema},
  prompt: `You are an expert in satellite image analysis for environmental monitoring.

Analyze the provided satellite image, focusing on the area designated as '{{{zoneName}}}'. Your task is to:
1.  Estimate the number of trees within this zone.
2.  Provide a brief assessment of the vegetation's health (e.g., "Lush and dense," "Signs of stress," "Sparse vegetation").
3.  Provide a confidence score for your analysis based on the image quality and clarity.

Image to analyze: {{media url=photoDataUri}}`,
});

const analyzeSatelliteImageFlow = ai.defineFlow(
  {
    name: 'analyzeSatelliteImageFlow',
    inputSchema: AnalyzeSatelliteImageInputSchema,
    outputSchema: AnalyzeSatelliteImageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
