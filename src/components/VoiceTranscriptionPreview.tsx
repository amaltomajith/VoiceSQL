"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, StopCircle, RefreshCw, Copy, Check } from "lucide-react";
import { transcribeAudio } from "@/services/huggingfaceService";

export default function VoiceTranscriptionPreview() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [transcription, setTranscription] = useState<string>("");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      setError(null);
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
        setAudioBlob(audioBlob);

        // Stop all audio tracks
        stream.getTracks().forEach((track) => track.stop());

        // Auto-transcribe when recording stops
        handleTranscribe(audioBlob);
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
      setError("Could not access microphone. Please check permissions.");
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

  const handleTranscribe = async (blob: Blob) => {
    setIsTranscribing(true);
    setError(null);

    try {
      const text = await transcribeAudio(blob);
      setTranscription(text);
    } catch (err) {
      console.error("Transcription error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to transcribe audio",
      );
    } finally {
      setIsTranscribing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const copyToClipboard = () => {
    if (transcription) {
      navigator.clipboard.writeText(transcription);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return (
    <div className="card">
      <div>
        <h3 style={{ fontSize: "24px", marginBottom: "10px" }}>
          Voice Transcription Preview
        </h3>
        <p style={{ color: "#ababab", marginBottom: "20px" }}>
          Record your voice and see the transcription in real-time
        </p>
      </div>

      <div>
        {!isRecording ? (
          <button
            onClick={startRecording}
            className="btn"
            style={{ display: "flex", alignItems: "center", gap: "10px" }}
          >
            <Mic size={18} />
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
              gap: "10px",
              animation: "pulse 1.5s infinite",
            }}
          >
            <StopCircle size={18} />
            Stop ({formatTime(recordingTime)})
          </button>
        )}
      </div>

      {error && <div className="alert alert-destructive">{error}</div>}

      <div style={{ marginTop: "30px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "10px",
          }}
        >
          <h4 style={{ fontSize: "18px" }}>Transcription</h4>
          {transcription && (
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
            minHeight: "150px",
            position: "relative",
          }}
        >
          {isTranscribing ? (
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
              <span>Transcribing...</span>
            </div>
          ) : transcription ? (
            <p style={{ whiteSpace: "pre-wrap" }}>{transcription}</p>
          ) : (
            <p style={{ color: "#ababab" }}>
              Record your voice to see the transcription here
            </p>
          )}
        </div>
      </div>

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
