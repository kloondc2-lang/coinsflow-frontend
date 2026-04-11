'use client';

import { createContext, useContext, useEffect } from 'react';

const ThemeContext = createContext({ dark: true });
export const useTheme = () => useContext(ThemeContext);

export default function ThemeProvider({ children }) {
  useEffect(() => {
    document.documentElement.classList.add('dark');
    localStorage.removeItem('cfTheme');
  }, []);

  return (
    <ThemeContext.Provider value={{ dark: true }}>
      {children}
    </ThemeContext.Provider>
  );
}
