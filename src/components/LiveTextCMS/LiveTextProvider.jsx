import React, {
  useState,
  useEffect,
  createContext,
  useContext
} from 'react';
import PropTypes from 'prop-types';

// ✅ FAZA 1: kontekst LiveText – tłumaczenia, język, logowanie braków

const LiveTextContext = createContext();
export const useLiveTextContext = () => useContext(LiveTextContext);

export function LiveTextProvider({ children }) {
  const [texts, setTexts] = useState({});
  const [lang, setLang] = useState("pl");
  const [debugLog, setDebugLog] = useState([]);

  useEffect(() => {
    fetch(`/api/texts?lang=${lang}`)
      .then((res) => res.json())
      .then(setTexts);
  }, [lang]);

  const getText = (key) => {
    const val = texts[key];
    if (!val) setDebugLog((prev) => [...prev, { key, value: null }]);
    else setDebugLog((prev) => [...prev, { key, value: val }]);
    return val;
  };

  return (
    <LiveTextContext.Provider value={{ getText, lang, setLang, debugLog }}>
      {children}
    </LiveTextContext.Provider>
  );
}

LiveTextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
