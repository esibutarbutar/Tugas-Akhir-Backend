const express = require('express');
const path = require('path');
const session = require('express-session');
const db = require('./public/js/db.js');
const app = express();
const bodyParser = require('body-parser');
const PORT = 3000;
const multer = require('multer');
const cors = require('cors');
app.use(cors({ origin: '*' }));
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');


app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
    }
}));

// Menyiapkan storage untuk gambar
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Tentukan folder tempat gambar akan disimpan
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname); // Menentukan nama file
    }
});

// Menggunakan multer untuk upload gambar
const upload = multer({ storage: storage });


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/fasilitas', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'fasilitas.html'));
});

app.get('/detail-pegawai', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'detail-pegawai.html'));
});

app.get('/lupapassword', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'lupapassword.html'));
});

app.get('/guru', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'guru.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.post('/api/login', async (req, res) => {
    const { username, password, login_sebagai } = req.body;
    try {
        let query = '';
        let params = [];
        let userRole = '';
        if (login_sebagai === 'Pegawai') {
            query = `SELECT p.nip, p.nama_pegawai, p.password, r.nama_role, p.tempat_lahir, p.tanggal_lahir, p.nik, p.tanggal_mulai_tugas, p.jenjang_pendidikan, p.jurusan, p.golongan, p.nuptk
                     FROM pegawai p
                     JOIN pegawai_roles pr ON p.nip = pr.nip
                     JOIN roles r ON pr.role_id = r.id 
                     WHERE p.nip = ?`;
            params = [username];
        } else if (login_sebagai === 'Siswa') {
            query = `SELECT * FROM siswa WHERE nisn = ?`; // Query untuk siswa
            params = [username];
        } else {
            return res.status(400).json({ message: 'Login sebagai tidak valid' });
        }

        const [user] = await db.query(query, params);

        if (user.length > 0) {
            if (login_sebagai === 'Pegawai' && password === user[0].password) {
                userRole = user[0].nama_role;
                req.session.user = {
                    id: user[0].nip,
                    name: user[0].nama_pegawai,
                    role: userRole,
                    login_sebagai: login_sebagai,
                    tempat_lahir: user[0].tempat_lahir,
                    tanggal_lahir: user[0].tanggal_lahir,
                    nik: user[0].nik,
                    tanggal_mulai_tugas: user[0].tanggal_mulai_tugas,
                    jenjang_pendidikan: user[0].jenjang_pendidikan,
                    jurusan: user[0].jurusan,
                    golongan: user[0].golongan,
                    nuptk: user[0].nuptk
                };
                console.log("Session after login:", req.session.user);
                res.status(200).json({
                    message: 'Login berhasil',
                    user: req.session.user
                });
            } else if (login_sebagai === 'Siswa' && password === user[0].password) {
                req.session.user = {
                    id: user[0].nisn, // Pastikan nama kolom sesuai
                    name: user[0].nama_siswa, // Sesuaikan dengan kolom di tabel siswa
                    role: 'Siswa', // Role siswa
                    login_sebagai: login_sebagai,
                    tempat_lahir: user[0].tempat_lahir,
                    tanggal_lahir: user[0].tanggal_lahir,
                    nik: user[0].nik,
                    agama: user[0].agama,
                    nama_ayah: user[0].nama_ayah,
                    nama_ibu: user[0].nama_ibu,
                    no_hp_ortu: user[0].no_hp_ortu,
                    email: user[0].email,
                    anak_ke: user[0].anak_ke,
                    status: user[0].status,
                    tanggal_masuk: user[0].tanggal_masuk,
                    last_password_update: user[0].last_password_update,
                    profile_image: user[0].profile_image,
                    id_kelas: user[0].id_kelas,
                    jenis_kelamin: user[0].jenis_kelamin
                };
                console.log("Session after login (Siswa):", req.session.user);
                res.status(200).json({
                    message: 'Login berhasil',
                    user: req.session.user
                });
            } else {
                res.status(401).json({ message: 'Password salah' });
            }
        } else {
            res.status(404).json({ message: `${login_sebagai} tidak ditemukan` });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
});

app.post('/login', (req, res) => {
    const userRole = req.session.user?.role;
    console.log("User Role from session:", userRole);

    if (userRole === 'Admin') {
        res.redirect('/dashboard-admin');
    } else if (userRole === 'Guru Mata Pelajaran') {
        res.redirect('/dashboard-matpel');
    } else if (userRole === 'Guru Wali Kelas') {
        res.redirect('/dashboard-walikelas');
    } else if (userRole === 'Guru Mata Pelajaran & Wali Kelas') {
        res.redirect('/dashboard-walikelas');
    } else if (userRole === 'Kepala Sekolah') {
        res.redirect('/dashboard-kepalaSekolah');

    } else {
        res.redirect('/dashboard-siswa');
    }
});


app.get('/dashboard', (req, res) => {
    if (req.session.user) {
        const { role } = req.session.user;
        if (role === 'Admin') {
            res.redirect('/dashboard-admin');
         } else if (role === 'Guru Mata Pelajaran') {
            res.redirect('/dashboard-matpel');
        } else if (role === 'Guru Wali Kelas') {
            res.redirect('/dashboard-walikelas');
        } else if (role === 'Guru Mata Pelajaran & Wali Kelas') {
            res.redirect('/dashboard-guru');
        } else if (role === 'Siswa') {
                res.redirect('/dashboard-siswa');
        } else if (role === 'Kepala Sekolah') {
                res.redirect('/dashboard-kepalaSekolah');
        } else {
            res.redirect('/login'); // Jika role tidak dikenali
        }
    } else {
        res.redirect('/login'); // Jika tidak ada sesi
    }
});

app.get('/dashboard-admin', (req, res) => {
    if (req.session.user && req.session.user.role === 'Admin') {
        const profileImage = req.session.user.profile_image || '/images/profile/kepsek.png'; // Default image
        res.sendFile(path.join(__dirname, 'views', 'dashboard-admin.html'));
    } else {
        res.redirect('/login');
    }
});

app.get('/dashboard-matpel', (req, res) => {
    if (req.session.user && req.session.user.role === 'Guru Mata Pelajaran') {
        res.sendFile(path.join(__dirname, 'views', 'dashboard-matpel.html'));
    } else {
        res.redirect('/login');
    }
});

app.get('/dashboard-walikelas', (req, res) => {
    if (req.session.user && req.session.user.role === 'Guru Wali Kelas') {
        res.sendFile(path.join(__dirname, 'views', 'dashboard-walikelas.html'));
    } else {
        res.redirect('/login');
    }
});

app.get('/dashboard-guru', (req, res) => {
    if (req.session.user && req.session.user.role === 'Guru Mata Pelajaran & Wali Kelas') {
        res.sendFile(path.join(__dirname, 'views', 'dashboard-guru.html'));
    } else {
        res.redirect('/login');
    }
});

app.get('/dashboard-kepalaSekolah', (req, res) => {
    if (req.session.user && req.session.user.role === 'Kepala Sekolah') {
        res.sendFile(path.join(__dirname, 'views', 'dashboard-kepalaSekolah.html'));
    } else {
        res.redirect('/login');
    }
});



app.get('/dashboard-siswa', (req, res) => {
    if (req.session.user && req.session.user.role === 'Siswa') {
        res.sendFile(path.join(__dirname, 'views', 'dashboard-siswa.html'));
    } else {
        res.redirect('/login');
    }
});

app.get('/api/session', (req, res) => {
    if (req.session.user) {
        const formatDate = (dateString) => {
            const date = new Date(dateString);
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}-${month}-${year}`;
        };

        res.json({
            name: req.session.user.name || 'Tidak tersedia',
            tempat_lahir: req.session.user.tempat_lahir || 'Tidak tersedia',
            tanggal_lahir: req.session.user.tanggal_lahir ? formatDate(req.session.user.tanggal_lahir) : 'Tidak tersedia',
            nip: req.session.user.id || 'Tidak tersedia',
            position: req.session.user.role || 'Tidak tersedia',
            login_sebagai: req.session.user.login_sebagai || 'Tidak tersedia',
            nik: req.session.user.nik || 'Tidak tersedia',
            tanggal_mulai_tugas: req.session.user.tanggal_mulai_tugas ? formatDate(req.session.user.tanggal_mulai_tugas) : 'Tidak tersedia',
            jenjang_pendidikan: req.session.user.jenjang_pendidikan || 'Tidak tersedia',
            jurusan: req.session.user.jurusan || 'Tidak tersedia',
            golongan: req.session.user.golongan || '-',
            nuptk: req.session.user.nuptk || '-'
        });
    } else {
        res.status(401).json({ message: 'User not logged in' });
    }
});

app.get('/api/session-siswa', (req, res) => {
    console.log("Session Data:", req.session.user);  // Debug log untuk memastikan sesi ada

    if (req.session.user) {
        const formatDate = (dateString) => {
            const date = new Date(dateString);
            return date.toLocaleDateString('id-ID');
        };

        res.json({
            name: req.session.user.name || 'Tidak tersedia',
            tempat_lahir: req.session.user.tempat_lahir || 'Tidak tersedia',
            nisn: req.session.user.id || 'Tidak tersedia',
            tanggal_lahir: req.session.user.tanggal_lahir ? formatDate(req.session.user.tanggal_lahir) : 'Tidak tersedia',
            nik: req.session.user.nik || 'Tidak tersedia',
            jenis_kelamin: req.session.user.jenis_kelamin || 'Tidak tersedia',
            agama: req.session.user.agama || 'Tidak tersedia',
            nama_ayah: req.session.user.nama_ayah || 'Tidak tersedia',
            nama_ibu: req.session.user.nama_ibu || 'Tidak tersedia',
            no_hp_ortu: req.session.user.no_hp_ortu || 'Tidak tersedia',
            email: req.session.user.email || 'Tidak tersedia',
            anak_ke: req.session.user.anak_ke || 'Tidak tersedia',
            status: req.session.user.status || 'Tidak tersedia',
            tanggal_masuk: req.session.user.tanggal_masuk ? formatDate(req.session.user.tanggal_masuk) : 'Tidak tersedia',
            last_password_update: req.session.user.last_password_update ? formatDate(req.session.user.last_password_update) : 'Tidak tersedia',
            profile_image: req.session.user.profile_image || 'Tidak tersedia',
            id_kelas: req.session.user.id_kelas || 'Tidak tersedia'
        });
    } else {
        res.status(401).json({ message: 'User not logged in' });  // Pastikan sesi benar-benar ada
    }
});


app.get('/api/pegawai', async (req, res) => {
    try {
        const query = 'SELECT * FROM pegawai';  // Menyesuaikan query dengan struktur database Anda
        const [rows] = await db.query(query);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
});
app.get('/api/pegawai/:nip', async(req, res) => {
    const { nip } = req.params;

    try {
        const query = 'SELECT * FROM pegawai WHERE nip = ?';
        const [result] = await db.execute(query, [nip]);

        if (result.length > 0) {
            res.status(200).json(result[0]);
        } else {
            res.status(404).json({ message: 'Pegawai tidak ditemukan.' });
        }
    } catch (error) {
        console.error('Error mengambil data pegawai:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server!' });
    }
});

app.delete('/api/pegawai/:nip', async (req, res) => {
    const { nip } = req.params;
    console.log(`Deleting pegawai with NIP: ${nip}`);  // Log NIP yang diterima

    try {
        const deleteQuery = 'DELETE FROM pegawai WHERE nip = ?';
        const [result] = await db.query(deleteQuery, [nip]);

        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'Pegawai berhasil dihapus.' });
        } else {
            res.status(404).json({ message: 'Pegawai tidak ditemukan.' });
        }
    } catch (error) {
        console.error("Error deleting pegawai:", error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
});



app.post('/api/pegawai', (req, res, next) => {
    upload.single('profile_image')(req, res, (err) => {
        if (err) {
            console.error('Multer Error:', err);
            return res.status(400).json({ message: 'Error dalam upload file!' });
        }
        next();
    });
}, async (req, res) => {
    try {
        const {
            nip, namaPegawai, tanggalLahir, tempatLahir,
            jenisKelamin, alamat, agama, email,
            noHp, password, nik, tanggalMulaiTugas,
            jenjangPendidikan, jurusan, role  // Perhatikan 'role' sebagai nilai tunggal
        } = req.body;

        console.log('Data diterima:', req.body);

        // Validasi role
        if (!role) {
            return res.status(400).json({ message: 'Role harus dipilih!' });
        }

        // Insert pegawai ke tabel pegawai
        const query = `
            INSERT INTO pegawai 
            (nip, nama_pegawai, tanggal_lahir, tempat_lahir, jenis_kelamin, alamat, agama, email, no_hp, password, nik, tanggal_mulai_tugas, jenjang_pendidikan, jurusan) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        await db.execute(query, [
            nip, namaPegawai, tanggalLahir, tempatLahir,
            jenisKelamin, alamat, agama, email,
            noHp, password, nik, tanggalMulaiTugas,
            jenjangPendidikan, jurusan
        ]);

        // Insert role ke tabel pegawai_roles
        await db.execute('INSERT INTO pegawai_roles (nip, role_id) VALUES (?, ?)', [nip, role]);

        res.status(201).json({ message: 'Data pegawai dan role berhasil ditambahkan!' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            console.error('Duplicate Entry Error:', error);
            return res.status(409).json({ message: 'NIP sudah terdaftar!' });
        }

        console.error('Error menyimpan data:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server!' });
    }
});


app.put('/api/pegawai/:nip', async (req, res) => {
    const { nip } = req.params;
    const {
        namaPegawai,
        tanggalLahir,
        tempatLahir,
        jenisKelamin,
        alamat,
        agama,
        email,
        noHp,
        nik,
        tanggalMulaiTugas,
        jenjangPendidikan,
        jurusan,
        role,  // role adalah string (contoh: "R1")
    } = req.body;

    try {
        // Validasi input jika diperlukan
        if (!namaPegawai || !tanggalLahir || !tempatLahir || !jenisKelamin || !alamat || !agama || !email || !noHp || !nik || !tanggalMulaiTugas || !jenjangPendidikan || !jurusan || !role) {
            return res.status(400).json({ message: 'Semua field wajib diisi.' });
        }

        // Query untuk update data pegawai
        const updateQuery = `
            UPDATE pegawai 
            SET 
                nama_pegawai = ?,
                tanggal_lahir = ?,
                tempat_lahir = ?,
                jenis_kelamin = ?,
                alamat = ?,
                agama = ?,
                email = ?,
                no_hp = ?,
                nik = ?,
                tanggal_mulai_tugas = ?,
                jenjang_pendidikan = ?,
                jurusan = ? 
            WHERE nip = ?
        `;

        // Eksekusi query update data pegawai
        await db.execute(updateQuery, [
            namaPegawai,
            tanggalLahir,
            tempatLahir,
            jenisKelamin,
            alamat,
            agama,
            email,
            noHp,
            nik,
            tanggalMulaiTugas,
            jenjangPendidikan,
            jurusan,
            nip,
        ]);

        // Hapus semua roles yang ada dan masukkan role baru (karena hanya satu role)
        const deleteRolesQuery = `DELETE FROM pegawai_roles WHERE nip = ?`;
        await db.execute(deleteRolesQuery, [nip]);

        // Insert role baru (karena role adalah string)
        const insertRolesQuery = `INSERT INTO pegawai_roles (nip, role_id) VALUES (?, ?)`;
        await db.execute(insertRolesQuery, [nip, role]);

        res.status(200).json({ message: 'Data pegawai berhasil diperbarui.' });
    } catch (error) {
        console.error('Error updating data pegawai:', error);
        res.status(500).json({ message: 'Terjadi kesalahan saat memperbarui data pegawai.' });
    }
});


app.get('/api/pegawai-edit/:nip', async (req, res) => {
    const { nip } = req.params;

try {
    // Query untuk mendapatkan data pegawai
    const queryPegawai = 'SELECT * FROM pegawai WHERE nip = ?';
    const [pegawaiResult] = await db.execute(queryPegawai, [nip]);

    if (pegawaiResult.length > 0) {
        // Query untuk mendapatkan role yang dimiliki oleh pegawai
        const queryRoles = `
            SELECT pr.role_id
            FROM pegawai_roles pr
            WHERE pr.nip = ?
        `;
        const [rolesResult] = await db.execute(queryRoles, [nip]);

        // Ambil role pertama (jika ada) jika hanya ingin role tunggal
        const role = rolesResult.length > 0 ? rolesResult[0].role_id : null;

        // Menambahkan role pada data pegawai
        const pegawaiData = {
            ...pegawaiResult[0],
            role: role // Hanya satu role yang akan diberikan
        };

        res.status(200).json(pegawaiData);
    } else {
        res.status(404).json({ message: 'Pegawai tidak ditemukan.' });
    }
} catch (error) {
    console.error('Error mengambil data pegawai dan role:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server!' });
}

});


