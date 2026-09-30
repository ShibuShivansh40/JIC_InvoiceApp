import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, Alert, Modal, ActivityIndicator } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import axios from 'axios';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { saveInvoice } from '../database/db';
import { API_URL, API_KEY } from '../config';
import { useTheme } from '../context/ThemeContext';

const CATEGORY_DATA = [
  { label: 'Colored', value: 'Colored' },
  { label: 'Black', value: 'Black' },
  { label: 'Anti-Skid', value: 'Anti-Skid' },
];

const CreateInvoice = ({ navigation, route }) => {
  const [clientName, setClientName] = useState('');
  const [refNo, setRefNo] = useState('');
  const [date, setDate] = useState(new Date().toLocaleDateString('en-IN'));
  const [items, setItems] = useState([{ name: '', category: '', qty: '', rate: '' }]);
  const [total, setTotal] = useState(0);
  const [isClientModalVisible, setClientModalVisible] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientAddress, setNewClientAddress] = useState('');
  const [isProductModalVisible, setProductModalVisible] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductCode, setNewProductCode] = useState('');
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);

  const { theme, isDarkMode } = useTheme();

  useEffect(() => {
    fetchClients();
    fetchProducts();
  }, []);

  // Pre-fill data if in edit mode
  useEffect(() => {
    if (route.params?.invoiceData) {
      const { clientName, refNo, date, items, total } = route.params.invoiceData;
      setClientName(clientName || '');
      setRefNo(refNo || '');
      setDate(date || new Date().toLocaleDateString('en-IN'));

      // Normalize categories and convert numeric fields to String for TextInput safety
      const normalizedItems = (items || []).map(item => {
        let cat = item.category || '';
        const upperCat = cat.toUpperCase().replace(/[^A-Z0-9]/g, '');

        if (upperCat === 'ANTISKID' || upperCat === '7D' || upperCat === 'ANTISKIDMATMIX') {
          cat = 'Anti-Skid';
        } else if (upperCat === 'COLORED') {
          cat = 'Colored';
        } else if (upperCat === 'BLACK') {
          cat = 'Black';
        }

        return {
          ...item,
          category: cat,
          qty: item.qty !== undefined && item.qty !== null ? String(item.qty) : '',
          rate: item.rate !== undefined && item.rate !== null ? String(item.rate) : '',
        };
      });

      setItems(normalizedItems.length > 0 ? normalizedItems : [{ name: '', category: '', qty: '', rate: '' }]);
      setTotal(Number(total) || 0);
      setIsEditMode(true);
    }
  }, [route.params]);

  const fetchClients = async () => {
    setLoadingClients(true);
    try {
      const res = await axios.get(`${API_URL}/clients`, {
        headers: { 'x-api-key': API_KEY }
      });
      setClients(res.data.map(client => ({ label: client.name, value: client.name })));
    } catch (err) {
      Alert.alert('Error', 'Failed to fetch clients');
    } finally {
      setLoadingClients(false);
    }
  };

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const res = await axios.get(`${API_URL}/products`, {
        headers: { 'x-api-key': API_KEY }
      });
      setProducts(res.data.map(product => ({
        label: `${product.code} - ${product.name}`,
        value: product.name,
        code: product.code,
        category: product.category
      })));
    } catch (err) {
      Alert.alert('Error', 'Failed to fetch products');
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleAddItem = () => {
    setItems([...items, { name: '', category: '', qty: '', rate: '' }]);
  };

  const handleRemoveItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    calculateTotal(newItems);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];

    if (field === 'rate') {
      newItems[index][field] = (value === '' || isNaN(value)) ? '0' : value;
    } else {
      newItems[index][field] = value;
    }

    if (field === 'name') {
      const selected = products.find(p => p.value === value);
      if (selected) {
        newItems[index].category = selected.category || getCategoryFromCode(selected.code);
      }
    }
    setItems(newItems);
    calculateTotal(newItems);
  };

  const calculateTotal = (updatedItems) => {
    const newTotal = updatedItems.reduce((sum, item) => {
      return sum + (parseFloat(item.qty) || 0) * (parseFloat(item.rate) || 0);
    }, 0);
    setTotal(newTotal);
  };

  const handleSyncAndPrint = async () => {
    if (!clientName.trim()) {
      return Alert.alert('Error', 'Client name is required');
    }
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.name?.trim() ||
          !item.category?.trim() ||
          !item.qty?.trim() ||
          parseFloat(item.qty) <= 0 ||
          parseFloat(item.rate) < 0) {
        return Alert.alert('Error', `Item ${i + 1}: All fields required. Qty must be > 0, Rate >= 0`);
      }
    }

    const invoiceData = { clientName, refNo, date, items, total };

    try {
      let res;
      const encodedRefNo = encodeURIComponent(refNo);

      if (isEditMode) {
        res = await axios.put(`${API_URL}/update-invoice/${encodedRefNo}`, invoiceData, {
          headers: { 'x-api-key': API_KEY }
        });
      } else {
        res = await axios.post(`${API_URL}/generate-pdf`, invoiceData, {
          headers: { 'x-api-key': API_KEY }
        });
      }

      if (res.data.success) {
        await saveInvoice(invoiceData);
        navigation.navigate('PDF', { pdfData: res.data.pdf, refNo: res.data.refNo || refNo });
        if (!isEditMode) {
          setClientName('');
          setRefNo('');
          setItems([{ name: '', category: '', qty: '', rate: '' }]);
          setTotal(0);
        }
      }
    } catch (err) {
      console.error('Sync error:', err.response?.data || err.message);
      Alert.alert('Error', err.response?.data?.error || 'Failed to generate/update PDF');
    }
  };

  const handleAddClient = async () => {
    if (!newClientName) return Alert.alert('Error', 'Client name required');
    try {
      await axios.post(`${API_URL}/clients`, { name: newClientName, address: newClientAddress }, {
        headers: { 'x-api-key': API_KEY }
      });
      setClientModalVisible(false);
      setNewClientName('');
      setNewClientAddress('');
      fetchClients();
      Alert.alert('Success', 'Client added');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to add client');
    }
  };

  const handleAddProduct = async () => {
    if (!newProductName || !newProductCode) return Alert.alert('Error', 'Name and code required');
    const category = getCategoryFromCode(newProductCode);
    try {
      await axios.post(`${API_URL}/products`, { name: newProductName, code: newProductCode, category }, {
        headers: { 'x-api-key': API_KEY }
      });
      setProductModalVisible(false);
      setNewProductName('');
      setNewProductCode('');
      fetchProducts();
      Alert.alert('Success', 'Product added');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to add product');
    }
  };

  const getCategoryFromCode = (code) => {
    if (!code) return '';
    const upperCode = code.toUpperCase();
    if (upperCode.startsWith('C')) return 'Colored';
    if (upperCode.startsWith('B')) return 'Black';
    if (upperCode.startsWith('AS') || upperCode.startsWith('7')) return 'Anti-Skid';
    return '';
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.contentContainer}>
      <View style={[styles.headerContainer, { backgroundColor: theme.headerBackground, borderColor: theme.border }]}>
        <Text style={[styles.heading, { color: theme.textPrimary }]}>{isEditMode ? 'Edit Memo' : 'Create New Memo'}</Text>
      </View>

      <View style={[styles.section, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
        <Text style={[styles.sectionLabel, { color: theme.textPrimary }]}>Client</Text>
        {loadingClients ? (
          <ActivityIndicator color={theme.accent} />
        ) : (
          <Dropdown
            style={[styles.dropdown, { backgroundColor: theme.inputBackground, borderColor: theme.border }]}
            placeholderStyle={[styles.placeholderStyle, { color: theme.textSecondary }]}
            selectedTextStyle={[styles.selectedTextStyle, { color: theme.textPrimary }]}
            inputSearchStyle={[styles.inputSearchStyle, { backgroundColor: theme.background, color: theme.textPrimary }]}
            data={clients}
            search
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder="Select Client"
            searchPlaceholder="Search..."
            value={clientName}
            onChange={item => setClientName(item.value)}
          />
        )}
        <TouchableOpacity style={styles.addLink} onPress={() => setClientModalVisible(true)}>
          <Text style={[styles.addLinkText, { color: theme.accent }]}>+ Add New Client</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.section, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
        <Text style={[styles.sectionLabel, { color: theme.textPrimary }]}>Details</Text>
        <View style={styles.inputRow}>
          <MaterialIcons name="lock" size={20} color={theme.textSecondary} style={styles.icon} />
          <TextInput
            style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.border, color: theme.textSecondary }]}
            placeholder="Reference No. (Auto)"
            value={refNo}
            editable={false}
          />
        </View>
        <TextInput
          style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.border, color: theme.textPrimary }]}
          placeholder="Date (DD/MM/YYYY)"
          value={date}
          onChangeText={setDate}
          placeholderTextColor={theme.textSecondary}
        />
      </View>

      <View style={[styles.section, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
        <View style={styles.itemsHeader}>
          <Text style={[styles.sectionLabel, { color: theme.textPrimary }]}>Items</Text>
          <TouchableOpacity style={styles.addLink} onPress={() => setProductModalVisible(true)}>
            <Text style={[styles.addLinkText, { color: theme.accent }]}>+ Add New Product</Text>
          </TouchableOpacity>
        </View>
        {loadingProducts ? <ActivityIndicator color={theme.accent} /> : (
          items.map((item, index) => (
            <View key={index} style={[styles.itemBox, { backgroundColor: theme.inputBackground, borderColor: theme.border }]}>
              <TouchableOpacity style={[styles.deleteIcon, { backgroundColor: isDarkMode ? '#3A1C1C' : '#FFF0F0' }]} onPress={() => handleRemoveItem(index)}>
                <MaterialIcons name="close" size={16} color="#FF3B30" />
              </TouchableOpacity>
              <Dropdown
                style={[styles.itemDropdown, { borderColor: theme.border }]}
                placeholderStyle={[styles.placeholderStyle, { color: theme.textSecondary }]}
                selectedTextStyle={[styles.selectedTextStyle, { color: theme.textPrimary }]}
                inputSearchStyle={[styles.inputSearchStyle, { backgroundColor: theme.background, color: theme.textPrimary }]}
                data={products}
                search
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder="Select Product"
                searchPlaceholder="Search..."
                value={item.name}
                onChange={selected => handleItemChange(index, 'name', selected.value)}
              />
              <View style={styles.row}>
                <Dropdown
                  style={[styles.dropdownCategory, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
                  placeholderStyle={[styles.placeholderStyle, { color: theme.textSecondary }]}
                  selectedTextStyle={[styles.selectedTextStyle, { color: theme.textPrimary }]}
                  data={CATEGORY_DATA}
                  labelField="label"
                  valueField="value"
                  placeholder="Category"
                  value={item.category}
                  onChange={selected => handleItemChange(index, 'category', selected.value)}
                />
                <TextInput
                  style={[styles.numericInput, { backgroundColor: theme.cardBackground, borderColor: theme.border, color: theme.accent }]}
                  placeholder="Qty"
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="numeric"
                  value={String(item.qty ?? '')}
                  onChangeText={value => handleItemChange(index, 'qty', value)}
                />
                <TextInput
                  style={[styles.numericInput, { backgroundColor: theme.cardBackground, borderColor: theme.border, color: theme.success }]}
                  placeholder="Rate"
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="numeric"
                  value={String(item.rate ?? '')}
                  onChangeText={value => handleItemChange(index, 'rate', value)}
                />
              </View>
            </View>
          ))
        )}
        <TouchableOpacity style={[styles.addButton, { backgroundColor: isDarkMode ? '#1E293B' : '#F0F7FF' }]} onPress={handleAddItem}>
          <MaterialIcons name="add-circle" size={24} color={theme.accent} style={styles.addIcon} />
          <Text style={[styles.addButtonText, { color: theme.accent }]}>Add Another Item</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.totalRow, { backgroundColor: isDarkMode ? '#1C3829' : '#E8F5E9' }]}>
        <Text style={[styles.totalLabel, { color: theme.textPrimary }]}>Grand Total</Text>
        <Text style={[styles.totalValue, { color: theme.success }]}>₹ {total.toLocaleString('en-IN')}</Text>
      </View>

      <TouchableOpacity style={[styles.printButton, { backgroundColor: isDarkMode ? theme.accent : '#111111' }]} onPress={handleSyncAndPrint}>
        <Text style={styles.printText}>{isEditMode ? 'Update & Preview PDF' : 'Generate & Preview PDF'}</Text>
      </TouchableOpacity>

      {/* Client Modal */}
      <Modal visible={isClientModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Add New Client</Text>
            <TextInput
              style={[styles.modalInput, { borderColor: theme.border, color: theme.textPrimary }]}
              placeholder="Client Name"
              placeholderTextColor={theme.textSecondary}
              value={newClientName}
              onChangeText={setNewClientName}
            />
            <TextInput
              style={[styles.modalInput, { borderColor: theme.border, color: theme.textPrimary }]}
              placeholder="Reference / Address"
              placeholderTextColor={theme.textSecondary}
              value={newClientAddress}
              onChangeText={setNewClientAddress}
            />
            <View style={styles.modalBtnRow}>
              <TouchableOpacity onPress={() => setClientModalVisible(false)} style={styles.cancelBtn}>
                <Text style={[styles.btnText, { color: theme.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleAddClient} style={[styles.saveBtn, { backgroundColor: theme.accent }]}>
                <Text style={styles.btnTextWhite}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Product Modal */}
      <Modal visible={isProductModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Add New Product</Text>
            <TextInput
              style={[styles.modalInput, { borderColor: theme.border, color: theme.textPrimary }]}
              placeholder="Product Name"
              placeholderTextColor={theme.textSecondary}
              value={newProductName}
              onChangeText={setNewProductName}
            />
            <TextInput
              style={[styles.modalInput, { borderColor: theme.border, color: theme.textPrimary }]}
              placeholder="Item Code (e.g. BHACT110-01)"
              placeholderTextColor={theme.textSecondary}
              value={newProductCode}
              onChangeText={setNewProductCode}
            />
            <View style={styles.modalBtnRow}>
              <TouchableOpacity onPress={() => setProductModalVisible(false)} style={styles.cancelBtn}>
                <Text style={[styles.btnText, { color: theme.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleAddProduct} style={[styles.saveBtn, { backgroundColor: theme.accent }]}>
                <Text style={styles.btnTextWhite}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { paddingBottom: 120 },
  headerContainer: {
    padding: 24,
    paddingTop: 50,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    elevation: 6,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    borderBottomWidth: 1,
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  section: {
    marginVertical: 12,
    padding: 20,
    borderRadius: 20,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    marginHorizontal: 12,
    borderWidth: 1,
  },
  sectionLabel: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 12,
  },
  dropdown: {
    height: 54,
    borderRadius: 14,
    paddingHorizontal: 16,
    borderWidth: 1.2,
  },
  dropdownCategory: {
    flex: 2.2,
    height: 54,
    borderRadius: 14,
    paddingHorizontal: 16,
    borderWidth: 1.2,
  },
  placeholderStyle: {
    fontSize: 16,
    fontWeight: '500',
  },
  selectedTextStyle: {
    fontSize: 16.5,
    fontWeight: '600',
  },
  inputSearchStyle: {
    height: 48,
    fontSize: 16,
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  addLink: {
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  addLinkText: {
    fontSize: 15,
    fontWeight: '600',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 54,
    borderRadius: 14,
    paddingHorizontal: 16,
    borderWidth: 1.2,
    fontSize: 16,
  },
  itemsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemBox: {
    marginBottom: 14,
    padding: 18,
    borderRadius: 16,
    borderWidth: 1.2,
  },
  deleteIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 6,
    borderRadius: 20,
  },
  itemDropdown: {
    height: 54,
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  numericInput: {
    flex: 1,
    height: 54,
    borderRadius: 14,
    paddingHorizontal: 12,
    borderWidth: 1.2,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
    paddingVertical: 14,
    borderRadius: 16,
  },
  addIcon: {
    marginRight: 10,
  },
  addButtonText: {
    fontWeight: '700',
    fontSize: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    borderRadius: 16,
    marginVertical: 16,
    marginHorizontal: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  printButton: {
    paddingVertical: 18,
    marginHorizontal: 12,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 6,
    marginBottom: 40,
  },
  printText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 17,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    padding: 28,
    borderRadius: 24,
    width: '88%',
    elevation: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInput: {
    borderBottomWidth: 1.5,
    marginBottom: 24,
    paddingVertical: 10,
    fontSize: 16,
  },
  modalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 20,
  },
  cancelBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  saveBtn: {
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 12,
  },
  btnText: {
    fontWeight: '600',
    fontSize: 16,
  },
  btnTextWhite: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
  },
});

export default CreateInvoice;
