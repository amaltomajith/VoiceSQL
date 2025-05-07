/**
 * Service for interacting with the Google Gemini API
 * Handles audio transcription and SQL generation
 */

// Constants
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta";

/**
 * Transcribe audio to text using Gemini API
 * @param audioBlob - The audio blob to transcribe
 * @returns The transcribed text
 */
export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  try {
    // Convert audio blob to base64
    const base64Audio = await blobToBase64(audioBlob);

    // API key should be set in environment variables
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "Gemini API key not found. Please set NEXT_PUBLIC_GEMINI_API_KEY in your environment variables.",
      );
    }

    // Prepare request to Gemini API for audio transcription
    const response = await fetch(
      `${GEMINI_API_URL}/models/gemini-1.0-pro:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: "Transcribe the following audio to text. The audio contains a natural language query about data in a database:",
                },
                {
                  inline_data: {
                    mime_type: audioBlob.type || "audio/wav",
                    data: base64Audio.split(",")[1], // Remove the data URL prefix
                  },
                },
              ],
            },
          ],
        }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Gemini API error: ${errorData.error?.message || response.statusText}`,
      );
    }

    const data = await response.json();
    return data.candidates[0]?.content?.parts[0]?.text || "";
  } catch (error) {
    console.error("Error transcribing audio:", error);
    throw error;
  }
}

/**
 * Generate SQL from natural language query using Gemini API
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
        "Gemini API key not found. Please set NEXT_PUBLIC_GEMINI_API_KEY in your environment variables.",
      );
    }

    // Construct prompt based on whether table schema is provided
    let prompt = `Convert the following natural language query to SQL.`;

    if (tableSchema) {
      prompt += `\n\nUse the following table schema:\n${tableSchema}\n\n`;
    } else {
      prompt += ` Return only the SQL code without any explanations or markdown formatting.\n\n`;
    }

    prompt += `Query: ${query}`;

    // Prepare request to Gemini API for SQL generation
    const response = await fetch(
      `${GEMINI_API_URL}/models/gemini-1.0-pro:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            topK: 40,
            topP: 0.95,
          },
        }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Gemini API error: ${errorData.error?.message || response.statusText}`,
      );
    }

    const data = await response.json();
    const generatedSql = data.candidates[0]?.content?.parts[0]?.text || "";

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
 * Helper function to convert a Blob to base64
 * @param blob - The blob to convert
 * @returns A promise that resolves to the base64 string
 */
async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Extract schema information from a CSV file
 * @param file - The CSV file to extract schema from
 * @returns A promise that resolves to the schema string
 */
export async function extractSchemaFromCsv(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const lines = content.split("\n");

        if (lines.length === 0) {
          reject(new Error("CSV file is empty"));
          return;
        }

        // Get headers (column names)
        const headers = lines[0].split(",").map((h) => h.trim());

        // Sample some data to infer types
        const sampleSize = Math.min(5, lines.length - 1);
        const sampleData: string[][] = [];

        for (let i = 1; i <= sampleSize; i++) {
          if (lines[i] && lines[i].trim()) {
            sampleData.push(lines[i].split(",").map((cell) => cell.trim()));
          }
        }

        // Infer column types
        const columnTypes: string[] = headers.map((_, colIndex) => {
          const values = sampleData.map((row) => row[colIndex]);
          return inferColumnType(values);
        });

        // Generate table name from file name
        const tableName = file.name
          .replace(/\.[^/.]+$/, "")
          .replace(/\W/g, "_")
          .toLowerCase();

        // Build schema string
        let schema = `Table: ${tableName}\nColumns:\n`;
        headers.forEach((header, index) => {
          schema += `- ${header} (${columnTypes[index]})\n`;
        });

        resolve(schema);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}

/**
 * Infer the SQL data type from a set of sample values
 * @param values - Sample values to infer type from
 * @returns The inferred SQL data type
 */
function inferColumnType(values: string[]): string {
  // Check if all values are numeric
  const isNumeric = values.every(
    (val) => !isNaN(Number(val)) && val.trim() !== "",
  );
  if (isNumeric) {
    // Check if all values are integers
    const isInteger = values.every((val) => Number.isInteger(Number(val)));
    return isInteger ? "INTEGER" : "DECIMAL";
  }

  // Check if all values are dates
  const dateRegex = /^\d{4}[-/]\d{1,2}[-/]\d{1,2}$/;
  const isDate = values.every(
    (val) => dateRegex.test(val) || val.trim() === "",
  );
  if (isDate) {
    return "DATE";
  }

  // Default to VARCHAR
  return "VARCHAR";
}
