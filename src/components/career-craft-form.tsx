
"use client";

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CareerCraftFormSchema, type CareerCraftFormData } from '@/lib/schema';
import { handleGenerateResumeAction, handleGenerateCoverLetterAction, type GenerateResumeWithAtsOutput } from '@/lib/actions'; // Updated import
import type { GenerateCoverLetterOutput } from '@/ai/flows/cover-letter-generation';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, FileText, Mail, User, Briefcase, Phone, AtSign, LinkIcon, ScrollText, GraduationCap, Goal, Info, Brain, Package, Linkedin, Github } from 'lucide-react';

interface CareerCraftFormProps {
  onResumeGenerated: (data: GenerateResumeWithAtsOutput) => void; // Updated type
  onCoverLetterGenerated: (data: GenerateCoverLetterOutput) => void;
}

export function CareerCraftForm({ onResumeGenerated, onCoverLetterGenerated }: CareerCraftFormProps) {
  const [isGeneratingResume, setIsGeneratingResume] = React.useState(false);
  const [isGeneratingCoverLetter, setIsGeneratingCoverLetter] = React.useState(false);
  const { toast } = useToast();

  const form = useForm<CareerCraftFormData>({
    resolver: zodResolver(CareerCraftFormSchema),
    defaultValues: {
      fullName: '',
      jobTitle: '',
      phoneNumber: '',
      email: '',
      website: '',
      linkedinUrl: '',
      githubUrl: '',
      summary: '',
      jobRoles: '',
      skills: '',
      experience: '',
      education: '',
      projects: '',
      careerGoals: '',
    },
  });

  const isAnyLoading = isGeneratingResume || isGeneratingCoverLetter;

  async function onSubmitResume(values: CareerCraftFormData) {
    setIsGeneratingResume(true);
    const payload = { 
        ...values, 
        website: values.website || undefined, 
        linkedinUrl: values.linkedinUrl || undefined,
        githubUrl: values.githubUrl || undefined,
        projects: values.projects || undefined 
    };
    toast({ title: 'Generating Resume & ATS Score...', description: 'This might take a moment. Please wait.', className: 'bg-blue-500 text-white' });
    const result = await handleGenerateResumeAction(payload);
    setIsGeneratingResume(false);
    if (result.success && result.data) {
      onResumeGenerated(result.data);
      toast({ title: 'Resume & ATS Score Generated!', description: 'Your resume and ATS analysis are ready.', className: 'bg-green-500 text-white' });
    } else {
      toast({ variant: 'destructive', title: 'Error Generating Resume/ATS Score', description: result.error });
    }
  }

  async function onSubmitCoverLetter(values: CareerCraftFormData) {
    setIsGeneratingCoverLetter(true);
    const payload = { 
        ...values, 
        website: values.website || undefined,
        linkedinUrl: values.linkedinUrl || undefined,
        githubUrl: values.githubUrl || undefined,
        projects: values.projects || undefined 
    };
    toast({ title: 'Generating Cover Letter...', description: 'Please wait.', className: 'bg-blue-500 text-white' });
    const result = await handleGenerateCoverLetterAction(payload);
    setIsGeneratingCoverLetter(false);
    if (result.success && result.data) {
      onCoverLetterGenerated(result.data);
      toast({ title: 'Cover Letter Generated!', description: 'Your cover letter has been successfully created.', className: 'bg-green-500 text-white' });
    } else {
      toast({ variant: 'destructive', title: 'Error Generating Cover Letter', description: result.error });
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl bg-card">
      <Form {...form}>
        <form className="space-y-6">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center text-primary">Craft Your Future</CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              Fill in your professional details for resume & cover letter generation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold flex items-center gap-2"><User />Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Michelle Hloom" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="jobTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold flex items-center gap-2"><Briefcase />Your Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Graphic Designer" {...field} />
                    </FormControl>
                    <FormDescription>The title to display under your name.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold flex items-center gap-2"><Phone />Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., (123) 456 78 99" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold flex items-center gap-2"><AtSign />Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="e.g., info@hloom.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold flex items-center gap-2"><LinkIcon />Website/Portfolio (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., www.yourportfolio.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="linkedinUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold flex items-center gap-2"><Linkedin />LinkedIn Profile URL (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., https://linkedin.com/in/yourprofile" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="githubUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold flex items-center gap-2"><Github />GitHub Profile URL (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., https://github.com/yourusername" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="summary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold flex items-center gap-2"><ScrollText />Professional Summary</FormLabel>
                  <FormControl>
                    <Textarea placeholder="A brief overview of your career, skills, and objectives." {...field} rows={4} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="skills"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold flex items-center gap-2"><Brain />Your Skills</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., JavaScript, React, Agile Methodologies, Team Leadership, SEO/SEM. List your key technical and soft skills." {...field} rows={4} />
                  </FormControl>
                  <FormDescription>Provide as a comma-separated list or a descriptive paragraph. Categorize if possible (e.g., Frontend: ..., Backend: ...).</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="experience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold flex items-center gap-2"><Briefcase />Work Experience</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Company Name; Location (City, ST or Remote, leave empty if none); Dates (e.g., Jan 2022 – Present); Job Title; Description..." {...field} rows={6} />
                  </FormControl>
                  <FormDescription>
                    For each role: Company Name; Location; Dates; Job Title; Description.
                    Separate multiple roles with "|||" (three pipe characters). Leave Location empty if not applicable (e.g., Company Name;;Dates;...).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="education"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold flex items-center gap-2"><GraduationCap />Education</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Institution Name; Location (City, ST, leave empty if none); Dates (e.g., 2005-2011); Degree/Certificate; Description (optional)..." {...field} rows={4}/>
                  </FormControl>
                  <FormDescription>
                    For each entry: Institution; Location; Dates; Degree/Certificate; Description (optional).
                    Separate multiple entries with "|||". Leave Location empty if not applicable.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="projects"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold flex items-center gap-2"><Package />Projects (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Project Name; Description (include tech stack, your role, impact); Link (e.g., GitHub, live demo)..." {...field} rows={5}/>
                  </FormControl>
                  <FormDescription>
                    For each project: Project Name; Description; Link (optional).
                    Separate multiple projects with "|||". Be detailed.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="jobRoles"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold flex items-center gap-2"><Info />Target Job Role(s) (for Cover Letter)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Senior Software Developer, Marketing Lead" {...field} />
                  </FormControl>
                  <FormDescription>Specify job titles you're applying for (mainly for cover letter context).</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="careerGoals"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold flex items-center gap-2"><Goal />Career Goals (for Cover Letter)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Outline your short-term and long-term career aspirations." {...field} rows={3} />
                  </FormControl>
                  <FormDescription>Share your ambitions (mainly for cover letter context).</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Button 
                type="button" 
                onClick={form.handleSubmit(onSubmitResume)} 
                className="w-full transform hover:scale-105 active:scale-95 transition-transform duration-200"
                disabled={isAnyLoading}
              >
                {isGeneratingResume ? <Loader2 className="animate-spin" /> : <FileText />}
                Generate Resume & ATS Score
              </Button>
              <Button 
                type="button" 
                onClick={form.handleSubmit(onSubmitCoverLetter)} 
                variant="secondary" 
                className="w-full transform hover:scale-105 active:scale-95 transition-transform duration-200"
                disabled={isAnyLoading}
              >
                {isGeneratingCoverLetter ? <Loader2 className="animate-spin" /> : <Mail />}
                Generate Cover Letter
              </Button>
            </div>
          </CardContent>
        </form>
      </Form>
    </Card>
  );
}
