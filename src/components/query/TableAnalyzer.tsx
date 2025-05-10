"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Database, BarChart, Table as TableIcon } from "lucide-react";
import { useRouter } from "next/navigation";

interface TableAnalyzerProps {
  uploadedFile?: File;
  className?: string;
}

export default function TableAnalyzer({
  uploadedFile,
  className,
}: TableAnalyzerProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const processTable = async () => {
    if (!uploadedFile) {
      setError("Please upload a file first");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Create a FormData object to send the file
      const formData = new FormData();
      formData.append("file", uploadedFile);

      // Store the file name in session storage for reference
      sessionStorage.setItem("analyzedFileName", uploadedFile.name);

      // Redirect to the analysis page
      router.push("/analysis");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process table");
      setIsProcessing(false);
    }
  };

  return (
    <div className={className}>
      <div>
        <h3 style={{ fontSize: "24px", marginBottom: "10px" }}>
          Table Analysis
        </h3>
        <p style={{ color: "#ababab", marginBottom: "20px" }}>
          Convert your Excel/CSV data into database tables and view analytics
        </p>
      </div>

      {error && (
        <div
          className="alert alert-destructive"
          style={{ marginBottom: "20px" }}
        >
          {error}
        </div>
      )}

      <div style={{ display: "flex", gap: "15px" }}>
        <button
          onClick={processTable}
          disabled={!uploadedFile || isProcessing}
          className="btn"
          style={{
            background: uploadedFile && !isProcessing ? "#ff004f" : "#333",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            margin: 0,
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
              <Database size={16} />
              Create Database Tables
            </>
          )}
        </button>

        <button
          onClick={() => router.push("/tables")}
          className="btn"
          style={{
            background: "transparent",
            border: "1px solid #555",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            margin: 0,
          }}
        >
          <TableIcon size={16} />
          View All Tables
        </button>

        <button
          onClick={() => router.push("/analytics")}
          className="btn"
          style={{
            background: "transparent",
            border: "1px solid #555",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            margin: 0,
          }}
        >
          <BarChart size={16} />
          Data Analytics
        </button>
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
