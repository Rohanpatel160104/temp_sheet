
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Toolbar from './components/Toolbar';
import Sheet from './components/Sheet';
import ChatModal from './components/ChatModal';
import FilterBar from './components/FilterBar';
import FormulaBar from './components/FormulaBar';
import { generateSheetData } from './services/geminiService';
import { getChatResponse } from './services/geminiChatService';
import { ChatMessage, ColumnOptions, Filter, SortDirection, Selection } from './types';
import { useHistory } from './hooks/useHistory';

const DEFAULT_ROWS = 20;
const DEFAULT_COLS = 10;
const DEFAULT_COL_WIDTH = 120;

const createInitialData = (rows: number, cols: number): string[][] => {
    return Array.from({ length: rows }, () => Array(cols).fill(''));
};

const App: React.FC = () => {
    const { 
        state: sheetData, 
        setState: setSheetData, 
        undo, 
        redo, 
        canUndo, 
        canRedo, 
        reset: resetSheetData 
    } = useHistory<string[][]>(createInitialData(DEFAULT_ROWS, DEFAULT_COLS));
    
    const [error, setError] = useState<string | null>(null);

    const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [isChatGenerating, setIsChatGenerating] = useState<boolean>(false);

    const numCols = sheetData[0]?.length || DEFAULT_COLS;
    const [columnOptions, setColumnOptions] = useState<ColumnOptions[]>(() => Array(numCols).fill({ sort: null, filter: null }));
    const [columnWidths, setColumnWidths] = useState<number[]>(() => Array(numCols).fill(DEFAULT_COL_WIDTH));
    const [activeFilterColumn, setActiveFilterColumn] = useState<number | null>(null);
    const [selection, setSelection] = useState<Selection>({ 
        anchor: { row: 0, col: 0 },
        focus: { row: 0, col: 0 },
    });

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const activeEl = document.activeElement;
            const isInputFocused = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || (activeEl as HTMLElement).isContentEditable);

            if (isInputFocused) {
                return;
            }

            const isMac = navigator.platform.toUpperCase().includes('MAC');
            const isUndo = (isMac ? e.metaKey && !e.shiftKey : e.ctrlKey) && e.key.toLowerCase() === 'z';
            const isRedo = ((isMac ? e.metaKey && e.shiftKey : e.ctrlKey) && e.key.toLowerCase() === 'z') || (!isMac && e.ctrlKey && e.key.toLowerCase() === 'y');

            if (isUndo) {
                e.preventDefault();
                undo();
            } else if (isRedo) {
                e.preventDefault();
                redo();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [undo, redo]);
    
    useEffect(() => {
        const currentCols = sheetData[0]?.length || 0;
        if (columnOptions.length < currentCols) {
            const diff = currentCols - columnOptions.length;
            setColumnOptions(prev => [...prev, ...Array(diff).fill({ sort: null, filter: null })]);
            setColumnWidths(prev => [...prev, ...Array(diff).fill(DEFAULT_COL_WIDTH)]);
        }
    }, [sheetData, columnOptions.length]);

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
    
    const handleToggleFilterBar = () => {
        setActiveFilterColumn(prev => prev === selection.focus.col ? null : selection.focus.col);
    };
    
    const handleCellCommit = (row: number, col: number, value: string) => {
        setSheetData(prevData => {
            const newData = prevData.map(r => [...r]);
            if (newData[row]) {
                newData[row][col] = value;
            }
            return newData;
        });
    };

    const handleColumnResize = (colIndex: number, newWidth: number) => {
        setColumnWidths(prev => {
            const newWidths = [...prev];
            newWidths[colIndex] = Math.max(40, newWidth); // Min width
            return newWidths;
        });
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
                    onOpenChat={() => setIsChatOpen(true)}
                    onUndo={undo}
                    onRedo={redo}
                    canUndo={canUndo}
                    canRedo={canRedo}
                    onToggleFilterBar={handleToggleFilterBar}
                />
                <FormulaBar
                    activeCellAddress={`${getColumnName(selection.focus.col)}${selection.focus.row + 1}`}
                    value={sheetData[selection.focus.row]?.[selection.focus.col] || ''}
                    onChange={(newValue) => handleCellCommit(selection.focus.row, selection.focus.col, newValue)}
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
                        selection={selection}
                        setSelection={setSelection}
                        columnWidths={columnWidths}
                        onColumnResize={handleColumnResize}
                    />
                </div>
            </main>
            <ChatModal
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
                messages={chatMessages}
                onSendMessage={handleSendMessage}
                // Fix: Pass isChatGenerating state to the isGenerating prop.
                isGenerating={isChatGenerating}
            />
        </div>
    );
};

export default App;