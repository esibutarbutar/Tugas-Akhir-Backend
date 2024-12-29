async function getUserSession() {
    try {
        const response = await fetch("api/session"); // Ganti dengan endpoint session yang sesuai
        if (!response.ok) throw new Error("Gagal memuat data session");

        const sessionData = await response.json();
        console.log("Data session pengguna:", sessionData);

        return sessionData.nip; // Mengambil NIP pengguna
    } catch (error) {
        console.error("Error:", error);
        alert("Gagal memuat data session.");
    }
}



function displayKelas(kelasData) {
    console.log("kelasData:", kelasData); // Cek data yang diterima
    const kelasInfoDiv = document.getElementById("info-kelas");
    kelasInfoDiv.innerHTML = ''; // Bersihkan info kelas sebelumnya

    // Pastikan kelasData adalah array dan tidak kosong
    if (Array.isArray(kelasData) && kelasData.length > 0) {
        kelasData.forEach(kelas => {
            // Membuat elemen baru untuk setiap informasi kelas
            const namaKelas = document.createElement("p");
            namaKelas.innerHTML = `<strong>Nama Kelas:</strong> ${kelas.nama_kelas}`;

            const tingkatan = document.createElement("p");
            tingkatan.innerHTML = `<strong>Tingkatan:</strong> ${kelas.tingkatan}`;

            const tahunAjaran = document.createElement("p");
            tahunAjaran.innerHTML = `<strong>ID Tahun Ajaran:</strong> ${kelas.id_tahun_ajaran}`;

            // Menambahkan nama tahun ajaran (asumsikan ada properti `tahun_ajaran_nama` dalam data)
            const namaTahunAjaran = document.createElement("p");
            namaTahunAjaran.innerHTML = `
            <strong>Tahun Ajaran:</strong> ${kelas.nama_tahun_ajaran || 'Tidak tersedia'} - ${kelas.semester || 'Tidak tersedia'}
        `;
        
            // Menambahkan elemen ke div info-kelas
            kelasInfoDiv.appendChild(namaKelas);
            kelasInfoDiv.appendChild(tingkatan);
            kelasInfoDiv.appendChild(tahunAjaran);
            kelasInfoDiv.appendChild(namaTahunAjaran); // Menambahkan nama tahun ajaran
        });
    } else {
        // Jika tidak ada kelas yang dikelola
        const noKelasMessage = document.createElement("p");
        noKelasMessage.textContent = "Anda tidak mengelola kelas manapun.";
        noKelasMessage.classList.add('no-kelas');
        kelasInfoDiv.appendChild(noKelasMessage);
    }

    // Pastikan elemen tidak tersembunyi setelah data dimuat
    kelasInfoDiv.classList.remove("hidden");
}

async function fetchKelas() {
    try {
        const nip = await getUserSession(); // Mendapatkan NIP pengguna
        if (!nip) throw new Error("NIP pengguna tidak ditemukan.");

        const response = await fetch("/api/kelas"); // Endpoint untuk mendapatkan data kelas
        if (!response.ok) throw new Error("Gagal memuat data kelas");

        const kelasData = await response.json();
        console.log("Data kelas:", kelasData);

        // Filter kelas berdasarkan NIP
        const filteredKelas = kelasData.filter(kelas => kelas.nip === nip);
        console.log("Kelas yang dikelola oleh pengguna:", filteredKelas);

        // Menampilkan data kelas di halaman
        displayKelas(filteredKelas);

        // Ambil mata pelajaran berdasarkan id_kelas yang ditemukan
        if (filteredKelas.length > 0) {
            const kelasId = filteredKelas[0].id; // Mengambil id_kelas dari kelas pertama yang ditemukan
            await fetchMataPelajaran(kelasId); // Ambil mata pelajaran berdasarkan id_kelas
        }

    } catch (error) {
        console.error("Error:", error);
        alert("Gagal memuat data kelas atau nilai.");
    }
}

