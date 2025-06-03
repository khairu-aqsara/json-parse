
"use client";

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const API_KEY_STORAGE_KEY = 'gemini_api_key';

interface ApiKeySettingsDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function ApiKeySettingsDialog({ isOpen, onOpenChange }: ApiKeySettingsDialogProps) {
  const [apiKey, setApiKey] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      const storedKey = localStorage.getItem(API_KEY_STORAGE_KEY);
      if (storedKey) {
        setApiKey(storedKey);
      }
    }
  }, [isOpen]);

  const handleSave = () => {
    if (apiKey.trim()) {
      localStorage.setItem(API_KEY_STORAGE_KEY, apiKey.trim());
      toast({ title: 'Success', description: 'API Key saved successfully.' });
    } else {
      localStorage.removeItem(API_KEY_STORAGE_KEY);
      toast({ title: 'API Key Cleared', description: 'API Key has been removed.' });
    }
    onOpenChange(false);
  };

  const handleClear = () => {
    setApiKey('');
    localStorage.removeItem(API_KEY_STORAGE_KEY);
    toast({ title: 'API Key Cleared', description: 'API Key has been removed.' });
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Gemini API Key Settings</DialogTitle>
          <DialogDescription>
            Enter your Gemini API key to enable AI-powered analysis. Your key will be stored in your browser&apos;s local storage.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="apiKey" className="text-right">
              API Key
            </Label>
            <Input
              id="apiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="col-span-3"
              placeholder="Enter your Gemini API Key"
              type="password"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClear}>Clear Key</Button>
          <Button onClick={handleSave}>Save Key</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
