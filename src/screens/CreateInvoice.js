//import React, { useState } from 'react';
//import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
//import { Dropdown } from 'react-native-element-dropdown';
//import axios from 'axios';
//import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
//
//// Categories for your industrial products
//const CATEGORY_DATA = [
//  { label: 'Colored', value: 'Colored' },
//  { label: 'Black', value: 'Black' },
//  { label: 'TPE', value: 'TPE' },
//];
//
//// Searchable product list [web:702]
//const PRODUCT_DATA = [
//  { label: 'Suzuki Access 125 (Old)', value: 'Suzuki Access 125 (Old)' },
//  { label: 'Suzuki Access 125 (Latest 2025)', value: 'Suzuki Access 125 (Latest 2025)' },
//  { label: 'Suzuki Burgman', value: 'Suzuki Burgman' },
//  { label: 'Suzuki Avenis', value: 'Suzuki Avenis' },
//  { label: 'Suzuki Avenis (Neon)', value: 'Suzuki Avenis (Neon)' },
//  { label: 'Honda Activa 6G', value: 'Honda Activa 6G' },
//  { label: 'Honda Activa 6G H-Smart', value: 'Honda Activa 6G H-Smart' },
//  { label: 'Honda Activa 125', value: 'Honda Activa 125' },
//  { label: 'Honda Dio', value: 'Honda Dio' },
//  { label: 'Honda Dio 125', value: 'Honda Dio 125' },
//  { label: 'Honda Activa 5G', value: 'Honda Activa 5G' },
//  { label: 'Honda Grazia', value: 'Honda Grazia' },
//  { label: 'Honda Aviator', value: 'Honda Aviator' },
//  { label: 'TVS Jupiter', value: 'TVS Jupiter' },
//  { label: 'TVS Jupiter (New)', value: 'TVS Jupiter (New)' },
//  { label: 'TVS Jupiter 125', value: 'TVS Jupiter 125' },
//  { label: 'TVS Ntorq 125', value: 'TVS Ntorq 125' },
//  { label: 'TVS Ntorq 125 (Neon)', value: 'TVS Ntorq 125 (Neon)' },
//  { label: 'TVS iQube', value: 'TVS iQube' },
//  { label: 'TVS Orbitor', value: 'TVS Orbitor' },
//  { label: 'Yamaha Fascino', value: 'Yamaha Fascino' },
//  { label: 'Yamaha Ray ZR', value: 'Yamaha Ray ZR' },
//  { label: 'Yamaha Ray ZR (White)', value: 'Yamaha Ray ZR (White)' },
//  { label: 'Hero Pleasure', value: 'Hero Pleasure' },
//  { label: 'Yamaha Ray ZR (White)', value: 'Yamaha Ray ZR (White)' },
//  { label: 'Hero Destini', value: 'Hero Destini' },
//  { label: 'Hero Destini (Latest 2025)', value: 'Hero Destini (Latest 2025)' },
//  { label: 'Hero Electric Optima', value: 'Hero Electric Optima' },
//  { label: 'Hero VIDA', value: 'Hero VIDA' },
//  { label: 'Hero VIDA VX2', value: 'Hero VIDA VX2' },
//  { label: 'Hero XOOM', value: 'Hero XOOM' },
//  { label: 'Hero XOOM 125', value: 'Hero XOOM 125' },
//  { label: 'Hero Maestro Edge', value: 'Hero Maestro Edge' },
//  { label: 'Ampere Magnus', value: 'Ampere Magnus' },
//  { label: 'Ampere Nexus', value: 'Ampere Nexus' },
//  { label: 'Electric / EV', value: 'Electric / EV' },
//  { label: 'Ather 450 X', value: 'Ather 450 X' },
//  { label: 'Ather Rizta', value: 'Ather Rizta' },
//  { label: 'Okinawa Praise Pro', value: 'Okinawa Praise Pro' },
//  { label: 'OLA S1 – Floor Mat', value: 'OLA S1 – Floor Mat' },
//  { label: 'OLA S1(Neon) – Floor Mat', value: 'OLA S1(Neon) – Floor Mat' },
//  { label: 'OLA S1 – Diggy Mat', value: 'OLA S1 – Diggy Mat' },
//  { label: 'Simple EV Bike', value: 'Simple EV Bike' },
//  { label: 'Bajaj Chetak', value: 'Bajaj Chetak' },
//  { label: 'Bajaj Chetak (Latest 2025)', value: 'Bajaj Chetak (Latest 2025)' },
//  { label: 'Activa New Model Button', value: 'Activa New Model Button' },
//  { label: 'Activa Old Model Button', value: 'Activa Old Model Button' },
//  { label: 'Access Old Model button', value: 'Access Old Model button' },
//  { label: 'Access Old Model', value: 'Access Old Model' },
//  { label: 'Wego', value: 'Wego' },
//  { label: 'LML', value: 'LML' },
//  { label: 'Pep Old Long', value: 'Pep Old Long' },
//  { label: 'Scooty New Model', value: 'Scooty New Model' },
//  { label: 'Pep Plus', value: 'Pep Plus' },
//
//];
//
//const CreateInvoice = ({ navigation }) => {
//  const [client, setClient] = useState('');
//  const [items, setItems] = useState([{ name: '', category: '', qty: '', rate: '' }]);
//
//  const updateItem = (index, field, value) => {
//    const newItems = [...items];
//    newItems[index][field] = value;
//    setItems(newItems);
//  };
//
//  const addItem = () => setItems([...items, { name: '', category: '', qty: '', rate: '' }]);
//
//  const handleSyncAndPrint = async () => {
//    if (!client) return Alert.alert("Error", "Please enter client name");
//
//    const total = items.reduce((sum, item) =>
//      sum + (parseFloat(item.qty || 0) * parseFloat(item.rate || 0)), 0
//    );
//
//    const invoiceData = {
//      clientName: client,
//      date: new Date().toLocaleDateString(),
//      items,
//      total
//    };
//
//    try {
//      const response = await axios.post('https://67c33a733cfc.ngrok-free.app/api/generate-pdf', invoiceData);
//      if (response.data.success) {
//        setClient('');
//        setItems([{ name: '', category: '', qty: '', rate: '' }]);
//        navigation.navigate('PDF', { pdfData: response.data.pdf, refNo: response.data.refNo });
//      }
//    } catch (error) {
//      Alert.alert('Error', error.message);
//    }
//  };
//
//  return (
//    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
//      <View style={styles.headerContainer}>
//        <Text style={styles.mainHeading}>New Memo</Text>
//        <Text style={styles.subHeading}>Search products and generate PDF</Text>
//      </View>
//
//      <View style={styles.formSection}>
//        <Text style={styles.label}>Client Information</Text>
//        <TextInput
//          placeholder="Client Name (M/s)"
//          placeholderTextColor="#999"
//          style={styles.input}
//          value={client}
//          onChangeText={setClient}
//        />
//
//        <Text style={styles.label}>Item Details</Text>
//        {items.map((item, index) => (
//          <View key={index} style={styles.itemBox}>
//
//            {/* Searchable Item Name Dropdown [web:696] */}
//            <Dropdown
//              style={styles.itemDropdown}
//              placeholderStyle={styles.placeholderStyle}
//              selectedTextStyle={styles.selectedTextStyle}
//              inputSearchStyle={styles.inputSearchStyle}
//              data={PRODUCT_DATA}
//              search
//              maxHeight={300}
//              labelField="label"
//              valueField="value"
//              placeholder="Search or Select Item"
//              searchPlaceholder="Type product name..."
//              value={item.name}
//              onChange={selected => updateItem(index, 'name', selected.value)}
//            />
//
//            <View style={styles.row}>
//              <Dropdown
//                style={styles.dropdown}
//                data={CATEGORY_DATA}
//                labelField="label"
//                valueField="value"
//                placeholder="Category"
//                placeholderStyle={styles.placeholderStyle}
//                selectedTextStyle={styles.selectedTextStyle}
//                value={item.category}
//                onChange={cat => updateItem(index, 'category', cat.value)}
//              />
//
//              <TextInput
//                placeholder="Qty"
//                placeholderTextColor="#999"
//                keyboardType="numeric"
//                style={[styles.numericInput, { flex: 0.6 }]}
//                value={item.qty.toString()}
//                onChangeText={(val) => updateItem(index, 'qty', val)}
//              />
//
//              <TextInput
//                placeholder="Rate"
//                placeholderTextColor="#999"
//                keyboardType="numeric"
//                style={[styles.numericInput, { flex: 1 }]}
//                value={item.rate.toString()}
//                onChangeText={(val) => updateItem(index, 'rate', val)}
//              />
//            </View>
//          </View>
//        ))}
//
//        <TouchableOpacity onPress={addItem} style={styles.addButton}>
//          <MaterialIcons name="add" size={20} color="#007AFF" />
//          <Text style={styles.addButtonText}>Add Another Item</Text>
//        </TouchableOpacity>
//
//        <TouchableOpacity onPress={handleSyncAndPrint} style={styles.printButton}>
//          <Text style={styles.printText}>Generate & Sync Memo</Text>
//        </TouchableOpacity>
//      </View>
//    </ScrollView>
//  );
//};
//
//const styles = StyleSheet.create({
//  container: { flex: 1, backgroundColor: '#f8f9fa' },
//  scrollContent: { paddingBottom: 100 },
//  headerContainer: {
//    padding: 24,
//    paddingTop: 50,
//    backgroundColor: '#fff',
//    borderBottomLeftRadius: 25,
//    borderBottomRightRadius: 25,
//    elevation: 4,
//  },
//  mainHeading: { fontSize: 28, fontWeight: 'bold', color: '#1a1a1a' },
//  subHeading: { fontSize: 14, color: '#666', marginTop: 4 },
//  formSection: { padding: 20 },
//  label: { fontSize: 12, fontWeight: 'bold', color: '#007AFF', textTransform: 'uppercase', marginBottom: 8, marginTop: 10 },
//  input: { backgroundColor: '#FFF', padding: 15, borderRadius: 12, marginBottom: 20, elevation: 2, color: '#000' },
//  itemBox: { backgroundColor: '#FFF', padding: 15, borderRadius: 15, marginBottom: 15, elevation: 3 },
//  itemDropdown: { borderBottomWidth: 1, borderBottomColor: '#f0f0f0', height: 50, marginBottom: 5 },
//  inputSearchStyle: { height: 40, fontSize: 14, borderRadius: 8, backgroundColor: '#f1f3f5' },
//  row: { flexDirection: 'row', gap: 12, marginTop: 10, alignItems: 'center' },
//  dropdown: { flex: 1, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', height: 45 },
//  numericInput: { borderBottomWidth: 1, borderBottomColor: '#f0f0f0', paddingVertical: 10, color: '#000', fontSize: 15, textAlign: 'center' },
//  placeholderStyle: { color: '#999', fontSize: 14 },
//  selectedTextStyle: { color: '#000', fontSize: 14 },
//  addButton: { padding: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
//  addButtonText: { color: '#007AFF', fontWeight: 'bold', marginLeft: 5 },
//  printButton: { backgroundColor: '#1a1a1a', padding: 20, borderRadius: 16, marginTop: 20, alignItems: 'center', elevation: 5 },
//  printText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
//});
//
//export default CreateInvoice;


