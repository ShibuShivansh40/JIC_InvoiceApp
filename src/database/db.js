import { Platform } from 'react-native';
import SQLite from 'react-native-sqlite-storage';

let db = null;

if (Platform.OS !== 'web' && SQLite && typeof SQLite.openDatabase === 'function') {
  try {
    db = SQLite.openDatabase({ name: 'Invoices.db', location: 'default' });
  } catch (e) {
    console.log('SQLite openDatabase failed:', e);
  }
}

export const initDB = () => {
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
