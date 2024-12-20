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
            query = 'SELECT * FROM siswa WHERE nisn = ?';
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
                    user: {
                        id: user[0].nip,
                        name: user[0].nama_pegawai,
                        role: userRole,
                        login_sebagai: login_sebagai,
                        tempat_lahir: user[0].tempat_lahir,
                        tanggal_lahir: user[0].tanggal_lahir,
                        tanggal_mulai_tugas: user[0].tanggal_mulai_tugas,
                        jenjang_pendidikan: user[0].jenjang_pendidikan,
                        jurusan: user[0].jurusan,
                        golongan: user[0].golongan,
                        nuptk: user[0].nuptk
                    }
                });
            } else if (login_sebagai === 'Siswa' && password === user[0].password) {
                req.session.user = {
                    id: user[0].id, // Pastikan nama kolom sesuai
                    name: user[0].name, // Sesuaikan dengan kolom di tabel siswa
                    role: 'Siswa', // Tambahkan role untuk siswa
                    login_sebagai: login_sebagai
                };
                console.log("Session after login (Siswa):", req.session.user);
                res.status(200).json({
                    message: 'Login berhasil',
                    user: {
                        id: user[0].id,
                        name: user[0].name,
                        role: 'Siswa', // Tambahkan role untuk siswa
                        login_sebagai: login_sebagai
                    }
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
        } else if (role === 'Siswa') {
            res.redirect('/dashboard-siswa');
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
            jenjangPendidikan, jurusan, roles
        } = req.body;

        console.log('Data diterima:', req.body);
        console.log('Roles:', roles);
        console.log('Selected roles:', roles);

        // Validasi roleId harus berupa array
        if (!Array.isArray(roles)) {
            return res.status(400).json({ message: 'roleId harus berupa array!' });
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

        // Insert roles ke tabel pegawai_roles
        for (let role of roles) {
            await db.execute('INSERT INTO pegawai_roles (nip, role_id) VALUES (?, ?)', [nip, role]);
        }

        res.status(201).json({ message: 'Data pegawai dan role berhasil ditambahkan!' });
    } catch (error) {
        console.error('Error menyimpan data:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server!' });
    }
});

app.get('/api/pegawai/:nip', async (req, res) => {
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


// Endpoint PUT untuk update data pegawai
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
        roles,
    } = req.body;

    try {
        // Validasi input jika diperlukan
        if (!namaPegawai || !tanggalLahir || !tempatLahir || !jenisKelamin || !alamat || !agama || !email || !noHp || !nik || !tanggalMulaiTugas || !jenjangPendidikan || !jurusan || !roles) {
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

        // Hapus semua roles yang ada dan masukkan roles baru
        const deleteRolesQuery = `DELETE FROM pegawai_roles WHERE nip = ?`;
        await db.execute(deleteRolesQuery, [nip]);

        const insertRolesQuery = `INSERT INTO pegawai_roles (nip, role_id) VALUES (?, ?)`;
        for (const role of roles) {
            await db.execute(insertRolesQuery, [nip, role]);
        }

        res.status(200).json({ message: 'Data pegawai berhasil diperbarui.' });
    } catch (error) {
        console.error('Error updating data pegawai:', error);
        res.status(500).json({ message: 'Terjadi kesalahan saat memperbarui data pegawai.' });
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
        agama, tanggal_masuk, nama_ayah, nama_ibu, no_hp_ortu, email, nik, anak_ke, status, id_kelas
    } = req.body;

    // Validasi input (pastikan hanya field wajib yang diisi)
    if (!nisn || !nama_siswa || !alamat || !tempat_lahir || !tanggal_lahir || !jenis_kelamin ||
        !agama || !tanggal_masuk || !nama_ayah || !nama_ibu || !no_hp_ortu || !email || !nik || !anak_ke || !status) {
        return res.status(400).json({ message: 'Field wajib harus diisi!' });
    }


    const query = `
INSERT INTO siswa (nisn, nama_siswa, alamat, tempat_lahir, tanggal_lahir, jenis_kelamin,
    agama, tanggal_masuk, nama_ayah, nama_ibu, no_hp_ortu, email, nik, anak_ke, status, id_kelas)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

    // Ganti id_kelas dengan null jika tidak ada
    const idKelasValue = id_kelas ? id_kelas : null;

    try {
        await db.query(query, [
            nisn, nama_siswa, alamat, tempat_lahir, tanggal_lahir, jenis_kelamin,
            agama, tanggal_masuk, nama_ayah, nama_ibu, no_hp_ortu, email, nik, anak_ke, status, idKelasValue
        ]);
        res.status(201).json({ message: 'Data siswa berhasil ditambahkan.' });
    } catch (err) {
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

        // Query dasar: ambil data kelas dan nama pegawai
        let query = `
            SELECT k.id, k.nama_kelas, k.nip, 
                   IFNULL(p.nama_pegawai, 'Nama Pegawai Tidak Ada') AS nama_pegawai, 
                   k.id_tahun_ajaran, k.tingkatan
            FROM kelas k
            LEFT JOIN pegawai p ON k.nip = p.nip
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
    const { id, nama_pelajaran, nip, id_tahun_ajaran } = req.body;

    console.log('Received data:', req.body);
    const query = 'INSERT INTO mata_pelajaran (id, nama_mata_pelajaran, nip, id_tahun_ajaran) VALUES (?, ?, ?, ?)';

    try {
        await db.query(query, [id, nama_pelajaran, nip, id_tahun_ajaran]);
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

app.get('/api/mata-pelajaran', async (req, res) => {
    try {
        const filterTahunAjaran = req.query.tahun_ajaran || null;
        const search = req.query.search ? `%${req.query.search.toLowerCase()}%` : null;

        let query = `
            SELECT mp.id, mp.nama_mata_pelajaran, mp.nip, 
                   IFNULL(p.nama_pegawai, 'Nama Pegawai Tidak Ada') AS nama_pegawai
            FROM mata_pelajaran mp
            LEFT JOIN pegawai p ON mp.nip = p.nip
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

app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});


