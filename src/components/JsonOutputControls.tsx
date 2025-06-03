 "use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Copy } from 'lucide-react';

interface JsonOutputControlsProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onCopy: () => void;
  hasOutput: boolean;
}

export function JsonOutputControls({ searchTerm, onSearchChange, onCopy, hasOutput }: JsonOutputControlsProps) {
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
      <Button variant="outline" size="sm" onClick={onCopy} disabled={!hasOutput}>
        <Copy className="mr-2 h-4 w-4" />
        Copy Formatted
      </Button>
    </div>
  );
}
