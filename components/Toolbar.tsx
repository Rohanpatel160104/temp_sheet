
import React, { useState } from 'react';

interface ToolbarProps {
    onAddRow: () => void;
    onAddCol: () => void;
    onGenerateData: (prompt: string) => Promise<void>;
    isGenerating: boolean;
}

const Toolbar: React.FC<ToolbarProps> = ({ onAddRow, onAddCol, onGenerateData, isGenerating }) => {
    const [prompt, setPrompt] = useState<string>('Monthly budget for a small startup');
    
    const handleGenerateClick = () => {
        if(prompt.trim()) {
            onGenerateData(prompt);
        }
    };

    return (
        <div className="p-4 bg-white dark:bg-slate-800/50 sticky top-0 z-10 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700">
            <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                     <button
                        onClick={onAddRow}
                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-900"
                    >
                        Add Row
                    </button>
                    <button
                        onClick={onAddCol}
                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-900"
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
                        className="flex-grow block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                    <button
                        onClick={handleGenerateClick}
                        disabled={isGenerating}
                        className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-400 disabled:cursor-not-allowed dark:focus:ring-offset-slate-900"
                    >
                        {isGenerating ? (
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : 'Generate AI Data'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Toolbar;
