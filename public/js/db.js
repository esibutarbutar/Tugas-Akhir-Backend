const mysql = require('mysql2/promise');

// Konfigurasi koneksi database
const db = mysql.createPool({
    host: 'localhost',        // Host database (default: localhost)
    user: 'root',             // Username MySQL (default untuk XAMPP: root)
    password: '',             // Password MySQL (default kosong di XAMPP)
    database: 'portal_sekolah_alwasliyah', // Nama database Anda
    waitForConnections: true,  // Jika Anda menggunakan koneksi pool
    connectionLimit: 10,      // Batas maksimal koneksi yang dapat dibuka
    queueLimit: 0             // Tidak ada batasan pada antrian
});


// Ekspor koneksi untuk digunakan di file lain
module.exports = db;
