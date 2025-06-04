const express = require('express');
const router = express.Router();
const db = require('../config/database');
const path = require('path');
const fs = require('fs').promises;

// 上傳目錄
const UPLOAD_DIR = path.join(__dirname, '../uploads');

// 確保上傳目錄存在
async function ensureUploadDir() {
  try {
    await fs.access(UPLOAD_DIR);
  } catch (err) {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    console.log('創建上傳目錄:', UPLOAD_DIR);
  }
}

// 初始化
ensureUploadDir().catch(console.error);

// 獲取所有租借記錄
router.get('/', async (req, res) => {
  try {
    const rentalLogs = await db.getAllRentalLogs();
    const vehicles = await db.getAllVehicles();
    const users = await db.getAllUsers();
    
    // 組合數據以便在視圖中顯示
    const enrichedLogs = rentalLogs.map(log => {
      const vehicle = vehicles.find(v => v.license_plate === log.vehicle_id) || {};
      const user = users.find(u => u.userID === log.user_id) || {};
      
      return {
        ...log,
        vehiclePlate: vehicle.license_plate || '未知車輛',
        userName: user.name || '未知用戶',
        rentTime: log.rent_time ? new Date(log.rent_time).toLocaleString() : '未記錄',
        returnTime: log.return_time ? new Date(log.return_time).toLocaleString() : '尚未歸還',
        mileageDiff: log.mileage_after_driving && log.mileage_before_driving 
          ? log.mileage_after_driving - log.mileage_before_driving 
          : '未知',
        status: log.return_time ? '已歸還' : '借用中'
      };
    });
    
    res.render('dashboard/rentals', { 
      rentalLogs: enrichedLogs,
      vehicles: vehicles,
      users: users
    });
  } catch (err) {
    console.error('獲取租借記錄錯誤:', err);
    res.status(500).send('伺服器錯誤');
  }
});

// 借車頁面
router.get('/borrow', async (req, res) => {
  try {
    const vehicles = await db.getAllVehicles();
    const users = await db.getAllUsers();
    
    // 只顯示可用的車輛
    const availableVehicles = vehicles.filter(v => v.status === 'available');
    
    res.render('dashboard/borrow', { 
      vehicles: availableVehicles,
      users: users
    });
  } catch (err) {
    console.error('獲取借車頁面錯誤:', err);
    res.status(500).send('伺服器錯誤');
  }
});

// 處理借車請求
router.post('/borrow', async (req, res) => {
  try {
    const { vehicle_id, user_id, mileage_before_driving, oil_before } = req.body;
    const wantsJson = req.is('application/json') || (req.headers.accept && req.headers.accept.includes('application/json'));
    
    // 創建租借記錄
    const rentalLog = {
      vehicle_id,
      user_id: parseInt(user_id),
      mileage_before_driving: parseInt(mileage_before_driving),
      rent_time: new Date().toISOString(),
      oil_before,
      // 這些欄位將在歸還時填寫
      mileage_after_driving: null,
      return_time: null,
      oil_after: null
    };
    
    // 如果有照片上傳，處理照片
    if (req.files && req.files.mileage_before_photo) {
      const photoFile = req.files.mileage_before_photo;
      const fileName = `before_${vehicle_id}_${Date.now()}${path.extname(photoFile.name)}`;
      
      // 保存文件
      await photoFile.mv(path.join(UPLOAD_DIR, fileName));
      rentalLog.mileage_before_photo_path = `/uploads/${fileName}`;
    }
    
    // 保存租借記錄
    const savedLog = await db.addRentalLog(rentalLog);
    
    // 更新車輛狀態為借出
    await db.updateVehicle(vehicle_id, { status: 'rented' });

    if (wantsJson) {
      res.json({ success: true, log: savedLog });
    } else {
      // 重定向到租借記錄頁面
      res.redirect('/rentals');
    }
  } catch (err) {
    console.error('處理借車請求錯誤:', err);
    res.status(500).send('伺服器錯誤');
  }
});

