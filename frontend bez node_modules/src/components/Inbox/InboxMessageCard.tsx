import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  Dispatch,
  SetStateAction,
} from 'react';
import PropTypes from 'prop-types';

// ✅ Domyślny motyw aplikacji
const defaultTheme = {
  bgCard: "bg-white",
  textPrimary: "text-gray-900",
  labelColor: "text-gray-700",
  fontFamily: "font-sans",
  primary: "#10b981",
};

// ✅ Typy dla Theme
export type Theme = typeof defaultTheme;

interface ThemeContextValue {
  theme: Theme;
  setTheme: Dispatch<SetStateAction<Theme>>;
  isStaging: boolean;
  applyExternalTheme: (themeObject: Theme) => void;
}

// ✅ createContext z typem
export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [isStaging] = useState(import.meta.env.VITE_APP_ENV === 'staging');

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setTheme(parsed);
      } catch (e) {
        console.error("Nie można sparsować motywu z localStorage", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', JSON.stringify(theme));
  }, [theme]);

  const applyExternalTheme = (themeObject: Theme) => {
    setTheme(themeObject);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isStaging, applyExternalTheme }}>
      {isStaging && (
        <div style={{ background: '#6b21a8', color: 'white', textAlign: 'center' }}>
          STAGING MODE
        </div>
      )}
      {children}
    </ThemeContext.Provider>
  );
};

// ✅ useTheme z walidacją i typem
export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};

ThemeProvider.propTypes = {
  children: PropTypes.node,
};
