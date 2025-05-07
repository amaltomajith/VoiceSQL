"use client";

import { useState, useRef } from "react";
import { Button } from "./ui/button";
import { FileSpreadsheet, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onFileUploaded: (file: File) => void;
  className?: string;
}

export default function FileUpload({
  onFileUploaded,
  className,
}: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  const processFile = (selectedFile: File) => {
    // Check if file is CSV or Excel
    const validTypes = [
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];
    if (!validTypes.includes(selectedFile.type)) {
      alert("Please upload a CSV or Excel file");
      return;
    }

    setFile(selectedFile);
    onFileUploaded(selectedFile);
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
  };

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-medium">Data Table Upload</h3>
        <p className="text-sm text-muted-foreground">
          Upload a CSV or Excel file containing your data
        </p>
      </div>

      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center flex flex-col items-center justify-center gap-4 transition-colors",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/20",
          file ? "bg-muted/20" : "",
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {!file ? (
          <>
            <FileSpreadsheet size={40} className="text-muted-foreground" />
            <div>
              <p className="font-medium">Drag & drop your file here</p>
              <p className="text-sm text-muted-foreground mt-1">
                or click to browse
              </p>
            </div>
            <Button
              variant="outline"
              onClick={triggerFileInput}
              className="mt-2 flex items-center gap-2"
            >
              <Upload size={16} />
              Browse Files
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".csv,.xls,.xlsx"
              className="hidden"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Supported formats: CSV, Excel (.xls, .xlsx)
            </p>
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 w-full">
            <div className="flex items-center justify-between w-full bg-background p-3 rounded-md border">
              <div className="flex items-center gap-3">
                <FileSpreadsheet size={24} className="text-primary" />
                <div className="text-left">
                  <p className="font-medium truncate max-w-[200px]">
                    {file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={removeFile}
                className="h-8 w-8"
              >
                <X size={16} />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              File uploaded successfully. You can now run queries against this
              data.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
