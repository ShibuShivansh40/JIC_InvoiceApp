//import React, { useEffect, useState, useCallback } from 'react';
//import { FlatList, TouchableOpacity, View, Text, StyleSheet, RefreshControl } from 'react-native';
//import axios from 'axios';
//import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
//
//// 1. MOVE ListHeader OUTSIDE ViewInvoices [web:555]
//// This prevents React from thinking it's a new component on every render.
//const ListHeader = ({ onRefresh }) => (
//  <View style={styles.headerContainer}>
//    <View style={styles.titleRow}>
//      <View>
//        <Text style={styles.mainHeading}>Invoice History</Text>
//        <Text style={styles.subHeading}>Pull down to refresh</Text>
//      </View>
//      <TouchableOpacity onPress={onRefresh} style={styles.iconButton}>
//        <MaterialIcons name="refresh" size={28} color="#007AFF" />
//      </TouchableOpacity>
//    </View>
//  </View>
//);
//
//const ViewInvoices = ({ navigation }) => {
//  const [records, setRecords] = useState([]);
//  const [refreshing, setRefreshing] = useState(false);
//
//  const fetchRecords = async () => {
//    try {
//      const res = await axios.get('https://rupeefunda.com/api/records');
//      setRecords(res.data);
//    } catch (err) {
//      console.error(err);
//    } finally {
//      setRefreshing(false);
//    }
//  };
//
//  useEffect(() => { fetchRecords(); }, []);
//
//  const onRefresh = useCallback(() => {
//    setRefreshing(true);
//    fetchRecords();
//  }, []);
//
//  const handleItemClick = async (refNo) => {
//    try {
//      const res = await axios.post('https://rupeefunda.com/api/fetch-pdf', { refNo });
//      if (res.data.pdf) {
//        navigation.navigate('PDF', { pdfData: res.data.pdf, refNo });
//      }
//    } catch (err) { console.error(err); }
//  };
//
//  return (
//    <View style={styles.container}>
//      <FlatList
//        data={records}
//        keyExtractor={(item) => item.refNo}
//        contentContainerStyle={styles.listContent}
//        // 2. Pass the component reference here [web:521]
//        ListHeaderComponent={<ListHeader onRefresh={onRefresh} />}
//        showsVerticalScrollIndicator={false}
//        refreshControl={
//          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#007AFF"]} />
//        }
//        renderItem={({ item }) => (
//          <TouchableOpacity style={styles.card} onPress={() => handleItemClick(item.refNo)}>
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
//// Styles remain the same...
//const styles = StyleSheet.create({
//  container: { flex: 1, backgroundColor: '#f8f9fa' },
//  listContent: { paddingBottom: 30 },
//  headerContainer: {
//    padding: 24,
//    paddingTop: 50,
//    backgroundColor: '#fff',
//    borderBottomLeftRadius: 20,
//    borderBottomRightRadius: 20,
//    marginBottom: 16,
//    elevation: 3,
//  },
//  titleRow: {
//    flexDirection: 'row',
//    justifyContent: 'space-between',
//    alignItems: 'center',
//  },
//  mainHeading: { fontSize: 28, fontWeight: 'bold', color: '#1a1a1a' },
//  subHeading: { fontSize: 13, color: '#666', marginTop: 2 },
//  iconButton: {
//    padding: 8,
//    backgroundColor: '#f0f7ff',
//    borderRadius: 50,
//  },
//  card: {
//    backgroundColor: 'white',
//    padding: 20,
//    marginHorizontal: 16,
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
import { FlatList, TouchableOpacity, View, Text, StyleSheet, RefreshControl, Alert } from 'react-native';
import axios from 'axios';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const API_URL = 'https://fd343d90abe2.ngrok-free.app/api';

