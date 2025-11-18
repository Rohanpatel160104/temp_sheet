
import React, { useState, useCallback } from 'react';
import type { CellAddress } from '../types';
import Cell from './Cell';

interface SheetProps {
    data: string[][];
    setData: React.Dispatch<React.SetStateAction<string[][]>>;
}

const Sheet: React.FC<SheetProps> = ({ data, setData }) => {
    const [editingCell, setEditingCell] = useState<CellAddress | null>(null);

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
                return;
        }
        
        setEditingCell({ row, col });
    };

    const numRows = data.length;
    const numCols = data[0]?.length || 0;

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
        <div className="p-4 overflow-auto">
            <table className="table-fixed border-collapse border border-slate-300 dark:border-slate-600 w-full">
                <thead>
                    <tr>
                        <th className="sticky top-0 left-0 z-20 bg-slate-200 dark:bg-slate-700 p-2 border border-slate-300 dark:border-slate-600 min-w-[50px]"></th>
                        {Array.from({ length: numCols }).map((_, colIndex) => (
                            <th key={colIndex} className="sticky top-0 z-10 bg-slate-200 dark:bg-slate-700 p-2 border border-slate-300 dark:border-slate-600 font-mono min-w-[120px]">
                                {getColumnName(colIndex)}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {Array.from({ length: numRows }).map((_, rowIndex) => (
                        <tr key={rowIndex}>
                            <td className="sticky left-0 z-10 bg-slate-200 dark:bg-slate-700 p-2 border border-slate-300 dark:border-slate-600 text-center font-mono">
                                {rowIndex + 1}
                            </td>
                            {Array.from({ length: numCols }).map((_, colIndex) => (
                                <td key={`${rowIndex}-${colIndex}`} className="border border-slate-300 dark:border-slate-600 h-10 min-w-[120px] bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors duration-150">
                                    <Cell
                                        value={data[rowIndex][colIndex] || ''}
                                        isEditing={editingCell?.row === rowIndex && editingCell?.col === colIndex}
                                        onDoubleClick={() => setEditingCell({ row: rowIndex, col: colIndex })}
                                        onChange={(newValue) => handleDataChange(rowIndex, colIndex, newValue)}
                                        onBlur={() => setEditingCell(null)}
                                        onNavigate={handleNavigate}
                                    />
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Sheet;
