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

module.exports = db;