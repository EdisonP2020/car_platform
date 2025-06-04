// create-user.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const db = new sqlite3.Database(path.join(__dirname, 'database.sqlite'));

// 創建用戶表（如果不存在）
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    userID INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(50) NOT NULL,
    password TEXT NOT NULL,
    phone_num VARCHAR(50),
    isAdmin BOOLEAN DEFAULT 0
  )`);
  
  // 插入管理員用戶
  db.run(`INSERT INTO users (name, password, phone_num, isAdmin) 
          VALUES (?, ?, ?, ?)`, 
    ['admin', 'admin123', '0912345678', 1], 
    function(err) {
      if (err) {
        return console.error('無法創建管理員帳號:', err.message);
      }
      console.log('管理員帳號已創建，ID:', this.lastID);
    }
  );
  
  // 插入普通用戶
  db.run(`INSERT INTO users (name, password, phone_num, isAdmin) 
          VALUES (?, ?, ?, ?)`, 
    ['user', 'user123', '0987654321', 0], 
    function(err) {
      if (err) {
        return console.error('無法創建普通用戶帳號:', err.message);
      }
      console.log('普通用戶帳號已創建，ID:', this.lastID);
    }
  );
});

// 關閉數據庫連接
setTimeout(() => {
  db.close((err) => {
    if (err) {
      console.error('關閉數據庫時出錯:', err.message);
    } else {
      console.log('數據庫連接已關閉');
    }
  });
}, 1000);