 "use client";

import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { UploadCloud, Trash2 } from 'lucide-react';

interface JsonInputControlsProps {
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
  hasInput: boolean;
}

export function JsonInputControls({ onFileUpload, onClear, hasInput }: JsonInputControlsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex items-center space-x-2 p-2 bg-card rounded-t-md border-b">
      <Button variant="outline" size="sm" onClick={handleUploadClick}>
        <UploadCloud className="mr-2 h-4 w-4" />
        Upload JSON
      </Button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileUpload}
        accept=".json"
        className="hidden"
        aria-label="Upload JSON file"
      />
      <Button variant="outline" size="sm" onClick={onClear} disabled={!hasInput}>
        <Trash2 className="mr-2 h-4 w-4" />
        Clear
      </Button>
    </div>
  );
}
