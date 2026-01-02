import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { initDB } from './src/database/db';
import AppNavigator from './src/navigation/AppNavigator';

const App = () => {
  useEffect(() => {
    initDB(); // Creates the local SQLite table on first launch
  }, []);

  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
};

export default App;
