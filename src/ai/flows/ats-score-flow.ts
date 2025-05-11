'use server';
/**
 * @fileOverview ATS score generation AI agent.
 *
 * - generateAtsScore - A function that handles the ATS score generation process.
 * - GenerateAtsScoreInput - The input type for the generateAtsScore function.
 * - GenerateAtsScoreOutput - The return type for the generateAtsScore function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAtsScoreInputSchema = z.object({
  resumeText: z.string().describe('The full text content of the resume to be analyzed.'),
});
export type GenerateAtsScoreInput = z.infer<typeof GenerateAtsScoreInputSchema>;

const GenerateAtsScoreOutputSchema = z.object({
  atsScore: z.number().min(0).max(100).describe('The ATS compatibility score from 0 to 100.'),
  atsFeedback: z.string().describe('Brief, actionable feedback (2-3 bullet points max) on how to improve the resume for ATS. Focus on keywords, formatting, and clarity.'),
});
export type GenerateAtsScoreOutput = z.infer<typeof GenerateAtsScoreOutputSchema>;

export async function generateAtsScore(input: GenerateAtsScoreInput): Promise<GenerateAtsScoreOutput> {
  return generateAtsScoreFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAtsScorePrompt',
  input: {schema: GenerateAtsScoreInputSchema},
  output: {schema: GenerateAtsScoreOutputSchema},
  prompt: `You are an expert ATS (Applicant Tracking System) analyzer.
  Given the following resume text, evaluate its effectiveness for passing through an ATS.

  Provide:
  1.  An overall ATS compatibility score from 0 to 100.
  2.  A brief, actionable feedback (2-3 bullet points max, formatted as a single string with bullet points like '* point 1\\n* point 2') on how to improve the resume for ATS. Focus on aspects like keyword optimization, formatting that ATS can parse easily, and clarity of sections.

  Resume Text:
  {{{resumeText}}}
  `,
});

const generateAtsScoreFlow = ai.defineFlow(
  {
    name: 'generateAtsScoreFlow',
    inputSchema: GenerateAtsScoreInputSchema,
    outputSchema: GenerateAtsScoreOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
      // Fallback if LLM fails to generate proper output
      return {
        atsScore: 0,
        atsFeedback: "Could not generate ATS score. Please try again."
      };
    }
    // Ensure score is within bounds, just in case
    output.atsScore = Math.max(0, Math.min(100, output.atsScore));
    return output;
  }
);
