'use server';

/**
 * @fileOverview AI-powered validation of carbon offset projects to prevent greenwashing.
 *
 * - validateCarbonOffsetProject - A function that validates the legitimacy and environmental impact of carbon offset projects.
 * - ValidateCarbonOffsetProjectInput - The input type for the validateCarbonOffsetProject function.
 * - ValidateCarbonOffsetProjectOutput - The return type for the validateCarbonOffsetProject function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

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
  return validateCarbonOffsetProjectFlow(input);
}

const validateCarbonOffsetProjectPrompt = ai.definePrompt({
  name: 'validateCarbonOffsetProjectPrompt',
  input: {schema: ValidateCarbonOffsetProjectInputSchema},
  output: {schema: ValidateCarbonOffsetProjectOutputSchema},
  prompt: `You are an expert auditor specializing in validating carbon offset projects and preventing greenwashing.

You will analyze the project details provided and assess their legitimacy and environmental impact.

Based on your analysis, provide a legitimacy score (0-100), an environmental impact assessment, and a list of any potential red flags.

Project Details: {{{projectDetails}}}`,
});

const validateCarbonOffsetProjectFlow = ai.defineFlow(
  {
    name: 'validateCarbonOffsetProjectFlow',
    inputSchema: ValidateCarbonOffsetProjectInputSchema,
    outputSchema: ValidateCarbonOffsetProjectOutputSchema,
  },
  async input => {
    const {output} = await validateCarbonOffsetProjectPrompt(input);
    return output!;
  }
);
