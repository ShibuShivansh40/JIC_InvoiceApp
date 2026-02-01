import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const API_URL = 'https://fd343d90abe2.ngrok-free.app/api';

const Dashboard = ({ navigation }) => {
  const [totalCount, setTotalCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      const fetchCount = async () => {
        try {
          const res = await axios.get(`${API_URL}/count`);
//          const res = await axios.get('https://rupeefunda.com/api/count');
          setTotalCount(res.data.count);
        } catch (err) { console.error(err); }
      };
      fetchCount();
    }, [])
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Consistent Header Style */}
      <View style={styles.headerContainer}>
        <Text style={styles.mainHeading}>Jai Industrial Corp</Text>
        <Text style={styles.subHeading}>Operations Dashboard</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.statsCard}>
          <View>
            <Text style={styles.statsLabel}>Total Memos</Text>
            <Text style={styles.statsValue}>{totalCount}</Text>
          </View>
          <MaterialIcons name="description" size={50} color="#E3F2FD" />
        </View>

        <TouchableOpacity style={styles.mainBtn} onPress={() => navigation.navigate('Create')}>
          <MaterialIcons name="add-circle" size={24} color="#FFF" style={{ marginRight: 10 }} />
          <Text style={styles.btnText}>Create New Memo</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.mainBtn, styles.secondaryBtn]} onPress={() => navigation.navigate('Records')}>
          <MaterialIcons name="history" size={24} color="#FFF" style={{ marginRight: 10 }} />
          <Text style={styles.btnText}>View History</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  headerContainer: {
    padding: 24,
    paddingTop: 50,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
  },
  mainHeading: { fontSize: 28, fontWeight: 'bold', color: '#1a1a1a' },
  subHeading: { fontSize: 14, color: '#007AFF', fontWeight: '600', marginTop: 4 },
  content: { padding: 20 },
  statsCard: {
    backgroundColor: '#007AFF',
    padding: 30,
    borderRadius: 20,
    marginVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 8,
  },
  statsLabel: { color: '#FFF', fontSize: 14, textTransform: 'uppercase', opacity: 0.8 },
  statsValue: { fontSize: 54, fontWeight: 'bold', color: '#FFF' },
  mainBtn: { backgroundColor: '#1a1a1a', padding: 20, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 15, elevation: 4 },
  secondaryBtn: { backgroundColor: '#455A64' },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});

export default Dashboard;
