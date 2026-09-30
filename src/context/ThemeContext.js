import React, { createContext, useState, useContext } from 'react';

export const lightColors = {
  background: '#F8F9FB',
  cardBackground: '#FFFFFF',
  textPrimary: '#1A1A1A',
  textSecondary: '#666666',
  accent: '#007AFF',
  border: '#E5E7EB',
  inputBackground: '#F9FAFB',
  cardShadow: '#000000',
  success: '#27AE60',
  buttonBackground: '#111111',
  buttonText: '#FFFFFF',
  secondaryButton: '#455A64',
  headerBackground: '#FFFFFF',
};

export const darkColors = {
  background: '#121212',
  cardBackground: '#1E1E1E',
  textPrimary: '#F3F4F6',
  textSecondary: '#9CA3AF',
  accent: '#0A84FF',
  border: '#2D2D2D',
  inputBackground: '#2A2A2A',
  cardShadow: '#000000',
  success: '#30D158',
  buttonBackground: '#2C2C2E',
  buttonText: '#FFFFFF',
  secondaryButton: '#3A3A3C',
  headerBackground: '#1C1C1E',
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const theme = isDarkMode ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
