"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { useRouter } from "next/navigation";
import {
  Database,
  Table as TableIcon,
  BarChart,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { createTableFromFile } from "@/services/databaseService";

export default function AnalysisPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [tableInfo, setTableInfo] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const processFile = async () => {
      const storedFileName = sessionStorage.getItem("analyzedFileName");
      if (storedFileName) {
        setFileName(storedFileName);
        // Process the extracted text from the PDF
        const extractedText = sessionStorage.getItem("extractedPdfText");
        if (extractedText) {
          try {
            // Use Groq to analyze the text and create a schema
            const { generateSchemaFromText } = await import(
              "@/services/groqService"
            );
            const schemaInfo = await generateSchemaFromText(extractedText);

            setTableInfo({
              tableName: storedFileName
                .replace(/\.[^/.]+$/, "")
                .toLowerCase()
                .replace(/\s+/g, "_"),
              rowCount:
                schemaInfo.estimatedRows ||
                Math.ceil(extractedText.length / 100),
              columns: schemaInfo.columns || [
                { name: "id", type: "INTEGER", isPrimary: true },
                { name: "content", type: "TEXT", isPrimary: false },
                { name: "page", type: "INTEGER", isPrimary: false },
                { name: "created_at", type: "TIMESTAMP", isPrimary: false },
              ],
              stats: schemaInfo.stats || {
                wordCount: extractedText.split(/\s+/).length,
                pageCount: Math.ceil(extractedText.length / 3000),
                keyTerms: schemaInfo.keyTerms || [
                  "document",
                  "text",
                  "content",
                ],
              },
            });
          } catch (err) {
            console.error("Error processing PDF text:", err);
            setError("Failed to analyze PDF content. Please try again.");
          } finally {
            setIsLoading(false);
          }
        } else {
          setError(
            "No extracted text found from PDF. Please upload a PDF file first.",
          );
          setIsLoading(false);
        }
      } else {
        setError("No file selected for analysis. Please upload a file first.");
        setIsLoading(false);
      }
    };

    processFile();
  }, []);

  return (
    <>
      <div className="container">
        <Navbar />
        <main>
          <header style={{ marginTop: "40px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
              <button
                onClick={() => router.back()}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  padding: "10px",
                }}
              >
                <ArrowLeft size={24} />
              </button>
              <h1 style={{ fontSize: "40px", fontWeight: 600 }}>
                Table Analysis
              </h1>
            </div>
            <p style={{ marginTop: "10px", color: "#ababab" }}>
              Converting your data into database tables and providing analytics
            </p>
          </header>

          {isLoading ? (
            <div
              className="card"
              style={{
                marginTop: "40px",
                textAlign: "center",
                padding: "50px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "20px",
                }}
              >
                <Loader2
                  size={50}
                  style={{ animation: "spin 2s linear infinite" }}
                />
                <div>
                  <h3 style={{ fontSize: "24px", marginBottom: "10px" }}>
                    Processing {fileName}
                  </h3>
                  <p>Creating database tables and analyzing data...</p>
                </div>
              </div>
            </div>
          ) : error ? (
            <div className="card" style={{ marginTop: "40px" }}>
              <div className="alert alert-destructive">{error}</div>
              <div style={{ marginTop: "20px", textAlign: "center" }}>
                <button onClick={() => router.push("/query")} className="btn">
                  Return to Query Page
                </button>
              </div>
            </div>
          ) : tableInfo ? (
            <div style={{ marginTop: "40px" }}>
              <div className="card" style={{ marginBottom: "30px" }}>
                <h2 style={{ fontSize: "28px", marginBottom: "20px" }}>
                  <Database
                    size={24}
                    style={{ verticalAlign: "middle", marginRight: "10px" }}
                  />
                  Database Table Created
                </h2>

                <div
                  style={{
                    background: "#1a1a1a",
                    padding: "20px",
                    borderRadius: "8px",
                    marginBottom: "20px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "15px",
                    }}
                  >
                    <div>
                      <strong>Table Name:</strong> {tableInfo.tableName}
                    </div>
                    <div>
                      <strong>Rows:</strong> {tableInfo.rowCount}
                    </div>
                  </div>

                  <h4 style={{ marginBottom: "10px", fontSize: "18px" }}>
                    Schema:
                  </h4>
                  <pre
                    style={{
                      background: "#262626",
                      padding: "15px",
                      borderRadius: "6px",
                      overflowX: "auto",
                    }}
                  >
                    {`CREATE TABLE ${tableInfo.tableName} (\n`}
                    {tableInfo.columns
                      .map(
                        (col: any) =>
                          `  ${col.name} ${col.type}${col.isPrimary ? " PRIMARY KEY" : ""}${tableInfo.columns.indexOf(col) < tableInfo.columns.length - 1 ? "," : ""}\n`,
                      )
                      .join("")}
                    {`);`}
                  </pre>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "20px",
                  }}
                >
                  <button
                    onClick={() => router.push("/tables")}
                    className="btn"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <TableIcon size={16} />
                    View All Tables
                  </button>
                  <button
                    onClick={() => router.push("/analytics")}
                    className="btn"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <BarChart size={16} />
                    View Analytics
                  </button>
                </div>
              </div>

              <div className="card">
                <h2 style={{ fontSize: "28px", marginBottom: "20px" }}>
                  <BarChart
                    size={24}
                    style={{ verticalAlign: "middle", marginRight: "10px" }}
                  />
                  Data Insights
                </h2>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "20px",
                  }}
                >
                  <div
                    style={{
                      background: "#1a1a1a",
                      padding: "20px",
                      borderRadius: "8px",
                    }}
                  >
                    <h4 style={{ marginBottom: "15px", fontSize: "18px" }}>
                      Document Metrics
                    </h4>
                    {tableInfo.stats.wordCount && (
                      <div style={{ marginBottom: "10px" }}>
                        <strong>Word Count:</strong>{" "}
                        {tableInfo.stats.wordCount.toLocaleString()}
                      </div>
                    )}
                    {tableInfo.stats.pageCount && (
                      <div style={{ marginBottom: "10px" }}>
                        <strong>Estimated Pages:</strong>{" "}
                        {tableInfo.stats.pageCount}
                      </div>
                    )}
                    {tableInfo.stats.keyTerms && (
                      <div>
                        <strong>Key Terms:</strong>{" "}
                        {tableInfo.stats.keyTerms.join(", ")}
                      </div>
                    )}
                  </div>

                  <div
                    style={{
                      background: "#1a1a1a",
                      padding: "20px",
                      borderRadius: "8px",
                    }}
                  >
                    <h4 style={{ marginBottom: "15px", fontSize: "18px" }}>
                      Content Analysis
                    </h4>
                    <div>
                      <p style={{ marginBottom: "15px" }}>
                        This PDF has been analyzed and converted to a database
                        schema with {tableInfo.columns.length} columns.
                      </p>
                      <p>
                        The extracted text has been processed and is ready for
                        querying using natural language or SQL.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </main>
      </div>
      <Footer />

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
    </>
  );
}
