// use server'

/**
 * @fileOverview Cover letter generation AI agent.
 *
 * - generateCoverLetter - A function that handles the cover letter generation process.
 * - GenerateCoverLetterInput - The input type for the generateCoverLetter function.
 * - GenerateCoverLetterOutput - The return type for the generateCoverLetter function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCoverLetterInputSchema = z.object({
  jobRoles: z.string().describe('The job roles the user is applying for.'),
  skills: z.string().describe('The skills the user possesses.'),
  experience: z.string().describe('The user\'s work experience.'),
  careerGoals: z.string().describe('The user\'s career goals.'),
});
export type GenerateCoverLetterInput = z.infer<typeof GenerateCoverLetterInputSchema>;

const GenerateCoverLetterOutputSchema = z.object({
  coverLetter: z.string().describe('The generated cover letter.'),
});
export type GenerateCoverLetterOutput = z.infer<typeof GenerateCoverLetterOutputSchema>;

export async function generateCoverLetter(input: GenerateCoverLetterInput): Promise<GenerateCoverLetterOutput> {
  return generateCoverLetterFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCoverLetterPrompt',
  input: {schema: GenerateCoverLetterInputSchema},
  output: {schema: GenerateCoverLetterOutputSchema},
  prompt: `You are an expert career advisor specializing in writing cover letters.

  You will use the following information to generate a cover letter for the user.

  Job Roles: {{{jobRoles}}}
  Skills: {{{skills}}}
  Experience: {{{experience}}}
  Career Goals: {{{careerGoals}}}

  Write a cover letter tailored to the user's input, highlighting relevant experience and skills. The cover letter should be professional and engaging.
  `,
});

const generateCoverLetterFlow = ai.defineFlow(
  {
    name: 'generateCoverLetterFlow',
    inputSchema: GenerateCoverLetterInputSchema,
    outputSchema: GenerateCoverLetterOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
