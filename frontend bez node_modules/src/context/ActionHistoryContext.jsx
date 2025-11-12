// src/context/ActionHistoryProvider.jsx
import React, { createContext, useReducer, useContext } from 'react';
import PropTypes from 'prop-types';

const initialState = { past: [], future: [], current: null };
// TODO [FAZA 2: Integracja z toast/undo UI i rollback akcji]
// TODO [FAZA 9: Emisja zdarzeń analitycznych 'history_push/undo/redo']

const ActionHistoryContext = createContext({
  state: initialState,
  dispatch: () => {},
});

const reducer = (state, action) => {
  switch (action.type) {
    case 'PUSH': {
      return {
        ...state,
        past: [...state.past, action.payload],
        future: [],
        current: action.payload,
      };
    }
    case 'UNDO': {
      if (state.past.length === 0) return state;
      const last = state.past[state.past.length - 1];
      return {
        past: state.past.slice(0, -1),
        future: state.current != null ? [state.current, ...state.future] : state.future,
        current: last,
      };
    }
    case 'REDO': {
      if (state.future.length === 0) return state;
      const [next, ...rest] = state.future;
      return {
        past: [...state.past, state.current != null ? state.current : next],
        future: rest,
        current: next,
      };
    }
    default:
      return state;
  }
};

export const ActionHistoryProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <ActionHistoryContext.Provider value={{ state, dispatch }}>
      {children}
    </ActionHistoryContext.Provider>
  );
};

ActionHistoryProvider.propTypes = {
  children: PropTypes.node,
};

export const useActionHistory = () => useContext(ActionHistoryContext);
