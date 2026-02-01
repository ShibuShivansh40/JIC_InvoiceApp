//import React, { useState, useEffect } from 'react';
//import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, Alert, Modal, ActivityIndicator } from 'react-native';
//import { Dropdown } from 'react-native-element-dropdown';
//import axios from 'axios';
//import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
//
////const API_URL = 'https://rupeefunda.com/api'; // Adjust to your server URL
//const API_URL = 'https://82d758550d1e.ngrok-free.app/api'; // Or your ngrok URL – match Dashboard.js
//
//const CATEGORY_DATA = [
//  { label: 'Colored', value: 'Colored' },
//  { label: 'Black', value: 'Black' },
//  { label: '7D', value: '7D' },
//];
//
//const CreateInvoice = ({ navigation }) => {
//  const [clientName, setClientName] = useState('');
//  const [refNo, setRefNo] = useState('');
//  const [date, setDate] = useState(new Date().toLocaleDateString('en-IN'));
//  const [items, setItems] = useState([{ name: '', category: '', qty: '', rate: '' }]);
//  const [total, setTotal] = useState(0);
//  const [isClientModalVisible, setClientModalVisible] = useState(false);
//  const [newClientName, setNewClientName] = useState('');
//  const [isProductModalVisible, setProductModalVisible] = useState(false);
//  const [newProductName, setNewProductName] = useState('');
//  const [newProductCategory, setNewProductCategory] = useState('');
//  const [clients, setClients] = useState([]);
//  const [products, setProducts] = useState([]);
//  const [loadingClients, setLoadingClients] = useState(true);
//  const [loadingProducts, setLoadingProducts] = useState(true);
//
//  useEffect(() => {
//    fetchClients();
//    fetchProducts();
//  }, []);
//
//  const fetchClients = async () => {
//    setLoadingClients(true);
//    try {
//      const res = await axios.get(`${API_URL}/clients`);
//      setClients(res.data.map(client => ({ label: client.name, value: client.name })));
//    } catch (err) {
//      Alert.alert('Error', 'Failed to fetch clients');
//    } finally {
//      setLoadingClients(false);
//    }
//  };
//
//  const fetchProducts = async () => {
//    setLoadingProducts(true);
//    try {
//      const res = await axios.get(`${API_URL}/products`);
//      setProducts(res.data.map(product => ({ label: product.name, value: product.name })));
//    } catch (err) {
//      Alert.alert('Error', 'Failed to fetch products');
//    } finally {
//      setLoadingProducts(false);
//    }
//  };
//
//  const handleAddItem = () => {
//    setItems([...items, { name: '', category: '', qty: '', rate: '' }]);
//  };
//
//  const handleRemoveItem = (index) => {
//    const newItems = items.filter((_, i) => i !== index);
//    setItems(newItems);
//    calculateTotal(newItems);
//  };
//
//  const handleItemChange = (index, field, value) => {
//    const newItems = [...items];
//    newItems[index][field] = value;
//    setItems(newItems);
//    calculateTotal(newItems);
//  };
//
//  const calculateTotal = (updatedItems) => {
//    const newTotal = updatedItems.reduce((sum, item) => {
//      const qty = parseFloat(item.qty) || 0;
//      const rate = parseFloat(item.rate) || 0;
//      return sum + qty * rate;
//    }, 0);
//    setTotal(newTotal);
//  };
//
//  const handleSyncAndPrint = async () => {
//    if (!clientName) return Alert.alert('Error', 'Please select a client');
//    if (items.some(item => !item.name || !item.category || !item.qty || !item.rate)) return Alert.alert('Error', 'All item fields required');
//    try {
//      const invoiceData = { clientName, refNo, date, items, total };
//      const res = await axios.post(`${API_URL}/generate-pdf`, invoiceData);
//      if (res.data.success) {
//        navigation.navigate('PDF', { pdfData: res.data.pdf });
//        // Reset form
//        setClientName('');
//        setRefNo('');
//        setItems([{ name: '', category: '', qty: '', rate: '' }]);
//        setTotal(0);
//      }
//    } catch (err) {
//      Alert.alert('Error', 'Failed to generate PDF');
//    }
//  };
//
//  const handleAddClient = async () => {
//    if (!newClientName) return Alert.alert('Error', 'Client name required');
//    try {
//      await axios.post(`${API_URL}/clients`, { name: newClientName });
//      setClientModalVisible(false);
//      setNewClientName('');
//      fetchClients();
//      Alert.alert('Success', 'Client added');
//    } catch (err) {
//      Alert.alert('Error', err.response?.data?.error || 'Failed to add client');
//    }
//  };
//
//  const handleAddProduct = async () => {
//    if (!newProductName || !newProductCategory) return Alert.alert('Error', 'Name and category required');
//    try {
//      await axios.post(`${API_URL}/products`, { name: newProductName, category: newProductCategory });
//      setProductModalVisible(false);
//      setNewProductName('');
//      setNewProductCategory('');
//      fetchProducts();
//      Alert.alert('Success', 'Product added');
//    } catch (err) {
//      Alert.alert('Error', err.response?.data?.error || 'Failed to add product');
//    }
//  };
//
//  return (
//    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
//      <Text style={styles.heading}>Create New Memo</Text>
//
//      {/* Client Section */}
//      <Text style={styles.sectionLabel}>Client</Text>
//      {loadingClients ? (
//        <ActivityIndicator size="small" color="#007AFF" />
//      ) : (
//        <Dropdown
//          style={styles.dropdown}
//          placeholderStyle={styles.placeholderStyle}
//          selectedTextStyle={styles.selectedTextStyle}
//          inputSearchStyle={styles.inputSearchStyle}
//          data={clients}
//          search
//          maxHeight={300}
//          labelField="label"
//          valueField="value"
//          placeholder="Select Client"
//          searchPlaceholder="Search..."
//          value={clientName}
//          onChange={item => setClientName(item.value)}
//        />
//      )}
//      <TouchableOpacity style={styles.addLink} onPress={() => setClientModalVisible(true)}>
//        <Text style={styles.addLinkText}>+ Add New Client</Text>
//      </TouchableOpacity>
//
//      {/* Ref and Date */}
//      <Text style={styles.sectionLabel}>Details</Text>
//      <View style={styles.refRow}>
//        <MaterialIcons name="lock" size={20} color="#999" style={styles.lockIcon} />
//        <TextInput
//          style={styles.input}
//          placeholder="Reference No. (Auto-generated)"
//          value={refNo}
//          editable={false}
//        />
//      </View>
//      <TextInput
//        style={styles.input}
//        placeholder="Date (DD/MM/YYYY)"
//        value={date}
//        onChangeText={setDate}
//      />
//
//      {/* Items Section */}
//      <View style={styles.itemsHeader}>
//        <Text style={styles.sectionLabel}>Items</Text>
//        {loadingProducts ? (
//          <ActivityIndicator size="small" color="#007AFF" />
//        ) : (
//          <TouchableOpacity style={styles.addLink} onPress={() => setProductModalVisible(true)}>
//            <Text style={styles.addLinkText}>+ Add New Product</Text>
//          </TouchableOpacity>
//        )}
//      </View>
//      {items.map((item, index) => (
//        <View key={index} style={styles.itemBox}>
//          <TouchableOpacity style={styles.deleteIcon} onPress={() => handleRemoveItem(index)}>
//            <MaterialIcons name="close" size={16} color="#FF3B30" />
//          </TouchableOpacity>
//          <Dropdown
//            style={styles.itemDropdown}
//            placeholderStyle={styles.placeholderStyle}
//            selectedTextStyle={styles.selectedTextStyle}
//            inputSearchStyle={styles.inputSearchStyle}
//            data={products}
//            search
//            maxHeight={300}
//            labelField="label"
//            valueField="value"
//            placeholder="Select Product"
//            searchPlaceholder="Search..."
//            value={item.name}
//            onChange={selected => handleItemChange(index, 'name', selected.value)}
//          />
//          <View style={styles.row}>
//            <Dropdown
//              style={styles.dropdownSmall}
//              data={CATEGORY_DATA}
//              labelField="label"
//              valueField="value"
//              placeholder="Cat"
//              value={item.category}
//              onChange={selected => handleItemChange(index, 'category', selected.value)}
//            />
//            <TextInput
//              style={styles.numericInput}
//              placeholder="Qty"
//              keyboardType="numeric"
//              value={item.qty}
//              onChangeText={value => handleItemChange(index, 'qty', value)}
//            />
//            <TextInput
//              style={styles.numericInput}
//              placeholder="Rate"
//              keyboardType="numeric"
//              value={item.rate}
//              onChangeText={value => handleItemChange(index, 'rate', value)}
//            />
//          </View>
//        </View>
//      ))}
//      <TouchableOpacity style={styles.addButton} onPress={handleAddItem}>
//        <MaterialIcons name="add-circle" size={24} color="#007AFF" style={styles.addIcon} />
//        <Text style={styles.addButtonText}>Add Another Item</Text>
//      </TouchableOpacity>
//
//      {/* Total */}
//      <View style={styles.totalRow}>
//        <Text style={styles.totalLabel}>Grand Total</Text>
//        <Text style={styles.totalValue}>₹ {total.toLocaleString('en-IN')}</Text>
//      </View>
//
//      {/* Generate Button */}
//      <TouchableOpacity style={styles.printButton} onPress={handleSyncAndPrint}>
//        <Text style={styles.printText}>Generate & Preview PDF</Text>
//      </TouchableOpacity>
//
//      {/* Modals */}
//      <Modal visible={isClientModalVisible} transparent animationType="fade">
//        <View style={styles.modalOverlay}>
//          <View style={styles.modalContent}>
//            <Text style={styles.modalTitle}>Add New Client</Text>
//            <TextInput
//              style={styles.modalInput}
//              placeholder="Enter Client Name"
//              value={newClientName}
//              onChangeText={setNewClientName}
//            />
//            <View style={styles.modalBtnRow}>
//              <TouchableOpacity onPress={() => setClientModalVisible(false)} style={styles.cancelBtn}>
//                <Text style={styles.btnText}>Cancel</Text>
//              </TouchableOpacity>
//              <TouchableOpacity onPress={handleAddClient} style={styles.saveBtn}>
//                <Text style={styles.btnTextWhite}>Save</Text>
//              </TouchableOpacity>
//            </View>
//          </View>
//        </View>
//      </Modal>
//
//      <Modal visible={isProductModalVisible} transparent animationType="fade">
//        <View style={styles.modalOverlay}>
//          <View style={styles.modalContent}>
//            <Text style={styles.modalTitle}>Add New Product</Text>
//            <TextInput
//              style={styles.modalInput}
//              placeholder="Enter Product Name"
//              value={newProductName}
//              onChangeText={setNewProductName}
//            />
//            <Dropdown
//              style={styles.dropdown}
//              data={CATEGORY_DATA}
//              labelField="label"
//              valueField="value"
//              placeholder="Select Category"
//              value={newProductCategory}
//              onChange={item => setNewProductCategory(item.value)}
//            />
//            <View style={styles.modalBtnRow}>
//              <TouchableOpacity onPress={() => setProductModalVisible(false)} style={styles.cancelBtn}>
//                <Text style={styles.btnText}>Cancel</Text>
//              </TouchableOpacity>
//              <TouchableOpacity onPress={handleAddProduct} style={styles.saveBtn}>
//                <Text style={styles.btnTextWhite}>Save</Text>
//              </TouchableOpacity>
//            </View>
//          </View>
//        </View>
//      </Modal>
//    </ScrollView>
//  );
//};
//
//const styles = StyleSheet.create({
//  container: { flex: 1, backgroundColor: '#F8F9FB' },
//  contentContainer: { padding: 20, paddingBottom: 100 },
//  heading: { fontSize: 26, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 20, textAlign: 'center' },
//  sectionLabel: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 8, marginTop: 16 },
//  dropdown: { backgroundColor: '#FFF', paddingHorizontal: 16, borderRadius: 12, height: 50, elevation: 2, marginBottom: 12 },
//  dropdownSmall: { flex: 1, backgroundColor: '#FFF', paddingHorizontal: 12, borderRadius: 12, height: 45, elevation: 2 },
//  placeholderStyle: { color: '#999', fontSize: 14 },
//  selectedTextStyle: { color: '#000', fontSize: 14 },
//  inputSearchStyle: { height: 40, fontSize: 14, borderRadius: 8, backgroundColor: '#f1f3f5', paddingHorizontal: 10 },
//  addLink: { alignSelf: 'flex-start', marginBottom: 16 },
//  addLinkText: { color: '#007AFF', fontSize: 14, fontWeight: '500' },
//  refRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
//  lockIcon: { marginRight: 8 },
//  input: { flex: 1, backgroundColor: '#FFF', paddingHorizontal: 16, borderRadius: 12, height: 50, elevation: 2, color: '#000', fontSize: 14 },
//  itemsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
//  itemBox: { backgroundColor: '#FFF', padding: 16, borderRadius: 15, marginBottom: 12, elevation: 3, position: 'relative' },
//  deleteIcon: { position: 'absolute', top: 8, right: 8, padding: 4, backgroundColor: '#FFF1F0', borderRadius: 20 },
//  itemDropdown: { borderBottomWidth: 1, borderBottomColor: '#f0f0f0', height: 50, marginBottom: 12 },
//  row: { flexDirection: 'row', gap: 8, alignItems: 'center' },
//  numericInput: { flex: 1, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', paddingVertical: 10, color: '#000', fontSize: 14, textAlign: 'center' },
//  addButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, backgroundColor: '#f0f7ff', borderRadius: 12, marginVertical: 16 },
//  addIcon: { marginRight: 8 },
//  addButtonText: { color: '#007AFF', fontWeight: '600', fontSize: 15 },
//  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 16, padding: 16, backgroundColor: '#e6f7ff', borderRadius: 12 },
//  totalLabel: { fontSize: 16, fontWeight: 'bold', color: '#007AFF' },
//  totalValue: { fontSize: 18, fontWeight: 'bold', color: '#2ecc71' },
//  printButton: { backgroundColor: '#1a1a1a', padding: 18, borderRadius: 16, alignItems: 'center', elevation: 5 },
//  printText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
//  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
//  modalContent: { backgroundColor: '#FFF', padding: 24, borderRadius: 20, width: '85%' },
//  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 16, textAlign: 'center' },
//  modalInput: { borderBottomWidth: 1, borderColor: '#ddd', marginBottom: 20, paddingVertical: 8, fontSize: 16, color: '#000' },
//  modalBtnRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 16 },
//  cancelBtn: { padding: 10 },
//  saveBtn: { backgroundColor: '#007AFF', padding: 10, borderRadius: 8 },
//  btnText: { color: '#007AFF', fontWeight: '600' },
//  btnTextWhite: { color: '#FFF', fontWeight: '600' }
//});
//
//export default CreateInvoice;
//========================================================================================================
//import React, { useState, useEffect } from 'react';
//import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, Alert, Modal, ActivityIndicator } from 'react-native';
//import { Dropdown } from 'react-native-element-dropdown';
//import axios from 'axios';
//import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
//import { saveInvoice } from '../database/db';
//
//const API_URL = 'https://fd343d90abe2.ngrok-free.app/api'; // Update to your production/ngrok
//
//const CATEGORY_DATA = [
//  { label: 'Colored', value: 'Colored' },
//  { label: 'Black', value: 'Black' },
//  { label: 'TPE', value: 'TPE' },
//  { label: '7D', value: '7D' }, // Added from your code
//];
//
//const CreateInvoice = ({ navigation, route }) => {
//  const [clientName, setClientName] = useState('');
//  const [refNo, setRefNo] = useState('');
//  const [date, setDate] = useState(new Date().toLocaleDateString('en-IN'));
//  const [items, setItems] = useState([{ name: '', category: '', qty: '', rate: '', code: '' }]); // Added code field
//  const [total, setTotal] = useState(0);
//  const [isClientModalVisible, setClientModalVisible] = useState(false);
//  const [newClientName, setNewClientName] = useState('');
//  const [isProductModalVisible, setProductModalVisible] = useState(false);
//  const [newProductName, setNewProductName] = useState('');
//  const [newProductCategory, setNewProductCategory] = useState('');
//  const [newProductCode, setNewProductCode] = useState(''); // New for code
//  const [clients, setClients] = useState([]);
//  const [products, setProducts] = useState([]);
//  const [loadingClients, setLoadingClients] = useState(true);
//  const [loadingProducts, setLoadingProducts] = useState(true);
//  const [isEditMode, setIsEditMode] = useState(false); // For change 3
//
//  // Pre-fill for edit (from route params for change 3)
//  useEffect(() => {
//    if (route.params?.invoiceData) {
//      const { clientName, refNo, date, items, total } = route.params.invoiceData;
//      setClientName(clientName);
//      setRefNo(refNo);
//      setDate(date);
//      setItems(items);
//      setTotal(total);
//      setIsEditMode(true);
//    }
//  }, [route.params]);
//
//  useEffect(() => {
//    fetchClients();
//    fetchProducts();
//  }, []);
//
//  const fetchClients = async () => {
//    setLoadingClients(true);
//    try {
//      const res = await axios.get(`${API_URL}/clients`);
//      setClients(res.data.map(client => ({ label: client.name, value: client.name })));
//    } catch (err) {
//      Alert.alert('Error', 'Failed to fetch clients');
//    } finally {
//      setLoadingClients(false);
//    }
//  };
//
//  const fetchProducts = async () => {
//    setLoadingProducts(true);
//    try {
//      const res = await axios.get(`${API_URL}/products`);
//      setProducts(res.data.map(product => ({ label: product.name, value: product.name, code: product.code, category: product.category }))); // Include code/category
//    } catch (err) {
//      Alert.alert('Error', 'Failed to fetch products');
//    } finally {
//      setLoadingProducts(false);
//    }
//  };
//
//  const handleAddItem = () => {
//    setItems([...items, { name: '', category: '', qty: '', rate: '', code: '' }]);
//  };
//
//  const handleRemoveItem = (index) => {
//    const newItems = items.filter((_, i) => i !== index);
//    setItems(newItems);
//    calculateTotal(newItems);
//  };
//
//  const handleItemChange = (index, field, value) => {
//    const newItems = [...items];
//    newItems[index][field] = value;
//    // Auto-set category based on code (for change 2)
//    if (field === 'code') {
//      newItems[index].category = getCategoryFromCode(value);
//    } else if (field === 'name') {
//      const selectedProduct = products.find(p => p.value === value);
//      if (selectedProduct) {
//        newItems[index].code = selectedProduct.code;
//        newItems[index].category = getCategoryFromCode(selectedProduct.code) || selectedProduct.category;
//      }
//    }
//    setItems(newItems);
//    calculateTotal(newItems);
//  };
//
//  const getCategoryFromCode = (code) => {
//    if (!code) return '';
//    const firstChar = code.charAt(0).toUpperCase();
//    if (firstChar === 'C') return 'Colored';
//    if (firstChar === 'B') return 'Black';
//    if (firstChar === '7') return '7D';
//    return 'TPE'; // Default or other
//  };
//
//  const calculateTotal = (updatedItems) => {
//    const newTotal = updatedItems.reduce((sum, item) => {
//      const qty = parseFloat(item.qty) || 0;
//      const rate = parseFloat(item.rate) || 0;
//      return sum + qty * rate;
//    }, 0);
//    setTotal(newTotal);
//  };
//
//  const handleSyncAndPrint = async () => {
//    if (!clientName) return Alert.alert('Error', 'Please select a client');
//    if (items.some(item => !item.name || !item.category || !item.qty || !item.rate)) return Alert.alert('Error', 'All item fields required');
//    const invoiceData = { clientName, refNo, date, items, total };
//    try {
//      let res;
//      if (isEditMode) {
//        res = await axios.put(`${API_URL}/update-invoice/${refNo}`, invoiceData); // New endpoint for update
//      } else {
//        res = await axios.post(`${API_URL}/generate-pdf`, invoiceData);
//      }
//      if (res.data.success) {
//        await saveInvoice(invoiceData);
//        navigation.navigate('PDF', { pdfData: res.data.pdf, refNo: res.data.refNo || refNo });
//        // Reset for new
//        if (!isEditMode) {
//          setClientName('');
//          setRefNo('');
//          setItems([{ name: '', category: '', qty: '', rate: '', code: '' }]);
//          setTotal(0);
//        }
//      }
//    } catch (err) {
//      Alert.alert('Error', 'Failed to save/generate PDF');
//    }
//  };
//
//  const handleAddClient = async () => {
//    if (!newClientName) return Alert.alert('Error', 'Client name required');
//    try {
//      await axios.post(`${API_URL}/clients`, { name: newClientName });
//      setClientModalVisible(false);
//      setNewClientName('');
//      fetchClients();
//      Alert.alert('Success', 'Client added');
//    } catch (err) {
//      Alert.alert('Error', err.response?.data?.error || 'Failed to add client');
//    }
//  };
//
//  const handleAddProduct = async () => {
//    if (!newProductName || !newProductCategory || !newProductCode) return Alert.alert('Error', 'All fields required');
//    try {
//      await axios.post(`${API_URL}/products`, { name: newProductName, category: newProductCategory, code: newProductCode });
//      setProductModalVisible(false);
//      setNewProductName('');
//      setNewProductCategory('');
//      setNewProductCode('');
//      fetchProducts();
//      Alert.alert('Success', 'Product added');
//    } catch (err) {
//      Alert.alert('Error', err.response?.data?.error || 'Failed to add product');
//    }
//  };
//
//  return (
//    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
//      <Text style={styles.heading}>{isEditMode ? 'Edit Memo' : 'Create New Memo'}</Text>
//
//      {/* Client Section */}
//      <Text style={styles.sectionLabel}>Client</Text>
//      {loadingClients ? (
//        <ActivityIndicator size="small" color="#007AFF" />
//      ) : (
//        <Dropdown
//          style={styles.dropdown}
//          placeholderStyle={styles.placeholderStyle}
//          selectedTextStyle={styles.selectedTextStyle}
//          inputSearchStyle={styles.inputSearchStyle}
//          data={clients}
//          search
//          maxHeight={300}
//          labelField="label"
//          valueField="value"
//          placeholder="Select Client"
//          searchPlaceholder="Search..."
//          value={clientName}
//          onChange={item => setClientName(item.value)}
//        />
//      )}
//      <TouchableOpacity style={styles.addLink} onPress={() => setClientModalVisible(true)}>
//        <Text style={styles.addLinkText}>+ Add New Client</Text>
//      </TouchableOpacity>
//
//      {/* Ref and Date */}
//      <Text style={styles.sectionLabel}>Details</Text>
//      <View style={styles.refRow}>
//        <MaterialIcons name="lock" size={20} color="#999" style={styles.lockIcon} />
//        <TextInput
//          style={styles.input}
//          placeholder="Reference No. (Auto-generated)"
//          value={refNo}
//          editable={!isEditMode} // Lock in edit mode
//        />
//      </View>
//      <TextInput
//        style={styles.input}
//        placeholder="Date (DD/MM/YYYY)"
//        value={date}
//        onChangeText={setDate}
//      />
//
//      {/* Items Section */}
//      <View style={styles.itemsHeader}>
//        <Text style={styles.sectionLabel}>Items</Text>
//        <TouchableOpacity style={styles.addLink} onPress={() => setProductModalVisible(true)}>
//          <Text style={styles.addLinkText}>+ Add New Product</Text>
//        </TouchableOpacity>
//      </View>
//      {loadingProducts ? (
//        <ActivityIndicator size="small" color="#007AFF" />
//      ) : (
//        items.map((item, index) => (
//          <View key={index} style={styles.itemBox}>
//            <TouchableOpacity style={styles.deleteIcon} onPress={() => handleRemoveItem(index)}>
//              <MaterialIcons name="close" size={16} color="#FF3B30" />
//            </TouchableOpacity>
//            <Dropdown
//              style={styles.itemDropdown}
//              placeholderStyle={styles.placeholderStyle}
//              selectedTextStyle={styles.selectedTextStyle}
//              inputSearchStyle={styles.inputSearchStyle}
//              data={products}
//              search
//              maxHeight={300}
//              labelField="label"
//              valueField="value"
//              placeholder="Select Product"
//              searchPlaceholder="Search..."
//              value={item.name}
//              onChange={selected => handleItemChange(index, 'name', selected.value)}
//            />
//            <View style={styles.row}>
//              <TextInput
//                style={styles.numericInput}
//                placeholder="Code"
//                value={item.code}
//                onChangeText={value => handleItemChange(index, 'code', value)}
//              />
//              <Dropdown
//                style={styles.dropdownSmall}
//                data={CATEGORY_DATA}
//                labelField="label"
//                valueField="value"
//                placeholder="Cat"
//                value={item.category}
//                onChange={selected => handleItemChange(index, 'category', selected.value)}
//              />
//              <TextInput
//                style={styles.numericInput}
//                placeholder="Qty"
//                keyboardType="numeric"
//                value={item.qty}
//                onChangeText={value => handleItemChange(index, 'qty', value)}
//              />
//              <TextInput
//                style={styles.numericInput}
//                placeholder="Rate"
//                keyboardType="numeric"
//                value={item.rate}
//                onChangeText={value => handleItemChange(index, 'rate', value)}
//              />
//            </View>
//          </View>
//        ))
//      )}
//      <TouchableOpacity style={styles.addButton} onPress={handleAddItem}>
//        <MaterialIcons name="add-circle" size={24} color="#007AFF" style={styles.addIcon} />
//        <Text style={styles.addButtonText}>Add Another Item</Text>
//      </TouchableOpacity>
//
//      {/* Total */}
//      <View style={styles.totalRow}>
//        <Text style={styles.totalLabel}>Grand Total</Text>
//        <Text style={styles.totalValue}>₹ {total.toLocaleString('en-IN')}</Text>
//      </View>
//   {/* Generate Button */}
//      <TouchableOpacity style={styles.printButton} onPress={handleSyncAndPrint}>
//        <Text style={styles.printText}>{isEditMode ? 'Update & Preview PDF' : 'Generate & Preview PDF'}</Text>
//      </TouchableOpacity>
//
//      {/* Client Modal */}
//      <Modal visible={isClientModalVisible} transparent animationType="fade">
//        <View style={styles.modalOverlay}>
//          <View style={styles.modalContent}>
//            <Text style={styles.modalTitle}>Add New Client</Text>
//            <TextInput
//              style={styles.modalInput}
//              placeholder="Enter Client Name"
//              value={newClientName}
//              onChangeText={setNewClientName}
//            />
//            <View style={styles.modalBtnRow}>
//              <TouchableOpacity onPress={() => setClientModalVisible(false)} style={styles.cancelBtn}>
//                <Text style={styles.btnText}>Cancel</Text>
//              </TouchableOpacity>
//              <TouchableOpacity onPress={handleAddClient} style={styles.saveBtn}>
//                <Text style={styles.btnTextWhite}>Save</Text>
//              </TouchableOpacity>
//            </View>
//          </View>
//        </View>
//      </Modal>
//
//      {/* Product Modal (for change 2) */}
//      <Modal visible={isProductModalVisible} transparent animationType="fade">
//        <View style={styles.modalOverlay}>
//          <View style={styles.modalContent}>
//            <Text style={styles.modalTitle}>Add New Product</Text>
//            <TextInput
//              style={styles.modalInput}
//              placeholder="Enter Product Name"
//              value={newProductName}
//              onChangeText={setNewProductName}
//            />
//            <TextInput
//              style={styles.modalInput}
//              placeholder="Enter Code (e.g., C123 for Colored)"
//              value={newProductCode}
//              onChangeText={setNewProductCode}
//            />
//            <Dropdown
//              style={styles.dropdown}
//              data={CATEGORY_DATA}
//              labelField="label"
//              valueField="value"
//              placeholder="Select Category"
//              value={newProductCategory}
//              onChange={item => setNewProductCategory(item.value)}
//            />
//            <View style={styles.modalBtnRow}>
//              <TouchableOpacity onPress={() => setProductModalVisible(false)} style={styles.cancelBtn}>
//                <Text style={styles.btnText}>Cancel</Text>
//              </TouchableOpacity>
//              <TouchableOpacity onPress={handleAddProduct} style={styles.saveBtn}>
//                <Text style={styles.btnTextWhite}>Save</Text>
//              </TouchableOpacity>
//            </View>
//          </View>
//        </View>
//      </Modal>
//    </ScrollView>
//  );
//};
//
//const styles = StyleSheet.create({
//  container: { flex: 1, backgroundColor: '#f8f9fa' },
//  contentContainer: { padding: 20, paddingBottom: 120 },
//  heading: {
//    fontSize: 26,
//    fontWeight: '700',
//    color: '#111827',
//    marginBottom: 24,
//    textAlign: 'center',
//  },
//  sectionLabel: {
//    fontSize: 15,
//    fontWeight: '600',
//    color: '#374151',
//    marginBottom: 8,
//    marginTop: 16,
//  },
//  dropdown: {
//    backgroundColor: '#ffffff',
//    borderRadius: 12,
//    borderWidth: 1,
//    borderColor: '#e5e7eb',
//    paddingHorizontal: 16,
//    height: 52,
//    justifyContent: 'center',
//    marginBottom: 12,
//    shadowColor: '#000',
//    shadowOffset: { width: 0, height: 1 },
//    shadowOpacity: 0.05,
//    shadowRadius: 3,
//    elevation: 2,
//  },
//  itemBox: {
//    backgroundColor: '#ffffff',
//    borderRadius: 16,
//    padding: 16,
//    marginBottom: 16,
//    borderWidth: 1,
//    borderColor: '#e5e7eb',
//    shadowColor: '#000',
//    shadowOffset: { width: 0, height: 2 },
//    shadowOpacity: 0.08,
//    shadowRadius: 6,
//    elevation: 3,
//  },
//  deleteIcon: {
//    position: 'absolute',
//    top: 12,
//    right: 12,
//    padding: 6,
//    backgroundColor: '#fee2e2',
//    borderRadius: 20,
//  },
//  row: {
//    flexDirection: 'row',
//    gap: 10,
//    alignItems: 'center',
//    marginTop: 8,
//  },
//  numericInput: {
//    flex: 1,
//    borderWidth: 1,
//    borderColor: '#d1d5db',
//    borderRadius: 10,
//    paddingVertical: 10,
//    paddingHorizontal: 12,
//    fontSize: 15,
//    backgroundColor: '#f9fafb',
//    textAlign: 'center',
//  },
//  addButton: {
//    flexDirection: 'row',
//    alignItems: 'center',
//    justifyContent: 'center',
//    backgroundColor: '#eff6ff',
//    paddingVertical: 14,
//    borderRadius: 12,
//    marginVertical: 16,
//  },
//  addButtonText: {
//    color: '#2563eb',
//    fontWeight: '600',
//    fontSize: 15,
//    marginLeft: 8,
//  },
//  totalRow: {
//    flexDirection: 'row',
//    justifyContent: 'space-between',
//    alignItems: 'center',
//    padding: 16,
//    backgroundColor: '#ecfdf5',
//    borderRadius: 12,
//    marginVertical: 16,
//  },
//  totalLabel: { fontSize: 16, fontWeight: '600', color: '#065f46' },
//  totalValue: { fontSize: 20, fontWeight: '700', color: '#10b981' },
//  printButton: {
//    backgroundColor: '#111827',
//    paddingVertical: 18,
//    borderRadius: 16,
//    alignItems: 'center',
//    shadowColor: '#000',
//    shadowOffset: { width: 0, height: 4 },
//    shadowOpacity: 0.2,
//    shadowRadius: 8,
//    elevation: 6,
//  },
//  printText: { color: '#ffffff', fontWeight: '700', fontSize: 16 },
//  addLink: { alignSelf: 'flex-start', marginBottom: 16 },
//  addLinkText: { color: '#2563eb', fontSize: 14, fontWeight: '500' },
//  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
//  modalContent: { backgroundColor: '#ffffff', padding: 24, borderRadius: 20, width: '88%', elevation: 10 },
//  modalTitle: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 20, textAlign: 'center' },
//  modalInput: {
//    borderWidth: 1,
//    borderColor: '#d1d5db',
//    borderRadius: 10,
//    padding: 12,
//    fontSize: 16,
//    marginBottom: 16,
//  },
//  modalBtnRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 16 },
//  saveBtn: { backgroundColor: '#2563eb', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 10 },
//  cancelBtn: { paddingVertical: 12, paddingHorizontal: 16 },
//  btnTextWhite: { color: '#ffffff', fontWeight: '600' },
//  btnText: { color: '#2563eb', fontWeight: '600' },
//});
//
//const styles1 = StyleSheet.create({
//  container: { flex: 1, backgroundColor: '#F8F9FB' },
//  contentContainer: { padding: 20, paddingBottom: 100 },
//  heading: { fontSize: 26, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 20, textAlign: 'center' },
//  sectionLabel: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 8, marginTop: 16 },
//  dropdown: { backgroundColor: '#FFF', paddingHorizontal: 16, borderRadius: 12, height: 50, elevation: 2, marginBottom: 12 },
//  dropdownSmall: { flex: 1, backgroundColor: '#FFF', paddingHorizontal: 12, borderRadius: 12, height: 45, elevation: 2 },
//  placeholderStyle: { color: '#999', fontSize: 14 },
//  selectedTextStyle: { color: '#000', fontSize: 14 },
//  inputSearchStyle: { height: 40, fontSize: 14, borderRadius: 8, backgroundColor: '#f1f3f5', paddingHorizontal: 10 },
//  addLink: { alignSelf: 'flex-start', marginBottom: 16 },
//  addLinkText: { color: '#007AFF', fontSize: 14, fontWeight: '500' },
//  refRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
//  lockIcon: { marginRight: 8 },
//  input: { flex: 1, backgroundColor: '#FFF', paddingHorizontal: 16, borderRadius: 12, height: 50, elevation: 2, color: '#000', fontSize: 14 },
//  itemsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
//  itemBox: { backgroundColor: '#FFF', padding: 16, borderRadius: 15, marginBottom: 12, elevation: 3, position: 'relative' },
//  deleteIcon: { position: 'absolute', top: 8, right: 8, padding: 4, backgroundColor: '#FFF1F0', borderRadius: 20 },
//  itemDropdown: { borderBottomWidth: 1, borderBottomColor: '#f0f0f0', height: 50, marginBottom: 12 },
//  row: { flexDirection: 'row', gap: 8, alignItems: 'center' },
//  numericInput: { flex: 1, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', paddingVertical: 10, color: '#000', fontSize: 14, textAlign: 'center' },
//  addButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, backgroundColor: '#f0f7ff', borderRadius: 12, marginVertical: 16 },
//  addIcon: { marginRight: 8 },
//  addButtonText: { color: '#007AFF', fontWeight: '600', fontSize: 15 },
//  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 16, padding: 16, backgroundColor: '#e6f7ff', borderRadius: 12 },
//  totalLabel: { fontSize: 16, fontWeight: 'bold', color: '#007AFF' },
//  totalValue: { fontSize: 18, fontWeight: 'bold', color: '#2ecc71' },
//  printButton: { backgroundColor: '#1a1a1a', padding: 18, borderRadius: 16, alignItems: 'center', elevation: 5 },
//  printText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
//  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
//  modalContent: { backgroundColor: '#FFF', padding: 24, borderRadius: 20, width: '85%' },
//  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 16, textAlign: 'center' },
//  modalInput: { borderBottomWidth: 1, borderColor: '#ddd', marginBottom: 20, paddingVertical: 8, fontSize: 16, color: '#000' },
//  modalBtnRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 16 },
//  cancelBtn: { padding: 10 },
//  saveBtn: { backgroundColor: '#007AFF', padding: 10, borderRadius: 8 },
//  btnText: { color: '#007AFF', fontWeight: '600' },
//  btnTextWhite: { color: '#FFF', fontWeight: '600' }
//});
//
//export default CreateInvoice;

