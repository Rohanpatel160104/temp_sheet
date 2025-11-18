
export interface CellAddress {
  row: number;
  col: number;
}

export interface Selection {
    anchor: CellAddress;
    focus: CellAddress;
}

export interface ChatMessage {
    sender: 'user' | 'ai';
    text: string;
}

export type SortDirection = 'ASC' | 'DESC' | null;

export type FilterCondition =
  | 'none'
  | 'is_empty'
  | 'is_not_empty'
  | 'text_contains'
  | 'text_not_contains'
  | 'text_starts_with'
  | 'text_ends_with'
  | 'text_is_exactly'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'eq'
  | 'neq';

export interface Filter {
    condition: FilterCondition;
    value?: string;
}

export interface ColumnOptions {
    sort: SortDirection;
    filter: Filter | null;
}

// Types for AI Function Calling
export interface AISheetEdit {
    updates: { cellAddress: string; newValue: string }[];
}

export type AIResponse = 
    | { type: 'text'; content: string }
    | { type: 'sheet_edit'; edit: AISheetEdit };
