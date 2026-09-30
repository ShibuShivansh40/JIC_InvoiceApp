import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { initDB } from './src/database/db';
import AppNavigator from './src/navigation/AppNavigator';
import { ThemeProvider } from './src/context/ThemeContext';

const App = () => {
  useEffect(() => {
    initDB(); // Creates the local SQLite table on first launch
  }, []);

  return (
    <ThemeProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </ThemeProvider>
  );
};

export default App;
