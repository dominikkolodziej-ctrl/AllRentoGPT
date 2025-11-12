import React from 'react';
import { useUndoRedo } from '@/hooks/useUndoRedo.js';

const UndoRedoToolbar = () => {
  const { undo, redo, canUndo, canRedo } = useUndoRedo();

  return (
    <div className="flex gap-2 mb-4">
      <button onClick={undo} disabled={!canUndo}>⏪ Cofnij</button>
      <button onClick={redo} disabled={!canRedo}>⏩ Przywróć</button>
    </div>
  );
};

export default UndoRedoToolbar;
