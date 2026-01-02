//import React from 'react';
//import { View, StyleSheet, TouchableOpacity, Text, Alert, Dimensions, ActivityIndicator } from 'react-native';
//import Pdf from 'react-native-pdf';
//import RNPrint from 'react-native-print';
//
//const PDFPreview = ({ route }) => {
//  // Extract and clean the base64 string [web:347]
//  const rawData = route.params?.pdfData;
//  const pdfData = rawData ? rawData.replace(/\s/g, '') : null; // Remove any hidden spaces
//
//  const pdfSource = pdfData ? `data:application/pdf;base64,${pdfData}` : null;
//
//  const handlePrint = async () => {
//    if (!pdfSource) {
//      Alert.alert("Error", "No PDF data found to print.");
//      return;
//    }
//    try {
//      await RNPrint.print({ filePath: pdfSource });
//    } catch (error) {
//      Alert.alert("Print Failed", error.message);
//    }
//  };
//
//  return (
//
//    <View style={styles.container}>
//      {pdfSource ? (
//        <Pdf
//          trustAllCerts={false}
//          source={{ uri: pdfSource, cache: true }}
//          // Key fix for A6/Single Page stability on Android [web:359]
//          singlePage={true}
//          activityIndicator={<ActivityIndicator color="#000" size="large" />}
//          style={styles.pdf}
//          onLoadComplete={(numberOfPages) => {
//            console.log(`PDF Loaded Successfully. Pages: ${numberOfPages}`);
//          }}
//          onError={(error) => {
//            console.log('PDF Render Error Details:', error);
//            Alert.alert("Render Error", "Document could not be displayed. Please check server logs.");
//          }}
//        />
//      ) : (
//        <View style={styles.errorContainer}>
//          <Text style={styles.errorText}>No PDF data received from server.</Text>
//        </View>
//      )}
//
//      <TouchableOpacity style={styles.printBtn} onPress={handlePrint}>
//        <Text style={styles.printText}>Print Document</Text>
//      </TouchableOpacity>
//    </View>
//  );
//};
//
//const styles = StyleSheet.create({
//  container: {
//    flex: 1,
//    backgroundColor: '#F8F9FB',
//  },
//  pdf: {
//    flex: 1,
//    width: Dimensions.get('window').width,
//    height: Dimensions.get('window').height,
//    backgroundColor: '#F8F9FB',
//  },
//  errorContainer: {
//    flex: 1,
//    justifyContent: 'center',
//    alignItems: 'center',
//  },
//  errorText: {
//    color: '#666',
//    fontSize: 14,
//  },
//  printBtn: {
//    position: 'absolute',
//    bottom: 30,
//    alignSelf: 'center',
//    backgroundColor: '#000000',
//    paddingVertical: 16,
//    paddingHorizontal: 50,
//    borderRadius: 30,
//    elevation: 10,
//    zIndex: 100,
//  },
//  printText: {
//    color: '#FFFFFF',
//    fontWeight: 'bold',
//    fontSize: 16,
//  },
//});
//
//export default PDFPreview;


import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert, Dimensions, ActivityIndicator } from 'react-native';
import Pdf from 'react-native-pdf';
import RNPrint from 'react-native-print';
import Ionicons from 'react-native-vector-icons/Ionicons'; // Import icons [web:581]

const PDFPreview = ({ route, navigation }) => { // Add navigation prop
  const rawData = route.params?.pdfData;
  const pdfData = rawData ? rawData.replace(/\s/g, '') : null;
  const pdfSource = pdfData ? `data:application/pdf;base64,${pdfData}` : null;

  const handlePrint = async () => {
    if (!pdfSource) {
      Alert.alert("Error", "No PDF data found to print.");
      return;
    }
    try {
      await RNPrint.print({ filePath: pdfSource });
    } catch (error) {
      Alert.alert("Print Failed", error.message);
    }
  };

  return (
    <View style={styles.container}>
      {/* 1. CUSTOM BACK BUTTON [web:573] */}
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.goBack()} // Navigates back to the previous screen [web:582]
      >
        <Ionicons name="arrow-back" size={28} color="#000" />
      </TouchableOpacity>

      {pdfSource ? (
        <Pdf
          trustAllCerts={false}
          source={{ uri: pdfSource, cache: true }}
          singlePage={true}
          activityIndicator={<ActivityIndicator color="#000" size="large" />}
          style={styles.pdf}
          onLoadComplete={(numberOfPages) => {
            console.log(`PDF Loaded Successfully. Pages: ${numberOfPages}`);
          }}
          onError={(error) => {
            console.log('PDF Render Error Details:', error);
            Alert.alert("Render Error", "Document could not be displayed.");
          }}
        />
      ) : (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No PDF data received from server.</Text>
        </View>
      )}

      <TouchableOpacity style={styles.printBtn} onPress={handlePrint}>
        <Text style={styles.printText}>Print Document</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
  // 2. BACK BUTTON POSITIONING [web:573]
  backBtn: {
    position: 'absolute',
    top: 40, // Adjust for status bar
    left: 20,
    zIndex: 101, // Ensure it's above the PDF
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderRadius: 50,
    elevation: 5, // Shadow for Android
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
  },
  pdf: {
    flex: 1,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    backgroundColor: '#F8F9FB',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: { color: '#666', fontSize: 14 },
  printBtn: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    backgroundColor: '#000000',
    paddingVertical: 16,
    paddingHorizontal: 50,
    borderRadius: 30,
    elevation: 10,
    zIndex: 100,
  },
  printText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
});

export default PDFPreview;
