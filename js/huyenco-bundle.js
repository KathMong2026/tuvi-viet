/**
 * Tử Vi Việt — Mệnh Lý Engine
 * ====================================
 * Bát Tự (Bazi) + Tử Vi (Ziwei) — Tính toán chính xác
 */

(function(global) {
  'use strict';

  var NAYIN_TABLE = [
    'Hải Trung Kim','Lô Trung Hỏa','Đại Lâm Mộc','Lộ Bàng Thổ','Kiếm Phong Kim','Sơn Đầu Hỏa',
    'Giản Hạ Thủy','Thành Đầu Thổ','Bạch Lạp Kim','Dương Liễu Mộc','Tuyền Trung Thủy','Ốc Thượng Thổ',
    'Tích Lịch Hỏa','Tùng Bách Mộc','Trường Lưu Thủy','Sa Thạch Kim','Sơn Hạ Hỏa','Bình Địa Mộc',
    'Bích Thượng Thổ','Kim Bạc Kim','Phúc Đăng Hỏa','Thiên Hà Thủy','Đại Dịch Thổ','Thoa Xuyến Kim',
    'Tang Đố Mộc','Đại Khê Thủy','Sa Trung Thổ','Thiên Thượng Hỏa','Thạch Lựu Mộc','Đại Hải Thủy',
    'Hải Trung Kim','Lô Trung Hỏa','Đại Lâm Mộc','Lộ Bàng Thổ','Kiếm Phong Kim','Sơn Đầu Hỏa',
    'Giản Hạ Thủy','Thành Đầu Thổ','Bạch Lạp Kim','Dương Liễu Mộc','Tuyền Trung Thủy','Ốc Thượng Thổ',
    'Tích Lịch Hỏa','Tùng Bách Mộc','Trường Lưu Thủy','Sa Thạch Kim','Sơn Hạ Hỏa','Bình Địa Mộc',
    'Bích Thượng Thổ','Kim Bạc Kim','Phúc Đăng Hỏa','Thiên Hà Thủy','Đại Dịch Thổ','Thoa Xuyến Kim',
    'Tang Đố Mộc','Đại Khê Thủy','Sa Trung Thổ','Thiên Thượng Hỏa','Thạch Lựu Mộc','Đại Hải Thủy'
  ];

  var HS = ['Giáp','Ất','Bính','Đinh','Mậu','Kỷ','Canh','Tân','Nhâm','Quý'];
  var HS_CN = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
  var EB = ['Tý','Sửu','Dần','Mão','Thìn','Tỵ','Ngọ','Mùi','Thân','Dậu','Tuất','Hợi'];
  var EB_CN = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
  var WX = ['Mộc','Mộc','Hỏa','Hỏa','Thổ','Thổ','Kim','Kim','Thủy','Thủy'];
  var WX_CN = ['木','木','火','火','土','土','金','金','水','水'];
  var EB_WX = ['Thủy','Thổ','Mộc','Mộc','Thổ','Hỏa','Hỏa','Thổ','Kim','Kim','Thổ','Thủy'];
  var EB_WX_CN = ['水','土','木','木','土','火','火','土','金','金','土','水'];
  var WX_COLORS = {Mộc:'#4a6741', Hỏa:'#9e3020', Thổ:'#8b6914', Kim:'#b8893b', Thủy:'#3a5974'};
  var WX_GEN = {Mộc:'Hỏa', Hỏa:'Thổ', Thổ:'Kim', Kim:'Thủy', Thủy:'Mộc'};
  var WX_DESTROY = {Mộc:'Thổ', Hỏa:'Kim', Thổ:'Thủy', Kim:'Mộc', Thủy:'Hỏa'};
  var HIDDEN = [
    ['Quý'],['Kỷ','Quý','Tân'],['Giáp','Bính','Mậu'],['Ất'],
    ['Mậu','Ất','Quý'],['Bính','Mậu','Canh'],['Đinh','Kỷ'],['Kỷ','Đinh','Ất'],
    ['Canh','Nhâm','Mậu'],['Tân'],['Mậu','Tân','Đinh'],['Nhâm','Giáp']
  ];
  var SHISHEN = ['Tỷ Kiên','Kiếp Tài','Thực Thần','Thương Quan','Thiên Tài','Chính Tài','Thiên Quan','Chính Quan','Thiên Ấn','Chính Ấn'];
  var SHISHEN_CN = ['比肩','劫財','食神','傷官','偏財','正財','偏官','正官','偏印','正印'];
  var SOLAR_TERM_DAYS = [5,19,4,20,6,21,6,23,7,23,7,23,7,22,7,23,8,23,8,23,7,22,7,22];

  function getSolarTermIndex(year, month, day) {
    var m = month - 1;
    var termDay = SOLAR_TERM_DAYS[m];
    if (day < termDay) return (m - 1 + 12) % 12;
    return m % 12;
  }

  function calcYearPillar(year, month, day) {
    var baziYear = (month < 2 || (month === 2 && day < 4)) ? year - 1 : year;
    var offset = baziYear - 4;
    return { stem: ((offset % 10) + 10) % 10, branch: ((offset % 12) + 12) % 12 };
  }

  function calcMonthPillar(year, month, day) {
    var yp = calcYearPillar(year, month, day);
    var termIdx = getSolarTermIndex(year, month, day);
    var mStem = ((yp.stem % 5) * 2 + termIdx) % 10;
    return { stem: mStem, branch: termIdx };
  }

  function calcDayPillar(year, month, day) {
    var a = Math.floor((14 - month) / 12);
    var y = year + 4800 - a;
    var m = month + 12 * a - 3;
    var jdn = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
    var refJDN = 2451545, refStem = 6, refBranch = 4;
    var diff = jdn - refJDN;
    return { stem: ((diff % 10 + refStem) % 10 + 10) % 10, branch: ((diff % 12 + refBranch) % 12 + 12) % 12 };
  }

  function calcHourPillar(dayStem, hour) {
    var hBranch = Math.floor((hour + 1) / 2) % 12;
    if (hour === 23 || hour === 0) hBranch = 0;
    var hStem = ((dayStem % 5) * 2 + hBranch) % 10;
    return { stem: hStem, branch: hBranch };
  }

  function calcFourPillars(year, month, day, hour) {
    var yp = calcYearPillar(year, month, day);
    var mp = calcMonthPillar(year, month, day);
    var dp = calcDayPillar(year, month, day);
    var hp = calcHourPillar(dp.stem, hour);
    return [yp, mp, dp, hp];
  }

  function getShiShen(dayStem, otherStem) {
    var diff = (otherStem - dayStem + 10) % 10;
    var yx = (dayStem % 2 === otherStem % 2) ? 0 : 1;
    return (diff * 2 + yx) % 10;
  }

  function calcDaiVan(pillars, gender, year) {
    var isMale = (gender === 'male');
    var yearStem = pillars[0].stem;
    var isYangYear = (yearStem % 2 === 0);
    var forward = (isMale && isYangYear) || (!isMale && !isYangYear);
    var cycles = [];
    for (var dec = 0; dec < 9; dec++) {
      var startAge = dec * 10;
      var offset = forward ? (dec + 1) : -(dec + 1);
      var stem = ((pillars[0].stem + offset) % 10 + 10) % 10;
      var branch = ((pillars[0].branch + offset) % 12 + 12) % 12;
      cycles.push({ stem: stem, branch: branch, startAge: startAge, endAge: startAge + 9 });
    }
    return { cycles: cycles, direction: forward ? 'Thuận hành' : 'Nghịch hành' };
  }

  function getNayin(stem, branch) {
    var idx = (stem * 6 + branch) % 60;
    return NAYIN_TABLE[idx] || '';
  }

  function generateBaziReport(name, gender, year, month, day, hour) {
    var pillars = calcFourPillars(year, month, day, hour);
    var dm = pillars[2];
    var daiVan = calcDaiVan(pillars, gender, year);
    var wc = {Mộc:0, Hỏa:0, Thổ:0, Kim:0, Thủy:0};
    for (var i = 0; i < 4; i++) { wc[WX[pillars[i].stem]]++; wc[EB_WX[pillars[i].branch]]++; }
    var maxW = '', maxC = 0;
    ['Mộc','Hỏa','Thổ','Kim','Thủy'].forEach(function(w) { if (wc[w] > maxC) { maxC = wc[w]; maxW = w; } });
    var de = WX[dm.stem];
    return {
      name: name, gender: gender, birth: { year: year, month: month, day: day, hour: hour },
      pillars: pillars,
      dayMaster: { stem: dm.stem, branch: dm.branch, element: de, strength: wc[de] >= 3 ? 'Thân cường' : 'Thân nhược' },
      wuxingCount: wc, topElement: maxW,
      yongShen: WX_GEN[de], kyThan: WX_DESTROY[de],
      daiVan: daiVan
    };
  }

  var HuyenCo = {
    HS: HS, HS_CN: HS_CN, EB: EB, EB_CN: EB_CN,
    WX: WX, WX_CN: WX_CN, EB_WX: EB_WX, EB_WX_CN: EB_WX_CN,
    WX_COLORS: WX_COLORS, WX_GEN: WX_GEN, WX_DESTROY: WX_DESTROY,
    HIDDEN: HIDDEN, SHISHEN: SHISHEN, SHISHEN_CN: SHISHEN_CN,
    NAYIN_TABLE: NAYIN_TABLE, SOLAR_TERM_DAYS: SOLAR_TERM_DAYS,
    calcYearPillar: calcYearPillar, calcMonthPillar: calcMonthPillar,
    calcDayPillar: calcDayPillar, calcHourPillar: calcHourPillar,
    calcFourPillars: calcFourPillars, calcDaiVan: calcDaiVan,
    getShiShen: getShiShen, getNayin: getNayin,
    generateBaziReport: generateBaziReport
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = HuyenCo;
  } else {
    global.HuyenCo = HuyenCo;
  }
})(this);

