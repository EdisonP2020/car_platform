const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, '../database.sqlite');

// 創建資料庫連接
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('無法連接到資料庫', err.message);
  } else {
    console.log('已連接到 SQLite 資料庫');
    initializeDatabase();
  }
});

// 初始化資料庫表格
function initializeDatabase() {
  // 創建用戶表
  db.run(`CREATE TABLE IF NOT EXISTS users (
    userID INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(50) NOT NULL,
    password TEXT NOT NULL,
    phone_num VARCHAR(50),
    isAdmin BOOLEAN DEFAULT 0
  )`);
  
  // 創建車輛表
  db.run(`CREATE TABLE IF NOT EXISTS vehicles (
    license_plate VARCHAR(50) PRIMARY KEY,
    mileage INTEGER DEFAULT 0,
    low_oil_volume BOOLEAN DEFAULT 0,
    warning_light BOOLEAN DEFAULT 0,
    status TEXT CHECK(status IN ('available', 'rented', 'broken')) NOT NULL DEFAULT 'available',
    last_maintenance_date DATE,
    last_maintainance_mileage INTEGER DEFAULT 0
  )`);
  
  // 創建租借記錄表
  db.run(`CREATE TABLE IF NOT EXISTS rental_logs (
    log_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    vehicle_id VARCHAR(50),
    mileage_before_driving INTEGER,
    mileage_after_driving INTEGER,
    rent_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    return_time TIMESTAMP,
    oil_before TEXT CHECK(oil_before IN ('high', 'mid', 'low')),
    oil_after TEXT CHECK(oil_after IN ('high', 'mid', 'low')),
    mileage_before_photo_path VARCHAR(255),
    mileage_after_photo_path VARCHAR(255),
    FOREIGN KEY(user_id) REFERENCES users(userID),
    FOREIGN KEY(vehicle_id) REFERENCES vehicles(license_plate)
  )`);
  
  // 創建故障記錄表
  db.run(`CREATE TABLE IF NOT EXISTS breakdown_logs (
    log_id INTEGER PRIMARY KEY AUTOINCREMENT,
    vehicle_id VARCHAR(50),
    user_id INTEGER,
    report_date DATE DEFAULT CURRENT_DATE,
    issue_description VARCHAR(255),
    resolved BOOLEAN DEFAULT 0,
    FOREIGN KEY(vehicle_id) REFERENCES vehicles(license_plate),
    FOREIGN KEY(user_id) REFERENCES users(userID)
  )`);
  
  console.log('資料庫表格已初始化');
}

function run(query, params = []) {
  return new Promise((resolve, reject) => {
    db.run(query, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve(this);
      }
    });
  });
}

function all(query, params = []) {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

function get(query, params = []) {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

// 用戶相關操作
async function getUser(username, password) {
  return get(
    `SELECT * FROM users WHERE name = ? AND password = ?`,
    [username, password]
  );
}

async function getAllUsers() {
  return all(`SELECT * FROM users`);
}

// 車輛相關操作
async function getAllVehicles() {
  return all(`SELECT * FROM vehicles`);
}

async function addVehicle(vehicle) {
  const {
    license_plate,
    mileage = 0,
    low_oil_volume = 0,
    warning_light = 0,
    status = 'available',
    last_maintenance_date = null,
    last_maintainance_mileage = 0,
  } = vehicle;

  await run(
    `INSERT INTO vehicles (
      license_plate, mileage, low_oil_volume, warning_light,
      status, last_maintenance_date, last_maintainance_mileage
    ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      license_plate,
      mileage,
      low_oil_volume ? 1 : 0,
      warning_light ? 1 : 0,
      status,
      last_maintenance_date,
      last_maintainance_mileage,
    ]
  );
  return vehicle;
}

async function updateVehicle(licensePlate, updates) {
  const fields = [];
  const values = [];
  for (const [key, value] of Object.entries(updates)) {
    fields.push(`${key} = ?`);
    values.push(value);
  }
  if (fields.length === 0) return null;
  values.push(licensePlate);
  await run(
    `UPDATE vehicles SET ${fields.join(', ')} WHERE license_plate = ?`,
    values
  );
  return get(`SELECT * FROM vehicles WHERE license_plate = ?`, [licensePlate]);
}

async function deleteVehicle(licensePlate) {
  await run(`DELETE FROM vehicles WHERE license_plate = ?`, [licensePlate]);
  return true;
}

// 租借記錄操作
async function addRentalLog(log) {
  const columns = [];
  const placeholders = [];
  const values = [];
  for (const [key, value] of Object.entries(log)) {
    columns.push(key);
    placeholders.push('?');
    values.push(value);
  }
  const result = await run(
    `INSERT INTO rental_logs (${columns.join(',')}) VALUES (${placeholders.join(
      ','
    )})`,
    values
  );
  return { ...log, log_ID: result.lastID };
}

async function getAllRentalLogs() {
  return all(`SELECT * FROM rental_logs`);
}

async function getRentalLogById(id) {
  return get(`SELECT * FROM rental_logs WHERE log_ID = ?`, [id]);
}

async function updateRentalLog(logId, updates) {
  const fields = [];
  const values = [];
  for (const [key, value] of Object.entries(updates)) {
    fields.push(`${key} = ?`);
    values.push(value);
  }
  if (fields.length === 0) return null;
  values.push(logId);
  await run(
    `UPDATE rental_logs SET ${fields.join(', ')} WHERE log_ID = ?`,
    values
  );
  return get(`SELECT * FROM rental_logs WHERE log_ID = ?`, [logId]);
}

// 故障記錄操作
async function addBreakdownLog(log) {
  const columns = [];
  const placeholders = [];
  const values = [];
  for (const [key, value] of Object.entries(log)) {
    columns.push(key);
    placeholders.push('?');
    values.push(value);
  }
  const result = await run(
    `INSERT INTO breakdown_logs (${columns.join(',')}) VALUES (${placeholders.join(
      ','
    )})`,
    values
  );
  return { ...log, log_id: result.lastID };
}

async function getAllBreakdownLogs() {
  return all(`SELECT * FROM breakdown_logs`);
}

module.exports = {
  db,
  getUser,
  getAllUsers,
  getAllVehicles,
  addVehicle,
  updateVehicle,
  deleteVehicle,
  addRentalLog,
  getAllRentalLogs,
  getRentalLogById,
  updateRentalLog,
  addBreakdownLog,
  getAllBreakdownLogs,
};
