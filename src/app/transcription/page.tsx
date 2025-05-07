"use client";

import { useState } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import VoiceTranscriptionPreview from "@/components/VoiceTranscriptionPreview";
import FileUploadProcessor from "@/components/FileUploadProcessor";

export default function TranscriptionPage() {
  const [activeTab, setActiveTab] = useState("voice");

  return (
    <>
      <div className="container">
        <Navbar />
        <main>
          {/* Header Section */}
          <header style={{ marginTop: "40px" }}>
            <h1 style={{ fontSize: "40px", fontWeight: 600 }}>
              Text Processing
            </h1>
            <p style={{ marginTop: "10px", color: "#ababab" }}>
              Convert voice recordings and documents to text using AI
            </p>
          </header>

          <div style={{ marginTop: "40px" }}>
            <div className="tab-titles">
              <button
                className={`tab-links ${activeTab === "voice" ? "active-link" : ""}`}
                onClick={() => setActiveTab("voice")}
              >
                Voice Transcription
              </button>
              <button
                className={`tab-links ${activeTab === "document" ? "active-link" : ""}`}
                onClick={() => setActiveTab("document")}
              >
                Document Processing
              </button>
            </div>

            {activeTab === "voice" && (
              <div style={{ marginTop: "30px" }}>
                <VoiceTranscriptionPreview />
              </div>
            )}

            {activeTab === "document" && (
              <div style={{ marginTop: "30px" }}>
                <FileUploadProcessor />
              </div>
            )}
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
}
