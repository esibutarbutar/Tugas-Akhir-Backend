const express = require('express');
const path = require('path');
const session = require('express-session');
const db = require('./public/js/db.js');
const app = express();
const bodyParser = require('body-parser');
const PORT = 3000;
const multer = require('multer');

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
                    id: user[0].id,
                    name: user[0].name,
                    login_sebagai: login_sebagai
                };
                console.log("Session after login (Siswa):", req.session.user);
                res.status(200).json({
                    message: 'Login berhasil',
                    user: {
                        id: user[0].id,
                        name: user[0].name,
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
    } else if (userRole === 'Pegawai') {
        res.redirect('/dashboard');
    } else {
        res.redirect('/login');
    }
});


app.get('/dashboard', (req, res) => {
    if (req.session.user) {
        if (req.session.user.role === 'Admin') {
            res.redirect('/dashboard-admin');
        } else {
            res.send('Welcome to the User Dashboard');
        }
    } else {
        res.redirect('/login');
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


app.put('/api/pegawai/:nip', async (req, res) => {
    const { nip } = req.params;
    const { namaPegawai, tanggalLahir, tempatLahir, jenisKelamin, alamat, agama, email, noHp, password, nik, tanggalMulaiTugas, jenjangPendidikan, jurusan, roles } = req.body;

    try {
        // Update data pegawai
        const updateQuery = `
            UPDATE pegawai 
            SET nama_pegawai = ?, tanggal_lahir = ?, tempat_lahir = ?, jenis_kelamin = ?, alamat = ?, agama = ?, email = ?, no_hp = ?, password = ?, nik = ?, tanggal_mulai_tugas = ?, jenjang_pendidikan = ?, jurusan = ?
            WHERE nip = ?`;

        const [result] = await db.execute(updateQuery, [
            namaPegawai, tanggalLahir, tempatLahir, jenisKelamin, alamat, agama, email, noHp, password, nik, tanggalMulaiTugas, jenjangPendidikan, jurusan, nip
        ]);

        if (result.affectedRows > 0) {
            // Hapus role lama untuk pegawai
            await db.execute('DELETE FROM pegawai_roles WHERE nip = ?', [nip]);

            // Insert role baru
            for (let role of roles) {
                await db.execute('INSERT INTO pegawai_roles (nip, role_id) VALUES (?, ?)', [nip, role]);
            }

            res.status(200).json({ message: 'Data pegawai berhasil diperbarui!' });
        } else {
            res.status(404).json({ message: 'Pegawai tidak ditemukan.' });
        }
    } catch (error) {
        console.error('Error mengupdate data pegawai:', error);
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


app.post('/api/siswa', (req, res) => {
    const { nisn, nama, jenis_kelamin, tanggal_lahir, alamat } = req.body;
    const sql = `INSERT INTO siswa (nisn, nama, jenis_kelamin, tanggal_lahir, alamat) 
                 VALUES (?, ?, ?, ?, ?, ?)`;
    db.query(sql, [nisn, nama, , jenis_kelamin, tanggal_lahir, alamat], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error saving data');
        }
        res.status(201).send('Data saved successfully');
    });
});



app.delete('/api/siswa/:nisn', async (req, res) => {
    const { nisn } = req.params;
    try {
        const deleteQuery = 'DELETE FROM pegawai WHERE nisn = ?';
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

app.get('/api/siswa/:nisn', async (req, res) => {
    const { nisn } = req.params;

    try {
        const query = 'SELECT * FROM siswa WHERE nisn = ?';
        const [result] = await db.execute(query, [nisn]);

        if (result.length > 0) {
            res.status(200).json(result[0]);
        } else {
            res.status(404).json({ message: 'Siswa tidak ditemukan.' });
        }
    } catch (error) {
        console.error('Error mengambil data Siswa:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server!' });
    }
});

app.put('/api/siswa/:nisn', (req, res) => {
    console.log("Request Body:", req.body);
    console.log("NISN:", req.params.nisn);

    const nisn = req.params.nisn;
    const { nama_siswa, alamat, tempat_lahir, tanggal_lahir } = req.body;

    const siswa = siswaData.find(s => s.nisn === nisn);
    if (!siswa) {
        console.log("Siswa tidak ditemukan!");
        return res.status(404).send({ message: "Siswa tidak ditemukan." });
    }

    siswa.nama_siswa = nama_siswa;
    siswa.alamat = alamat;
    siswa.tempat_lahir = tempat_lahir;
    siswa.tanggal_lahir = tanggal_lahir;

    console.log("Siswa setelah update:", siswa);
    res.send({ message: "Data siswa berhasil diperbarui.", siswa });
});

app.get('/api/siswa/:nisn', async (req, res) => {
    const { nisn } = req.params;

    try {
        const query = 'SELECT * FROM siswa WHERE nisn = ?';
        const [result] = await db.execute(query, [nisn]);

        if (result.length > 0) {
            res.status(200).json(result[0]);
        } else {
            res.status(404).json({ message: 'Siswa tidak ditemukan.' });
        }
    } catch (error) {
        console.error('Error mengambil data Siswa:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server!' });
    }
})

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
        const query = 'SELECT * FROM kelas'; // Pastikan tabel 'siswa' ada
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

app.get('/api/kelas', async (req, res) => {
    try {
        const { tahun_ajaran } = req.query;
        let query = `
            SELECT 
                k.id,
                k.nama_kelas,
                k.nip,
                p.nama_pegawai, 
                k.id_tahun_ajaran,
                ta.nama_tahun_ajaran,
                k.tingkatan
            FROM 
                kelas k
            JOIN 
                pegawai p ON k.nip = p.nip
            JOIN 
                tahun_ajaran ta ON k.id_tahun_ajaran = ta.id;
        `;

        if (tahun_ajaran) {
            query += ` WHERE k.id_tahun_ajaran = ?`;
        }

        query += ` ORDER BY k.nama_kelas ASC`;

        const [rows] = tahun_ajaran
            ? await db.execute(query, [tahun_ajaran])
            : await db.execute(query);

        console.log('Data kelas yang dikirim ke frontend:', rows); // Log data untuk debug
        res.json(rows);
    } catch (error) {
        console.error('Terjadi kesalahan pada server:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
});


app.get('/api/kelas/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const query = 'SELECT * FROM kelas WHERE id = ?';
        const [result] = await db.execute(query, [id]);
        if (result.length > 0) {
            res.status(200).json(result[0]);
        } else {
            res.status(404).json({ message: 'Kelas tidak ditemukan' });
        }
    } catch (error) {
        console.error('Error mengambil data Kelas:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server!' });
    }
});


app.put('/api/kelas/:id', async (req, res) => {
    const { id } = req.params;
    const { nama_kelas, pegawai_id, tahun_ajaran_id, tingkatan } = req.body;

    try {
        // Eksekusi query SQL untuk memperbarui data kelas
        const [result] = await db.execute(
            `UPDATE kelas 
             SET nama_kelas = ?, nip = ?, id = ?, tingkatan = ? 
             WHERE id = ?`,
            [nama_kelas, pegawai_id, tahun_ajaran_id, tingkatan, id]
        );

        // Log untuk melihat data yang akan diupdate
        console.log('Data untuk update:', { nama_kelas, pegawai_id, tahun_ajaran_id, tingkatan, id });

        // Jika query berhasil memperbarui data
        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'Kelas berhasil diperbarui' });
        } else {
            // Jika kelas dengan ID tersebut tidak ditemukan
            res.status(404).json({ message: 'Kelas tidak ditemukan' });
        }
    } catch (error) {
        // Tangani kesalahan
        console.error('Error memperbarui Kelas:', error);
        res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
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
        const query = `
            INSERT INTO kelas (nama_kelas, nip, id_tahun_ajaran, tingkatan) 
            VALUES (?, ?, ?, ?)
        `;
        const [result] = await db.query(query, [nama_kelas, pegawai_id, tahun_ajaran_id, tingkatan]); // Pastikan db.query mendukung async/await

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



app.post('/api/mata-pelajaran', async (req, res) => {
    const { id, nama_pelajaran, nip, id_tahun_ajaran } = req.body;

    console.log('Received data:', req.body);
    if (!id || !nama_pelajaran || !nip || !id_tahun_ajaran) {
        console.log('Missing required fields');
        return res.status(400).json({ success: false, message: 'Field tidak boleh kosong' });
    }

    const query = 'INSERT INTO mata_pelajaran (id, nama_pelajaran, nip, id_tahun_ajaran) VALUES (?, ?, ?, ?)';
    
    try {
        await db.query(query, [id, nama_pelajaran, nip, id_tahun_ajaran]);
        console.log('Data successfully inserted');
        return res.status(201).json({ success: true, message: 'Mata Pelajaran berhasil ditambahkan' });
    } catch (err) {
        console.error('Error inserting data:', err);
        return res.status(500).json({ success: false, message: 'Error inserting data', error: err.message });
    }
});

app.get('/api/mata-pelajaran', async (req, res) => {
    try {
        const query = 'SELECT * FROM mata_pelajaran';
        const [rows] = await db.query(query);
        if (rows.length > 0) {
            res.status(200).json(rows);
        } else {
            res.status(404).json({ message: 'Tidak ada data mata pelajaran ditemukan.' });
        }
    } catch (error) {
        console.error('Error mengambil data mata pelajaran:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
});

app.get('/api/mata-pelajaran/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const query = 'SELECT * FROM mata_pelajaran WHERE id = ?';
        const [result] = await db.execute(query, [id]);
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

app.get('/api/mata-pelajaran', (req, res) => {
    const tahunAjaran = req.query.tahun_ajaran;

    let mataPelajaran = allMataPelajaran;
    if (tahunAjaran) {
        mataPelajaran = mataPelajaran.filter(mp => mp.id_tahun_ajaran == tahunAjaran);
    }

    res.json(mataPelajaran);
});

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
             SET nama_pelajaran = ?, id_tahun_ajaran = ?, nip = ? 
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



app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});


