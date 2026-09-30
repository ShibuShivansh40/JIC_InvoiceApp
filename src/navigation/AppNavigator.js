import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import Dashboard from '../screens/Dashboard';
import CreateInvoice from '../screens/CreateInvoice';
import ViewInvoices from '../screens/ViewInvoices';
import PDFPreview from '../screens/PDFViewer';
import Login from '../screens/Login';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  const { theme, isDarkMode } = useTheme();
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.accent} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarShowLabel: false,
          tabBarStyle: [
            styles.tabBar,
            {
              backgroundColor: theme.cardBackground,
              shadowColor: theme.cardShadow,
            },
          ],
          tabBarActiveTintColor: theme.accent,
          tabBarInactiveTintColor: isDarkMode ? '#6C757D' : '#ADB5BD',
          headerShown: false,
          tabBarIcon: ({ focused, color }) => {
            let iconName;
            if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
            else if (route.name === 'Create') iconName = focused ? 'add-circle' : 'add-circle-outline';
            else if (route.name === 'Records') iconName = focused ? 'document-text' : 'document-text-outline';
            else if (route.name === 'PDF') iconName = focused ? 'print' : 'print-outline';

            return (
              <View style={styles.iconContainer}>
                <Icon name={iconName} size={24} color={color} />
                {focused && <View style={[styles.activeDot, { backgroundColor: theme.accent }]} />}
              </View>
            );
          },
        })}
      >
        <Tab.Screen name="Home" component={Dashboard} />
        <Tab.Screen name="Create" component={CreateInvoice} />
        <Tab.Screen name="Records" component={ViewInvoices} />
        <Tab.Screen name="PDF" component={PDFPreview}
          options={{ tabBarStyle: { display: 'none' } }}
        />
      </Tab.Navigator>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBar: {
    position: 'absolute',
    bottom: 15,
    left: 25,
    right: 25,
    height: 60,
    borderRadius: 25,
    borderTopWidth: 0,
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: 60,
  },
  activeDot: {
    position: 'absolute',
    bottom: 6,
    width: 5,
    height: 5,
    borderRadius: 2.5,
  }
});
