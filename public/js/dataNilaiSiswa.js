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
function filterGrades() {
    const tahunAjaran = document.getElementById("tahun-ajaran-filter").value;
    const kelasId = document.getElementById("kelas-filter").value;
    const matpelId = document.getElementById("mapel-filter").value;
    const jenisNilai = document.getElementById("jenis-nilai-filter").value;

    // Buat query string untuk mengirimkan semua parameter
    const queryString = new URLSearchParams({
        tahunAjaran,
        kelasId,
        matpelId,
        jenisNilai
    }).toString();

    console.log(queryString); // Debug: lihat query string yang dihasilkan

    // Panggil API dengan query string
    fetch(`/api/grades?${queryString}`)
        .then(response => response.json())
        .then(gradesData => {
            console.log('grades data:', JSON.stringify(gradesData, null, 2)); // Debugging
            displayGrades(gradesData, jenisNilai);
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function displayGrades(gradesData, jenisNilai = '') {
    const tbody = document.getElementById("siswa-tbody");
    const nilaiHeader = document.getElementById("nilai-header");
    const utsHeader = document.getElementById("uts-header");
    const uasHeader = document.getElementById("uas-header");
    const tugasHeader = document.getElementById("tugas-header");
    const nilaiAkhirHeader = document.getElementById("nilai-akhir-header");
    const gradeStatusHeader = document.getElementById("grade-status-header");
    const catatanHeader = document.getElementById("catatan-header");

    tbody.innerHTML = ''; // Bersihkan tabel sebelumnya

    if (jenisNilai === 'nilai-akhir') {
        nilaiHeader.style.display = "none"; // Sembunyikan kolom "Nilai"
        utsHeader.style.display = "table-cell";
        uasHeader.style.display = "table-cell";
        tugasHeader.style.display = "table-cell";
        nilaiAkhirHeader.style.display = "table-cell";
        gradeStatusHeader.style.display = "table-cell";
        catatanHeader.style.display = "table-cell";
    } else {
        nilaiHeader.style.display = jenisNilai ? "table-cell" : "none";
        utsHeader.style.display = "none";
        uasHeader.style.display = "none";
        tugasHeader.style.display = "none";
        nilaiAkhirHeader.style.display = "none";
        gradeStatusHeader.style.display = "none";
        catatanHeader.style.display = "none";
    }

    if (Array.isArray(gradesData) && gradesData.length > 0) {
        gradesData.forEach(grade => {
            const row = document.createElement("tr");

            // NISN dan Nama
            const nisnCell = document.createElement("td");
            nisnCell.textContent = grade.nisn || "-";
            row.appendChild(nisnCell);

            const namaCell = document.createElement("td");
            namaCell.textContent = grade.nama_siswa || "Tidak tersedia";
            row.appendChild(namaCell);

            // Menampilkan nilai berdasarkan jenisNilai
            if (jenisNilai && jenisNilai !== 'nilai-akhir') {
                const nilaiCell = document.createElement("td");

                // Cek apakah nilai untuk jenisNilai ada, jika tidak tampilkan input
                if (grade[jenisNilai] === null || grade[jenisNilai] === undefined) {
                    const input = document.createElement("input");
                    input.type = "number";
                    input.placeholder = "Masukkan nilai";
                    input.value = '';  // Nilai awal kosong
                    nilaiCell.appendChild(input);
                } else {
                    nilaiCell.textContent = grade[jenisNilai] || '-';
                }
                row.appendChild(nilaiCell);
            }

            // Untuk nilai-akhir, menampilkan beberapa kolom
            if (jenisNilai === 'nilai-akhir') {
                row.appendChild(createCell(grade.uts !== null ? grade.uts : '-'));
                row.appendChild(createCell(grade.uas !== null ? grade.uas : '-'));
                row.appendChild(createCell(grade.tugas !== null ? grade.tugas : '-'));
                row.appendChild(createCell(grade.nilai_akhir !== null ? grade.nilai_akhir : '-'));
                row.appendChild(createCell(grade.gradeStatus !== null ? grade.gradeStatus : '-'));
                row.appendChild(createCell(grade.catatan !== null ? grade.catatan : '-'));
            }

            tbody.appendChild(row);
        });
    } else {
        const row = document.createElement("tr");
        const cell = document.createElement("td");
        cell.colSpan = 8;  // Menyesuaikan jumlah kolom
        cell.textContent = "Data tidak tersedia";
        row.appendChild(cell);
        tbody.appendChild(row);
    }
}

function createInputCell(value) {
    const cell = document.createElement("td");
    const input = document.createElement("input");
    input.type = "number";
    input.placeholder = "Masukkan nilai";
    input.value = value || '';  // Nilai awal kosong jika tidak ada
    cell.appendChild(input);
    return cell;
}

document.getElementById("jenis-nilai-filter").addEventListener("change", function () {
    const jenisNilai = this.value; // Mengambil nilai dari select dropdown
    filterGrades(jenisNilai); // Panggil filterGrades dengan jenisNilai yang dipilih
});


function updateHeader(headerText) {
    const header = document.getElementById("nilai-header");
    header.textContent = headerText;
    header.style.display = "table-cell";
}

function createCell(content) {
    const cell = document.createElement("td");
    cell.textContent = content || "-";
    return cell;
}

document.getElementById("jenis-nilai-filter").addEventListener("click", function () {
    filterGrades();
});



function resetNilaiColumns() {
    const siswaTbody = document.getElementById("siswa-tbody");
    const allColumns = ['uts', 'uas', 'tugas', 'nilai-akhir', 'status', 'catatan'];
    const rows = siswaTbody.querySelectorAll('tr');
    rows.forEach(row => {
        allColumns.forEach(columnClass => {
            const existingCell = row.querySelector(`.column-${columnClass}`);
            if (existingCell) {
                existingCell.remove();
            }
        });
    });
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
    const siswaTbody = document.getElementById('siswa-tbody');
    siswaTbody.innerHTML = '<tr><td colspan="2">Tidak ada data siswa.</td></tr>';
    document.getElementById('siswa-table').style.display = 'none';
    const kelasFilter = document.getElementById('kelas-filter');
    kelasFilter.innerHTML = '<option value="">Pilih Kelas</option>';
    kelasFilter.disabled = true;
    const mapelFilter = document.getElementById('mapel-filter');
    mapelFilter.innerHTML = '<option value="">Pilih Mata Pelajaran</option>';
    mapelFilter.disabled = true;
    const nilaiFilter = document.getElementById('jenis-nilai-filter');
    nilaiFilter.selectedIndex = 0;
    nilaiFilter.disabled = true;
    const kolomNilai = document.getElementById('kolom-nilai');
    if (kolomNilai) kolomNilai.style.display = 'none';
    if (!selectedTahunAjaran) return;
    await loadKelasFilter(selectedTahunAjaran);
    nilaiFilter.disabled = false;
});

document.getElementById('mapel-filter').addEventListener('change', function () {
    const jenisNilaiFilter = document.getElementById('jenis-nilai-filter');
    const jenisNilai = jenisNilaiFilter.value;
    const siswaTbody = document.getElementById('siswa-tbody');
    const tableHeader = document.querySelector('table thead tr');
    const allColumns = siswaTbody.querySelectorAll('[class^="column-"]:not(.column-nilai-akhir):not(.column-status):not(.column-catatan)');
    const allHeaders = tableHeader.querySelectorAll('[id^="header-"]:not(#header-nilai-akhir):not(#header-status):not(#header-catatan)');

    // Menyembunyikan semua kolom yang ada, termasuk nilai akhir, status, dan catatan
    allColumns.forEach(cell => {
        cell.style.display = 'none';
    });
    allHeaders.forEach(header => {
        header.style.display = 'none';
    });

    const additionalColumns = ['nilai-akhir', 'status', 'catatan'];
    additionalColumns.forEach(column => {
        siswaTbody.querySelectorAll(`.column-${column}`).forEach(cell => {
            cell.style.display = 'none';
        });

        const header = document.getElementById(`header-${column}`);
        if (header) {
            header.style.display = 'none';
        }
    });

    if (jenisNilai && jenisNilai !== 'nilai-akhir') {
        siswaTbody.querySelectorAll(`.column-${jenisNilai}`).forEach(cell => {
            cell.style.display = '';
        });

        const header = document.getElementById(`header-${jenisNilai}`);
        if (header) {
            header.style.display = '';
        }
    }

    jenisNilaiFilter.disabled = false;
});


document.addEventListener('DOMContentLoaded', () => {
    loadTahunAjaranFilter();
    fetchSiswaData();
});
