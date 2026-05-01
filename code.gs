// =====================================================================
// WAJIB DIISI SEBELUM DEPLOY KE VERCEL
// =====================================================================
var SPREADSHEET_ID = "1wnoKPdmHYx97GrmMOUjKuwvqJA4rADT9xTFhJKaOU0g"; 
var FOLDER_ID = "14yXa5yaYmKwADZkzBCYuf2lfTQRX3_wV"; 

function doGet(e) {
  try {
    var data = getAllData();
    var pengaturan = getPengaturan();
    return ContentService.createTextOutput(JSON.stringify({ status: 'success', data: data, pengaturan: pengaturan }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);
    
    // Pengecekan jika request adalah menyimpan Pengaturan
    if (payload.action === 'save_pengaturan') {
      var savedPengaturan = simpanPengaturanDb(payload);
      return ContentService.createTextOutput(JSON.stringify({ status: 'success', pengaturan: savedPengaturan }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Jika request normal (Menyimpan Kuitansi Baru)
    var savedData = simpanData(payload);
    return ContentService.createTextOutput(JSON.stringify({ status: 'success', data: savedData }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// =====================================================================
// FUNGSI PENGATURAN BENDAHARA, BACKGROUND & LOGIN
// =====================================================================
function setupPengaturanSheet() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID.trim());
  var sheet = ss.getSheetByName('pengaturan');
  
  if (!sheet) {
    sheet = ss.insertSheet('pengaturan');
    sheet.appendRow(['Nama Bendahara', 'NIP Bendahara', 'URL Background', 'Username', 'Password']);
    sheet.appendRow(['CHAIRULLAH MUHAMMAD, A.MD', '19840110 200604 1 006', '', 'admin', 'admin123']);
    sheet.getRange('A1:E1').setFontWeight('bold').setBackground('#d0e0e3');
  } else {
    // Upgrade otomatis untuk database lama yang hanya 3 kolom
    var lastCol = sheet.getLastColumn();
    if (lastCol < 5) {
      sheet.getRange(1, 4).setValue('Username');
      sheet.getRange(1, 5).setValue('Password');
      sheet.getRange(2, 4).setValue('admin');
      sheet.getRange(2, 5).setValue('admin123');
      sheet.getRange('D1:E1').setFontWeight('bold').setBackground('#d0e0e3');
    }
  }
  return sheet;
}

function getPengaturan() {
  var sheet = setupPengaturanSheet();
  var data = sheet.getRange(2, 1, 1, 5).getValues()[0];
  return { 
    nama: data[0] || 'CHAIRULLAH MUHAMMAD, A.MD', 
    nip: data[1] || '19840110 200604 1 006',
    bgUrl: data[2] || '',
    userLogin: data[3] || 'admin',
    passLogin: data[4] || 'admin123'
  };
}

function simpanPengaturanDb(payload) {
  var sheet = setupPengaturanSheet();
  var currentData = sheet.getRange(2, 1, 1, 5).getValues()[0];
  var finalBgUrl = currentData[2] || '';

  if (payload.clearBg) {
    finalBgUrl = '';
  } 
  else if (payload.bgBase64 && payload.bgBase64 !== "") {
    try {
      var base64Data = payload.bgBase64.split(",")[1];
      var blob = Utilities.newBlob(Utilities.base64Decode(base64Data), payload.bgMimeType, payload.bgFileName);
      
      var folder = DriveApp.getFolderById(FOLDER_ID);
      var file = folder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      finalBgUrl = "https://drive.google.com/uc?export=view&id=" + file.getId();
    } catch (e) {
      throw new Error("Gagal upload background ke Folder Drive: " + e.message);
    }
  }

  var finalUser = payload.userLogin || currentData[3] || 'admin';
  var finalPass = payload.passLogin || currentData[4] || 'admin123';

  sheet.getRange(2, 1, 1, 5).setValues([[payload.nama, payload.nip, finalBgUrl, finalUser, finalPass]]);
  return { nama: payload.nama, nip: payload.nip, bgUrl: finalBgUrl, userLogin: finalUser, passLogin: finalPass };
}

// =====================================================================
// FUNGSI UTAMA DATABASE KUITANSI
// =====================================================================
function setupSheet() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID.trim());
  var sheet = ss.getSheetByName('data_kuitansi');
  
  if (!sheet) {
    sheet = ss.insertSheet('data_kuitansi');
    sheet.appendRow(['ID Kuitansi', 'Tanggal', 'Tgl Cetak Indo', 'Nama', 'Jumlah (Rp)', 'Terbilang', 'Keperluan', 'No Surat', 'Link Dokumen']);
    sheet.getRange('A1:I1').setFontWeight('bold').setBackground('#d0e0e3');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function simpanData(data) {
  if (!data || !data.nama) {
    throw new Error("Data tidak valid / kosong.");
  }
  
  var fileUrl = "";
  if (data.fileBase64 && data.fileBase64 !== "") {
    try {
      var base64Data = data.fileBase64.split(",")[1];
      var blob = Utilities.newBlob(Utilities.base64Decode(base64Data), data.mimeType, data.fileName);
      
      var folder = DriveApp.getFolderById(FOLDER_ID);
      var file = folder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      fileUrl = file.getUrl();
    } catch (e) {
      fileUrl = "Gagal upload: " + e.message;
    }
  }
  
  var sheet = setupSheet();
  sheet.appendRow([
    data.id, data.tglBiasa, data.tglIndo, data.nama,
    data.jumlahRp, data.terbilang, data.keperluan, data.noSurat, fileUrl
  ]);
  
  data.fileUrl = fileUrl; 
  delete data.fileBase64; 
  return data; 
}

function getAllData() {
  var sheet = setupSheet();
  var data = sheet.getDataRange().getDisplayValues();
  var result = [];
  
  for (var i = 1; i < data.length; i++) {
    result.push({
      id: data[i][0], tglBiasa: data[i][1], tglIndo: data[i][2],
      nama: data[i][3], jumlahRp: data[i][4], terbilang: data[i][5],
      keperluan: data[i][6], noSurat: data[i][7], fileUrl: data[i][8] || ""
    });
  }
  return result.reverse(); 
}
