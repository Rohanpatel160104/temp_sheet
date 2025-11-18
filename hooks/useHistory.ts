import { useState, useCallback } from 'react';

interface HistoryState<T> {
  state: T;
  setState: (newState: T | ((prevState: T) => T)) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  reset: (newState: T) => void;
}

export const useHistory = <T,>(initialState: T): HistoryState<T> => {
    const [state, setStateInternal] = useState({
        history: [initialState],
        currentIndex: 0,
    });
    
    const { history, currentIndex } = state;
    const currentState = history[currentIndex];

    const setState = useCallback((action: T | ((prevState: T) => T)) => {
        setStateInternal(prevState => {
            const { history: prevHistory, currentIndex: prevCurrentIndex } = prevState;
            const currentSnapshot = prevHistory[prevCurrentIndex];

            const resolvedState = typeof action === 'function' 
                ? (action as (prevState: T) => T)(currentSnapshot) 
                : action;

            // This check was removed as it was causing a major performance issue.
            // The Cell and FormulaBar components already prevent calling onChange
            // if the value hasn't changed, making this deep comparison redundant.

            const newHistory = prevHistory.slice(0, prevCurrentIndex + 1);
            newHistory.push(resolvedState);
            
            return {
                history: newHistory,
                currentIndex: newHistory.length - 1,
            };
        });
    }, []);

    const undo = useCallback(() => {
        setStateInternal(prevState => ({
            ...prevState,
            currentIndex: Math.max(0, prevState.currentIndex - 1)
        }));
    }, []);

    const redo = useCallback(() => {
        setStateInternal(prevState => ({
            ...prevState,
            currentIndex: Math.min(prevState.history.length - 1, prevState.currentIndex + 1)
        }));
    }, []);
    
    const reset = useCallback((newState: T) => {
        setStateInternal({
            history: [newState],
            currentIndex: 0,
        });
    }, []);

    const canUndo = currentIndex > 0;
    const canRedo = currentIndex < history.length - 1;

    return { state: currentState, setState, undo, redo, canUndo, canRedo, reset };
};