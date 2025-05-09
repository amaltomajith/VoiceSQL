"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  RefreshCw,
  Volume2,
} from "lucide-react";
import { cn } from "@/lib/utils";
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
    <div className={cn("flex flex-col gap-6", className)}>
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-medium">Query Results</h3>
        <p className="text-sm text-muted-foreground">
          Results for: "{naturalLanguageQuery}"
        </p>
      </div>

      <div className="bg-muted/30 p-4 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-sm font-medium">Summary</h4>
          {!summaryLoading && summary && (
            <Button
              variant="outline"
              size="icon"
              onClick={handleTextToSpeech}
              className={isSpeaking ? "bg-primary/20" : ""}
            >
              <Volume2 size={16} />
            </Button>
          )}
        </div>
        <p className="text-sm bg-background p-3 rounded border">
          {summaryLoading ? (
            <span className="flex items-center gap-2">
              <RefreshCw size={14} className="animate-spin" />
              Generating summary...
            </span>
          ) : error ? (
            <span className="text-destructive">Error: {error}</span>
          ) : (
            summary
          )}
        </p>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column}>{column}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length || 3}
                  className="h-24 text-center"
                >
                  <div className="flex justify-center items-center">
                    <RefreshCw size={16} className="mr-2 animate-spin" />
                    Loading results...
                  </div>
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length || 3}
                  className="h-24 text-center text-destructive"
                >
                  Error loading results: {error}
                </TableCell>
              </TableRow>
            ) : currentResults.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length || 3}
                  className="h-24 text-center"
                >
                  No results found.
                </TableCell>
              </TableRow>
            ) : (
              currentResults.map((row, index) => (
                <TableRow key={index}>
                  {columns.map((column) => (
                    <TableCell key={`${index}-${column}`}>
                      {row[column]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onReset}>
          New Query
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleDownloadCsv}
            disabled={isLoading || results.length === 0 || !!error}
          >
            <Download size={16} />
          </Button>

          <div className="flex items-center">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePreviousPage}
              disabled={currentPage === 1 || isLoading || !!error}
            >
              <ChevronLeft size={16} />
            </Button>
            <span className="mx-2 text-sm">
              {isLoading ? "-" : `${currentPage} / ${totalPages}`}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNextPage}
              disabled={currentPage === totalPages || isLoading || !!error}
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
