import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

function base64ToBlobUrl(dataUri) {
  if (!dataUri) return null;
  if (!dataUri.startsWith('data:')) return dataUri;
  try {
    const parts = dataUri.split(',');
    const mimeMatch = parts[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'application/pdf';
    const b64 = parts[1] || '';
    const byteCharacters = atob(b64.replace(/\s/g, ''));
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mime });
    return URL.createObjectURL(blob);
  } catch (err) {
    console.error('Failed to convert base64 to Blob URL:', err);
    return dataUri;
  }
}

const PdfWeb = ({ source, style, onError, onLoadComplete }) => {
  const [blobUrl, setBlobUrl] = useState(null);

  useEffect(() => {
    const rawUri = source?.uri || '';
    const createdUrl = base64ToBlobUrl(rawUri);
    setBlobUrl(createdUrl);

    if (createdUrl && onLoadComplete) {
      onLoadComplete(1);
    }

    return () => {
      if (createdUrl && createdUrl.startsWith('blob:')) {
        URL.revokeObjectURL(createdUrl);
      }
    };
  }, [source?.uri]);

  const handleOpenExternal = () => {
    if (blobUrl) {
      window.open(blobUrl, '_blank');
    }
  };

  if (!blobUrl) {
    return (
      <View style={[styles.container, styles.emptyContainer, style]}>
        <Text style={styles.emptyText}>Loading PDF Preview...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {/* Fallback bar for mobile PWA viewports */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.openBtn} onPress={handleOpenExternal}>
          <Text style={styles.openBtnText}>Open Fullscreen / New Tab</Text>
        </TouchableOpacity>
      </View>

      <object
        data={blobUrl}
        type="application/pdf"
        style={styles.iframe}
        title="PDF Preview"
      >
        <iframe
          src={blobUrl}
          title="PDF Preview"
          style={styles.iframe}
          frameBorder="0"
        >
          <View style={styles.fallbackBox}>
            <Text style={styles.fallbackText}>Unable to display PDF directly.</Text>
            <TouchableOpacity style={styles.openBtn} onPress={handleOpenExternal}>
              <Text style={styles.openBtnText}>Click to View PDF</Text>
            </TouchableOpacity>
          </View>
        </iframe>
      </object>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    flex: 1,
    position: 'relative',
  },
  topBar: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
  },
  openBtn: {
    backgroundColor: '#007AFF',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  openBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
  },
  iframe: {
    width: '100%',
    height: '100%',
    flex: 1,
    border: 'none',
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
    fontSize: 14,
  },
  fallbackBox: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
});

export default PdfWeb;
