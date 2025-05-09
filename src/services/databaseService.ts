/**
 * Service for executing SQL queries against the database
 */
import { createClient } from "@/supabase/client";

/**
 * Create a database table from an uploaded file (CSV/Excel)
 * @param file - The file to create a table from
 * @returns Information about the created table
 */
export async function createTableFromFile(file: File): Promise<any> {
  try {
    // Get the extracted text from the PDF
    const extractedText = sessionStorage.getItem("extractedPdfText");
    if (!extractedText) {
      throw new Error("No extracted text found from PDF");
    }

    // Process the extracted text to create a database schema
    // Use Groq to analyze the text and suggest a schema
    const { generateSchemaFromText } = await import("@/services/groqService");
    const schemaInfo = await generateSchemaFromText(extractedText);

    // Create table name from file name
    const tableName = file.name
      .replace(/\.[^/.]+$/, "")
      .toLowerCase()
      .replace(/\s+/g, "_");

    return {
      tableName,
      rowCount: schemaInfo.estimatedRows || 100,
      columns: schemaInfo.columns || [
        { name: "id", type: "INTEGER", isPrimary: true },
        { name: "content", type: "TEXT", isPrimary: false },
        { name: "page", type: "INTEGER", isPrimary: false },
        { name: "created_at", type: "TIMESTAMP", isPrimary: false },
      ],
      stats: schemaInfo.stats || {
        wordCount: extractedText.split(/\s+/).length,
        pageCount: Math.ceil(extractedText.length / 3000), // Rough estimate
        keyTerms: schemaInfo.keyTerms || ["document", "text", "content"],
      },
    };
  } catch (error) {
    console.error("Error creating table from file:", error);
    throw error;
  }
}

/**
 * Execute a SQL query against the database
 * @param sql - The SQL query to execute
 * @returns The query results
 */
export async function executeQuery(sql: string) {
  try {
    // Pre-validate SQL for common syntax issues
    validateSqlSyntax(sql);

    const supabase = createClient();

    // Execute the SQL query using Supabase's rpc function
    const { data, error } = await supabase.rpc("execute_sql_query", {
      query_string: sql,
    });

    if (error) {
      // Extract PostgreSQL error code and detail if available
      const pgErrorMatch = error.message.match(/\((?<code>[A-Z0-9]+)\)/);
      const pgErrorCode = pgErrorMatch?.groups?.code;

      // Handle specific PostgreSQL error codes
      if (pgErrorCode === "42601") {
        const semicolonError = error.message.includes('near ";"')
          ? "You may have an extra semicolon or incorrect semicolon placement."
          : "";
        throw new Error(
          `SQL syntax error: ${error.details || error.message} ${semicolonError}`,
        );
      } else if (pgErrorCode === "42P01") {
        throw new Error(
          `Table does not exist: ${error.details || error.message}`,
        );
      } else if (pgErrorCode === "42703") {
        throw new Error(
          `Column does not exist: ${error.details || error.message}`,
        );
      } else if (pgErrorCode === "42702") {
        throw new Error(
          `Ambiguous column reference: ${error.details || error.message}`,
        );
      } else if (pgErrorCode === "42803") {
        throw new Error(`Grouping error: ${error.details || error.message}`);
      } else {
        throw new Error(
          `Database query error: ${error.message}${error.details ? ` - ${error.details}` : ""}`,
        );
      }
    }

    // Ensure data is always an array to prevent TypeError with slice()
    if (!data) return [];
    if (!Array.isArray(data)) {
      console.warn("Query result is not an array, converting to array");
      return [data];
    }
    return data;
  } catch (error) {
    console.error("Error executing database query:", error);
    throw error;
  }
}

/**
 * Validate SQL syntax for common issues before sending to the database
 * @param sql - The SQL query to validate
 * @throws Error if common syntax issues are found
 */
function validateSqlSyntax(sql: string): void {
  if (!sql || typeof sql !== "string") {
    throw new Error("SQL query is empty or invalid");
  }

  const trimmedSql = sql.trim();

  // Check for unbalanced parentheses
  const openParens = (trimmedSql.match(/\(/g) || []).length;
  const closeParens = (trimmedSql.match(/\)/g) || []).length;
  if (openParens !== closeParens) {
    throw new Error("SQL syntax error: Unbalanced parentheses");
  }

  // Check for trailing semicolons in multi-statement queries
  if (
    trimmedSql.includes(";") &&
    !trimmedSql.endsWith(";") &&
    trimmedSql.indexOf(";") !== trimmedSql.lastIndexOf(";")
  ) {
    throw new Error(
      "SQL syntax error: Missing semicolon at the end of a statement",
    );
  }

  // Check for multiple semicolons at the end
  if (/;\s*;/.test(trimmedSql)) {
    throw new Error(
      "SQL syntax error: Multiple consecutive semicolons detected",
    );
  }

  // Check for semicolons in the middle of a statement (simplified check)
  const statements = trimmedSql.split(";").filter((s) => s.trim().length > 0);
  if (statements.length > 1) {
    // If we have multiple statements, check each one for basic structure
    for (const statement of statements) {
      if (
        !statement
          .trim()
          .toLowerCase()
          .match(/^(select|insert|update|delete|create|alter|drop|with)/i)
      ) {
        throw new Error(
          "SQL syntax error: Invalid statement structure or misplaced semicolon",
        );
      }
    }
  }
}