//########################################################################################################

//import React, { useState } from 'react';
//import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
//import { Dropdown } from 'react-native-element-dropdown';
//import axios from 'axios';
//import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
//
//// Categories for your industrial products
//const CATEGORY_DATA = [
//  { label: 'Colored', value: 'Colored' },
//  { label: 'Black', value: 'Black' },
//  { label: 'TPE', value: 'TPE' },
//];
//
//// Searchable product list [web:702]
//const PRODUCT_DATA = [
//  { label: 'Suzuki Access 125 (Old)', value: 'Suzuki Access 125 (Old)' },
//  { label: 'Suzuki Access 125 (Latest 2025)', value: 'Suzuki Access 125 (Latest 2025)' },
//  { label: 'Suzuki Burgman', value: 'Suzuki Burgman' },
//  { label: 'Suzuki Avenis', value: 'Suzuki Avenis' },
//  { label: 'Suzuki Avenis (Neon)', value: 'Suzuki Avenis (Neon)' },
//  { label: 'Honda Activa 6G', value: 'Honda Activa 6G' },
//  { label: 'Honda Activa 6G H-Smart', value: 'Honda Activa 6G H-Smart' },
//  { label: 'Honda Activa 125', value: 'Honda Activa 125' },
//  { label: 'Honda Dio', value: 'Honda Dio' },
//  { label: 'Honda Dio 125', value: 'Honda Dio 125' },
//  { label: 'Honda Activa 5G', value: 'Honda Activa 5G' },
//  { label: 'Honda Grazia', value: 'Honda Grazia' },
//  { label: 'Honda Aviator', value: 'Honda Aviator' },
//  { label: 'TVS Jupiter', value: 'TVS Jupiter' },
//  { label: 'TVS Jupiter (New)', value: 'TVS Jupiter (New)' },
//  { label: 'TVS Jupiter 125', value: 'TVS Jupiter 125' },
//  { label: 'TVS Ntorq 125', value: 'TVS Ntorq 125' },
//  { label: 'TVS Ntorq 125 (Neon)', value: 'TVS Ntorq 125 (Neon)' },
//  { label: 'TVS iQube', value: 'TVS iQube' },
//  { label: 'TVS Orbitor', value: 'TVS Orbitor' },
//  { label: 'Yamaha Fascino', value: 'Yamaha Fascino' },
//  { label: 'Yamaha Ray ZR', value: 'Yamaha Ray ZR' },
//  { label: 'Yamaha Ray ZR (White)', value: 'Yamaha Ray ZR (White)' },
//  { label: 'Hero Pleasure', value: 'Hero Pleasure' },
//  { label: 'Yamaha Ray ZR (White)', value: 'Yamaha Ray ZR (White)' },
//  { label: 'Hero Destini', value: 'Hero Destini' },
//  { label: 'Hero Destini (Latest 2025)', value: 'Hero Destini (Latest 2025)' },
//  { label: 'Hero Electric Optima', value: 'Hero Electric Optima' },
//  { label: 'Hero VIDA', value: 'Hero VIDA' },
//  { label: 'Hero VIDA VX2', value: 'Hero VIDA VX2' },
//  { label: 'Hero XOOM', value: 'Hero XOOM' },
//  { label: 'Hero XOOM 125', value: 'Hero XOOM 125' },
//  { label: 'Hero Maestro Edge', value: 'Hero Maestro Edge' },
//  { label: 'Ampere Magnus', value: 'Ampere Magnus' },
//  { label: 'Ampere Nexus', value: 'Ampere Nexus' },
//  { label: 'Electric / EV', value: 'Electric / EV' },
//  { label: 'Ather 450 X', value: 'Ather 450 X' },
//  { label: 'Ather Rizta', value: 'Ather Rizta' },
//  { label: 'Okinawa Praise Pro', value: 'Okinawa Praise Pro' },
//  { label: 'OLA S1 – Floor Mat', value: 'OLA S1 – Floor Mat' },
//  { label: 'OLA S1(Neon) – Floor Mat', value: 'OLA S1(Neon) – Floor Mat' },
//  { label: 'OLA S1 – Diggy Mat', value: 'OLA S1 – Diggy Mat' },
//  { label: 'Simple EV Bike', value: 'Simple EV Bike' },
//  { label: 'Bajaj Chetak', value: 'Bajaj Chetak' },
//  { label: 'Bajaj Chetak (Latest 2025)', value: 'Bajaj Chetak (Latest 2025)' },
//  { label: 'Activa New Model Button', value: 'Activa New Model Button' },
//  { label: 'Activa Old Model Button', value: 'Activa Old Model Button' },
//  { label: 'Access Old Model button', value: 'Access Old Model button' },
//  { label: 'Access Old Model', value: 'Access Old Model' },
//  { label: 'Wego', value: 'Wego' },
//  { label: 'LML', value: 'LML' },
//  { label: 'Pep Old Long', value: 'Pep Old Long' },
//  { label: 'Scooty New Model', value: 'Scooty New Model' },
//  { label: 'Pep Plus', value: 'Pep Plus' },
//
//];
//
//const CreateInvoice = ({ navigation }) => {
//  const [client, setClient] = useState('');
//  const [items, setItems] = useState([{ name: '', category: '', qty: '', rate: '' }]);
//
//  const updateItem = (index, field, value) => {
//    const newItems = [...items];
//    newItems[index][field] = value;
//    setItems(newItems);
//  };
//
//  const addItem = () => setItems([...items, { name: '', category: '', qty: '', rate: '' }]);
//  const removeItem = (index) => {
//      if (items.length === 1) {
//        return Alert.alert("Error", "Invoice must have at least one item.");
//      }
//      // Filter out the item at the specific index [web:771]
//      const updatedItems = items.filter((_, i) => i !== index);
//      setItems(updatedItems);
//    };
//
//  const handleSyncAndPrint = async () => {
//    if (!client) return Alert.alert("Error", "Please enter client name");
//
//    const total = items.reduce((sum, item) =>
//      sum + (parseFloat(item.qty || 0) * parseFloat(item.rate || 0)), 0
//    );
//
//    const invoiceData = {
//      clientName: client,
//      date: new Date().toLocaleDateString(),
//      items,
//      total
//    };
//
//    try {
//      const response = await axios.post('https://c1200722bb59.ngrok-free.app/api/generate-pdf', invoiceData);
//      if (response.data.success) {
//        setClient('');
//        setItems([{ name: '', category: '', qty: '', rate: '' }]);
//        navigation.navigate('PDF', { pdfData: response.data.pdf, refNo: response.data.refNo });
//      }
//    } catch (error) {
//      Alert.alert('Error', error.message);
//    }
//  };
//
//  return (
//    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
//      <View style={styles.headerContainer}>
//        <Text style={styles.mainHeading}>New Memo</Text>
//        <Text style={styles.subHeading}>Search products and generate PDF</Text>
//      </View>
//
//      <View style={styles.formSection}>
//        <Text style={styles.label}>Client Information</Text>
//        <TextInput
//          placeholder="Client Name (M/s)"
//          placeholderTextColor="#999"
//          style={styles.input}
//          value={client}
//          onChangeText={setClient}
//        />
//
//        <Text style={styles.label}>Item Details</Text>
//        {items.map((item, index) => (
//          <View key={index} style={styles.itemBox}>
//            <TouchableOpacity style={styles.deleteIcon}  onPress={() => removeItem(index)} >
//              <MaterialIcons name="close" size={18} color="#FF3B30" />
//            </TouchableOpacity>
//            {/* Searchable Item Name Dropdown [web:696] */}
//            <Dropdown
//              style={styles.itemDropdown}
//              placeholderStyle={styles.placeholderStyle}
//              selectedTextStyle={styles.selectedTextStyle}
//              inputSearchStyle={styles.inputSearchStyle}
//              data={PRODUCT_DATA}
//              search
//              maxHeight={300}
//              labelField="label"
//              valueField="value"
//              placeholder="Search or Select Item"
//              searchPlaceholder="Type product name..."
//              value={item.name}
//              onChange={selected => updateItem(index, 'name', selected.value)}
//            />
//
//            <View style={styles.row}>
//              <Dropdown
//                style={styles.dropdown}
//                data={CATEGORY_DATA}
//                labelField="label"
//                valueField="value"
//                placeholder="Category"
//                placeholderStyle={styles.placeholderStyle}
//                selectedTextStyle={styles.selectedTextStyle}
//                value={item.category}
//                onChange={cat => updateItem(index, 'category', cat.value)}
//              />
//
//              <TextInput
//                placeholder="Qty"
//                placeholderTextColor="#999"
//                keyboardType="numeric"
//                style={[styles.numericInput, { flex: 0.6 }]}
//                value={item.qty.toString()}
//                onChangeText={(val) => updateItem(index, 'qty', val)}
//              />
//
//              <TextInput
//                placeholder="Rate"
//                placeholderTextColor="#999"
//                keyboardType="numeric"
//                style={[styles.numericInput, { flex: 1 }]}
//                value={item.rate.toString()}
//                onChangeText={(val) => updateItem(index, 'rate', val)}
//              />
//            </View>
//          </View>
//        ))}
//
//        <TouchableOpacity onPress={addItem} style={styles.addButton}>
//          <MaterialIcons name="add" size={20} color="#007AFF" />
//          <Text style={styles.addButtonText}>Add Another Item</Text>
//        </TouchableOpacity>
//
//        <TouchableOpacity onPress={handleSyncAndPrint} style={styles.printButton}>
//          <Text style={styles.printText}>Generate & Sync Memo</Text>
//        </TouchableOpacity>
//      </View>
//    </ScrollView>
//  );
//};
//
//const styles = StyleSheet.create({
//  container: { flex: 1, backgroundColor: '#f8f9fa' },
//  scrollContent: { paddingBottom: 100 },
//  headerContainer: {
//    padding: 24,
//    paddingTop: 50,
//    backgroundColor: '#fff',
//    borderBottomLeftRadius: 25,
//    borderBottomRightRadius: 25,
//    elevation: 4,
//  },
//  mainHeading: { fontSize: 28, fontWeight: 'bold', color: '#1a1a1a' },
//  subHeading: { fontSize: 14, color: '#666', marginTop: 4 },
//  formSection: { padding: 20 },
//  label: { fontSize: 12, fontWeight: 'bold', color: '#007AFF', textTransform: 'uppercase', marginBottom: 8, marginTop: 10 },
//  input: { backgroundColor: '#FFF', padding: 15, borderRadius: 12, marginBottom: 20, elevation: 2, color: '#000' },
//  itemBox: { backgroundColor: '#FFF', padding: 15, borderRadius: 15, marginBottom: 15, elevation: 3, position: 'relative' },
//  deleteIcon: { position: 'absolute', top: 10, right: 10, zIndex: 10, padding: 5, backgroundColor: '#FFF1F0', borderRadius: 50,},
//  itemDropdown: { borderBottomWidth: 1, borderBottomColor: '#f0f0f0', height: 50, marginBottom: 5 },
//  inputSearchStyle: { height: 40, fontSize: 14, borderRadius: 8, backgroundColor: '#f1f3f5' },
//  row: { flexDirection: 'row', gap: 12, marginTop: 10, alignItems: 'center' },
//  dropdown: { flex: 1, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', height: 45 },
//  numericInput: { borderBottomWidth: 1, borderBottomColor: '#f0f0f0', paddingVertical: 10, color: '#000', fontSize: 15, textAlign: 'center' },
//  placeholderStyle: { color: '#999', fontSize: 14 },
//  selectedTextStyle: { color: '#000', fontSize: 14 },
//  addButton: { padding: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
//  addButtonText: { color: '#007AFF', fontWeight: 'bold', marginLeft: 5 },
//  printButton: { backgroundColor: '#1a1a1a', padding: 20, borderRadius: 16, marginTop: 20, alignItems: 'center', elevation: 5 },
//  printText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
//});
//
//export default CreateInvoice;
//


