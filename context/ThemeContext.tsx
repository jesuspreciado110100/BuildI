import React, { createContext, useContext, useState } from 'react';

export interface Theme {
  isDark: boolean;
  colors: {
    background: string;
    card: string;
    surface: string;
    text: string;
    textSecondary: string;
    primary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
  };
}

const lightTheme: Theme = {
  isDark: false,
  colors: {
    background: '#f5f5f5',
    card: '#ffffff',
    surface: '#ffffff',
    text: '#333333',
    textSecondary: '#666666',
    primary: '#007AFF',
    border: '#e0e0e0',
    success: '#34C759',
    warning: '#FF9500',
    error: '#FF3B30',
  }
};

const darkTheme: Theme = {
  isDark: true,
  colors: {
    background: '#1a1a1a',
    card: '#2d2d2d',
    surface: '#2d2d2d',
    text: '#ffffff',
    textSecondary: '#cccccc',
    primary: '#0A84FF',
    border: '#444444',
    success: '#30D158',
    warning: '#FF9F0A',
    error: '#FF453A',
  }
};

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};