async function fetchMataPelajaran(kelasId) {
    try {
        const response = await fetch(`/api/mapel/${kelasId}`); // Ganti dengan endpoint API yang sesuai
        if (!response.ok) throw new Error("Gagal memuat mata pelajaran");

        const mataPelajaranData = await response.json();
        console.log("Data mata pelajaran:", mataPelajaranData);

        // Menampilkan mata pelajaran di dropdown
        displayMataPelajaran(mataPelajaranData);

    } catch (error) {
        console.error("Error:", error);
        alert("Gagal memuat mata pelajaran.");
    }
}

function displayMataPelajaran(mataPelajaranData) {
    const mapelSelect = document.getElementById("mapel-filter");
    mapelSelect.innerHTML = '<option value="">Pilih Mata Pelajaran</option>'; // Reset dropdown

    // Pastikan mataPelajaranData adalah array dan tidak kosong
    if (Array.isArray(mataPelajaranData) && mataPelajaranData.length > 0) {
        mataPelajaranData.forEach(mapel => {
            const option = document.createElement("option");
            option.value = mapel.id; // Ganti dengan id atau properti yang sesuai
            option.textContent = mapel.nama_mata_pelajaran; // Ganti dengan nama atau properti yang sesuai
            mapelSelect.appendChild(option);
        });
    }
}

// Fungsi untuk mendapatkan nilai berdasarkan kelas dan mata pelajaran
async function fetchGrades(kelasId, mapelId) {
    try {
        const response = await fetch(`/api/grades/${kelasId}/${mapelId}`); // Ganti dengan endpoint API yang sesuai
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

// Fungsi untuk menampilkan data nilai di tabel
function displayGrades(gradesData) {
    const tbody = document.getElementById("nilai-tbody");
    tbody.innerHTML = ''; // Bersihkan tabel sebelumnya

    // Pastikan gradesData adalah array dan tidak kosong
    if (Array.isArray(gradesData) && gradesData.length > 0) {
        gradesData.forEach(grade => {
            // Membuat baris untuk setiap data nilai
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
            utsCell.textContent = grade.gradesType === 'uts' ? grade.grade : '-';
            row.appendChild(utsCell);

            const uasCell = document.createElement("td");
            uasCell.textContent = grade.gradesType === 'uas' ? grade.grade : '-';
            row.appendChild(uasCell);

            const tugasCell = document.createElement("td");
            tugasCell.textContent = grade.gradesType === 'tugas' ? grade.grade : '-';
            row.appendChild(tugasCell);

            // Nilai Akhir
            const nilaiAkhirCell = document.createElement("td");
            nilaiAkhirCell.textContent = grade.nilai_akhir || 'Tidak tersedia';
            row.appendChild(nilaiAkhirCell);

            // Menambahkan baris ke tabel
            tbody.appendChild(row);
        });
    } else {
        // Jika tidak ada nilai
        const noDataRow = document.createElement("tr");
        const noDataCell = document.createElement("td");
        noDataCell.colSpan = 6;
        noDataCell.textContent = "Tidak ada data nilai.";
        noDataRow.appendChild(noDataCell);
        tbody.appendChild(noDataRow);
    }
}

// Event listener untuk menangani perubahan di dropdown mata pelajaran
document.getElementById("mapel-filter").addEventListener("change", async function() {
    const kelasId = await getSelectedKelasId(); // Ambil id_kelas yang terpilih
    const mapelId = this.value; // Ambil id_matpel yang dipilih

    if (kelasId && mapelId) {
        await fetchGrades(kelasId, mapelId); // Ambil dan tampilkan data nilai berdasarkan id_kelas dan id_matpel
    }
});

// Fungsi untuk mendapatkan id_kelas yang terpilih (sesuaikan dengan cara Anda menyimpannya)
async function getSelectedKelasId() {
    const nip = await getUserSession();
    const response = await fetch("/api/kelas"); // Ganti dengan endpoint yang sesuai
    const kelasData = await response.json();
    const kelas = kelasData.find(k => k.nip === nip); // Ambil kelas yang dikelola
    return kelas ? kelas.id : null;
}




document.addEventListener("DOMContentLoaded", function() {
    fetchKelas();
});
