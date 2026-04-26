/**
 * AI Service for Claim Atomization
 * Integrates with the ngrok AI service
 */

const AI_BASE_URL = "https://unthread-skies-sloppily.ngrok-free.dev";

export interface ClaimExtractionResponse {
  claims?: string[];
  // If the API returns a direct array, we handle it in the service
}

export const AIService = {
  /**
   * Extracts atomic claims from a rumor text
   */
  extractClaims: async (text: string): Promise<string[]> => {
    try {
      const response = await fetch(`${AI_BASE_URL}/extract_claims`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error(`AI Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Handle different possible response formats
      if (Array.isArray(data)) return data;
      if (data && typeof data === "object" && Array.isArray(data.claims)) return data.claims;
      if (typeof data === "string") {
        try {
          const parsed = JSON.parse(data);
          if (Array.isArray(parsed)) return parsed;
        } catch {
          return [data];
        }
      }
      
      return [];
    } catch (error) {
      console.error("Failed to extract claims:", error);
      throw error;
    }
  },

  /**
   * Scores a claim (e.g. for veracity or impact)
   */
  scoreClaim: async (claim: string): Promise<any> => {
    try {
      const response = await fetch(`${AI_BASE_URL}/score_claim`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({ claim }),
      });

      if (!response.ok) throw new Error(`AI Error: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("Failed to score claim:", error);
      throw error;
    }
  }
};
