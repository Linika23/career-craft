import { z } from 'zod';

export const CareerCraftFormSchema = z.object({
  fullName: z.string().min(3, { message: 'Full name must be at least 3 characters.' }).max(100, { message: 'Full name must be at most 100 characters.' }),
  jobTitle: z.string().min(3, { message: 'Job title must be at least 3 characters.' }).max(100, { message: 'Job title must be at most 100 characters.' }),
  phoneNumber: z.string().min(7, {message: 'Phone number seems too short.'}).max(20, {message: 'Phone number seems too long.'}),
  email: z.string().email({ message: 'Invalid email address.' }),
  website: z.string().url({ message: 'Invalid URL for website.' }).optional().or(z.literal('')),
  linkedinUrl: z.string().url({ message: 'Invalid URL for LinkedIn profile.' }).optional().or(z.literal('')),
  githubUrl: z.string().url({ message: 'Invalid URL for GitHub profile.' }).optional().or(z.literal('')),
  summary: z.string().min(20, {message: 'Summary should be at least 20 characters.'}).max(1000, {message: 'Summary must be at most 1000 characters.'}),
  
  skills: z.string().min(10, { message: 'Skills description must be at least 10 characters.' }).max(1000, { message: 'Skills description must be at most 1000 characters.' }),
  
  experience: z.string()
    .min(10, { message: 'Experience description must be at least 10 characters.' })
    .max(5000, { message: 'Experience description must be at most 5000 characters.' })
    .describe('For each role, provide: Company Name; Location (City, ST or Remote, leave empty if none); Dates (e.g., Jan 2022 – Present); Job Title; Description. Separate multiple roles with "|||" (three pipe characters).'),
  
  education: z.string()
    .min(10, { message: 'Education description must be at least 10 characters.' })
    .max(3000, { message: 'Education description must be at most 3000 characters.' })
    .describe('For each entry, provide: Institution Name; Location (City, ST, leave empty if none); Dates (e.g., 2005-2011); Degree/Certificate; Description (optional). Separate multiple entries with "|||" (three pipe characters).'),

  projects: z.string()
    .min(10, { message: 'Projects description must be at least 10 characters.' })
    .max(5000, { message: 'Projects description must be at most 5000 characters.' })
    .optional().or(z.literal(''))
    .describe('For each project: Project Name; Description (detail key contributions, technologies, and outcomes); Link (optional, e.g., GitHub, live demo). Separate multiple projects with "|||".'),

  jobRoles: z.string().min(3, { message: 'Target job roles must be at least 3 characters.' }).max(200, { message: 'Target job roles must be at most 200 characters.' }).optional().or(z.literal('')),
  careerGoals: z.string().min(10, { message: 'Career goals must be at least 10 characters.' }).max(1000, { message: 'Career goals must be at most 1000 characters.' }).optional().or(z.literal('')),
});

export type CareerCraftFormData = z.infer<typeof CareerCraftFormSchema>;
