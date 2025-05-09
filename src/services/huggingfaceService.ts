/**
 * Service for interacting with the Hugging Face Inference API
 * Handles audio transcription and text processing
 */

// Constants
const HF_API_URL = "https://api-inference.huggingface.co/models";

/**
 * Transcribe audio to text using Hugging Face's ASR models
 * @param audioBlob - The audio blob to transcribe
 * @returns The transcribed text
 */
export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  try {
    // Use AssemblyAI service instead of Hugging Face
    // This will ensure we're using the actual transcription service
    const assemblyAIService = await import("./assemblyaiService");
    return await assemblyAIService.transcribeAudio(audioBlob);
  } catch (error) {
    console.error("Error transcribing audio:", error);
    throw new Error(
      "Failed to transcribe audio. Please check your microphone and try again.",
    );
  }
}

/**
 * Generate SQL from natural language query using Hugging Face's text generation models
 * @param query - The natural language query
 * @param tableSchema - Optional table schema information
 * @returns Object containing the generated SQL and the original query
 */
export async function generateSql(
  query: string,
  tableSchema?: string,
): Promise<{ sql: string; naturalLanguageQuery: string }> {
  try {
    // Using a free text generation model
    const model = "gpt2";

    // Construct prompt based on whether table schema is provided
    let prompt = `Convert this natural language query to SQL:\n\n`;

    if (tableSchema) {
      prompt += `Table Schema:\n${tableSchema}\n\n`;
    }

    prompt += `Query: ${query}\n\nSQL:`;

    // Make request to Hugging Face Inference API
    const response = await fetch(`${HF_API_URL}/${model}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 100,
          temperature: 0.2,
          return_full_text: false,
        },
      }),
    });

    if (!response.ok) {
      // Fallback to mock SQL generation for demo purposes
      console.warn("Hugging Face API failed, using mock SQL generation");
      return mockGenerateSql(query);
    }

    const result = await response.json();
    const generatedText = Array.isArray(result)
      ? result[0].generated_text
      : result.generated_text;

    // Clean up the SQL (remove markdown code blocks if present)
    const cleanedSql = generatedText.replace(/```sql|```/g, "").trim();

    return {
      sql: cleanedSql || mockGenerateSql(query).sql,
      naturalLanguageQuery: query,
    };
  } catch (error) {
    console.error("Error generating SQL:", error);
    // Fallback to mock SQL generation for demo purposes
    return mockGenerateSql(query);
  }
}

/**
 * Extract text from a PDF or image file using Hugging Face's OCR models
 * @param file - The file to extract text from
 * @returns A promise that resolves to the extracted text
 */
export async function extractTextFromPdf(file: File): Promise<string> {
  try {
    // Using a free OCR model
    const model = "microsoft/trocr-base-printed";

    // Convert file to base64
    const base64Data = await fileToBase64(file);

    // Make request to Hugging Face Inference API
    const response = await fetch(`${HF_API_URL}/${model}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: base64Data,
      }),
    });

    if (!response.ok) {
      // Fallback to mock text extraction for demo purposes
      console.warn("Hugging Face API failed, using mock text extraction");
      return mockExtractText(file.name);
    }

    const result = await response.json();
    return result.text || mockExtractText(file.name);
  } catch (error) {
    console.error("Error extracting text:", error);
    // Fallback to mock text extraction for demo purposes
    return mockExtractText(file.name);
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

// Mock functions for fallback when API is unavailable

function mockTranscribeAudio(): string {
  const mockQueries = [
    "Show me all customers who made purchases last month",
    "Find the total sales by region for the last quarter",
    "List the top 5 products by revenue",
    "Show me all orders with status pending",
    "Count the number of customers by country",
  ];
  return mockQueries[Math.floor(Math.random() * mockQueries.length)];
}

function mockGenerateSql(query: string): {
  sql: string;
  naturalLanguageQuery: string;
} {
  let sql = "";

  if (
    query.toLowerCase().includes("customer") &&
    query.toLowerCase().includes("purchase")
  ) {
    sql =
      "SELECT c.customer_name, o.order_date, o.total_amount \nFROM customers c \nJOIN orders o ON c.customer_id = o.customer_id \nWHERE o.order_date >= DATE_SUB(CURRENT_DATE, INTERVAL 1 MONTH) \nORDER BY o.order_date DESC;";
  } else if (
    query.toLowerCase().includes("sales") &&
    query.toLowerCase().includes("region")
  ) {
    sql =
      "SELECT r.region_name, SUM(o.total_amount) as total_sales \nFROM orders o \nJOIN customers c ON o.customer_id = c.customer_id \nJOIN regions r ON c.region_id = r.region_id \nWHERE o.order_date >= DATE_SUB(CURRENT_DATE, INTERVAL 3 MONTH) \nGROUP BY r.region_name \nORDER BY total_sales DESC;";
  } else if (
    query.toLowerCase().includes("product") &&
    query.toLowerCase().includes("revenue")
  ) {
    sql =
      "SELECT p.product_name, SUM(oi.quantity * oi.unit_price) as revenue \nFROM order_items oi \nJOIN products p ON oi.product_id = p.product_id \nGROUP BY p.product_name \nORDER BY revenue DESC \nLIMIT 5;";
  } else if (
    query.toLowerCase().includes("order") &&
    query.toLowerCase().includes("pending")
  ) {
    sql =
      "SELECT o.order_id, c.customer_name, o.order_date, o.total_amount \nFROM orders o \nJOIN customers c ON o.customer_id = c.customer_id \nWHERE o.status = 'pending' \nORDER BY o.order_date;";
  } else if (
    query.toLowerCase().includes("customer") &&
    query.toLowerCase().includes("country")
  ) {
    sql =
      "SELECT country, COUNT(*) as customer_count \nFROM customers \nGROUP BY country \nORDER BY customer_count DESC;";
  } else {
    sql = "SELECT * FROM table_name WHERE condition = 'value';";
  }

  return {
    sql,
    naturalLanguageQuery: query,
  };
}

function mockExtractText(filename: string): string {
  return `This is extracted text from ${filename}. \n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget aliquam nisl nisl eget nisl. Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget aliquam nisl nisl eget nisl.\n\nSample data:\n- Item 1: Value 1\n- Item 2: Value 2\n- Item 3: Value 3\n\nThank you for using our text extraction service!`;
}