//import React, { useState, useEffect } from 'react';
//import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, Alert, Modal, ActivityIndicator } from 'react-native';
//import { Dropdown } from 'react-native-element-dropdown';
//import axios from 'axios';
//import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
//import { saveInvoice } from '../database/db';
//
//const API_URL = 'https://fd343d90abe2.ngrok-free.app/api';
//
//const CATEGORY_DATA = [
//  { label: 'Colored', value: 'Colored' },
//  { label: 'Black', value: 'Black' },
//  { label: '7D', value: '7D' },
//];
//
//const CreateInvoice = ({ navigation }) => {
//  const [clientName, setClientName] = useState('');
//  const [refNo, setRefNo] = useState('');
//  const [date, setDate] = useState(new Date().toLocaleDateString('en-IN'));
//  const [items, setItems] = useState([{ name: '', category: '', qty: '', rate: '', code: '' }]);
//  const [total, setTotal] = useState(0);
//  const [isClientModalVisible, setClientModalVisible] = useState(false);
//  const [newClientName, setNewClientName] = useState('');
//  const [isProductModalVisible, setProductModalVisible] = useState(false);
//  const [newProductName, setNewProductName] = useState('');
//  const [newProductCategory, setNewProductCategory] = useState('');
//  const [newProductCode, setNewProductCode] = useState('');
//  const [clients, setClients] = useState([]);
//  const [products, setProducts] = useState([]);
//  const [loadingClients, setLoadingClients] = useState(true);
//  const [loadingProducts, setLoadingProducts] = useState(true);
//
//  useEffect(() => {
//    fetchClients();
//    fetchProducts();
//  }, []);
//
//  const fetchClients = async () => {
//    setLoadingClients(true);
//    try {
//      const res = await axios.get(`${API_URL}/clients`);
//      setClients(res.data.map(client => ({ label: client.name, value: client.name })));
//    } catch (err) {
//      Alert.alert('Error', 'Failed to fetch clients');
//    } finally {
//      setLoadingClients(false);
//    }
//  };
//
//  const fetchProducts = async () => {
//    setLoadingProducts(true);
//    try {
//      const res = await axios.get(`${API_URL}/products`);
//      setProducts(res.data.map(product => ({
//        label: `${product.code} - ${product.name}`, // Code - Name for navigation
//        value: product.name,
//        code: product.code,
//        category: product.category
//      })));
//    } catch (err) {
//      Alert.alert('Error', 'Failed to fetch products');
//    } finally {
//      setLoadingProducts(false);
//    }
//  };
//
//  const handleAddItem = () => {
//    setItems([...items, { name: '', category: '', qty: '', rate: '', code: '' }]);
//  };
//
//  const handleRemoveItem = (index) => {
//    const newItems = items.filter((_, i) => i !== index);
//    setItems(newItems);
//    calculateTotal(newItems);
//  };
//
//  const handleItemChange = (index, field, value) => {
//    const newItems = [...items];
//    newItems[index][field] = value;
//    if (field === 'code') {
//      newItems[index].category = getCategoryFromCode(value);
//    } else if (field === 'name') {
//      const selected = products.find(p => p.value === value);
//      if (selected) {
//        newItems[index].code = selected.code;
//        newItems[index].category = selected.category;
//      }
//    }
//    setItems(newItems);
//    calculateTotal(newItems);
//  };
//
//  const getCategoryFromCode = (code) => {
//    if (!code) return '';
//    const first = code.charAt(0).toUpperCase();
//    if (first === 'C') return 'Colored';
//    if (first === 'B') return 'Black';
//    if (first === '7') return '7D';
//    return 'TPE';
//  };
//
//  const calculateTotal = (updatedItems) => {
//    const newTotal = updatedItems.reduce((sum, item) => parseFloat(item.qty || 0) * parseFloat(item.rate || 0) + sum, 0);
//    setTotal(newTotal);
//  };
//
//  const handleSyncAndPrint = async () => {
//    if (!clientName || items.some(item => !item.name || !item.category || !item.qty || !item.rate)) return Alert.alert('Error', 'All fields required');
//    const invoiceData = { clientName, refNo, date, items, total };
//    try {
//      const res = await axios.post(`${API_URL}/generate-pdf`, invoiceData);
//      if (res.data.success) {
//        await saveInvoice(invoiceData);
//        navigation.navigate('PDF', { pdfData: res.data.pdf, refNo: res.data.refNo });
//        // Reset form
//        setClientName('');
//        setRefNo('');
//        setItems([{ name: '', category: '', qty: '', rate: '', code: '' }]);
//        setTotal(0);
//      }
//    } catch (err) {
//      Alert.alert('Error', 'Failed to generate PDF');
//    }
//  };
//
//  const handleAddClient = async () => {
//    if (!newClientName) return Alert.alert('Error', 'Client name required');
//    try {
//      const res = await axios.post(`${API_URL}/clients`, { name: newClientName });
//      console.log('Add Client response:', res.data); // Debug
//      setClientModalVisible(false);
//      setNewClientName('');
//      fetchClients();
//      Alert.alert('Success', 'Client added');
//    } catch (err) {
//      console.error('Add Client error:', err.response?.data || err.message);
//      Alert.alert('Error', err.response?.data?.error || 'Failed to add client');
//    }
//  };
//
//  const handleAddProduct = async () => {
//    if (!newProductName || !newProductCategory || !newProductCode) return Alert.alert('Error', 'All fields required');
//    try {
//      await axios.post(`${API_URL}/products`, { name: newProductName, category: newProductCategory, code: newProductCode });
//      setProductModalVisible(false);
//      setNewProductName('');
//      setNewProductCategory('');
//      setNewProductCode('');
//      fetchProducts();
//      Alert.alert('Success', 'Product added');
//    } catch (err) {
//      Alert.alert('Error', err.response?.data?.error || 'Failed');
//    }
//  };
//
//  return (
//    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
//      <View style={styles.headerContainer}>
//        <Text style={styles.heading}>Create New Memo</Text>
//      </View>
//
//      <View style={styles.section}>
//        <Text style={styles.sectionLabel}>Client</Text>
//        {loadingClients ? <ActivityIndicator color="#007AFF" /> : (
//          <Dropdown
//            style={styles.dropdown}
//            placeholderStyle={styles.placeholderStyle}
//            selectedTextStyle={styles.selectedTextStyle}
//            inputSearchStyle={styles.inputSearchStyle}
//            data={clients}
//            search
//            maxHeight={300}
//            labelField="label"
//            valueField="value"
//            placeholder="Select Client"
//            searchPlaceholder="Search..."
//            value={clientName}
//            onChange={item => setClientName(item.value)}
//          />
//        )}
//        <TouchableOpacity style={styles.addLink} onPress={() => setClientModalVisible(true)}>
//          <Text style={styles.addLinkText}>+ Add New Client</Text>
//        </TouchableOpacity>
//      </View>
//
//      <View style={styles.section}>
//        <Text style={styles.sectionLabel}>Details</Text>
//        <View style={styles.inputRow}>
//          <MaterialIcons name="lock" size={20} color="#999" style={styles.icon} />
//          <TextInput style={styles.input} placeholder="Reference No. (Auto)" value={refNo} editable={false} />
//        </View>
//        <TextInput style={styles.input} placeholder="Date (DD/MM/YYYY)" value={date} onChangeText={setDate} />
//      </View>
//
//      <View style={styles.section}>
//        <View style={styles.itemsHeader}>
//          <Text style={styles.sectionLabel}>Items</Text>
//          <TouchableOpacity style={styles.addLink} onPress={() => setProductModalVisible(true)}>
//            <Text style={styles.addLinkText}>+ Add New Product</Text>
//          </TouchableOpacity>
//        </View>
//        {loadingProducts ? <ActivityIndicator color="#007AFF" /> : (
//          items.map((item, index) => (
//            <View key={index} style={styles.itemBox}>
//              <TouchableOpacity style={styles.deleteIcon} onPress={() => handleRemoveItem(index)}>
//                <MaterialIcons name="close" size={16} color="#FF3B30" />
//              </TouchableOpacity>
//              <Dropdown
//                style={styles.itemDropdown}
//                placeholderStyle={styles.placeholderStyle}
//                selectedTextStyle={styles.selectedTextStyle}
//                inputSearchStyle={styles.inputSearchStyle}
//                data={products}
//                search
//                maxHeight={300}
//                labelField="label" // Code - Name
//                valueField="value"
//                placeholder="Select Product"
//                searchPlaceholder="Search..."
//                value={item.name}
//                onChange={selected => handleItemChange(index, 'name', selected.value)}
//              />
//              <View style={styles.row}>
//                <TextInput
//                  style={styles.numericInput}
//                  placeholder="Code"
//                  value={item.code}
//                  onChangeText={value => handleItemChange(index, 'code', value)}
//                />
//                <Dropdown
//                  style={styles.dropdownSmall}
//                  data={CATEGORY_DATA}
//                  labelField="label"
//                  valueField="value"
//                  placeholder="Category"
//                  value={item.category}
//                  onChange={selected => handleItemChange(index, 'category', selected.value)}
//                />
//                <TextInput
//                  style={styles.numericInput}
//                  placeholder="Qty"
//                  keyboardType="numeric"
//                  value={item.qty}
//                  onChangeText={value => handleItemChange(index, 'qty', value)}
//                />
//                <TextInput
//                  style={styles.numericInput}
//                  placeholder="Rate"
//                  keyboardType="numeric"
//                  value={item.rate}
//                  onChangeText={value => handleItemChange(index, 'rate', value)}
//                />
//              </View>
//            </View>
//          ))
//        )}
//        <TouchableOpacity style={styles.addButton} onPress={handleAddItem}>
//          <MaterialIcons name="add-circle" size={24} color="#007AFF" style={styles.addIcon} />
//          <Text style={styles.addButtonText}>Add Another Item</Text>
//        </TouchableOpacity>
//      </View>
//
//      <View style={styles.totalRow}>
//        <Text style={styles.totalLabel}>Grand Total</Text>
//        <Text style={styles.totalValue}>₹ {total.toLocaleString('en-IN')}</Text>
//      </View>
//
//      <TouchableOpacity style={styles.printButton} onPress={handleSyncAndPrint}>
//        <Text style={styles.printText}>Generate & Preview PDF</Text>
//      </TouchableOpacity>
//
//      {/* Modals - same as before */}
//
//    </ScrollView>
//  );
//};
//
//const styles = StyleSheet.create({
//  container: { flex: 1, backgroundColor: '#F8F9FB' },
//  contentContainer: { paddingBottom: 100 },
//  headerContainer: {
//    padding: 24,
//    paddingTop: 50,
//    backgroundColor: '#fff',
//    borderBottomLeftRadius: 25,
//    borderBottomRightRadius: 25,
//    elevation: 4,
//    shadowColor: '#000',
//    shadowOffset: { width: 0, height: 2 },
//    shadowOpacity: 0.1,
//  },
//  heading: { fontSize: 28, fontWeight: 'bold', color: '#1a1a1a', textAlign: 'center' },
//  section: { marginVertical: 16, padding: 16, backgroundColor: '#fff', borderRadius: 16, elevation: 2 },
//  sectionLabel: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 8 },
//  dropdown: { height: 50, borderRadius: 12, paddingHorizontal: 16, backgroundColor: '#f8f9fa', borderWidth: 1, borderColor: '#ddd' },
//  dropdownSmall: { flex: 1, height: 50, borderRadius: 12, paddingHorizontal: 16, backgroundColor: '#f8f9fa', borderWidth: 1, borderColor: '#ddd' },
//  placeholderStyle: { fontSize: 16, color: '#999' },
//  selectedTextStyle: { fontSize: 16 },
//  inputSearchStyle: { height: 40, fontSize: 16 },
//  addLink: { marginTop: 8 },
//  addLinkText: { color: '#007AFF', fontSize: 14, fontWeight: '600' },
//  inputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
//  icon: { marginRight: 8 },
//  input: { flex: 1, height: 50, borderRadius: 12, paddingHorizontal: 16, backgroundColor: '#f8f9fa', borderWidth: 1, borderColor: '#ddd', fontSize: 16 },
//  itemsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
//  itemBox: { marginBottom: 12, padding: 16, borderRadius: 12, backgroundColor: '#f8f9fa', borderWidth: 1, borderColor: '#ddd' },
//  deleteIcon: { position: 'absolute', top: 8, right: 8 },
//  itemDropdown: { height: 50, marginBottom: 12 },
//  row: { flexDirection: 'row', gap: 8 },
//  numericInput: { flex: 1, height: 50, borderRadius: 12, paddingHorizontal: 16, backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', textAlign: 'center', fontSize: 16 },
//  addButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 16 },
//  addIcon: { marginRight: 8 },
//  addButtonText: { color: '#007AFF', fontWeight: '600', fontSize: 16 },
//  totalRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, backgroundColor: '#e6ffe6', borderRadius: 12, marginBottom: 16 },
//  totalLabel: { fontSize: 18, fontWeight: 'bold', color: '#333' },
//  totalValue: { fontSize: 18, fontWeight: 'bold', color: '#2ecc71' },
//  printButton: { backgroundColor: '#1a1a1a', padding: 18, borderRadius: 16, alignItems: 'center' },
//  printText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
//  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
//  modalContent: { backgroundColor: '#FFF', padding: 24, borderRadius: 20, width: '85%' },
//  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 16, textAlign: 'center' },
//  modalInput: { borderBottomWidth: 1, borderColor: '#ddd', marginBottom: 20, paddingVertical: 8, fontSize: 16, color: '#000' },
//  modalBtnRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 16 },
//  cancelBtn: { padding: 10 },
//  saveBtn: { backgroundColor: '#007AFF', padding: 10, borderRadius: 8 },
//  btnText: { color: '#007AFF', fontWeight: '600' },
//  btnTextWhite: { color: '#FFF', fontWeight: '600' }
//});
//
//export default CreateInvoice;

