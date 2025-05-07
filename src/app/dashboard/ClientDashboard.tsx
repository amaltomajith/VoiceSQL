"use client";

import { useState } from "react";
import FileUpload from "@/components/query/FileUpload";
import TextInput from "@/components/query/TextInput";
import VoiceInput from "@/components/query/VoiceInput";
import AIProcessing from "@/components/query/AIProcessing";
import ResultsDisplay from "@/components/query/ResultsDisplay";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function ClientDashboard() {
  // State for query flow
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [textInput, setTextInput] = useState<string | null>(null);
  const [generatedSql, setGeneratedSql] = useState<string | null>(null);
  const [naturalLanguageQuery, setNaturalLanguageQuery] = useState<
    string | null
  >(null);
  const [showResults, setShowResults] = useState(false);

  // Handlers for components
  const handleFileUploaded = (file: File) => {
    setUploadedFile(file);
  };

  const handleAudioCaptured = (blob: Blob) => {
    setAudioBlob(blob);
    setTextInput(null); // Clear text input when audio is captured
  };

  const handleTextSubmit = (text: string) => {
    setTextInput(text);
    setAudioBlob(null); // Clear audio input when text is submitted
  };

  const handleSqlGenerated = (sql: string, query: string) => {
    setGeneratedSql(sql);
    setNaturalLanguageQuery(query);
    setShowResults(true);
  };

  const handleReset = () => {
    setGeneratedSql(null);
    setNaturalLanguageQuery(null);
    setShowResults(false);
  };

  return (
    <section className="bg-card rounded-xl p-6 border shadow-sm">
      <h2 className="font-semibold text-xl mb-6">Voice-to-SQL Query</h2>

      {!showResults ? (
        <div className="flex flex-col gap-8">
          <FileUpload onFileUploaded={handleFileUploaded} />

          <Tabs defaultValue="voice" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="voice">Voice Input</TabsTrigger>
              <TabsTrigger value="text">Text Input</TabsTrigger>
            </TabsList>
            <TabsContent value="voice">
              <VoiceInput onAudioCaptured={handleAudioCaptured} />
            </TabsContent>
            <TabsContent value="text">
              <TextInput onTextSubmit={handleTextSubmit} />
            </TabsContent>
          </Tabs>

          <AIProcessing
            audioBlob={audioBlob || undefined}
            textInput={textInput || undefined}
            uploadedFile={uploadedFile || undefined}
            onSqlGenerated={handleSqlGenerated}
          />

          <div className="mt-4 flex justify-center">
            <Link href="/transcription">
              <Button variant="outline" className="flex items-center gap-2">
                Try Voice Transcription Preview
                <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <ResultsDisplay
          sql={generatedSql || ""}
          naturalLanguageQuery={naturalLanguageQuery || ""}
          onReset={handleReset}
        />
      )}
    </section>
  );
}
