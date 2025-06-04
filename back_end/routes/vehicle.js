const express = require('express');
const router = express.Router();
const db = require('../config/database');

// 獲取所有車輛
router.get('/', async (req, res) => {
  try {
    const vehicles = await db.getAllVehicles();
    res.render('dashboard/vehicles', { vehicles });
  } catch (err) {
    console.error('獲取車輛列表錯誤:', err);
    res.status(500).send('伺服器錯誤');
  }
});

// 處理新增車輛請求
router.post('/add', async (req, res) => {
  try {
    const { license_plate, mileage, last_maintenance_date, status } = req.body;
    
    const newVehicle = {
      license_plate,
      mileage: parseInt(mileage),
      low_oil_volume: false,
      warning_light: false,
      status: status || 'available',
      last_maintenance_date,
      last_maintainance_mileage: parseInt(mileage)
    };
    
    await db.addVehicle(newVehicle);
    res.redirect('/vehicles');
  } catch (err) {
    console.error('新增車輛錯誤:', err);
    res.status(500).send('伺服器錯誤');
  }
});

module.exports = router;