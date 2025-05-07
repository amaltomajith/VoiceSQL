"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Download, RefreshCw } from "lucide-react";

interface ResultsDisplayProps {
  sql: string;
  naturalLanguageQuery: string;
  onReset: () => void;
  className?: string;
}

type MockResultRow = Record<string, string | number>;

export default function ResultsDisplay({
  sql,
  naturalLanguageQuery,
  onReset,
  className,
}: ResultsDisplayProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [results, setResults] = useState<MockResultRow[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [summary, setSummary] = useState<string>("");

  // Simulate loading results when component mounts
  useState(() => {
    const timer = setTimeout(() => {
      // Generate mock results based on the SQL query
      const mockResults = generateMockResults();
      setResults(mockResults);
      setColumns(Object.keys(mockResults[0] || {}));
      setTotalPages(Math.ceil(mockResults.length / 10));
      setSummary(generateMockSummary());
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  });

  const generateMockResults = (): MockResultRow[] => {
    // This is a mock function that generates fake data
    // In a real app, this would be the result of executing the SQL query
    const mockData: MockResultRow[] = [];

    // Generate between 15-30 rows of mock data
    const rowCount = Math.floor(Math.random() * 15) + 15;

    for (let i = 0; i < rowCount; i++) {
      mockData.push({
        customer_name: `Customer ${i + 1}`,
        order_date: `2023-${String(Math.floor(Math.random() * 12) + 1).padStart(2, "0")}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, "0")}`,
        total_amount: Math.floor(Math.random() * 10000) / 100,
      });
    }

    return mockData;
  };

  const generateMockSummary = (): string => {
    // Generate a natural language summary of the results
    return `Found ${results.length} customers who made purchases last month. The average purchase amount was $${(results.reduce((sum, row) => sum + (typeof row.total_amount === "number" ? row.total_amount : 0), 0) / results.length).toFixed(2)}.`;
  };

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
        <h4 style={{ fontSize: "16px", fontWeight: 500, marginBottom: "10px" }}>
          Summary
        </h4>
        <p
          style={{
            background: "#1a1a1a",
            padding: "15px",
            borderRadius: "6px",
            border: "1px solid #333",
          }}
        >
          {isLoading ? (
            <span
              style={{ display: "flex", alignItems: "center", gap: "10px" }}
            >
              <RefreshCw
                size={16}
                style={{ animation: "spin 1s linear infinite" }}
              />
              Generating summary...
            </span>
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
            disabled={isLoading || results.length === 0}
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
                isLoading || results.length === 0 ? "not-allowed" : "pointer",
              opacity: isLoading || results.length === 0 ? 0.5 : 1,
            }}
          >
            <Download size={16} />
          </button>

          <div style={{ display: "flex", alignItems: "center" }}>
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1 || isLoading}
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
                  currentPage === 1 || isLoading ? "not-allowed" : "pointer",
                opacity: currentPage === 1 || isLoading ? 0.5 : 1,
              }}
            >
              <ChevronLeft size={16} />
            </button>
            <span style={{ margin: "0 15px" }}>
              {isLoading ? "-" : `${currentPage} / ${totalPages}`}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages || isLoading}
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
                  currentPage === totalPages || isLoading
                    ? "not-allowed"
                    : "pointer",
                opacity: currentPage === totalPages || isLoading ? 0.5 : 1,
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
