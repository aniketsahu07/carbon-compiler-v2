'use server';
/**
 * @fileOverview A specialized AI assistant for the Bharat Carbon Exchange (BCX) platform.
 *
 * - chatWithAssistant - A function that handles the chat interaction with the AI assistant.
 * - ChatWithAssistantInput - The input type for the chatWithAssistant function.
 * - ChatWithAssistantOutput - The return type for the chatWithAssistant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {Part} from '@genkit-ai/google-genai';

const ChatWithAssistantInputSchema = z.object({
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.array(z.object({text: z.string()})),
  })).optional(),
  message: z.string().describe('The user\'s message to the assistant.'),
});
export type ChatWithAssistantInput = z.infer<typeof ChatWithAssistantInputSchema>;

const ChatWithAssistantOutputSchema = z.object({
  response: z.string().describe('The AI assistant\'s response.'),
});
export type ChatWithAssistantOutput = z.infer<typeof ChatWithAssistantOutputSchema>;

export async function chatWithAssistant(
  input: ChatWithAssistantInput
): Promise<ChatWithAssistantOutput> {
  return chatAssistantFlow(input);
}

const systemPrompt = `You are a specialized AI assistant for the Bharat Carbon Exchange (BCX), a platform for trading carbon credits.

Your role is to answer questions ONLY about the BCX platform, its features, carbon credits, and the projects listed on it. You must be helpful and provide information based on the platform's context.

If a user asks a question that is NOT related to the BCX platform, carbon credits, climate finance, or environmental topics, you MUST politely decline.

Example of a good response:
User: "Tell me about the Sundarbans Reforestation Initiative."
You: "The Sundarbans Reforestation Initiative is a project focused on restoring mangrove forests in the Sundarbans delta. It is listed on the BCX with a vintage year of 2024 and is verified by the Gold Standard."

Example of declining a question:
User: "What is the capital of France?"
You: "I am an assistant for the Bharat Carbon Exchange and can only answer questions about our platform and carbon credits. I cannot provide information on other topics."
`;


const chatAssistantFlow = ai.defineFlow(
  {
    name: 'chatAssistantFlow',
    inputSchema: ChatWithAssistantInputSchema,
    outputSchema: ChatWithAssistantOutputSchema,
  },
  async ({message, history}) => {
    const response = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      prompt: message,
      system: systemPrompt,
      history: history as Part[]
    });

    return { response: response.text };
  }
);
