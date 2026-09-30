import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, Alert, Modal, ActivityIndicator } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import axios from 'axios';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { saveInvoice } from '../database/db';
import { API_URL, API_KEY } from '../config';

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
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.headerContainer}>
        <Text style={styles.heading}>{isEditMode ? 'Edit Memo' : 'Create New Memo'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Client</Text>
        {loadingClients ? (
          <ActivityIndicator color="#007AFF" />
        ) : (
          <Dropdown
            style={styles.dropdown}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            inputSearchStyle={styles.inputSearchStyle}
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
          <Text style={styles.addLinkText}>+ Add New Client</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Details</Text>
        <View style={styles.inputRow}>
          <MaterialIcons name="lock" size={20} color="#999" style={styles.icon} />
          <TextInput style={styles.input} placeholder="Reference No. (Auto)" value={refNo} editable={false} />
        </View>
        <TextInput style={styles.input} placeholder="Date (DD/MM/YYYY)" value={date} onChangeText={setDate} />
      </View>

      <View style={styles.section}>
        <View style={styles.itemsHeader}>
          <Text style={styles.sectionLabel}>Items</Text>
          <TouchableOpacity style={styles.addLink} onPress={() => setProductModalVisible(true)}>
            <Text style={styles.addLinkText}>+ Add New Product</Text>
          </TouchableOpacity>
        </View>
        {loadingProducts ? <ActivityIndicator color="#007AFF" /> : (
          items.map((item, index) => (
            <View key={index} style={styles.itemBox}>
              <TouchableOpacity style={styles.deleteIcon} onPress={() => handleRemoveItem(index)}>
                <MaterialIcons name="close" size={16} color="#FF3B30" />
              </TouchableOpacity>
              <Dropdown
                style={styles.itemDropdown}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                inputSearchStyle={styles.inputSearchStyle}
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
                  style={styles.dropdownCategory}
                  placeholderStyle={styles.placeholderStyle}
                  selectedTextStyle={styles.selectedTextStyle}
                  data={CATEGORY_DATA}
                  labelField="label"
                  valueField="value"
                  placeholder="Category"
                  value={item.category}
                  onChange={selected => handleItemChange(index, 'category', selected.value)}
                />
                <TextInput
                  style={[styles.numericInput, { color: '#007AFF' }]}
                  placeholder="Qty"
                  placeholderTextColor="#A0D2FF"
                  keyboardType="numeric"
                  value={String(item.qty ?? '')}
                  onChangeText={value => handleItemChange(index, 'qty', value)}
                />
                <TextInput
                  style={[styles.numericInput, { color: '#2ecc71' }]}
                  placeholder="Rate"
                  placeholderTextColor="#A3E4D7"
                  keyboardType="numeric"
                  value={String(item.rate ?? '')}
                  onChangeText={value => handleItemChange(index, 'rate', value)}
                />
              </View>
            </View>
          ))
        )}
        <TouchableOpacity style={styles.addButton} onPress={handleAddItem}>
          <MaterialIcons name="add-circle" size={24} color="#007AFF" style={styles.addIcon} />
          <Text style={styles.addButtonText}>Add Another Item</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Grand Total</Text>
        <Text style={styles.totalValue}>₹ {total.toLocaleString('en-IN')}</Text>
      </View>

      <TouchableOpacity style={styles.printButton} onPress={handleSyncAndPrint}>
        <Text style={styles.printText}>{isEditMode ? 'Update & Preview PDF' : 'Generate & Preview PDF'}</Text>
      </TouchableOpacity>

      {/* Client Modal */}
      <Modal visible={isClientModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Client</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Client Name"
              value={newClientName}
              onChangeText={setNewClientName}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Reference / Address"
              value={newClientAddress}
              onChangeText={setNewClientAddress}
            />
            <View style={styles.modalBtnRow}>
              <TouchableOpacity onPress={() => setClientModalVisible(false)} style={styles.cancelBtn}>
                <Text style={styles.btnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleAddClient} style={styles.saveBtn}>
                <Text style={styles.btnTextWhite}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Product Modal */}
      <Modal visible={isProductModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Product</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Product Name"
              value={newProductName}
              onChangeText={setNewProductName}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Item Code (e.g. BHACT110-01)"
              value={newProductCode}
              onChangeText={setNewProductCode}
            />
            <View style={styles.modalBtnRow}>
              <TouchableOpacity onPress={() => setProductModalVisible(false)} style={styles.cancelBtn}>
                <Text style={styles.btnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleAddProduct} style={styles.saveBtn}>
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
  container: { flex: 1, backgroundColor: '#F8F9FB' },
  contentContainer: { paddingBottom: 120 },
  headerContainer: {
    padding: 24,
    paddingTop: 50,
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  section: {
    marginVertical: 12,
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    marginHorizontal: 12,
  },
  sectionLabel: {
    fontSize: 17,
    fontWeight: '700',
    color: '#222',
    marginBottom: 12,
  },
  dropdown: {
    height: 54,
    borderRadius: 14,
    paddingHorizontal: 16,
    backgroundColor: '#f9f9f9',
    borderWidth: 1.2,
    borderColor: '#e0e0e0',
  },
  dropdownCategory: {
    flex: 2.2,
    height: 54,
    borderRadius: 14,
    paddingHorizontal: 16,
    backgroundColor: '#f9f9f9',
    borderWidth: 1.2,
    borderColor: '#e0e0e0',
  },
  placeholderStyle: {
    fontSize: 16,
    color: '#888',
    fontWeight: '500',
  },
  selectedTextStyle: {
    fontSize: 16.5,
    color: '#111',
    fontWeight: '600',
  },
  inputSearchStyle: {
    height: 48,
    fontSize: 16,
    borderRadius: 12,
    backgroundColor: '#f1f3f5',
    paddingHorizontal: 12,
  },
  addLink: {
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  addLinkText: {
    color: '#0066FF',
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
    backgroundColor: '#f9f9f9',
    borderWidth: 1.2,
    borderColor: '#e0e0e0',
    fontSize: 16,
    color: '#111',
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
    backgroundColor: '#f9f9f9',
    borderWidth: 1.2,
    borderColor: '#e0e0e0',
  },
  deleteIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 6,
    backgroundColor: '#fff0f0',
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
    backgroundColor: '#fff',
    borderWidth: 1.2,
    borderColor: '#e0e0e0',
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
    backgroundColor: '#f0f7ff',
    borderRadius: 16,
  },
  addIcon: {
    marginRight: 10,
  },
  addButtonText: {
    color: '#0066FF',
    fontWeight: '700',
    fontSize: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    backgroundColor: '#e8f5e9',
    borderRadius: 16,
    marginVertical: 16,
    marginHorizontal: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  printButton: {
    backgroundColor: '#111111',
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
    backgroundColor: '#ffffff',
    padding: 28,
    borderRadius: 24,
    width: '88%',
    elevation: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInput: {
    borderBottomWidth: 1.5,
    borderColor: '#ccc',
    marginBottom: 24,
    paddingVertical: 10,
    fontSize: 16,
    color: '#111',
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
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 12,
  },
  btnText: {
    color: '#007AFF',
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
