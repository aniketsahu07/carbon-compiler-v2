'use server';
/**
 * @fileOverview BCX AI Pipeline - Mediator Layer
 *
 * Pipeline flow:
 *   User Query
 *     └─► Mediator AI (gemini-2.0-flash) — fast & cheap
 *           • Check: BCX se related hai ya nahi?
 *           • Refine: Query ko clearer + richer context ke saath rewrite karo
 *           • Extract: User ki actual intent nikalo
 *     └─► Main AI (gemini-2.5-flash) — powerful & accurate
 *           • Refined query pe final answer generate karo
 *
 * Agar mediator query ko REJECT kare (off-topic),
 * pipeline wahi ruk jaati hai — Main AI call NAHI hoti.
 */

import { ai, MEDIATOR_MODEL } from '@/ai/genkit';
import { z } from 'genkit';

// ─── Mediator Output Schema ───────────────────────────────────────────────────
const MediatorOutputSchema = z.object({
  allowed: z
    .boolean()
    .describe('true = BCX se related, aage bhejo | false = off-topic, block karo'),
  refinedQuery: z
    .string()
    .describe('Cleaned aur enriched version of user query (allowed=true ke liye)'),
  intent: z
    .string()
    .describe('User kya jaanna chahta hai — ek line mein'),
  rejectReason: z
    .string()
    .optional()
    .describe('Agar allowed=false, toh user ko show karne ka polite reason'),
});

export type MediatorOutput = z.infer<typeof MediatorOutputSchema>;

// ─── Mediator System Prompt ───────────────────────────────────────────────────
const mediatorSystemPrompt = `You are a smart routing mediator for the Bharat Carbon Exchange (BCX) AI assistant.

Your ONLY job is to analyze the user's message and return a JSON response.

RULES:
1. If the query is about BCX, carbon credits, carbon markets, climate finance, NDC, Verra, Gold Standard, carbon offset projects, sustainability, or environmental topics → set allowed=true and rewrite the query to be clearer and more specific.
2. If the query is completely unrelated to above topics (e.g., cooking, sports, geography, general knowledge) → set allowed=false and provide a polite rejectReason.
3. Always extract the user's intent in one short sentence.
4. When rewriting the refinedQuery, add context like "On the BCX platform..." to help the main AI give better answers.
5. Keep refinedQuery concise — max 2 sentences.

Return ONLY valid JSON matching this exact structure:
{
  "allowed": true | false,
  "refinedQuery": "string",
  "intent": "string",
  "rejectReason": "string (only if allowed=false)"
}`;

// ─── Mediator Flow ────────────────────────────────────────────────────────────
export const mediatorFlow = ai.defineFlow(
  {
    name: 'bcxMediatorFlow',
    inputSchema: z.object({ userMessage: z.string() }),
    outputSchema: MediatorOutputSchema,
  },
  async ({ userMessage }) => {
    const response = await ai.generate({
      model: MEDIATOR_MODEL,
      system: mediatorSystemPrompt,
      prompt: `Analyze this user message and return JSON:\n\n"${userMessage}"`,
      output: { schema: MediatorOutputSchema },
    });

    // Structured output se directly return karo
    const result = response.output;
    if (!result) {
      // Fallback: agar parsing fail ho toh allow karo aur raw message bhejo
      return {
        allowed: true,
        refinedQuery: userMessage,
        intent: 'User query about BCX platform',
      };
    }
    return result;
  }
);

// ─── Helper: Run Mediator ─────────────────────────────────────────────────────
export async function runMediator(userMessage: string): Promise<MediatorOutput> {
  return mediatorFlow({ userMessage });
}
