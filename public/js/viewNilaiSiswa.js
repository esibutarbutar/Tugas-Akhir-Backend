function loadTahunAjaranOptions() {
    fetch('/api/tahun-ajaran') // Pastikan endpoint ini benar
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json(); // Pastikan response berbentuk JSON
        })
        .then(data => {
            // Cek apakah data yang diterima tidak kosong
            if (data && Array.isArray(data) && data.length > 0) {
                const select = document.getElementById('tahun-ajaran-filter');
                select.innerHTML = '<option value="">Pilih Tahun Ajaran</option>'; // Reset dropdown terlebih dahulu

                data.forEach(item => {
                    if (item.id && item.nama_tahun_ajaran && item.semester) {
                        const option = document.createElement('option');
                        option.value = item.id; // ID sebagai value
                        option.textContent = `${item.nama_tahun_ajaran} (${item.semester})`; // Tampilkan nama tahun ajaran dan semester
                        select.appendChild(option);
                    } else {
                        console.warn('Data tahun ajaran tidak lengkap:', item);
                    }
                });
                console.log('Dropdown tahun ajaran berhasil diisi.');
            } else {
                console.error('Data tahun ajaran kosong atau tidak sesuai format:', data);
            }
        })
        .catch(error => {
            console.error('Error loading tahun ajaran:', error);
        });
}



async function getUserSession() {
    try {
        const response = await fetch("api/session-siswa");
        if (!response.ok) throw new Error("Gagal memuat data session");

        const sessionData = await response.json();
        console.log("Data session pengguna:", sessionData);

        return sessionData.nisn;
    } catch (error) {
        console.error("Error:", error);
        alert("Gagal memuat data session.");
    }
}
document.addEventListener('DOMContentLoaded', function() {
    loadTahunAjaranOptions();

    // Panggil fungsi getUserSession dan tampilkan NISN di console
    getUserSession().then(nisn => {
        if (nisn) {
            console.log("NISN Pengguna:", nisn);
        } else {
            console.log("NISN tidak ditemukan.");
        }
    });
});

function filterGradesByYear() {
    const tahunAjaran = document.getElementById("tahun-ajaran-filter").value;
    if (tahunAjaran) {
        // Panggil API untuk mendapatkan data berdasarkan tahun ajaran
        fetch(`/api/grades/${tahunAjaran}`)
            .then(response => response.json())
            .then(gradesData => {
                displayGrades(gradesData);
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }
}

function displayGrades(gradesData) {
    const tbody = document.getElementById("nilai-tbody");
    tbody.innerHTML = ''; // Bersihkan tabel sebelumnya

    if (Array.isArray(gradesData) && gradesData.length > 0) {
        gradesData.forEach(grade => {
            const row = document.createElement("tr");

            // Matpel
            const matpelCell = document.createElement("td");
            matpelCell.textContent = grade.matpel || "Tidak tersedia";
            row.appendChild(matpelCell);

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
            nilaiAkhirCell.textContent = grade.nilai_akhir === 'Belum Disetujui'
                ? 'Belum Disetujui'
                : grade.nilai_akhir;
            row.appendChild(nilaiAkhirCell);

            tbody.appendChild(row);
        });
    } else {
        const row = document.createElement("tr");
        const cell = document.createElement("td");
        cell.colSpan = 5;
        cell.textContent = "Data tidak tersedia";
        row.appendChild(cell);
        tbody.appendChild(row);
    }
}


document.getElementById("tahun-ajaran-filter").addEventListener("change", filterGradesByYear);
