"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { SendHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

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
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-medium">Text Input</h3>
        <p className="text-sm text-muted-foreground">
          Type your query directly
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          type="text"
          placeholder="e.g., Show me all users older than 30"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1"
        />
        <Button
          type="submit"
          disabled={!text.trim()}
          className="flex items-center gap-2"
        >
          <SendHorizontal size={16} />
          Submit
        </Button>
      </form>
    </div>
  );
}
