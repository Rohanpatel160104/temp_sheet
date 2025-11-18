
import React, { useState } from 'react';
import Header from './components/Header';
import Toolbar from './components/Toolbar';
import Sheet from './components/Sheet';
import { generateSheetData } from './services/geminiService';

const DEFAULT_ROWS = 20;
const DEFAULT_COLS = 10;

const createInitialData = (rows: number, cols: number): string[][] => {
    return Array.from({ length: rows }, () => Array(cols).fill(''));
};

const App: React.FC = () => {
    const [sheetData, setSheetData] = useState<string[][]>(createInitialData(DEFAULT_ROWS, DEFAULT_COLS));
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleAddRow = () => {
        const numCols = sheetData[0]?.length || DEFAULT_COLS;
        setSheetData(prevData => [...prevData, Array(numCols).fill('')]);
    };

    const handleAddCol = () => {
        setSheetData(prevData => prevData.map(row => [...row, '']));
    };

    const handleGenerateData = async (prompt: string) => {
        setIsGenerating(true);
        setError(null);
        try {
            const newData = await generateSheetData(prompt);
            if(newData.length > 0) {
                // Ensure all rows have the same number of columns
                const maxCols = Math.max(...newData.map(row => row.length));
                const sanitizedData = newData.map(row => {
                    const newRow = [...row];
                    while(newRow.length < maxCols) {
                        newRow.push('');
                    }
                    return newRow;
                });
                setSheetData(sanitizedData);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsGenerating(false);
        }
    };


    return (
        <div className="h-screen w-screen flex flex-col font-sans">
            <Header />
            <main className="flex-grow flex flex-col overflow-hidden">
                <Toolbar
                    onAddRow={handleAddRow}
                    onAddCol={handleAddCol}
                    onGenerateData={handleGenerateData}
                    isGenerating={isGenerating}
                />
                {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 m-4" role="alert">
                        <p className="font-bold">Error</p>
                        <p>{error}</p>
                    </div>
                )}
                <div className="flex-grow overflow-auto">
                   <Sheet data={sheetData} setData={setSheetData} />
                </div>
            </main>
        </div>
    );
};

export default App;
