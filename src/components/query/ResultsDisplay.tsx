"use client";

import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  RefreshCw,
  Volume2,
} from "lucide-react";
import { generateResultsSummary } from "@/services/groqService";
import { executeQuery } from "@/services/databaseService";

interface ResultsDisplayProps {
  sql: string;
  naturalLanguageQuery: string;
  onReset: () => void;
  className?: string;
}

type ResultRow = Record<string, string | number>;

export default function ResultsDisplay({
  sql,
  naturalLanguageQuery,
  onReset,
  className,
}: ResultsDisplayProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [results, setResults] = useState<ResultRow[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [summary, setSummary] = useState<string>("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Execute SQL query and load results when component mounts
  useEffect(() => {
    const fetchResults = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Execute the SQL query against the database using our database service
        console.log("Executing SQL query:", sql);

        // Execute the actual query against the database
        const queryResults = await executeQuery(sql);

        // Ensure queryResults is an array
        const resultsArray = Array.isArray(queryResults)
          ? queryResults
          : [queryResults];
        setResults(resultsArray);

        // Safely extract columns
        setColumns(
          resultsArray.length > 0 ? Object.keys(resultsArray[0] || {}) : [],
        );
        setTotalPages(Math.max(1, Math.ceil(resultsArray.length / 10)));

        // Generate summary using Groq with the actual results
        setSummaryLoading(true);
        try {
          const summaryText = await generateResultsSummary(
            queryResults,
            naturalLanguageQuery,
          );
          setSummary(summaryText);
        } catch (summaryError) {
          console.error("Error generating summary:", summaryError);
          setSummary("Could not generate summary. Please try again later.");
        } finally {
          setSummaryLoading(false);
        }

        setIsLoading(false);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "An error occurred while processing results",
        );
        setIsLoading(false);
      }
    };

    fetchResults();

    return () => {
      // Cancel any text-to-speech if component unmounts
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [naturalLanguageQuery, sql]);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handleDownloadCsv = () => {
    // Create CSV content
    const headers = columns.join(",");
    const rows = results.map((row) => columns.map((col) => row[col]).join(","));
    const csvContent = [headers, ...rows].join("\n");

    // Create a blob and download link
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "query_results.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleTextToSpeech = () => {
    if (!window.speechSynthesis) {
      console.error("Text-to-speech not supported in this browser");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(summary);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Get current page of results
  const startIndex = (currentPage - 1) * 10;
  const endIndex = startIndex + 10;
  const currentResults = results.slice(startIndex, endIndex);

  return (
    <div className={className}>
      <div>
        <h3 style={{ fontSize: "24px", marginBottom: "10px" }}>
          Query Results
        </h3>
        <p style={{ color: "#ababab", marginBottom: "20px" }}>
          Results for: "{naturalLanguageQuery}"
        </p>
      </div>

      <div
        style={{
          background: "#262626",
          padding: "20px",
          borderRadius: "10px",
          marginBottom: "30px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "10px",
          }}
        >
          <h4 style={{ fontSize: "16px", fontWeight: 500 }}>Summary</h4>
          {!summaryLoading && summary && (
            <button
              onClick={handleTextToSpeech}
              style={{
                background: isSpeaking
                  ? "rgba(255, 0, 79, 0.2)"
                  : "transparent",
                border: "1px solid #555",
                borderRadius: "4px",
                width: "40px",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <Volume2 size={16} />
            </button>
          )}
        </div>
        <p
          style={{
            background: "#1a1a1a",
            padding: "15px",
            borderRadius: "6px",
            border: "1px solid #333",
          }}
        >
          {summaryLoading ? (
            <span
              style={{ display: "flex", alignItems: "center", gap: "10px" }}
            >
              <RefreshCw
                size={16}
                style={{ animation: "spin 1s linear infinite" }}
              />
              Generating summary...
            </span>
          ) : error ? (
            <span style={{ color: "#ff4d4f" }}>Error: {error}</span>
          ) : (
            summary
          )}
        </p>
      </div>

      <div
        style={{
          border: "1px solid #333",
          borderRadius: "6px",
          overflow: "hidden",
          marginBottom: "30px",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#1a1a1a" }}>
              {columns.map((column) => (
                <th
                  key={column}
                  style={{
                    padding: "12px",
                    textAlign: "left",
                    fontWeight: 500,
                  }}
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan={columns.length || 3}
                  style={{ height: "100px", textAlign: "center" }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <RefreshCw
                      size={16}
                      style={{ animation: "spin 1s linear infinite" }}
                    />
                    Loading results...
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td
                  colSpan={columns.length || 3}
                  style={{
                    height: "100px",
                    textAlign: "center",
                    color: "#ff4d4f",
                  }}
                >
                  Error loading results: {error}
                </td>
              </tr>
            ) : currentResults.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length || 3}
                  style={{ height: "100px", textAlign: "center" }}
                >
                  No results found.
                </td>
              </tr>
            ) : (
              currentResults.map((row, index) => (
                <tr key={index} style={{ borderBottom: "1px solid #333" }}>
                  {columns.map((column) => (
                    <td key={`${index}-${column}`} style={{ padding: "12px" }}>
                      {row[column]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <button onClick={onReset} className="btn" style={{ margin: 0 }}>
          New Query
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <button
            onClick={handleDownloadCsv}
            disabled={isLoading || results.length === 0 || !!error}
            style={{
              background: "transparent",
              border: "1px solid #555",
              borderRadius: "4px",
              width: "40px",
              height: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor:
                isLoading || results.length === 0 || !!error
                  ? "not-allowed"
                  : "pointer",
              opacity: isLoading || results.length === 0 || !!error ? 0.5 : 1,
            }}
          >
            <Download size={16} />
          </button>

          <div style={{ display: "flex", alignItems: "center" }}>
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1 || isLoading || !!error}
              style={{
                background: "transparent",
                border: "1px solid #555",
                borderRadius: "4px",
                width: "40px",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor:
                  currentPage === 1 || isLoading || !!error
                    ? "not-allowed"
                    : "pointer",
                opacity: currentPage === 1 || isLoading || !!error ? 0.5 : 1,
              }}
            >
              <ChevronLeft size={16} />
            </button>
            <span style={{ margin: "0 15px" }}>
              {isLoading ? "-" : `${currentPage} / ${totalPages}`}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages || isLoading || !!error}
              style={{
                background: "transparent",
                border: "1px solid #555",
                borderRadius: "4px",
                width: "40px",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor:
                  currentPage === totalPages || isLoading || !!error
                    ? "not-allowed"
                    : "pointer",
                opacity:
                  currentPage === totalPages || isLoading || !!error ? 0.5 : 1,
              }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

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
