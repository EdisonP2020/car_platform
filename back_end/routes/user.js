const express = require('express');
const router = express.Router();
const db = require('../config/database');

// 登入頁面
router.get('/login', (req, res) => {
  res.render('user/login', { title: '使用者登入' });
});

// 處理登入請求
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  console.log('登入嘗試:', username, password);
  
  try {
    const user = await db.getUser(username, password);
    
    if (!user) {
      console.log('登入失敗:用戶不存在或密碼錯誤');
      return res.render('user/login', { 
        title: '使用者登入',
        error: '使用者名稱或密碼不正確'
      });
    }
    
    console.log('登入成功:', user);
    // 成功登入，重定向到儀表板
    res.redirect('/dashboard');
  } catch (err) {
    console.error('登入處理錯誤:', err);
    res.status(500).send('伺服器錯誤');
  }
});

// 登出路由
router.get('/logout', (req, res) => {
  res.redirect('/');
});

module.exports = router;