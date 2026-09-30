import { AppRegistry } from 'react-native';
import App from './App';

// Register the app for web
AppRegistry.registerComponent('InvoiceApp', () => App);

AppRegistry.runApplication('InvoiceApp', {
  initialProps: {},
  rootTag: document.getElementById('root'),
});
