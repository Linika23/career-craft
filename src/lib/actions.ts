'use server';

import { generateResume, type GenerateResumeInput, type GenerateResumeOutput } from '@/ai/flows/resume-generation';
import { generateCoverLetter, type GenerateCoverLetterInput, type GenerateCoverLetterOutput } from '@/ai/flows/cover-letter-generation';
import { generateAtsScore, type GenerateAtsScoreInput, type GenerateAtsScoreOutput } from '@/ai/flows/ats-score-flow';
import { generateAtsImprovementSuggestions, type GenerateAtsImprovementSuggestionsInput, type GenerateAtsImprovementSuggestionsOutput } from '@/ai/flows/ats-improvement-flow';
import type { CareerCraftFormData } from '@/lib/schema';
import type { DynamicFormattedResumeProps } from '@/components/dynamic-formatted-resume';


interface ActionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// New combined output type for resume with ATS score and improvement suggestions
export interface GenerateResumeWithAtsOutput extends GenerateResumeOutput {
  atsScore: number;
  atsFeedback: string;
  atsImprovementSuggestions: string[];
  resumeData?: DynamicFormattedResumeProps; // For potential structured resume display
}

export async function handleGenerateResumeAction(formData: CareerCraftFormData): Promise<ActionResult<GenerateResumeWithAtsOutput>> {
  try {
    const resumeInput: GenerateResumeInput = {
      fullName: formData.fullName,
      jobTitle: formData.jobTitle,
      phoneNumber: formData.phoneNumber,
      email: formData.email,
      website: formData.website || undefined,
      linkedinUrl: formData.linkedinUrl || undefined,
      githubUrl: formData.githubUrl || undefined,
      summary: formData.summary,
      jobRoles: formData.jobRoles || '',
      skills: formData.skills,
      experience: formData.experience,
      education: formData.education,
      projects: formData.projects || undefined,
      careerGoals: formData.careerGoals || '',
    };
    const resumeResult = await generateResume(resumeInput);

    if (!resumeResult || !resumeResult.resume) {
        throw new Error('Resume generation failed to produce content.');
    }

    const atsInput: GenerateAtsScoreInput = {
        resumeText: resumeResult.resume,
    };
    const atsResult = await generateAtsScore(atsInput);

    const improvementInput: GenerateAtsImprovementSuggestionsInput = {
        resumeText: resumeResult.resume,
        currentAtsScore: atsResult.atsScore,
        currentAtsFeedback: atsResult.atsFeedback,
    };
    const improvementResult = await generateAtsImprovementSuggestions(improvementInput);

    // Currently, resumeData is not populated by the AI flow for structured display.
    // If the AI were to return structured data, it would be mapped here.
    // For now, resumeData will be undefined, and the plain text resume is used.

    return { 
        success: true, 
        data: {
            resume: resumeResult.resume,
            atsScore: atsResult.atsScore,
            atsFeedback: atsResult.atsFeedback,
            atsImprovementSuggestions: improvementResult.improvementSuggestions,
            // resumeData: undefined // Explicitly undefined until AI provides structured data
        }
    };
  } catch (error) {
    console.error('Error in resume generation, ATS scoring, or improvement suggestion process:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during resume and ATS processing.';
    return { success: false, error: `Failed to process: ${errorMessage}` };
  }
}

export async function handleGenerateCoverLetterAction(formData: CareerCraftFormData): Promise<ActionResult<GenerateCoverLetterOutput>> {
  try {
    const input: GenerateCoverLetterInput = {
      jobRoles: formData.jobRoles || `target roles based on resume content (${formData.jobTitle})`,
      skills: formData.skills,
      experience: formData.experience,
      careerGoals: formData.careerGoals || 'achieve success in the targeted role',
    };
    const result = await generateCoverLetter(input);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error generating cover letter:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, error: `Failed to generate cover letter: ${errorMessage}` };
  }
}
