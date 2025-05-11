"use client";

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScanSearch, CheckCircle, AlertTriangle, Info } from 'lucide-react';

interface AtsScoreCardProps {
  score: number;
  feedback: string;
}

export function AtsScoreCard({ score, feedback }: AtsScoreCardProps) {
  const getScoreColor = (s: number) => {
    if (s >= 85) return 'bg-green-500';
    if (s >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getScoreBadgeVariant = (s: number): "default" | "secondary" | "destructive" | "outline" => {
    if (s >= 85) return 'default'; // Typically primary color
    if (s >= 70) return 'secondary';
    return 'destructive';
  };
  
  const getScoreIcon = (s: number) => {
    if (s >= 85) return <CheckCircle className="h-5 w-5 text-green-500" />;
    if (s >= 70) return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    return <Info className="h-5 w-5 text-red-500" />;
  }

  const formattedFeedback = feedback.split('\\n').map(line => line.trim()).filter(line => line.startsWith('* ') || line.startsWith('- ')).map(line => line.substring(2));


  return (
    <Card className="w-full shadow-xl bg-card">
      <CardHeader>
        <div className="flex items-center gap-3">
          <ScanSearch className="h-7 w-7 text-primary" />
          <CardTitle className="text-2xl font-semibold text-primary">ATS Compatibility Score</CardTitle>
        </div>
        <CardDescription>
          This score estimates how well your resume might perform with Applicant Tracking Systems.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center space-y-3">
          <div className="relative w-32 h-32">
            <svg className="w-full h-full" viewBox="0 0 36 36">
              <path
                className="text-muted/30"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={score >= 85 ? "text-green-500" : score >=70 ? "text-yellow-500" : "text-red-500"}
                strokeWidth="3.5"
                strokeDasharray={`${score}, 100`}
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-foreground">{score}</span>
                <span className="text-xs text-muted-foreground">/ 100</span>
            </div>
          </div>
           <Badge variant={getScoreBadgeVariant(score)} className="text-sm px-3 py-1">
            {getScoreIcon(score)}
            <span className="ml-2">
              {score >= 85 ? 'Excellent' : score >= 70 ? 'Good' : 'Needs Improvement'}
            </span>
          </Badge>
        </div>
        
        <div>
            <h3 className="text-lg font-semibold mb-2 text-foreground">Key Feedback:</h3>
            {formattedFeedback.length > 0 ? (
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                {formattedFeedback.map((item, index) => (
                    <li key={index}>{item}</li>
                ))}
                </ul>
            ) : (
                <p className="text-sm text-muted-foreground">No specific feedback points provided by the AI.</p>
            )}
        </div>
        <div className="text-xs text-muted-foreground pt-2 border-t mt-4">
            <p><strong>Note:</strong> ATS scores are estimates. Always tailor your resume to the specific job description and company.</p>
        </div>
      </CardContent>
    </Card>
  );
}
