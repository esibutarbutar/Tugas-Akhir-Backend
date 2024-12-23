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

document.getElementById('jenis-nilai-filter').addEventListener('change', function () {
    const jenisNilai = this.value; // Ambil nilai yang dipilih dari dropdown filter
    const siswaTbody = document.getElementById('siswa-tbody');
    let simpanButtonContainer = document.getElementById('simpan-button-container'); // Kontainer untuk tombol simpan

    // Pastikan ada jenis nilai yang dipilih
    if (jenisNilai) {
        // Tambahkan kolom header untuk jenis nilai yang dipilih
        const tableHeader = document.querySelector('table thead tr');
        const existingHeader = document.getElementById(`header-${jenisNilai}`);
        
        // Hapus semua header lainnya yang tidak sesuai dengan jenis nilai
        const previousHeaders = tableHeader.querySelectorAll('th');
        previousHeaders.forEach(header => {
            if (header.id && header.id !== `header-${jenisNilai}`) {
                header.style.display = 'none'; // Sembunyikan header yang tidak dipilih
            }
        });

        // Jika header jenis nilai baru belum ada, buat dan tambahkan ke header
        if (!existingHeader) {
            const newHeader = document.createElement('th');
            newHeader.id = `header-${jenisNilai}`;
            newHeader.textContent = `${jenisNilai.toUpperCase()}`;
            tableHeader.appendChild(newHeader);
        }

        // Loop melalui setiap baris siswa untuk memeriksa dan menampilkan nilai
        const rows = siswaTbody.querySelectorAll('tr');
        rows.forEach(row => {
            const existingCell = row.querySelector(`.column-${jenisNilai}`);
            
            // Sembunyikan kolom yang tidak sesuai dengan jenis nilai yang dipilih
            const previousCells = row.querySelectorAll('td');
            previousCells.forEach(cell => {
                if (cell.classList.contains('column-uts') && jenisNilai !== 'uts') {
                    cell.style.display = 'none'; // Sembunyikan kolom UTS jika jenis nilai bukan UTS
                }
                if (cell.classList.contains('column-uas') && jenisNilai !== 'uas') {
                    cell.style.display = 'none'; // Sembunyikan kolom UAS jika jenis nilai bukan UAS
                }
            });

            // Jika cell untuk jenis nilai ini belum ada, buat dan tambahkannya
            if (!existingCell) {
                const newCell = document.createElement('td');
                newCell.className = `column-${jenisNilai}`;

                // Ambil NISN dari baris untuk digunakan dalam API call
                const tahunAjaran = document.getElementById('tahun-ajaran-filter').value;
                const kelas = document.getElementById('kelas-filter').value;
                const mapel = document.getElementById('mapel-filter').value;
                const nisn = row.querySelector('td').textContent.trim(); // Ambil NISN
                
                // Pastikan nilai tahunAjaran dan lainnya sudah ada sebelum digunakan
                if (!tahunAjaran || !kelas || !mapel || !nisn) {
                    console.error('Parameter tidak lengkap');
                    return;
                }
                // Ambil nilai dari database
                fetch(`/api/get-nilai/${nisn}?jenisNilai=${jenisNilai}&tahunAjaran=${tahunAjaran}&kelas=${kelas}&mapel=${mapel}`)
                .then(response => response.json())
                .then(data => {
                    console.log("Data dari API:", data); // Untuk memeriksa semua data yang diterima
                    const siswaData = data.find(siswa => siswa.nisn === nisn); // Mencocokkan data berdasarkan nisn
                    if (siswaData && siswaData.nilai !== undefined) { // Jika nilai ditemukan
                        newCell.textContent = siswaData.nilai; // Menampilkan nilai
                    } else {
                        const input = document.createElement('input');
                        input.type = 'number';
                        input.className = `input-${jenisNilai}`;
                        input.placeholder = `Input ${jenisNilai}`;
                        newCell.appendChild(input);
                    }
                    row.appendChild(newCell); // Menambahkan cell ke dalam baris
                })
                .catch(error => {
                    console.error('Gagal mengambil data nilai:', error);
                });
            

            
            }
        });

        // Cek apakah tombol "Simpan Nilai" sudah ada
        if (!simpanButtonContainer) {
            simpanButtonContainer = document.createElement('div');
            simpanButtonContainer.id = 'simpan-button-container';
            simpanButtonContainer.style.marginTop = '20px';

            const simpanButton = document.createElement('button');
            simpanButton.textContent = 'Simpan Nilai';
            simpanButton.className = 'btn-simpan';
            simpanButton.addEventListener('click', function () {
                Swal.fire({
                    title: 'Konfirmasi',
                    text: 'Apakah Anda yakin ingin menyimpan nilai?',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'Ya, simpan',
                    confirmButtonColor : '#004D40',
                    cancelButtonText: 'Batal'
                }).then(result => {
                    if (result.isConfirmed) {
                        const rows = siswaTbody.querySelectorAll('tr');
                        rows.forEach(row => {
                            const input = row.querySelector(`.input-${jenisNilai}`);
                            if (input && input.value) {
                                const nilaiInput = input.value;
                                const nisn = row.querySelector('td').textContent.trim();
                                fetch(`/api/update-nilai`, {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify({
                                        gradestype: jenisNilai,
                                        grade: nilaiInput,
                                        id_tahun_ajaran: document.getElementById('tahun-ajaran-filter').value,
                                        id_kelas: document.getElementById('kelas-filter').value,
                                        id_matpel: document.getElementById('mapel-filter').value,
                                        nisn: nisn
                                    })
                                })
                                .then(response => response.json())
                                .then(data => {
                                    console.log('Data berhasil disimpan:', data);
                                    const cell = row.querySelector(`.column-${jenisNilai}`);
                                    cell.textContent = nilaiInput; // Update nilai di tabel
                                    input.disabled = true;

                                    Swal.fire({
                                        icon: 'success',
                                        title: 'Berhasil!',
                                        text: `Nilai ${jenisNilai.toUpperCase()} telah berhasil disimpan.`,
                                        confirmButtonText: 'OK',
                                        confirmButtonColor : '#004D40'
                                    });
                                })
                                .catch(error => {
                                    console.error('Gagal menyimpan data nilai:', error);
                                    Swal.fire({
                                        icon: 'error',
                                        title: 'Gagal!',
                                        text: 'Terjadi kesalahan saat menyimpan nilai.',
                                        confirmButtonText: 'OK'
                                    });
                                });
                            }
                        });
                    }
                });
            });

            simpanButtonContainer.appendChild(simpanButton);
            const tableContainer = document.querySelector('table');
            tableContainer.insertAdjacentElement('afterend', simpanButtonContainer);
        }
    }
});
document.addEventListener('DOMContentLoaded', () => {
    loadTahunAjaranFilter();
    fetchSiswaData(); // Muat data siswa
    loadMapelFilter();
});
