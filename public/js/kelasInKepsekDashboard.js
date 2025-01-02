function loadTahunAjaran() {
    fetch('/api/tahun-ajaran')
        .then(response => response.json())
        .then(data => {
            const filterSelect = document.getElementById('kelas-filter');
            data.forEach(tahun => {
                const option = document.createElement('option');
                option.value = tahun.id;
                option.textContent = `${tahun.nama_tahun_ajaran} (${tahun.semester})`;
                filterSelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

loadKelasData(); 

document.getElementById('kelas-filter').addEventListener('change', function () {
    const filterValue = this.value; 
    loadKelasData(filterValue); 
});
document.addEventListener('DOMContentLoaded', () => {
    loadTahunAjaran(); 
    loadKelasData();   
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
            console.log('Data kelas yang diterima:', data);

            const tbody = document.getElementById('kelas-tbody');
            tbody.innerHTML = ''; // Kosongkan tabel sebelum mengisi data

            if (!data || data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6">Data tidak ditemukan</td></tr>';
                return;
            }

            // Loop untuk menambahkan setiap data kelas ke tabel
            data.forEach(kelas => {
                const namaPegawai = kelas.nama_pegawai || 'Nama Pegawai Tidak Ada';
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${kelas.id}</td>
                    <td>${kelas.nama_kelas}</td>
                    <td>${kelas.nip} - ${namaPegawai}</td>
                    <td>${kelas.tingkatan}</td>
                     <td><a href="#" class="detail-link"  data-id-kelas="${kelas.id}">Lihat Selengkapnya</a></td>
                `;
                tbody.appendChild(row);
            });

        })
        .catch(error => {
            console.error('Error:', error);
            alert('Terjadi kesalahan saat memuat data kelas.');
        });
}

// Fungsi pencarian data kelas
document.getElementById('search-kelas-input').addEventListener('input', function () {
    const searchQuery = this.value.trim(); // Ambil nilai dari input pencarian
    const filterTahunAjaran = document.getElementById('kelas-filter').value; // Ambil filter tahun ajaran
    searchKelas(searchQuery, filterTahunAjaran); // Panggil fungsi pencarian dengan query pencarian dan filter tahun ajaran
});

function searchKelas(searchQuery, filterTahunAjaran = '') {
    const url = filterTahunAjaran
        ? `/api/kelas?tahun_ajaran=${encodeURIComponent(filterTahunAjaran)}`
        : '/api/kelas';

    fetch(url)
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            return response.json();
        })
        .then(data => {
            const tbody = document.getElementById('kelas-tbody');
            tbody.innerHTML = ''; // Kosongkan tabel sebelum mengisi data

            if (!data || data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6">Data tidak ditemukan</td></tr>';
                return;
            }

            const filteredData = data.filter(kelas => {
                const query = searchQuery.toLowerCase();
                return kelas.id.toString().includes(query) ||
                    kelas.nama_kelas.toLowerCase().includes(query) ||
                    kelas.nip.toString().includes(query) ||
                    (kelas.nama_pegawai && kelas.nama_pegawai.toLowerCase().includes(query));
            });

            if (filteredData.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6">Data tidak ditemukan untuk pencarian tersebut.</td></tr>';
                return;
            }

            filteredData.forEach(kelas => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${kelas.id}</td>
                    <td>${kelas.nama_kelas}</td>
                    <td>${kelas.nip} - ${kelas.nama_pegawai || 'Nama Pegawai Tidak Ada'}</td>
                    <td>${kelas.tingkatan}</td>
                    <td><a href="#" class="detail-link"  data-id-kelas="${kelas.id}">Detail</a></td>

                    <td>
                        <button class="edit-button-kelas" data-id-kelas="${kelas.id}">Edit</button>
                        <button class="delete-button-kelas" data-id-kelas="${kelas.id}">Delete</button>
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
// Event listener untuk input pencarian
document.getElementById('search-subject-input').addEventListener('input', function () {
    const searchQuery = this.value.trim(); // Ambil nilai dari input pencarian
    const filterTahunAjaran = document.getElementById('kelas-filter').value; // Ambil filter tahun ajaran
    searchKelas(searchQuery, filterTahunAjaran); // Panggil fungsi pencarian dengan query pencarian dan filter tahun ajaran
});


document.getElementById("kelas-tbody").addEventListener('click', (event) => {
    if (event.target.classList.contains('detail-link')) {
        const id = event.target.getAttribute('data-id-kelas');
        showDetailKelas(id);
    }
});

function showDetailKelas(id) {
    fetch(`/api/kelas/${id}`)
        .then(response => response.json())
        .then(kelas => {
            let siswaTable = '';

            if (kelas.siswa && Array.isArray(kelas.siswa) && kelas.siswa.length > 0) {
                siswaTable = `
                    <table style="width: 100%; border: 1px solid #ddd; border-collapse: collapse;">
                        <thead>
                            <tr>
                                <th style="padding: 8px; border: 1px solid #ddd;">NISN</th>
                                <th style="padding: 8px; border: 1px solid #ddd;">Nama Siswa</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${kelas.siswa.map(siswa => `
                                <tr>
                                    <td style="padding: 8px; border: 1px solid #ddd;">${siswa.nisn}</td>
                                    <td style="padding: 8px; border: 1px solid #ddd;">${siswa.nama_siswa}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `;
            } else {
                siswaTable = `
                    <p>Tidak ada siswa di kelas ini.</p>
                `;
            }

            Swal.fire({
                title: `Detail Kelas ${kelas.nama_kelas}`,
                html: `
                    <div style="text-align: left;">
                        <strong>Kode Kelas:</strong> ${kelas.id} <br>
                        <strong>Nama Kelas:</strong> ${kelas.nama_kelas} <br>
                        <strong>Wali Kelas:</strong> ${kelas.nip} - ${kelas.nama_pegawai} <br>
                        <strong>Daftar Siswa:</strong> <br>
                        ${siswaTable}
                    </div>
                `,
                showCloseButton: true,
                focusConfirm: false,
            });
        })
        .catch(error => {
            console.error('Error:', error);
            Swal.fire('Error', 'Tidak dapat memuat detail kelas.', 'error');
        });
}

document.addEventListener('DOMContentLoaded', loadKelasData);