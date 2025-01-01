async function fetchSiswaData(kelas = '') {
    try {
        const url = kelas ? `/api/siswa/kelas/${encodeURIComponent(kelas)}` : '/api/siswa';
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Gagal mengambil data siswa. Status: ${response.status}`);
        }

        const data = await response.json();

        if (kelas && data.length > 0) {
            document.getElementById('siswa-table').style.display = 'table'; // Tampilkan tabel
        } else {
            document.getElementById('siswa-table').style.display = 'none'; // Sembunyikan tabel
        }

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
        siswaTbody.innerHTML = '<tr><td colspan="2">Tidak ada data siswa.</td></tr>';
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

async function loadKelasFilter(tahunAjaranId = '') {
    const filterSelect = document.getElementById('kelas-filter');

    // Bersihkan opsi kelas sebelumnya sebelum memuat yang baru
    filterSelect.innerHTML = '<option value="">Pilih Kelas</option>';

    if (!tahunAjaranId) {
        filterSelect.disabled = true; // Nonaktifkan filter jika tahun ajaran belum dipilih
        return;
    }

    try {
        const nipGuru = await getUserSession(); 
        if (!nipGuru) throw new Error("NIP pengguna tidak ditemukan.");

        const url = `/api/kelas-by-tahun-ajaran?tahun_ajaran_id=${encodeURIComponent(tahunAjaranId)}&nip_guru=${encodeURIComponent(nipGuru)}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('Gagal memuat data kelas');
        }

        const data = await response.json();
        console.log("Daftar kelas yang diterima dari API:", data);

        if (data.length === 0) {
            filterSelect.disabled = true; // Nonaktifkan dropdown jika tidak ada kelas
        } else {
            filterSelect.disabled = false; // Aktifkan dropdown jika ada kelas
            data.forEach(kelas => {
                const option = document.createElement('option');
                option.value = kelas.id;
                option.textContent = `${kelas.nama_kelas} - ${kelas.tingkatan}`; 
                filterSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error saat memuat filter kelas:', error);
        filterSelect.disabled = true; // Nonaktifkan filter jika terjadi kesalahan
    }
}

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
async function getUserSession() {
    try {
        const response = await fetch("http://localhost:3000/api/session");
        if (!response.ok) throw new Error("Gagal memuat data session");

        const sessionData = await response.json();
        console.log("Data session pengguna:", sessionData);

        return sessionData.nip; // Pastikan nip ada di sini
    } catch (error) {
        console.error("Error:", error);
        alert("Gagal memuat data session.");
    }
}



async function loadMapelFilter(tahunAjaranId = '', kelasId = '') {
    const filterSelect = document.getElementById('mapel-filter');
    filterSelect.innerHTML = '<option value="">Pilih Mata Pelajaran</option>';

    if (!tahunAjaranId || !kelasId) {
        filterSelect.disabled = true; // Nonaktifkan filter mata pelajaran jika tahun ajaran atau kelas belum dipilih
        return;
    }

    try {
        const nipGuru = await getUserSession();
        if (!nipGuru) throw new Error("NIP pengguna tidak ditemukan.");
        const url = `/api/mapel?tahun_ajaran=${encodeURIComponent(tahunAjaranId)}&kelas_id=${encodeURIComponent(kelasId)}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('Gagal memuat data mata pelajaran');
        }

        const data = await response.json();
        console.log("Mata pelajaran yang diterima dari API:", data);

        if (data.length === 0) {
            filterSelect.disabled = true; // Nonaktifkan dropdown jika tidak ada mata pelajaran
        } else {
            filterSelect.disabled = false; // Aktifkan dropdown jika ada mata pelajaran
            data.forEach(mapel => {
                const option = document.createElement('option');
                option.value = mapel.id;
                option.textContent = mapel.nama_mata_pelajaran;
                filterSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error saat memuat filter mata pelajaran:', error);
        filterSelect.disabled = true; // Nonaktifkan filter mata pelajaran jika terjadi kesalahan
    }
}



document.getElementById('jenis-nilai-filter').addEventListener('change', function () {
    const jenisNilai = this.value;
    const siswaTbody = document.getElementById('siswa-tbody');
    let simpanButtonContainer = document.getElementById('simpan-button-container'); // Kontainer untuk tombol simpan
    const allColumns = ['uts', 'uas', 'tugas', 'nilai-akhir'];

    const tableHeader = document.querySelector('table thead tr');
    const rows = siswaTbody.querySelectorAll('tr');
    rows.forEach(row => {
        allColumns.forEach(columnClass => {
            const existingCell = row.querySelector(`.column-${columnClass}`);
            if (existingCell) {
                existingCell.remove();
            }
        });
    });
    allColumns.forEach(columnClass => {
        const header = document.getElementById(`header-${columnClass}`);
        if (header) {
            header.style.display = (jenisNilai === columnClass || jenisNilai === 'nilai-akhir') ? '' : 'none';
        }
    });

    function removeStatusAndCatatanColumns() {
        const statusHeader = document.getElementById('header-status');
        const catatanHeader = document.getElementById('header-catatan');
        if (statusHeader) {
            statusHeader.remove();
        }
        if (catatanHeader) {
            catatanHeader.remove();
        }
        const rows = document.querySelectorAll('tr');
        rows.forEach(row => {
            const statusCell = row.querySelector('.column-status');
            const catatanCell = row.querySelector('.column-catatan');
            if (statusCell) {
                statusCell.remove();
            }
            if (catatanCell) {
                catatanCell.remove();
            }
        });
    }

if (jenisNilai !== 'nilai-akhir') {
    removeStatusAndCatatanColumns();

    const header = document.getElementById(`header-${jenisNilai}`);
    if (!header) {
        const newHeader = document.createElement('th');
        newHeader.id = `header-${jenisNilai}`;
        newHeader.textContent = `${jenisNilai.toUpperCase()}`;
        tableHeader.appendChild(newHeader);
    }

    rows.forEach(row => {
        if (!row.querySelector(`.column-${jenisNilai}`)) {
            const newCell = document.createElement('td');
            newCell.className = `column-${jenisNilai}`;

            const nisn = row.querySelector('td').textContent.trim();
            const tahunAjaran = document.getElementById('tahun-ajaran-filter').value;
            const kelas = document.getElementById('kelas-filter').value;
            const mapel = document.getElementById('mapel-filter').value;

            if (tahunAjaran && kelas && mapel && nisn) {
                fetch(`/api/get-nilai/${nisn}?jenisNilai=${jenisNilai}&tahunAjaran=${tahunAjaran}&kelas=${kelas}&mapel=${mapel}`)
                    .then(response => response.json())
                    .then(data => {
                        const siswaData = data.find(siswa => siswa.nisn === nisn);
                        if (siswaData && siswaData.nilai !== undefined) {
                            newCell.textContent = siswaData.nilai; // Nilai sudah ada
                        } else {
                            const input = document.createElement('input');
                            input.type = 'number';
                            input.className = `input-${jenisNilai}`;
                            input.placeholder = `Input ${jenisNilai}`;
                            newCell.appendChild(input); // Jika nilai belum ada, tampilkan input
                        }
                    })
                    .catch(error => {
                        console.error('Gagal mengambil data nilai:', error);
                    });
            } else {
                console.error('Parameter tidak lengkap untuk fetch nilai.');
            }

            row.appendChild(newCell);
        }
    });
} else {
    const additionalHeaders = ['UTS', 'UAS', 'Tugas', 'Nilai Akhir', 'Status', 'Catatan'];
    const additionalClasses = ['uts', 'uas', 'tugas', 'nilai-akhir', 'status', 'catatan'];
    additionalHeaders.forEach((headerText, index) => {
        if (!document.getElementById(`header-${additionalClasses[index]}`)) {
            const newHeader = document.createElement('th');
            newHeader.id = `header-${additionalClasses[index]}`;
            newHeader.textContent = headerText;
            tableHeader.appendChild(newHeader);
        }
    });

    rows.forEach(row => {
        let utsNilai, uasNilai, tugasNilai, statusNilai, catatanNilai;

       additionalClasses.forEach(columnClass => {
    if (!row.querySelector(`.column-${columnClass}`)) {
        const newCell = document.createElement('td');
        newCell.className = `column-${columnClass}`;

        const nisn = row.querySelector('td').textContent.trim(); // Ambil NISN siswa
        const tahunAjaran = document.getElementById('tahun-ajaran-filter').value;
        const kelas = document.getElementById('kelas-filter').value;
        const mapel = document.getElementById('mapel-filter').value;
        const jenisNilai = document.getElementById('jenis-nilai-filter').value;
        console.log(jenisNilai)
        if (tahunAjaran && kelas && mapel && nisn && jenisNilai) {

            fetch(`/api/get-nilai/${nisn}?jenisNilai=${columnClass}&tahunAjaran=${tahunAjaran}&kelas=${kelas}&mapel=${mapel}`)
            .then(response => response.json())
            .then(data => {
                const siswaData = data.find(siswa => siswa.nisn === nisn);                
                // Jika nilai ditemukan, tampilkan; jika tidak, biarkan kosong
                if (siswaData && siswaData.nilai !== undefined) {
                    console.log('kolom class' + columnClass)
                    console.log('siswa data' + siswaData.nilai)
                    
                    newCell.textContent = siswaData.nilai; // Nilai lainnya ditampilkan

                    if (columnClass === 'status') {
                        newCell.textContent = '';  // Biarkan kosong
                    } else if(columnClass === 'catatan'){
                        newCell.textContent = '';  // Biarkan kosong
                    }
                    else {
                    }
                    if (columnClass === 'uts') {
                        utsNilai = siswaData.nilai;
                    } else if (columnClass === 'uas') {
                        uasNilai = siswaData.nilai;
                    } else if (columnClass === 'tugas') {
                        tugasNilai = siswaData.nilai;
                    } else if (columnClass === 'status') {
                        statusNilai = '';  // Kosongkan status
                    } else if (columnClass === 'catatan') {
                        catatanNilai = '';  // Kosongkan catatan
                    }
                } else {
                    newCell.textContent = ''; // Kosongkan kolom jika tidak ada data
                }

                row.appendChild(newCell);

                // Setelah nilai UTS, UAS, dan Tugas terkumpul, hitung Nilai Akhir
                if (utsNilai && uasNilai && tugasNilai) {
                    const nilaiAkhir = calculateNilaiAkhir(utsNilai, uasNilai, tugasNilai);
                    const nilaiAkhirCell = row.querySelector('.column-nilai-akhir');
                    if (nilaiAkhirCell) {
                        nilaiAkhirCell.textContent = nilaiAkhir;
                    }
                } else {
                    const nilaiAkhirCell = row.querySelector('.column-nilai-akhir');
                    if (nilaiAkhirCell) {
                        nilaiAkhirCell.textContent = '';
                    }
                }
                if (statusNilai && catatanNilai) {
                    const statusCell = row.querySelector('.column-status');
                    if (statusCell) {
                        statusCell.textContent = statusNilai;
                    }

                    const catatanCell = row.querySelector('.column-catatan');
                    if (catatanCell) {
                        catatanCell.textContent = catatanNilai;
                    }
                }

            })
            .catch(error => {
                console.error('Gagal mengambil data nilai:', error);
            });
        } else {
            console.error('Parameter tidak lengkap untuk fetch nilai.');
        }
    }
});

    });
}

    function calculateNilaiAkhir(uts, uas, tugas) {
        const utsWeight = 0.3;  // Bobot UTS
        const uasWeight = 0.4;  // Bobot UAS
        const tugasWeight = 0.3;  // Bobot Tugas

        const nilaiAkhir = (uts * utsWeight) + (uas * uasWeight) + (tugas * tugasWeight);

        return nilaiAkhir.toFixed(1);
    }

    if (jenisNilai !== 'nilai-akhir') {
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
                    confirmButtonColor: '#004D40',
                    cancelButtonText: 'Batal'
                }).then(result => {
                    if (result.isConfirmed) {
                        rows.forEach(row => {
                            const inputs = row.querySelectorAll('input');
                            inputs.forEach(input => {
                                if (input && input.value) {
                                    const nilaiInput = input.value;
                                    const nisn = row.querySelector('td').textContent.trim();
                                    const gradestype = input.className.replace('input-', '');

                                    fetch(`/api/update-nilai`, {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/json'
                                        },
                                        body: JSON.stringify({
                                            gradestype: gradestype,
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
                                            input.disabled = true;

                                            Swal.fire({
                                                icon: 'success',
                                                title: 'Berhasil!',
                                                text: `Nilai ${gradestype.toUpperCase()} telah berhasil disimpan.`,
                                                confirmButtonText: 'OK',
                                                confirmButtonColor: '#004D40'
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
                        });
                    }
                });
            });

            simpanButtonContainer.appendChild(simpanButton);
            const tableContainer = document.querySelector('table');
            tableContainer.insertAdjacentElement('afterend', simpanButtonContainer);
        }
    } else {
        // Jika jenisNilai adalah 'nilai-akhir', sembunyikan tombol simpan
        if (simpanButtonContainer) {
       simpanButtonContainer.remove();
        }
    }
});

function resetNilaiColumns() {
    const siswaTbody = document.getElementById("siswa-tbody");
    const allColumns = ['uts', 'uas', 'tugas', 'nilai-akhir'];

    // Hapus kolom nilai yang ada
    const rows = siswaTbody.querySelectorAll('tr');
    rows.forEach(row => {
        allColumns.forEach(columnClass => {
            const existingCell = row.querySelector(`.column-${columnClass}`);
            if (existingCell) {
                existingCell.remove();
            }
        });
    });

    // Sembunyikan header kolom nilai
    const tableHeader = document.querySelector('table thead tr');
    allColumns.forEach(columnClass => {
        const header = document.getElementById(`header-${columnClass}`);
        if (header) {
            header.style.display = 'none';
        }
    });
}

document.getElementById('kelas-filter').addEventListener('change', async (event) => {
    const kelasId = event.target.value;

    // Reset nilai ketika kelas berubah
    resetNilaiColumns();

    if (!kelasId) {
        console.warn('Kelas belum dipilih.');
        return;
    }

    fetchSiswaData(kelasId);

    const tahunAjaranId = document.getElementById('tahun-ajaran-filter').value;

    if (tahunAjaranId) {
        await loadMapelFilter(tahunAjaranId, kelasId);
    } else {
        console.warn('Tahun ajaran belum dipilih.');
    }
});



document.getElementById('tahun-ajaran-filter').addEventListener('change', async function () {
    const selectedTahunAjaran = this.value;

    // Reset tabel siswa
    const siswaTbody = document.getElementById('siswa-tbody');
    siswaTbody.innerHTML = '<tr><td colspan="2">Tidak ada data siswa.</td></tr>';
    document.getElementById('siswa-table').style.display = 'none';

    // Reset dan nonaktifkan dropdown kelas
    const kelasFilter = document.getElementById('kelas-filter');
    kelasFilter.innerHTML = '<option value="">Pilih Kelas</option>';
    kelasFilter.disabled = true;

    // Reset dan nonaktifkan dropdown mapel
    const mapelFilter = document.getElementById('mapel-filter');
    mapelFilter.innerHTML = '<option value="">Pilih Mata Pelajaran</option>';
    mapelFilter.disabled = true;

    // Reset dropdown jenis nilai dan nonaktifkan
    const nilaiFilter = document.getElementById('jenis-nilai-filter');
    nilaiFilter.selectedIndex = 0;
    nilaiFilter.disabled = true;

    // Sembunyikan kolom nilai
    const kolomNilai = document.getElementById('kolom-nilai');
    if (kolomNilai) kolomNilai.style.display = 'none';

    // Jika tahun ajaran tidak dipilih, keluar
    if (!selectedTahunAjaran) return;

    // Muat ulang filter kelas dan mapel sesuai tahun ajaran yang dipilih
    await loadKelasFilter(selectedTahunAjaran);

    // Aktifkan filter jenis nilai setelah kelas dan mapel dimuat
    nilaiFilter.disabled = false;
});

// Tambahkan event listener untuk jenis nilai filter
document.getElementById('jenis-nilai-filter').addEventListener('change', function () {
    const nilaiFilter = this;
    const kolomNilai = document.getElementById('kolom-nilai');
    
    // Jika jenis nilai dipilih, tampilkan kolom nilai
    if (nilaiFilter.value) {
        if (kolomNilai) kolomNilai.style.display = 'table-cell';
    } else {
        // Jika jenis nilai tidak dipilih, sembunyikan kolom nilai
        if (kolomNilai) kolomNilai.style.display = 'none';
    }
});

document.getElementById('mapel-filter').addEventListener('change', function () {
    const jenisNilaiFilter = document.getElementById('jenis-nilai-filter');
    const jenisNilai = jenisNilaiFilter.value;  // Nilai jenisNilai yang sedang aktif
    const siswaTbody = document.getElementById('siswa-tbody');
    const tableHeader = document.querySelector('table thead tr');
    const allColumns = siswaTbody.querySelectorAll('[class^="column-"]:not(.column-nilai-akhir):not(.column-status):not(.column-catatan)');
    const allHeaders = tableHeader.querySelectorAll('[id^="header-"]:not(#header-nilai-akhir):not(#header-status):not(#header-catatan)');
    
    allColumns.forEach(cell => {
        cell.style.display = 'none';  
    });

    allHeaders.forEach(header => {
        header.style.display = 'none';  
    });

    jenisNilaiFilter.selectedIndex = 0;  

    if (jenisNilai && jenisNilai !== 'nilai-akhir') {
        siswaTbody.querySelectorAll(`.column-${jenisNilai}`).forEach(cell => {
            cell.style.display = 'none';  
        });
        
        const header = document.getElementById(`header-${jenisNilai}`);
        if (header) {
            header.style.display = 'none';  
        }
    }

    jenisNilaiFilter.disabled = false;  
});

    
document.addEventListener('DOMContentLoaded', () => {
    loadTahunAjaranFilter();
    fetchSiswaData();
});
