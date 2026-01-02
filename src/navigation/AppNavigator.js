import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import Dashboard from '../screens/Dashboard';
import CreateInvoice from '../screens/CreateInvoice';
import ViewInvoices from '../screens/ViewInvoices';
import PDFPreview from '../screens/PDFViewer';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <View style={{ flex: 1, backgroundColor: '#F8F9FB' }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarShowLabel: false,
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: '#000', // Solid black for active state
          tabBarInactiveTintColor: '#ADB5BD', // Soft grey for inactive
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
            else if (route.name === 'Create') iconName = focused ? 'add-circle' : 'add-circle-outline';
            else if (route.name === 'Records') iconName = focused ? 'document-text' : 'document-text-outline';
            else if (route.name === 'PDF') iconName = focused ? 'print' : 'print-outline';

            return (
              <View style={styles.iconContainer}>
                <Icon name={iconName} size={24} color={color} />
                {focused && <View style={styles.activeDot} />}
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
  tabBar: {
    position: 'absolute',
    bottom: 10,
    left: 25,
    right: 25,
    height: 65,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderTopWidth: 0,
    // Elegant Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: 60,
  },
  activeDot: {
    position: 'absolute',
    bottom: -10,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#000',
  }
});