// Header remains outside to prevent Hook order violations [web:555]
const ListHeader = ({ onRefresh, selectionCount, onGenerateSummary }) => (
  <View style={styles.headerContainer}>
    <View style={styles.titleRow}>
      <View>
        <Text style={styles.mainHeading}>Invoice History</Text>
        <Text style={styles.subHeading}>
          {selectionCount > 0 ? `${selectionCount} selected` : 'Pull down to refresh'}
        </Text>
      </View>
      <View style={styles.headerActions}>
        {selectionCount > 0 && (
          <TouchableOpacity onPress={onGenerateSummary} style={[styles.iconButton, styles.summaryIcon]}>
            <MaterialIcons name="assessment" size={24} color="#FFF" />
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={onRefresh} style={styles.iconButton}>
          <MaterialIcons name="refresh" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>
    </View>
  </View>
);

const ViewInvoices = ({ navigation }) => {
  const [records, setRecords] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]); // Array of refNo [web:834]

  const fetchRecords = async () => {
    try {
      const res = await axios.get(`${API_URL}/records`);
//      const res = await axios.get('https://rupeefunda.com/api/records');
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
    setSelectedIds([]); // Clear selection on refresh
    fetchRecords();
  }, []);

  // Handle Multi-Select Toggle [web:831]
  const toggleSelection = (refNo) => {
    setSelectedIds(prev =>
      prev.includes(refNo) ? prev.filter(id => id !== refNo) : [...prev, refNo]
    );
  };

  const handleGenerateSummary = async () => {
    if (selectedIds.length === 0) return;
    try {
      const res = await axios.post(`${API_URL}/generate-summary`, { ids: selectedIds });
//      const res = await axios.post('https://rupeefunda.com/api/generate-summary', { ids: selectedIds });
      if (res.data.pdf) {
        navigation.navigate('PDF', { pdfData: res.data.pdf, refNo: "Summary_Report" });
        setSelectedIds([]); // Clear after success
      }
    } catch (err) {
      Alert.alert("Error", "Could not generate summary");
    }
  };

  const handleItemClick = async (refNo) => {
    // If we are in "selection mode", clicking toggles selection [web:831]
    if (selectedIds.length > 0) {
      toggleSelection(refNo);
      return;
    }

    // Otherwise, open the specific PDF
    try {
      const res = await axios.post(`${API_URL}/fetch-pdf` ,{ refNo });
//      const res = await axios.post('https://rupeefunda.com/api/fetch-pdf', { refNo });
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
        ListHeaderComponent={
          <ListHeader
            onRefresh={onRefresh}
            selectionCount={selectedIds.length}
            onGenerateSummary={handleGenerateSummary}
          />
        }
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#007AFF"]} />
        }
        renderItem={({ item }) => {
          const isSelected = selectedIds.includes(item.refNo);
          return (
            <TouchableOpacity
              style={[styles.card, isSelected && styles.selectedCard]}
              onPress={() => handleItemClick(item.refNo)}
              onLongPress={() => toggleSelection(item.refNo)} // Long press to start selection [web:831]
            >
              <View style={styles.cardMain}>
                <View style={styles.checkIcon}>
                  <MaterialIcons
                    name={isSelected ? "check-circle" : "radio-button-unchecked"}
                    size={22}
                    color={isSelected ? "#007AFF" : "#ccc"}
                  />
                </View>
                <View>
                  <Text style={styles.refText}>{item.refNo}</Text>
                  <Text style={styles.clientText}>{item.clientName}</Text>
                </View>
              </View>
              <Text style={styles.priceText}>₹ {item.total}</Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

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
    elevation: 5,
  },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerActions: { flexDirection: 'row', gap: 10 },
  mainHeading: { fontSize: 26, fontWeight: 'bold', color: '#1a1a1a' },
  subHeading: { fontSize: 13, color: '#007AFF', marginTop: 2, fontWeight: '600' },
  iconButton: { padding: 10, backgroundColor: '#f0f7ff', borderRadius: 50 },
  summaryIcon: { backgroundColor: '#007AFF' },
  card: {
    backgroundColor: 'white',
    padding: 18,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 3,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedCard: { borderColor: '#007AFF', backgroundColor: '#f0f7ff' },
  cardMain: { flexDirection: 'row', alignItems: 'center' },
  checkIcon: { marginRight: 12 },
  refText: { fontWeight: 'bold', fontSize: 13, color: '#007AFF' },
  clientText: { fontSize: 16, fontWeight: '500', color: '#333', marginTop: 2 },
  priceText: { fontSize: 16, fontWeight: 'bold', color: '#2ecc71' }
});

export default ViewInvoices;
