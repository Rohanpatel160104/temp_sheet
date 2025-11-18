
import { GoogleGenAI, Content } from "@google/genai";
import { ChatMessage } from '../types';

const dataToCsv = (data: string[][]): string => {
    return data.map(row => 
        row.map(cell => {
            const strCell = String(cell || '');
            if (/[",\n]/.test(strCell)) {
                return `"${strCell.replace(/"/g, '""')}"`;
            }
            return strCell;
        }).join(',')
    ).join('\n');
};


export const getChatResponse = async (history: ChatMessage[], sheetData: string[][]): Promise<string> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const csvData = dataToCsv(sheetData.filter(row => row.some(cell => cell.trim() !== '')));

    const contents: Content[] = history.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
    }));
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: contents,
            config: {
                systemInstruction: `You are an expert spreadsheet assistant called TempSheet AI. Your purpose is to help users understand and manipulate their data. Analyze the user's request and the provided spreadsheet data, which is in CSV format. Provide helpful answers, insights, formulas, or suggestions. Be concise and clear. When providing formulas, explain them briefly. Do not surround your response with markdown fences unless it's a code block.\n\nCURRENT SHEET DATA:\n${csvData}`,
                thinkingConfig: { thinkingBudget: 8192 } 
            },
        });

        return response.text;
    } catch (error) {
        console.error("Error getting chat response from Gemini:", error);
        throw new Error("Failed to get response from AI assistant.");
    }
};
