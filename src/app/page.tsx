
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { JsonInputControls } from '@/components/JsonInputControls';
import { JsonOutputControls } from '@/components/JsonOutputControls';
import { JsonTreeView } from '@/components/JsonTreeView';
import { AiAnalysisView } from '@/components/AiAnalysisView';
import { ApiKeySettingsDialog } from '@/components/ApiKeySettingsDialog'; // Import new dialog
import { Card, CardContent } from '@/components/ui/card';
import { analyzeJsonData } from '@/ai/flows/analyze-json-flow';
import type { AnalyzeJsonInput, AnalyzeJsonOutput } from '@/ai/flows/analyze-json-flow';

const API_KEY_STORAGE_KEY = 'gemini_api_key';

export default function HomePage() {
  const [rawJson, setRawJson] = useState<string>('');
  const [parsedJson, setParsedJson] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set(['root']));
  
  const [aiAnalysis, setAiAnalysis] = useState<AnalyzeJsonOutput | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string>('');
  const [isApiKeyDialogOpen, setIsApiKeyDialogOpen] = useState<boolean>(false); // State for dialog

  const { toast } = useToast();

  useEffect(() => {
    if (rawJson.trim() === '') {
      setParsedJson(null);
      setError('');
      setExpandedPaths(new Set());
      setAiAnalysis(null); 
      setAiError('');     
      return;
    }
    try {
      const parsed = JSON.parse(rawJson);
      setParsedJson(parsed);
      setError('');
      setAiAnalysis(null); 
      setAiError('');     
      if (typeof parsed === 'object' && parsed !== null) {
        setExpandedPaths(new Set(['root']));
      } else {
        setExpandedPaths(new Set());
      }
    } catch (e: any) {
      setParsedJson(null);
      setError(`Error parsing JSON: ${e.message}`);
      setExpandedPaths(new Set());
      setAiAnalysis(null);
      setAiError('');
    }
  }, [rawJson]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setRawJson(text);
        toast({ title: "File Uploaded", description: `${file.name} loaded successfully.` });
      };
      reader.onerror = () => {
        toast({ variant: "destructive", title: "Error", description: "Failed to read file." });
      }
      reader.readAsText(file);
    }
  };

  const handleClearInput = () => {
    setRawJson('');
    setSearchTerm('');
  };

  const handleCopyFormatted = async () => {
    if (parsedJson) {
      try {
        const formatted = JSON.stringify(parsedJson, null, 2);
        await navigator.clipboard.writeText(formatted);
        toast({ title: "Success", description: "Formatted JSON copied to clipboard!" });
      } catch (err) {
        toast({ variant: "destructive", title: "Error", description: "Failed to copy JSON." });
      }
    } else {
      toast({ variant: "destructive", title: "Error", description: "No JSON to copy." });
    }
  };

  const toggleNode = useCallback((path: string) => {
    setExpandedPaths(prev => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });
  }, []);

  const handleAnalyzeJson = async () => {
    if (!parsedJson) {
      toast({ variant: "destructive", title: "No JSON", description: "Please provide valid JSON to analyze." });
      return;
    }
    if (rawJson.trim() === '') {
      toast({ variant: "destructive", title: "Empty Input", description: "Cannot analyze empty JSON." });
      return;
    }

    const storedApiKey = localStorage.getItem(API_KEY_STORAGE_KEY);
    if (!storedApiKey) {
      toast({ 
        variant: "destructive", 
        title: "API Key Missing", 
        description: "Please set your Gemini API Key in settings to use AI analysis." 
      });
      setIsApiKeyDialogOpen(true); // Open dialog if key is missing
      return;
    }

    setIsAnalyzing(true);
    setAiAnalysis(null);
    setAiError('');

    try {
      const input: AnalyzeJsonInput = { 
        jsonString: rawJson,
        apiKey: storedApiKey || undefined, // Pass the stored API key
      };
      const result = await analyzeJsonData(input);
      setAiAnalysis(result);
      toast({ title: "AI Analysis Complete", description: "Schema and insights generated." });
    } catch (e: any) {
      setAiError(e.message || "An unknown error occurred during AI analysis.");
      toast({ variant: "destructive", title: "AI Analysis Error", description: e.message || "Failed to analyze JSON." });
      if (e.message?.toLowerCase().includes('api key not valid')) {
         toast({ variant: "destructive", title: "Invalid API Key", description: "Please check your Gemini API Key in settings." });
         setIsApiKeyDialogOpen(true);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <>
      <div className="flex flex-col h-screen bg-background text-foreground p-4 font-body">
        <header className="mb-6 text-center">
          <h1 className="text-4xl font-headline font-bold text-primary tracking-tight">
            JSON Parser
          </h1>
          <p className="text-muted-foreground mt-1">
            Efficiently parse, view, and interact with your JSON data using a clean and intuitive interface. Now with AI-powered insights!
          </p>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 min-h-0">
          {/* Left Panel: Input */}
          <Card className="flex flex-col overflow-hidden shadow-lg">
            <JsonInputControls
              onFileUpload={handleFileUpload}
              onClear={handleClearInput}
              hasInput={rawJson.length > 0}
            />
            <CardContent className="p-0 flex-1 flex flex-col">
              <Textarea
                value={rawJson}
                onChange={(e) => setRawJson(e.target.value)}
                placeholder="Paste or upload your JSON here..."
                className="flex-1 resize-none font-code text-sm p-4 rounded-b-md border-0 focus:ring-0 focus-visible:ring-0 shadow-none h-full min-h-[200px]"
                aria-label="JSON Input"
              />
            </CardContent>
            {error && (
              <div className="p-2 text-sm text-destructive-foreground bg-destructive border-t">
                {error}
              </div>
            )}
          </Card>

          {/* Right Panel: Formatted Output & AI Analysis */}
          <Card className="flex flex-col overflow-hidden shadow-lg">
            <JsonOutputControls
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onCopy={handleCopyFormatted}
              hasOutput={!!parsedJson}
              onAnalyze={handleAnalyzeJson}
              isAnalyzing={isAnalyzing}
              onOpenApiKeyDialog={() => setIsApiKeyDialogOpen(true)} // Pass handler to open dialog
            />
            <CardContent className="p-4 flex-1 overflow-auto">
              <JsonTreeView
                data={parsedJson}
                searchTerm={searchTerm}
                expandedPaths={expandedPaths}
                toggleNode={toggleNode}
              />
              <AiAnalysisView
                analysis={aiAnalysis}
                isLoading={isAnalyzing}
                error={aiError}
              />
            </CardContent>
          </Card>
        </div>
      </div>
      <ApiKeySettingsDialog 
        isOpen={isApiKeyDialogOpen}
        onOpenChange={setIsApiKeyDialogOpen}
      />
    </>
  );
}
