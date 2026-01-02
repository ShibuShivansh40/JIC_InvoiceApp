import SQLite from 'react-native-sqlite-storage';

const db = SQLite.openDatabase({ name: 'Invoices.db', location: 'default' });

export const initDB = () => {
  db.transaction((tx) => {
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS invoices (id INTEGER PRIMARY KEY AUTOINCREMENT, clientName TEXT, refNo TEXT, date TEXT, items TEXT, total REAL)',
      []
    );
  });
};

export const saveInvoice = (invoice) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'INSERT INTO invoices (clientName, refNo, date, items, total) VALUES (?,?,?,?,?)',
        [invoice.clientName, invoice.refNo, invoice.date, JSON.stringify(invoice.items), invoice.total],
        (_, result) => resolve(result),
        (_, err) => reject(err)
      );
    });
  });
};
