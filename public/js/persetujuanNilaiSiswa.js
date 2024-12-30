async function getUserSession() {
    try {
        const response = await fetch("api/session");
        if (!response.ok) throw new Error("Gagal memuat data session");

        const sessionData = await response.json();
        console.log("Data session pengguna:", sessionData);

        return sessionData.nip;
    } catch (error) {
        console.error("Error:", error);
        alert("Gagal memuat data session.");
    }
}



function displayKelas(kelasData) {
    console.log("kelasData:", kelasData);
    const kelasInfoDiv = document.getElementById("info-kelas");
    kelasInfoDiv.innerHTML = '';
    if (Array.isArray(kelasData) && kelasData.length > 0) {
        kelasData.forEach(kelas => {
            const namaKelas = document.createElement("p");
            namaKelas.innerHTML = `<strong>Nama Kelas:</strong> ${kelas.nama_kelas}`;

            const tingkatan = document.createElement("p");
            tingkatan.innerHTML = `<strong>Tingkatan:</strong> ${kelas.tingkatan}`;

            const tahunAjaran = document.createElement("p");
            tahunAjaran.innerHTML = `<strong>ID Tahun Ajaran:</strong> ${kelas.id_tahun_ajaran}`;
            const namaTahunAjaran = document.createElement("p");
            namaTahunAjaran.innerHTML = `
            <strong>Tahun Ajaran:</strong> ${kelas.nama_tahun_ajaran || 'Tidak tersedia'} - ${kelas.semester || 'Tidak tersedia'}
        `;
            kelasInfoDiv.appendChild(namaKelas);
            kelasInfoDiv.appendChild(tingkatan);
            kelasInfoDiv.appendChild(tahunAjaran);
            kelasInfoDiv.appendChild(namaTahunAjaran);
        });
    } else {
        const noKelasMessage = document.createElement("p");
        noKelasMessage.textContent = "Anda tidak mengelola kelas manapun.";
        noKelasMessage.classList.add('no-kelas');
        kelasInfoDiv.appendChild(noKelasMessage);
    }

    kelasInfoDiv.classList.remove("hidden");
}

async function fetchKelas() {
    try {
        const nip = await getUserSession();
        if (!nip) throw new Error("NIP pengguna tidak ditemukan.");

        const response = await fetch("/api/kelas");
        if (!response.ok) throw new Error("Gagal memuat data kelas");

        const kelasData = await response.json();
        console.log("Data kelas:", kelasData);

        const filteredKelas = kelasData.filter(kelas => kelas.nip === nip);
        console.log("Kelas yang dikelola oleh pengguna:", filteredKelas);

        displayKelas(filteredKelas);

        if (filteredKelas.length > 0) {
            const kelasId = filteredKelas[0].id;
            await fetchMataPelajaran(kelasId);
        }

    } catch (error) {
        console.error("Error:", error);
        alert("Gagal memuat data kelas atau nilai.");
    }
}

async function fetchMataPelajaran(kelasId) {
    try {
        const response = await fetch(`/api/mapel/${kelasId}`);
        if (!response.ok) throw new Error("Gagal memuat mata pelajaran");

        const mataPelajaranData = await response.json();
        console.log("Data mata pelajaran:", mataPelajaranData);

        displayMataPelajaran(mataPelajaranData);

    } catch (error) {
        console.error("Error:", error);
        alert("Gagal memuat mata pelajaran.");
    }
}

function displayMataPelajaran(mataPelajaranData) {
    const mapelSelect = document.getElementById("mapel-filter");
    mapelSelect.innerHTML = '<option value="">Pilih Mata Pelajaran</option>';

    if (Array.isArray(mataPelajaranData) && mataPelajaranData.length > 0) {
        mataPelajaranData.forEach(mapel => {
            const option = document.createElement("option");
            option.value = mapel.id;
            option.textContent = mapel.nama_mata_pelajaran;
            mapelSelect.appendChild(option);
        });
    }
}