app.put('/api/siswa/:nisn', async (req, res) => {
    const { nisn } = req.params;
    const { nama_siswa, tempat_lahir, tanggal_lahir, jenis_kelamin, alamat, agama, tanggal_masuk, nama_ayah, nama_ibu, no_hp_ortu, email, nik, anak_ke, status, id_kelas } = req.body;

    try {
        // Update data siswa
        const updateQuery = `
            UPDATE siswa 
            SET nama_siswa = ?, tempat_lahir = ?, tanggal_lahir = ?, jenis_kelamin = ?, alamat = ?, agama = ?, tanggal_masuk = ?, nama_ayah = ?, nama_ibu = ?, no_hp_ortu = ?, email = ?, nik = ?, anak_ke = ?, status = ?, id_kelas = ?
            WHERE nisn = ?`;

        const [result] = await db.execute(updateQuery, [
            nama_siswa, tempat_lahir, tanggal_lahir, jenis_kelamin, alamat, agama, tanggal_masuk, nama_ayah, nama_ibu, no_hp_ortu, email, nik, anak_ke, status, id_kelas, nisn
        ]);

        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'Data siswa berhasil diperbarui!' });
        } else {
            res.status(404).json({ message: 'Siswa tidak ditemukan.' });
        }
    } catch (error) {
        console.error('Error mengupdate data siswa:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server!' });
    }
});