import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import axios from 'axios';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const CLIENT_DATA = [
  { label: 'JPS INDUSTRIES', value: 'JPS INDUSTRIES' },
  { label: 'HP ACCESSORIES', value: 'HP ACCESSORIES' },
  { label: 'URI', value: 'URI' },
  { label: 'SUNRISE', value: 'SUNRISE' },
  { label: 'VEEKAY', value: 'VEEKAY' },
  { label: 'AUTOZONE', value: 'AUTOZONE' },
  { label: 'NIRMAL AUTO', value: 'NIRMAL AUTO' },
  { label: 'DS AUTO', value: 'DS AUTO' },
  { label: 'INDIA MOTORS', value: 'INDIA MOTORS' },
  { label: 'AVON AUTO ACCESSORIES', value: 'AVON AUTO ACCESSORIES' },
  { label: 'T K AUTO', value: 'T K AUTO' },
];

const CATEGORY_DATA = [
  { label: 'Colored', value: 'Colored' },
  { label: 'Black', value: 'Black' },
  { label: 'TPE', value: 'TPE' },
];

const PRODUCT_DATA = [
    { label: 'Suzuki Access 125 (Old)', value: 'Suzuki Access 125 (Old)' },
    { label: 'Suzuki Access 125 (Latest 2025)', value: 'Suzuki Access 125 (Latest 2025)' },
    { label: 'Suzuki Burgman', value: 'Suzuki Burgman' },
    { label: 'Suzuki Avenis', value: 'Suzuki Avenis' },
    { label: 'Suzuki Avenis (Neon)', value: 'Suzuki Avenis (Neon)' },
    { label: 'Honda Activa 6G', value: 'Honda Activa 6G' },
    { label: 'Honda Activa 6G H-Smart', value: 'Honda Activa 6G H-Smart' },
    { label: 'Honda Activa 125', value: 'Honda Activa 125' },
    { label: 'Honda Dio', value: 'Honda Dio' },
    { label: 'Honda Dio 125', value: 'Honda Dio 125' },
    { label: 'Honda Activa 5G', value: 'Honda Activa 5G' },
    { label: 'Honda Grazia', value: 'Honda Grazia' },
    { label: 'Honda Aviator', value: 'Honda Aviator' },
    { label: 'TVS Jupiter', value: 'TVS Jupiter' },
    { label: 'TVS Jupiter (New)', value: 'TVS Jupiter (New)' },
    { label: 'TVS Jupiter 125', value: 'TVS Jupiter 125' },
    { label: 'TVS Ntorq 125', value: 'TVS Ntorq 125' },
    { label: 'TVS Ntorq 125 (Neon)', value: 'TVS Ntorq 125 (Neon)' },
    { label: 'TVS iQube', value: 'TVS iQube' },
    { label: 'TVS Orbitor', value: 'TVS Orbitor' },
    { label: 'Yamaha Fascino', value: 'Yamaha Fascino' },
    { label: 'Yamaha Ray ZR', value: 'Yamaha Ray ZR' },
    { label: 'Yamaha Ray ZR (White)', value: 'Yamaha Ray ZR (White)' },
    { label: 'Hero Pleasure', value: 'Hero Pleasure' },
    { label: 'Yamaha Ray ZR (White)', value: 'Yamaha Ray ZR (White)' },
    { label: 'Hero Destini', value: 'Hero Destini' },
    { label: 'Hero Destini (Latest 2025)', value: 'Hero Destini (Latest 2025)' },
    { label: 'Hero Electric Optima', value: 'Hero Electric Optima' },
    { label: 'Hero VIDA', value: 'Hero VIDA' },
    { label: 'Hero VIDA VX2', value: 'Hero VIDA VX2' },
    { label: 'Hero XOOM', value: 'Hero XOOM' },
    { label: 'Hero XOOM 125', value: 'Hero XOOM 125' },
    { label: 'Hero Maestro Edge', value: 'Hero Maestro Edge' },
    { label: 'Ampere Magnus', value: 'Ampere Magnus' },
    { label: 'Ampere Nexus', value: 'Ampere Nexus' },
    { label: 'Electric / EV', value: 'Electric / EV' },
    { label: 'Ather 450 X', value: 'Ather 450 X' },
    { label: 'Ather Rizta', value: 'Ather Rizta' },
    { label: 'Okinawa Praise Pro', value: 'Okinawa Praise Pro' },
    { label: 'OLA S1 – Floor Mat', value: 'OLA S1 – Floor Mat' },
    { label: 'OLA S1(Neon) – Floor Mat', value: 'OLA S1(Neon) – Floor Mat' },
    { label: 'OLA S1 – Diggy Mat', value: 'OLA S1 – Diggy Mat' },
    { label: 'Simple EV Bike', value: 'Simple EV Bike' },
    { label: 'Bajaj Chetak', value: 'Bajaj Chetak' },
    { label: 'Bajaj Chetak (Latest 2025)', value: 'Bajaj Chetak (Latest 2025)' },
    { label: 'Activa New Model Button', value: 'Activa New Model Button' },
    { label: 'Activa Old Model Button', value: 'Activa Old Model Button' },
    { label: 'Access Old Model button', value: 'Access Old Model button' },
    { label: 'Access Old Model', value: 'Access Old Model' },
    { label: 'Wego', value: 'Wego' },
    { label: 'LML', value: 'LML' },
    { label: 'Pep Old Long', value: 'Pep Old Long' },
    { label: 'Scooty New Model', value: 'Scooty New Model' },
    { label: 'Pep Plus', value: 'Pep Plus' },
];

