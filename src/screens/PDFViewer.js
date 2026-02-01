//import React from 'react';
//import { View, StyleSheet, TouchableOpacity, Text, Alert, Dimensions, ActivityIndicator } from 'react-native';
//import Pdf from 'react-native-pdf';
//import RNPrint from 'react-native-print';
//import Share from 'react-native-share'; // Import Share library [web:613]
//import Ionicons from 'react-native-vector-icons/Ionicons';
//
//const PDFPreview = ({ route, navigation }) => {
//  const rawData = route.params?.pdfData;
//  const refNo = route.params?.refNo || "Invoice";
//  const pdfData = rawData ? rawData.replace(/\s/g, '') : null;
//  const pdfSource = pdfData ? `data:application/pdf;base64,${pdfData}` : null;
//
//  const handlePrint = async () => {
//    if (!pdfSource) return Alert.alert("Error", "No PDF data found.");
//    try {
//      await RNPrint.print({ filePath: pdfSource });
//    } catch (error) { Alert.alert("Print Failed", error.message); }
//  };
//
//  // SHARE LOGIC [web:613]
//  const handleShare = async () => {
//    if (!pdfData) return Alert.alert("Error", "No PDF data found to share.");
//
//    const shareOptions = {
//      title: 'Share Invoice',
//      // Dynamic filename based on Ref No [web:623]
//      filename: `${refNo.replace(/\//g, '_')}`,
//      url: `data:application/pdf;base64,${pdfData}`, // Direct base64 sharing [web:613]
//      type: 'application/pdf',
//    };
//
//    try {
//      await Share.open(shareOptions); // Opens the native share sheet [web:613]
//    } catch (error) {
//      if (error.message !== 'User did not share') { // Handle user cancellation
//        console.log('Share Error:', error.message);
//      }
//    }
//  };
//
//  return (
//    <View style={styles.container}>
//      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
//        <Ionicons name="arrow-back" size={28} color="#000" />
//      </TouchableOpacity>
//
//      {pdfSource ? (
//        <Pdf
//          trustAllCerts={false}
//          source={{ uri: pdfSource, cache: true }}
//          singlePage={true}
//          activityIndicator={<ActivityIndicator color="#000" size="large" />}
//          style={styles.pdf}
//        />
//      ) : (
//        <View style={styles.errorContainer}>
//          <Text style={styles.errorText}>No PDF data received from server.</Text>
//        </View>
//      )}
//
//      {/* BUTTON ROW [web:467] */}
//      <View style={styles.buttonRow}>
//        <TouchableOpacity style={[styles.actionBtn, styles.shareBtn]} onPress={handleShare}>
//          <Ionicons name="share-social" size={20} color="#FFF" style={{marginRight: 8}} />
//          <Text style={styles.btnText}>Share</Text>
//        </TouchableOpacity>
//
//        <TouchableOpacity style={[styles.actionBtn, styles.printBtn]} onPress={handlePrint}>
//          <Ionicons name="print" size={20} color="#FFF" style={{marginRight: 8}} />
//          <Text style={styles.btnText}>Print</Text>
//        </TouchableOpacity>
//      </View>
//    </View>
//  );
//};
//
//const styles = StyleSheet.create({
//  container: { flex: 1, backgroundColor: '#F8F9FB' },
//  backBtn: {
//    position: 'absolute', top: 40, left: 20, zIndex: 101,
//    backgroundColor: '#FFF', padding: 8, borderRadius: 50, elevation: 5,
//  },
//  pdf: { flex: 1, width: Dimensions.get('window').width, height: Dimensions.get('window').height },
//  buttonRow: {
//    position: 'absolute', bottom: 30,
//    flexDirection: 'row', width: '100%',
//    justifyContent: 'center', gap: 15, zIndex: 100,
//  },
//  actionBtn: {
//    flexDirection: 'row', alignItems: 'center',
//    paddingVertical: 14, paddingHorizontal: 30,
//    borderRadius: 30, elevation: 10,
//  },
//  shareBtn: { backgroundColor: '#007AFF' }, // Blue for Share
//  printBtn: { backgroundColor: '#000' },    // Black for Print
//  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
//  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
//  errorText: { color: '#666', fontSize: 14 },
//});
//
//export default PDFPreview;
//===============================================================================================================
//import React from 'react';
//import { View, StyleSheet, TouchableOpacity, Text, Alert, Dimensions, ActivityIndicator } from 'react-native';
//import Pdf from 'react-native-pdf';
//import RNPrint from 'react-native-print';
//import Ionicons from 'react-native-vector-icons/Ionicons';
//import axios from 'axios';
//
//const API_URL = 'https://fd343d90abe2.ngrok-free.app/api';
//
//const PDFPreview = ({ route, navigation }) => {
//  const rawData = route.params?.pdfData;
//  const refNo = route.params?.refNo;
//  const pdfData = rawData ? rawData.replace(/\s/g, '') : null;
//  const pdfSource = pdfData ? `data:application/pdf;base64,${pdfData}` : null;
//
//  const handlePrint = async () => {
//    if (!pdfSource) return Alert.alert("Error", "No PDF data found to print.");
//    try {
//      await RNPrint.print({ filePath: pdfSource });
//    } catch (error) {
//      Alert.alert("Print Failed", error.message);
//    }
//  };
//
//  const handleEdit = async () => {
//    try {
//      const res = await axios.get(`${API_URL}/invoice/${refNo}`); // New endpoint to fetch single invoice
//      if (res.data) {
//        navigation.navigate('Create', { invoiceData: res.data }); // Pass to CreateInvoice for pre-fill
//      }
//    } catch (err) {
//      Alert.alert('Error', 'Failed to load invoice for edit');
//    }
//  };
//
//  return (
//    <View style={styles.container}>
//      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
//        <Ionicons name="arrow-back" size={28} color="#000" />
//      </TouchableOpacity>
//
//      {pdfData ? (
//        <Pdf source={{ uri: pdfSource }} style={styles.pdf} />
//      ) : (
//        <View style={styles.errorContainer}>
//          <Text style={styles.errorText}>No PDF data</Text>
//        </View>
//      )}
//
//      <View style={styles.buttonRow}>
//        <TouchableOpacity style={[styles.actionBtn, styles.shareBtn]}>
//          <Ionicons name="share-social" size={20} color="#FFF" />
//          <Text style={styles.btnText}>Share</Text>
//        </TouchableOpacity>
//        <TouchableOpacity style={[styles.actionBtn, styles.printBtn]} onPress={handlePrint}>
//          <Ionicons name="print" size={20} color="#FFF" />
//          <Text style={styles.btnText}>Print</Text>
//        </TouchableOpacity>
//        <TouchableOpacity style={[styles.actionBtn, styles.editBtn]} onPress={handleEdit}>
//          <Ionicons name="pencil" size={20} color="#FFF" />
//          <Text style={styles.btnText}>Edit</Text>
//        </TouchableOpacity>
//      </View>
//    </View>
//  );
//};
//
//const styles = StyleSheet.create({
//  container: { flex: 1, backgroundColor: '#F8F9FB' },
//  backBtn: {
//    position: 'absolute', top: 40, left: 20, zIndex: 101,
//    backgroundColor: '#FFF', padding: 8, borderRadius: 50, elevation: 5,
//  },
//  pdf: { flex: 1, width: Dimensions.get('window').width, height: Dimensions.get('window').height },
//  buttonRow: {
//    position: 'absolute', bottom: 30,
//    flexDirection: 'row', width: '100%',
//    justifyContent: 'center', gap: 15, zIndex: 100,
//  },
//  actionBtn: {
//    flexDirection: 'row', alignItems: 'center',
//    paddingVertical: 14, paddingHorizontal: 30,
//    borderRadius: 30, elevation: 10,
//  },
//  shareBtn: { backgroundColor: '#007AFF' }, // Blue for Share
//  printBtn: { backgroundColor: '#000' },    // Black for Print
//  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
//  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
//  errorText: { color: '#666', fontSize: 14 },
//
//  editBtn: { backgroundColor: '#FFC107' }, // Yellow for Edit
//});
//
//export default PDFPreview;
//===========================================================================================

