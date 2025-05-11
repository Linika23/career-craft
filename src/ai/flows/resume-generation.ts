'use server';
/**
 * @fileOverview Resume generation AI agent.
 *
 * - generateResume - A function that handles the resume generation process.
 * - GenerateResumeInput - The input type for the generateResume function.
 * - GenerateResumeOutput - The return type for the generateResume function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateResumeInputSchema = z.object({
  fullName: z.string().describe('The full name of the user.'),
  jobTitle: z.string().describe('The user\'s desired job title to be displayed under their name (e.g., Graphic Designer, Software Engineer). This will be used for the main resume header and should retain its original casing.'),
  phoneNumber: z.string().describe('The user\'s phone number.'),
  email: z.string().email().describe('The user\'s email address.'),
  website: z.string().url().optional().describe('The user\'s personal website or portfolio URL (optional).'),
  linkedinUrl: z.string().url().optional().describe('The user\'s LinkedIn profile URL (optional).'),
  githubUrl: z.string().url().optional().describe('The user\'s GitHub profile URL (optional).'),
  summary: z.string().describe('A brief professional summary or objective. This will appear under the contact information. Keep it concise for a one-page resume.'),
  jobRoles: z.string().describe('The job roles the user is targeting (for AI context, may not be directly on resume).'),
  skills: z.string().describe('The skills the user possesses. Provide as a comma-separated list or a descriptive paragraph. These will be listed in a dedicated SKILLS section, and you should attempt to categorize them (e.g., Frontend, Backend, Tools). Be selective for a one-page resume.'),
  experience: z.string().describe('The user\'s work experience. For each role, provide: Company Name; Location (e.g., San Francisco, CA or Remote, leave empty if not applicable); Dates (e.g., Jan 2022 – Present); Job Title (for this specific role, e.g. Senior Designer); Description of responsibilities and achievements. Separate multiple roles with "|||". Ensure achievements are quantified (e.g., "Improved application performance by 15%") and specify types of components built (e.g., "Developed data visualization components using D3.js"). Descriptions MUST be very concise to fit a single page.'),
  education: z.string().describe('The user\'s educational background. For each entry, provide: Institution Name; Location (e.g., City, State, leave empty if not applicable); Dates (e.g., 2005-2011); Degree/Certificate (e.g. Bachelor of Art); Description (optional). Separate multiple entries with "|||". Keep descriptions minimal.'),
  projects: z.string().optional().describe('The user\'s personal or academic projects. For each project, provide: Project Name; Description (include technologies used, your role, key features/achievements, like "Developed a CNN model for image classification achieving 95% accuracy"); Link (optional, e.g., GitHub, live demo). Separate multiple projects with "|||". Descriptions MUST be very concise.'),
  careerGoals: z.string().describe('The career goals of the user (for AI context, to tailor the resume tone).'),
});
export type GenerateResumeInput = z.infer<typeof GenerateResumeInputSchema>;

const GenerateResumeOutputSchema = z.object({
  resume: z.string().describe('The generated resume, formatted as plain text according to the specified layout. The LLM is responsible for iterating through experience/education/project data and formatting each entry according to detailed layout rules, including a dedicated SKILLS section with categorization, and specific date formatting. The entire resume MUST be designed to fit on a single A4 page.'),
});
export type GenerateResumeOutput = z.infer<typeof GenerateResumeOutputSchema>;

export async function generateResume(input: GenerateResumeInput): Promise<GenerateResumeOutput> {
  return generateResumeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateResumePrompt',
  input: {schema: z.object({
    RESUME_FULL_NAME_ALL_CAPS: z.string(),
    RESUME_JOB_TITLE_HEADER_CASE: z.string(),
    RESUME_CONTACT_DETAILS_MULTILINE: z.string(),
    RESUME_SUMMARY: z.string(),
    RESUME_SKILLS_CONTENT: z.string(),
    RAW_EXPERIENCE_ENTRIES_DATA_FOR_LLM: z.array(z.object({
        companyName: z.string(),
        location: z.string().optional(),
        dates: z.string(),
        jobTitle: z.string(),
        description: z.string(),
    })),
    RAW_EDUCATION_ENTRIES_DATA_FOR_LLM: z.array(z.object({
        institutionName: z.string(),
        location: z.string().optional(),
        dates: z.string(),
        degree: z.string(),
        description: z.string().optional(),
    })),
    RAW_PROJECT_ENTRIES_DATA_FOR_LLM: z.array(z.object({
        projectName: z.string(),
        description: z.string(),
        link: z.string().optional(),
    })).optional(),
    raw_fullName: z.string(),
    raw_jobTitleForHeader: z.string(),
    raw_phoneNumber: z.string(),
    raw_email: z.string(),
    raw_website: z.string().optional(),
    raw_linkedinUrl: z.string().optional(),
    raw_githubUrl: z.string().optional(),
    raw_summary: z.string(),
    raw_jobRoles: z.string(),
    raw_skills: z.string(),
    raw_experience: z.string(),
    raw_education: z.string(),
    raw_projects: z.string().optional(),
    raw_careerGoals: z.string(),
  })}, 
  output: {schema: GenerateResumeOutputSchema},
  prompt: `You are an expert resume writer. Create a professional, realistic, and impactful plain text resume based on the provided user information.
The resume output MUST strictly follow this format and the detailed instructions below.
The output MUST be plain text. Do not use any rich text formatting, HTML, or markdown.

**CRITICAL REQUIREMENT: The entire resume MUST be designed and written to fit onto a SINGLE A4 PAGE when rendered with a standard 9-10pt font and reasonable margins (e.g., 10-15mm). You must prioritize essential information and be extremely concise in ALL descriptions. If the user provides extensive information, you must strategically summarize or omit less critical details to meet this one-page requirement. Use compact formatting, minimize empty lines where appropriate (while maintaining section separation), and ensure all content is highly relevant.**

{{RESUME_FULL_NAME_ALL_CAPS}}
{{RESUME_JOB_TITLE_HEADER_CASE}}
{{{RESUME_CONTACT_DETAILS_MULTILINE}}}

PROFESSIONAL SUMMARY
{{{RESUME_SUMMARY}}}

SKILLS
{{{RESUME_SKILLS_CONTENT}}}

EXPERIENCE
{{!-- LLM: Iterate through RAW_EXPERIENCE_ENTRIES_DATA_FOR_LLM. For each entry, format as per instruction point 6. Concatenate all formatted entries. Ensure descriptions are extremely concise for one-page limit. --}}

EDUCATION
{{!-- LLM: Iterate through RAW_EDUCATION_ENTRIES_DATA_FOR_LLM. For each entry, format as per instruction point 6. Concatenate all formatted entries. Ensure descriptions are minimal. --}}

{{#if RAW_PROJECT_ENTRIES_DATA_FOR_LLM}}
PROJECTS
{{!-- LLM: Iterate through RAW_PROJECT_ENTRIES_DATA_FOR_LLM. For each entry, format as per instruction point 7. Concatenate all formatted entries. Ensure descriptions are extremely concise. --}}
{{/if}}

**Detailed Formatting Instructions:**

1.  **Header Section (Mimicking Image Layout):**
    *   \`RESUME_FULL_NAME_ALL_CAPS\`: User's full name, rendered in ALL CAPS. (e.g., "MICHELLE HLOOM"). Most prominent.
    *   \`RESUME_JOB_TITLE_HEADER_CASE\`: User's job title for header, original case. (e.g., "Graphic Designer"). Directly below name.
    *   \`RESUME_CONTACT_DETAILS_MULTILINE\`: User's contact details, formatted with labels on new lines. The LLM should use the pre-formatted string provided in this input variable. It was constructed based on:
        Phone: {{raw_phoneNumber}}
        Email: {{raw_email}}
        {{#if raw_website}}Website: {{raw_website}}{{/if}}
        {{#if raw_linkedinUrl}}LinkedIn: {{raw_linkedinUrl}}{{/if}}
        {{#if raw_githubUrl}}GitHub: {{raw_githubUrl}}{{/if}}
        Each piece on its own new line.
    *   **No horizontal line separator** after contact. Use one blank line before PROFESSIONAL SUMMARY.

2.  **Section Alignment:** All main sections (PROFESSIONAL SUMMARY, SKILLS, EXPERIENCE, EDUCATION, PROJECTS) aligned one below another, single-column.

3.  **Professional Summary Section:**
    *   Heading: \`PROFESSIONAL SUMMARY\`.
    *   Content from \`RESUME_SUMMARY\` (well-written paragraph, **must be very concise**).
    *   One blank line after header (contact details) and before \`PROFESSIONAL SUMMARY\` heading.
    *   One blank line after summary content and before next section heading.

4.  **Section Headings (PROFESSIONAL SUMMARY, SKILLS, EXPERIENCE, EDUCATION, PROJECTS):**
    *   MUST be these standard titles, ALL CAPS.
    *   **No underlining characters** (like '---'). Emphasis by ALL CAPS and blank line preceding.
    *   One blank line before each section heading (except PROFESSIONAL SUMMARY).

5.  **Skills Section (\`RESUME_SKILLS_CONTENT\`):**
    *   Under "SKILLS" heading.
    *   Content from \`RESUME_SKILLS_CONTENT\` (derived from \`raw_skills\`).
    *   **Attempt to categorize skills** (e.g., Frontend:, Backend:, DevOps:, Other Tools:). If not obvious, list clearly.
        Example for conciseness:
        Frontend: JavaScript, React, Next.js, Tailwind CSS
        Backend: Node.js, Express, Python, MongoDB, REST APIs
        Tools: Git, Docker, AWS, JIRA
    *   One blank line after skills content, before next section heading. **Be selective with listed skills to save space.**

6.  **Experience & Education Entries (Standard Single-Column Layout):**
    *   Structured data in \`RAW_EXPERIENCE_ENTRIES_DATA_FOR_LLM\` and \`RAW_EDUCATION_ENTRIES_DATA_FOR_LLM\` (arrays of objects).
    *   For each entry, generate a multi-line formatted text block.
    *   Responsibilities/achievements as bullet points ('*' or '-', indented). **Bullet points MUST be extremely concise (1-2 lines max per bullet). Focus on impact.**
    *   **Date Formatting:** \`MM/YYYY\`, \`MM/YYYY – MM/YYYY\`, \`MM/YYYY – Present\`, or \`YYYY – YYYY\`. You are responsible for parsing various input date strings.

    *   **Structure for each Experience Entry (iterate \`RAW_EXPERIENCE_ENTRIES_DATA_FOR_LLM\`):**
        *   Object contains: \`companyName\`, \`location\` (optional), \`dates\` (raw), \`jobTitle\` (raw), \`description\` (raw).
        *   Line 1: \`companyName\`
        *   Line 2: \`jobTitle\` (CONVERT TO ALL CAPS)
        *   Line 3: If \`location\`: \`location\` – *formatted dates*. If no \`location\`: *formatted dates*.
        *   Subsequent lines (Description): Bullet points ('*' or '-'), indented 2-4 spaces. **Max 2-3 very concise bullet points per role to save space.**
            Example (concise):
              * Led MERN stack app development (5+ projects); improved API speed by 40%.
              * Mentored 3 interns, ensuring code quality and best practices.
              * Key Tech: React, Node.js, MongoDB, Express, GenAI (OpenAI API / Gemini API).
        *   Quantify achievements briefly. Specify component types/functionalities and impact concisely.
        *   One blank line separates each complete formatted experience entry.

    *   **Structure for each Education Entry (iterate \`RAW_EDUCATION_ENTRIES_DATA_FOR_LLM\`):**
        *   Object contains: \`institutionName\`, \`location\` (optional), \`dates\` (raw), \`degree\` (raw), \`description\` (raw, optional).
        *   Line 1: \`institutionName\`
        *   Line 2: \`degree\` (CONVERT TO ALL CAPS)
        *   Line 3: If \`location\`: \`location\` – *formatted dates*. If no \`location\`: *formatted dates*.
        *   Subsequent lines (Description, optional): **If included, must be extremely brief (e.g., GPA, key honors only if space permits).**
        *   One blank line separates each complete formatted education entry.

7.  **Projects Section (if \`RAW_PROJECT_ENTRIES_DATA_FOR_LLM\` exists):**
    *   Under "PROJECTS" heading.
    *   Iterate through \`RAW_PROJECT_ENTRIES_DATA_FOR_LLM\` array of objects. Each object contains: \`projectName\`, \`description\`, \`link\` (optional).
    *   **Structure for each Project Entry:**
        *   Line 1: \`projectName\` (IN ALL CAPS)
        *   Line 2 (Description): The \`description\` text. **Must be a single, concise sentence or two bullet points maximum.** Detail key contributions, technologies, and outcomes briefly.
        *   Line 3 (Link, if present and space allows): \`Link: {{link}}\`
        *   Ensure one blank line separates each complete formatted project entry. **Consider omitting projects if experience is extensive to meet one-page limit.**

8.  **Content Quality & Tone:**
    *   Professional, concise, strong action verbs. No bolding within content.
    *   Realistic, impactful, professional tone based on \`raw_careerGoals\` and \`raw_jobRoles\`.
    *   Weave relevant skills from \`raw_skills\` into summary and descriptions, but keep it brief.

**User Information (raw input for context - remember the one-page limit when processing):**
Full Name (raw): {{raw_fullName}}
Job Title for Header (raw): {{raw_jobTitleForHeader}}
Phone: {{raw_phoneNumber}}
Email: {{raw_email}}
Website: {{#if raw_website}}{{raw_website}}{{else}}Not provided{{/if}}
LinkedIn: {{#if raw_linkedinUrl}}{{raw_linkedinUrl}}{{else}}Not provided{{/if}}
GitHub: {{#if raw_githubUrl}}{{raw_githubUrl}}{{else}}Not provided{{/if}}
Summary (raw): {{{raw_summary}}}
Target Job Role(s) (context): {{{raw_jobRoles}}}
Skills (raw): {{{raw_skills}}}
Experience (raw): {{{raw_experience}}}
Education (raw): {{{raw_education}}}
Projects (raw): {{#if raw_projects}}{{{raw_projects}}}{{else}}Not provided{{/if}}
Career Goals (context): {{{raw_careerGoals}}}

Generate the complete resume as a single plain text string.
Pay EXTREME attention to the one-page A4 requirement and all formatting details, especially conciseness, ALL CAPS for specified fields, date formatting, bullet points, spacing, and section headings.
`,
});


const generateResumeFlow = ai.defineFlow(
  {
    name: 'generateResumeFlow',
    inputSchema: GenerateResumeInputSchema,
    outputSchema: GenerateResumeOutputSchema,
  },
  async (input) => {
    const parseMultiEntries = (text: string | undefined, fieldNames: string[]) => {
      if (!text || text.trim() === "") return [];
      return text.split('|||').map(entryStr => {
        const parts = entryStr.split(';').map(part => part.trim());
        const entryObj: Record<string, string> = {};

        let currentPartIndex = 0;
        for (let i = 0; i < fieldNames.length; i++) {
          if (currentPartIndex >= parts.length) {
            entryObj[fieldNames[i]] = '';
            continue;
          }
        
          if (fieldNames[i] === 'location' && parts[currentPartIndex] === '' && (i + 1 < fieldNames.length && fieldNames[i+1] === 'dates')) {
            // If location is empty and it's followed by dates, this handles cases like "Company;;Dates;Title;Desc"
            // Check if we have enough parts for all fields. If not, this empty part is indeed the location.
            // If we DO have enough parts, it means location was intentionally skipped by ";;".
            if (parts.length >= fieldNames.length) { 
                entryObj[fieldNames[i]] = ''; // Correctly assign empty to location
            } else { // Not enough parts, so this empty string isn't location, it's just missing.
                 entryObj[fieldNames[i]] = ''; // Assign empty, but skip advancing part index
                 // The next field will try to pick up parts[currentPartIndex] again.
                 // This path should ideally not be hit if input format is "field1;field2_empty;;field4"
                 // but rather "field1;;field3;field4"
                 continue; // This might be problematic if a field truly IS empty and not just skipped by ";;"
            }
          }
          
          entryObj[fieldNames[i]] = parts[currentPartIndex] || '';
          currentPartIndex++;
        }
        
        // Ensure all fieldNames are keys in entryObj, even if they weren't in parts
        fieldNames.forEach(field => {
          if (!(field in entryObj)) {
            entryObj[field] = '';
          }
        });
        return entryObj;
      });
    };

    const experienceEntryFields = ['companyName', 'location', 'dates', 'jobTitle', 'description'];
    const experienceEntriesForLLM = parseMultiEntries(input.experience, experienceEntryFields);

    const educationEntryFields = ['institutionName', 'location', 'dates', 'degree', 'description'];
    const educationEntriesForLLM = parseMultiEntries(input.education, educationEntryFields);

    const projectEntryFields = ['projectName', 'description', 'link'];
    const projectEntriesForLLM = input.projects ? parseMultiEntries(input.projects, projectEntryFields) : [];


    let contactDetailsMultiline = `Phone: ${input.phoneNumber}\nEmail: ${input.email}`;
    if (input.website && input.website.trim() !== '') {
      contactDetailsMultiline += `\nWebsite: ${input.website}`;
    }
    if (input.linkedinUrl && input.linkedinUrl.trim() !== '') {
      contactDetailsMultiline += `\nLinkedIn: ${input.linkedinUrl}`;
    }
    if (input.githubUrl && input.githubUrl.trim() !== '') {
      contactDetailsMultiline += `\nGitHub: ${input.githubUrl}`;
    }


    const processedInputForPrompt = {
      RESUME_FULL_NAME_ALL_CAPS: input.fullName.toUpperCase(),
      RESUME_JOB_TITLE_HEADER_CASE: input.jobTitle,
      RESUME_CONTACT_DETAILS_MULTILINE: contactDetailsMultiline,
      RESUME_SUMMARY: input.summary,
      RESUME_SKILLS_CONTENT: input.skills, // The AI will categorize this based on instructions

      RAW_EXPERIENCE_ENTRIES_DATA_FOR_LLM: experienceEntriesForLLM,
      RAW_EDUCATION_ENTRIES_DATA_FOR_LLM: educationEntriesForLLM,
      RAW_PROJECT_ENTRIES_DATA_FOR_LLM: projectEntriesForLLM.length > 0 ? projectEntriesForLLM : undefined,


      raw_fullName: input.fullName,
      raw_jobTitleForHeader: input.jobTitle,
      raw_phoneNumber: input.phoneNumber,
      raw_email: input.email,
      raw_website: input.website && input.website.trim() !== '' ? input.website : undefined,
      raw_linkedinUrl: input.linkedinUrl && input.linkedinUrl.trim() !== '' ? input.linkedinUrl : undefined,
      raw_githubUrl: input.githubUrl && input.githubUrl.trim() !== '' ? input.githubUrl : undefined,
      raw_summary: input.summary,
      raw_jobRoles: input.jobRoles,
      raw_skills: input.skills, 
      raw_experience: input.experience, 
      raw_education: input.education,   
      raw_projects: input.projects && input.projects.trim() !== '' ? input.projects : undefined,
      raw_careerGoals: input.careerGoals,
    };

    const {output} = await prompt(processedInputForPrompt);
    if (!output || !output.resume) {
        // Fallback if LLM fails; this fallback may not adhere to one-page strictly
        return getDefaultFallbackResume(input, contactDetailsMultiline, projectEntriesForLLM);
    }
    return output;
  }
);

// This fallback resume might not be one page.
function getDefaultFallbackResume(input: GenerateResumeInput, contactDetails: string, projects: Array<any>): GenerateResumeOutput {
    let experienceFallback = "Failed to generate detailed experience. Raw input:\n";
    input.experience.split('|||').forEach(exp => {
        const parts = exp.split(';');
        experienceFallback += `  ${parts[0] || 'N/A Company'}\n`; 
        experienceFallback += `  ${(parts[3] || 'N/A Title').toUpperCase()}\n`;   
        experienceFallback += `  ${(parts[1] ? parts[1] + ' – ' : '') + (parts[2] || 'N/A Dates')}\n`; 
        experienceFallback += `    * ${parts[4] || 'N/A Description'}\n\n`; 
    });

    let educationFallback = "Failed to generate detailed education. Raw input:\n";
     input.education.split('|||').forEach(edu => {
        const parts = edu.split(';');
        educationFallback += `  ${parts[0] || 'N/A Institution'}\n`; 
        educationFallback += `  ${(parts[3] || 'N/A Degree').toUpperCase()}\n`;      
        educationFallback += `  ${(parts[1] ? parts[1] + ' – ' : '') + (parts[2] || 'N/A Dates')}\n`; 
        if (parts[4]) educationFallback += `    * ${parts[4]}\n`; 
        educationFallback += '\n';
    });

    let projectsFallback = "";
    if (projects && projects.length > 0) {
        projectsFallback = "PROJECTS\n";
        projects.forEach(proj => {
            projectsFallback += `${(proj.projectName || 'N/A Project').toUpperCase()}\n`;
            projectsFallback += `  ${proj.description || 'N/A Description'}\n`;
            if (proj.link) projectsFallback += `  Link: ${proj.link}\n`;
            projectsFallback += '\n';
        });
    }


    return {
        resume: `
${input.fullName.toUpperCase()}
${input.jobTitle}
${contactDetails}

PROFESSIONAL SUMMARY
${input.summary}

SKILLS
${input.skills}
(AI failed to categorize skills, please review and categorize manually if needed)

EXPERIENCE
${experienceFallback.trim()}

EDUCATION
${educationFallback.trim()}

${projectsFallback.trim()}

Error: AI failed to process the resume details as expected. This fallback may not be one page.
        `.trim(),
    };
}