const CreateInvoice = ({ navigation }) => {
  const [client, setClient] = useState('');
  const [items, setItems] = useState([{ name: '', category: '', qty: '', rate: '' }]);

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const addItem = () => setItems([...items, { name: '', category: '', qty: '', rate: '' }]);
  const removeItem = (index) => {
    if (items.length === 1) return Alert.alert("Error", "Invoice must have at least one item.");
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSyncAndPrint = async () => {
    if (!client) return Alert.alert("Error", "Please select or enter client name");
    const total = items.reduce((sum, item) => sum + (parseFloat(item.qty || 0) * parseFloat(item.rate || 0)), 0);

    const invoiceData = {
      clientName: client,
      date: new Date().toLocaleDateString(),
      items,
      total
    };

    try {
      const response = await axios.post('https://rupeefunda.com/api/generate-pdf', invoiceData);
      if (response.data.success) {
        setClient('');
        setItems([{ name: '', category: '', qty: '', rate: '' }]);
        navigation.navigate('PDF', { pdfData: response.data.pdf, refNo: response.data.refNo });
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.headerContainer}>
        <Text style={styles.mainHeading}>New Memo</Text>
        <Text style={styles.subHeading}>Search clients & products to generate PDF</Text>
      </View>

      <View style={styles.formSection}>
        <Text style={styles.label}>Client Information</Text>

        {/* NEW: Searchable Client Dropdown [web:696][web:703] */}
        <Dropdown
          style={styles.input}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          inputSearchStyle={styles.inputSearchStyle}
          data={CLIENT_DATA}
          search
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder="Search or Select Client"
          searchPlaceholder="Type client name..."
          value={client}
          onChange={item => setClient(item.value)}
        />

        <Text style={styles.label}>Item Details</Text>
        {items.map((item, index) => (
          <View key={index} style={styles.itemBox}>
            <TouchableOpacity style={styles.deleteIcon} onPress={() => removeItem(index)}>
              <MaterialIcons name="close" size={18} color="#FF3B30" />
            </TouchableOpacity>

            <Dropdown
              style={styles.itemDropdown}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              inputSearchStyle={styles.inputSearchStyle}
              data={PRODUCT_DATA}
              search
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder="Search or Select Item"
              searchPlaceholder="Type product name..."
              value={item.name}
              onChange={selected => updateItem(index, 'name', selected.value)}
            />

            <View style={styles.row}>
              <Dropdown
                style={styles.dropdown}
                data={CATEGORY_DATA}
                labelField="label"
                valueField="value"
                placeholder="Category"
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                value={item.category}
                onChange={cat => updateItem(index, 'category', cat.value)}
              />

              <TextInput
                placeholder="Qty"
                placeholderTextColor="#999"
                keyboardType="numeric"
                style={[styles.numericInput, { flex: 0.6 }]}
                value={item.qty.toString()}
                onChangeText={(val) => updateItem(index, 'qty', val)}
              />

              <TextInput
                placeholder="Rate"
                placeholderTextColor="#999"
                keyboardType="numeric"
                style={[styles.numericInput, { flex: 1 }]}
                value={item.rate.toString()}
                onChangeText={(val) => updateItem(index, 'rate', val)}
              />
            </View>
          </View>
        ))}

        <TouchableOpacity onPress={addItem} style={styles.addButton}>
          <MaterialIcons name="add" size={20} color="#007AFF" />
          <Text style={styles.addButtonText}>Add Another Item</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleSyncAndPrint} style={styles.printButton}>
          <Text style={styles.printText}>Generate & Sync Memo</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  scrollContent: { paddingBottom: 100 },
  headerContainer: {
    padding: 24,
    paddingTop: 50,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    elevation: 4,
  },
  mainHeading: { fontSize: 28, fontWeight: 'bold', color: '#1a1a1a' },
  subHeading: { fontSize: 14, color: '#666', marginTop: 4 },
  formSection: { padding: 20 },
  label: { fontSize: 12, fontWeight: 'bold', color: '#007AFF', textTransform: 'uppercase', marginBottom: 8, marginTop: 10 },
  input: { backgroundColor: '#FFF', padding: 12, borderRadius: 12, marginBottom: 20, elevation: 2, height: 50 },
  itemBox: { backgroundColor: '#FFF', padding: 15, borderRadius: 15, marginBottom: 15, elevation: 3, position: 'relative' },
  deleteIcon: { position: 'absolute', top: 5, right: 5, zIndex: 5, padding: 3, backgroundColor: '#FFF1F0', borderRadius: 50 },
  itemDropdown: { borderBottomWidth: 1, borderBottomColor: '#f0f0f0', height: 50, marginBottom: 5 },
  inputSearchStyle: { height: 40, fontSize: 14, borderRadius: 8, backgroundColor: '#f1f3f5' },
  row: { flexDirection: 'row', gap: 12, marginTop: 10, alignItems: 'center' },
  dropdown: { flex: 1, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', height: 45 },
  numericInput: { borderBottomWidth: 1, borderBottomColor: '#f0f0f0', paddingVertical: 10, color: '#000', fontSize: 15, textAlign: 'center' },
  placeholderStyle: { color: '#999', fontSize: 14 },
  selectedTextStyle: { color: '#000', fontSize: 14 },
  addButton: { padding: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  addButtonText: { color: '#007AFF', fontWeight: 'bold', marginLeft: 5 },
  printButton: { backgroundColor: '#1a1a1a', padding: 20, borderRadius: 16, marginTop: 20, alignItems: 'center', elevation: 5 },
  printText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});

export default CreateInvoice;
