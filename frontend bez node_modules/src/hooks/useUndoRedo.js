import { useCallback, useMemo } from 'react';
import { useActionHistory } from '@/context/ActionHistoryContext.jsx';

export const useUndoRedo = () => {
  const { state, dispatch } = useActionHistory(); // ✅ FAZA 2 WDROŻONA

  const undo = useCallback(() => dispatch({ type: 'UNDO' }), [dispatch]);
  const redo = useCallback(() => dispatch({ type: 'REDO' }), [dispatch]);
  const push = useCallback((payload) => dispatch({ type: 'PUSH', payload }), [dispatch]);

  const canUndo = !!(state && Array.isArray(state.past) && state.past.length > 0);
  const canRedo = !!(state && Array.isArray(state.future) && state.future.length > 0);
  const current = state ? state.current : undefined;

  return useMemo(
    () => ({
      canUndo,
      canRedo,
      current,
      undo,
      redo,
      push,
    }),
    [canUndo, canRedo, current, undo, redo, push]
  );
};

export default useUndoRedo;