//=========================================================Above Code working Perfectly
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, Alert, Modal, ActivityIndicator } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import axios from 'axios';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { saveInvoice } from '../database/db';

const API_URL = 'https://fd343d90abe2.ngrok-free.app/api';

const CATEGORY_DATA = [
  { label: 'Colored', value: 'Colored' },
  { label: 'Black', value: 'Black' },
  { label: 'TPE', value: 'TPE' },
  { label: '7D', value: '7D' },
];

const CreateInvoice = ({ navigation }) => {
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

  useEffect(() => {
    fetchClients();
    fetchProducts();
  }, []);

  const fetchClients = async () => {
    setLoadingClients(true);
    try {
      const res = await axios.get(`${API_URL}/clients`);
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
      const res = await axios.get(`${API_URL}/products`);
      setProducts(res.data.map(product => ({
        label: `${product.code} - ${product.name}`,
        value: product.name,
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
    newItems[index][field] = value;

    if (field === 'name') {
      const selected = products.find(p => p.value === value);
      if (selected) {
        newItems[index].category = selected.category;
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
    if (!clientName || items.some(item => !item.name || !item.category || !item.qty || !item.rate)) {
      return Alert.alert('Error', 'All fields are required');
    }

    const invoiceData = { clientName, refNo, date, items, total };

    try {
      const res = await axios.post(`${API_URL}/generate-pdf`, invoiceData);
      if (res.data.success) {
        await saveInvoice(invoiceData);
        navigation.navigate('PDF', { pdfData: res.data.pdf, refNo: res.data.refNo });
        // Reset form
        setClientName('');
        setRefNo('');
        setItems([{ name: '', category: '', qty: '', rate: '' }]);
        setTotal(0);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to generate PDF');
    }
  };

  const handleAddClient = async () => {
    if (!newClientName) return Alert.alert('Error', 'Client name required');
    try {
      await axios.post(`${API_URL}/clients`, { name: newClientName, address: newClientAddress });
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
      await axios.post(`${API_URL}/products`, { name: newProductName, code: newProductCode, category });
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
    if (!code) return 'TPE';
    const first = code.charAt(0).toUpperCase();
    if (first === 'C') return 'Colored';
    if (first === 'B') return 'Black';
    if (first === '7') return '7D';
    return 'TPE';
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.headerContainer}>
        <Text style={styles.heading}>Create New Memo</Text>
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
            searchPlaceholder="Search clients..."
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
          <MaterialIcons name="lock" size={22} color="#999" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Reference No. (Auto-generated)"
            value={refNo}
            editable={false}
          />
        </View>
        <TextInput
          style={styles.input}
          placeholder="Date (DD/MM/YYYY)"
          value={date}
          onChangeText={setDate}
        />
      </View>

      <View style={styles.section}>
        <View style={styles.itemsHeader}>
          <Text style={styles.sectionLabel}>Items</Text>
          <TouchableOpacity style={styles.addLink} onPress={() => setProductModalVisible(true)}>
            <Text style={styles.addLinkText}>+ Add New Product</Text>
          </TouchableOpacity>
        </View>

        {loadingProducts ? (
          <ActivityIndicator color="#007AFF" />
        ) : (
          items.map((item, index) => (
            <View key={index} style={styles.itemBox}>
              <TouchableOpacity style={styles.deleteIcon} onPress={() => handleRemoveItem(index)}>
                <MaterialIcons name="close" size={20} color="#FF3B30" />
              </TouchableOpacity>

              <Dropdown
                style={styles.itemDropdown}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                inputSearchStyle={styles.inputSearchStyle}
                data={products}
                search
                maxHeight={350}
                labelField="label"
                valueField="value"
                placeholder="Select Product"
                searchPlaceholder="Search products..."
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
                  value={item.qty}
                  onChangeText={value => handleItemChange(index, 'qty', value)}
                />

                <TextInput
                  style={[styles.numericInput, { color: '#2ecc71' }]}
                  placeholder="Rate"
                  placeholderTextColor="#A3E4D7"
                  keyboardType="numeric"
                  value={item.rate}
                  onChangeText={value => handleItemChange(index, 'rate', value)}
                />
              </View>
            </View>
          ))
        )}

        <TouchableOpacity style={styles.addButton} onPress={handleAddItem}>
          <MaterialIcons name="add-circle" size={26} color="#007AFF" style={styles.addIcon} />
          <Text style={styles.addButtonText}>Add Another Item</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Grand Total</Text>
        <Text style={styles.totalValue}>₹ {total.toLocaleString('en-IN')}</Text>
      </View>

      <TouchableOpacity style={styles.printButton} onPress={handleSyncAndPrint}>
        <Text style={styles.printText}>Generate & Preview PDF</Text>
      </TouchableOpacity>

      {/* Client Modal */}
      <Modal visible={isClientModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Client</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Client Name"
              placeholderTextColor="#888"
              value={newClientName}
              onChangeText={setNewClientName}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Reference / Address"
              placeholderTextColor="#888"
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
              placeholderTextColor="#888"
              value={newProductName}
              onChangeText={setNewProductName}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Item Code (e.g. BHACT110-01)"
              placeholderTextColor="#888"
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