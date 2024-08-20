const Database = require('better-sqlite3');
const db = new Database('mnestix-database.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS ConnectionTypes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT
  );
`);


db.exec(`
  CREATE TABLE IF NOT EXISTS Connections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url TEXT,
    type ConnectionTypes
  );
`);

console.log('Database initialized.');

db.close();