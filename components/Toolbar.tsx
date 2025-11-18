import React from 'react';

interface ToolbarProps {
    onAddRow: () => void;
    onAddCol: () => void;
    onOpenChat: () => void;
    onUndo: () => void;
    onRedo: () => void;
    canUndo: boolean;
    canRedo: boolean;
    onToggleFilterBar: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ onAddRow, onAddCol, onOpenChat, onUndo, onRedo, canUndo, canRedo, onToggleFilterBar }) => {
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
                    <div className="h-6 w-px bg-slate-700 mx-1"></div>
                    <button
                        onClick={onUndo}
                        disabled={!canUndo}
                        className="p-2 text-sm font-medium text-white bg-slate-700/80 border border-transparent rounded-md shadow-sm hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Undo"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                           <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                        </svg>
                    </button>
                    <button
                        onClick={onRedo}
                        disabled={!canRedo}
                        className="p-2 text-sm font-medium text-white bg-slate-700/80 border border-transparent rounded-md shadow-sm hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Redo"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                           <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l6-6m0 0l-6-6m6 6H3a6 6 0 000 12h3" />
                        </svg>
                    </button>
                     <div className="h-6 w-px bg-slate-700 mx-1"></div>
                    <button
                        onClick={onToggleFilterBar}
                        className="p-2 text-sm font-medium text-white bg-slate-700/80 border border-transparent rounded-md shadow-sm hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 focus:ring-offset-slate-900"
                        aria-label="Toggle Filter Bar"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                           <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 12.414V17a1 1 0 01-1.447.894l-4-2A1 1 0 016 15v-2.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
                <div className="flex-grow"></div>
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