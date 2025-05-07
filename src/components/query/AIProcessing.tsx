"use client";

import { useState } from "react";
import { Code, Play, AlertCircle } from "lucide-react";
import {
  transcribeAudio,
  generateSql,
  extractTextFromPdf,
} from "@/services/huggingfaceService";

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
          query = await transcribeAudio(audioBlob);
          if (!query) {
            throw new Error("Could not transcribe audio. Please try again.");
          }
          setNaturalLanguageQuery(query);
        } catch (err) {
          throw new Error(
            err instanceof Error
              ? `Audio transcription error: ${err.message}`
              : "Failed to transcribe audio",
          );
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
    <div className={className}>
      <div>
        <h3 style={{ fontSize: "24px", marginBottom: "10px" }}>
          AI Processing
        </h3>
        <p style={{ color: "#ababab", marginBottom: "20px" }}>
          Convert your input to SQL using AI
        </p>
      </div>

      {error && (
        <div className="alert alert-destructive">
          <AlertCircle size={16} style={{ marginRight: "10px" }} />
          <div>
            <div style={{ fontWeight: 500, marginBottom: "5px" }}>Error</div>
            <div>{error}</div>
          </div>
        </div>
      )}

      {uploadedFile && (
        <div
          style={{
            background: "#262626",
            padding: "15px",
            borderRadius: "6px",
            marginBottom: "20px",
          }}
        >
          <p style={{ color: "#ababab" }}>
            Using table from:{" "}
            <span style={{ fontWeight: 500 }}>{uploadedFile.name}</span>
          </p>
        </div>
      )}

      {naturalLanguageQuery && generatedSql && !isProcessing ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "15px",
            background: "#262626",
            padding: "20px",
            borderRadius: "10px",
          }}
        >
          <div>
            <h4
              style={{
                fontSize: "16px",
                fontWeight: 500,
                marginBottom: "10px",
              }}
            >
              Natural Language Query:
            </h4>
            <p
              style={{
                background: "#1a1a1a",
                padding: "10px",
                borderRadius: "6px",
                border: "1px solid #333",
              }}
            >
              {naturalLanguageQuery}
            </p>
          </div>
          <div>
            <h4
              style={{
                fontSize: "16px",
                fontWeight: 500,
                marginBottom: "10px",
              }}
            >
              Generated SQL:
            </h4>
            <pre
              style={{
                fontFamily: "monospace",
                fontSize: "14px",
                background: "#1a1a1a",
                padding: "10px",
                borderRadius: "6px",
                border: "1px solid #333",
                overflowX: "auto",
              }}
            >
              {generatedSql}
            </pre>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <button
            onClick={processInput}
            disabled={!hasInput || isProcessing}
            className="btn"
            style={{
              background: hasInput && !isProcessing ? "#ff004f" : "#333",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            {isProcessing ? (
              <>
                <div
                  style={{
                    width: "16px",
                    height: "16px",
                    border: "2px solid #fff",
                    borderTopColor: "transparent",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                  }}
                ></div>
                Processing...
              </>
            ) : (
              <>
                <Code size={16} />
                Generate SQL
              </>
            )}
          </button>
        </div>
      )}

      {naturalLanguageQuery && generatedSql && !isProcessing && (
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: "20px",
          }}
        >
          <button
            onClick={() => onSqlGenerated(generatedSql, naturalLanguageQuery)}
            className="btn"
            style={{
              background: "#ff004f",
              margin: 0,
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <Play size={16} />
            Execute Query
          </button>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
