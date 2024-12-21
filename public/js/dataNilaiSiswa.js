async function fetchSiswaData(kelas = '') {
    try {
        const url = kelas ? `/api/siswa/kelas/${encodeURIComponent(kelas)}` : '/api/siswa';
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Gagal mengambil data siswa. Status: ${response.status}`);
        }

        const data = await response.json();
        renderSiswaTable(data);
    } catch (error) {
        console.error('Kesalahan dalam fetchSiswaData:', error);
        alert('Terjadi kesalahan saat memuat data siswa.');
    }
}
// Fungsi untuk menampilkan tabel siswa

// Fungsi untuk menampilkan tabel siswa
function renderSiswaTable(data) {
    const siswaTbody = document.getElementById("siswa-tbody");
    siswaTbody.innerHTML = "";

    if (data.length === 0) {
        siswaTbody.innerHTML = `<tr><td colspan="3">Tidak ada data siswa.</td></tr>`;
        return;
    }

    data.forEach(siswa => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${siswa.nisn}</td>
            <td>${siswa.nama_siswa}</td>
        `;
        siswaTbody.appendChild(row);
    });
}
// Memuat data tahun ajaran ke dalam filter
function loadTahunAjaranFilter() {
    fetch('/api/tahun-ajaran')
        .then(response => response.json())
        .then(data => {
            const filterSelect = document.getElementById('tahun-ajaran-filter');
            filterSelect.innerHTML = '<option value="">Pilih Tahun Ajaran</option>';
            data.forEach(tahun => {
                const option = document.createElement('option');
                option.value = tahun.id;
                option.textContent = `${tahun.nama_tahun_ajaran} (${tahun.semester})`;
                filterSelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error saat memuat filter tahun ajaran:', error);
        });
}

// Memuat data kelas berdasarkan tahun ajaran
function loadKelasFilter(tahunAjaranId = '') {
    const url = tahunAjaranId ? `/api/kelas-by-tahun-ajaran?tahun_ajaran_id=${encodeURIComponent(tahunAjaranId)}` : '/api/kelas-by-tahun-ajaran';
    fetch(url)
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
        })
        .then(data => {
            const filterSelect = document.getElementById('kelas-filter');
            filterSelect.innerHTML = '<option value="">Pilih Kelas</option>';
            data.forEach(kelas => {
                const option = document.createElement('option');
                option.value = kelas.id;
                option.textContent = kelas.nama_kelas;
                filterSelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error saat memuat filter kelas:', error);
        });
}

// Memuat data mata pelajaran berdasarkan tahun ajaran
async function loadMapelFilter(tahunAjaranId = '') {
    const filterSelect = document.getElementById('mapel-filter');
    
    // Kosongkan dropdown mata pelajaran
    filterSelect.innerHTML = '<option value="">Pilih Mata Pelajaran</option>';

    if (!tahunAjaranId) {
        filterSelect.disabled = true; // Nonaktifkan filter mata pelajaran jika tahun ajaran belum dipilih
        return;
    }

    try {
        const url = `/api/data-mapel?tahun_ajaran_id=${encodeURIComponent(tahunAjaranId)}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('Gagal memuat data mata pelajaran');
        }

        const data = await response.json();

        if (data.length === 0) {
            filterSelect.disabled = true; // Nonaktifkan dropdown jika tidak ada mata pelajaran
        } else {
            filterSelect.disabled = false; // Aktifkan dropdown jika ada mata pelajaran
            data.forEach(mapel => {
                const option = document.createElement('option');
                option.value = mapel.id;
                option.textContent = mapel.nama_mata_pelajaran; // Pastikan 'nama_mata_pelajaran' sesuai dengan respons API
                filterSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error saat memuat filter mata pelajaran:', error);
        filterSelect.disabled = true; // Nonaktifkan filter mata pelajaran jika terjadi kesalahan
    }
}

// Event listener untuk tahun ajaran
// Event listener untuk tahun ajaran
document.getElementById('tahun-ajaran-filter').addEventListener('change', function () {
    const selectedTahunAjaran = this.value;
    loadKelasFilter(selectedTahunAjaran); // Memuat kelas sesuai tahun ajaran yang dipilih
    loadMapelFilter(selectedTahunAjaran); // Memuat mata pelajaran sesuai tahun ajaran
});

// Event listener untuk kelas
document.getElementById('kelas-filter').addEventListener('change', function () {
    const selectedKelas = this.value;
    const selectedTahunAjaran = document.getElementById('tahun-ajaran-filter').value;
    fetchSiswaData(selectedKelas); // Memuat data siswa berdasarkan kelas yang dipilih
});

// Memuat data saat halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
    loadTahunAjaranFilter(); // Muat opsi filter tahun ajaran
    fetchSiswaData(); // Muat semua siswa secara default
    loadMapelFilter(); // Memuat filter mata pelajaran (dengan default kosong dan nonaktif)
});


// Event listener untuk filter Mata Pelajaran
document.getElementById('mapel-filter').addEventListener('change', function () {
    const jenisNilaiFilter = document.getElementById('jenis-nilai-filter');
    console.log("Mapel Filter Value:", this.value); // Debugging
    if (this.value) {
        jenisNilaiFilter.disabled = false; // Aktifkan filter Jenis Nilai
    } else {
        jenisNilaiFilter.disabled = true; // Nonaktifkan filter Jenis Nilai jika Mata Pelajaran tidak dipilih
    }
});
;

document.getElementById('jenis-nilai-filter').addEventListener('change', function () {
    const jenisNilai = this.value; // Ambil nilai yang dipilih
    const siswaTbody = document.getElementById('siswa-tbody');
    const buttonContainer = document.getElementById('button-container');
    
    // Pastikan ada jenis nilai yang dipilih
    if (jenisNilai) {
        // Tambahkan tombol ke dalam caption
        buttonContainer.innerHTML = ''; // Hapus tombol lama
        const inputButton = document.createElement('button');
        inputButton.textContent = 'Input Nilai ' + jenisNilai;
        inputButton.className = 'btn btn-primary';
        buttonContainer.appendChild(inputButton);
        
        // Tambahkan kolom ke header tabel jika belum ada
        const tableHeader = document.querySelector('table thead tr');
        const existingHeader = document.getElementById(`header-${jenisNilai}`);
        
        // Sembunyikan kolom jenis nilai sebelumnya jika ada
        const previousHeaders = tableHeader.querySelectorAll('th');
        previousHeaders.forEach(header => {
            if (header.id && header.id !== `header-${jenisNilai}`) {
                header.style.display = 'none'; // Sembunyikan header sebelumnya
            }
        });
        
        // Tampilkan header untuk jenis nilai baru
        if (!existingHeader) {
            const newHeader = document.createElement('th');
            newHeader.id = `header-${jenisNilai}`;
            newHeader.textContent = `${jenisNilai.toUpperCase()}`;
            tableHeader.appendChild(newHeader);
        }
        
        // Tambahkan kolom kosong ke setiap baris siswa jika belum ada
        const rows = siswaTbody.querySelectorAll('tr');
        rows.forEach(row => {
            const existingCell = row.querySelector(`.column-${jenisNilai}`);
            
            // Sembunyikan kolom nilai yang lama jika ada
            const previousCells = row.querySelectorAll('td');
            previousCells.forEach(cell => {
                if (cell.classList.contains('column-uts') && jenisNilai !== 'uts') {
                    cell.style.display = 'none'; // Sembunyikan kolom UTS jika jenis nilai bukan UTS
                }
                if (cell.classList.contains('column-uas') && jenisNilai !== 'uas') {
                    cell.style.display = 'none'; // Sembunyikan kolom UAS jika jenis nilai bukan UAS
                }
            });

            // Tampilkan kolom untuk jenis nilai yang baru
            if (!existingCell) {
                const newCell = document.createElement('td');
                newCell.className = `column-${jenisNilai}`;
                row.appendChild(newCell);
            }
        });

        fetch(`/api/get-nilai?jenisNilai=${jenisNilai}`)
        .then(response => response.json())
        .then(data => {
            console.log('Data yang diterima:', data);
            if (data && data.nilai) {
                data.nilai.forEach(nilai => {
                    const row = siswaTbody.querySelector(`tr[data-nisn="${nilai.nisn}"]`);
                    if (row) {
                        const cell = row.querySelector(`.column-${jenisNilai}`);
                        if (cell) {
                            if (!cell.textContent) { // Cegah input ulang jika cell sudah terisi
                                cell.textContent = nilai.nilai;
                            }
                        }
                    }
                });
            }
        })
        .catch(error => {
            console.error('Gagal mengambil data nilai:', error);
        });
    

        // Event listener untuk tombol input nilai
        inputButton.addEventListener('click', function() {
            // Ambil data siswa dari tabel
            const siswaData = [];
            const rows = siswaTbody.querySelectorAll('tr');
            rows.forEach(row => {
                const nisn = row.querySelector('td').textContent;
                const namaSiswa = row.querySelectorAll('td')[1].textContent;
                siswaData.push({ nisn, nama_siswa: namaSiswa });
            });

            // Tampilkan SweetAlert dengan data siswa dan jenis nilai
            Swal.fire({
                title: 'Input Nilai untuk ' + jenisNilai,
                html: generateSiswaTable(siswaData, jenisNilai),
                showCancelButton: true,
                confirmButtonText: 'Simpan',
                cancelButtonText: 'Batal'
            }).then((result) => {
                if (result.isConfirmed) {
                    // Ambil nilai yang dimasukkan pada input SweetAlert
                    const inputValues = {};
                    siswaData.forEach(siswa => {
                        const nilai = document.getElementById(`nilai-${siswa.nisn}`).value;
                        if (nilai) {
                            inputValues[siswa.nisn] = nilai;
                        }
                    });

                    // Tampilkan konfirmasi publish
                    Swal.fire({
                        title: 'Konfirmasi Publish Nilai',
                        text: 'Apakah Anda yakin ingin mempublikasikan nilai-nilai ini ke dashboard?',
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonText: 'Publish',
                        cancelButtonText: 'Batal'
                    }).then((publishResult) => {
                        if (publishResult.isConfirmed) {
                            // Update nilai di tabel utama
                            updateDashboardWithValues(inputValues, jenisNilai);
                        }
                    });
                }
            });
        });
    }
});


// Fungsi untuk menghasilkan HTML tabel siswa dengan kolom jenis nilai
function generateSiswaTable(data, jenisNilai) {
    let tableHTML = `
     <style>
            .swal2-popup input[type="text"] {
                width: 100%;
                padding: 10px;
                font-size: 14px;
                border-radius: 5px;
                border: 1px solid #ddd;
                margin-top: 5px;
                box-sizing: border-box;
            }

            .swal2-popup input[type="text"]:focus {
                border-color: #4CAF50;
                outline: none;
            }

            .swal2-popup input[type="text"]::placeholder {
                color: #999;
            }
        </style>
        <table class="table">
            <thead>
                <tr>
                    <th>NO</th>
                    <th>NISN</th>
                    <th>Nama Siswa</th>
                    <th>${jenisNilai.toUpperCase()}</th> <!-- Kolom untuk jenis nilai -->
                </tr>
            </thead>
            <tbody>
    `;
    
    data.forEach((siswa, index) => {
        tableHTML += `
            <tr>
                <td>${index + 1}</td> <!-- Menampilkan nomor urut -->
                <td>${siswa.nisn}</td>
                <td>${siswa.nama_siswa}</td>
                <td><input type="text" id="nilai-${siswa.nisn}" placeholder="Masukkan nilai"></td>
            </tr>
        `;
    });

    tableHTML += '</tbody></table>';
    return tableHTML;
}

function updateDashboardWithValues(inputValues, jenisNilai) {
    const siswaTbody = document.getElementById('siswa-tbody');
    const rows = siswaTbody.querySelectorAll('tr');

    // Update nilai di tabel dashboard
    rows.forEach(row => {
        const nisn = row.querySelector('td').textContent;
        const nilai = inputValues[nisn];
        
        if (nilai) {
            const cell = row.querySelector(`.column-${jenisNilai}`);
            cell.textContent = nilai; // Masukkan nilai ke kolom yang sesuai
        }
    });

    // Kirim data nilai ke server menggunakan fetch
    fetch('/api/update-nilai', { // Sesuaikan URL endpoint dengan server Anda
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            nilaiData: inputValues,
            jenisNilai: jenisNilai,
            tahunAjaranId: document.getElementById('tahun-ajaran-filter').value, 
            kelasId: document.getElementById('kelas-filter').value,
            mapelId: document.getElementById('mapel-filter').value
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            Swal.fire('Sukses', data.message, 'success');
        }
    })
    .catch(error => {
        console.error('Gagal mengirim data nilai:', error);
        Swal.fire('Gagal', 'Terjadi kesalahan saat menyimpan nilai.', 'error');
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const jenisNilai = document.getElementById('jenis-nilai-filter').value;
    if (jenisNilai) {
        fetch(`/api/get-nilai?jenisNilai=${jenisNilai}`)
            .then(response => response.json())
            .then(data => {
                // Masukkan logika untuk menampilkan data nilai di tabel
            })
            .catch(error => console.error('Gagal memuat data:', error));
    }
});
