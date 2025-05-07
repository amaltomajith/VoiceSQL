"use client";

import { useState } from "react";
import { SendHorizontal } from "lucide-react";

interface TextInputProps {
  onTextSubmit: (text: string) => void;
  className?: string;
}

export default function TextInput({ onTextSubmit, className }: TextInputProps) {
  const [text, setText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onTextSubmit(text.trim());
      setText("");
    }
  };

  return (
    <div className={className}>
      <div>
        <h3 style={{ fontSize: "20px", marginBottom: "10px" }}>Text Input</h3>
        <p style={{ color: "#ababab", marginBottom: "15px" }}>
          Type your query directly
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", gap: "10px" }}>
        <input
          type="text"
          placeholder="e.g., Show me all users older than 30"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="input-style"
          style={{ flex: 1 }}
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="btn"
          style={{
            margin: 0,
            background: text.trim() ? "#ff004f" : "#333",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 20px",
          }}
        >
          <SendHorizontal size={16} />
          Submit
        </button>
      </form>
    </div>
  );
}
