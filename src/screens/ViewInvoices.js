import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { FlatList, TouchableOpacity, View, Text, StyleSheet, RefreshControl, Alert, ActivityIndicator } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import axios from 'axios';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Share from 'react-native-share';
import { API_URL, API_KEY } from '../config';

const MONTHS = [
  { label: 'All Months', value: 'all' },
  { label: 'January', value: '01' },
  { label: 'February', value: '02' },
  { label: 'March', value: '03' },
  { label: 'April', value: '04' },
  { label: 'May', value: '05' },
  { label: 'June', value: '06' },
  { label: 'July', value: '07' },
  { label: 'August', value: '08' },
  { label: 'September', value: '09' },
  { label: 'October', value: '10' },
  { label: 'November', value: '11' },
  { label: 'December', value: '12' },
];

const ListHeader = ({
  onRefresh,
  selectionCount,
  onGenerateSummary,
  selectedClient,
  setSelectedClient,
  clients,
  selectedMonth,
  setSelectedMonth,
  onSelectAll,
  isAllSelected,
  onExportCSV,
  isExporting
}) => (
  <View style={styles.headerContainer}>
    <View style={styles.titleRow}>
      <View>
        <Text style={styles.mainHeading}>Invoice History</Text>
        <Text style={styles.subHeading}>
          {selectionCount > 0 ? `${selectionCount} selected` : 'Pull down to refresh'}
        </Text>
      </View>
      <View style={styles.headerActions}>
        <TouchableOpacity
          onPress={onExportCSV}
          disabled={isExporting}
          style={[styles.iconButton, styles.csvIcon, isExporting && { opacity: 0.6 }]}
        >
          {isExporting ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <MaterialIcons name="file-download" size={24} color="#FFF" />
          )}
        </TouchableOpacity>
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

    <View style={styles.filterRow}>
      <Dropdown
        style={[styles.dropdown, { flex: 1.5 }]}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        inputSearchStyle={styles.inputSearchStyle}
        data={[{ label: 'All Clients', value: 'all' }, ...clients]}
        search
        maxHeight={300}
        labelField="label"
        valueField="value"
        placeholder="Client"
        searchPlaceholder="Search..."
        value={selectedClient}
        onChange={item => setSelectedClient(item.value)}
      />
      <Dropdown
        style={[styles.dropdown, { flex: 1 }]}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        data={MONTHS}
        maxHeight={300}
        labelField="label"
        valueField="value"
        placeholder="Month"
        value={selectedMonth}
        onChange={item => setSelectedMonth(item.value)}
      />
    </View>

    <TouchableOpacity style={styles.selectAllRow} onPress={onSelectAll}>
      <MaterialIcons
        name={isAllSelected ? "check-box" : "check-box-outline-blank"}
        size={22}
        color={isAllSelected ? "#007AFF" : "#666"}
      />
      <Text style={styles.selectAllText}>Select All Visible</Text>
    </TouchableOpacity>
  </View>
);

