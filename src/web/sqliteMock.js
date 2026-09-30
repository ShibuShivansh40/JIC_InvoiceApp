// Web fallback for SQLite database storage
export const openDatabase = () => ({
  transaction: (callback) => {
    callback({
      executeSql: (sql, params, success, error) => {
        if (success) success(null, { rows: { raw: () => [] } });
      },
    });
  },
});

export const initDB = () => {};
export const saveInvoice = () => Promise.resolve();

export default { openDatabase };