// 歸還頁面
router.get('/return/:id', async (req, res) => {
  try {
    const logId = parseInt(req.params.id);
    const log = await db.getRentalLogById(logId);
    
    if (!log) {
      return res.status(404).send('找不到租借記錄');
    }
    
    if (log.return_time) {
      return res.status(400).send('此車輛已歸還');
    }
    
    const vehicles = await db.getAllVehicles();
    const users = await db.getAllUsers();
    
    const vehicle = vehicles.find(v => v.license_plate === log.vehicle_id);
    const user = users.find(u => u.userID === log.user_id);
    
    res.render('dashboard/return', { 
      log,
      vehicle,
      user
    });
  } catch (err) {
    console.error('獲取歸還頁面錯誤:', err);
    res.status(500).send('伺服器錯誤');
  }
});

// 處理歸還請求
router.post('/return/:id', async (req, res) => {
  try {
    const logId = parseInt(req.params.id);
    const { mileage_after_driving, oil_after } = req.body;
    
    const wantsJson = req.is('application/json') || (req.headers.accept && req.headers.accept.includes('application/json'));
    const log = await db.getRentalLogById(logId);

    if (!log) {
      return res.status(404).send('找不到租借記錄');
    }
    
    // 更新租借記錄
    const updates = {
      mileage_after_driving: parseInt(mileage_after_driving),
      oil_after,
      return_time: new Date().toISOString()
    };
    
    // 如果有照片上傳，處理照片
    if (req.files && req.files.mileage_after_photo) {
      const photoFile = req.files.mileage_after_photo;
      const fileName = `after_${log.vehicle_id}_${Date.now()}${path.extname(photoFile.name)}`;
      
      // 保存文件
      await photoFile.mv(path.join(UPLOAD_DIR, fileName));
      updates.mileage_after_photo_path = `/uploads/${fileName}`;
    }

    // 更新數據庫
    const updatedLog = await db.updateRentalLog(logId, updates);
    
    // 更新車輛狀態為可用，並更新里程數
    await db.updateVehicle(log.vehicle_id, { 
      status: 'available',
      mileage: parseInt(mileage_after_driving),
      low_oil_volume: oil_after === 'low'
    });
    
    if (wantsJson) {
      res.json({ success: true, log: updatedLog });
    } else {
      // 重定向到租借記錄頁面
      res.redirect('/rentals');
    }
  } catch (err) {
    console.error('處理歸還請求錯誤:', err);
    res.status(500).send('伺服器錯誤');
  }
});

// 透過 vehicle_id 歸還車輛的 API
router.post('/return', async (req, res) => {
  try {
    const { vehicle_id, mileage_after_driving, oil_after } = req.body;

    const log = await db.getActiveRentalLogByVehicle(vehicle_id);

    if (!log) {
      return res.status(404).json({ error: '找不到未歸還的租借記錄' });
    }

    const updates = {
      mileage_after_driving: parseInt(mileage_after_driving),
      oil_after,
      return_time: new Date().toISOString(),
    };

    const updatedLog = await db.updateRentalLog(log.log_ID, updates);

    await db.updateVehicle(vehicle_id, {
      status: 'available',
      mileage: parseInt(mileage_after_driving),
      low_oil_volume: oil_after === 'low',
    });

    res.json({ success: true, log: updatedLog });
  } catch (err) {
    console.error('處理歸還請求錯誤:', err);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

// 查看詳情
router.get('/detail/:id', async (req, res) => {
  try {
    const logId = parseInt(req.params.id);
    const log = await db.getRentalLogById(logId);
    
    if (!log) {
      return res.status(404).send('找不到租借記錄');
    }
    
    const vehicles = await db.getAllVehicles();
    const users = await db.getAllUsers();
    
    const vehicle = vehicles.find(v => v.license_plate === log.vehicle_id);
    const user = users.find(u => u.userID === log.user_id);
    
    res.render('dashboard/rental-detail', { 
      log,
      vehicle,
      user
    });
  } catch (err) {
    console.error('獲取詳情頁面錯誤:', err);
    res.status(500).send('伺服器錯誤');
  }
});

module.exports = router;