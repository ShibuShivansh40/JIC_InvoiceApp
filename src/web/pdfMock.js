import React from 'react';
import { View, StyleSheet } from 'react-native';

const PdfWeb = ({ source, style }) => {
  const uri = source?.uri || '';

  return (
    <View style={[styles.container, style]}>
      <iframe
        src={uri}
        title="PDF Preview"
        style={styles.iframe}
        frameBorder="0"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    flex: 1,
  },
  iframe: {
    width: '100%',
    height: '100%',
    border: 'none',
  },
});

export default PdfWeb;
