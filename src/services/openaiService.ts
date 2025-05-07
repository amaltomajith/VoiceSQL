/**
 * Service for interacting with the OpenAI API
 * Handles audio transcription and text processing
 */

// Constants
const OPENAI_API_URL = "https://api.openai.com/v1";

/**
 * Transcribe audio to text using OpenAI's Whisper API
 * @param audioBlob - The audio blob to transcribe
 * @returns The transcribed text
 */
export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  try {
    // API key should be set in environment variables
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "OpenAI API key not found. Please set NEXT_PUBLIC_GEMINI_API_KEY in your environment variables.",
      );
    }

    // Create form data with the audio file
    const formData = new FormData();
    formData.append("file", audioBlob, "audio.wav");
    formData.append("model", "whisper-1");

    // Make request to OpenAI API
    const response = await fetch(`${OPENAI_API_URL}/audio/transcriptions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `OpenAI API error: ${errorData.error?.message || response.statusText}`,
      );
    }

    const data = await response.json();
    return data.text || "";
  } catch (error) {
    console.error("Error transcribing audio:", error);
    throw error;
  }
}

/**
 * Generate SQL from natural language query using OpenAI API
 * @param query - The natural language query
 * @param tableSchema - Optional table schema information
 * @returns Object containing the generated SQL and the original query
 */
export async function generateSql(
  query: string,
  tableSchema?: string,
): Promise<{ sql: string; naturalLanguageQuery: string }> {
  try {
    // API key should be set in environment variables
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "OpenAI API key not found. Please set NEXT_PUBLIC_GEMINI_API_KEY in your environment variables.",
      );
    }

    // Construct prompt based on whether table schema is provided
    let systemPrompt =
      "You are an expert SQL developer. Convert natural language queries to SQL code.";

    if (tableSchema) {
      systemPrompt += ` Use the following table schema:\n${tableSchema}`;
    }

    // Prepare request to OpenAI API for SQL generation
    const response = await fetch(`${OPENAI_API_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: `Convert this to SQL: ${query}\n\nReturn only the SQL code without any explanations or markdown formatting.`,
          },
        ],
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `OpenAI API error: ${errorData.error?.message || response.statusText}`,
      );
    }

    const data = await response.json();
    const generatedSql = data.choices[0]?.message?.content || "";

    // Clean up the SQL (remove markdown code blocks if present)
    const cleanedSql = generatedSql.replace(/```sql|```/g, "").trim();

    return {
      sql: cleanedSql,
      naturalLanguageQuery: query,
    };
  } catch (error) {
    console.error("Error generating SQL:", error);
    throw error;
  }
}

/**
 * Extract text from a PDF file
 * @param file - The PDF file to extract text from
 * @returns A promise that resolves to the extracted text
 */
export async function extractTextFromPdf(file: File): Promise<string> {
  try {
    // API key should be set in environment variables
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "OpenAI API key not found. Please set NEXT_PUBLIC_GEMINI_API_KEY in your environment variables.",
      );
    }

    // Create form data with the PDF file
    const formData = new FormData();
    formData.append("file", file);
    formData.append("model", "gpt-4-vision-preview");

    // Make request to OpenAI API
    const response = await fetch(`${OPENAI_API_URL}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Extract all text content from this document.",
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${file.type};base64,${await fileToBase64(file)}`,
                },
              },
            ],
          },
        ],
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `OpenAI API error: ${errorData.error?.message || response.statusText}`,
      );
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "";
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    throw error;
  }
}

/**
 * Helper function to convert a File to base64
 * @param file - The file to convert
 * @returns A promise that resolves to the base64 string
 */
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove the data URL prefix (e.g., "data:application/pdf;base64,")
      const base64Content = base64String.split(",")[1];
      resolve(base64Content);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
