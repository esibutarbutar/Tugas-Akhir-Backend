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
                option.textContent = `${kelas.nama_kelas} - ${kelas.tingkatan}`;                filterSelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error saat memuat filter kelas:', error);
        });
}

// Event listener untuk filter kelas
document.getElementById('kelas-filter').addEventListener('change', (event) => {
    const selectedKelas = event.target.value;
    fetchSiswaData(selectedKelas);
});

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

// Fungsi untuk mendapatkan data session pengguna
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

async function loadMapelFilter(tahunAjaranId = '') {
    const filterSelect = document.getElementById('mapel-filter');

    // Kosongkan dropdown mata pelajaran
    filterSelect.innerHTML = '<option value="">Pilih Mata Pelajaran</option>';

    if (!tahunAjaranId) {
        filterSelect.disabled = true; // Nonaktifkan filter mata pelajaran jika tahun ajaran belum dipilih
        return;
    }

    try {
        // Ambil NIP guru yang sedang login
        const nipGuru = await getUserSession(); 
        if (!nipGuru) throw new Error("NIP pengguna tidak ditemukan.");

        // Panggil API untuk mendapatkan daftar mata pelajaran berdasarkan tahun ajaran dan nipGuru
        const url = `/api/mapel?tahun_ajaran=${encodeURIComponent(tahunAjaranId)}`;  // Hapus nip_guru
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
            // Loop untuk menampilkan mata pelajaran yang dikelola oleh guru
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


  document.getElementById('tahun-ajaran-filter').addEventListener('change', function () {
    const selectedTahunAjaran = this.value;
    loadKelasFilter(selectedTahunAjaran); // Memuat kelas sesuai tahun ajaran yang dipilih
    loadMapelFilter(selectedTahunAjaran); // Memuat mata pelajaran sesuai tahun ajaran
});


document.getElementById('jenis-nilai-filter').addEventListener('change', function () {
    const jenisNilai = this.value;
    const siswaTbody = document.getElementById('siswa-tbody');
    let simpanButtonContainer = document.getElementById('simpan-button-container'); // Kontainer untuk tombol simpan
    const allColumns = ['uts', 'uas', 'tugas', 'nilai-akhir'];

    const tableHeader = document.querySelector('table thead tr');
    const rows = siswaTbody.querySelectorAll('tr');

    // Reset kolom lama sebelum menambahkan kolom baru
    rows.forEach(row => {
        allColumns.forEach(columnClass => {
            const existingCell = row.querySelector(`.column-${columnClass}`);
            if (existingCell) {
                existingCell.remove();
            }
        });
    });

    // Reset header sebelum menambahkan header baru
    allColumns.forEach(columnClass => {
        const header = document.getElementById(`header-${columnClass}`);
        if (header) {
            header.style.display = (jenisNilai === columnClass || jenisNilai === 'nilai-akhir') ? '' : 'none';
        }
    });

    // Menambah kolom atau header sesuai jenisNilai
    if (jenisNilai !== 'nilai-akhir') {
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
        const additionalHeaders = ['UTS', 'UAS', 'Tugas', 'Nilai Akhir'];
        const additionalClasses = ['uts', 'uas', 'tugas', 'nilai-akhir'];

        // Tambahkan header untuk UTS, UAS, Tugas, dan Nilai Akhir
        additionalHeaders.forEach((headerText, index) => {
            if (!document.getElementById(`header-${additionalClasses[index]}`)) {
                const newHeader = document.createElement('th');
                newHeader.id = `header-${additionalClasses[index]}`;
                newHeader.textContent = headerText;
                tableHeader.appendChild(newHeader);
            }
        });

        // Tambahkan kolom untuk setiap siswa
        rows.forEach(row => {
            let utsNilai, uasNilai, tugasNilai;

            additionalClasses.forEach(columnClass => {
                if (!row.querySelector(`.column-${columnClass}`)) {
                    const newCell = document.createElement('td');
                    newCell.className = `column-${columnClass}`;

                    const nisn = row.querySelector('td').textContent.trim(); // Ambil NISN siswa
                    const tahunAjaran = document.getElementById('tahun-ajaran-filter').value;
                    const kelas = document.getElementById('kelas-filter').value;
                    const mapel = document.getElementById('mapel-filter').value;

                    if (tahunAjaran && kelas && mapel && nisn) {
                        fetch(`/api/get-nilai/${nisn}?jenisNilai=${columnClass}&tahunAjaran=${tahunAjaran}&kelas=${kelas}&mapel=${mapel}`)
                            .then(response => response.json())
                            .then(data => {
                                const siswaData = data.find(siswa => siswa.nisn === nisn);

                                // Jika nilai ditemukan, tampilkan; jika tidak, biarkan kosong
                                if (siswaData && siswaData.nilai !== undefined) {
                                    newCell.textContent = siswaData.nilai;

                                    // Simpan nilai UTS, UAS, dan Tugas untuk perhitungan Nilai Akhir
                                    if (columnClass === 'uts') {
                                        utsNilai = siswaData.nilai;
                                    } else if (columnClass === 'uas') {
                                        uasNilai = siswaData.nilai;
                                    } else if (columnClass === 'tugas') {
                                        tugasNilai = siswaData.nilai;
                                    }
                                } else {
                                    newCell.textContent = 'belum diinput'; 
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
                                    // Jika salah satu nilai kosong, tampilkan keterangan 'Nilai Belum Lengkap'
                                    const nilaiAkhirCell = row.querySelector('.column-nilai-akhir');
                                    if (nilaiAkhirCell) {
                                        nilaiAkhirCell.textContent = 'Nilai Belum Lengkap';
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

    // Fungsi untuk menghitung nilai akhir berdasarkan UTS, UAS, dan Tugas
    function calculateNilaiAkhir(uts, uas, tugas) {
        const utsWeight = 0.3;  // Bobot UTS
        const uasWeight = 0.4;  // Bobot UAS
        const tugasWeight = 0.3;  // Bobot Tugas

        // Hitung Nilai Akhir (misalnya, rata-rata berbobot)
        const nilaiAkhir = (uts * utsWeight) + (uas * uasWeight) + (tugas * tugasWeight);

        // Membatasi angka desimal hanya 1 digit
        return nilaiAkhir.toFixed(1);
    }

    // Jika jenisNilai bukan 'nilai-akhir', tampilkan tombol simpan
    if (jenisNilai !== 'nilai-akhir') {
        // Menambahkan tombol Simpan Nilai jika belum ada
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


document.getElementById('mapel-filter').addEventListener('change', function () {
    const jenisNilaiFilter = document.getElementById('jenis-nilai-filter');
    console.log("Mapel Filter Value:", this.value); // Debugging

    // Cek jika mata pelajaran dipilih
    if (this.value) {
        jenisNilaiFilter.disabled = false; // Aktifkan filter Jenis Nilai
        // Panggil fungsi untuk merender ulang tabel berdasarkan mapel yang baru
        renderTableWithUpdatedValues();
    } else {
        jenisNilaiFilter.disabled = true; // Nonaktifkan filter Jenis Nilai jika Mapel tidak dipilih
    }
});

function renderTableWithUpdatedValues() {
    const siswaTbody = document.getElementById('siswa-tbody');
    const rows = siswaTbody.querySelectorAll('tr');
    const jenisNilai = document.getElementById('jenis-nilai-filter').value;
    const mapel = document.getElementById('mapel-filter').value;
    const tahunAjaran = document.getElementById('tahun-ajaran-filter').value;
    const kelas = document.getElementById('kelas-filter').value;

    rows.forEach(row => {
        const nisn = row.querySelector('td').textContent.trim(); // Ambil NISN siswa
        // Hapus semua kolom terkait nilai sebelumnya
        const allColumns = ['uts', 'uas', 'tugas', 'nilai-akhir'];
        allColumns.forEach(columnClass => {
            const existingCell = row.querySelector(`.column-${columnClass}`);
            if (existingCell) {
                existingCell.remove();
            }
        });

        if (tahunAjaran && kelas && mapel && nisn) {
            // Ambil nilai berdasarkan jenisNilai dan mapel
            fetch(`/api/get-nilai/${nisn}?jenisNilai=${jenisNilai}&tahunAjaran=${tahunAjaran}&kelas=${kelas}&mapel=${mapel}`)
                .then(response => response.json())
                .then(data => {
                    const siswaData = data.find(siswa => siswa.nisn === nisn);
                    if (siswaData && siswaData.nilai !== undefined) {
                        // Jika nilai sudah ada, tampilkan nilainya
                        const newCell = document.createElement('td');
                        newCell.className = `column-${jenisNilai}`;
                        newCell.textContent = siswaData.nilai;
                        row.appendChild(newCell);
                    } else {
                        // Jika belum ada nilai, buat input untuk memasukkan nilai
                        const newCell = document.createElement('td');
                        newCell.className = `column-${jenisNilai}`;
                        const input = document.createElement('input');
                        input.type = 'number';
                        input.className = `input-${jenisNilai}`;
                        input.placeholder = `Input ${jenisNilai}`;
                        newCell.appendChild(input);
                        row.appendChild(newCell);
                    }
                })
                .catch(error => {
                    console.error('Gagal mengambil data nilai:', error);
                });
        } else {
            console.error('Parameter tidak lengkap untuk fetch nilai.');
        }
    });
}
    
document.addEventListener('DOMContentLoaded', () => {
    loadTahunAjaranFilter();
    fetchSiswaData(); // Muat data siswa
    loadMapelFilter();
});
