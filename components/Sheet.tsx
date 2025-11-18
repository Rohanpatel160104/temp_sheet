
import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import type { CellAddress, ColumnOptions, SortDirection, Filter } from '../types';
import Cell from './Cell';
import { evaluateFormula } from '../utils/formulaParser';


interface SheetProps {
    data: string[][];
    setData: React.Dispatch<React.SetStateAction<string[][]>>;
    columnOptions: ColumnOptions[];
    activeFilterColumn: number | null;
    setActiveFilterColumn: (index: number | null) => void;
}

const Sheet: React.FC<SheetProps> = ({ data, setData, columnOptions, activeFilterColumn, setActiveFilterColumn }) => {
    const [editingCell, setEditingCell] = useState<CellAddress | null>(null);
    const [activeCell, setActiveCell] = useState<CellAddress>({ row: 0, col: 0 });
    
    const numRows = data.length;
    const numCols = data[0]?.length || 0;
    
    const sheetContainerRef = useRef<HTMLDivElement>(null);

    const handleDataChange = useCallback((row: number, col: number, value: string) => {
        const newData = data.map(r => [...r]);
        newData[row][col] = value;
        setData(newData);
    }, [data, setData]);
    
    const handleNavigate = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!editingCell) return;
        
        let { row, col } = editingCell;
        
        switch (e.key) {
            case 'Enter':
            case 'ArrowDown':
                e.preventDefault();
                row = Math.min(row + 1, data.length - 1);
                break;
            case 'ArrowUp':
                e.preventDefault();
                row = Math.max(row - 1, 0);
                break;
            case 'Tab':
                e.preventDefault();
                if(e.shiftKey){
                    col = Math.max(col - 1, 0);
                } else {
                    col = Math.min(col + 1, data[0].length - 1);
                }
                break;
            case 'ArrowLeft':
                e.preventDefault();
                col = Math.max(col - 1, 0);
                break;
            case 'ArrowRight':
                e.preventDefault();
                col = Math.min(col + 1, data[0].length - 1);
                break;
            case 'Escape':
                e.preventDefault();
                setEditingCell(null);
                sheetContainerRef.current?.focus();
                return;
        }
        
        setEditingCell({ row, col });
        setActiveCell({ row, col });
    };

    const displayData = useMemo(() => {
        const computed = new Map<string, string | number>();
        return data.map((row, rowIndex) => 
            row.map((cellValue, colIndex) => 
                evaluateFormula(cellValue, data, computed, { row: rowIndex, col: colIndex })
            )
        );
    }, [data]);
    
    const processedRows = useMemo(() => {
        const rowsWithOriginalIndex = data.map((rowData, index) => ({ rowData, originalIndex: index }));
        
        const filtered = rowsWithOriginalIndex.filter(({ rowData }) => {
            return columnOptions.every((options, colIndex) => {
                if (!options.filter || options.filter.condition === 'none') return true;

                const cellValue = String(rowData[colIndex] || '').toLowerCase();
                const filterValue = String(options.filter.value || '').toLowerCase();
                const numericCellValue = parseFloat(cellValue);
                const numericFilterValue = parseFloat(filterValue);

                switch(options.filter.condition) {
                    case 'is_empty': return cellValue.trim() === '';
                    case 'is_not_empty': return cellValue.trim() !== '';
                    case 'text_contains': return cellValue.includes(filterValue);
                    case 'text_not_contains': return !cellValue.includes(filterValue);
                    case 'text_starts_with': return cellValue.startsWith(filterValue);
                    case 'text_ends_with': return cellValue.endsWith(filterValue);
                    case 'text_is_exactly': return cellValue === filterValue;
                    case 'eq': return !isNaN(numericCellValue) && !isNaN(numericFilterValue) && numericCellValue === numericFilterValue;
                    case 'neq': return !(!isNaN(numericCellValue) && !isNaN(numericFilterValue)) || numericCellValue !== numericFilterValue;
                    case 'gt': return !isNaN(numericCellValue) && !isNaN(numericFilterValue) && numericCellValue > numericFilterValue;
                    case 'gte': return !isNaN(numericCellValue) && !isNaN(numericFilterValue) && numericCellValue >= numericFilterValue;
                    case 'lt': return !isNaN(numericCellValue) && !isNaN(numericFilterValue) && numericCellValue < numericFilterValue;
                    case 'lte': return !isNaN(numericCellValue) && !isNaN(numericFilterValue) && numericCellValue <= numericFilterValue;
                    default: return true;
                }
            });
        });

        const sortColumn = columnOptions.findIndex(opt => opt.sort !== null);
        if (sortColumn === -1) return filtered;

        const sortDirection = columnOptions[sortColumn].sort;
        
        return [...filtered].sort((a, b) => {
            const valA = a.rowData[sortColumn] || '';
            const valB = b.rowData[sortColumn] || '';
            const numA = parseFloat(valA);
            const numB = parseFloat(valB);
            
            let compareResult: number;

            if (!isNaN(numA) && !isNaN(numB)) {
                compareResult = numA - numB;
            } else {
                compareResult = valA.localeCompare(valB);
            }

            return sortDirection === 'ASC' ? compareResult : -compareResult;
        });

    }, [data, columnOptions]);

    const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
        e.preventDefault();
        const pasteData = e.clipboardData.getData('text/plain');
        const pastedRows = pasteData.split('\n').map(row => row.split('\t'));

        if (pastedRows.length === 0 || !activeCell) return;

        const { row: startRow, col: startCol } = activeCell;
        const newData = data.map(r => [...r]);
        
        let maxCol = numCols;

        pastedRows.forEach((pastedRow, rowIndex) => {
            const targetRow = startRow + rowIndex;
            if (targetRow >= newData.length) {
                newData.push(Array(numCols).fill(''));
            }
            pastedRow.forEach((cellValue, colIndex) => {
                const targetCol = startCol + colIndex;
                if(targetCol >= maxCol) {
                    maxCol = targetCol + 1;
                }
                if (newData[targetRow]) {
                    newData[targetRow][targetCol] = cellValue;
                }
            });
        });

        for(let i = 0; i < newData.length; i++) {
            while(newData[i].length < maxCol) {
                newData[i].push('');
            }
        }
        
        setData(newData);
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
        <div className="p-4 overflow-auto focus:outline-none" onPaste={handlePaste} ref={sheetContainerRef} tabIndex={-1}>
            <table className="table-fixed border-collapse border border-slate-800 w-full bg-slate-900">
                <thead>
                    <tr>
                        <th className="sticky top-0 left-0 z-20 bg-slate-800 p-2 border border-slate-700 min-w-[50px]"></th>
                        {Array.from({ length: numCols }).map((_, colIndex) => {
                             const options = columnOptions[colIndex] || { sort: null, filter: null };
                             const isFiltered = options.filter && options.filter.condition !== 'none';
                            return (
                                <th key={colIndex} className="sticky top-0 z-10 bg-slate-800 p-0 border border-slate-700 font-mono min-w-[120px] text-slate-400">
                                   <button 
                                        onClick={() => setActiveFilterColumn(activeFilterColumn === colIndex ? null : colIndex)}
                                        className={`w-full h-full px-2 text-left transition-colors ${activeFilterColumn === colIndex ? 'bg-violet-600/50' : 'hover:bg-slate-700'}`}
                                    >
                                       <div className="flex items-center justify-between">
                                            <span>{getColumnName(colIndex)}</span>
                                            {isFiltered && (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-violet-400" viewBox="0 0 20 20" fill="currentColor">
                                                  <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 12.414V17a1 1 0 01-1.447.894l-4-2A1 1 0 016 15v-2.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                       </div>
                                   </button>
                                </th>
                            )
                        })}
                    </tr>
                </thead>
                <tbody>
                    {processedRows.length > 0 ? (
                        processedRows.map(({ rowData, originalIndex: rowIndex }) => (
                            <tr key={rowIndex}>
                                <td className="sticky left-0 z-10 bg-slate-800 p-2 border border-slate-700 text-center font-mono text-slate-500">
                                    {rowIndex + 1}
                                </td>
                                {Array.from({ length: numCols }).map((_, colIndex) => {
                                    const isActive = activeCell.row === rowIndex && activeCell.col === colIndex;
                                    const isEditing = editingCell?.row === rowIndex && editingCell?.col === colIndex;
                                    const cellClasses = `border border-slate-700 h-10 min-w-[120px] hover:bg-slate-800/50 transition-colors duration-150 relative ${isActive && !isEditing ? 'ring-2 ring-violet-500 ring-inset' : ''}`;
                                    return (
                                    <td key={`${rowIndex}-${colIndex}`} className={cellClasses} onClick={() => setActiveCell({ row: rowIndex, col: colIndex })}>
                                        <Cell
                                            value={rowData[colIndex] || ''}
                                            displayValue={displayData[rowIndex][colIndex] || ''}
                                            isEditing={isEditing}
                                            onDoubleClick={() => setEditingCell({ row: rowIndex, col: colIndex })}
                                            onChange={(newValue) => handleDataChange(rowIndex, colIndex, newValue)}
                                            onBlur={() => setEditingCell(null)}
                                            onNavigate={handleNavigate}
                                        />
                                    </td>
                                )})}
                            </tr>
                        ))
                    ) : (
                         <tr>
                            <td colSpan={numCols + 1} className="h-48 text-center text-slate-500 align-middle">
                                No rows match the current filter(s).
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default Sheet;