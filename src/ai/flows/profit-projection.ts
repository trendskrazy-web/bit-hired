'use server';
/**
 * @fileOverview Profit projection flow for mining machines.
 *
 * - getProfitProjection - A function that calculates the profit projection.
 * - ProfitProjectionInput - The input type for the getProfitProjection function.
 * - ProfitProjectionOutput - The return type for the getProfitProjection function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProfitProjectionInputSchema = z.object({
  machineType: z.string().describe('The type of mining machine.'),
  duration: z.string().describe('The duration for which the machine is hired (e.g., 3 days, 1 week, 1 month).'),
  miningRate: z.number().describe('The mining rate of the selected machine.'),
  cost: z.number().describe('The cost of hiring the machine for the specified duration.'),
  pastBitcoinData: z.string().describe('Past bitcoin pricing data as a stringified JSON array.'),
  currentBitcoinPrice: z.number().describe('The current bitcoin price.'),
});
export type ProfitProjectionInput = z.infer<typeof ProfitProjectionInputSchema>;

const ProfitProjectionOutputSchema = z.object({
  projectedProfit: z.number().describe('The projected profit for the selected machine and duration.'),
  analysis: z.string().describe('A brief analysis of the profit projection, considering past bitcoin data and current pricing.'),
});
export type ProfitProjectionOutput = z.infer<typeof ProfitProjectionOutputSchema>;

export async function getProfitProjection(input: ProfitProjectionInput): Promise<ProfitProjectionOutput> {
  return profitProjectionFlow(input);
}

const profitProjectionPrompt = ai.definePrompt({
  name: 'profitProjectionPrompt',
  input: {schema: ProfitProjectionInputSchema},
  output: {schema: ProfitProjectionOutputSchema},
  prompt: `You are an expert in cryptocurrency mining profit projections.

  Based on the type of mining machine: {{{machineType}}},
  the duration: {{{duration}}},
  the mining rate: {{{miningRate}}},
  the hiring cost: {{{cost}}},
  past bitcoin pricing data: {{{pastBitcoinData}}},
  and current bitcoin price: {{{currentBitcoinPrice}}},
  project the potential profit and provide a brief analysis. Be concise.

  Consider fluctuations in Bitcoin price when projecting profit and provide reasons for your profit projection.
  Your projectedProfit calculation must subtract the cost. 
  Return projectedProfit as a number and analysis as a string.
  `,
});

const profitProjectionFlow = ai.defineFlow(
  {
    name: 'profitProjectionFlow',
    inputSchema: ProfitProjectionInputSchema,
    outputSchema: ProfitProjectionOutputSchema,
  },
  async input => {
    const {output} = await profitProjectionPrompt(input);
    return output!;
  }
);
