
import { CellAddress } from '../types';

const cellRefToAddress = (ref: string): CellAddress | null => {
    const match = ref.toUpperCase().match(/^([A-Z]+)(\d+)$/);
    if (!match) return null;

    const colName = match[1];
    const row = parseInt(match[2], 10) - 1;
    
    let col = 0;
    for (let i = 0; i < colName.length; i++) {
        col = col * 26 + (colName.charCodeAt(i) - 64);
    }
    col -= 1;

    return { row, col };
};

const addressToCellRef = (addr: CellAddress): string => {
    let colName = '';
    let n = addr.col;
    while(n >= 0) {
        colName = String.fromCharCode(n % 26 + 65) + colName;
        n = Math.floor(n / 26) - 1;
    }
    return `${colName}${addr.row + 1}`;
}

const evaluate = (
    cellValue: string, 
    data: string[][], 
    computed: Map<string, string | number>,
    path: Set<string>
): string | number => {
    if (typeof cellValue !== 'string' || !cellValue.startsWith('=')) {
        return cellValue;
    }

    const formula = cellValue.substring(1);

    // Basic SUM function: =SUM(A1:B2)
    const sumMatch = formula.match(/^SUM\((([A-Z]+\d+):([A-Z]+\d+))\)$/i);
    if (sumMatch) {
        const startRef = sumMatch[2];
        const endRef = sumMatch[3];
        const start = cellRefToAddress(startRef);
        const end = cellRefToAddress(endRef);

        if (start && end) {
            let sum = 0;
            for (let r = Math.min(start.row, end.row); r <= Math.max(start.row, end.row); r++) {
                for (let c = Math.min(start.col, end.col); c <= Math.max(start.col, end.col); c++) {
                    const value = evaluate(data[r]?.[c] || '0', data, computed, path);
                    const num = parseFloat(String(value));
                    if (!isNaN(num)) {
                        sum += num;
                    }
                }
            }
            return sum;
        }
    }

    // Basic arithmetic with cell refs: =A1+B1 or =A1+5
    const tokens = formula.split(/([+\-*/])/).map(t => t.trim());
    
    try {
        let result = 0;
        let currentOperator = '+';

        const resolveToken = (token: string): number => {
             if (!isNaN(parseFloat(token))) {
                return parseFloat(token);
            }
            const addr = cellRefToAddress(token);
            if (addr) {
                const ref = addressToCellRef(addr);
                const value = evaluateFormula(data[addr.row]?.[addr.col] || '', data, computed, addr, path);
                const num = parseFloat(String(value));
                return isNaN(num) ? 0 : num;
            }
            throw new Error('#REF!');
        }

        result = resolveToken(tokens[0]);

        for (let i = 1; i < tokens.length; i += 2) {
            currentOperator = tokens[i];
            const value = resolveToken(tokens[i + 1]);
            switch (currentOperator) {
                case '+': result += value; break;
                case '-': result -= value; break;
                case '*': result *= value; break;
                case '/': 
                    if (value === 0) throw new Error('#DIV/0!');
                    result /= value; 
                    break;
            }
        }
        return result;
    } catch (e) {
        return e instanceof Error ? e.message : '#ERROR!';
    }
};


export const evaluateFormula = (
    cellValue: string, 
    data: string[][], 
    computed: Map<string, string | number>, 
    currentAddr: CellAddress,
    path: Set<string> = new Set()
): string => {
    const cellRef = addressToCellRef(currentAddr);
    
    if (path.has(cellRef)) {
        return '#CIRC!'; // Circular reference
    }

    if (computed.has(cellRef)) {
        return String(computed.get(cellRef));
    }

    path.add(cellRef);
    const result = evaluate(cellValue, data, computed, path);
    path.delete(cellRef);
    
    computed.set(cellRef, result);

    return String(result);
};