async function fetchGrades(kelasId, mapelId) {
    try {
        const response = await fetch(`/api/grades/${kelasId}/${mapelId}`);
        if (!response.ok) throw new Error("Gagal memuat data nilai");

        const gradesData = await response.json();
        console.log("Data nilai:", gradesData);

        // Tampilkan data nilai di tabel
        displayGrades(gradesData);
    } catch (error) {
        console.error("Error:", error);
        alert("Gagal memuat data nilai.");
    }
}
function displayGrades(gradesData) {
    const tbody = document.getElementById("nilai-tbody");
    tbody.innerHTML = ''; // Bersihkan tabel sebelumnya

    if (Array.isArray(gradesData) && gradesData.length > 0) {
        gradesData.forEach(grade => {
            const nilaiAkhir = (grade.uts * 0.3) + (grade.uas * 0.4) + (grade.tugas * 0.3);

            const row = document.createElement("tr");

            // NISN
            const nisnCell = document.createElement("td");
            nisnCell.textContent = grade.nisn;
            row.appendChild(nisnCell);

            // Nama Siswa
            const namaSiswaCell = document.createElement("td");
            namaSiswaCell.textContent = grade.nama_siswa || "Tidak tersedia";
            row.appendChild(namaSiswaCell);

            // Nilai UTS, UAS, dan Tugas
            const utsCell = document.createElement("td");
            utsCell.textContent = grade.uts || '-';
            row.appendChild(utsCell);

            const uasCell = document.createElement("td");
            uasCell.textContent = grade.uas || '-';
            row.appendChild(uasCell);

            const tugasCell = document.createElement("td");
            tugasCell.textContent = grade.tugas || '-';
            row.appendChild(tugasCell);

            // Nilai Akhir
            const nilaiAkhirCell = document.createElement("td");
            nilaiAkhirCell.textContent = nilaiAkhir.toFixed(2);
            row.appendChild(nilaiAkhirCell);

            // Status
            const statusCell = document.createElement("td");
            let checkIcon, timesIcon;

            // Mengupdate ikon berdasarkan gradeStatus
            if (grade.gradeStatus === "setuju") {
                statusCell.innerHTML = `<i class="fas fa-check-circle" style="color: green; cursor: pointer;" title="Lulus"></i>`;
                checkIcon = statusCell.querySelector('.fa-check-circle');
            } else if (grade.gradeStatus === "tolak") {
                statusCell.innerHTML = `<i class="fas fa-times-circle" style="color: red; cursor: pointer;" title="Tidak Lulus"></i>`;
                timesIcon = statusCell.querySelector('.fa-times-circle');
            } else {
                statusCell.innerHTML = `
                    <i class="fas fa-check-circle" style="color: green; cursor: pointer;" title="Lulus"></i>
                    <i class="fas fa-times-circle" style="color: red; cursor: pointer; margin-left: 10px;" title="Tidak Lulus"></i>`;
                checkIcon = statusCell.querySelector('.fa-check-circle');
                timesIcon = statusCell.querySelector('.fa-times-circle');
            }

            row.appendChild(statusCell);

            // Catatan
            const catatanCell = document.createElement("td");
            catatanCell.textContent = grade.catatan || ''; // Menampilkan catatan yang ada di database
            row.appendChild(catatanCell);

            // Event listener untuk ikon centang
            if (checkIcon) {
                checkIcon.addEventListener('click', () => {
                    catatanCell.textContent = "Lulus"; // Set catatan menjadi "Lulus"
                    statusCell.innerHTML = `<i class="fas fa-check-circle" style="color: green;"></i> Setuju`; // Update status
                    // Sembunyikan ikon silang
                    if (timesIcon) timesIcon.style.display = "none";
                    updateStatusInDB(grade.nisn, "Lulus", "Setuju", grade);
                });
            }

            // Event listener untuk ikon silang
            if (timesIcon) {
                timesIcon.addEventListener('click', () => {
                    const inputField = document.createElement("input");
                    inputField.type = "text";
                    inputField.placeholder = "Masukkan alasan";
                    inputField.style.width = "80%";

                    const saveButton = document.createElement("button");
                    saveButton.textContent = "Simpan";
                    saveButton.style.marginLeft = "5px";
                    saveButton.style.cursor = "pointer";

                    // Tombol Batal
                    const cancelButton = document.createElement("button");
                    cancelButton.textContent = "Batal";
                    cancelButton.style.marginLeft = "5px";
                    cancelButton.style.cursor = "pointer";

                    // Menyusun elemen input dan tombol
                    catatanCell.innerHTML = '';
                    catatanCell.appendChild(inputField);
                    catatanCell.appendChild(saveButton);
                    catatanCell.appendChild(cancelButton);

                    // Event listener untuk tombol Simpan
                    saveButton.addEventListener('click', () => {
                        const note = inputField.value.trim();

                        if (note) {
                            catatanCell.textContent = note;
                            statusCell.innerHTML = `<i class="fas fa-times-circle" style="color: red;"></i> Tolak`;
                            // Sembunyikan ikon centang
                            if (checkIcon) checkIcon.style.display = "none";
                            updateStatusInDB(grade.nisn, note, "Tolak", grade);
                        } else {
                            alert("Catatan tidak boleh kosong!");
                        }
                    });

                    cancelButton.addEventListener('click', () => {
                        // Mengembalikan catatan dan status seperti semula
                        catatanCell.textContent = grade.catatan || ''; // Kembalikan catatan sebelumnya
                        statusCell.innerHTML = `
                            <i class="fas fa-check-circle" style="color: green; cursor: pointer;" title="Setujui"></i>
                            <i class="fas fa-times-circle" style="color: red; cursor: pointer;" title="Tolak"></i>
                        `;
                        // Menampilkan ikon centang lagi jika perlu
                        if (checkIcon) checkIcon.style.display = "inline";
                    });
                });
            }

            tbody.appendChild(row);
        });
        const approveAllButton = document.createElement("button");
        approveAllButton.textContent = "Setujui Semua";
        approveAllButton.style.marginTop = "20px";
        approveAllButton.style.cursor = "pointer";
        approveAllButton.style.position = "absolute";
        approveAllButton.style.right = "20px";
        approveAllButton.style.backgroundColor = "#004D40";
        approveAllButton.style.color = "white";
        approveAllButton.style.padding = "8px 10px";
        approveAllButton.style.border = "none";
        approveAllButton.style.borderRadius = "5px";
        approveAllButton.style.fontSize = "12px";
        approveAllButton.style.transition = "background-color 0.3s";
        approveAllButton.addEventListener('mouseover', () => {
            approveAllButton.style.backgroundColor = "#45a049";
        });
        approveAllButton.addEventListener('mouseout', () => {
            approveAllButton.style.backgroundColor = "#004D40";
        }); 
        approveAllButton.addEventListener('click', () => {
            const allRows = Array.from(tbody.querySelectorAll("tr"));
            let allComplete = true; // Menyimpan status apakah semua nilai lengkap
            let updateSuccessful = true; // Menandakan apakah pembaruan status berhasil
        
            allRows.forEach(row => {
                const uts = row.cells[2].textContent; // Nilai UTS
                const uas = row.cells[3].textContent; // Nilai UAS
                const tugas = row.cells[4].textContent; // Nilai Tugas
        
                // Cek jika ada nilai yang kosong
                if (uts === '-' || uas === '-' || tugas === '-') {
                    allComplete = false; // Menandakan ada nilai yang belum lengkap
                }
            });
        
            // Jika ada nilai yang belum lengkap, tampilkan SweetAlert
            if (!allComplete) {
                Swal.fire({
                    title: 'Peringatan!',
                    text: 'Beberapa nilai belum lengkap! Periksa semua nilai sebelum melanjutkan.',
                    icon: 'warning',
                    confirmButtonText: 'OK'
                });
            } else {
                // Jika semua nilai lengkap, lanjutkan dengan menyetujui semua
                allRows.forEach(row => {
                    const statusCell = row.cells[5]; // Kolom Status
                    const catatanCell = row.cells[6]; // Kolom Catatan
                    const nisn = row.cells[0].textContent; // Ambil NISN
        
                    if (statusCell && catatanCell) {
                        // Update UI dengan status "Setuju"
                        statusCell.innerHTML = `<i class="fas fa-check-circle" style="color: green;"></i> Setuju`;
                        catatanCell.textContent = "Lulus";
        
                        // Kirim permintaan untuk memperbarui status ke backend
                        fetch('/api/update-grade-status', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                nisn: nisn,
                                catatan: 'Lulus',
                                status: 'Setuju',
                                mapel_id: row.cells[7].textContent // Assuming the mapel_id is stored in column 7
                            })
                        })
                        .then(response => response.json())
                        .then(data => {
                            if (data.message === 'Status berhasil diperbarui.') {
                                // Status berhasil diperbarui, lanjutkan
                                updateStatusInDB(nisn, "Lulus", "Setuju");
                            } else {
                                updateSuccessful = false;
                            }
                        })
                        .catch(err => {
                            console.error('Error:', err);
                            updateSuccessful = false;
                        });
                    }
                });
        
                // Tampilkan SweetAlert hanya jika semua update berhasil
                if (updateSuccessful) {
                    Swal.fire({
                        title: 'Sukses!',
                        text: 'Semua nilai berhasil disetujui!',
                        icon: 'success',
                        confirmButtonText: 'OK'
                    }).then(() => {
                        // Sembunyikan tombol setelah berhasil
                        approveAllButton.style.display = 'none'; // Menyembunyikan tombol
                    });
                } else {
                    Swal.fire({
                        title: 'Gagal!',
                        text: 'Terjadi kesalahan dalam memperbarui status nilai. Silakan coba lagi.',
                        icon: 'error',
                        confirmButtonText: 'OK'
                    });
                }
            }
        });
        
        
        document.getElementById("nilaiTable").appendChild(approveAllButton);
    } else {
        const noDataRow = document.createElement("tr");
        const noDataCell = document.createElement("td");
        noDataCell.colSpan = 8;
        noDataCell.textContent = "Tidak ada data nilai.";
        noDataRow.appendChild(noDataCell);
        tbody.appendChild(noDataRow);
    }
}


