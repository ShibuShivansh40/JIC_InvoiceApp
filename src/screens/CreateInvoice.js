import React, { useState, useEffect, useMemo } from 'react';
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
    if (items.length === 1) {
      return Alert.alert('Notice', 'At least one item is required');
    }
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

  const handleResetForm = () => {
    Alert.alert(
      'Reset Form',
      'Are you sure you want to clear all inputs?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setClientName('');
            setRefNo('');
            setDate(new Date().toLocaleDateString('en-IN'));
            setItems([{ name: '', category: '', qty: '', rate: '' }]);
            setTotal(0);
            setIsEditMode(false);
          }
        }
      ]
    );
  };

  const totalQtyCount = useMemo(() => {
    return items.reduce((sum, item) => sum + (parseFloat(item.qty) || 0), 0);
  }, [items]);

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
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* Header Container */}
      <View style={[styles.headerContainer, { backgroundColor: theme.headerBackground, borderColor: theme.border }]}>
        <View style={styles.headerTitleRow}>
          <Text style={[styles.heading, { color: theme.textPrimary }]}>{isEditMode ? 'Edit Memo' : 'Create New Memo'}</Text>
          <TouchableOpacity onPress={handleResetForm} style={[styles.resetBtn, { backgroundColor: isDarkMode ? '#2C2C2E' : '#F0F7FF' }]}>
            <MaterialIcons name="restart-alt" size={20} color={theme.accent} />
            <Text style={[styles.resetBtnText, { color: theme.accent }]}>Reset</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Client Section */}
      <View style={[styles.section, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
        <Text style={[styles.sectionLabel, { color: theme.textPrimary }]}>Client</Text>
        {loadingClients ? (
          <ActivityIndicator color={theme.accent} />
        ) : (
          <Dropdown
            style={[styles.dropdown, { backgroundColor: theme.inputBackground, borderColor: theme.border }]}
            containerStyle={[styles.dropdownMenuContainer, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
            itemTextStyle={{ color: theme.textPrimary }}
            itemContainerStyle={{ backgroundColor: theme.cardBackground }}
            activeColor={isDarkMode ? '#2C2C2E' : '#F0F7FF'}
            placeholderStyle={[styles.placeholderStyle, { color: theme.textSecondary }]}
            selectedTextStyle={[styles.selectedTextStyle, { color: theme.textPrimary }]}
            inputSearchStyle={[styles.inputSearchStyle, { backgroundColor: theme.background, color: theme.textPrimary, borderColor: theme.border }]}
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

      {/* Details Section */}
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
        <View style={styles.inputRow}>
          <MaterialIcons name="event" size={20} color={theme.textSecondary} style={styles.icon} />
          <TextInput
            style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.border, color: theme.textPrimary }]}
            placeholder="Date (DD/MM/YYYY)"
            value={date}
            onChangeText={setDate}
            placeholderTextColor={theme.textSecondary}
          />
        </View>
      </View>

      {/* Items Section */}
      <View style={[styles.section, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
        <View style={styles.itemsHeader}>
          <Text style={[styles.sectionLabel, { color: theme.textPrimary }]}>Items ({items.length})</Text>
          <TouchableOpacity style={styles.addLink} onPress={() => setProductModalVisible(true)}>
            <Text style={[styles.addLinkText, { color: theme.accent }]}>+ Add New Product</Text>
          </TouchableOpacity>
        </View>

        {loadingProducts ? <ActivityIndicator color={theme.accent} /> : (
          items.map((item, index) => {
            const lineSubtotal = (parseFloat(item.qty) || 0) * (parseFloat(item.rate) || 0);
            return (
              <View key={index} style={[styles.itemBox, { backgroundColor: theme.inputBackground, borderColor: theme.border }]}>
                <View style={styles.itemBoxHeader}>
                  <View style={[styles.itemBadge, { backgroundColor: isDarkMode ? '#2C2C2E' : '#E0F2FE' }]}>
                    <Text style={[styles.itemBadgeText, { color: theme.accent }]}>Item #{index + 1}</Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.deleteIcon, { backgroundColor: isDarkMode ? '#3A1C1C' : '#FFF0F0' }]}
                    onPress={() => handleRemoveItem(index)}
                  >
                    <MaterialIcons name="close" size={16} color="#FF3B30" />
                  </TouchableOpacity>
                </View>

                {/* Select Product Dropdown */}
                <Dropdown
                  style={[styles.itemDropdown, { borderColor: theme.border, backgroundColor: theme.cardBackground }]}
                  containerStyle={[styles.dropdownMenuContainer, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
                  itemTextStyle={{ color: theme.textPrimary }}
                  itemContainerStyle={{ backgroundColor: theme.cardBackground }}
                  activeColor={isDarkMode ? '#2C2C2E' : '#F0F7FF'}
                  placeholderStyle={[styles.placeholderStyle, { color: theme.textSecondary }]}
                  selectedTextStyle={[styles.selectedTextStyle, { color: theme.textPrimary }]}
                  inputSearchStyle={[styles.inputSearchStyle, { backgroundColor: theme.background, color: theme.textPrimary, borderColor: theme.border }]}
                  data={products}
                  search
                  maxHeight={300}
                  labelField="label"
                  valueField="value"
                  placeholder="Select Product"
                  searchPlaceholder="Search products..."
                  value={item.name}
                  onChange={selected => handleItemChange(index, 'name', selected.value)}
                />

                <View style={styles.row}>
                  <Dropdown
                    style={[styles.dropdownCategory, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
                    containerStyle={[styles.dropdownMenuContainer, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
                    itemTextStyle={{ color: theme.textPrimary }}
                    itemContainerStyle={{ backgroundColor: theme.cardBackground }}
                    activeColor={isDarkMode ? '#2C2C2E' : '#F0F7FF'}
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

                {/* Line Item Subtotal Display */}
                <View style={styles.lineSubtotalRow}>
                  <Text style={[styles.lineSubtotalText, { color: theme.textSecondary }]}>
                    Amount: <Text style={{ color: theme.success, fontWeight: '700' }}>₹ {lineSubtotal.toLocaleString('en-IN')}</Text>
                  </Text>
                </View>
              </View>
            );
          })
        )}

        <TouchableOpacity style={[styles.addButton, { backgroundColor: isDarkMode ? '#1E293B' : '#F0F7FF' }]} onPress={handleAddItem}>
          <MaterialIcons name="add-circle" size={24} color={theme.accent} style={styles.addIcon} />
          <Text style={[styles.addButtonText, { color: theme.accent }]}>Add Another Item</Text>
        </TouchableOpacity>
      </View>

      {/* Summary Stats Row */}
      <View style={[styles.summaryCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
        <View style={styles.summaryStatItem}>
          <Text style={[styles.summaryStatLabel, { color: theme.textSecondary }]}>Items</Text>
          <Text style={[styles.summaryStatValue, { color: theme.textPrimary }]}>{items.length}</Text>
        </View>
        <View style={[styles.summaryDivider, { backgroundColor: theme.border }]} />
        <View style={styles.summaryStatItem}>
          <Text style={[styles.summaryStatLabel, { color: theme.textSecondary }]}>Total Qty</Text>
          <Text style={[styles.summaryStatValue, { color: theme.accent }]}>{totalQtyCount}</Text>
        </View>
        <View style={[styles.summaryDivider, { backgroundColor: theme.border }]} />
        <View style={styles.summaryStatItem}>
          <Text style={[styles.summaryStatLabel, { color: theme.textSecondary }]}>Grand Total</Text>
          <Text style={[styles.summaryStatValue, { color: theme.success }]}>₹ {total.toLocaleString('en-IN')}</Text>
        </View>
      </View>

      {/* Generate / Update Button */}
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
    padding: 20,
    paddingTop: 50,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    elevation: 6,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    borderBottomWidth: 1,
  },
  headerTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heading: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  resetBtnText: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 4,
  },
  section: {
    marginVertical: 10,
    padding: 18,
    borderRadius: 20,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    marginHorizontal: 12,
    borderWidth: 1,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  dropdown: {
    height: 50,
    borderRadius: 14,
    paddingHorizontal: 16,
    borderWidth: 1.2,
  },
  dropdownCategory: {
    flex: 2.2,
    height: 50,
    borderRadius: 14,
    paddingHorizontal: 14,
    borderWidth: 1.2,
  },
  dropdownMenuContainer: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  placeholderStyle: {
    fontSize: 15,
    fontWeight: '500',
  },
  selectedTextStyle: {
    fontSize: 15.5,
    fontWeight: '600',
  },
  inputSearchStyle: {
    height: 44,
    fontSize: 15,
    borderRadius: 10,
    paddingHorizontal: 12,
    marginHorizontal: 8,
    marginVertical: 8,
    borderWidth: 1,
  },
  addLink: {
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  addLinkText: {
    fontSize: 14,
    fontWeight: '600',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    paddingHorizontal: 16,
    borderWidth: 1.2,
    fontSize: 15,
  },
  itemsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemBox: {
    marginBottom: 14,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.2,
  },
  itemBoxHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  itemBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  itemBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  deleteIcon: {
    padding: 6,
    borderRadius: 20,
  },
  itemDropdown: {
    height: 50,
    marginBottom: 12,
    borderRadius: 14,
    paddingHorizontal: 14,
    borderWidth: 1.2,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  numericInput: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    paddingHorizontal: 10,
    borderWidth: 1.2,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  lineSubtotalRow: {
    alignItems: 'flex-end',
    marginTop: 8,
  },
  lineSubtotalText: {
    fontSize: 13,
    fontWeight: '500',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 14,
    paddingVertical: 14,
    borderRadius: 16,
  },
  addIcon: {
    marginRight: 8,
  },
  addButtonText: {
    fontWeight: '700',
    fontSize: 15,
  },
  summaryCard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 16,
    marginHorizontal: 12,
    marginVertical: 10,
    borderRadius: 18,
    borderWidth: 1,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  summaryStatItem: {
    alignItems: 'center',
  },
  summaryStatLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryStatValue: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 2,
  },
  summaryDivider: {
    width: 1,
    height: 30,
  },
  printButton: {
    paddingVertical: 18,
    marginHorizontal: 12,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 6,
    marginVertical: 20,
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
