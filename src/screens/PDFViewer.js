import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert, Dimensions, ActivityIndicator } from 'react-native';
import Pdf from 'react-native-pdf';
import RNPrint from 'react-native-print';
import Share from 'react-native-share';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import { API_URL, API_KEY } from '../config';

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

  const handleShare = async () => {
    if (!pdfData) return Alert.alert("Error", "No PDF data found to share.");
    const filename = refNo ? `${refNo.replace(/\//g, '_')}.pdf` : 'Invoice.pdf';

    const shareOptions = {
      title: 'Share Invoice',
      filename: filename,
      url: `data:application/pdf;base64,${pdfData}`,
      type: 'application/pdf',
      failOnCancel: false,
    };

    try {
      await Share.open(shareOptions);
    } catch (error) {
      if (error.message !== 'User did not share') {
        console.log('Share Error:', error.message);
      }
    }
  };

  const handleEdit = async () => {
    if (!refNo) {
      console.log('No refNo provided in route params');
      return Alert.alert('Error', 'No reference number available');
    }

    const encodedRefNo = encodeURIComponent(refNo);
    console.log('Requesting edit for encoded refNo:', encodedRefNo);

    try {
      const res = await axios.get(`${API_URL}/invoice/${encodedRefNo}`, {
        headers: { 'x-api-key': API_KEY }
      });

      console.log('Server response status:', res.status);
      console.log('Server response data:', res.data);

      if (res.status === 200 && res.data && Object.keys(res.data).length > 0) {
        navigation.navigate('Create', { invoiceData: res.data });
      } else {
        console.log('Invalid response:', res.data);
        Alert.alert('Error', 'Invoice data not found or empty');
      }
    } catch (err) {
      console.log('Edit request failed - status:', err.response?.status);
      console.log('Error response data:', err.response?.data);
      console.log('Full error:', err.message);

      let errorMsg = 'Failed to load invoice for edit';
      if (err.response?.status === 401) {
        errorMsg = 'Unauthorized - Check API key';
      } else if (err.response?.status === 404) {
        errorMsg = 'Invoice not found';
      } else if (err.response?.status === 500) {
        errorMsg = 'Server error - Check server logs';
      } else if (err.code === 'ERR_NETWORK') {
        errorMsg = 'Network error - Check connection';
      }

      Alert.alert('Edit Failed', errorMsg);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={28} color="#000" />
      </TouchableOpacity>

      {pdfSource ? (
        <Pdf
          trustAllCerts={false}
          source={{ uri: pdfSource, cache: true }}
          style={styles.pdf}
          singlePage={true}
          activityIndicator={<ActivityIndicator color="#007AFF" size="large" />}
          onLoadComplete={(numberOfPages) => console.log(`PDF loaded: ${numberOfPages} pages`)}
          onError={(error) => console.log('PDF Render Error:', error)}
        />
      ) : (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No PDF data available</Text>
        </View>
      )}

      <View style={styles.buttonRow}>
        <TouchableOpacity style={[styles.actionBtn, styles.shareBtn]} onPress={handleShare}>
          <Ionicons name="share-social" size={20} color="#FFF" style={styles.btnIcon} />
          <Text style={styles.btnText}>Share</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, styles.printBtn]} onPress={handlePrint}>
          <Ionicons name="print" size={20} color="#FFF" style={styles.btnIcon} />
          <Text style={styles.btnText}>Print</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, styles.editBtn]} onPress={handleEdit}>
          <Ionicons name="pencil" size={20} color="#FFF" style={styles.btnIcon} />
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
    backgroundColor: '#FFF', padding: 10, borderRadius: 50, elevation: 5,
  },
  pdf: { flex: 1, width: Dimensions.get('window').width, height: Dimensions.get('window').height },
  buttonRow: {
    position: 'absolute', bottom: 40,
    flexDirection: 'row', width: '100%',
    justifyContent: 'center', gap: 15, zIndex: 100,
  },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14, paddingHorizontal: 24,
    borderRadius: 30, elevation: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4,
  },
  shareBtn: { backgroundColor: '#007AFF' },
  printBtn: { backgroundColor: '#111' },
  editBtn: { backgroundColor: '#FFC107' },
  btnText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  btnIcon: { marginRight: 8 },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: '#666', fontSize: 16 },
});

export default PDFPreview;
