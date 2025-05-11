import { config } from 'dotenv';
config();

import '@/ai/flows/resume-generation.ts';
import '@/ai/flows/cover-letter-generation.ts';
import '@/ai/flows/ats-score-flow.ts';
import '@/ai/flows/ats-improvement-flow.ts';
