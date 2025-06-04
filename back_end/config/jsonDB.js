const fs = require('fs').promises;
const path = require('path');

const dbPath = path.join(__dirname, '../database.json');

// 初始化數據庫
async function initDb() {
  try {
    await fs.access(dbPath);
    console.log('數據庫文件存在，跳過初始化');
  } catch (err) {
    console.log('創建新的數據庫文件...');
    const initialData = {
      users: [
        {
          userID: 1,
          name: 'admin',
          password: 'admin123',
          phone_num: '0912345678',
          isAdmin: true
        },
        {
          userID: 2,
          name: 'user',
          password: 'user123',
          phone_num: '0987654321',
          isAdmin: false
        }
      ],
      vehicles: [
        {
          license_plate: 'ABC-1234',
          mileage: 5000,
          low_oil_volume: false,
          warning_light: false,
          status: 'available',
          last_maintenance_date: '2025-04-01',
          last_maintainance_mileage: 4500
        }
      ],
      rental_logs: [],
      breakdown_logs: []
    };
    
    await fs.writeFile(dbPath, JSON.stringify(initialData, null, 2));
    console.log('數據庫文件已創建並初始化');
  }
}

// 讀取整個數據庫
async function readDb() {
  const data = await fs.readFile(dbPath, 'utf8');
  return JSON.parse(data);
}

// 寫入整個數據庫
async function writeDb(data) {
  await fs.writeFile(dbPath, JSON.stringify(data, null, 2));
}

// 用戶相關操作
async function getUser(username, password) {
  const db = await readDb();
  return db.users.find(user => 
    user.name === username && user.password === password);
}

async function getAllUsers() {
  const db = await readDb();
  return db.users;
}

// 車輛相關操作
async function getAllVehicles() {
  const db = await readDb();
  return db.vehicles;
}

async function addVehicle(vehicle) {
  const db = await readDb();
  db.vehicles.push(vehicle);
  await writeDb(db);
  return vehicle;
}

async function updateVehicle(licensePlate, updates) {
  const db = await readDb();
  const index = db.vehicles.findIndex(v => v.license_plate === licensePlate);
  
  if (index === -1) return null;
  
  db.vehicles[index] = { ...db.vehicles[index], ...updates };
  await writeDb(db);
  return db.vehicles[index];
}

async function deleteVehicle(licensePlate) {
  const db = await readDb();
  const index = db.vehicles.findIndex(v => v.license_plate === licensePlate);
  
  if (index === -1) return false;
  
  db.vehicles.splice(index, 1);
  await writeDb(db);
  return true;
}

// 租借記錄操作
async function addRentalLog(log) {
  const db = await readDb();
  const newLog = { ...log, log_ID: db.rental_logs.length + 1 };
  db.rental_logs.push(newLog);
  await writeDb(db);
  return newLog;
}

async function getAllRentalLogs() {
  const db = await readDb();
  return db.rental_logs;
}

// 故障記錄操作
async function addBreakdownLog(log) {
  const db = await readDb();
  const newLog = { ...log, log_id: db.breakdown_logs.length + 1 };
  db.breakdown_logs.push(newLog);
  await writeDb(db);
  return newLog;
}

async function getAllBreakdownLogs() {
  const db = await readDb();
  return db.breakdown_logs;
}

// 租借記錄操作
async function addRentalLog(log) {
  const db = await readDb();
  const newLogId = db.rental_logs.length > 0 
    ? Math.max(...db.rental_logs.map(l => l.log_ID)) + 1 
    : 1;
  
  const newLog = { ...log, log_ID: newLogId };
  db.rental_logs.push(newLog);
  await writeDb(db);
  return newLog;
}

async function getAllRentalLogs() {
  const db = await readDb();
  return db.rental_logs;
}

async function updateRentalLog(logId, updates) {
  const db = await readDb();
  const index = db.rental_logs.findIndex(l => l.log_ID === logId);
  
  if (index === -1) return null;
  
  db.rental_logs[index] = { ...db.rental_logs[index], ...updates };
  await writeDb(db);
  return db.rental_logs[index];
}

// 確保這些函數被導出
module.exports = {
  // ... 其他已有的導出函數
  addRentalLog,
  getAllRentalLogs,
  updateRentalLog,
};

// 初始化數據庫
initDb().catch(err => console.error('初始化數據庫錯誤:', err));

// 導出所有函數
module.exports = {
  getUser,
  getAllUsers,
  getAllVehicles,
  addVehicle,
  updateVehicle,
  deleteVehicle,
  addRentalLog,
  getAllRentalLogs,
  addBreakdownLog,
  getAllBreakdownLogs,
  readDb,
  writeDb
};