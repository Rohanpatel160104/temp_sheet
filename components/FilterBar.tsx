
import React, { useState, useEffect } from 'react';
import type { ColumnOptions, FilterCondition, Filter, SortDirection } from '../types';

const CONDITIONS: { key: FilterCondition, label: string, needsInput: boolean }[] = [
    { key: 'none', label: 'None', needsInput: false },
    { key: 'is_empty', label: 'Is empty', needsInput: false },
    { key: 'is_not_empty', label: 'Is not empty', needsInput: false },
    { key: 'text_contains', label: 'Text contains', needsInput: true },
    { key: 'text_not_contains', label: 'Text does not contain', needsInput: true },
    { key: 'text_starts_with', label: 'Text starts with', needsInput: true },
    { key: 'text_ends_with', label: 'Text ends with', needsInput: true },
    { key: 'text_is_exactly', label: 'Text is exactly', needsInput: true },
    { key: 'eq', label: 'Is equal to', needsInput: true },
    { key: 'neq', label: 'Is not equal to', needsInput: true },
    { key: 'gt', label: 'Greater than', needsInput: true },
    { key: 'gte', label: 'Greater than or equal to', needsInput: true },
    { key: 'lt', label: 'Less than', needsInput: true },
    { key: 'lte', label: 'Less than or equal to', needsInput: true },
];

interface FilterBarProps {
    activeColumn: { index: number; name: string } | null;
    columnOptions: ColumnOptions | undefined;
    onClose: () => void;
    onFilterChange: (filter: Filter | null) => void;
    onSort: (direction: SortDirection) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ activeColumn, columnOptions, onClose, onFilterChange, onSort }) => {
    const [selectedCondition, setSelectedCondition] = useState<FilterCondition>('none');
    const [filterValue, setFilterValue] = useState<string>('');

    useEffect(() => {
        if (activeColumn && columnOptions?.filter) {
            setSelectedCondition(columnOptions.filter.condition);
            setFilterValue(columnOptions.filter.value || '');
        } else {
            setSelectedCondition('none');
            setFilterValue('');
        }
    }, [activeColumn, columnOptions]);

    const handleConditionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newCondition = e.target.value as FilterCondition;
        setSelectedCondition(newCondition);
        const conditionConfig = CONDITIONS.find(c => c.key === newCondition);
        if (newCondition === 'none' || (conditionConfig && !conditionConfig.needsInput)) {
            onFilterChange(newCondition === 'none' ? null : { condition: newCondition });
        } else if (filterValue.trim()) {
            onFilterChange({ condition: newCondition, value: filterValue });
        }
    };

    const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setFilterValue(newValue);
        if (selectedCondition !== 'none') {
            onFilterChange({ condition: selectedCondition, value: newValue });
        }
    };

    if (!activeColumn) return null;

    const needsInput = !!CONDITIONS.find(c => c.key === selectedCondition)?.needsInput;

    return (
        <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center gap-4 text-sm animate-in fade-in slide-in-from-top-2 duration-200">
            <span className="font-mono text-slate-400">Filter Col <span className="font-bold text-slate-200">{activeColumn.name}</span>:</span>
            <div className="flex items-center gap-2">
                 <button onClick={() => onSort('ASC')} className="px-2 py-1 rounded hover:bg-slate-700">A→Z</button>
                 <button onClick={() => onSort('DESC')} className="px-2 py-1 rounded hover:bg-slate-700">Z→A</button>
            </div>

            <select
                value={selectedCondition}
                onChange={handleConditionChange}
                className="px-2 py-1.5 bg-slate-800/50 border border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
                {CONDITIONS.map(({ key, label }) => (
                    <option key={key} value={key}>{label}</option>
                ))}
            </select>
            {needsInput && (
                <input
                    type="text"
                    value={filterValue}
                    onChange={handleValueChange}
                    placeholder="Enter value..."
                    className="w-48 px-2 py-1.5 bg-slate-800/50 border border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
            )}
            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-700 ml-auto">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
};

export default FilterBar;
