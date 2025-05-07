"use client";

import { useState, useRef } from "react";
import { FileText, Upload, X, RefreshCw, Copy, Check } from "lucide-react";
import { extractTextFromPdf } from "@/services/huggingfaceService";

export default function FileUploadProcessor() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [extractedText, setExtractedText] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  const processFile = (selectedFile: File) => {
    // Check if file is PDF or image
    const validTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
    ];

    if (!validTypes.includes(selectedFile.type)) {
      setError("Please upload a PDF or image file");
      return;
    }

    setFile(selectedFile);
    setError(null);
    setExtractedText("");
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files.length) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removeFile = () => {
    setFile(null);
    setExtractedText("");
    setError(null);
  };

  const extractText = async () => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);

    try {
      const text = await extractTextFromPdf(file);
      setExtractedText(text);
    } catch (err) {
      console.error("Text extraction error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to extract text from file",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = () => {
    if (extractedText) {
      navigator.clipboard.writeText(extractedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="card">
      <div>
        <h3 style={{ fontSize: "24px", marginBottom: "10px" }}>
          Document Text Extraction
        </h3>
        <p style={{ color: "#ababab", marginBottom: "20px" }}>
          Upload a PDF or image to extract text content
        </p>
      </div>

      <div
        style={{
          border: `2px dashed ${isDragging ? "#ff004f" : "#555"}`,
          borderRadius: "10px",
          padding: "30px",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "20px",
          transition: "all 0.3s",
          background: isDragging ? "rgba(255, 0, 79, 0.05)" : "transparent",
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {!file ? (
          <>
            <FileText size={50} color="#ababab" />
            <div>
              <p style={{ fontWeight: 500, marginBottom: "5px" }}>
                Drag & drop your file here
              </p>
              <p style={{ color: "#ababab", fontSize: "14px" }}>
                or click to browse
              </p>
            </div>
            <button
              onClick={triggerFileInput}
              className="btn"
              style={{ margin: "10px auto" }}
            >
              <Upload size={16} style={{ marginRight: "8px" }} />
              Browse Files
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
              style={{ display: "none" }}
            />
            <p style={{ color: "#ababab", fontSize: "12px" }}>
              Supported formats: PDF, Images (.jpg, .png, .gif, .webp)
            </p>
          </>
        ) : (
          <div style={{ width: "100%" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "#1a1a1a",
                padding: "15px",
                borderRadius: "6px",
                border: "1px solid #333",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "15px" }}
              >
                <FileText size={24} color="#ff004f" />
                <div style={{ textAlign: "left" }}>
                  <p
                    style={{
                      fontWeight: 500,
                      maxWidth: "200px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {file.name}
                  </p>
                  <p style={{ fontSize: "12px", color: "#ababab" }}>
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <button
                onClick={removeFile}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <X size={18} />
              </button>
            </div>

            <button
              onClick={extractText}
              disabled={isProcessing}
              className="btn"
              style={{
                margin: "20px auto",
                background: isProcessing ? "#333" : "#ff004f",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              {isProcessing ? (
                <>
                  <RefreshCw
                    size={16}
                    style={{ animation: "spin 1s linear infinite" }}
                  />
                  Processing...
                </>
              ) : (
                <>Extract Text</>
              )}
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="alert alert-destructive" style={{ marginTop: "20px" }}>
          {error}
        </div>
      )}

      {(extractedText || isProcessing) && (
        <div style={{ marginTop: "30px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "10px",
            }}
          >
            <h4 style={{ fontSize: "18px" }}>Extracted Text</h4>
            {extractedText && (
              <button
                onClick={copyToClipboard}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#ababab",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                {copied ? (
                  <>
                    <Check size={16} color="#ff004f" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    Copy
                  </>
                )}
              </button>
            )}
          </div>

          <div
            style={{
              background: "#262626",
              borderRadius: "6px",
              padding: "20px",
              minHeight: "200px",
              maxHeight: "400px",
              overflowY: "auto",
              position: "relative",
            }}
          >
            {isProcessing ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  gap: "10px",
                }}
              >
                <RefreshCw
                  size={20}
                  style={{ animation: "spin 1s linear infinite" }}
                />
                <span>Extracting text...</span>
              </div>
            ) : extractedText ? (
              <p style={{ whiteSpace: "pre-wrap" }}>{extractedText}</p>
            ) : (
              <p style={{ color: "#ababab" }}>
                Process a file to see extracted text here
              </p>
            )}
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
