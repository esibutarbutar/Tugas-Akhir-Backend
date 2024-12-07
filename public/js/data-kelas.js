// Mengambil data kelas dari API dan menampilkannya dalam tabel
function loadKelasData() {
    fetch('/api/kelas') // Pastikan URL sesuai dengan API backend Anda
        .then(response => response.json())
        .then(data => {
            const tbody = document.getElementById('kelas-tbody');
            tbody.innerHTML = ''; // Kosongkan tabel sebelum diisi
            data.forEach(kelas => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${kelas.id}</td>
                    <td>${kelas.nama_kelas}</td>
                    <td>${kelas.nip}</td>
                    <td>${kelas.id_tahun_ajaran}</td>
                    <td>${kelas.jumlah_siswa}</td>
                    <td>
                        <button onclick="editKelas(${kelas.id})">Edit</button>
                        <button onclick="deleteKelas(${kelas.id})">Delete</button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

// Memanggil fungsi untuk load data kelas saat halaman dimuat
document.addEventListener('DOMContentLoaded', loadKelasData);

// Fungsi untuk mengedit data kelas
function editKelas(id) {
    const kelas = prompt('Masukkan nama kelas yang baru:');
    if (kelas) {
        const deskripsi = prompt('Masukkan deskripsi kelas:');
        fetch(`/api/kelas/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nama_kelas: kelas, deskripsi: deskripsi })
        })
        .then(response => {
            if (response.ok) {
                loadKelasData(); // Refresh data setelah update
            }
        });
    }
}

// Fungsi untuk menghapus kelas
function deleteKelas(id) {
    const confirmDelete = confirm('Apakah Anda yakin ingin menghapus kelas ini?');
    if (confirmDelete) {
        fetch(`/api/kelas/${id}`, {
            method: 'DELETE',
        })
        .then(response => {
            if (response.ok) {
                loadKelasData(); // Refresh data setelah delete
            }
        });
    }
}
