
"use client";

import * as React from 'react';
import Link from 'next/link';
import { CareerCraftForm } from '@/components/career-craft-form';
import { GeneratedDocument } from '@/components/generated-document';
import type { GenerateResumeWithAtsOutput } from '@/lib/actions';
import type { GenerateCoverLetterOutput } from '@/ai/flows/cover-letter-generation';
import { AtsScoreCard } from '@/components/ats-score-card';
import { AtsImprovementSuggestionsCard } from '@/components/ats-improvement-suggestions-card';
import { ThemeToggleButton } from '@/components/theme-toggle-button';
import { Briefcase, FileText, Mail, Sparkles, Home } from 'lucide-react';
import type { DynamicFormattedResumeProps } from '@/components/dynamic-formatted-resume';


interface ExtendedGenerateResumeWithAtsOutput extends GenerateResumeWithAtsOutput {
  resumeData?: DynamicFormattedResumeProps; 
}

export default function BuildResumePage() {
  const [generatedContent, setGeneratedContent] = React.useState<{
    resume?: ExtendedGenerateResumeWithAtsOutput | null;
    coverLetter?: GenerateCoverLetterOutput | null;
  }>({ resume: null, coverLetter: null });

  const [currentYear, setCurrentYear] = React.useState<string | number>('...');
  const [activeParticles, setActiveParticles] = React.useState<Array<{id: number, x: string, y: string, duration: string, delay: string}>>([]);

  React.useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  React.useEffect(() => {
    const generateParticles = () => {
      const newParticles = Array.from({ length: 20 }).map((_, i) => ({
        id: i,
        x: `${Math.random() * 100}%`,
        y: `${Math.random() * 100}%`,
        duration: `${Math.random() * 5 + 5}s`, 
        delay: `${Math.random() * 5}s`,     
      }));
      setActiveParticles(newParticles);
    };
    generateParticles();
    const interval = setInterval(generateParticles, 10000); 
    return () => clearInterval(interval);
  }, []);


  
  const handleResumeGenerated = (data: GenerateResumeWithAtsOutput) => {
    setGeneratedContent({ 
      resume: {
        ...data,
        resumeData: data.resumeData 
      }, 
      coverLetter: null 
    });
  };


  const handleCoverLetterGenerated = (data: GenerateCoverLetterOutput) => {
    setGeneratedContent({ resume: null, coverLetter: data });
  };

  return (
    <div className="bg-background min-h-screen relative overflow-hidden">
      {/* Particle Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {activeParticles.map(p => (
          <div
            key={p.id}
            className="absolute rounded-full bg-primary/30 dark:bg-primary/20 animate-float"
            style={{
              width: `${Math.random() * 3 + 1}px`, 
              height: `${Math.random() * 3 + 1}px`,
              left: p.x,
              top: p.y,
              animationDuration: p.duration,
              animationDelay: p.delay,
              opacity: Math.random() * 0.5 + 0.2,
            }}
          />
        ))}
      </div>

      <div className="absolute top-4 left-4 z-50">
        <Link href="/" passHref>
          <button
            aria-label="Go to Home Page"
            className="p-2 rounded-md hover:bg-accent hover:text-accent-foreground transform hover:scale-105 active:scale-95 transition-all duration-200"
          >
            <Home className="h-6 w-6 text-primary" />
          </button>
        </Link>
      </div>
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggleButton />
      </div>

      <main className="container mx-auto py-12 px-4 flex flex-col items-center space-y-10 sm:space-y-16 relative z-10">
        <header className="text-center space-y-4 max-w-3xl">
          <div className="flex justify-center items-center gap-3">
            <Briefcase className="h-10 w-10 sm:h-12 sm:w-12 text-primary" />
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-primary">
              Career Craft
            </h1>
            <Sparkles className="h-8 w-8 sm:h-10 sm:w-10 text-secondary" />
          </div>
          <p className="text-lg sm:text-xl text-muted-foreground">
            Empower your job search. Generate professional resumes, cover letters, and analyze your resume with our AI-powered ATS scanner.
          </p>
        </header>

        <CareerCraftForm
          onResumeGenerated={handleResumeGenerated}
          onCoverLetterGenerated={handleCoverLetterGenerated}
        />

        <div className="w-full max-w-4xl space-y-12">
          {generatedContent.resume && (
            <>
              <section id="resume-output" className="animate-fadeIn">
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
                  <h2 className="text-2xl sm:text-3xl font-semibold">Generated Resume</h2>
                </div>
                <GeneratedDocument
                  title="AI-Generated Resume"
                  content={generatedContent.resume.resume} 
                  resumeData={generatedContent.resume.resumeData} 
                  fileNamePrefix="AI_Resume"
                />
              </section>
              {typeof generatedContent.resume.atsScore === 'number' && (
                 <section id="ats-score-output" className="animate-fadeIn mt-8">
                    <AtsScoreCard
                        score={generatedContent.resume.atsScore}
                        feedback={generatedContent.resume.atsFeedback}
                    />
                 </section>
              )}
              {generatedContent.resume.atsImprovementSuggestions && generatedContent.resume.atsImprovementSuggestions.length > 0 && (
                 <section id="ats-improvement-output" className="animate-fadeIn mt-8">
                    <AtsImprovementSuggestionsCard
                        suggestions={generatedContent.resume.atsImprovementSuggestions}
                    />
                 </section>
              )}
            </>
          )}

          {generatedContent.coverLetter && (
            <section id="cover-letter-output" className="animate-fadeIn">
              <div className="flex items-center gap-3 mb-4">
                <Mail className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
                <h2 className="text-2xl sm:text-3xl font-semibold">Generated Cover Letter</h2>
              </div>
              <GeneratedDocument
                title="AI-Generated Cover Letter"
                content={generatedContent.coverLetter.coverLetter}
                fileNamePrefix="AI_Cover_Letter"
              />
            </section>
          )}
        </div>

      </main>

      <footer className="w-full text-center py-6 mt-12 bg-[#1E1B4B] relative z-10">
        <p className="text-sm text-[#E0E7FF]">
          &copy; {currentYear} Career Craft. All rights reserved.
        </p>
      </footer>
      <style jsx global>{`
        .font-times-new-roman {
          font-family: 'Times New Roman', Times, serif;
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0% { transform: translateY(0px) translateX(0px) rotate(0deg); }
          25% { transform: translateY(-5px) translateX(5px) rotate(5deg); }
          50% { transform: translateY(0px) translateX(-5px) rotate(0deg); }
          75% { transform: translateY(5px) translateX(5px) rotate(-5deg); }
          100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
        }
        .animate-float {
          animation-name: float;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }
      `}</style>
    </div>
  );
}

