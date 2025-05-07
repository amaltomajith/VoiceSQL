"use client";

import { useState } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import VoiceInput from "@/components/query/VoiceInput";
import TextInput from "@/components/query/TextInput";
import FileUpload from "@/components/query/FileUpload";
import AIProcessing from "@/components/query/AIProcessing";
import ResultsDisplay from "@/components/query/ResultsDisplay";
import { InfoIcon, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function QueryPage() {
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [textInput, setTextInput] = useState<string | null>(null);
  const [dataFile, setDataFile] = useState<File | null>(null);
  const [sql, setSql] = useState<string | null>(null);
  const [naturalLanguageQuery, setNaturalLanguageQuery] = useState<
    string | null
  >(null);
  const [showResults, setShowResults] = useState(false);
  const [activeTab, setActiveTab] = useState("voice");

  const handleAudioCaptured = (blob: Blob) => {
    setAudioBlob(blob);
    setTextInput(null); // Clear text input when audio is captured
  };

  const handleTextSubmit = (text: string) => {
    setTextInput(text);
    setAudioBlob(null); // Clear audio input when text is submitted
  };

  const handleFileUploaded = (file: File) => {
    setDataFile(file);
  };

  const handleSqlGenerated = (generatedSql: string, query: string) => {
    setSql(generatedSql);
    setNaturalLanguageQuery(query);
    setShowResults(true);
  };

  const handleReset = () => {
    setShowResults(false);
    setSql(null);
    setNaturalLanguageQuery(null);
  };

  return (
    <>
      <div className="container">
        <Navbar />
        <main>
          {/* Header Section */}
          <header style={{ marginTop: "40px" }}>
            <h1 style={{ fontSize: "40px", fontWeight: 600 }}>
              Voice-to-SQL Query
            </h1>
            <div
              style={{
                background: "#262626",
                padding: "15px",
                borderRadius: "6px",
                marginTop: "20px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <InfoIcon size="18" color="#ff004f" />
              <span>
                Upload a data file, then use voice or text to query your data
              </span>
            </div>
          </header>

          {!showResults ? (
            <div style={{ marginTop: "40px" }}>
              {/* Data Upload Section */}
              <div className="card">
                <FileUpload onFileUploaded={handleFileUploaded} />

                {dataFile && (
                  <div style={{ marginTop: "40px" }}>
                    <h3 style={{ fontSize: "24px", marginBottom: "20px" }}>
                      Input Method
                    </h3>
                    <div className="tab-titles">
                      <button
                        className={`tab-links ${activeTab === "voice" ? "active-link" : ""}`}
                        onClick={() => setActiveTab("voice")}
                      >
                        Voice
                      </button>
                      <button
                        className={`tab-links ${activeTab === "text" ? "active-link" : ""}`}
                        onClick={() => setActiveTab("text")}
                      >
                        Text
                      </button>
                    </div>

                    {activeTab === "voice" && (
                      <div style={{ marginTop: "30px" }}>
                        <VoiceInput onAudioCaptured={handleAudioCaptured} />
                      </div>
                    )}

                    {activeTab === "text" && (
                      <div style={{ marginTop: "30px" }}>
                        <TextInput onTextSubmit={handleTextSubmit} />
                      </div>
                    )}

                    <div style={{ marginTop: "30px", textAlign: "center" }}>
                      <Link href="/transcription" className="btn">
                        Try Voice Transcription Preview
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* AI Processing Section */}
              <div className="card" style={{ marginTop: "40px" }}>
                <AIProcessing
                  audioBlob={audioBlob || undefined}
                  textInput={textInput || undefined}
                  uploadedFile={dataFile || undefined}
                  onSqlGenerated={handleSqlGenerated}
                />
              </div>
            </div>
          ) : (
            <div className="card" style={{ marginTop: "40px" }}>
              <ResultsDisplay
                sql={sql || ""}
                naturalLanguageQuery={naturalLanguageQuery || ""}
                onReset={handleReset}
              />
            </div>
          )}
        </main>
      </div>
      <Footer />
    </>
  );
}
