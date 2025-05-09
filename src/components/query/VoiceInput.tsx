"use client";

import { useState, useRef } from "react";
import { Mic, Upload, StopCircle, Play, Trash2 } from "lucide-react";

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
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

        // Create URL for playback
        const url = URL.createObjectURL(audioBlob);
        setAudioBlob(audioBlob);
        setAudioUrl(url);
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
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        // Don't automatically submit the audio
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

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  const clearRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setAudioFile(null);
    setIsPlaying(false);
  };

  const submitAudio = () => {
    if (audioBlob) {
      onAudioCaptured(audioBlob);
      // Provide feedback to the user
      alert("Audio submitted for processing!");
    }
  };

  return (
    <div className={className}>
      <div>
        <h3 style={{ fontSize: "20px", marginBottom: "10px" }}>Voice Input</h3>
        <p style={{ color: "#ababab", marginBottom: "15px" }}>
          Record your query or upload an audio file
        </p>
      </div>

      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          style={{ display: "none" }}
          onEnded={handleAudioEnded}
        />
      )}

      {!audioUrl ? (
        <div style={{ display: "flex", gap: "15px" }}>
          {!isRecording ? (
            <button
              onClick={startRecording}
              className="btn"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                margin: 0,
              }}
            >
              <Mic size={16} />
              Start Recording
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="btn"
              style={{
                background: "#ff004f",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                margin: 0,
                animation: "pulse 1.5s infinite",
              }}
            >
              <StopCircle size={16} />
              Stop ({formatTime(recordingTime)})
            </button>
          )}

          <button
            onClick={triggerFileUpload}
            className="btn"
            style={{
              background: "transparent",
              border: "1px solid #555",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              margin: 0,
            }}
          >
            <Upload size={16} />
            Upload Audio
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="audio/*"
            style={{ display: "none" }}
          />
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div
            style={{
              background: "#262626",
              padding: "20px",
              borderRadius: "10px",
              display: "flex",
              flexDirection: "column",
              gap: "15px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ fontWeight: 500 }}>
                {audioFile ? audioFile.name : "Recorded Audio"}
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={handlePlayPause}
                  style={{
                    background: "transparent",
                    border: "1px solid #555",
                    borderRadius: "4px",
                    padding: "8px 12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    cursor: "pointer",
                    color: "#fff",
                  }}
                >
                  {isPlaying ? <StopCircle size={14} /> : <Play size={14} />}
                  {isPlaying ? "Pause" : "Play"}
                </button>
                <button
                  onClick={clearRecording}
                  style={{
                    background: "transparent",
                    border: "1px solid #555",
                    borderRadius: "4px",
                    padding: "8px 12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    cursor: "pointer",
                    color: "#fff",
                  }}
                >
                  <Trash2 size={14} />
                  Clear
                </button>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              onClick={submitAudio}
              className="btn"
              style={{
                background: "#ff004f",
                margin: 0,
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Upload size={16} />
              Use This Recording
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes pulse {
          0% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
          100% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
