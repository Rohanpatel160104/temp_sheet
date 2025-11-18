
import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import type { CellAddress, ColumnOptions, Selection } from '../types';
import Cell from './Cell';
import { evaluateFormula } from '../utils/formulaParser';
import { getColumnName } from '../utils/cellUtils';

interface SheetProps {
    data: string[][];
    setData: React.Dispatch<React.SetStateAction<string[][]>>;
    columnOptions: ColumnOptions[];
    activeFilterColumn: number | null;
    setActiveFilterColumn: (index: number | null) => void;
    selection: Selection;
    setSelection: React.Dispatch<React.SetStateAction<Selection>>;
    columnWidths: number[];
    onColumnResize: (colIndex: number, newWidth: number) => void;
}

const Sheet: React.FC<SheetProps> = ({ data, setData, columnOptions, activeFilterColumn, setActiveFilterColumn, selection, setSelection, columnWidths, onColumnResize }) => {
    const [editingCell, setEditingCell] = useState<CellAddress | null>(null);
    const isSelectingRef = useRef(false);
    
    const numRows = data.length;
    const numCols = data[0]?.length || 0;
    
    const sheetContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        sheetContainerRef.current?.focus();
    }, []);

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
        
        const newFocus = { row, col };
        setSelection({ anchor: newFocus, focus: newFocus });
        setEditingCell(newFocus);
    };

    const handleSheetKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (editingCell) return;
        let { row, col } = selection.focus;
        let moved = false;
        
        switch (e.key) {
            case 'ArrowDown':
                row = Math.min(row + 1, numRows - 1);
                moved = true;
                break;
            case 'ArrowUp':
                row = Math.max(row - 1, 0);
                moved = true;
                break;
            case 'ArrowLeft':
                col = Math.max(col - 1, 0);
                moved = true;
                break;
            case 'ArrowRight':
                col = Math.min(col + 1, numCols - 1);
                moved = true;
                break;
            case 'Enter':
                 e.preventDefault();
                setEditingCell(selection.focus);
                return;
            case 'Tab':
                e.preventDefault();
                if (e.shiftKey) {
                    if (col > 0) col--;
                    else if (row > 0) {
                        row--;
                        col = numCols - 1;
                    }
                } else {
                    if (col < numCols - 1) col++;
                    else if (row < numRows - 1) {
                        row++;
                        col = 0;
                    }
                }
                moved = true;
                break;
        }

        if (moved) {
            e.preventDefault();
            const newFocus = { row, col };
            if (e.shiftKey) {
                setSelection(prev => ({...prev, focus: newFocus}));
            } else {
                setSelection({ anchor: newFocus, focus: newFocus });
            }
        }
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

        if (pastedRows.length === 0 || !selection) return;

        const { row: startRow, col: startCol } = selection.focus;
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

    const startResize = (e: React.MouseEvent, colIndex: number) => {
        e.preventDefault();
        const startX = e.clientX;
        const startWidth = columnWidths[colIndex];

        const handleMouseMove = (moveEvent: MouseEvent) => {
            const newWidth = startWidth + (moveEvent.clientX - startX);
            onColumnResize(colIndex, newWidth);
        };

        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const getSelectionBounds = (selection: Selection) => {
        const minRow = Math.min(selection.anchor.row, selection.focus.row);
        const maxRow = Math.max(selection.anchor.row, selection.focus.row);
        const minCol = Math.min(selection.anchor.col, selection.focus.col);
        const maxCol = Math.max(selection.anchor.col, selection.focus.col);
        return { minRow, maxRow, minCol, maxCol };
    };

    const handleMouseDown = (e: React.MouseEvent, rowIndex: number, colIndex: number) => {
        isSelectingRef.current = true;
        const newCell = { row: rowIndex, col: colIndex };

        if (e.shiftKey) {
            setSelection(prev => ({...prev, focus: newCell }));
        } else {
            setSelection({ anchor: newCell, focus: newCell });
        }
        
        const handleMouseUp = () => {
            isSelectingRef.current = false;
            window.removeEventListener('mouseup', handleMouseUp, true);
        };
        window.addEventListener('mouseup', handleMouseUp, true);
    };

    const handleMouseEnter = (rowIndex: number, colIndex: number) => {
        if(isSelectingRef.current) {
            setSelection(prev => ({ ...prev, focus: { row: rowIndex, col: colIndex }}));
        }
    };
    
    const { minRow, maxRow, minCol, maxCol } = getSelectionBounds(selection);

    return (
        <div className="p-4 overflow-auto focus:outline-none" onPaste={handlePaste} ref={sheetContainerRef} tabIndex={-1} onKeyDown={handleSheetKeyDown}>
            <table className="table-fixed border-collapse border border-slate-800 w-full bg-slate-900">
                <thead>
                    <tr>
                        <th style={{ width: 50, minWidth: 50 }} className="sticky top-0 left-0 z-20 bg-slate-800 p-2 border border-slate-700 select-none"></th>
                        {Array.from({ length: numCols }).map((_, colIndex) => {
                             const options = columnOptions[colIndex] || { sort: null, filter: null };
                             const isFiltered = options.filter && options.filter.condition !== 'none';
                             const width = columnWidths[colIndex] || 120;
                            return (
                                <th key={colIndex} style={{ width: `${width}px` }} className="sticky top-0 z-10 bg-slate-800 p-0 border border-slate-700 font-mono text-slate-400 select-none relative">
                                   <div className="flex items-center h-full">
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
                                        <div 
                                            onMouseDown={(e) => startResize(e, colIndex)}
                                            className="absolute top-0 right-0 h-full w-2 cursor-col-resize hover:bg-violet-500/50 transition-colors z-10"
                                        />
                                   </div>
                                </th>
                            )
                        })}
                    </tr>
                </thead>
                <tbody>
                    {processedRows.length > 0 ? (
                        processedRows.map(({ rowData, originalIndex: rowIndex }) => (
                            <tr key={rowIndex}>
                                <td style={{ width: 50, minWidth: 50 }} className="sticky left-0 z-10 bg-slate-800 p-2 border border-slate-700 text-center font-mono text-slate-500 select-none">
                                    {rowIndex + 1}
                                </td>
                                {Array.from({ length: numCols }).map((_, colIndex) => {
                                    const isActive = selection.focus.row === rowIndex && selection.focus.col === colIndex;
                                    const isEditing = editingCell?.row === rowIndex && editingCell?.col === colIndex;
                                    const isSelected = rowIndex >= minRow && rowIndex <= maxRow && colIndex >= minCol && colIndex <= maxCol;

                                    let selectionBorders = '';
                                    if(isSelected && !isEditing) {
                                        if (rowIndex === minRow) selectionBorders += ' border-t-violet-400';
                                        if (rowIndex === maxRow) selectionBorders += ' border-b-violet-400';
                                        if (colIndex === minCol) selectionBorders += ' border-l-violet-400';
                                        if (colIndex === maxCol) selectionBorders += ' border-r-violet-400';
                                    }
                                    
                                    const cellClasses = `border border-slate-700 h-10 transition-colors duration-150 relative 
                                        ${isSelected ? 'bg-violet-900/30' : 'hover:bg-slate-800/50'} 
                                        ${isActive && !isEditing ? 'ring-2 ring-violet-500 ring-inset z-10' : ''}
                                        ${selectionBorders}`;
                                        
                                    return (
                                    <td 
                                        key={`${rowIndex}-${colIndex}`} 
                                        className={cellClasses} 
                                        onMouseDown={(e) => handleMouseDown(e, rowIndex, colIndex)}
                                        onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
                                    >
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
