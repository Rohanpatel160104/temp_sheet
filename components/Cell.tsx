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
    const committed = useRef(false); // To prevent double commits on blur after navigation

    useEffect(() => {
        if (isEditing) {
            escaped.current = false;
            committed.current = false; // Reset flags when editing starts
            setLocalValue(value);
            inputRef.current?.focus();
            inputRef.current?.select();
        }
    }, [isEditing, value]);

    const handleBlur = () => {
        // Only commit on blur if not escaped and not already committed by a key press
        if (!escaped.current && !committed.current && localValue !== value) {
            onChange(localValue);
        }
        onBlur();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Escape') {
            escaped.current = true;
            onNavigate(e);
        } else if (e.key === 'Enter' || e.key === 'Tab' || e.key.startsWith('Arrow')) {
            // Commit changes explicitly on navigation keys to make it feel "instant"
            if (localValue !== value) {
                committed.current = true;
                onChange(localValue);
            }
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
