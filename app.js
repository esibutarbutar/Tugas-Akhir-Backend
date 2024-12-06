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


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); 
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Nama file unik
    }
});

// Inisialisasi upload middleware
const upload = multer({ storage: storage });

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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


app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});


