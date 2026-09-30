import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { API_URL, API_KEY } from '../config';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const Dashboard = ({ navigation }) => {
  const [totalCount, setTotalCount] = useState(0);
  const { isDarkMode, toggleTheme, theme } = useTheme();
  const { logout } = useAuth();

  useFocusEffect(
    useCallback(() => {
      const fetchCount = async () => {
        try {
          const res = await axios.get(`${API_URL}/count`, {
            headers: { 'x-api-key': API_KEY }
          });
          setTotalCount(res.data.count);
        } catch (err) {
          console.error(err);
        }
      };
      fetchCount();
    }, [])
  );

  const handleLogout = () => {
    logout();
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.headerBackground} />

      {/* Header Container */}
      <View style={[styles.headerContainer, { backgroundColor: theme.headerBackground, borderColor: theme.border }]}>
        <View style={styles.titleWrapper}>
          <View>
            <Text style={[styles.mainHeading, { color: theme.textPrimary }]}>Jai Industrial Corp</Text>
            <Text style={[styles.subHeading, { color: theme.accent }]}>Operations Dashboard</Text>
          </View>

          {/* Controls: Theme Toggle & Logout */}
          <View style={styles.headerControls}>
            <TouchableOpacity
              style={[styles.headerBtn, { backgroundColor: isDarkMode ? '#2C2C2E' : '#F0F7FF' }]}
              onPress={toggleTheme}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isDarkMode ? "sunny" : "moon"}
                size={20}
                color={isDarkMode ? "#FFD60A" : "#007AFF"}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.headerBtn, { backgroundColor: '#FFF0F0', marginLeft: 8 }]}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <Ionicons name="log-out-outline" size={20} color="#E53E3E" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        {/* Main Stats Card */}
        <View style={[styles.statsCard, { backgroundColor: theme.accent }]}>
          <View>
            <Text style={styles.statsLabel}>Total Memos Generated</Text>
            <Text style={styles.statsValue}>{totalCount}</Text>
          </View>
          <View style={styles.statsIconWrapper}>
            <MaterialIcons name="description" size={42} color="#FFF" />
          </View>
        </View>

        {/* Action Grid */}
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Quick Actions</Text>

        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
          onPress={() => navigation.navigate('Create')}
          activeOpacity={0.8}
        >
          <View style={[styles.actionIconWrapper, { backgroundColor: '#E3F2FD' }]}>
            <MaterialIcons name="add-circle" size={28} color="#007AFF" />
          </View>
          <View style={styles.actionTextWrapper}>
            <Text style={[styles.actionTitle, { color: theme.textPrimary }]}>Create New Memo</Text>
            <Text style={[styles.actionSub, { color: theme.textSecondary }]}>Generate and save new invoice</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color={theme.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
          onPress={() => navigation.navigate('Records')}
          activeOpacity={0.8}
        >
          <View style={[styles.actionIconWrapper, { backgroundColor: '#E8F5E9' }]}>
            <MaterialIcons name="history" size={28} color="#27AE60" />
          </View>
          <View style={styles.actionTextWrapper}>
            <Text style={[styles.actionTitle, { color: theme.textPrimary }]}>Invoice Records</Text>
            <Text style={[styles.actionSub, { color: theme.textSecondary }]}>Filter, search, and export CSV/PDF</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color={theme.textSecondary} />
        </TouchableOpacity>

        {/* App Info Footer */}
        <View style={styles.footerContainer}>
          <Text style={[styles.footerText, { color: theme.textSecondary }]}>Version 1.0.0 • Jai Industrial Corp</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerContainer: {
    padding: 24,
    paddingTop: 55,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    borderBottomWidth: 1,
  },
  titleWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mainHeading: { fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  subHeading: { fontSize: 14, fontWeight: '700', marginTop: 4 },
  headerControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerBtn: {
    padding: 10,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { padding: 20 },
  statsCard: {
    padding: 24,
    borderRadius: 22,
    marginVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  statsLabel: { color: 'rgba(255, 255, 255, 0.85)', fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  statsValue: { fontSize: 44, fontWeight: '800', color: '#FFF', marginTop: 4 },
  statsIconWrapper: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 12,
    borderRadius: 18,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 12,
  },
  actionCard: {
    padding: 16,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  actionIconWrapper: {
    padding: 12,
    borderRadius: 14,
  },
  actionTextWrapper: {
    flex: 1,
    marginLeft: 14,
  },
  actionTitle: { fontSize: 16, fontWeight: '700' },
  actionSub: { fontSize: 12, marginTop: 2 },
  footerContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default Dashboard;
