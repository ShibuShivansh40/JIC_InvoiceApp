import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import axios from 'axios';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const CATEGORY_DATA = [
  { label: 'Colored', value: 'Colored' },
  { label: 'Black', value: 'Black' },
  { label: 'TPE', value: 'TPE' },
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

  const handleSyncAndPrint = async () => {
    if (!client) return Alert.alert("Error", "Please enter client name");

    // Convert to numbers and calculate total
    const total = items.reduce((sum, item) =>
      sum + (parseFloat(item.qty || 0) * parseFloat(item.rate || 0)), 0
    );

    const invoiceData = {
      clientName: client,
      date: new Date().toLocaleDateString(),
      items,
      total
    };

    try {
      const response = await axios.post('https://67c33a733cfc.ngrok-free.app/api/generate-pdf', invoiceData);
      if (response.data.success) {
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
        <Text style={styles.subHeading}>Enter details to generate PDF</Text>
      </View>

      <View style={styles.formSection}>
        <Text style={styles.label}>Client Information</Text>
        <TextInput
          placeholder="Client Name (M/s)"
          placeholderTextColor="#999"
          style={styles.input}
          value={client}
          onChangeText={setClient}
        />

        <Text style={styles.label}>Item Details</Text>
        {items.map((item, index) => (
          <View key={index} style={styles.itemBox}>
            <TextInput
              placeholder="Item Name"
              placeholderTextColor="#999"
              style={styles.itemInput}
              value={item.name}
              onChangeText={(val) => updateItem(index, 'name', val)}
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

              {/* Corrected QTY Input */}
              <TextInput
                placeholder="Qty"
                placeholderTextColor="#999"
                keyboardType="numeric"
                style={[styles.numericInput, { flex: 0.6 }]}
                value={item.qty.toString()}
                onChangeText={(val) => updateItem(index, 'qty', val)}
              />

              {/* Corrected RATE Input */}
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
  input: { backgroundColor: '#FFF', padding: 15, borderRadius: 12, marginBottom: 20, elevation: 2, color: '#000' },
  itemBox: { backgroundColor: '#FFF', padding: 15, borderRadius: 15, marginBottom: 15, elevation: 3 },
  itemInput: { borderBottomWidth: 1, borderBottomColor: '#f0f0f0', paddingVertical: 10, color: '#000', fontSize: 15 },
  row: { flexDirection: 'row', gap: 12, marginTop: 10, alignItems: 'center' },
  dropdown: { flex: 1, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', height: 45 },
  numericInput: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingVertical: 10,
    color: '#000',
    fontSize: 15,
    textAlign: 'center' // Centered text for cleaner look
  },
  placeholderStyle: { color: '#999', fontSize: 14 },
  selectedTextStyle: { color: '#000', fontSize: 14 },
  addButton: { padding: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  addButtonText: { color: '#007AFF', fontWeight: 'bold', marginLeft: 5 },
  printButton: { backgroundColor: '#1a1a1a', padding: 20, borderRadius: 16, marginTop: 20, alignItems: 'center', elevation: 5 },
  printText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});

export default CreateInvoice;
