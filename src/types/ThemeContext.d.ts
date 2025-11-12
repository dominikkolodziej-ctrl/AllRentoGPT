// Ścieżka: src/types/themecontext.d.ts

declare module "@/context/ThemeContext.jsx" {
  export type Theme = {
    bgCard: string;
    textPrimary: string;
    labelColor: string;
    fontFamily: string;
    primary: string;
    [key: string]: unknown;
  };

  export type ThemeContextType = {
    classes: object;
    theme: Theme;
    setTheme: (theme: Theme) => void;
    isStaging: boolean;
    applyExternalTheme: (t: Theme) => void;
  };

  export const ThemeContext: React.Context<ThemeContextType>;
  export function useTheme(): ThemeContextType;
}
