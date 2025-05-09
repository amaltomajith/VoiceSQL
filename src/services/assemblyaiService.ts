/**
 * Service for interacting with the AssemblyAI API
 * Handles audio transcription
 */

// Constants
const ASSEMBLY_AI_API_URL = "https://api.assemblyai.com/v2";

/**
 * Transcribe audio to text using AssemblyAI's API
 * @param audioBlob - The audio blob to transcribe
 * @returns The transcribed text
 */
export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  try {
    // API key should be set in environment variables
    const apiKey = process.env.NEXT_PUBLIC_ASSEMBLY_AI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "AssemblyAI API key not found. Please set NEXT_PUBLIC_ASSEMBLY_AI_API_KEY in your environment variables.",
      );
    }

    // Step 1: Upload the audio file to AssemblyAI
    const uploadResponse = await fetch(`${ASSEMBLY_AI_API_URL}/upload`, {
      method: "POST",
      headers: {
        authorization: apiKey,
        "Content-Type": "application/octet-stream",
      },
      body: audioBlob,
    });

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json();
      throw new Error(
        `AssemblyAI upload error: ${errorData.error || uploadResponse.statusText}`,
      );
    }

    const uploadData = await uploadResponse.json();
    const audioUrl = uploadData.upload_url;

    // Step 2: Start the transcription process
    const transcriptResponse = await fetch(
      `${ASSEMBLY_AI_API_URL}/transcript`,
      {
        method: "POST",
        headers: {
          authorization: apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          audio_url: audioUrl,
        }),
      },
    );

    if (!transcriptResponse.ok) {
      const errorData = await transcriptResponse.json();
      throw new Error(
        `AssemblyAI transcription error: ${errorData.error || transcriptResponse.statusText}`,
      );
    }

    const transcriptData = await transcriptResponse.json();
    const transcriptId = transcriptData.id;

    // Step 3: Poll for the transcription result
    let result = { status: "processing" };
    while (result.status !== "completed" && result.status !== "error") {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for 1 second

      const resultResponse = await fetch(
        `${ASSEMBLY_AI_API_URL}/transcript/${transcriptId}`,
        {
          headers: {
            authorization: apiKey,
            "Content-Type": "application/json",
          },
        },
      );

      if (!resultResponse.ok) {
        const errorData = await resultResponse.json();
        throw new Error(
          `AssemblyAI polling error: ${errorData.error || resultResponse.statusText}`,
        );
      }

      result = await resultResponse.json();

      if (result.status === "error") {
        throw new Error(`AssemblyAI transcription failed: ${result.error}`);
      }
    }

    return result.text || "";
  } catch (error) {
    console.error("Error transcribing audio with AssemblyAI:", error);
    throw error;
  }
}
