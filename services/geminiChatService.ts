
import { GoogleGenAI, Content, FunctionDeclaration, Type } from "@google/genai";
import { ChatMessage, AIResponse, AISheetEdit } from '../types';

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

const updateCellsFunctionDeclaration: FunctionDeclaration = {
    name: 'updateCells',
    description: 'Modifies one or more cells in the spreadsheet. Use this for adding, changing, or clearing data. Can be used to add new rows or columns if the cell address is outside the current range.',
    parameters: {
        type: Type.OBJECT,
        properties: {
            updates: {
                type: Type.ARRAY,
                description: 'An array of cell updates to perform.',
                items: {
                    type: Type.OBJECT,
                    properties: {
                        cellAddress: {
                            type: Type.STRING,
                            description: 'The address of the cell to update (e.g., "A1", "C5").'
                        },
                        newValue: {
                            type: Type.STRING,
                            description: 'The new value or formula for the cell.'
                        }
                    },
                    required: ['cellAddress', 'newValue']
                }
            }
        },
        required: ['updates']
    }
};


export const getChatResponse = async (history: ChatMessage[], sheetData: string[][]): Promise<AIResponse> => {
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
            model: "gemini-2.5-flash",
            contents: contents,
            config: {
                tools: [{ functionDeclarations: [updateCellsFunctionDeclaration] }],
                systemInstruction: `You are a spreadsheet AI assistant. Your primary function is to modify the spreadsheet based on user requests using the available tools.
- When a user asks to modify the sheet, you MUST use the 'updateCells' tool.
- Do not engage in conversation or ask for confirmation. Perform the action directly.
- Your response should only be the tool call, without any additional text.
- Analyze the provided CSV data to understand the context of the sheet before making changes. For example, to "add a total row", you need to find the last row with data and the columns that should be summed.

CURRENT SHEET DATA (first 50 rows):
${csvData.split('\n').slice(0, 50).join('\n')}`,
                thinkingConfig: { thinkingBudget: 8192 } 
            },
        });

        if (response.functionCalls && response.functionCalls.length > 0) {
            const [call] = response.functionCalls;
            if (call.name === 'updateCells' && call.args.updates) {
                // The API may return a single object or an array, so we normalize it.
                const updates = Array.isArray(call.args.updates) ? call.args.updates : [call.args.updates];

                const sheetEdit: AISheetEdit = {
                   updates: updates.map((u: any) => ({
                       cellAddress: u.cellAddress,
                       newValue: String(u.newValue) // Ensure newValue is a string
                   }))
                };
                return { type: 'sheet_edit', edit: sheetEdit };
            }
        }
        
        const responseText = response.text;
        if (responseText && responseText.trim()) {
            return { type: 'text', content: responseText };
        }
        
        // If there's no function call and no text, it's likely an error or a malformed response from the model.
        return { type: 'text', content: "I'm sorry, I wasn't able to process that request. Could you please try rephrasing it?" };

    } catch (error) {
        console.error("Error getting chat response from Gemini:", error);
        throw new Error("Failed to get response from AI assistant.");
    }
};