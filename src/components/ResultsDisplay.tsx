"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { ChevronLeft, ChevronRight, Download, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

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
    <div className={cn("flex flex-col gap-6", className)}>
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-medium">Query Results</h3>
        <p className="text-sm text-muted-foreground">
          Results for: "{naturalLanguageQuery}"
        </p>
      </div>

      <div className="bg-muted/30 p-4 rounded-lg">
        <h4 className="text-sm font-medium mb-2">Summary</h4>
        <p className="text-sm bg-background p-3 rounded border">
          {isLoading ? (
            <span className="flex items-center gap-2">
              <RefreshCw size={14} className="animate-spin" />
              Generating summary...
            </span>
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
            disabled={isLoading || results.length === 0}
          >
            <Download size={16} />
          </Button>

          <div className="flex items-center">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePreviousPage}
              disabled={currentPage === 1 || isLoading}
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
              disabled={currentPage === totalPages || isLoading}
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
