const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');

const dbPath = path.resolve(__dirname, 'ecommerce.db');

let dbInstance = null;
let initPromise = null;

function saveToDisk() {
  if (!dbInstance) return;
  const data = dbInstance.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);
}

function seedProductsIfEmpty() {
  const res = dbInstance.exec('SELECT COUNT(*) AS count FROM products');
  const count = res.length > 0 && res[0].values.length > 0 ? res[0].values[0][0] : 0;

  if (count === 0) {
    const sampleProducts = [
      [
        'Wireless Mechanical Keyboard',
        'Compact tactile keyboard with dual-mode wireless connectivity and hot-swappable switches.',
        79.99,
        'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600',
        15
      ],
      [
        'Minimalist Desk Lamp',
        'Adjustable LED desk lamp with warm-to-cool color temperature control and touch dimmer.',
        39.5,
        'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600',
        20
      ],
      [
        'Insulated Stainless Bottle',
        'Double-wall vacuum insulated 750ml bottle that keeps drinks cold for 24 hours.',
        24.0,
        'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600',
        30
      ],
      [
        'Ergonomic Wireless Mouse',
        'Sculpted wireless mouse with silent clicks, 4000 DPI sensor, and USB-C charging.',
        49.99,
        'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600',
        18
      ]
    ];

    const stmt = dbInstance.prepare(
      'INSERT INTO products (title, description, price, image_url, stock) VALUES (?, ?, ?, ?, ?)'
    );
    for (const item of sampleProducts) {
      stmt.run(item);
    }
    stmt.free();
    saveToDisk();
    console.log('Seeded initial products.');
  }
}

async function getDb() {
  if (dbInstance) return dbInstance;
  if (!initPromise) {
    initPromise = (async () => {
      const SQL = await initSqlJs();
      if (fs.existsSync(dbPath)) {
        const fileBuffer = fs.readFileSync(dbPath);
        dbInstance = new SQL.Database(fileBuffer);
      } else {
        dbInstance = new SQL.Database();
      }

      dbInstance.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS products (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          price REAL NOT NULL,
          image_url TEXT NOT NULL,
          stock INTEGER NOT NULL DEFAULT 10
        );

        CREATE TABLE IF NOT EXISTS orders (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          total_amount REAL NOT NULL,
          status TEXT DEFAULT 'CONFIRMED',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS order_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          order_id INTEGER NOT NULL,
          product_id INTEGER NOT NULL,
          quantity INTEGER NOT NULL,
          price_at_purchase REAL NOT NULL,
          FOREIGN KEY (order_id) REFERENCES orders(id),
          FOREIGN KEY (product_id) REFERENCES products(id)
        );
      `);

      seedProductsIfEmpty();
      saveToDisk();
      console.log('Connected to SQLite (sql.js) database.');
      return dbInstance;
    })();
  }
  return initPromise;
}

function queryAll(sql, params = []) {
  return getDb().then((db) => {
    const stmt = db.prepare(sql);
    stmt.bind(params);
    const rows = [];
    while (stmt.step()) {
      rows.push(stmt.getAsObject());
    }
    stmt.free();
    return rows;
  });
}

function queryGet(sql, params = []) {
  return queryAll(sql, params).then((rows) => rows[0] || null);
}

function runWrite(sql, params = []) {
  return getDb().then((db) => {
    db.run(sql, params);
    const lastIdRes = db.exec('SELECT last_insert_rowid() AS id');
    const lastID =
      lastIdRes.length > 0 && lastIdRes[0].values.length > 0 ? lastIdRes[0].values[0][0] : null;
    saveToDisk();
    return { lastID };
  });
}

module.exports = {
  getDb,
  queryAll,
  queryGet,
  runWrite,
  saveToDisk
};