const ViewInvoices = ({ navigation }) => {
  const [records, setRecords] = useState([]);
  const [clients, setClients] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedClient, setSelectedClient] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('all');

  const fetchRecords = async () => {
    try {
      const res = await axios.get(`${API_URL}/records`, {
        headers: { 'x-api-key': API_KEY }
      });
      setRecords(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setRefreshing(false);
    }
  };

  const fetchClients = async () => {
    try {
      const res = await axios.get(`${API_URL}/clients`, {
        headers: { 'x-api-key': API_KEY }
      });
      setClients(res.data.map(client => ({ label: client.name, value: client.name })));
    } catch (err) {
      console.error('Failed to fetch clients', err);
    }
  };

  useEffect(() => {
    fetchRecords();
    fetchClients();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setSelectedIds([]);
    fetchRecords();
    fetchClients();
  }, []);

  const filteredRecords = useMemo(() => {
    return records.filter(item => {
      const matchClient = selectedClient === 'all' || item.clientName === selectedClient;

      let matchMonth = true;
      if (selectedMonth !== 'all') {
        const dateStr = String(item.date || '');
        const dateParts = dateStr.match(/\d+/g);
        if (dateParts && dateParts.length >= 2) {
          const month = dateParts[1];
          const normalizedMonth = month.padStart(2, '0');
          matchMonth = normalizedMonth === selectedMonth;
        } else {
          matchMonth = false;
        }
      }
      return matchClient && matchMonth;
    });
  }, [records, selectedClient, selectedMonth]);

  const isAllSelected = useMemo(() => {
    if (filteredRecords.length === 0) return false;
    return filteredRecords.every(r => selectedIds.includes(r.refNo));
  }, [filteredRecords, selectedIds]);

  const handleSelectAll = () => {
    if (isAllSelected) {
      const visibleIds = filteredRecords.map(r => r.refNo);
      setSelectedIds(prev => prev.filter(id => !visibleIds.includes(id)));
    } else {
      const visibleIds = filteredRecords.map(r => r.refNo);
      setSelectedIds(prev => {
        const others = prev.filter(id => !visibleIds.includes(id));
        return [...others, ...visibleIds];
      });
    }
  };

  const toggleSelection = (refNo) => {
    setSelectedIds(prev =>
      prev.includes(refNo) ? prev.filter(id => id !== refNo) : [...prev, refNo]
    );
  };

  const handleGenerateSummary = async () => {
    if (selectedIds.length === 0) return;
    try {
      const res = await axios.post(`${API_URL}/generate-summary`, { ids: selectedIds }, {
        headers: { 'x-api-key': API_KEY }
      });
      if (res.data.pdf) {
        navigation.navigate('PDF', { pdfData: res.data.pdf, refNo: "Summary_Report" });
        setSelectedIds([]);
      }
    } catch (err) {
      Alert.alert("Error", "Could not generate summary");
    }
  };

  const handleExportCSV = async () => {
    const idsToExport = selectedIds.length > 0
      ? selectedIds
      : filteredRecords.map(r => r.refNo);

    if (idsToExport.length === 0) {
      return Alert.alert("Export Error", "No records to export");
    }

    setIsExporting(true);
    try {
      const detailedInvoices = await Promise.all(
        idsToExport.map(async (id) => {
          const res = await axios.get(`${API_URL}/invoice/${encodeURIComponent(id)}`, {
            headers: { 'x-api-key': API_KEY }
          });
          return res.data;
        })
      );

      const rows = [];
      // Main Headers
      rows.push(["INVOICE DETAILS", "", "", "", "", "", ""]);

      detailedInvoices.forEach(inv => {
        if (!inv) return;

        // Group Header Row for each invoice
        rows.push(["Ref No", "Client Name", "Date", "Invoice Total", "", "", ""]);
        rows.push([`"${inv.refNo}"`, `"${inv.clientName}"`, `"${inv.date}"`, inv.total, "", "", ""]);

        // Items Sub-header
        rows.push(["", "Item Name", "Code", "Category", "Qty", "Rate", "Amount"]);

        if (inv.items && inv.items.length > 0) {
          inv.items.forEach(item => {
            rows.push([
              "",
              `"${item.name || ''}"`,
              `"${item.code || ''}"`,
              `"${item.category || ''}"`,
              item.qty,
              item.rate,
              (parseFloat(item.qty) || 0) * (parseFloat(item.rate) || 0)
            ]);
          });
        }

        // Blank row for separation
        rows.push(["", "", "", "", "", "", ""]);
      });

      const csvContent = rows.map(r => r.join(",")).join("\n");

      // Safe base64 encoding for React Native
      const base64Content = (typeof Buffer !== 'undefined')
        ? Buffer.from(csvContent, 'utf-8').toString('base64')
        : btoa(unescape(encodeURIComponent(csvContent)));

      const today = new Date();
      const dateStr = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;
      const filename = `Invoice_Report_${dateStr}`;

      const shareOptions = {
        title: 'Export Grouped CSV',
        url: `data:text/csv;base64,${base64Content}`,
        filename: filename,
        type: 'text/csv',
        failOnCancel: false,
      };

      await Share.open(shareOptions);
    } catch (err) {
      console.error('Export failed', err);
      Alert.alert("Export Failed", "Could not generate grouped CSV");
    } finally {
      setIsExporting(false);
    }
  };

  const handleItemClick = async (refNo) => {
    if (selectedIds.length > 0) {
      toggleSelection(refNo);
      return;
    }

    try {
      const res = await axios.post(`${API_URL}/fetch-pdf` ,{ refNo }, {headers: { 'x-api-key': API_KEY }} );
      if (res.data.pdf) {
        navigation.navigate('PDF', { pdfData: res.data.pdf, refNo });
      }
    } catch (err) { console.error(err); }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredRecords}
        keyExtractor={(item) => item.refNo}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <ListHeader
            onRefresh={onRefresh}
            selectionCount={selectedIds.length}
            onGenerateSummary={handleGenerateSummary}
            selectedClient={selectedClient}
            setSelectedClient={setSelectedClient}
            clients={clients}
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
            onSelectAll={handleSelectAll}
            isAllSelected={isAllSelected}
            onExportCSV={handleExportCSV}
            isExporting={isExporting}
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
              onLongPress={() => toggleSelection(item.refNo)}
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
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.priceText}>₹ {item.total}</Text>
                <Text style={styles.dateText}>{item.date}</Text>
              </View>
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
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 16,
    elevation: 5,
  },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  headerActions: { flexDirection: 'row', gap: 10 },
  mainHeading: { fontSize: 24, fontWeight: 'bold', color: '#1a1a1a' },
  subHeading: { fontSize: 13, color: '#007AFF', marginTop: 2, fontWeight: '600' },
  iconButton: { padding: 8, backgroundColor: '#f0f7ff', borderRadius: 50 },
  summaryIcon: { backgroundColor: '#007AFF' },
  csvIcon: { backgroundColor: '#2ecc71' },
  filterRow: { flexDirection: 'row', gap: 10, marginTop: 5 },
  dropdown: {
    height: 45,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  placeholderStyle: { fontSize: 14, color: '#999' },
  selectedTextStyle: { fontSize: 14, color: '#333', fontWeight: '500' },
  inputSearchStyle: { height: 40, fontSize: 14, borderRadius: 8 },
  selectAllRow: { flexDirection: 'row', alignItems: 'center', marginTop: 15, paddingHorizontal: 5 },
  selectAllText: { marginLeft: 8, fontSize: 14, color: '#444', fontWeight: '500' },
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
  priceText: { fontSize: 16, fontWeight: 'bold', color: '#2ecc71' },
  dateText: { fontSize: 11, color: '#999', marginTop: 2 }
});

export default ViewInvoices;
