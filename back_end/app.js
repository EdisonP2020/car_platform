// 引入必要的模組
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fileUpload = require('express-fileupload');

// 初始化 Express 應用
const app = express();

// 設定中間件
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// 設定視圖引擎
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 創建上傳目錄
const uploadDir = path.join(__dirname, 'uploads');
const fs = require('fs');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 引入路由文件
const userRoutes = require('./routes/user');
const vehicleRoutes = require('./routes/vehicle');
const rentalRoutes = require('./routes/rental');

// 使用路由
app.use('/user', userRoutes);
app.use('/vehicles', vehicleRoutes);
app.use('/rentals', rentalRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 基本路由
app.get('/', (req, res) => {
  res.render('index', { title: '智慧車輛管理平台' });
});

// 配置文件上傳
app.use(fileUpload({
  createParentPath: true,
  limits: { 
    fileSize: 5 * 1024 * 1024 // 5MB 限制
  },
}));

// 儀表板路由
app.get('/dashboard', async (req, res) => {
  try {
    const db = require('./config/database');
    const vehicles = await db.getAllVehicles();
    const rentalLogs = await db.getAllRentalLogs();
    
    // 計算統計數據
    const availableVehicles = vehicles.filter(v => v.status === 'available').length;
    const rentedVehicles = vehicles.filter(v => v.status === 'rented').length;
    const brokenVehicles = vehicles.filter(v => v.status === 'broken').length;
    
    res.render('dashboard/index', {
      vehicleCount: vehicles.length,
      availableVehicles,
      rentedVehicles,
      brokenVehicles,
      recentLogs: rentalLogs.slice(-5)
    });
  } catch (err) {
    console.error('載入儀表板錯誤:', err);
    res.status(500).send('載入儀表板時發生錯誤');
  }
});

// 設定伺服器端口
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`伺服器運行於 http://localhost:${PORT}`);
});