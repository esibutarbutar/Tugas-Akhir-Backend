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

// Fungsi untuk menampilkan data nilai siswa
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

    let shouldDisplaySaveButton = false; // Flag untuk mengecek apakah tombol simpan perlu ditampilkan
    let shouldDisplayEditButton = false; // Flag untuk mengecek apakah tombol edit perlu ditampilkan

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
                    input.classList.add('nilai-input');  // Tambahkan kelas untuk referensi
                    nilaiCell.appendChild(input);
                    shouldDisplaySaveButton = true; // Jika ada nilai yang kosong, tampilkan tombol simpan
                } else {
                    nilaiCell.textContent = grade[jenisNilai] || '-';
                    shouldDisplayEditButton = true; // Jika nilai sudah ada, tampilkan tombol edit
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

    // Jika ada nilai yang kosong, tampilkan tombol simpan
    if (shouldDisplaySaveButton) {
        const saveButtonRow = document.createElement("tr");
        const saveButtonCell = document.createElement("td");
        saveButtonCell.colSpan = 8; // Sesuaikan kolom sesuai jumlah
        saveButtonCell.style.textAlign = "right"; // Letakkan tombol di kanan
        const saveButton = document.createElement("button");
        saveButton.textContent = "Simpan Nilai";
        saveButton.id = "save-button";
        saveButton.addEventListener("click", saveAllGrades); // Simpan semua nilai yang belum diinput
        saveButtonCell.appendChild(saveButton);
        saveButtonRow.appendChild(saveButtonCell);
        tbody.appendChild(saveButtonRow);
    }

    // Jika ada nilai yang sudah diinput, tampilkan tombol edit
    if (shouldDisplayEditButton) {
        const editButtonRow = document.createElement("tr");
        const editButtonCell = document.createElement("td");
        editButtonCell.colSpan = 8; // Sesuaikan kolom sesuai jumlah
        editButtonCell.style.textAlign = "right"; // Letakkan tombol di kanan
        const editButton = document.createElement("button");
        editButton.textContent = "Edit Nilai";
        editButton.addEventListener("click", editGrades); // Fungsi untuk mengedit nilai
        editButtonCell.appendChild(editButton);
        editButtonRow.appendChild(editButtonCell);
        tbody.appendChild(editButtonRow);
    }
}
function saveAllGrades() {
    const nilaiInputs = document.querySelectorAll('.nilai-input');
    const gradesData = [];
    let isAllFilled = true;

    nilaiInputs.forEach(input => {
        const nisn = input.closest("tr").querySelector("td:nth-child(1)").textContent.trim();
        const grade = input.value.trim();
        const tahunAjaran = document.getElementById("tahun-ajaran-filter").value;
        const kelasId = document.getElementById("kelas-filter").value;
        const matpelId = document.getElementById("mapel-filter").value;
        const jenisNilai = document.getElementById("jenis-nilai-filter").value;

        if (!grade) {
            isAllFilled = false;
        }

        if (nisn && grade && tahunAjaran && kelasId && matpelId && jenisNilai) {
            gradesData.push({
                nisn,
                grade,
                tahunAjaran,
                kelasId,
                matpelId,
                jenisNilai
            });
        }
    });

    if (!isAllFilled) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Harap isi semua nilai terlebih dahulu!'
        });
        return;
    }

    if (gradesData.length === 0) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Tidak ada nilai yang diinput. Silakan masukkan nilai terlebih dahulu.'
        });
        return;
    }

    fetch('/api/simpan-nilai', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(gradesData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            Swal.fire({
                icon: 'success',
                title: 'Nilai Berhasil Disimpan!',
                text: data.message
            }).then(() => {
                const saveButton = document.getElementById("save-button");
                if (saveButton) {
                    saveButton.style.display = "none";  // Sembunyikan tombol simpan setelah berhasil
                }

                const tbody = document.querySelector("tbody");
                const editButtonRow = document.createElement("tr");
                const editButtonCell = document.createElement("td");
                editButtonCell.colSpan = 8;  // Menyesuaikan dengan jumlah kolom
                editButtonCell.style.textAlign = "right";  // Letakkan tombol di kanan

                const editButton = document.createElement("button");
                editButton.textContent = "Edit Nilai";
                editButton.addEventListener("click", editGrades);  // Menambahkan event listener untuk mengedit nilai

                editButtonCell.appendChild(editButton);
                editButtonRow.appendChild(editButtonCell);
                tbody.appendChild(editButtonRow);

                // Nonaktifkan input setelah simpan
                const nilaiCells = document.querySelectorAll("td");
                nilaiCells.forEach(cell => {
                    const input = cell.querySelector("input");
                    if (input) {
                        input.disabled = true;  // Nonaktifkan input setelah simpan
                    }
                });
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Terjadi kesalahan',
                text: 'Terjadi kesalahan saat menyimpan nilai. Silakan coba lagi.'
            });
        }
    })
    .catch(error => {
        console.error('Error saving grades:', error);
        Swal.fire({
            icon: 'error',
            title: 'Terjadi kesalahan',
            text: 'Terjadi kesalahan saat menyimpan nilai.'
        });
    });
}

