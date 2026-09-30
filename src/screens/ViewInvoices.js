import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { FlatList, TouchableOpacity, View, Text, StyleSheet, RefreshControl, Alert, ActivityIndicator } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import axios from 'axios';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Share from 'react-native-share';
import { API_URL, API_KEY } from '../config';
import { useTheme } from '../context/ThemeContext';

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
  isExporting,
  theme,
  isDarkMode
}) => (
  <View style={[styles.headerContainer, { backgroundColor: theme.headerBackground, borderColor: theme.border }]}>
    <View style={styles.titleRow}>
      <View>
        <Text style={[styles.mainHeading, { color: theme.textPrimary }]}>Invoice History</Text>
        <Text style={[styles.subHeading, { color: theme.accent }]}>
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
        <TouchableOpacity onPress={onRefresh} style={[styles.iconButton, { backgroundColor: isDarkMode ? '#2C2C2E' : '#F0F7FF' }]}>
          <MaterialIcons name="refresh" size={24} color={theme.accent} />
        </TouchableOpacity>
      </View>
    </View>

    <View style={styles.filterRow}>
      <Dropdown
        style={[styles.dropdown, { flex: 1.5, backgroundColor: theme.inputBackground, borderColor: theme.border }]}
        containerStyle={{ backgroundColor: theme.cardBackground, borderColor: theme.border, borderRadius: 16, overflow: 'hidden' }}
        itemTextStyle={{ color: theme.textPrimary }}
        itemContainerStyle={{ backgroundColor: theme.cardBackground }}
        activeColor={isDarkMode ? '#2C2C2E' : '#F0F7FF'}
        placeholderStyle={[styles.placeholderStyle, { color: theme.textSecondary }]}
        selectedTextStyle={[styles.selectedTextStyle, { color: theme.textPrimary }]}
        inputSearchStyle={[styles.inputSearchStyle, { backgroundColor: theme.background, color: theme.textPrimary, borderColor: theme.border }]}
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
        style={[styles.dropdown, { flex: 1, backgroundColor: theme.inputBackground, borderColor: theme.border }]}
        containerStyle={{ backgroundColor: theme.cardBackground, borderColor: theme.border, borderRadius: 16, overflow: 'hidden' }}
        itemTextStyle={{ color: theme.textPrimary }}
        itemContainerStyle={{ backgroundColor: theme.cardBackground }}
        activeColor={isDarkMode ? '#2C2C2E' : '#F0F7FF'}
        placeholderStyle={[styles.placeholderStyle, { color: theme.textSecondary }]}
        selectedTextStyle={[styles.selectedTextStyle, { color: theme.textPrimary }]}
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
        color={isAllSelected ? theme.accent : theme.textSecondary}
      />
      <Text style={[styles.selectAllText, { color: theme.textPrimary }]}>Select All Visible</Text>
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

  const { theme, isDarkMode } = useTheme();

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
      rows.push(["INVOICE DETAILS", "", "", "", "", "", ""]);

      detailedInvoices.forEach(inv => {
        if (!inv) return;
        rows.push(["Ref No", "Client Name", "Date", "Invoice Total", "", "", ""]);
        rows.push([`"${inv.refNo}"`, `"${inv.clientName}"`, `"${inv.date}"`, inv.total, "", "", ""]);
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
        rows.push(["", "", "", "", "", "", ""]);
      });

      const csvContent = rows.map(r => r.join(",")).join("\n");
      const base64Content = (typeof Buffer !== 'undefined')
        ? Buffer.from(csvContent, 'utf-8').toString('base64')
        : btoa(unescape(encodeURIComponent(csvContent)));

      const today = new Date();
      const dateStr = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;
      const filename = `Invoice_Report_${dateStr}.csv`;

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
    <View style={[styles.container, { backgroundColor: theme.background }]}>
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
            theme={theme}
            isDarkMode={isDarkMode}
          />
        }
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.accent]} />
        }
        renderItem={({ item }) => {
          const isSelected = selectedIds.includes(item.refNo);
          return (
            <TouchableOpacity
              style={[
                styles.card,
                { backgroundColor: theme.cardBackground, borderColor: isSelected ? theme.accent : theme.border },
                isSelected && { backgroundColor: isDarkMode ? '#1E293B' : '#F0F7FF' }
              ]}
              onPress={() => handleItemClick(item.refNo)}
              onLongPress={() => toggleSelection(item.refNo)}
            >
              <View style={styles.cardMain}>
                <View style={styles.checkIcon}>
                  <MaterialIcons
                    name={isSelected ? "check-circle" : "radio-button-unchecked"}
                    size={22}
                    color={isSelected ? theme.accent : theme.textSecondary}
                  />
                </View>
                <View>
                  <Text style={[styles.refText, { color: theme.accent }]}>{item.refNo}</Text>
                  <Text style={[styles.clientText, { color: theme.textPrimary }]}>{item.clientName}</Text>
                </View>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[styles.priceText, { color: theme.success }]}>₹ {item.total}</Text>
                <Text style={[styles.dateText, { color: theme.textSecondary }]}>{item.date}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { paddingBottom: 100 },
  headerContainer: {
    padding: 20,
    paddingTop: 50,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 16,
    elevation: 4,
    borderBottomWidth: 1,
  },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  headerActions: { flexDirection: 'row', gap: 10 },
  mainHeading: { fontSize: 24, fontWeight: 'bold' },
  subHeading: { fontSize: 13, marginTop: 2, fontWeight: '600' },
  iconButton: { padding: 8, borderRadius: 50 },
  summaryIcon: { backgroundColor: '#007AFF' },
  csvIcon: { backgroundColor: '#27AE60' },
  filterRow: { flexDirection: 'row', gap: 10, marginTop: 5 },
  dropdown: {
    height: 46,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
  },
  placeholderStyle: { fontSize: 14 },
  selectedTextStyle: { fontSize: 14, fontWeight: '500' },
  inputSearchStyle: { height: 40, fontSize: 14, borderRadius: 8 },
  selectAllRow: { flexDirection: 'row', alignItems: 'center', marginTop: 15, paddingHorizontal: 5 },
  selectAllText: { marginLeft: 8, fontSize: 14, fontWeight: '500' },
  card: {
    padding: 18,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 3,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  cardMain: { flexDirection: 'row', alignItems: 'center' },
  checkIcon: { marginRight: 12 },
  refText: { fontWeight: 'bold', fontSize: 13 },
  clientText: { fontSize: 16, fontWeight: '600', marginTop: 2 },
  priceText: { fontSize: 16, fontWeight: 'bold' },
  dateText: { fontSize: 11, marginTop: 2 }
});

export default ViewInvoices;
