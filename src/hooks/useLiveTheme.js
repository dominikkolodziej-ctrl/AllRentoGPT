import { useTheme } from '@/context/ThemeContext.jsx';

export const useLiveTheme = () => {
  const { theme, setTheme } = useTheme(); // ✅ FAZA 12 WDROŻONA
  return { theme, setTheme };
};
