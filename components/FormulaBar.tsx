
import React, { useState, useEffect } from 'react';

interface FormulaBarProps {
    activeCellAddress: string;
    value: string;
    onChange: (newValue: string) => void;
}

const FormulaBar: React.FC<FormulaBarProps> = ({ activeCellAddress, value, onChange }) => {
    const [inputValue, setInputValue] = useState(value);

    useEffect(() => {
        setInputValue(value);
    }, [value, activeCellAddress]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (inputValue !== value) {
                onChange(inputValue);
            }
            (e.target as HTMLInputElement).blur();
        } else if (e.key === 'Escape') {
            setInputValue(value); // Revert changes
            (e.target as HTMLInputElement).blur();
        }
    };
    
    const handleBlur = () => {
        if (inputValue !== value) {
            onChange(inputValue);
        }
    };

    return (
        <div className="p-2 bg-slate-900 border-b border-slate-800 flex items-center gap-3 text-sm sticky top-[69px] z-20">
            <div className="font-mono text-slate-400 p-2 text-center bg-slate-800/50 border border-slate-700 rounded-md w-20 select-none">
                {activeCellAddress}
            </div>
            <div className="flex-grow relative">
                <i className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 italic text-xs select-none">fx</i>
                <input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onBlur={handleBlur}
                    className="w-full pl-9 pr-3 py-2 bg-slate-800/50 border border-slate-700 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    aria-label="Formula Input"
                />
            </div>
        </div>
    );
};

export default FormulaBar;
