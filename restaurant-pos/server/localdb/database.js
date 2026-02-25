const fs = require("fs");
const path = require("path");

const dbPath = path.join(__dirname, "captain_cafe.db");
const fallbackPath = path.join(__dirname, "captain_cafe_local_orders.json");

let db = null;
let sqliteReady = false;

try {
  const sqlite3 = require("sqlite3").verbose();
  db = new sqlite3.Database(dbPath);
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS local_orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        invoiceNumber TEXT,
        payload TEXT NOT NULL,
        isSynced INTEGER DEFAULT 0,
        syncedAt DATETIME NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`
      CREATE INDEX IF NOT EXISTS idx_local_orders_sync
      ON local_orders(isSynced, createdAt)
    `);
  });
  sqliteReady = true;
} catch (error) {
  sqliteReady = false;
  console.warn("SQLite native module unavailable. Falling back to JSON local storage.");
}

const ensureFallback = () => {
  if (!fs.existsSync(fallbackPath)) {
    fs.writeFileSync(fallbackPath, JSON.stringify({ seq: 0, local_orders: [] }, null, 2), "utf-8");
  }
};

const readFallback = () => {
  ensureFallback();
  return JSON.parse(fs.readFileSync(fallbackPath, "utf-8"));
};

const writeFallback = (data) => {
  fs.writeFileSync(fallbackPath, JSON.stringify(data, null, 2), "utf-8");
};

const runFallback = async (sql, params = []) => {
  const q = sql.toLowerCase().trim();
  const state = readFallback();

  if (q.startsWith("insert into local_orders")) {
    state.seq += 1;
    state.local_orders.push({
      id: state.seq,
      invoiceNumber: params[0] || null,
      payload: params[1] || "{}",
      isSynced: 0,
      syncedAt: null,
      createdAt: new Date().toISOString(),
    });
    writeFallback(state);
    return { lastID: state.seq, changes: 1 };
  }

  if (q.startsWith("update local_orders set issynced")) {
    const id = Number(params[0]);
    const row = state.local_orders.find((r) => r.id === id);
    if (!row) return { lastID: 0, changes: 0 };
    row.isSynced = 1;
    row.syncedAt = new Date().toISOString();
    writeFallback(state);
    return { lastID: id, changes: 1 };
  }

  return { lastID: 0, changes: 0 };
};

const allFallback = async (sql) => {
  const q = sql.toLowerCase().trim();
  const state = readFallback();

  if (q.includes("from local_orders where issynced = 0 order by")) {
    return state.local_orders
      .filter((r) => Number(r.isSynced) === 0)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      .map((r) => ({
        id: r.id,
        invoiceNumber: r.invoiceNumber,
        payload: r.payload,
        createdAt: r.createdAt,
      }));
  }

  if (q.includes("count(*) as c from local_orders where issynced = 0")) {
    return [{ c: state.local_orders.filter((r) => Number(r.isSynced) === 0).length }];
  }

  return [];
};

const run = (sql, params = []) =>
  sqliteReady
    ? new Promise((resolve, reject) => {
        db.run(sql, params, function onRun(err) {
          if (err) return reject(err);
          return resolve({ lastID: this.lastID, changes: this.changes });
        });
      })
    : runFallback(sql, params);

const get = (sql, params = []) =>
  sqliteReady
    ? new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
          if (err) return reject(err);
          return resolve(row);
        });
      })
    : Promise.resolve(null);

const all = (sql, params = []) =>
  sqliteReady
    ? new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
          if (err) return reject(err);
          return resolve(rows);
        });
      })
    : allFallback(sql, params);

module.exports = { db, run, get, all };
