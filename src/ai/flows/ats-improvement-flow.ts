'use server';
/**
 * @fileOverview ATS improvement suggestions AI agent.
 *
 * - generateAtsImprovementSuggestions - A function that handles the ATS improvement suggestion generation process.
 * - GenerateAtsImprovementSuggestionsInput - The input type for the generateAtsImprovementSuggestions function.
 * - GenerateAtsImprovementSuggestionsOutput - The return type for the generateAtsImprovementSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z}  from 'genkit';

const GenerateAtsImprovementSuggestionsInputSchema = z.object({
  resumeText: z.string().describe('The full text content of the resume to be analyzed.'),
  currentAtsScore: z.number().optional().describe('The current ATS score of the resume, if available.'),
  currentAtsFeedback: z.string().optional().describe('The current ATS feedback for the resume, if available.'),
});
export type GenerateAtsImprovementSuggestionsInput = z.infer<typeof GenerateAtsImprovementSuggestionsInputSchema>;

const GenerateAtsImprovementSuggestionsOutputSchema = z.object({
  improvementSuggestions: z.array(z.string()).describe('A list of actionable suggestions to improve the resume for ATS. Each suggestion should be a concise bullet point.'),
});
export type GenerateAtsImprovementSuggestionsOutput = z.infer<typeof GenerateAtsImprovementSuggestionsOutputSchema>;

export async function generateAtsImprovementSuggestions(input: GenerateAtsImprovementSuggestionsInput): Promise<GenerateAtsImprovementSuggestionsOutput> {
  return generateAtsImprovementSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAtsImprovementSuggestionsPrompt',
  input: {schema: GenerateAtsImprovementSuggestionsInputSchema},
  output: {schema: GenerateAtsImprovementSuggestionsOutputSchema},
  prompt: `You are an expert ATS (Applicant Tracking System) optimization consultant.
  Given the following resume text, and optionally its current ATS score and feedback, provide a list of 3-5 highly specific and actionable improvement suggestions to boost its ATS score and overall effectiveness.

  Focus on:
  - Keyword optimization tailored to common job descriptions (even if one isn't provided, assume general best practices).
  - Formatting that enhances ATS readability (e.g., section clarity, bullet points, standard fonts).
  - Action verb usage and impact quantification.
  - Ensuring all critical sections are present and clear.
  - Removing elements that might hinder ATS parsing.

  Resume Text:
  {{{resumeText}}}

  {{#if currentAtsScore}}
  Current ATS Score: {{currentAtsScore}}/100
  {{/if}}
  {{#if currentAtsFeedback}}
  Current ATS Feedback:
  {{{currentAtsFeedback}}}
  Based on this, and the resume text, offer further, more detailed suggestions.
  {{/if}}

  Return the suggestions as an array of strings, where each string is a single bullet point. For example: ["* Suggestion 1...", "* Suggestion 2..."].
  Be concise and direct.
  `,
});

const generateAtsImprovementSuggestionsFlow = ai.defineFlow(
  {
    name: 'generateAtsImprovementSuggestionsFlow',
    inputSchema: GenerateAtsImprovementSuggestionsInputSchema,
    outputSchema: GenerateAtsImprovementSuggestionsOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output || !output.improvementSuggestions || output.improvementSuggestions.length === 0) {
      return {
        improvementSuggestions: ["Could not generate improvement suggestions. Ensure the resume text is comprehensive and try again."]
      };
    }
    return output;
  }
);
