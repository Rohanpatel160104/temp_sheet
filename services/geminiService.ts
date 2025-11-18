
import { GoogleGenAI, Type } from "@google/genai";

export const generateSheetData = async (prompt: string): Promise<string[][]> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Based on the following prompt, generate a table of data with a header row. The data should be relevant to the prompt. Prompt: "${prompt}"`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        data: {
                            type: Type.ARRAY,
                            description: "A 2D array representing the sheet data. The first inner array should be the headers.",
                            items: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.STRING,
                                    description: "A cell value, which can be a header or data."
                                }
                            }
                        }
                    },
                    required: ["data"]
                }
            },
        });

        const jsonString = response.text.trim();
        const parsed = JSON.parse(jsonString);
        
        if (parsed && Array.isArray(parsed.data) && parsed.data.every((row: any) => Array.isArray(row))) {
             return parsed.data as string[][];
        } else {
            throw new Error("Invalid data structure received from API.");
        }

    } catch (error) {
        console.error("Error generating data with Gemini:", error);
        throw new Error("Failed to generate sheet data. Please check your prompt and API key.");
    }
};
