/**
 * Service for interacting with the Groq API
 * Handles natural language to SQL conversion
 */

// Constants
const GROQ_API_URL = "https://api.groq.com/openai/v1";

/**
 * Generate SQL from natural language query using Groq API
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
    const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;
    if (!apiKey) {
      throw new Error(
        "Groq API key not found. Please set NEXT_PUBLIC_GROQ_API_KEY in your environment variables.",
      );
    }

    // Construct prompt based on whether table schema is provided
    let systemPrompt =
      "You are an expert SQL developer. Convert natural language queries to SQL code.";

    if (tableSchema) {
      systemPrompt += ` Use the following table schema:\n${tableSchema}`;
    }

    // Prepare request to Groq API for SQL generation
    const response = await fetch(`${GROQ_API_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama3-70b-8192", // Using Llama 3 70B model
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
        `Groq API error: ${errorData.error?.message || response.statusText}`,
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
    console.error("Error generating SQL with Groq:", error);
    throw error;
  }
}

/**
 * Generate a natural language summary of SQL query results
 * @param results - The query results to summarize
 * @param query - The original natural language query
 * @returns A natural language summary of the results
 */
export async function generateResultsSummary(
  results: any[],
  query: string,
): Promise<string> {
  try {
    // API key should be set in environment variables
    const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;
    if (!apiKey) {
      throw new Error(
        "Groq API key not found. Please set NEXT_PUBLIC_GROQ_API_KEY in your environment variables.",
      );
    }

    // Prepare the prompt for summarizing results
    const prompt = `
      Original query: "${query}"
      
      Results: ${JSON.stringify(results, null, 2)}
      
      Please provide a concise natural language summary of these query results.
    `;

    // Make request to Groq API
    const response = await fetch(`${GROQ_API_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama3-70b-8192",
        messages: [
          {
            role: "system",
            content:
              "You are an expert data analyst. Summarize SQL query results in natural language.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Groq API error: ${errorData.error?.message || response.statusText}`,
      );
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "";
  } catch (error) {
    console.error("Error generating results summary with Groq:", error);
    throw error;
  }
}
