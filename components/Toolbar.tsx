
import React, { useState } from 'react';

interface ToolbarProps {
    onAddRow: () => void;
    onAddCol: () => void;
    onGenerateData: (prompt: string) => Promise<void>;
    onOpenChat: () => void;
    isGenerating: boolean;
}

const Toolbar: React.FC<ToolbarProps> = ({ onAddRow, onAddCol, onGenerateData, onOpenChat, isGenerating }) => {
    const [prompt, setPrompt] = useState<string>('Monthly budget for a small startup with 5 employees');
    
    const handleGenerateClick = () => {
        if(prompt.trim()) {
            onGenerateData(prompt);
        }
    };

    return (
        <div className="p-3 bg-slate-900/80 sticky top-0 z-20 backdrop-blur-sm border-b border-slate-800">
            <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                     <button
                        onClick={onAddRow}
                        className="px-4 py-2 text-sm font-medium text-white bg-violet-600 border border-transparent rounded-md shadow-sm hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 focus:ring-offset-slate-900"
                    >
                        Add Row
                    </button>
                    <button
                        onClick={onAddCol}
                        className="px-4 py-2 text-sm font-medium text-white bg-violet-600 border border-transparent rounded-md shadow-sm hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 focus:ring-offset-slate-900"
                    >
                        Add Column
                    </button>
                </div>
                <div className="flex-grow flex items-center gap-2 min-w-[300px]">
                    <input
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Describe the data to generate..."
                        className="flex-grow block w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-violet-500 focus:border-violet-500 sm:text-sm"
                    />
                    <button
                        onClick={handleGenerateClick}
                        disabled={isGenerating}
                        className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-400/50 disabled:cursor-not-allowed focus:ring-offset-slate-900"
                    >
                        {isGenerating ? (
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : 'Generate AI Data'}
                    </button>
                </div>
                 <div className="flex items-center gap-2">
                    <button
                        onClick={onOpenChat}
                        className="p-2 text-sm font-medium text-white bg-slate-700 border border-transparent rounded-md shadow-sm hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 focus:ring-offset-slate-900"
                        aria-label="Open AI Assistant"
                    >
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Toolbar;