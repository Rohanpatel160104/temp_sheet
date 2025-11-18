
import React, { useState, useEffect, useRef } from 'react';

interface CellProps {
    value: string;
    isEditing: boolean;
    onDoubleClick: () => void;
    onChange: (newValue: string) => void;
    onBlur: () => void;
    onNavigate: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

const Cell: React.FC<CellProps> = ({ value, isEditing, onDoubleClick, onChange, onBlur, onNavigate }) => {
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditing) {
            inputRef.current?.focus();
            inputRef.current?.select();
        }
    }, [isEditing]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === 'Escape' || e.key === 'Tab' || e.key.startsWith('Arrow')) {
            onNavigate(e);
        }
    };

    if (isEditing) {
        return (
            <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onBlur={onBlur}
                onKeyDown={handleKeyDown}
                className="w-full h-full p-2 box-border bg-indigo-100 dark:bg-slate-700 text-slate-900 dark:text-white outline-none ring-2 ring-indigo-500"
            />
        );
    }

    return (
        <div 
            onDoubleClick={onDoubleClick}
            className="w-full h-full p-2 truncate cursor-cell"
        >
            {value}
        </div>
    );
};

export default Cell;