async function updateStatusInDB(nisn, catatan, status) {
    const mapelId = document.getElementById("mapel-filter").value;

    if (!mapelId) {
        alert("Silakan pilih mata pelajaran");
        return;
    }

    try {
        const response = await fetch(`/api/update-grade-status`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                nisn: nisn,
                catatan: catatan,
                status: status,
                mapel_id: mapelId,
            }),
        });

        if (!response.ok) {
            throw new Error('Gagal memperbarui status nilai.');
        }

        const result = await response.json();
        console.log('Status berhasil diperbarui:', result);
        alert('Status nilai berhasil diperbarui!');
    } catch (error) {
        console.error('Error:', error);
        alert('Gagal memperbarui status nilai.');
    }
}

document.getElementById("mapel-filter").addEventListener("change", async function () {
    const kelasId = await getSelectedKelasId();
    const mapelId = this.value;

    if (kelasId && mapelId) {
        await fetchGrades(kelasId, mapelId);
    }
});

async function getSelectedKelasId() {
    const nip = await getUserSession();
    const response = await fetch("/api/kelas");
    const kelasData = await response.json();
    const kelas = kelasData.find(k => k.nip === nip);
    return kelas ? kelas.id : null;
}




document.addEventListener("DOMContentLoaded", function () {
    fetchKelas();
});
