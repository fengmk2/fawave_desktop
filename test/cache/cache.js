/*!
 * fawave - common/cache.js
 * Copyright(c) 2012 fengmk2 <fengmk2@gmail.com>
 * MIT Licensed
 *
 * Simple Key/Value cache store base on Web SQL Database.
 * 
 */

var db = window.openDatabase('cachedb', '1.0', 'key value cache database', 100 * 1024 * 1024);
db.transaction(function (tx) {
  tx.executeSql('CREATE TABLE IF NOT EXISTS cache (key TEXT PRIMARY KEY, value TEXT, updated_at NUMERIC)');
});

exports.get = function (key, callback) {
  db.readTransaction(function (tx) {
    tx.executeSql('SELECT value FROM cache WHERE key = ?', [key], function (tx, result) {
      var value = result.rows.length ? result.rows.item(0).value : null;
      callback(value);
    });
  });
};

exports.set = function (key, value, callback) {
  db.transaction(function (tx) {
    tx.executeSql('INSERT OR REPLACE INTO cache VALUES (?, ?, ?)', [key, value, Date.now()], function () {
      callback();
    });
  });
};