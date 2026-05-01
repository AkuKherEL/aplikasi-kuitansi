Aplikasi Kuitansi Retribusi BLUD

Aplikasi berbasis web untuk mencetak dan mengelola kuitansi serta laporan buku besar retribusi pengujian laboratorium. Aplikasi ini dibangun dengan arsitektur Decoupled: Frontend menggunakan HTML/TailwindCSS (Vercel) dan Backend menggunakan Google Apps Script (Google Sheets).

🚀 Fitur Utama

Cetak Presisi: Mode Kalibrasi (Drag & Drop) untuk menyesuaikan teks kuitansi langsung ke atas foto blangko asli.

Kalkulasi Otomatis: Perhitungan total uang dan konversi ke "Terbilang" secara otomatis.

Buku Besar Real-time: Laporan penerimaan tersinkron otomatis dari Google Sheets lengkap dengan perhitungan saldo.

Penyimpanan Cloud: Seluruh data riwayat disimpan aman di Google Sheets melalui REST API.

🛠️ Panduan Instalasi & Deployment

Untuk menjalankan aplikasi ini secara publik melalui Vercel, ikuti langkah-langkah berikut:

Langkah 1: Setup Backend (Google Sheets & Apps Script)

Buat Spreadsheet baru di Google Sheets.

Salin ID Spreadsheet Anda (kombinasi huruf/angka acak pada URL di atas layar).

Klik menu Ekstensi > Apps Script.

Salin seluruh isi file Code.gs dari proyek ini ke dalam editor Apps Script.

Tempel ID Spreadsheet Anda ke dalam variabel SPREADSHEET_ID di baris paling atas.

Klik Terapkan (Deploy) > Deployment Baru.

Pilih jenis Aplikasi Web (Web App).

Set "Akses" ke Siapa Saja (Anyone).

Klik Terapkan dan Salin URL Aplikasi Web (API URL) yang diberikan.

Langkah 2: Setup Frontend (Menghubungkan API)

Buka file index.html pada proyek ini menggunakan Text Editor (seperti VS Code atau Notepad).

Cari variabel API_URL di bagian dalam <script> (biasanya di sekitar baris 430).

Ganti teks "MASUKKAN_URL_WEB_APP_APPS_SCRIPT_ANDA_DISINI" dengan URL Aplikasi Web yang Anda dapatkan dari Langkah 1.

Simpan file index.html.

Langkah 3: Push ke GitHub

Buat repositori baru di akun GitHub Anda.

Unggah file index.html dan README.md ini ke dalam repositori tersebut.

Commit dan Push perubahan Anda.

Langkah 4: Deploy ke Vercel

Buka Vercel.com dan masuk menggunakan akun GitHub Anda.

Klik tombol Add New... > Project.

Cari repositori GitHub yang baru saja Anda buat, lalu klik Import.

Biarkan semua pengaturan standar (Framework Preset: Other), lalu klik Deploy.

Tunggu beberapa detik, dan Vercel akan memberikan URL Publik untuk aplikasi kuitansi Anda! 🎉

📁 Struktur File

index.html - Antarmuka pengguna (Frontend), berisi form input, keranjang, dan tata letak cetak.

Code.gs - Kode backend untuk Google Apps Script (berfungsi sebagai REST API).

README.md - Dokumentasi proyek.