// Fungsi untuk mengedit nilai
function editGrades(event) {
    const rows = document.querySelectorAll("#siswa-tbody tr");

    rows.forEach(row => {
        const cells = row.getElementsByTagName("td");
        const nilaiCell = cells[2]; // Anggap nilai ada pada kolom ketiga (ubah indeks sesuai kebutuhan)

        if (nilaiCell && !nilaiCell.querySelector("input")) {
            // Jika cell belum mengandung input, buat input
            const currentValue = nilaiCell.textContent.trim() || '';
            const input = document.createElement("input");
            input.disabled = false;
            input.type = "number";
            input.value = currentValue;
            input.classList.add("nilai-input");
            nilaiCell.innerHTML = ''; // Bersihkan teks nilai
            nilaiCell.appendChild(input);
            // Tambahkan input
        }
    });

    // Setelah edit, ganti tombol edit menjadi tombol simpan
    const editButton = event.target;
    editButton.textContent = "Simpan Nilai";
    editButton.removeEventListener("click", editGrades); // Hapus event edit
    editButton.addEventListener("click", saveEditedGrades); // Ganti event menjadi simpan
}

function saveEditedGrades(event) {
    const rows = document.querySelectorAll("#siswa-tbody tr");
    const gradesData = []; // Data untuk disimpan ke server

    rows.forEach(row => {
        const cells = row.getElementsByTagName("td");
        const nilaiCell = cells[2]; // Kolom nilai

        if (nilaiCell && nilaiCell.querySelector("input")) {
            const input = nilaiCell.querySelector("input");
            const newValue = input.value.trim();

            // Ambil NISN
            const nisn = row.cells[0].textContent.trim();

            // Persiapkan data untuk update
            const siswaData = {
                nisn,
                grade: newValue,
                tahunAjaran: document.getElementById("tahun-ajaran-filter").value,
                kelasId: document.getElementById("kelas-filter").value,
                matpelId: document.getElementById("mapel-filter").value,
                jenisNilai: document.getElementById("jenis-nilai-filter").value
            };

            gradesData.push(siswaData);
            nilaiCell.textContent = newValue;
            input.disabled = true;
            const editButton = event.target;
            editButton.textContent = "Edit Nilai";
            editButton.removeEventListener("click", saveEditedGrades); // Hapus event simpan
            editButton.addEventListener("click", editGrades);
        }
    });

    // Kirim data yang sudah diedit ke server
    if (gradesData.length > 0) {
        fetch('/api/simpan-nilai', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(gradesData)
        })
            .then(response => response.json())
            .then(data => {
                if (data.message) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Nilai Berhasil Diperbarui!',
                        text: data.message,
                        confirmButtonText: 'OK',
                        confirmButtonColor: '#004D40',

                    });
                }
            })
            .catch(error => {
                Swal.fire({
                    icon: 'error',
                    title: 'Terjadi kesalahan',
                    text: 'Terjadi kesalahan saat memperbarui nilai.',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#004D40',
                });
            });
    }
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


document.addEventListener('DOMContentLoaded', () => {
    loadTahunAjaranFilter();
    fetchSiswaData();
});