import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert, Dimensions, ActivityIndicator } from 'react-native';
import Pdf from 'react-native-pdf';
import RNPrint from 'react-native-print';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';

const API_URL = 'https://8193638cf04f.ngrok-free.app/api';

const PDFPreview = ({ route, navigation }) => {
  const rawData = route.params?.pdfData;
  const refNo = route.params?.refNo;
  const pdfData = rawData ? rawData.replace(/\s/g, '') : null;
  const pdfSource = pdfData ? `data:application/pdf;base64,${pdfData}` : null;

  const handlePrint = async () => {
    if (!pdfSource) return Alert.alert("Error", "No PDF data found to print.");
    try {
      await RNPrint.print({ filePath: pdfSource });
    } catch (error) {
      Alert.alert("Print Failed", error.message);
    }
  };

  const handleEdit = async () => {
    if (!refNo) return Alert.alert('Error', 'No reference number available');
    const encodedRefNo = encodeURIComponent(refNo); // Fix: encode slashes
    console.log('Encoded refNo for GET:', encodedRefNo);
    try {
      const res = await axios.get(`${API_URL}/invoice/${encodedRefNo}`);
      console.log('Edit GET response:', res.data);
      if (res.data) {
        navigation.navigate('Create', { invoiceData: res.data });
      } else {
        Alert.alert('Error', 'Invoice not found');
      }
    } catch (err) {
      console.error('Edit GET error:', err.response?.data || err.message);
      Alert.alert('Error', err.response?.data?.error || 'Failed to load invoice');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={28} color="#000" />
      </TouchableOpacity>

      {pdfData ? (
        <Pdf
          source={{ uri: pdfSource }}
          style={styles.pdf}
          singlePage={true}
          activityIndicator={<ActivityIndicator color="#000" size="large" />}
          onLoadComplete={(numberOfPages) => console.log(`PDF loaded with ${numberOfPages} pages`)}
          onError={(error) => Alert.alert('Render Error', 'Could not display PDF')}
        />
      ) : (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No PDF data available</Text>
        </View>
      )}

      <View style={styles.buttonRow}>
        <TouchableOpacity style={[styles.actionBtn, styles.shareBtn]}>
          <Ionicons name="share-social" size={20} color="#FFF" style={{ marginRight: 8 }} />
          <Text style={styles.btnText}>Share</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, styles.printBtn]} onPress={handlePrint}>
          <Ionicons name="print" size={20} color="#FFF" style={{ marginRight: 8 }} />
          <Text style={styles.btnText}>Print</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, styles.editBtn]} onPress={handleEdit}>
          <Ionicons name="pencil" size={20} color="#FFF" style={{ marginRight: 8 }} />
          <Text style={styles.btnText}>Edit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FB' },
  backBtn: {
    position: 'absolute', top: 40, left: 20, zIndex: 101,
    backgroundColor: '#FFF', padding: 8, borderRadius: 50, elevation: 5,
  },
  pdf: { flex: 1, width: Dimensions.get('window').width, height: Dimensions.get('window').height },
  buttonRow: {
    position: 'absolute', bottom: 30,
    flexDirection: 'row', width: '100%',
    justifyContent: 'center', gap: 15, zIndex: 100,
  },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14, paddingHorizontal: 30,
    borderRadius: 30, elevation: 10,
  },
  shareBtn: { backgroundColor: '#007AFF' },
  printBtn: { backgroundColor: '#000' },
  editBtn: { backgroundColor: '#FFC107' }, // Yellow for Edit
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: '#666', fontSize: 14 },
});

export default PDFPreview;