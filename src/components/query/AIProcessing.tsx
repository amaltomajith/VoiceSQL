"use client";

import { useState } from "react";
import { Code, Play, AlertCircle } from "lucide-react";
import { transcribeAudio } from "@/services/assemblyaiService";
import { generateSql } from "@/services/groqService";
import { extractTextFromPdf } from "@/services/huggingfaceService";

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

      // Enhanced SQL syntax validation before setting
      try {
        // Check for common SQL syntax issues
        const sql = result.sql.trim();

        // Check for unbalanced parentheses
        const openParens = (sql.match(/\(/g) || []).length;
        const closeParens = (sql.match(/\)/g) || []).length;
        if (openParens !== closeParens) {
          throw new Error("SQL syntax error: Unbalanced parentheses");
        }

        // Check for missing semicolons in multi-statement queries
        if (
          sql.includes(";") &&
          !sql.endsWith(";") &&
          sql.indexOf(";") !== sql.lastIndexOf(";")
        ) {
          throw new Error(
            "SQL syntax error: Missing semicolon at the end of a statement",
          );
        }

        // Check for multiple semicolons at the end
        if (/;\s*;/.test(sql)) {
          throw new Error(
            "SQL syntax error: Multiple consecutive semicolons detected",
          );
        }

        // Check for semicolons in the middle of a statement (simplified check)
        const statements = sql.split(";").filter((s) => s.trim().length > 0);
        if (statements.length > 1) {
          // If we have multiple statements, check each one for basic structure
          for (const statement of statements) {
            if (
              !statement
                .trim()
                .toLowerCase()
                .match(/^(select|insert|update|delete|create|alter|drop|with)/i)
            ) {
              throw new Error(
                "SQL syntax error: Invalid statement structure or misplaced semicolon",
              );
            }
          }
        }

        // Clean up the SQL - remove any trailing semicolons that might cause issues
        const cleanedSql = sql.replace(/;\s*$/, "");
        setGeneratedSql(cleanedSql);
      } catch (syntaxError) {
        setError(
          syntaxError instanceof Error
            ? syntaxError.message
            : "SQL syntax validation failed",
        );
        // Still set the SQL so the user can see and fix it
        setGeneratedSql(result.sql);
      }

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
    <div className={className}>
      <div>
        <h3 style={{ fontSize: "24px", marginBottom: "10px" }}>
          AI Processing
        </h3>
        <p style={{ color: "#ababab", marginBottom: "20px" }}>
          Convert your input to SQL using Groq AI
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
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "20px",
          }}
        >
          {error && (
            <div
              style={{ color: "#ff4d4f", fontSize: "14px", maxWidth: "60%" }}
            >
              <span style={{ fontWeight: 500 }}>Warning:</span> {error}
            </div>
          )}
          <div style={{ marginLeft: error ? "auto" : "0" }}>
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
