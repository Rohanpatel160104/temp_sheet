
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
                systemInstruction: `You are a direct-action spreadsheet assistant. Your only goal is to modify the spreadsheet using the tools provided.
When a user asks for a change, you MUST call the 'updateCells' function to apply it.
Do not engage in conversation, do not ask for confirmation, and do not describe the changes you are making.
Directly output the function call to perform the requested action.
Analyze the provided CSV data to understand the context of the sheet before making changes. For example, if the user asks to "add a total row", find the last data row and the columns with numbers to sum up.

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
        
        return { type: 'text', content: response.text || '' };

    } catch (error) {
        console.error("Error getting chat response from Gemini:", error);
        throw new Error("Failed to get response from AI assistant.");
    }
};