import { Platform } from 'react-native';
import SQLite from 'react-native-sqlite-storage';

let db = null;
const WEB_STORAGE_KEY = 'JIC_OFFLINE_INVOICES_V1';

if (Platform.OS !== 'web' && SQLite && typeof SQLite.openDatabase === 'function') {
  try {
    db = SQLite.openDatabase({ name: 'Invoices.db', location: 'default' });
  } catch (e) {
    console.log('SQLite openDatabase failed:', e);
  }
}

export const initDB = () => {
  if (Platform.OS === 'web') {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        if (!window.localStorage.getItem(WEB_STORAGE_KEY)) {
          window.localStorage.setItem(WEB_STORAGE_KEY, JSON.stringify([]));
        }
      }
    } catch (e) {
      console.log('Web localStorage init error:', e);
    }
    return;
  }

  if (!db) return;
  try {
    db.transaction((tx) => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS invoices (id INTEGER PRIMARY KEY AUTOINCREMENT, clientName TEXT, refNo TEXT, date TEXT, items TEXT, total REAL)',
        []
      );
    });
  } catch (e) {
    console.log('initDB failed:', e);
  }
};

export const saveInvoice = (invoice) => {
  if (Platform.OS === 'web') {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = JSON.parse(window.localStorage.getItem(WEB_STORAGE_KEY) || '[]');
        stored.unshift({
          ...invoice,
          savedAt: new Date().toISOString(),
        });
        window.localStorage.setItem(WEB_STORAGE_KEY, JSON.stringify(stored.slice(0, 500)));
      }
    } catch (e) {
      console.log('Web invoice save error:', e);
    }
    return Promise.resolve();
  }

  if (!db) return Promise.resolve();
  return new Promise((resolve, reject) => {
    try {
      db.transaction((tx) => {
        tx.executeSql(
          'INSERT INTO invoices (clientName, refNo, date, items, total) VALUES (?,?,?,?,?)',
          [invoice.clientName, invoice.refNo, invoice.date, JSON.stringify(invoice.items), invoice.total],
          (_, result) => resolve(result),
          (_, err) => reject(err)
        );
      });
    } catch (e) {
      resolve();
    }
  });
};
