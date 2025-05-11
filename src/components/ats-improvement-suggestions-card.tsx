"use client";

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Lightbulb, ListChecks } from 'lucide-react';

interface AtsImprovementSuggestionsCardProps {
  suggestions: string[];
}

export function AtsImprovementSuggestionsCard({ suggestions }: AtsImprovementSuggestionsCardProps) {
  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <Card className="w-full shadow-xl bg-card border-primary/50">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Lightbulb className="h-7 w-7 text-primary" />
          <CardTitle className="text-2xl font-semibold text-primary">Improvement Suggestions</CardTitle>
        </div>
        <CardDescription>
          Here are some AI-powered suggestions to further enhance your resume's ATS compatibility and impact:
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {suggestions.length === 1 && suggestions[0].startsWith("Could not generate") ? (
          <p className="text-sm text-muted-foreground">{suggestions[0]}</p>
        ) : (
          <ul className="list-none space-y-2">
            {suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-foreground">
                <ListChecks className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" />
                <span>{suggestion.startsWith('* ') ? suggestion.substring(2) : suggestion}</span>
              </li>
            ))}
          </ul>
        )}
         <div className="text-xs text-muted-foreground pt-3 border-t mt-4">
            <p><strong>Tip:</strong> Implement these suggestions and re-evaluate your resume. Tailoring for each specific job application is key!</p>
        </div>
      </CardContent>
    </Card>
  );
}
