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


document.getElementById('add-kelas-btn').addEventListener('click', function () {
    // Mengambil data pegawai dan tahun ajaran dari API atau server
    Promise.all([
        fetch('/api/pegawai'), // Sesuaikan URL dengan API pegawai Anda
        fetch('/api/tahun-ajaran') // Sesuaikan URL dengan API tahun ajaran Anda
    ])
        .then(([pegawaiResponse, tahunAjaranResponse]) => {
            return Promise.all([
                pegawaiResponse.json(),
                tahunAjaranResponse.json()
            ]);
        })
        .then(([pegawaiData, tahunAjaranData]) => {
            const pegawaiOptions = pegawaiData.map(pegawai => {
                return `<option value="${pegawai.nip}">${pegawai.nama_pegawai}</option>`;
            }).join('');

            const tahunAjaranOptions = tahunAjaranData.map(tahun => {
                return `<option value="${tahun.id}">${tahun.nama_tahun_ajaran}</option>`;
            }).join('');

            const tingkatanOptions = ["VII", "VIII", "IX"].map(tingkatan => {
                return `<option value="${tingkatan}">${tingkatan}</option>`;
            }).join('');

            // Menampilkan SweetAlert
            Swal.fire({
                title: 'Tambah Kelas',
                html: `
                    <input id="kelas-name" class="swal2-input" placeholder="Nama Kelas" required>
                    <select id="pegawai-select" class="swal2-input" required>
                        <option value="" disabled selected>Pilih Pegawai</option>
                        ${pegawaiOptions}
                    </select>
                    <select id="tahun-ajaran-select" class="swal2-input" required>
                        <option value="" disabled selected>Pilih Tahun Ajaran</option>
                        ${tahunAjaranOptions}
                    </select>
                    <select id="tingkatan-select" class="swal2-input" required>
                        <option value="" disabled selected>Pilih Tingkatan</option>
                        ${tingkatanOptions}
                    </select>
                `,
                focusConfirm: false,
                preConfirm: () => {
                    const kelasName = document.getElementById('kelas-name').value.trim();
                    const pegawaiId = document.getElementById('pegawai-select').value;
                    const tahunAjaranId = document.getElementById('tahun-ajaran-select').value;
                    const tingkatan = document.getElementById('tingkatan-select').value;

                    if (!kelasName || !pegawaiId || !tahunAjaranId || !tingkatan) {
                        Swal.showValidationMessage('Semua kolom harus diisi!');
                        return null; // Tidak memproses jika ada yang kosong
                    }

                    const kelasData = {
                        nama_kelas: kelasName,
                        pegawai_id: pegawaiId,
                        tahun_ajaran_id: tahunAjaranId,
                        tingkatan: tingkatan,
                    };

                    // Kembalikan promise untuk diproses
                    return fetch('/api/kelas', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(kelasData),
                    })
                        .then(response => {
                            if (!response.ok) {
                                return response.json().then(err => {
                                    throw new Error(err.message || 'Gagal menambahkan kelas.');
                                });
                            }
                            return response.json();
                        });
                }
            }).then(result => {
                if (result.isConfirmed) {
                    // Tampilkan SweetAlert sukses
                    Swal.fire('Berhasil!', 'Kelas baru telah ditambahkan.', 'success');
                    loadKelasData(); // Memuat ulang data kelas
                }
            }).catch(error => {
                // Tampilkan SweetAlert error
                Swal.fire('Gagal!', error.message, 'error');
            });
        });
});
document.addEventListener('DOMContentLoaded', loadKelasData);
