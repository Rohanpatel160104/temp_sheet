
import { CellAddress } from '../types';

/**
 * Converts a cell reference string (e.g., "A1", "B2") to a CellAddress object.
 * @param ref The cell reference string.
 * @returns A CellAddress object { row, col } or null if invalid.
 */
export const parseCellAddress = (ref: string): CellAddress | null => {
    const match = ref.toUpperCase().match(/^([A-Z]+)(\d+)$/);
    if (!match) return null;

    const colName = match[1];
    const row = parseInt(match[2], 10) - 1;
    
    let col = 0;
    for (let i = 0; i < colName.length; i++) {
        col = col * 26 + (colName.charCodeAt(i) - 64);
    }
    col -= 1;

    if (row < 0 || col < 0) return null;

    return { row, col };
};

/**
 * Converts a column index to its corresponding letter name (e.g., 0 -> "A", 1 -> "B").
 * @param colIndex The zero-based column index.
 * @returns The column name string.
 */
export const getColumnName = (colIndex: number): string => {
    let name = '';
    let n = colIndex;
    while (n >= 0) {
        name = String.fromCharCode(n % 26 + 65) + name;
        n = Math.floor(n / 26) - 1;
    }
    return name;
};
