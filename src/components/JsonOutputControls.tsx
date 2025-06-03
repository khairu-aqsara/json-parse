
"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Copy, Sparkles, Loader2 } from 'lucide-react';

interface JsonOutputControlsProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onCopy: () => void;
  hasOutput: boolean;
  onAnalyze: () => void;
  isAnalyzing: boolean;
}

export function JsonOutputControls({ searchTerm, onSearchChange, onCopy, hasOutput, onAnalyze, isAnalyzing }: JsonOutputControlsProps) {
  return (
    <div className="flex items-center space-x-2 p-2 bg-card rounded-t-md border-b">
      <div className="relative flex-grow">
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search key or value..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8 pr-2 py-1 h-9 text-sm"
          aria-label="Search JSON"
        />
      </div>
      <Button variant="outline" size="sm" onClick={onAnalyze} disabled={!hasOutput || isAnalyzing} title="Analyze with AI">
        {isAnalyzing ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="mr-2 h-4 w-4" />
        )}
        Analyze
      </Button>
      <Button variant="outline" size="sm" onClick={onCopy} disabled={!hasOutput} title="Copy Formatted JSON">
        <Copy className="mr-2 h-4 w-4" />
        Copy
      </Button>
    </div>
  );
}
