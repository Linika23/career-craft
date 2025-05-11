
"use client";

import type { FC } from 'react';
import { cn } from '@/lib/utils';

export interface ExperienceEntry {
  company: string;
  role: string; // Job Title for the specific role
  location: string;
  dates: string; // Duration for this role
  responsibilities: string[];
}

export interface EducationEntry {
  institution: string;
  degree: string; // Degree/Certificate
  dates: string; // Duration for this degree
  location?: string;
  gpa?: string;
  minor?: string;
  description?: string;
}

export interface DynamicFormattedResumeProps {
  fullName: string;
  jobTitle: string; // The overall title for the resume header
  phoneNumber: string;
  email: string;
  website?: string;
  summary: string;
  skills: string[];
  experience: ExperienceEntry[];
  education: EducationEntry[];
  targetJobRoles?: string[]; // Array of strings
  careerGoals?: string; // Paragraph or bullet list text
}

interface ResumeComponentProps {
  data: DynamicFormattedResumeProps;
}

export const DynamicFormattedResume: FC<ResumeComponentProps> = ({ data }) => {
  const {
    fullName,
    jobTitle,
    phoneNumber,
    email,
    website,
    summary,
    skills,
    experience,
    education,
    targetJobRoles,
    careerGoals,
  } = data;

  // Helper to render career goals which might be a paragraph or list
  const renderCareerGoals = (goals: string | undefined) => {
    if (!goals) return null;
    if (goals.includes('\n-') || goals.startsWith('-')) { // Basic check for bulleted list
      return (
        <ul className="list-disc list-inside ml-4">
          {goals.split('\n').map((goal, index) => (
            <li key={index}>{goal.replace(/^- ?/, '')}</li>
          ))}
        </ul>
      );
    }
    return <p>{goals}</p>;
  };


  return (
    <div className="max-w-3xl mx-auto p-6 bg-card text-card-foreground shadow-md font-sans">
      {/* Header */}
      <header className="text-center mb-6">
        <h1 className="text-3xl font-bold text-primary">{fullName || 'Your Name'}</h1>
        <p className="text-lg text-muted-foreground mb-1">{jobTitle || 'Your Job Title'}</p>
        <div className="text-sm text-foreground">
          <span>{phoneNumber}</span>
          {email && <span> | {email}</span>}
          {website && <span> | <a href={website.startsWith('http') ? website : `https://${website}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{website}</a></span>}
        </div>
      </header>

      {/* Summary */}
      {summary && (
        <section className="mt-6">
          <h2 className="text-xl font-bold underline mb-2 text-primary">Professional Summary</h2>
          <p className="text-foreground whitespace-pre-line">
            {summary}
          </p>
        </section>
      )}

      {/* Skills */}
      {skills && skills.length > 0 && (
        <section className="mt-6">
          <h2 className="text-xl font-bold underline mb-2 text-primary">Skills</h2>
          <ul className="list-disc list-inside text-foreground space-y-1 ml-4">
            {skills.map((skill, i) => (
              <li key={i}>{skill}</li>
            ))}
          </ul>
        </section>
      )}

      {/* Experience */}
      {experience && experience.length > 0 && (
        <section className="mt-6">
          <h2 className="text-xl font-bold underline mb-2 text-primary">Work Experience</h2>
          {experience.map((exp, i) => (
            <div key={i} className="mb-4">
              <div className="flex flex-col sm:flex-row justify-between items-start">
                <h3 className="text-lg font-semibold text-foreground">{exp.role} - {exp.company}</h3>
                <span className="text-sm text-muted-foreground whitespace-nowrap mt-1 sm:mt-0">{exp.dates}</span>
              </div>
              {exp.location && <p className="text-sm italic text-muted-foreground mb-1">{exp.location}</p>}
              {exp.responsibilities && exp.responsibilities.length > 0 && (
                <ul className="list-disc list-inside ml-4 text-foreground space-y-1">
                  {exp.responsibilities.map((item, j) => (
                    <li key={j}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </section>
      )}

      {/* Education */}
      {education && education.length > 0 && (
        <section className="mt-6">
          <h2 className="text-xl font-bold underline mb-2 text-primary">Education</h2>
          {education.map((edu, i) => (
            <div key={i} className="mb-3">
              <div className="flex flex-col sm:flex-row justify-between items-start">
                <h3 className="text-lg font-semibold text-foreground">{edu.degree} - {edu.institution}</h3>
                <span className="text-sm text-muted-foreground whitespace-nowrap mt-1 sm:mt-0">{edu.dates}</span>
              </div>
               {edu.location && <p className="text-sm italic text-muted-foreground">{edu.location}</p>}
              {(edu.gpa || edu.minor || edu.description) && (
                <div className="text-sm text-muted-foreground mt-1">
                  {edu.gpa && <p>GPA: {edu.gpa}</p>}
                  {edu.minor && <p>Minor: {edu.minor}</p>}
                  {edu.description && <p className="whitespace-pre-line">{edu.description}</p>}
                </div>
              )}
            </div>
          ))}
        </section>
      )}

      {/* Target Job Roles */}
      {targetJobRoles && targetJobRoles.length > 0 && (
        <section className="mt-6">
          <h2 className="text-xl font-bold underline mb-2 text-primary">Target Job Roles</h2>
          <ul className="list-disc list-inside ml-4 text-foreground space-y-1">
            {targetJobRoles.map((role, i) => (
              <li key={i}>{role}</li>
            ))}
          </ul>
        </section>
      )}

      {/* Career Goals */}
      {careerGoals && (
        <section className="mt-6">
          <h2 className="text-xl font-bold underline mb-2 text-primary">Career Goals</h2>
          <div className="text-foreground whitespace-pre-line">
             {renderCareerGoals(careerGoals)}
          </div>
        </section>
      )}
    </div>
  );
};
