import React, { useState, useEffect } from 'react';
import { Camera, Check, ArrowLeft, AlertTriangle, Car, Clock } from 'lucide-react';
import './VehicleManagementApp.css';

// 模擬登入後的用戶資訊
const USER_DATA = {
  userID: 1,
  name: "王小明",
  isAdmin: false
};

const VehicleManagementApp = () => {
  // 使用常量用戶資訊
  const currentUser = USER_DATA;

  // 狀態管理
  const [currentPage, setCurrentPage] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [mileage, setMileage] = useState('');
  const [photoTaken, setPhotoTaken] = useState(false);
  const [oilLevel, setOilLevel] = useState('mid');
  const [hasIssues, setHasIssues] = useState(false);
  const [issueDescription, setIssueDescription] = useState('');
  const [issueType, setIssueType] = useState([]);
  const [currentVehicle, setCurrentVehicle] = useState(null);
  const [countdown, setCountdown] = useState(5);
  const [animationType, setAnimationType] = useState('rent');
  const [cameraActive, setCameraActive] = useState(false);
  const [errors, setErrors] = useState({});
  const [showErrorMessage, setShowErrorMessage] = useState(false);

  // 異常類型選項
  const issueOptions = [
    { id: 'light', label: '燈號異常' },
    { id: 'brake', label: '剎車問題' },
    { id: 'engine', label: '引擎異常' },
    { id: 'tire', label: '輪胎問題' },
    { id: 'other', label: '其他問題' }
  ];

  // 倒數計時效果
  useEffect(() => {
    if (currentPage === 'successAnimation' && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else if (currentPage === 'successAnimation' && countdown === 0) {
      setCurrentPage('scanQR');
    }
  }, [countdown, currentPage]);

  // 模擬掃描QR Code後取得的車輛資訊
  const handleQRScan = () => {
    // 模擬QR碼掃描結果
    setCurrentVehicle({
      license_plate: "ABC-1234",
      mileage: 45689,
      status: "available",
      last_maintenance_date: "2025-04-15"
    });
    // 直接進入借車介面
    setCurrentPage('rentCar');
  };
  
  // 自動掃描QR Code (演示用)
  useEffect(() => {
    if (currentPage === 'cameraOpen' && cameraActive) {
      // 模擬掃描時間，真實情況會是偵測到QR碼時觸發
      const scanTimer = setTimeout(() => {
        handleQRScan();
      }, 2000);
      
      return () => clearTimeout(scanTimer);
    } else if (currentPage === 'cameraOpen' && !cameraActive) {
      setCameraActive(true);
    }
  }, [currentPage, cameraActive]);
  
  // 模擬拍照功能
  const takeMileagePhoto = () => {
    setPhotoTaken(true);
  };
  
  // 處理異常類型選擇
  const handleIssueChange = (id) => {
    if (issueType.includes(id)) {
      setIssueType(issueType.filter(type => type !== id));
    } else {
      setIssueType([...issueType, id]);
    }
  };
  
  // 重置表單
  const resetForm = () => {
    setMileage('');
    setPhotoTaken(false);
    setOilLevel('mid');
    setHasIssues(false);
    setIssueDescription('');
    setIssueType([]);
    setCurrentVehicle(null);
    setErrors({});
    setShowErrorMessage(false);
  };
  
  // 處理借車提交
  const handleRentSubmit = () => {
    // 初始化錯誤物件
    const newErrors = {};
    
    // 驗證里程數
    if (!mileage) {
      newErrors.mileage = "請輸入當前里程數";
    }
    
    // 驗證照片
    if (!photoTaken) {
      newErrors.photo = "請拍攝里程表照片";
    }
    
    // 驗證異常描述
    if (hasIssues && !issueDescription) {
      newErrors.issueDescription = "請填寫異常描述";
    }
    
    // 設置錯誤狀態
    setErrors(newErrors);
    
    // 如果有錯誤，顯示提示並阻止提交
    if (Object.keys(newErrors).length > 0) {
      setShowErrorMessage(true);
      // 3秒後自動隱藏錯誤訊息
      setTimeout(() => {
        setShowErrorMessage(false);
      }, 3000);
      return;
    }
    
    // 這裡會有API呼叫來將數據提交到後端
    console.log("借車資訊提交:", {
      vehicle_id: currentVehicle?.license_plate,
      user_id: USER_DATA.userID,
      mileage_before_driving: parseInt(mileage),
      oil_before: oilLevel,
      rent_time: new Date(),
      has_issues: hasIssues,
      issue_description: issueDescription,
      issue_type: issueType
    });
    
    // 借車成功，顯示成功動畫
    setAnimationType('rent');
    setCurrentPage('successAnimation');
    setCountdown(5);
    resetForm();
  };
  
  // 處理還車提交
  const handleReturnSubmit = () => {
    // 初始化錯誤物件
    const newErrors = {};
    
    // 驗證里程數
    if (!mileage) {
      newErrors.mileage = "請輸入當前里程數";
    }
    
    // 驗證照片
    if (!photoTaken) {
      newErrors.photo = "請拍攝里程表照片";
    }
    
    // 驗證異常描述
    if (hasIssues && !issueDescription) {
      newErrors.issueDescription = "請填寫異常描述";
    }
    
    // 設置錯誤狀態
    setErrors(newErrors);
    
    // 如果有錯誤，顯示提示並阻止提交
    if (Object.keys(newErrors).length > 0) {
      setShowErrorMessage(true);
      // 3秒後自動隱藏錯誤訊息
      setTimeout(() => {
        setShowErrorMessage(false);
      }, 3000);
      return;
    }
    
    // 這裡會有API呼叫來將數據提交到後端
    console.log("還車資訊提交:", {
      vehicle_id: currentVehicle?.license_plate,
      user_id: USER_DATA.userID,
      mileage_after_driving: parseInt(mileage),
      oil_after: oilLevel,
      return_time: new Date(),
      has_issues: hasIssues,
      issue_description: issueDescription,
      issue_type: issueType
    });
    
    // 還車成功，顯示成功動畫
    setAnimationType('return');
    setCurrentPage('successAnimation');
    setCountdown(5);
    resetForm();
  };
  
  // 模擬登入功能
  const handleLogin = () => {
    // 在演示版本中，直接允許登入而不檢查憑證
    console.log("登入嘗試 - 用戶名:", username, "密碼:", password);
    // 不再跳轉到掃描頁面，而是直接模擬相機開啟狀態
    setCurrentPage('cameraOpen');
  };

  // 錯誤訊息組件
  const ErrorMessage = ({ message }) => (
    <div className="bg-red-500 text-white py-3 px-4 rounded-md fixed top-4 left-1/2 transform -translate-x-1/2 shadow-lg z-50 animate-fadeIn">
      <div className="flex items-center space-x-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        <span>{message}</span>
      </div>
    </div>
  );
  
  // 渲染登入頁面
  const renderLoginPage = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-blue-600 mb-6">博幼基金會智慧車輛管理平台</h1>
        <div className="space-y-6">
          <div>
            <label className="block text-gray-700 mb-2">使用者帳號</label>
            <input 
              type="text"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="請輸入帳號"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">密碼</label>
            <input 
              type="password"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="請輸入密碼"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            onClick={handleLogin}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition duration-300"
          >
            登入
          </button>
        </div>
      </div>
    </div>
  );
  
  // 渲染QR碼掃描頁面
  const renderScanQRPage = () => (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold text-blue-600">車輛借用系統</h1>
          <span className="text-gray-600">您好，{USER_DATA.name}</span>
        </div>
        
        <div className="text-center mb-8">
          <p className="text-gray-700 mb-4">請掃描車輛QR碼進行借用</p>
          <div className="border-2 border-dashed border-gray-300 p-8 rounded-lg mb-4 flex items-center justify-center bg-gray-50">
            <Camera size={64} className="text-gray-400" />
          </div>
          <button
            onClick={handleQRScan}
            className="bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-md transition duration-300 w-full"
          >
            開始掃描QR碼
          </button>
        </div>
        
        <div className="mt-8 text-center">
          <button
            onClick={() => setCurrentPage('returnCar')}
            className="bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-md transition duration-300 w-full"
          >
            進入還車介面
          </button>
        </div>
      </div>
    </div>
  );

  const renderCameraPage = () => (
  <div className="flex flex-col items-center min-h-screen bg-gradient-to-b from-blue-600 to-blue-800">
    <div className="w-full px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={() => setCurrentPage('scanQR')}
          className="text-white p-2 rounded-full bg-blue-500 bg-opacity-30"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-white">車輛掃描</h1>
        <div className="w-10"></div> {/* 保持標題居中的空白元素 */}
      </div>
      
      {/* 使用者資訊卡片 */}
      <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-xl p-4 mb-6 shadow-lg">
        <div className="flex items-center">
          <div className="w-12 h-12 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold text-xl">
            {USER_DATA.name.charAt(0)}
          </div>
          <div className="ml-4">
            <p className="text-white font-medium">{USER_DATA.name}</p>
            <p className="text-blue-100 text-sm">準備借用車輛</p>
          </div>
        </div>
      </div>
      
      {/* 相機視窗 - 修正綠框居中問題 */}
      <div className="relative rounded-2xl overflow-hidden shadow-xl bg-black mx-auto mb-8" style={{aspectRatio: '1/1', maxWidth: '340px'}}>
        {/* 相機畫面 */}
        <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
          <Camera size={50} className="text-white opacity-20" />
        </div>
        
        {/* QR碼框架 - 修正對齊問題 */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* 外框白色框 */}
          <div className="relative w-56 h-56">
            <div className="absolute inset-0 border-2 border-white opacity-70 rounded-lg"></div>
            
            {/* 中間綠色掃描線 */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-green-500 animate-scan"></div>
            
            {/* 中間綠色框 - 確保完全居中 */}
            <div className="absolute top-1/2 left-1/2 w-28 h-28 -translate-x-1/2 -translate-y-1/2 border-2 border-green-500 rounded-sm"></div>
          </div>
        </div>
        
        {/* 四個角框 */}
        <div className="absolute top-4 left-4 w-10 h-10 border-t-4 border-l-4 border-white rounded-tl-lg"></div>
        <div className="absolute top-4 right-4 w-10 h-10 border-t-4 border-r-4 border-white rounded-tr-lg"></div>
        <div className="absolute bottom-4 left-4 w-10 h-10 border-b-4 border-l-4 border-white rounded-bl-lg"></div>
        <div className="absolute bottom-4 right-4 w-10 h-10 border-b-4 border-r-4 border-white rounded-br-lg"></div>
      </div>
      
      {/* 說明文字 */}
      <div className="text-center mb-8">
        <h3 className="text-white text-lg font-semibold mb-2">請掃描車輛QR碼</h3>
        <p className="text-blue-100 px-6">將相機對準車輛上的QR碼，系統將自動識別並進入借車流程</p>
      </div>
      
      {/* 提示卡片 */}
      <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-5 shadow-lg">
        <div className="flex items-start">
          <div className="mt-1 mr-4 p-2 rounded-full bg-blue-500 bg-opacity-30">
            <AlertTriangle size={20} className="text-white" />
          </div>
          <div>
            <h4 className="text-white font-medium mb-1">使用提示</h4>
            <p className="text-blue-100 text-sm">確保QR碼清晰可見，避免反光或陰影。若掃描不成功，可稍微調整距離或角度後重試。</p>
          </div>
        </div>
      </div>
    </div>

    {/* 添加自定義動畫樣式 */}
    <style jsx>{`
      @keyframes scan {
        0% {
          top: 0;
        }
        50% {
          top: 100%;
        }
        100% {
          top: 0;
        }
      }
      .animate-scan {
        animation: scan 2s linear infinite;
      }
    `}</style>
  </div>
);
  
  // 渲染借車介面
  const renderRentCarPage = () => (
  <div className="flex flex-col min-h-screen bg-gray-100 p-4">
    {showErrorMessage && (
      <ErrorMessage message={Object.values(errors).join('、')} />
    )}
    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md mx-auto">
      <div className="flex items-center mb-6">
        <button onClick={() => setCurrentPage('scanQR')} className="mr-2">
          <ArrowLeft size={24} className="text-gray-700" />
        </button>
        <h1 className="text-xl font-bold text-blue-600">借車介面</h1>
      </div>
      
      <div className="mb-6">
        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <h2 className="text-lg font-semibold text-blue-700 mb-2">車輛資訊</h2>
          {currentVehicle && (
            <div className="space-y-2">
              <p className="text-gray-700"><span className="font-medium">車牌號碼:</span> {currentVehicle.license_plate}</p>
              <p className="text-gray-700"><span className="font-medium">上次保養日期:</span> {currentVehicle.last_maintenance_date}</p>
              <p className="text-gray-700"><span className="font-medium">狀態:</span> {currentVehicle.status === 'available' ? '可使用' : '不可使用'}</p>
            </div>
          )}
        </div>
        
        <div className="space-y-6">
          <div>
            <label className="block text-gray-700 mb-2 font-medium">當前里程數 (公里) <span className="text-red-500">*</span></label>
            <input
              type="number"
              value={mileage}
              onChange={(e) => setMileage(e.target.value)}
              className={`w-full px-4 py-2 border ${errors.mileage ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="請輸入當前里程數"
            />
            {errors.mileage && <p className="text-red-500 text-sm mt-1">{errors.mileage}</p>}
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2 font-medium">里程表照片 <span className="text-red-500">*</span></label>
            <div className={`border-2 ${errors.photo ? 'border-red-500' : photoTaken ? 'border-green-300 bg-green-50' : 'border-dashed border-gray-300 bg-gray-50'} p-4 rounded-lg flex flex-col items-center justify-center min-h-[150px]`}>
              {photoTaken ? (
                <div className="flex flex-col items-center">
                  <Check size={40} className="text-green-500 mb-2" />
                  <p className="text-green-600">照片已上傳</p>
                  <button 
                    onClick={() => setPhotoTaken(false)}
                    className="mt-2 text-blue-500 hover:text-blue-700"
                  >
                    重新拍攝
                  </button>
                </div>
              ) : (
                <button
                  onClick={takeMileagePhoto}
                  className="flex flex-col items-center"
                >
                  <Camera size={40} className="text-gray-400 mb-2" />
                  <p className="text-gray-500">點擊拍攝里程表照片</p>
                </button>
              )}
            </div>
            {errors.photo && <p className="text-red-500 text-sm mt-1">{errors.photo}</p>}
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2 font-medium">油量</label>
            <div className="flex space-x-2">
              <button
                onClick={() => setOilLevel('low')}
                className={`flex-1 py-2 px-4 rounded-md transition duration-200 ${oilLevel === 'low' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                低
              </button>
              <button
                onClick={() => setOilLevel('mid')}
                className={`flex-1 py-2 px-4 rounded-md transition duration-200 ${oilLevel === 'mid' ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                中
              </button>
              <button
                onClick={() => setOilLevel('high')}
                className={`flex-1 py-2 px-4 rounded-md transition duration-200 ${oilLevel === 'high' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                高
              </button>
            </div>
          </div>
          
          <div>
            <div className="flex mb-2">
              <div className="flex-none w-6">
                <input
                  type="checkbox"
                  id="hasIssues"
                  checked={hasIssues}
                  onChange={() => {
                    setHasIssues(!hasIssues);
                    if (!hasIssues) {
                      setIssueDescription('');
                      setIssueType([]);
                    }
                  }}
                  className="mt-1"
                />
              </div>
              <label htmlFor="hasIssues" className="text-gray-700 font-medium flex items-center">
                <AlertTriangle size={16} className="text-yellow-500 mr-1" />
                車輛有異常狀況
              </label>
            </div>
            
            {hasIssues && (
              <div className="ml-6 space-y-4 mt-2 p-4 bg-yellow-50 rounded-lg">
                <div>
                  <label className="block text-gray-700 mb-2">異常類型 (可複選)</label>
                  <div className="space-y-2">
                    {issueOptions.map(option => (
                      <div key={option.id} className="flex">
                        <div className="flex-none w-6">
                          <input
                            type="checkbox"
                            id={option.id}
                            checked={issueType.includes(option.id)}
                            onChange={() => handleIssueChange(option.id)}
                            className="mt-1"
                          />
                        </div>
                        <label htmlFor={option.id} className="text-gray-700">{option.label}</label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-2">
                    異常描述 {hasIssues && <span className="text-red-500">*</span>}
                  </label>
                  <textarea
                    value={issueDescription}
                    onChange={(e) => setIssueDescription(e.target.value)}
                    className={`w-full px-4 py-2 border ${errors.issueDescription ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="請描述異常狀況"
                    rows={3}
                  />
                  {errors.issueDescription && (
                    <p className="text-red-500 text-sm mt-1">{errors.issueDescription}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-2">異常狀況照片 (選填)</label>
                  <div className="border-2 border-dashed border-gray-300 p-4 rounded-lg flex flex-col items-center justify-center min-h-[100px] bg-gray-50">
                    <button className="flex flex-col items-center">
                      <Camera size={32} className="text-gray-400 mb-1" />
                      <p className="text-gray-500 text-sm">點擊拍攝異常照片</p>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <button
        onClick={handleRentSubmit}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition duration-300 font-medium"
      >
        確認借車
      </button>
    </div>
  </div>
);
  
  // 渲染還車介面
  const renderReturnCarPage = () => (
  <div className="flex flex-col min-h-screen bg-gray-100 p-4">
    {showErrorMessage && (
      <ErrorMessage message={Object.values(errors).join('、')} />
    )}
    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md mx-auto">
      <div className="flex items-center mb-6">
        <button onClick={() => setCurrentPage('scanQR')} className="mr-2">
          <ArrowLeft size={24} className="text-gray-700" />
        </button>
        <h1 className="text-xl font-bold text-green-600">還車介面</h1>
      </div>
      
      <div className="bg-green-50 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold text-green-700 mb-2">選擇要歸還的車輛</h2>
        <select
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          onChange={(e) => {
            if (e.target.value !== "") {
              setCurrentVehicle({
                license_plate: e.target.value,
                mileage: 45689,
                status: "rented",
                last_maintenance_date: "2025-04-15"
              });
            } else {
              setCurrentVehicle(null);
            }
          }}
        >
          <option value="">選擇車輛</option>
          <option value="ABC-1234">ABC-1234</option>
          <option value="DEF-5678">DEF-5678</option>
        </select>
      </div>
      
      {currentVehicle && (
        <div className="space-y-6">
          <div>
            <label className="block text-gray-700 mb-2 font-medium">歸還里程數 (公里) <span className="text-red-500">*</span></label>
            <input
              type="number"
              value={mileage}
              onChange={(e) => setMileage(e.target.value)}
              className={`w-full px-4 py-2 border ${errors.mileage ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-green-500`}
              placeholder="請輸入當前里程數"
            />
            {errors.mileage && <p className="text-red-500 text-sm mt-1">{errors.mileage}</p>}
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2 font-medium">里程表照片 <span className="text-red-500">*</span></label>
            <div className={`border-2 ${errors.photo ? 'border-red-500' : photoTaken ? 'border-green-300 bg-green-50' : 'border-dashed border-gray-300 bg-gray-50'} p-4 rounded-lg flex flex-col items-center justify-center min-h-[150px]`}>
              {photoTaken ? (
                <div className="flex flex-col items-center">
                  <Check size={40} className="text-green-500 mb-2" />
                  <p className="text-green-600">照片已上傳</p>
                  <button 
                    onClick={() => setPhotoTaken(false)}
                    className="mt-2 text-blue-500 hover:text-blue-700"
                  >
                    重新拍攝
                  </button>
                </div>
              ) : (
                <button
                  onClick={takeMileagePhoto}
                  className="flex flex-col items-center"
                >
                  <Camera size={40} className="text-gray-400 mb-2" />
                  <p className="text-gray-500">點擊拍攝里程表照片</p>
                </button>
              )}
            </div>
            {errors.photo && <p className="text-red-500 text-sm mt-1">{errors.photo}</p>}
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2 font-medium">油量</label>
            <div className="flex space-x-2">
              <button
                onClick={() => setOilLevel('low')}
                className={`flex-1 py-2 px-4 rounded-md transition duration-200 ${oilLevel === 'low' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                低
              </button>
              <button
                onClick={() => setOilLevel('mid')}
                className={`flex-1 py-2 px-4 rounded-md transition duration-200 ${oilLevel === 'mid' ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                中
              </button>
              <button
                onClick={() => setOilLevel('high')}
                className={`flex-1 py-2 px-4 rounded-md transition duration-200 ${oilLevel === 'high' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                高
              </button>
            </div>
          </div>
          
          <div>
            <div className="flex mb-2">
              <div className="flex-none w-6">
                <input
                  type="checkbox"
                  id="hasIssuesReturn"
                  checked={hasIssues}
                  onChange={() => {
                    setHasIssues(!hasIssues);
                    if (!hasIssues) {
                      setIssueDescription('');
                      setIssueType([]);
                    }
                  }}
                  className="mt-1"
                />
              </div>
              <label htmlFor="hasIssuesReturn" className="text-gray-700 font-medium flex items-center">
                <AlertTriangle size={16} className="text-yellow-500 mr-1" />
                使用中發現異常狀況
              </label>
            </div>
            
            {hasIssues && (
              <div className="ml-6 space-y-4 mt-2 p-4 bg-yellow-50 rounded-lg">
                <div>
                  <label className="block text-gray-700 mb-2">異常類型 (可複選)</label>
                  <div className="space-y-2">
                    {issueOptions.map(option => (
                      <div key={`return-${option.id}`} className="flex">
                        <div className="flex-none w-6">
                          <input
                            type="checkbox"
                            id={`return-${option.id}`}
                            checked={issueType.includes(option.id)}
                            onChange={() => handleIssueChange(option.id)}
                            className="mt-1"
                          />
                        </div>
                        <label htmlFor={`return-${option.id}`} className="text-gray-700">{option.label}</label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-2">
                    異常描述 {hasIssues && <span className="text-red-500">*</span>}
                  </label>
                  <textarea
                    value={issueDescription}
                    onChange={(e) => setIssueDescription(e.target.value)}
                    className={`w-full px-4 py-2 border ${errors.issueDescription ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="請描述異常狀況"
                    rows={3}
                  />
                  {errors.issueDescription && (
                    <p className="text-red-500 text-sm mt-1">{errors.issueDescription}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-2">異常狀況照片 (選填)</label>
                  <div className="border-2 border-dashed border-gray-300 p-4 rounded-lg flex flex-col items-center justify-center min-h-[100px] bg-gray-50">
                    <button className="flex flex-col items-center">
                      <Camera size={32} className="text-gray-400 mb-1" />
                      <p className="text-gray-500 text-sm">點擊拍攝異常照片</p>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <button
            onClick={handleReturnSubmit}
            className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md transition duration-300 font-medium"
          >
            確認還車
          </button>
        </div>
      )}
    </div>
  </div>
);

  // 成功動畫頁面
  const renderSuccessAnimation = () => (
    <div 
      className="flex flex-col items-center justify-center min-h-screen bg-green-50 p-4"
      onClick={() => setCurrentPage('scanQR')}
    >
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-32 h-32 mb-4">
            <div className="absolute w-full h-full flex items-center justify-center">
              <Car size={80} className="text-blue-500" />
            </div>
            <div className="absolute w-full h-full flex items-center justify-center">
              {/* 笑臉表情 */}
              <div className="relative w-24 h-24">
                <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-black"></div>
                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black"></div>
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-12 h-8 border-b-4 border-black rounded-full"></div>
              </div>
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-green-600 mb-2">
            {animationType === 'return' ? '還車成功!' : '借車成功!'}
          </h1>
          <p className="text-gray-600">
            {animationType === 'return' ? '感謝您的使用!' : '祝您行車安全!'}
          </p>
        </div>
        
        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center justify-center space-x-2">
            <Clock size={20} className="text-gray-500" />
            <p className="text-gray-500">
              {countdown} 秒後自動返回主畫面
            </p>
          </div>
          <p className="text-sm text-gray-400 mt-2">點擊螢幕任意處立即返回</p>
        </div>
      </div>
    </div>
  );
  
  // 根據當前頁面狀態顯示相應組件
  const renderPage = () => {
    switch (currentPage) {
      case 'login':
        return renderLoginPage();
      case 'scanQR':
        return renderScanQRPage();
      case 'cameraOpen':
        return renderCameraPage();
      case 'rentCar':
        return renderRentCarPage();
      case 'returnCar':
        return renderReturnCarPage();
      case 'successAnimation':
        return renderSuccessAnimation();
      default:
        return renderLoginPage();
    }
  };
  
  return (
    <div className="bg-gray-100 min-h-screen">
      {renderPage()}
    </div>
  );
};

export default VehicleManagementApp;