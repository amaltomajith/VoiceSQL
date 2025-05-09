"use client";

import { useState, useRef } from "react";
import { Button } from "./ui/button";
import { Mic, Upload, StopCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoiceInputProps {
  onAudioCaptured: (audioBlob: Blob) => void;
  className?: string;
}

export default function VoiceInput({
  onAudioCaptured,
  className,
}: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startRecording = async () => {
    try {
      audioChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/wav",
        });
        onAudioCaptured(audioBlob);
        setAudioFile(null);

        // Stop all audio tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("audio/")) {
      setAudioFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        const arrayBuffer = reader.result as ArrayBuffer;
        const blob = new Blob([arrayBuffer], { type: file.type });
        // Don't automatically process the audio, just store it
        onAudioCaptured(blob);
      };
      reader.readAsArrayBuffer(file);
    } else if (file) {
      alert("Please upload an audio file.");
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-medium">Voice Input</h3>
        <p className="text-sm text-muted-foreground">
          Record your query or upload an audio file
        </p>
      </div>

      <div className="flex gap-3">
        {!isRecording ? (
          <Button
            onClick={startRecording}
            variant="default"
            className="flex items-center gap-2"
          >
            <Mic size={16} />
            Start Recording
          </Button>
        ) : (
          <Button
            onClick={stopRecording}
            variant="destructive"
            className="flex items-center gap-2 animate-pulse"
          >
            <StopCircle size={16} />
            Stop ({formatTime(recordingTime)})
          </Button>
        )}

        <Button
          onClick={triggerFileUpload}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Upload size={16} />
          Upload Audio
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="audio/*"
          className="hidden"
        />
      </div>

      {audioFile && (
        <div className="text-sm text-muted-foreground mt-2">
          Uploaded: {audioFile.name}
        </div>
      )}
    </div>
  );
}