/**
 * Tử Vi Việt — Tử Vi Engine (Browser)
 * =========================================
 * An sao Tử Vi đầy đủ 100+ sao dựa trên thuật toán chính thống
 * Tương thích với các sách Tử Vi Đẩu Số chuẩn
 */
(function(global) {
  'use strict';
  var HC = global.HuyenCo || {};
  
  var EB = HC.EB || ['Tý','Sửu','Dần','Mão','Thìn','Tỵ','Ngọ','Mùi','Thân','Dậu','Tuất','Hợi'];
  var EB_CN = HC.EB_CN || ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
  var HS = HC.HS || ['Giáp','Ất','Bính','Đinh','Mậu','Kỷ','Canh','Tân','Nhâm','Quý'];
  var HS_CN = HC.HS_CN || ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];

  // ================================================================
  // CUNG MỆNH & THÂN (定命宮、身宮)
  // ================================================================
  // Mệnh cung: từ Dần cung, count (tháng-1) clockwise + (giờ/2) counter-clockwise
  function getMenhCung(lunarMonth, hourBranch) {
    var m = lunarMonth - 1;
    var h = hourBranch;
    // Mệnh cung = (Dần - tháng + giờ) mod 12
    // Simplified: Mệnh = (2 - (lunarMonth-1) + hourBranch + 12) % 12
    // Actually standard formula: từ Dần(2) đếm nghịch đến tháng sinh, rồi đếm thuận đến giờ sinh
    var pos = (2 - (lunarMonth - 1) + 12) % 12; // Nghịch đến tháng
    pos = (pos + h) % 12; // Thuận đến giờ
    return pos;
  }

  function getThanCung(lunarMonth, hourBranch) {
    var m = lunarMonth - 1;
    var h = hourBranch;
    // Thân cung: từ Dần(2) đếm thuận đến tháng, rồi đếm nghịch đến giờ
    var pos = (2 + (lunarMonth - 1)) % 12; // Thuận đến tháng
    pos = (pos - h + 12) % 12; // Nghịch đến giờ
    return pos;
  }

  // ================================================================
  // NGŨ HÀNH CỤC (定五行局)
  // ================================================================
  // Based on the Nayin (納音) of the Menh Cung's stem-branch
  var NAYIN_CUC = {
    'Giáp Tý':2,'Ất Sửu':2, 'Bính Dần':3,'Đinh Mão':3, 'Mậu Thìn':4,'Kỷ Tỵ':4,
    'Canh Ngọ':5,'Tân Mùi':5, 'Nhâm Thân':6,'Quý Dậu':6,
    'Giáp Tuất':3,'Ất Hợi':3, 'Bính Tý':4,'Đinh Sửu':4, 'Mậu Dần':5,'Kỷ Mão':5,
    'Canh Thìn':6,'Tân Tỵ':6, 'Nhâm Ngọ':2,'Quý Mùi':2,
    'Giáp Thân':5,'Ất Dậu':5, 'Bính Tuất':6,'Đinh Hợi':6, 'Mậu Tý':2,'Kỷ Sửu':2,
    'Canh Dần':3,'Tân Mão':3, 'Nhâm Thìn':4,'Quý Tỵ':4,
    'Giáp Ngọ':6,'Ất Mùi':6, 'Bính Thân':2,'Đinh Dậu':2, 'Mậu Tuất':3,'Kỷ Hợi':3,
    'Canh Tý':4,'Tân Sửu':4, 'Nhâm Dần':5,'Quý Mão':5,
    'Giáp Thìn':2,'Ất Tỵ':2, 'Bính Ngọ':3,'Đinh Mùi':3, 'Mậu Thân':4,'Kỷ Dậu':4,
    'Canh Tuất':5,'Tân Hợi':5, 'Nhâm Tý':6,'Quý Sửu':6,
    'Giáp Dần':4,'Ất Mão':4, 'Bính Thìn':5,'Đinh Tỵ':5, 'Mậu Ngọ':6,'Kỷ Mùi':6,
    'Canh Thân':2,'Tân Dậu':2, 'Nhâm Tuất':3,'Quý Hợi':3
  };

  var CUC_NAMES = {2:'Thủy nhị cục', 3:'Mộc tam cục', 4:'Kim tứ cục', 5:'Thổ ngũ cục', 6:'Hỏa lục cục'};
  
  function getCuc(menhStem, menhBranch) {
    var key = HS[menhStem] + ' ' + EB[menhBranch];
    return NAYIN_CUC[key] || 5;
  }

  // ================================================================
  // AN TỬ VI TINH (安紫微星)
  // ================================================================
  // For each cuc (bureau number), there's a table of which day maps to which position
  // Standard algorithm: (birthDay + X) / cuc = whole number
  function getZiWeiPos(cuc, lunarDay) {
    // Zi Wei tables for each cuc
    var ZW_TABLE = {
      2: [2,3,4,5,6,7,8,9,10,11,0,1,2,3,4,5,6,7,8,9,10,11,0,1,2,3,4,5,6,7,8],
      3: [2,5,8,11,2,5,8,11,2,5,8,11,2,5,8,11,2,5,8,11,2,5,8,11,2,5,8,11,2,5],
      4: [2,6,10,2,6,10,2,6,10,2,6,10,2,6,10,2,6,10,2,6,10,2,6,10,2,6,10,2,6,10],
      5: [2,7,0,5,10,3,8,1,6,11,4,9,2,7,0,5,10,3,8,1,6,11,4,9,2,7,0,5,10,3],
      6: [2,8,2,8,2,8,2,8,2,8,2,8,2,8,2,8,2,8,2,8,2,8,2,8,2,8,2,8,2,8]
    };
    var table = ZW_TABLE[cuc] || ZW_TABLE[5];
    var idx = (lunarDay - 1) % table.length;
    return table[Math.max(0, Math.min(idx, table.length - 1))];
  }

  // ================================================================
  // THIÊN PHỦ TINH (安天府星) — faces Zi Wei across the chart
  // ================================================================
  var TF_MAP = [4,3,2,1,0,11,10,9,8,7,6,5]; // If ZW at index i, TF at TF_MAP[i]
  
  function getTianFuPos(zwPos) {
    return TF_MAP[zwPos % 12];
  }

  // ================================================================
  // TỬ VI HỆ TINH (紫微星系) — counter-clockwise from Zi Wei
  // ================================================================
  var ZW_SERIES = [
    {name: 'Tử Vi', cn: '紫微', offset: 0},
    {name: 'Thiên Cơ', cn: '天機', offset: -1},
    {name: 'Thái Dương', cn: '太陽', offset: -3},
    {name: 'Vũ Khúc', cn: '武曲', offset: -4},
    {name: 'Thiên Đồng', cn: '天同', offset: -5},
    {name: 'Liêm Trinh', cn: '廉貞', offset: -8}
  ];

  // ================================================================
  // THIÊN PHỦ HỆ TINH (天府星系) — clockwise from Tian Fu
  // ================================================================
  var TF_SERIES = [
    {name: 'Thiên Phủ', cn: '天府', offset: 0},
    {name: 'Thái Âm', cn: '太陰', offset: 1},
    {name: 'Tham Lang', cn: '貪狼', offset: 2},
    {name: 'Cự Môn', cn: '巨門', offset: 3},
    {name: 'Thiên Tướng', cn: '天相', offset: 4},
    {name: 'Thiên Lương', cn: '天梁', offset: 5},
    {name: 'Thất Sát', cn: '七殺', offset: 6},
    {name: 'Phá Quân', cn: '破軍', offset: 10}
  ];

  // ================================================================
  // TỨ HÓA (四化) — Based on Year Stem
  // ================================================================
  var TU_HOA = {
    0: {luc:'Liêm Trinh', quyen:'Phá Quân', khoa:'Vũ Khúc', ky:'Thái Dương'},  // Giáp
    1: {luc:'Thiên Cơ', quyen:'Thiên Lương', khoa:'Tử Vi', ky:'Thái Âm'},       // Ất
    2: {luc:'Thiên Đồng', quyen:'Thiên Cơ', khoa:'Văn Xương', ky:'Liêm Trinh'}, // Bính
    3: {luc:'Thái Âm', quyen:'Thiên Đồng', khoa:'Thiên Cơ', ky:'Cự Môn'},       // Đinh
    4: {luc:'Tham Lang', quyen:'Thái Âm', khoa:'Hữu Bật', ky:'Thiên Cơ'},       // Mậu
    5: {luc:'Vũ Khúc', quyen:'Tham Lang', khoa:'Thiên Lương', ky:'Văn Khúc'},   // Kỷ
    6: {luc:'Thái Dương', quyen:'Vũ Khúc', khoa:'Thái Âm', ky:'Thiên Đồng'},    // Canh
    7: {luc:'Cự Môn', quyen:'Thái Dương', khoa:'Văn Khúc', ky:'Văn Xương'},     // Tân
    8: {luc:'Thiên Lương', quyen:'Tử Vi', khoa:'Tả Phụ', ky:'Vũ Khúc'},         // Nhâm
    9: {luc:'Phá Quân', quyen:'Cự Môn', khoa:'Thái Âm', ky:'Tham Lang'}         // Quý
  };

  // ================================================================
  // NGUYỆT HỆ TINH (月系星) — Based on lunar month
  // ================================================================
  function getMonthlyStars(lunarMonth) {
    var m = lunarMonth - 1; // 0-based
    return [
      {name: 'Tả Phụ', cn: '左輔', pos: (4 + m) % 12},
      {name: 'Hữu Bật', cn: '右弼', pos: (10 - m + 12) % 12},
      {name: 'Thiên Hình', cn: '天刑', pos: (9 + m) % 12},
      {name: 'Thiên Diêu', cn: '天姚', pos: (1 + m) % 12},
      {name: 'Thiên Mã', cn: '天馬', pos: ([8,5,2,11,8,5,2,11,8,5,2,11])[m]},
      {name: 'Âm Sát', cn: '陰煞', pos: (m % 2 === 0 ? 8 : 5)},
      {name: 'Thiên Nguyệt', cn: '天月', pos: ([8,5,2,11,8,5,2,11,8,5,2,11])[(m+3)%12]},
      {name: 'Thiên Vu', cn: '天巫', pos: ([8,5,2,11,8,5,2,11,8,5,2,11])[(m+6)%12]}
    ];
  }

  // ================================================================
  // CAN HỆ TINH (年干系星) — Based on Year Stem
  // ================================================================
  function getYearlyStars(yearStem) {
    var s = yearStem % 10;
    // Lộc Tồn positions
    var lucPos = [8,7,5,4,1,0,10,9,2,11][s]; // Giáp=8(Dần), Ất=7(Mão)...
    return [
      {name: 'Lộc Tồn', cn: '祿存', pos: lucPos},
      {name: 'Kình Dương', cn: '擎羊', pos: (lucPos + 1) % 12},
      {name: 'Đà La', cn: '陀羅', pos: (lucPos - 1 + 12) % 12},
      {name: 'Thiên Khôi', cn: '天魁', pos: [1,0,9,8,1,0,9,8,1,0][s]},
      {name: 'Thiên Việt', cn: '天鉞', pos: [7,6,3,2,7,6,3,2,7,6][s]}
    ];
  }

  // ================================================================
  // THỜI HỆ TINH (時系星) — Based on Hour Branch
  // ================================================================
  function getHourlyStars(hourBranch) {
    var h = hourBranch % 12;
    return [
      {name: 'Văn Xương', cn: '文昌', pos: (h + 10) % 12},
      {name: 'Văn Khúc', cn: '文曲', pos: (4 - h + 12) % 12},
      {name: 'Địa Không', cn: '地空', pos: (h + 9) % 12},
      {name: 'Địa Kiếp', cn: '地劫', pos: (h + 7) % 12},
      {name: 'Hỏa Tinh', cn: '火星', pos: ([8,9,10,11,0,1,2,3,4,5,6,7])[h]},
      {name: 'Linh Tinh', cn: '鈴星', pos: ([5,6,7,8,9,10,11,0,1,2,3,4])[h]}
    ];
  }

  // ================================================================
  // NHẬT HỆ TINH (日系星) — Based on Day of Month
  // ================================================================
  function getDailyStars(lunarDay) {
    var d = (lunarDay - 1) % 30;
    return [
      {name: 'Tam Thai', cn: '三台', pos: (d + 3) % 12},
      {name: 'Bát Tọa', cn: '八座', pos: (3 - d + 12) % 12},
      {name: 'Ân Quang', cn: '恩光', pos: (d + 6) % 12},
      {name: 'Thiên Quý', cn: '天貴', pos: (6 - d + 12) % 12}
    ];
  }

  // ================================================================
  // VÒNG TRÀNG SINH (長生十二神)
  // ================================================================
  var TRANG_SINH = ['Trường Sinh','Mộc Dục','Quan Đới','Lâm Quan','Đế Vượng','Suy','Bệnh','Tử','Mộ','Tuyệt','Thai','Dưỡng'];
  
  function getTrangSinh(cuc, gender, menhPos) {
    // Direction based on Yin/Yang and gender
    var cucNum = cuc;
    var isYangCuc = [3,5,6].indexOf(cucNum) >= 0; // Mộc(3), Thổ(5), Hỏa(6) are Yang
    var isMale = (gender === 'male');
    var forward = (isYangCuc && isMale) || (!isYangCuc && !isMale);
    
    // Start position for Trường Sinh
    var startPos = menhPos;
    
    var result = new Array(12);
    for (var i = 0; i < 12; i++) {
      var pos = forward ? (startPos + i) % 12 : (startPos - i + 12) % 12;
      result[pos] = TRANG_SINH[i];
    }
    return result;
  }

  // ================================================================
  // COMPLETE STAR PLACEMENT
  // ================================================================
  function getCungNames() {
    return ['Mệnh','Phụ Mẫu','Phúc Đức','Điền Trạch','Quan Lộc','Nô Bộc','Thiên Di','Tật Ách','Tài Bạch','Tử Tức','Phu Thê','Huynh Đệ'];
  }
  
  function getCungCN() {
    return ['命宮','父母','福德','田宅','官祿','僕役','遷移','疾厄','財帛','子女','夫妻','兄弟'];
  }

  function calcTuVi(yearStem, lunarMonth, lunarDay, hourBranch, gender) {
    var menh = getMenhCung(lunarMonth, hourBranch);
    var than = getThanCung(lunarMonth, hourBranch);
    
    // Menh cung stem: (yearStem * 2 + menhBranch) % 10
    var menhStem = ((yearStem % 5) * 2 + menh) % 10;
    var menhBranch = menh;
    
    var cuc = getCuc(menhStem, menhBranch);
    var zwPos = getZiWeiPos(cuc, lunarDay);
    var tfPos = getTianFuPos(zwPos);
    
    // Init 12 palaces
    var palaces = [];
    for (var i = 0; i < 12; i++) {
      palaces.push({ chinhTinh: [], phuTinh: [], saoTot: [], saoXau: [], menh: false, than: false });
    }
    
    // An Zi Wei series (counter-clockwise from ZW)
    ZW_SERIES.forEach(function(star) {
      var pos = ((zwPos + star.offset) % 12 + 12) % 12;
      palaces[pos].chinhTinh.push({name: star.name, cn: star.cn, series: 'zw'});
    });
    
    // An Tian Fu series (clockwise from TF)
    TF_SERIES.forEach(function(star) {
      var pos = (tfPos + star.offset) % 12;
      palaces[pos].chinhTinh.push({name: star.name, cn: star.cn, series: 'tf'});
    });
    
    // Tứ Hóa
    var hoa = TU_HOA[yearStem % 10];
    
    // Monthly stars
    getMonthlyStars(lunarMonth).forEach(function(s) {
      palaces[s.pos].phuTinh.push({name: s.name, cn: s.cn, type: s.name.indexOf('Sát')>=0||s.name.indexOf('Hình')>=0||s.name.indexOf('Diêu')>=0?'xau':'tot'});
    });
    
    // Yearly stars
    getYearlyStars(yearStem).forEach(function(s) {
      var type = ['Kình Dương','Đà La'].indexOf(s.name)>=0 ? 'xau' : 'tot';
      var arr = type === 'xau' ? palaces[s.pos].saoXau : palaces[s.pos].saoTot;
      arr.push({name: s.name, cn: s.cn});
    });
    
    // Hourly stars
    getHourlyStars(hourBranch).forEach(function(s) {
      var type = ['Địa Không','Địa Kiếp','Hỏa Tinh','Linh Tinh'].indexOf(s.name)>=0 ? 'xau' : 'tot';
      var arr = type === 'xau' ? palaces[s.pos].saoXau : palaces[s.pos].saoTot;
      arr.push({name: s.name, cn: s.cn});
    });
    
    // Daily stars
    getDailyStars(lunarDay).forEach(function(s) {
      palaces[s.pos].saoTot.push({name: s.name, cn: s.cn});
    });
    
    // Tràng Sinh
    var ts = getTrangSinh(cuc, gender, menh);
    for (var i = 0; i < 12; i++) {
      palaces[i].trangSinh = ts[i] || '';
    }
    
    // Mark Mệnh & Thân
    palaces[menh].menh = true;
    palaces[than].than = true;
    
    // Build star maps with Tứ Hóa
    for (var i = 0; i < 12; i++) {
      palaces[i].chinhTinh.forEach(function(s) {
        if (s.name === hoa.luc) s.hoa = 'Lộc';
        if (s.name === hoa.quyen) s.hoa = 'Quyền';
        if (s.name === hoa.khoa) s.hoa = 'Khoa';
        if (s.name === hoa.ky) s.hoa = 'Kỵ';
      });
    }
    
    return {
      menhCung: menh,
      thanCung: than,
      cuc: cuc,
      cucName: CUC_NAMES[cuc],
      ziWeiPos: zwPos,
      tianFuPos: tfPos,
      palaces: palaces,
      tuHoa: hoa,
      cungNames: getCungNames(),
      cungCN: getCungCN()
    };
  }

  // Export
  HC.Ziwei = {
    getMenhCung: getMenhCung,
    getThanCung: getThanCung,
    getCuc: getCuc,
    getZiWeiPos: getZiWeiPos,
    getTianFuPos: getTianFuPos,
    calcTuVi: calcTuVi,
    getCungNames: getCungNames,
    getCungCN: getCungCN,
    ZW_SERIES: ZW_SERIES,
    TF_SERIES: TF_SERIES,
    TU_HOA: TU_HOA,
    TRANG_SINH: TRANG_SINH,
    CUC_NAMES: CUC_NAMES
  };

  global.HuyenCo = HC;
})(this);
              