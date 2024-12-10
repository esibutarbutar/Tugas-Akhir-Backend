function loadTahunAjaran() {
    fetch('/api/tahun-ajaran') // Pastikan URL ini benar dan API tahun ajaran tersedia
        .then(response => response.json())
        .then(data => {
            const filterSelect = document.getElementById('kelas-filter');
            data.forEach(tahun => {
                const option = document.createElement('option');
                option.value = tahun.id; // Misalnya id tahun ajaran
                option.textContent = tahun.nama_tahun_ajaran; // Misalnya nama tahun ajaran
                filterSelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

document.getElementById('kelas-filter').addEventListener('change', function() {
    const filterValue  = this.value; // Ambil value tahun ajaran yang dipilih
    loadKelasData(filterValue); // Panggil fungsi loadKelasData dengan filter tahun ajaran
});
document.addEventListener('DOMContentLoaded', () => {
    loadTahunAjaran(); // Memuat daftar tahun ajaran
    loadKelasData();   // Memuat data kelas tanpa filter awal
});

function loadKelasData(filterTahunAjaran = '') {
    const url = filterTahunAjaran
        ? `/api/kelas?tahun_ajaran=${encodeURIComponent(filterTahunAjaran)}`
        : '/api/kelas';

    console.log('Memuat data kelas dari:', url);
    fetch(url)
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            return response.json();
        })
        .then(data => {
            console.log('Data kelas yang diterima:', data);  // Log data yang diterima

            const tbody = document.getElementById('kelas-tbody');
            tbody.innerHTML = ''; // Kosongkan tabel sebelum mengisi data

            if (!data || data.length === 0) {
                console.log('Data tidak ditemukan untuk filter tahun ajaran:', filterTahunAjaran);
                tbody.innerHTML = '<tr><td colspan="6">Data tidak ditemukan</td></tr>';
                return;
            }

            // Filter data berdasarkan tahun ajaran yang dipilih
            const filteredData = data.filter(kelas => {
                if (filterTahunAjaran) {
                    return kelas.id_tahun_ajaran == filterTahunAjaran; // Sesuaikan ID tahun ajaran
                }
                return true; // Jika tidak ada filter, tampilkan semua data
            });

            if (filteredData.length === 0) {
                console.log('Tidak ada data kelas yang sesuai dengan filter tahun ajaran:', filterTahunAjaran);
                tbody.innerHTML = '<tr><td colspan="6">Data tidak ditemukan untuk filter tahun ajaran tersebut.</td></tr>';
                return;
            }

            // Loop untuk menambahkan setiap data kelas ke tabel
            filteredData.forEach(kelas => {
                console.log(kelas); 
                console.log('Nama Pegawai:', kelas.nama_pegawai);  // Log untuk memastikan ada nama_pegawai
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${kelas.id}</td>
                    <td>${kelas.nama_kelas}</td>
                    <td>${kelas.nip} - ${kelas.nama_pegawai || 'Nama Pegawai Tidak Ada'}</td>
                    <td>${kelas.tingkatan}</td>
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
            const tbody = document.getElementById('kelas-tbody');
            tbody.innerHTML = '<tr><td colspan="6">Terjadi kesalahan saat memuat data</td></tr>';
        });
}

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
