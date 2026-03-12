import { GoogleGenAI } from "@google/genai";

let ai: GoogleGenAI | null = null;

const getAI = () => {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not set. AI features will not work.");
      return null;
    }
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
};

export interface TollStation {
  name: string;
  fee: number;
}

export interface TollEstimate {
  stations: TollStation[];
  totalFee: number;
  distance: string;
  duration: string;
  routeDescription: string;
}

export const estimateTollFees = async (start: string, end: string): Promise<TollEstimate> => {
  try {
    const aiClient = getAI();
    if (!aiClient) {
      throw new Error("AI client is not initialized. Please check your API key.");
    }

    const prompt = `
      I am planning a taxi trip in Vietnam from "${start}" to "${end}".
      Please estimate the toll fees for a standard 4-seater car (xe con/taxi 4 chỗ) for the most common route.
      List the toll stations the driver will likely pass through and their approximate fees in VND.
      Also estimate the distance and duration.
      
      Return the response in the following JSON format ONLY:
      {
        "stations": [
          { "name": "Station Name", "fee": 35000 }
        ],
        "totalFee": 100000,
        "distance": "120 km",
        "duration": "2 hours 30 mins",
        "routeDescription": "Brief description of the route (e.g., via QL5B)"
      }
    `;

    const response = await aiClient.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response from AI");
    }
    
    return JSON.parse(text) as TollEstimate;
  } catch (error) {
    console.error("Error estimating toll fees:", error);
    throw new Error("Failed to estimate toll fees. Please try again.");
  }
};
