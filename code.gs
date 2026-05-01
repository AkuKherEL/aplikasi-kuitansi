// =====================================================================
// WAJIB DIISI SEBELUM DEPLOY!
// Salin ID Spreadsheet Anda dari URL. 
// Contoh URL: https://docs.google.com/spreadsheets/d/1A2b3C4d5E6f7G8h9I0j/edit
// Maka ID-nya adalah: 1A2b3C4d5E6f7G8h9I0j
// =====================================================================
var SPREADSHEET_ID = "1wnoKPdmHYx97GrmMOUjKuwvqJA4rADT9xTFhJKaOU0g"; 

// --- REST API: MENANGANI REQUEST GET DARI VERCEL (MEMUAT DATA) ---
function doGet(e) {
  try {
    var data = getAllData();
    // Mengembalikan data ke Vercel dalam format JSON
    return ContentService.createTextOutput(JSON.stringify({ status: 'success', data: data }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// --- REST API: MENANGANI REQUEST POST DARI VERCEL (MENYIMPAN DATA) ---
function doPost(e) {
  try {
    // Menerima JSON dari frontend (Vercel)
    var payload = JSON.parse(e.postData.contents);
    var savedData = simpanData(payload);
    
    // Mengembalikan konfirmasi sukses ke frontend
    return ContentService.createTextOutput(JSON.stringify({ status: 'success', data: savedData }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// =====================================================================
// FUNGSI UTAMA DATABASE 
// =====================================================================

function setupSheet() {
  var ss;
  try { ss = SpreadsheetApp.getActiveSpreadsheet(); } catch (e) {}
  
  if (!ss) {
    if (SPREADSHEET_ID === "1wnoKPdmHYx97GrmMOUjKuwvqJA4rADT9xTFhJKaOU0g" || SPREADSHEET_ID === "") {
      throw new Error("⚠️ SPREADSHEET_ID BELUM DIISI DI SCRIPT!");
    }
    ss = SpreadsheetApp.openById(SPREADSHEET_ID.trim());
  }

  var sheet = ss.getSheetByName('data_kuitansi');
  if (!sheet) {
    sheet = ss.insertSheet('data_kuitansi');
    sheet.appendRow(['ID Kuitansi', 'Tanggal', 'Tgl Cetak Indo', 'Nama', 'Jumlah (Rp)', 'Terbilang', 'Keperluan', 'No Surat']);
    sheet.getRange('A1:H1').setFontWeight('bold').setBackground('#d0e0e3');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function simpanData(data) {
  if (!data || !data.nama) {
    throw new Error("Data tidak valid / kosong.");
  }
  var sheet = setupSheet();
  sheet.appendRow([
    data.id, data.tglBiasa, data.tglIndo, data.nama,
    data.jumlahRp, data.terbilang, data.keperluan, data.noSurat
  ]);
  return data; 
}

function getAllData() {
  var sheet = setupSheet();
  // Gunakan getDisplayValues agar desimal (,00) terbaca sempurna sebagai teks
  var data = sheet.getDataRange().getDisplayValues();
  var result = [];
  
  // Looping dari baris ke-2
  for (var i = 1; i < data.length; i++) {
    result.push({
      id: data[i][0], tglBiasa: data[i][1], tglIndo: data[i][2],
      nama: data[i][3], jumlahRp: data[i][4], terbilang: data[i][5],
      keperluan: data[i][6], noSurat: data[i][7]
    });
  }
  return result.reverse(); 
}
