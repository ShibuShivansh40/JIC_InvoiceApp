import { AppRegistry } from 'react-native';
import App from './App';

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

// Register and launch app
AppRegistry.registerComponent('InvoiceApp', () => App);
AppRegistry.runApplication('InvoiceApp', {
  initialProps: {},
  rootTag: document.getElementById('root'),
});
