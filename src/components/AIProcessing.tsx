"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Code, Play, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { transcribeAudio } from "@/services/assemblyaiService";
import { generateSql } from "@/services/groqService";

interface AIProcessingProps {
  audioBlob?: Blob;
  textInput?: string;
  uploadedFile?: File;
  onSqlGenerated: (sql: string, naturalLanguage: string) => void;
  className?: string;
}

export default function AIProcessing({
  audioBlob,
  textInput,
  uploadedFile,
  onSqlGenerated,
  className,
}: AIProcessingProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedSql, setGeneratedSql] = useState<string | null>(null);
  const [naturalLanguageQuery, setNaturalLanguageQuery] = useState<
    string | null
  >(null);
  const [tableSchema, setTableSchema] = useState<string | null>(null);

  const processInput = async () => {
    // Reset states
    setError(null);
    setIsProcessing(true);

    try {
      let query = "";
      let schema = tableSchema;

      // Process audio input if available
      if (audioBlob) {
        try {
          // Import the AssemblyAI service directly to ensure we're using the real service
          const assemblyAIService = await import(
            "@/services/assemblyaiService"
          );
          query = await assemblyAIService.transcribeAudio(audioBlob);
          if (!query) {
            throw new Error("Could not transcribe audio. Please try again.");
          }
          setNaturalLanguageQuery(query);
        } catch (err) {
          // Handle specific AssemblyAI API errors
          if (err instanceof Error) {
            if (err.message.includes("AssemblyAI API key not found")) {
              throw new Error(
                "AssemblyAI API key is missing. Please check your environment variables.",
              );
            } else if (err.message.includes("AssemblyAI upload error")) {
              throw new Error(
                "Failed to upload audio to AssemblyAI. Please try again with a different audio file.",
              );
            } else if (err.message.includes("AssemblyAI transcription error")) {
              throw new Error(
                "Failed to transcribe audio. The audio might be too noisy or in an unsupported format.",
              );
            } else if (err.message.includes("AssemblyAI polling error")) {
              throw new Error(
                "Failed to retrieve transcription results. Please try again later.",
              );
            } else if (
              err.message.includes("AssemblyAI transcription failed")
            ) {
              throw new Error(
                "Transcription failed. The audio might be too long or in an unsupported format.",
              );
            } else {
              throw new Error(`Audio transcription error: ${err.message}`);
            }
          } else {
            throw new Error("Failed to transcribe audio. Please try again.");
          }
        }
      } else if (textInput) {
        // Use text input directly
        query = textInput;
        setNaturalLanguageQuery(query);
      } else {
        throw new Error("No input provided");
      }

      // Generate SQL from the query using the schema if available
      const result = await generateSql(query, schema || undefined);
      setGeneratedSql(result.sql);

      // Don't automatically execute the query, wait for user confirmation

      // Pass the generated SQL and natural language to the parent component
      // but don't automatically execute it
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const hasInput = Boolean(audioBlob || textInput);

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-medium">AI Processing</h3>
        <p className="text-sm text-muted-foreground">
          Convert your input to SQL using OpenAI
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {uploadedFile && (
        <div className="bg-muted/30 p-3 rounded-lg">
          <p className="text-sm text-muted-foreground">
            Using table from:{" "}
            <span className="font-medium">{uploadedFile.name}</span>
          </p>
        </div>
      )}

      {naturalLanguageQuery && generatedSql && !isProcessing ? (
        <div className="flex flex-col gap-3 bg-muted/30 p-4 rounded-lg">
          <div>
            <h4 className="text-sm font-medium">Natural Language Query:</h4>
            <p className="text-sm mt-1 bg-background p-2 rounded border">
              {naturalLanguageQuery}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium">Generated SQL:</h4>
            <pre className="text-xs font-mono bg-background p-2 rounded border overflow-x-auto mt-1">
              {generatedSql}
            </pre>
          </div>
        </div>
      ) : (
        <div className="flex justify-center">
          <Button
            onClick={processInput}
            disabled={!hasInput || isProcessing}
            className="flex items-center gap-2"
          >
            {isProcessing ? (
              <>
                <div className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                Processing...
              </>
            ) : (
              <>
                <Code size={16} />
                Generate SQL
              </>
            )}
          </Button>
        </div>
      )}

      {naturalLanguageQuery && generatedSql && !isProcessing && (
        <div className="flex justify-end">
          <Button
            onClick={() => onSqlGenerated(generatedSql, naturalLanguageQuery)}
            className="flex items-center gap-2"
          >
            <Play size={16} />
            Execute Query
          </Button>
        </div>
      )}
    </div>
  );
}
