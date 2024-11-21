const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// Middleware untuk melayani file statis
app.use(express.static(path.join(__dirname, 'public')));

// Routes untuk file HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/fasilitas', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'fasilitas.html'));
});


app.get('/students', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'students.html'));
});

// Jalankan server
app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});