
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Toolbar from './components/Toolbar';
import Sheet from './components/Sheet';
import ChatModal from './components/ChatModal';
import FilterBar from './components/FilterBar';
import { generateSheetData } from './services/geminiService';
import { getChatResponse } from './services/geminiChatService';
import { ChatMessage, ColumnOptions, Filter, SortDirection } from './types';

const DEFAULT_ROWS = 20;
const DEFAULT_COLS = 10;

const createInitialData = (rows: number, cols: number): string[][] => {
    return Array.from({ length: rows }, () => Array(cols).fill(''));
};

const App: React.FC = () => {
    const [sheetData, setSheetData] = useState<string[][]>(createInitialData(DEFAULT_ROWS, DEFAULT_COLS));
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [isChatGenerating, setIsChatGenerating] = useState<boolean>(false);

    const numCols = sheetData[0]?.length || DEFAULT_COLS;
    const [columnOptions, setColumnOptions] = useState<ColumnOptions[]>(() => Array(numCols).fill({ sort: null, filter: null }));
    const [activeFilterColumn, setActiveFilterColumn] = useState<number | null>(null);
    
    useEffect(() => {
        if(columnOptions.length < numCols) {
            setColumnOptions(prev => [...prev, ...Array(numCols - prev.length).fill({ sort: null, filter: null })]);
        }
    }, [numCols, columnOptions.length]);

    const handleAddRow = () => {
        setSheetData(prevData => [...prevData, Array(numCols).fill('')]);
    };

    const handleAddCol = () => {
        setSheetData(prevData => {
            const maxCols = Math.max(DEFAULT_COLS, ...prevData.map(r => r.length));
            return prevData.map(row => {
                const newRow = [...row];
                while(newRow.length < maxCols) newRow.push('');
                newRow.push('');
                return newRow;
            })
        });
    };

    const handleGenerateData = async (prompt: string) => {
        setIsGenerating(true);
        setError(null);
        try {
            const newData = await generateSheetData(prompt);
            if(newData.length > 0) {
                const maxCols = Math.max(...newData.map(row => row.length));
                const sanitizedData = newData.map(row => {
                    const newRow = [...row];
                    while(newRow.length < maxCols) {
                        newRow.push('');
                    }
                    return newRow;
                });
                setSheetData(sanitizedData);
                 setColumnOptions(Array(maxCols).fill({ sort: null, filter: null }));
                 setActiveFilterColumn(null);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSendMessage = async (message: string) => {
        const newMessages: ChatMessage[] = [...chatMessages, { sender: 'user', text: message }];
        setChatMessages(newMessages);
        setIsChatGenerating(true);
        setError(null);

        try {
            const responseText = await getChatResponse(newMessages, sheetData);
            setChatMessages(prev => [...prev, { sender: 'ai', text: responseText }]);
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(errorMsg);
            setChatMessages(prev => [...prev, { sender: 'ai', text: `Sorry, I encountered an error: ${errorMsg}` }]);
        } finally {
            setIsChatGenerating(false);
        }
    };

    const handleSort = (colIndex: number, direction: SortDirection) => {
        const newOptions = columnOptions.map((opt, i) => i === colIndex ? { ...opt, sort: direction } : { ...opt, sort: null });
        setColumnOptions(newOptions);
        setActiveFilterColumn(null);
    };

    const handleFilterChange = (colIndex: number, filter: Filter | null) => {
        const newOptions = [...columnOptions];
        newOptions[colIndex] = { ...newOptions[colIndex], filter };
        setColumnOptions(newOptions);
    };

    const getColumnName = (colIndex: number) => {
        let name = '';
        let n = colIndex;
        while (n >= 0) {
            name = String.fromCharCode(n % 26 + 65) + name;
            n = Math.floor(n / 26) - 1;
        }
        return name;
    };


    return (
        <div className="h-screen w-screen flex flex-col font-sans bg-slate-950">
            <Header />
            <main className="flex-grow flex flex-col overflow-hidden">
                <Toolbar
                    onAddRow={handleAddRow}
                    onAddCol={handleAddCol}
                    onGenerateData={handleGenerateData}
                    isGenerating={isGenerating}
                    onOpenChat={() => setIsChatOpen(true)}
                />
                <FilterBar
                    activeColumn={activeFilterColumn !== null ? { index: activeFilterColumn, name: getColumnName(activeFilterColumn) } : null}
                    columnOptions={activeFilterColumn !== null ? columnOptions[activeFilterColumn] : undefined}
                    onClose={() => setActiveFilterColumn(null)}
                    onFilterChange={(filter) => activeFilterColumn !== null && handleFilterChange(activeFilterColumn, filter)}
                    onSort={(dir) => activeFilterColumn !== null && handleSort(activeFilterColumn, dir)}
                />
                {error && (
                    <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-md m-4" role="alert">
                        <strong className="font-bold">Error: </strong>
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}
                <div className="flex-grow overflow-auto">
                   <Sheet 
                        data={sheetData} 
                        setData={setSheetData} 
                        columnOptions={columnOptions}
                        activeFilterColumn={activeFilterColumn}
                        setActiveFilterColumn={setActiveFilterColumn}
                    />
                </div>
            </main>
            <ChatModal
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
                messages={chatMessages}
                onSendMessage={handleSendMessage}
                isGenerating={isChatGenerating}
            />
        </div>
    );
};

export default App;