app.get('/api/siswa', async (req, res) => {
    try {
        const query = 'SELECT * FROM siswa'; // Pastikan tabel 'siswa' ada
        const [rows] = await db.query(query);

        if (rows.length > 0) {
            res.status(200).json(rows);
        } else {
            res.status(404).json({ message: 'Tidak ada data siswa ditemukan.' });
        }
    } catch (error) {
        console.error('Error mengambil data siswa:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
});


app.post('/api/siswa', async (req, res) => {
    const {
        nisn, nama_siswa, alamat, tempat_lahir, tanggal_lahir, jenis_kelamin,
        agama, tanggal_masuk, nama_ayah, nama_ibu, no_hp_ortu, email, nik, anak_ke, status, id_kelas, password
    } = req.body;

    if (!nisn || !nama_siswa || !alamat || !tempat_lahir || !tanggal_lahir || !jenis_kelamin ||
        !agama || !tanggal_masuk || !nama_ayah || !nama_ibu || !no_hp_ortu || !email || !nik || !anak_ke || !status) {
        return res.status(400).json({ message: 'Field wajib harus diisi!' });
    }

    const query = `
    INSERT INTO siswa (nisn, nama_siswa, alamat, tempat_lahir, tanggal_lahir, jenis_kelamin,
        agama, tanggal_masuk, nama_ayah, nama_ibu, no_hp_ortu, email, nik, anak_ke, status, id_kelas, password)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const idKelasValue = id_kelas ? id_kelas : null;

    try {
        await db.query(query, [
            nisn, nama_siswa, alamat, tempat_lahir, tanggal_lahir, jenis_kelamin,
            agama, tanggal_masuk, nama_ayah, nama_ibu, no_hp_ortu, email, nik, anak_ke, status, idKelasValue, password
        ]);
        res.status(201).json({ message: 'Data siswa berhasil ditambahkan.' });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            // Menangani error duplikasi primary key
            return res.status(400).json({
                message: 'NISN sudah terdaftar. Silakan gunakan NISN yang berbeda.',
                detail: err.sqlMessage
            });
        }

        console.error('Error inserting siswa:', err);
        res.status(500).json({ message: 'Terjadi kesalahan saat menambahkan data siswa.' });
    }
});

app.delete('/api/siswa/:nisn', async (req, res) => {
    const { nisn } = req.params;
    try {
        const deleteQuery = 'DELETE FROM siswa WHERE nisn = ?';
        const [result] = await db.query(deleteQuery, [nisn]);

        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'Siswa berhasil dihapus.' });
        } else {
            res.status(404).json({ message: 'Siswa tidak ditemukan.' });
        }
    } catch (error) {
        console.error("Error deleting Siswa:", error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
});

// app.get('/api/siswa/:nisn', async (req, res) => {
//     const { nisn } = req.params;

//     try {
//         const query = 'SELECT * FROM siswa WHERE nisn = ?';
//         const [result] = await db.execute(query, [nisn]);

//         if (result.length > 0) {
//             res.status(200).json(result[0]);
//         } else {
//             res.status(404).json({ message: 'Siswa tidak ditemukan.' });
//         }
//     } catch (error) {
//         console.error('Error mengambil data Siswa:', error);
//         res.status(500).json({ message: 'Terjadi kesalahan pada server!' });
//     }
// });


app.get('/api/siswa/:nisn', async (req, res) => {
    const { nisn } = req.params;

    try {
        // Query pertama untuk mengambil data siswa berdasarkan NISN
        const siswaQuery = 'SELECT * FROM siswa WHERE nisn = ?';
        const [siswaResult] = await db.execute(siswaQuery, [nisn]);

        // Mengecek apakah siswa ditemukan
        if (siswaResult.length === 0) {
            return res.status(404).json({ message: 'Siswa tidak ditemukan.' });
        }

        const siswa = siswaResult[0];

        // Query kedua untuk mengambil data nama kelas berdasarkan id_kelas
        const kelasQuery = 'SELECT nama_kelas FROM kelas WHERE id = ?';
        const [kelasResult] = await db.execute(kelasQuery, [siswa.id_kelas]);

        // Jika data kelas ditemukan, tambahkan nama_kelas ke objek siswa
        if (kelasResult.length > 0) {
            siswa.nama_kelas = kelasResult[0].nama_kelas;
        } else {
            siswa.nama_kelas = 'Tidak tersedia'; // Jika tidak ditemukan
        }

        // Mengirimkan data siswa yang sudah dilengkapi dengan nama_kelas
        res.status(200).json(siswa);

    } catch (error) {
        console.error('Error mengambil data Siswa:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server!' });
    }
});

app.get('/api/tahun-ajaran', async (req, res) => {
    try {
        const query = 'SELECT * FROM tahun_ajaran'; // Pastikan tabel 'siswa' ada
        const [rows] = await db.query(query);

        if (rows.length > 0) {
            res.status(200).json(rows);
        } else {
            res.status(404).json({ message: 'Tidak ada data siswa ditemukan.' });
        }
    } catch (error) {
        console.error('Error mengambil data siswa:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
});

app.post('/api/tahun-ajaran', async (req, res) => {
    const { nama_tahun_ajaran, semester, tanggal_mulai, tanggal_selesai } = req.body;

    // Validasi input (pastikan semua data ada)
    if (!nama_tahun_ajaran || !semester || !tanggal_mulai || !tanggal_selesai) {
        return res.status(400).json({ message: 'Semua field harus diisi!' });
    }

    // Query SQL untuk menyimpan data tahun ajaran baru
    const query = `
        INSERT INTO tahun_ajaran (nama_tahun_ajaran, semester, tanggal_mulai, tanggal_selesai)
        VALUES (?, ?, ?, ?)
    `;

    try {
        await db.query(query, [nama_tahun_ajaran, semester, tanggal_mulai, tanggal_selesai]);
        res.status(201).json({ message: 'Tahun Ajaran berhasil ditambahkan.' });
    } catch (err) {
        console.error('Error inserting tahun ajaran:', err);
        return res.status(500).json({ message: 'Terjadi kesalahan saat menambahkan tahun ajaran.' });
    }
});

app.get('/api/tahun-ajaran/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Query untuk mendapatkan Tahun Ajaran berdasarkan ID
        const query = 'SELECT * FROM tahun_ajaran WHERE id = ?';
        const [result] = await db.execute(query, [id]);

        // Jika data ditemukan, kirimkan sebagai response
        if (result.length > 0) {
            res.status(200).json(result[0]);
        } else {
            res.status(404).json({ message: 'Tahun Ajaran tidak ditemukan' });
        }
    } catch (error) {
        console.error('Error mengambil data Tahun Ajaran:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server!' });
    }
});


app.put('/api/tahun-ajaran/:id', async (req, res) => {
    const { id } = req.params;
    const { nama_tahun_ajaran, tanggal_mulai, tanggal_selesai, semester } = req.body;

    try {
        const [result] = await db.execute(
            `UPDATE tahun_ajaran 
             SET nama_tahun_ajaran = ?, tanggal_mulai = ?, tanggal_selesai = ?, semester = ? 
             WHERE id = ?`,
            [nama_tahun_ajaran, tanggal_mulai, tanggal_selesai, semester, id]
        );
        console.log('Data untuk update:', { nama_tahun_ajaran, semester, tanggal_mulai, tanggal_selesai, id });
        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'Tahun Ajaran berhasil diperbarui' });
        } else {
            res.status(404).json({ message: 'Tahun Ajaran tidak ditemukan' });
        }
    } catch (error) {
        console.error('Error memperbarui Tahun Ajaran:', error);
        res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
    }
});


app.delete('/api/tahun-ajaran/:id', async (req, res) => {
    const { id } = req.params; // Ambil ID dari parameter URL
    try {
        const deleteQuery = 'DELETE FROM tahun_ajaran WHERE id = ?';
        const [result] = await db.query(deleteQuery, [id]);
        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'Tahun ajaran berhasil dihapus.' });
        } else {
            res.status(404).json({ message: 'Tahun ajaran tidak ditemukan.' });
        }
    } catch (error) {
        console.error("Error deleting Tahun Ajaran:", error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
});

app.get('/api/kelas', async (req, res) => {
    try {
        const filterTahunAjaran = req.query.tahun_ajaran || null;

        // Query dasar: ambil data kelas, nama pegawai, nama tahun ajaran, dan semester
        let query = `
            SELECT k.id, k.nama_kelas, k.nip, 
                   IFNULL(p.nama_pegawai, 'Nama Pegawai Tidak Ada') AS nama_pegawai, 
                   k.id_tahun_ajaran, k.tingkatan, 
                   ta.nama_tahun_ajaran, ta.semester  -- Tambahkan semester
            FROM kelas k
            LEFT JOIN pegawai p ON k.nip = p.nip
            LEFT JOIN tahun_ajaran ta ON k.id_tahun_ajaran = ta.id
        `;

        const params = [];

        // Tambahkan filter hanya jika tahun ajaran disediakan
        if (filterTahunAjaran) {
            query += ` WHERE k.id_tahun_ajaran = ?`;
            params.push(filterTahunAjaran);
        }

        // Eksekusi query
        const [rows] = await db.query(query, params);

        // Kirimkan hasil ke frontend
        if (rows.length > 0) {
            console.log('Data kelas yang dikirimkan:', rows);
            res.json(rows);
        } else {
            console.log('Tidak ada data kelas yang ditemukan.');
            res.json([]); // Kirim array kosong jika tidak ada data
        }
    } catch (error) {
        console.error('Terjadi kesalahan:', error);
        res.status(500).json({ error: 'Terjadi kesalahan saat memproses data.' });
    }
});

app.get('/api/kelas/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Query untuk mendapatkan data kelas beserta pegawai dan siswa yang terdaftar
        const query = `
            SELECT k.id, 
                   k.nama_kelas, 
                   k.nip, 
                   IFNULL(p.nama_pegawai, 'Nama Pegawai Tidak Ada') AS nama_pegawai, 
                   k.id_tahun_ajaran, 
                   k.tingkatan, 
                   s.nisn AS siswa_nisn,
                   IFNULL(s.nama_siswa, 'Nama Siswa Tidak Ada') AS nama_siswa
            FROM kelas k
            LEFT JOIN pegawai p ON k.nip = p.nip
            LEFT JOIN siswa s ON k.id = s.id_kelas
            WHERE k.id = ?
        `;

        // Menjalankan query dengan parameter ID kelas
        const [result] = await db.execute(query, [id]);

        // Mengecek apakah data ditemukan
        if (result.length > 0) {
            const kelasData = {
                id: result[0].id,
                nama_kelas: result[0].nama_kelas,
                nip: result[0].nip,
                nama_pegawai: result[0].nama_pegawai,
                id_tahun_ajaran: result[0].id_tahun_ajaran,
                tingkatan: result[0].tingkatan,
                siswa: result.map(row => ({
                    nisn: row.siswa_nisn,  // NISN
                    nama_siswa: row.nama_siswa  // Nama Siswa
                }))
            };

            res.status(200).json(kelasData);
        } else {
            res.status(404).json({ message: 'Kelas tidak ditemukan' });
        }
    } catch (error) {
        console.error('Error mengambil data Kelas:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server!' });
    }
});

app.get('/api/no-class', async (req, res) => {
    try {
        const [result] = await db.query('SELECT * FROM siswa WHERE id_kelas IS NULL');
        console.log('Hasil Query:', result); // Tambahkan log ini
        if (result.length === 0) {
            return res.status(404).json({ message: 'Tidak ada siswa tanpa kelas.' });
        }
        res.json({ siswa: result });
    } catch (err) {
        console.error('Database Error:', err);
        return res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
    }
});

app.put('/api/move/:nisn', async (req, res) => {
    console.log('Rute PUT dipanggil');
    const nisn = req.params.nisn;
    const { id_kelas } = req.body;

    if (!nisn || !id_kelas) {
        return res.status(400).json({ message: 'nisn dan id_kelas wajib ada' });
    }

    const query = 'UPDATE siswa SET id_kelas = ? WHERE nisn = ?';

    try {
        // Menggunakan query() untuk menjalankan query
        const [result] = await db.execute(query, [id_kelas, nisn]);

        if (result.affectedRows > 0) {
            return res.status(200).json({ message: 'Siswa berhasil dipindahkan ke kelas baru' });
        } else {
            return res.status(404).json({ message: 'Siswa tidak ditemukan' });
        }
    } catch (err) {
        console.error('Gagal memperbarui siswa:', err);
        return res.status(500).json({ message: 'Gagal memperbarui siswa' });
    }
});



app.put('/api/siswa/move/:nisn', async (req, res) => {
    const { nisn } = req.params;


    try {
        // Query untuk memindahkan siswa (menghapus dari kelas)
        const moveQuery = `
            UPDATE siswa 
            SET id_kelas = NULL  
            WHERE nisn = ?`;

        const [result] = await db.execute(moveQuery, [nisn]); // Menunggu query selesai

        // Mengecek apakah ada baris yang terpengaruh
        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'Siswa berhasil dipindahkan atau dihapus dari kelas!' });
        } else {
            res.status(404).json({ message: 'Siswa tidak ditemukan dengan NISN tersebut.' });
        }
    } catch (error) {
        // Menangani kesalahan jika terjadi masalah dengan database
        console.error('Error memindahkan siswa:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server!' });
    }
});

app.get('/api/siswa/:id_kelas', async (req, res) => {
    try {
        const id_kelas = req.params.id_kelas;
        const [rows] = await db.query(
            `SELECT nisn, nama FROM siswa WHERE id_kelas = ?`,
            [id_kelas]
        );
        res.json(rows);
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ error: 'Failed to fetch students' });
    }
});


app.put('/api/kelas/:id', async (req, res) => {
    const { nama_kelas, pegawai_id, tahun_ajaran_id, tingkatan } = req.body;

    // Validasi jika data tidak ada, ubah menjadi null
    const kelasUpdate = {
        nama_kelas: nama_kelas || null,
        pegawai_id: pegawai_id || null,
        tahun_ajaran_id: tahun_ajaran_id || null,
        tingkatan: tingkatan || null,
    };

    try {
        // Pastikan parameter hanya mengandung data valid
        const result = await db.query(
            `UPDATE kelas 
             SET 
                nama_kelas = ?, 
                nip = ?, 
                id_tahun_ajaran = ?, 
                tingkatan = ?
             WHERE id = ?`,
            [kelasUpdate.nama_kelas, kelasUpdate.pegawai_id, kelasUpdate.tahun_ajaran_id, kelasUpdate.tingkatan, req.params.id]
        );
        res.json({ success: true, message: 'Data kelas berhasil diperbarui.' });
    } catch (error) {
        console.error('Error memperbarui Kelas:', error);
        res.status(500).json({ success: false, message: 'Gagal memperbarui kelas.' });
    }
});


app.post('/api/kelas', async (req, res) => {
    const { nama_kelas, pegawai_id, tahun_ajaran_id, tingkatan } = req.body;

    console.log('Received data:', req.body);

    // Validasi input
    if (!nama_kelas || !pegawai_id || !tahun_ajaran_id || !tingkatan) {
        return res.status(400).json({ success: false, message: 'Semua kolom harus diisi!' });
    }

    try {
        // Check if pegawai_id exists in the pegawai table
        const checkQuery = `SELECT * FROM pegawai WHERE nip = ?`;
        const [pegawaiResult] = await db.query(checkQuery, [pegawai_id]);

        if (pegawaiResult.length === 0) {
            return res.status(400).json({ success: false, message: 'NIP tidak ditemukan di tabel pegawai!' });
        }

        // If NIP exists, proceed with the insert
        const query = `
            INSERT INTO kelas (nama_kelas, nip, id_tahun_ajaran, tingkatan) 
            VALUES (?, ?, ?, ?)
        `;
        const [result] = await db.query(query, [nama_kelas, pegawai_id, tahun_ajaran_id, tingkatan]);

        console.log('Data successfully inserted:', result);
        res.status(201).json({ success: true, message: 'Kelas berhasil ditambahkan' });
    } catch (err) {
        console.error('Error inserting data:', err);
        res.status(500).json({ success: false, message: 'Error inserting data', error: err.message });
    }
});


app.delete('/api/kelas/:id', async (req, res) => {
    const { id } = req.params;  // Mengambil ID dari parameter URL
    console.log('ID yang diterima API:', id);

    // Memastikan ID yang diterima valid
    if (!id) {
        return res.status(400).json({ message: 'ID tidak valid.' });
    }

    try {
        // Query untuk menghapus kelas berdasarkan ID
        const deleteQuery = 'DELETE FROM kelas WHERE id = ?';
        const [result] = await db.query(deleteQuery, [id]);

        // Mengecek apakah baris yang terpengaruh lebih dari 0
        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'Kelas berhasil dihapus.' });
        } else {
            // Jika tidak ada kelas yang ditemukan dengan ID tersebut
            res.status(404).json({ message: 'Kelas tidak ditemukan.' });
        }
    } catch (error) {
        // Menangani kesalahan yang terjadi selama proses penghapusan
        console.error("Error deleting Kelas:", error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
});

app.get('/kelas/detail/:id', (req, res) => {
    const kelasId = req.params.id;
    // Fetch class details from the database using kelasId
    // Then return the data
    res.json({ message: "Class details for " + kelasId });
});



app.post('/api/mata-pelajaran', async (req, res) => {
    const { id, nama_pelajaran, nip, id_tahun_ajaran, id_kelas } = req.body;

    console.log('Received data:', req.body);

    // Cek apakah sudah ada mata pelajaran dengan nama_pelajaran di kelas yang sama dan tahun ajaran yang sama
    const checkQuery = `
        SELECT mp.*, p.nama_pegawai FROM mata_pelajaran mp
        JOIN pegawai p ON mp.nip = p.nip
        WHERE mp.nama_mata_pelajaran = ? 
        AND mp.id_kelas = ? 
        AND mp.id_tahun_ajaran = ? 
        AND mp.nip != ? 
    `;

    try {
        // Cek apakah mata pelajaran sudah ada di kelas dan tahun ajaran yang sama
        const [existingMatpel] = await db.query(checkQuery, [nama_pelajaran, id_kelas, id_tahun_ajaran, nip]);

        if (existingMatpel.length > 0) {
            const existingTeacherName = existingMatpel[0].nama_pegawai;  // Nama guru yang sudah ada
            return res.status(400).json({
                success: false,
                message: `Mata pelajaran ini sudah diajarkan oleh guru ${existingTeacherName} di kelas ini.`
            });
        }

        // Jika tidak ada duplikasi, lanjutkan untuk memasukkan data
        const query = `
            INSERT INTO mata_pelajaran (id, nama_mata_pelajaran, nip, id_tahun_ajaran, id_kelas) 
            VALUES (?, ?, ?, ?, ?)
        `;

        await db.query(query, [id, nama_pelajaran, nip, id_tahun_ajaran, id_kelas]);
        console.log('Data successfully inserted');
        return res.status(201).json({ success: true, message: 'Mata Pelajaran berhasil ditambahkan' });

    } catch (err) {
        console.error('Error inserting data:', err);
        return res.status(500).json({ success: false, message: 'Error inserting data', error: err.message });
    }
});


// app.get('/api/mata-pelajaran', async (req, res) => {
//     try {
//         const query = 'SELECT * FROM mata_pelajaran';
//         const [rows] = await db.query(query);
//         if (rows.length > 0) {
//             res.status(200).json(rows);
//         } else {
//             res.status(404).json({ message: 'Tidak ada data mata pelajaran ditemukan.' });
//         }
//     } catch (error) {
//         console.error('Error mengambil data mata pelajaran:', error);
//         res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
//     }
// });


app.get('/api/mata-pelajaran/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const query = 'SELECT * FROM  mata_pelajaran WHERE id = ?';
        const [result] = await db.execute(query, [id]);
        if (result.length > 0) {
            res.status(200).json(result[0]);
        } else {
            res.status(404).json({ message: 'Matpel tidak ditemukan' });
        }
    } catch (error) {
        console.error('Error mengambil data Matpel:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server!' });
    }
});

app.get('/api/mapel', async (req, res) => {
    try {
        const filterTahunAjaran = req.query.tahun_ajaran || null;
        const kelasId = req.query.kelas_id || null;

        const nipGuru = req.session.user?.id; // Ambil NIP dari session pengguna

        if (!nipGuru) {
            return res.status(400).json({ error: 'NIP pengguna tidak ditemukan dalam session' });
        }

        // Menyusun query
        let query = `
            SELECT mp.id, mp.nama_mata_pelajaran, mp.nip, 
                   IFNULL(p.nama_pegawai, 'Nama Pegawai Tidak Ada') AS nama_pegawai
            FROM mata_pelajaran mp
            LEFT JOIN pegawai p ON mp.nip = p.nip
            WHERE mp.nip = ?
        `;

        const params = [nipGuru];

        if (filterTahunAjaran) {
            query += ' AND mp.id_tahun_ajaran = ?';
            params.push(filterTahunAjaran);
        }

        if (kelasId) {
            query += ' AND mp.id_kelas = ?';
            params.push(kelasId);
        }

        const [rows] = await db.execute(query, params);
        res.json(rows); // Kirim data mata pelajaran yang sudah difilter
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Terjadi kesalahan saat memproses data.' });
    }
});

app.get('/api/mata-pelajaran', async (req, res) => {
    try {
        const filterTahunAjaran = req.query.tahun_ajaran || null;
        const search = req.query.search ? `%${req.query.search.toLowerCase()}%` : null;

        let query = `
        SELECT mp.id, mp.nama_mata_pelajaran, mp.nip, mp.id_kelas, 
            IFNULL(p.nama_pegawai, 'Nama Pegawai Tidak Ada') AS nama_pegawai,
            IFNULL(k.nama_kelas, 'Nama Kelas Tidak Ada') AS nama_kelas
        FROM mata_pelajaran mp
        LEFT JOIN pegawai p ON mp.nip = p.nip
        LEFT JOIN kelas k ON mp.id_kelas = k.id  -- Misalnya id_kelas menghubungkan dengan id di tabel kelas


        `;

        const params = [];
        const conditions = [];

        if (filterTahunAjaran) {
            conditions.push(`mp.id_tahun_ajaran = ?`);
            params.push(filterTahunAjaran);
        }

        if (search) {
            conditions.push(`LOWER(mp.nama_mata_pelajaran) LIKE ? OR LOWER(mp.nip) LIKE ? OR mp.id = ?`);
            params.push(search, search, parseInt(search) || 0);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        const [rows] = await db.query(query, params);
        res.json(rows);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Terjadi kesalahan saat memproses data.' });
    }
});


// app.get('/api/mata-pelajaran', (req, res) => {
//     const tahunAjaran = req.query.tahun_ajaran;

//     let mataPelajaran = allMataPelajaran;
//     if (tahunAjaran) {
//         mataPelajaran = mataPelajaran.filter(mp => mp.id_tahun_ajaran == tahunAjaran);
//     }

//     res.json(mataPelajaran);
// });

app.put('/api/mata-pelajaran/:id', async (req, res) => {
    const { id } = req.params; // Ambil ID dari parameter URL
    const { nama_pelajaran, id_tahun_ajaran, nip } = req.body; // Ambil data dari body request

    // Validasi data input
    if (!nama_pelajaran || !id_tahun_ajaran || !nip) {
        return res.status(400).json({ error: 'Semua field harus diisi' });
    }

    try {
        // Query untuk update data
        const [result] = await db.execute(
            `UPDATE mata_pelajaran 
             SET nama_mata_pelajaran = ?, id_tahun_ajaran = ?, nip = ? 
             WHERE id = ?`,
            [nama_pelajaran, id_tahun_ajaran, nip, id]
        );

        // Cek apakah data berhasil diperbarui
        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'Mata Pelajaran berhasil diperbarui' });
        } else {
            res.status(404).json({ error: 'Mata Pelajaran tidak ditemukan' });
        }
    } catch (error) {
        console.error('Error saat memperbarui data mata pelajaran:', error);
        res.status(500).json({ error: 'Terjadi kesalahan pada server' });
    }
});

app.delete('/api/mata-pelajaran/:id', async (req, res) => {
    const { id } = req.params;
    console.log('ID yang diterima API:', id);

    if (!id) {
        return res.status(400).json({ message: 'ID tidak valid.' });
    }

    try {
        const deleteQuery = 'DELETE FROM mata_pelajaran WHERE id = ?';
        const [result] = await db.query(deleteQuery, [id]);

        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'Mata Pelajaran berhasil dihapus.' });
        } else {
            res.status(404).json({ message: 'Mata Pelajaran tidak ditemukan.' });
        }
    } catch (error) {
        console.error("Error deleting Mata Pelajaran:", error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
});


app.post('/api/mading', upload.single('image'), async (req, res) => {
    const { judul, konten, tanggal } = req.body;
    const nip = req.session.user?.id;
    const imagePath = req.file ? '/uploads/' + req.file.filename : null; // Menyimpan path gambar jika ada

    console.log('NIP:', nip);
    console.log('Image Path:', imagePath);

    if (!nip) return res.status(401).json({ message: 'Unauthorized' });
    if (!judul || !konten || !tanggal) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        await db.query(
            'INSERT INTO mading (judul, konten, tanggal, nip, foto) VALUES (?, ?, ?, ?, ?)',
            [judul, konten, tanggal, nip, imagePath] // Menambahkan path gambar ke query
        );
        res.status(201).json({ message: 'Mading added successfully' });
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: 'Failed to add mading.' });
    }
});

// Get all mading
app.get('/api/mading', async (req, res) => {
    try {
        const query = 'SELECT * FROM mading'; // Pastikan tabel 'siswa' ada
        const [rows] = await db.query(query);

        if (rows.length > 0) {
            res.status(200).json(rows);
        } else {
            res.status(404).json({ message: 'Tidak ada data siswa ditemukan.' });
        }
    } catch (error) {
        console.error('Error mengambil data siswa:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
});

app.get('/api/mading/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Query untuk mendapatkan Tahun Ajaran berdasarkan ID
        const query = 'SELECT * FROM mading WHERE id = ?';
        const [result] = await db.execute(query, [id]);

        // Jika data ditemukan, kirimkan sebagai response
        if (result.length > 0) {
            res.status(200).json(result[0]);
        } else {
            res.status(404).json({ message: 'Mading tidak ditemukan' });
        }
    } catch (error) {
        console.error('Error mengambil data Mading:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server!' });
    }
});

app.delete('/api/mading/:id', async (req, res) => {
    const { id } = req.params; // Ambil ID dari parameter URL
    try {
        // Query untuk menghapus data dari tabel tahun_ajaran
        const deleteQuery = 'DELETE FROM mading WHERE id = ?';
        const [result] = await db.query(deleteQuery, [id]);

        // Cek apakah data berhasil dihapus
        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'Pengumuman berhasil dihapus.' });
        } else {
            res.status(404).json({ message: 'Pengumuman ajaran tidak ditemukan.' });
        }
    } catch (error) {
        // Log error untuk debugging
        console.error("Error deleting Pengumumann:", error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
});

app.get('/api/siswa/kelas/:kelasId', async (req, res) => {
    try {
        const { kelasId } = req.params; // Ambil kelasId dari URL

        if (!kelasId) {
            return res.status(400).json({ message: 'Parameter kelas diperlukan.' });
        }

        // Query untuk mencari siswa berdasarkan kelas
        const query = 'SELECT * FROM siswa WHERE id_kelas = ?';
        const [rows] = await db.query(query, [kelasId]); // Gunakan kelasId yang diambil dari URL

        if (rows.length > 0) {
            res.status(200).json(rows); // Kirim data siswa jika ditemukan
        } else {
            res.status(404).json(`{ message: Tidak ada data siswa ditemukan untuk kelas ${kelasId}. }`);
        }
    } catch (error) {
        console.error('Error mengambil data siswa berdasarkan kelas:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
});

app.get('/api/kelas-by-tahun-ajaran', async (req, res) => {
    try {
        const filterTahunAjaran = req.query.tahun_ajaran_id || null;

        // Mengambil NIP dari session pengguna yang sedang login
        const nipGuru = req.session.user?.id; // Mengambil NIP dari session

        if (!nipGuru) {
            return res.status(403).json({ error: 'Akses ditolak: NIP pengguna tidak ditemukan dalam session' });
        }

        // Menyusun query untuk mengambil kelas berdasarkan nipGuru dan tahun ajaran
        let query = `
            SELECT DISTINCT k.id, k.nama_kelas, k.tingkatan
            FROM kelas k
            JOIN mata_pelajaran mp ON k.id = mp.id_kelas
            WHERE mp.nip = ? 
        `;

        const params = [nipGuru];

        if (filterTahunAjaran) {
            query += ' AND mp.id_tahun_ajaran = ?';  // Only add this part if filterTahunAjaran exists
            params.push(filterTahunAjaran);
        }

        const [rows] = await db.execute(query, params);
        res.json(rows); // Mengirimkan daftar kelas yang sesuai dengan NIP pengguna dan filter lainnya
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Terjadi kesalahan saat memproses data.' });
    }
});

// Endpoint untuk mengambil data mata pelajaran berdasarkan tahun ajaran
app.get('/api/data-mapel', async (req, res) => {
    const { tahun_ajaran_id } = req.query;

    try {
        let query = 'SELECT * FROM mata_pelajaran';
        const params = [];

        // Jika tahun ajaran dipilih, tambahkan kondisi WHERE
        if (tahun_ajaran_id) {
            query += ' WHERE id_tahun_ajaran = ?';
            params.push(tahun_ajaran_id);
        }

        const [rows] = await db.query(query, params);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Mata pelajaran tidak ditemukan.' });
        }

        res.status(200).json(rows);
    } catch (error) {
        console.error('Error saat mengambil data mata pelajaran:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
});


app.post('/api/update-nilai', async (req, res) => {
    const { gradestype, grade, id_tahun_ajaran, id_matpel, id_kelas, nisn } = req.body;

    // Ambil nip dari session
    const nip = req.session.user?.id; // Atau ambil dari JWT jika menggunakan token

    if (!nip) {
        return res.status(401).json({ message: 'User tidak terautentikasi.' });
    }

    // Validasi data
    if (!gradestype || !grade || !id_tahun_ajaran || !id_matpel || !id_kelas || !nisn || !nip) {
        return res.status(400).json({ error: 'Semua data wajib diisi.' });
    }

    try {
        const query = `
            INSERT INTO grades (gradesType, grade, id_tahun_ajaran, id_matpel, id_kelas, nisn, nip)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        await db.execute(query, [gradestype, grade, id_tahun_ajaran, id_matpel, id_kelas, nisn, nip]);
        res.status(201).json({ message: 'Data nilai berhasil disimpan.' });
    } catch (error) {
        console.error('Error menyimpan ke database:', error);
        res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
    }
});

// app.post('/api/update-nilai', async (req, res) => {
//     const { gradestype, grade, id_tahun_ajaran, id_kelas, id_matpel, nisn, status, catatan } = req.body;
//     const nip = req.session.user?.id; // Atau ambil dari JWT jika menggunakan token

//     if (!nip) {
//         return res.status(401).json({ message: 'User tidak terautentikasi.' });
//     }

//     // Validasi input
//     let missingFields = [];

//     if (!gradestype) missingFields.push('Type Nilai');
//     if (!grade) missingFields.push('Nilai');
//     if (!id_tahun_ajaran) missingFields.push('Tahun Ajaran');
//     if (!id_kelas) missingFields.push('Kelas');
//     if (!id_matpel) missingFields.push('Mata Pelajaran');
//     if (!nisn) missingFields.push('NISN');
    
//     if (missingFields.length > 0) {
//         return res.status(400).json({ error: 'Data tidak lengkap: ' + missingFields.join(', ') });
//     }

//     // Cek apakah nilai sudah ada di database
//     const checkQuery = `
//         SELECT * FROM grades
//         WHERE id_tahun_ajaran = ? AND id_kelas = ? AND id_matpel = ? AND gradesType = ? AND nisn = ?
//     `;
//     try {
//         const [existingData] = await db.query(checkQuery, [id_tahun_ajaran, id_kelas, id_matpel, gradestype, nisn]);

//         if (existingData.length > 0) {
//             // Jika nilai sudah ada, update nilai, status, dan catatan
//             const updateQuery = `
//                 UPDATE grades
//                 SET grade = ?, status = ?, catatan = ?, nip = ?
//                 WHERE id_tahun_ajaran = ? AND id_kelas = ? AND id_matpel = ? AND gradesType = ? AND nisn = ?
//             `;
//             await db.query(updateQuery, [grade, status, catatan, nip, id_tahun_ajaran, id_kelas, id_matpel, gradestype, nisn]);

//             return res.status(200).json({ message: 'Nilai berhasil diupdate' });
//         } else {
//             // Jika nilai belum ada, simpan nilai baru, status dan catatan akan NULL secara default
//             const insertQuery = `
//                 INSERT INTO grades (id_tahun_ajaran, id_kelas, id_matpel, gradesType, grade, nisn, nip, gradeStatus, catatan)
//                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
//             `;
//             await db.query(insertQuery, [id_tahun_ajaran, id_kelas, id_matpel, gradestype, grade, nisn, nip, status || null, catatan || null]);

//             return res.status(200).json({ message: 'Nilai berhasil disimpan' });
//         }
//     } catch (error) {
//         console.error('Gagal mengupdate nilai:', error);
//         res.status(500).json({ error: 'Terjadi kesalahan saat mengupdate nilai' });
//     }
// });

app.get('/api/get-nilai/:nisn', async (req, res) => {
    const { nisn } = req.params;
    const { jenisNilai, tahunAjaran, kelas, mapel } = req.query;


    if (!tahunAjaran || !kelas || !mapel || !jenisNilai) {
        return res.status(400).json({ error: 'Parameter tidak lengkap' });
    }

    const query = `
        SELECT nisn, grade AS nilai
        FROM grades
        WHERE nisn = ? AND id_tahun_ajaran = ? AND id_kelas = ? AND id_matpel = ? AND gradesType = ?
    `;

    try {
        const [results] = await db.query(query, [nisn, tahunAjaran, kelas, mapel, jenisNilai]);
        res.json(results);
    } catch (error) {
        console.error('Error pada endpoint /api/get-nilai:', error);
        res.status(500).json({ error: 'Terjadi kesalahan pada server' });
    }
});

// Misal menggunakan Express.js
// Misal menggunakan Express.js
app.get('/api/dataMapel/:nip', async (req, res) => {
    const { nip } = req.params;  // Mengambil nip dari path parameter
    const { tahun_ajaran_id } = req.query;  // Mendapatkan tahun ajaran dari query parameter

    if (!tahun_ajaran_id || !nip) {
        return res.status(400).json({ message: 'Tahun ajaran atau NIP tidak valid' });
    }

    try {
        // Query untuk mendapatkan mata pelajaran berdasarkan nip dan tahun ajaran
        const query = `
            SELECT * FROM mapel
            WHERE nip = ? AND id_tahun_ajaran = ?
        `;
        const [rows] = await db.execute(query, [nip, tahun_ajaran_id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Tidak ada mata pelajaran ditemukan' });
        }

        res.json(rows);  // Mengirimkan data mata pelajaran
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan saat mengambil data' });
    }
});

app.get('/api/grades/:kelasId/:matpelId', async (req, res) => {
    const { kelasId, matpelId } = req.params;

    if (!kelasId || !matpelId) {
        return res.status(400).json({ error: 'Kelas ID dan Mata Pelajaran ID harus disertakan.' });
    }

    const query = `
        SELECT g.nisn, s.nama_siswa, g.gradesType, g.grade, g.gradeStatus, g.catatan
        FROM grades g
        JOIN siswa s ON g.nisn = s.nisn
        WHERE g.id_kelas = ? AND g.id_matpel = ? AND g.gradesType IN ('uts', 'uas', 'tugas');
    `;

    try {
        const [results] = await db.execute(query, [kelasId, matpelId]);

        console.log('Hasil Query:', results);

        const nilaiAkhir = results.reduce((acc, row) => {
            const { nisn, nama_siswa, gradesType, grade, gradeStatus, catatan } = row;

            console.log(`NISN: ${nisn}, GradesType: ${gradesType}, Grade: ${grade}, GradeStatus: ${gradeStatus}, Catatan: ${catatan}`);

            if (!acc[nisn]) {
                acc[nisn] = {
                    nisn,
                    nama_siswa,
                    uts: 0,
                    uas: 0,
                    tugas: 0,
                    nilai_akhir: 0,
                    gradeStatus: gradeStatus || '',  // Menyimpan gradeStatus
                    catatan: catatan || ''           // Menyimpan catatan
                };
            }

            // Pastikan grade adalah angka yang valid
            if (gradesType.toLowerCase() === 'uts') {
                acc[nisn].uts = grade ? Number(grade) : 0;
            } else if (gradesType.toLowerCase() === 'uas') {
                acc[nisn].uas = grade ? Number(grade) : 0;
            } else if (gradesType.toLowerCase() === 'tugas') {
                acc[nisn].tugas = grade ? Number(grade) : 0;
            }

            // Simpan gradeStatus dan catatan terakhir (terutama jika ada perubahan)
            if (gradeStatus) acc[nisn].gradeStatus = gradeStatus;
            if (catatan) acc[nisn].catatan = catatan;

            return acc;
        }, {});

        console.log('Nilai Setelah Pengelompokan:', nilaiAkhir);

        const finalResults = Object.values(nilaiAkhir).map(siswa => {
            console.log(`Menghitung nilai akhir untuk ${siswa.nisn}: UTS=${siswa.uts}, UAS=${siswa.uas}, Tugas=${siswa.tugas}`);

            // Pastikan ada nilai untuk uts, uas, dan tugas
            if (siswa.uts !== null && siswa.uas !== null && siswa.tugas !== null) {
                siswa.nilai_akhir = ((siswa.uts * 0.4) + (siswa.uas * 0.4) + (siswa.tugas * 0.2)).toFixed(1);
            } else {
                siswa.nilai_akhir = 0;
            }

            // Status dan catatan sudah ada dalam siswa
            console.log(`Nilai akhir untuk ${siswa.nisn}: ${siswa.nilai_akhir}, Status: ${siswa.gradeStatus}, Catatan: ${siswa.catatan}`);
            return siswa;
        });

        res.json(finalResults);
    } catch (err) {
        console.error("Error executing query:", err);
        res.status(500).json({ error: 'Gagal memuat data nilai' });
    }
});

app.get('/api/nilai-akhir', async (req, res) => {
    const { nisn, jenisNilai, tahunAjaran, kelas, mapel } = req.query;

    if (!nisn || !jenisNilai || !tahunAjaran || !kelas || !mapel) {
        return res.status(400).json({
            error: "Semua parameter (nisn, jenisNilai, tahunAjaran, kelas, mapel) harus disertakan.",
        });
    }

    try {
        // Ambil ID Kelas dan Mata Pelajaran berdasarkan nama
        const getKelasIdQuery = 'SELECT id FROM kelas WHERE nama_kelas = ?';
        const getMapelIdQuery = 'SELECT id FROM mata_pelajaran WHERE nama_mata_pelajaran = ?';
        
        const [kelasResults] = await db.execute(getKelasIdQuery, [kelas]);
        const [mapelResults] = await db.execute(getMapelIdQuery, [mapel]);

        const kelasId = kelasResults[0]?.id;
        const matpelId = mapelResults[0]?.id;

        if (!kelasId || !matpelId) {
            return res.status(400).json({ error: 'Kelas atau Mata Pelajaran tidak valid.' });
        }

        const query = `
            SELECT g.nisn, s.nama_siswa, g.gradesType, g.grade, g.gradeStatus, g.catatan
            FROM grades g
            JOIN siswa s ON g.nisn = s.nisn
            WHERE g.id_kelas = ? AND g.id_matpel = ? AND g.gradesType IN ('uts', 'uas', 'tugas');
        `;
        
        const [results] = await db.execute(query, [kelasId, matpelId]);
        
        // Kelompokkan data berdasarkan NISN
        const nilaiAkhir = results.reduce((acc, row) => {
            const { nisn, nama_siswa, gradesType, grade, gradeStatus, catatan } = row;

            if (!acc[nisn]) {
                acc[nisn] = {
                    nisn,
                    nama_siswa,
                    uts: 0,
                    uas: 0,
                    tugas: 0,
                    nilai_akhir: 0,
                    gradeStatus: gradeStatus || '',
                    catatan: catatan || ''
                };
            }

            if (gradesType.toLowerCase() === 'uts') {
                acc[nisn].uts = grade ? Number(grade) : 0;
            } else if (gradesType.toLowerCase() === 'uas') {
                acc[nisn].uas = grade ? Number(grade) : 0;
            } else if (gradesType.toLowerCase() === 'tugas') {
                acc[nisn].tugas = grade ? Number(grade) : 0;
            }

            if (gradeStatus) acc[nisn].gradeStatus = gradeStatus;
            if (catatan) acc[nisn].catatan = catatan;

            return acc;
        }, {});

        if (Object.keys(nilaiAkhir).length === 0) {
            return res.status(404).json({ error: 'Tidak ada data nilai yang ditemukan.' });
        }

        // Hitung nilai akhir
        const finalResults = Object.values(nilaiAkhir).map(siswa => {
            if (siswa.uts !== 0 && siswa.uas !== 0 && siswa.tugas !== 0) {
                siswa.nilai_akhir = ((siswa.uts * 0.4) + (siswa.uas * 0.4) + (siswa.tugas * 0.2)).toFixed(1);
            } else {
                siswa.nilai_akhir = 0; 
            }
            return siswa;
        });

        res.json(finalResults);
    } catch (err) {
        console.error("Error executing query:", err);
        res.status(500).json({ error: 'Gagal memuat data nilai' });
    }
});

app.get('/api/mapel/:idKelas', async (req, res) => {
    const { idKelas } = req.params;

    // Query SQL untuk mengambil mata pelajaran berdasarkan id_kelas
    const query = 'SELECT nama_mata_pelajaran, id FROM mata_pelajaran WHERE id_kelas = ?';

    try {
        // Menjalankan query dan menunggu hasilnya
        const [results, fields] = await db.execute(query, [idKelas]);

        // Jika data tidak ditemukan
        if (results.length === 0) {
            return res.status(404).json({ message: 'Mata pelajaran tidak ditemukan untuk kelas ini' });
        }

        // Mengirimkan data mata pelajaran
        res.json(results);

    } catch (err) {
        console.error('Error executing query:', err);
        // Menangani kesalahan server
        res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
});
app.post('/api/update-grade-status', async (req, res) => {
    const { nisn, catatan, status, mapel_id } = req.body;

    // Validasi input
    if (!nisn || !status || !mapel_id) {
        return res.status(400).json({ message: 'Data tidak lengkap. Pastikan nisn, status, dan mapel_id disertakan.' });
    }

    try {
        // Query untuk memperbarui status nilai di database menggunakan db.execute()
        const query = `
            UPDATE grades
            SET gradeStatus = ?, catatan = ?
            WHERE nisn = ? AND id_matpel = ?
        `;

        // Menjalankan query dengan db.execute()
        const [result] = await db.execute(query, [status, catatan || null, nisn, mapel_id]);

        // Periksa apakah ada baris yang diperbarui
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Data tidak ditemukan atau tidak ada perubahan yang dilakukan.' });
        }

        return res.status(200).json({ message: 'Status berhasil diperbarui.' });
    } catch (err) {
        console.error('Error executing query:', err);
        return res.status(500).json({ message: 'Gagal memperbarui status. Silakan coba lagi.' });
    }
});

app.get('/api/get-grades', async (req, res) => {
    const { nisn, id_matpel } = req.query;

    // Validasi query parameters
    if (!nisn || !id_matpel) {
        return res.status(400).json({ error: 'Parameter nisn dan id_matpel diperlukan dan harus berupa angka.' });
    }

    const query = `
        SELECT g.gradeStatus, g.catatan
        FROM grades g
        WHERE g.nisn = ? AND g.id_matpel = ?;
    `;

    try {
        const [results] = await db.execute(query, [nisn, id_matpel]);

        if (results.length === 0) {
            return res.status(404).json({ error: 'Data status dan catatan tidak ditemukan.' });
        }

        // Menghitung status dan catatan
        let status = 'Tidak Diterima'; // Default status jika tidak ada status "Diterima"
        let catatan = '';

        // Cek apakah ada status "Diterima" atau "Lulus"
        for (let row of results) {
            if (row.gradeStatus === 'Diterima' || row.gradeStatus === 'Lulus') {
                status = row.gradeStatus;  // Pilih status pertama yang Diterima atau Lulus
                catatan = row.catatan;     // Ambil catatan yang sesuai
                break;  // Keluar setelah menemukan status Diterima atau Lulus
            }
        }

        // Jika status masih "Tidak Diterima", ambil status yang pertama
        if (status === 'Tidak Diterima' && results.length > 0) {
            status = results[0].gradeStatus;
            catatan = results[0].catatan;
        }

        // Hasil akhir
        res.json({
            nisn: nisn,
            status: status,
            catatan: catatan
        });

    } catch (err) {
        console.error('Error saat mengeksekusi query:', err);
        res.status(500).json({ error: 'Gagal memuat data status dan catatan.' });
    }
});


app.get('/api/grades/:tahunAjaran', async (req, res) => {
    const { tahunAjaran } = req.params;
    const nisn = req.session.user?.id; // Pastikan ini mengambil NISN dari sesi pengguna

    if (!tahunAjaran) {
        return res.status(400).json({ error: 'Tahun ajaran harus disertakan.' });
    }

    if (!nisn) {
        return res.status(401).json({ error: 'Anda belum login.' });
    }

    const query = `
        SELECT g.nisn, s.nama_siswa, g.gradesType, g.grade, g.gradeStatus, g.catatan, m.nama_mata_pelajaran
        FROM grades g
        JOIN siswa s ON g.nisn = s.nisn
        JOIN mata_pelajaran m ON g.id_matpel = m.id
        WHERE g.id_tahun_ajaran = ? AND g.nisn = ? AND g.gradesType IN ('uts', 'uas', 'tugas');
    `;

    try {
        const [results] = await db.execute(query, [tahunAjaran, nisn]);

        // Transformasi hasil
        const nilaiAkhir = results.reduce((acc, row) => {
            const { gradesType, grade, nama_mata_pelajaran, gradeStatus } = row;

            // Inisialisasi data jika belum ada untuk mata pelajaran tersebut
            if (!acc[nama_mata_pelajaran]) {
                acc[nama_mata_pelajaran] = {
                    matpel: nama_mata_pelajaran,
                    uts: null,
                    uas: null,
                    tugas: null,
                    nilai_akhir: null, // Kosongkan jika belum disetujui
                };
            }

            // Mengelompokkan nilai berdasarkan gradeType
            if (gradesType.toLowerCase() === 'uts') {
                acc[nama_mata_pelajaran].uts = grade ? Number(grade) : null;
            } else if (gradesType.toLowerCase() === 'uas') {
                acc[nama_mata_pelajaran].uas = grade ? Number(grade) : null;
            } else if (gradesType.toLowerCase() === 'tugas') {
                acc[nama_mata_pelajaran].tugas = grade ? Number(grade) : null;
            }

            // Hanya hitung nilai akhir jika gradeStatus "setuju"
            if (gradeStatus?.toLowerCase() === 'setuju') {
                const { uts, uas, tugas } = acc[nama_mata_pelajaran];
                // Hitung nilai akhir jika semua nilai ada dan status "setuju"
                if (uts !== null && uas !== null && tugas !== null) {
                    acc[nama_mata_pelajaran].nilai_akhir = ((uts * 0.4) + (uas * 0.4) + (tugas * 0.2)).toFixed(1);
                }
            }

            return acc;
        }, {});

        // Transformasi objek menjadi array untuk respons JSON
        const finalResults = Object.values(nilaiAkhir);

        res.json(finalResults);
    } catch (err) {
        console.error("Error executing query:", err);
        res.status(500).json({ error: 'Gagal memuat data nilai' });
    }
});
const users = [
    { email: 'user@example.com', username: 'user123' }
];

app.post('/api/reset-password', async (req, res) => {
    const { email } = req.body;

    try {
        // Validasi format email
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Format email tidak valid' });
        }

        // Generate token unik untuk reset password
        const resetToken = uuidv4();

        // Simulasi menyimpan token di database (ganti dengan penyimpanan yang aman)
        // Anda bisa menyimpan token untuk email ini di database atau array, misalnya:
        const resetTokens = [];  // Menyimpan token reset sesuai email
        resetTokens.push({ email, resetToken });

        // Konfigurasi transporter untuk mengirim email
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'your-email@gmail.com',  // Ganti dengan email pengirim
                pass: 'your-email-password'    // Ganti dengan password aplikasi atau autentikasi OAuth2
            }
        });

        const resetLink = `http://localhost:3000/reset-password/${resetToken}`;
        const mailOptions = {
            from: 'your-email@gmail.com',
            to: email,
            subject: 'Reset Password',
            text: `Klik link ini untuk mereset password Anda: ${resetLink}`
        };

        // Kirim email menggunakan await untuk menangani pengiriman email secara async
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Link reset password telah dikirim ke email Anda' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Gagal mengirim email' });
    }
});

