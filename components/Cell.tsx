import React, { useState, useEffect, useRef } from 'react';

interface CellProps {
    value: string;
    displayValue: string;
    isEditing: boolean;
    onDoubleClick: () => void;
    onChange: (newValue: string) => void;
    onBlur: () => void;
    onNavigate: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

const Cell: React.FC<CellProps> = ({ value, displayValue, isEditing, onDoubleClick, onChange, onBlur, onNavigate }) => {
    const [localValue, setLocalValue] = useState(value);
    const inputRef = useRef<HTMLInputElement>(null);
    const escaped = useRef(false);

    useEffect(() => {
        if (isEditing) {
            escaped.current = false;
            setLocalValue(value);
            inputRef.current?.focus();
            inputRef.current?.select();
        }
    }, [isEditing, value]);

    const handleBlur = () => {
        if (!escaped.current && localValue !== value) {
            onChange(localValue);
        }
        onBlur();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Escape') {
            escaped.current = true;
            onNavigate(e);
        } else if (e.key === 'Enter' || e.key === 'Tab' || e.key.startsWith('Arrow')) {
            onNavigate(e);
        }
    };

    if (isEditing) {
        return (
            <input
                ref={inputRef}
                type="text"
                value={localValue}
                onChange={(e) => setLocalValue(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                className="w-full h-full p-2 box-border bg-slate-700 text-slate-100 outline-none ring-2 ring-violet-500"
            />
        );
    }
    
    const isFormulaError = displayValue.startsWith('#');

    return (
        <div 
            onDoubleClick={onDoubleClick}
            className={`w-full h-full p-2 truncate cursor-cell ${isFormulaError ? 'text-red-400 font-mono text-xs' : ''}`}
        >
            {displayValue}
        </div>
    );
};

export default Cell;
