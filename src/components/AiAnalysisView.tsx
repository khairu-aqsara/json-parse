
"use client";

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Info, BrainCircuit } from 'lucide-react'; // Added BrainCircuit for AI analysis

interface AiAnalysisViewProps {
  analysis: { schema: string; insights: string } | null; // Matches AnalyzeJsonOutput structure
  isLoading: boolean;
  error: string;
}

export function AiAnalysisView({ analysis, isLoading, error }: AiAnalysisViewProps) {
  if (isLoading) {
    return (
      <div className="mt-4 pt-4 border-t">
        <h3 className="text-lg font-semibold mb-3 text-primary flex items-center">
          <BrainCircuit className="mr-2 h-5 w-5 animate-pulse" />
          AI Analysis
        </h3>
        <div className="space-y-3">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-6 w-1/4 mt-2" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-4 pt-4 border-t">
         <h3 className="text-lg font-semibold mb-3 text-destructive flex items-center">
          <Terminal className="mr-2 h-5 w-5" />
          AI Analysis Error
        </h3>
        <Alert variant="destructive" className="bg-destructive/10 border-destructive/30 text-destructive">
          <Terminal className="h-4 w-4 !text-destructive" />
          <AlertTitle>Analysis Failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!analysis || !analysis.schema || !analysis.insights) { // Ensure analysis and its properties exist
    return null; 
  }

  return (
    <div className="mt-4 pt-4 border-t">
      <h3 className="text-lg font-semibold mb-3 text-primary flex items-center">
        <BrainCircuit className="mr-2 h-5 w-5" />
        AI-Powered Insights
      </h3>
      <div className="space-y-4">
        <div>
          <h4 className="font-medium text-card-foreground mb-1.5">Suggested Zod Schema:</h4>
          <div className="bg-muted p-3 rounded-md text-sm overflow-x-auto font-code text-muted-foreground max-h-60">
            <pre><code>{analysis.schema}</code></pre>
          </div>
        </div>
        <div>
          <h4 className="font-medium text-card-foreground mb-1.5">Data Insights:</h4>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted/50 p-3 rounded-md">{analysis.insights}</p>
        </div>
      </div>
    </div>
  );
}

    