//import React, { useEffect, useState } from 'react';
//import { FlatList, TouchableOpacity, View, Text, StyleSheet } from 'react-native';
//import axios from 'axios';
//
//const ViewInvoices = ({ navigation }) => {
//  const [records, setRecords] = useState([]);
//
//  useEffect(() => {
//    fetchRecords();
//  }, []);
//
//  const fetchRecords = async () => {
//    try {
//      const res = await axios.get('https://67c33a733cfc.ngrok-free.app/api/records');
//      setRecords(res.data);
//    } catch (err) { console.error(err); }
//  };
//
//  const handleItemClick = async (refNo) => {
//    try {
//      const res = await axios.post('https://67c33a733cfc.ngrok-free.app/api/fetch-pdf', { refNo });
//      if (res.data.pdf) {
//        navigation.navigate('PDF', { pdfData: res.data.pdf, refNo });
//      }
//    } catch (err) { console.error(err); }
//  };
//
//  // 1. Separate Header Component [web:521]
//  const ListHeader = () => (
//    <View style={styles.headerContainer}>
//      <Text style={styles.mainHeading}>Invoice History</Text>
//      <Text style={styles.subHeading}>View and download your past records</Text>
//    </View>
//  );
//
//  return (
//    <View style={styles.container}>
//      <FlatList
//        data={records}
//        keyExtractor={(item) => item.refNo}
//        contentContainerStyle={styles.listContent}
//        ListHeaderComponent={ListHeader} // Renders heading at the top [web:521]
//        showsVerticalScrollIndicator={false}
//        renderItem={({ item }) => (
//          <TouchableOpacity
//            style={styles.card}
//            onPress={() => handleItemClick(item.refNo)}
//          >
//            <View>
//              <Text style={styles.refText}>{item.refNo}</Text>
//              <Text style={styles.clientText}>{item.clientName}</Text>
//            </View>
//            <Text style={styles.priceText}>₹ {item.total}</Text>
//          </TouchableOpacity>
//        )}
//      />
//    </View>
//  );
//};
//
//const styles = StyleSheet.create({
//  container: { flex: 1, backgroundColor: '#f8f9fa' },
//  listContent: { paddingBottom: 30 }, // Extra space at bottom
//  headerContainer: {
//    padding: 24,
//    backgroundColor: '#fff',
//    borderBottomLeftRadius: 20,
//    borderBottomRightRadius: 20,
//    marginBottom: 16,
//    elevation: 2,
//  },
//  mainHeading: {
//    fontSize: 28,
//    fontWeight: 'bold',
//    color: '#1a1a1a',
//  },
//  subHeading: {
//    fontSize: 14,
//    color: '#666',
//    marginTop: 4,
//  },
//  card: {
//    backgroundColor: 'white',
//    padding: 20,
//    marginHorizontal: 16, // Side margins
//    marginBottom: 12,
//    borderRadius: 12,
//    flexDirection: 'row',
//    justifyContent: 'space-between',
//    alignItems: 'center',
//    elevation: 3,
//    shadowColor: '#000',
//    shadowOffset: { width: 0, height: 1 },
//    shadowOpacity: 0.1,
//  },
//  refText: { fontWeight: 'bold', fontSize: 13, color: '#007AFF' },
//  clientText: { fontSize: 17, fontWeight: '500', color: '#333', marginTop: 2 },
//  priceText: { fontSize: 18, fontWeight: 'bold', color: '#2ecc71' }
//});
//
//export default ViewInvoices;


import React, { useEffect, useState, useCallback } from 'react';
import { FlatList, TouchableOpacity, View, Text, StyleSheet, RefreshControl } from 'react-native';
import axios from 'axios';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

// 1. MOVE ListHeader OUTSIDE ViewInvoices [web:555]
// This prevents React from thinking it's a new component on every render.
const ListHeader = ({ onRefresh }) => (
  <View style={styles.headerContainer}>
    <View style={styles.titleRow}>
      <View>
        <Text style={styles.mainHeading}>Invoice History</Text>
        <Text style={styles.subHeading}>Pull down to refresh</Text>
      </View>
      <TouchableOpacity onPress={onRefresh} style={styles.iconButton}>
        <MaterialIcons name="refresh" size={28} color="#007AFF" />
      </TouchableOpacity>
    </View>
  </View>
);

const ViewInvoices = ({ navigation }) => {
  const [records, setRecords] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRecords = async () => {
    try {
      const res = await axios.get('https://67c33a733cfc.ngrok-free.app/api/records');
      setRecords(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchRecords(); }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchRecords();
  }, []);

  const handleItemClick = async (refNo) => {
    try {
      const res = await axios.post('https://67c33a733cfc.ngrok-free.app/api/fetch-pdf', { refNo });
      if (res.data.pdf) {
        navigation.navigate('PDF', { pdfData: res.data.pdf, refNo });
      }
    } catch (err) { console.error(err); }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={records}
        keyExtractor={(item) => item.refNo}
        contentContainerStyle={styles.listContent}
        // 2. Pass the component reference here [web:521]
        ListHeaderComponent={<ListHeader onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#007AFF"]} />
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => handleItemClick(item.refNo)}>
            <View>
              <Text style={styles.refText}>{item.refNo}</Text>
              <Text style={styles.clientText}>{item.clientName}</Text>
            </View>
            <Text style={styles.priceText}>₹ {item.total}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

// Styles remain the same...
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  listContent: { paddingBottom: 30 },
  headerContainer: {
    padding: 24,
    paddingTop: 50,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 16,
    elevation: 3,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mainHeading: { fontSize: 28, fontWeight: 'bold', color: '#1a1a1a' },
  subHeading: { fontSize: 13, color: '#666', marginTop: 2 },
  iconButton: {
    padding: 8,
    backgroundColor: '#f0f7ff',
    borderRadius: 50,
  },
  card: {
    backgroundColor: 'white',
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
  },
  refText: { fontWeight: 'bold', fontSize: 13, color: '#007AFF' },
  clientText: { fontSize: 17, fontWeight: '500', color: '#333', marginTop: 2 },
  priceText: { fontSize: 18, fontWeight: 'bold', color: '#2ecc71' }
});

export default ViewInvoices;