// Endpoint untuk halaman reset password
app.get('/reset-password/:token', async (req, res) => {
    const { token } = req.params;

    try {
        // Cek token di database (simulasi)
        const user = users.find(user => user.resetToken === token);
        if (!user) {
            return res.status(400).json({ message: 'Token tidak valid' });
        }

        res.send(`
            <h3>Atur Kata Sandi Baru</h3>
            <form action="/api/confirm-reset-password" method="POST">
                <input type="password" name="new-password" placeholder="Kata Sandi Baru" required><br>
                <input type="password" name="confirm-password" placeholder="Konfirmasi Kata Sandi Baru" required><br>
                <button type="submit">Atur Kata Sandi</button>
            </form>
        `);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan' });
    }
});

// Endpoint untuk mengonfirmasi reset password dan update kata sandi
app.post('/api/confirm-reset-password', async (req, res) => {
    const { newPassword, confirmPassword, token } = req.body;

    try {
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: 'Kata sandi tidak cocok' });
        }

        // Update password di database (simulasi)
        const user = users.find(user => user.resetToken === token);
        if (user) {
            user.password = newPassword;  // Ganti dengan hashing password di aplikasi nyata
            user.resetToken = null;  // Menghapus token reset setelah sukses
            return res.status(200).json({ message: 'Kata sandi berhasil diperbarui' });
        }

        res.status(400).json({ message: 'Token tidak valid' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan' });
    }
});

app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});


