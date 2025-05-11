
"use client";

import Link from 'next/link';
import { Briefcase, FileEdit, LayoutGrid, Eye, Download, Edit3, ListChecks, FileDown } from 'lucide-react';
import React, { useState, useEffect } from 'react';

const TYPING_PHRASES = [
  "Craft your resume...",
  "Get noticed...",
  "Get hired..."
];
const TYPING_SPEED = 100;
const DELETING_SPEED = 50;
const DELAY_BETWEEN_PHRASES = 2000;

const STEPS = [
  {
    icon: <Edit3 className="h-10 w-10 text-primary" />,
    title: "Step 1: Fill In Your Details",
    description: "Provide your professional information, skills, and experience."
  },
  {
    icon: <LayoutGrid className="h-10 w-10 text-primary" />,
    title: "Step 2: AI Crafts Your Documents",
    description: "Our AI generates a professional resume and cover letter for you."
  },
  {
    icon: <ListChecks className="h-10 w-10 text-primary" />,
    title: "Step 3: Review & Refine",
    description: "Check the ATS score, get improvement tips, and make edits."
  },
  {
    icon: <FileDown className="h-10 w-10 text-primary" />,
    title: "Step 4: Download Resume",
    description: "Download your polished resume in PDF or TXT format."
  }
];

export default function HomePage() {
  const [currentYear, setCurrentYear] = React.useState<string | number>('...');
  const [displayedText, setDisplayedText] = useState("");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [charIndex, setCharIndex] = useState(0);
  const [activeParticles, setActiveParticles] = React.useState<Array<{id: number, x: string, y: string, duration: string, delay: string}>>([]);


  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    const currentPhrase = TYPING_PHRASES[phraseIndex];

    if (isDeleting) {
      if (charIndex > 0) {
        timer = setTimeout(() => {
          setDisplayedText(currentPhrase.substring(0, charIndex - 1));
          setCharIndex(charIndex - 1);
        }, DELETING_SPEED);
      } else {
        setIsDeleting(false);
        setPhraseIndex((prevIndex) => (prevIndex + 1) % TYPING_PHRASES.length);
      }
    } else {
      if (charIndex < currentPhrase.length) {
        timer = setTimeout(() => {
          setDisplayedText(currentPhrase.substring(0, charIndex + 1));
          setCharIndex(charIndex + 1);
        }, TYPING_SPEED);
      } else {
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, DELAY_BETWEEN_PHRASES);
      }
    }

    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, phraseIndex]);

  React.useEffect(() => {
    const generateParticles = () => {
      const newParticles = Array.from({ length: 30 }).map((_, i) => ({ // Increased particle count for homepage
        id: i,
        x: `${Math.random() * 100}%`,
        y: `${Math.random() * 100}%`,
        duration: `${Math.random() * 8 + 7}s`, // Slower, more subtle movement
        delay: `${Math.random() * 10}s`,     
      }));
      setActiveParticles(newParticles);
    };
    generateParticles();
    const interval = setInterval(generateParticles, 15000); // Refresh less often
    return () => clearInterval(interval);
  }, []);


  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Particle Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {activeParticles.map(p => (
          <div
            key={p.id}
            className="absolute rounded-full bg-primary/20 dark:bg-primary/10 animate-float" // Adjusted opacity
            style={{
              width: `${Math.random() * 2 + 1}px`, // Smaller particles
              height: `${Math.random() * 2 + 1}px`,
              left: p.x,
              top: p.y,
              animationDuration: p.duration,
              animationDelay: p.delay,
              opacity: Math.random() * 0.3 + 0.1, // More subtle opacity
            }}
          />
        ))}
      </div>

      <main className="flex-grow flex flex-col items-center justify-center text-center p-6 sm:p-8 md:p-12 relative z-10">
        <div className="flex items-center gap-4 mb-8">
          <Briefcase className="h-12 w-12 sm:h-16 sm:w-16 text-primary" />
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-primary mb-4 animate-fadeInUp">
          Welcome to Career Craft
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-xl md:max-w-2xl animate-fadeInUp animation-delay-200 h-14 sm:h-7">
          <span className="typing-cursor">{displayedText}</span>
        </p>
        <Link href="/build-resume" passHref>
          <button
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-8 sm:py-4 sm:px-10 rounded-lg text-lg sm:text-xl shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background animate-fadeInUp animation-delay-400"
            aria-label="Build Your Resume"
          >
            Build Your Resume
          </button>
        </Link>

        {/* How It Works Section */}
        <section className="mt-16 sm:mt-24 w-full max-w-5xl animate-fadeInUp animation-delay-600">
          <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-10 sm:mb-12">How It Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {STEPS.map((step, index) => (
              <div
                key={index}
                className="bg-card p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95 flex flex-col items-center text-center"
              >
                <div className="bg-primary/10 p-4 rounded-full mb-4">
                  {step.icon}
                </div>
                <h3 className="text-xl font-semibold text-card-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="w-full text-center py-8 bg-[#1E1B4B] relative z-10">
        <p className="text-sm text-[#E0E7FF]">
          &copy; {currentYear} Career Craft. All rights reserved.
        </p>
      </footer>
      <style jsx global>{`
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
          opacity: 0;
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animation-delay-200 { animation-delay: 0.2s; }
        .animation-delay-400 { animation-delay: 0.4s; }
        .animation-delay-600 { animation-delay: 0.6s; }

        .typing-cursor::after {
          content: '|';
          animation: blink 1s step-end infinite;
        }

        @keyframes blink {
          from, to { color: transparent; }
          50% { color: hsl(var(--foreground)); }
        }

        @keyframes float {
          0% { transform: translateY(0px) translateX(0px) rotate(0deg); }
          25% { transform: translateY(-10px) translateX(8px) rotate(3deg); }
          50% { transform: translateY(0px) translateX(-10px) rotate(-2deg); }
          75% { transform: translateY(10px) translateX(8px) rotate(4deg); }
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

