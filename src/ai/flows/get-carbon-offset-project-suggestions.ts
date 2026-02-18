'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating carbon offset project suggestions based on user prompts.
 *
 * - getCarbonOffsetProjectSuggestions - A function that takes user prompts and returns carbon offset project suggestions.
 * - GetCarbonOffsetProjectSuggestionsInput - The input type for the getCarbonOffsetProjectSuggestions function.
 * - GetCarbonOffsetProjectSuggestionsOutput - The return type for the getCarbonOffsetProjectSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

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
  return getCarbonOffsetProjectSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'carbonOffsetProjectSuggestionPrompt',
  input: {schema: GetCarbonOffsetProjectSuggestionsInputSchema},
  output: {schema: GetCarbonOffsetProjectSuggestionsOutputSchema},
  prompt: `You are an expert in carbon offset projects. Based on the user's prompt, provide a list of carbon offset project suggestions that meet their requirements.\n\nUser Prompt: {{{prompt}}}`,
});

const getCarbonOffsetProjectSuggestionsFlow = ai.defineFlow(
  {
    name: 'getCarbonOffsetProjectSuggestionsFlow',
    inputSchema: GetCarbonOffsetProjectSuggestionsInputSchema,
    outputSchema: GetCarbonOffsetProjectSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
