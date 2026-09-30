import React from 'react';
import { AppRegistry, View, Text, StyleSheet } from 'react-native';
import App from './App';

class WebErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Web Runtime Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>App Error</Text>
          <Text style={styles.errorText}>
            {this.state.error?.toString() || 'An error occurred loading the application.'}
          </Text>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#D32F2F',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
});

// Inject vector icon fonts for web rendering
const iconFontStyles = `
@font-face {
  font-family: 'MaterialIcons';
  src: url('https://cdn.jsdelivr.net/npm/react-native-vector-icons@10.0.0/Fonts/MaterialIcons.ttf') format('truetype');
}
@font-face {
  font-family: 'Ionicons';
  src: url('https://cdn.jsdelivr.net/npm/react-native-vector-icons@10.0.0/Fonts/Ionicons.ttf') format('truetype');
}
`;

const style = document.createElement('style');
style.type = 'text/css';
if (style.styleSheet) {
  style.styleSheet.cssText = iconFontStyles;
} else {
  style.appendChild(document.createTextNode(iconFontStyles));
}
document.head.appendChild(style);

const RootApp = () => (
  <WebErrorBoundary>
    <App />
  </WebErrorBoundary>
);

// Register and launch app
AppRegistry.registerComponent('InvoiceApp', () => RootApp);
AppRegistry.runApplication('InvoiceApp', {
  initialProps: {},
  rootTag: document.getElementById('root'),
});
