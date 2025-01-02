const siswaTbody = document.getElementById("siswa-tbody");

async function fetchSiswaData() {
    try {
        const response = await fetch('/api/siswa');
        if (response.ok) {
            const data = await response.json();
            renderSiswaTable(data);
        } else {
            console.error("Gagal mengambil data siswa:", response.statusText);
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

function renderSiswaTable(data) {
    siswaTbody.innerHTML = "";
    data.forEach((siswa, index) => {
        const row = document.createElement("tr");
        const tanggalLahir = formatDate(siswa.tanggal_lahir);
        row.innerHTML = `
        <td>${siswa.nisn}</td>
        <td>${siswa.nama_siswa}</td>
        <td>${siswa.tempat_lahir}</td>
        <td>${tanggalLahir}</td>
        <td>${siswa.alamat}</td>
        <td>
            <a href="#" class="view-details-siswa" data-nisn="${siswa.nisn}">Lihat Selengkapnya</a>
        </td>                
       
    `;
        siswaTbody.appendChild(row);
    });
}
fetchSiswaData()


document.getElementById('search-student-input').addEventListener('input', function () {
    const searchQuery = this.value.toLowerCase();
    const rows = document.querySelectorAll('#siswa-tbody tr');

    rows.forEach(row => {
        const nameCell = row.cells[1].textContent.toLowerCase();
        const nisnCell = row.cells[0].textContent.toLowerCase();

        if (nameCell.includes(searchQuery) || nisnCell.includes(searchQuery)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
});


document.addEventListener('click', (event) => {
    if (event.target.classList.contains('view-details-siswa')) {
        event.preventDefault();
        const nisn = event.target.getAttribute('data-nisn');
        viewDetails(nisn);
    }
});

document.addEventListener('click', (event) => {
    if (event.target.classList.contains('view-details-siswa')) {
        event.preventDefault();
        const nisn = event.target.getAttribute('data-nisn');
        viewDetails(nisn);
    }
});

async function viewDetails(nisn) {
    try {
        console.log("Fetching details for NISN:", nisn);
        const response = await fetch(`/api/siswa/${nisn}`);
        if (!response.ok) throw new Error("Gagal mengambil data siswa!");

        const siswa = await response.json();
        console.log("Detail siswa:", siswa);  // Cek data siswa yang diterima
        console.log("Kelas siswa:", siswa.nama_kelas);  // Cek apakah nama_kelas ada

        Swal.fire({
            title: `Detail Siswa: ${siswa.nama_siswa}`,
            html: `
                <strong>NISN:</strong> ${siswa.nisn}<br>
                <strong>Nama:</strong> ${siswa.nama_siswa}<br>
                <strong>Tempat Lahir:</strong> ${siswa.tempat_lahir}<br>
                <strong>Tanggal Lahir:</strong> ${formatDate(siswa.tanggal_lahir)}<br>
                <strong>Alamat:</strong> ${siswa.alamat}<br>
                <strong>Jenis Kelamin:</strong> ${siswa.jenis_kelamin}<br>
                <strong>Agama:</strong> ${siswa.agama}<br>
                <strong>NIK:</strong> ${siswa.nik}<br>
                <strong>Nama Ayah:</strong> ${siswa.nama_ayah}<br>
                <strong>Nama Ibu:</strong> ${siswa.nama_ibu}<br>
                <strong>No HP ortu:</strong> ${siswa.no_hp_ortu}<br>
                <strong>Email:</strong> ${siswa.email}<br>
                <strong>Anak Ke:</strong> ${siswa.anak_ke}<br>
                <strong>Status:</strong> ${siswa.status}<br>
                <strong>Tanggal Masuk:</strong> ${formatDate(siswa.tanggal_masuk)}<br>
                <strong>Kelas:</strong> ${siswa.id_kelas} - ${siswa.nama_kelas || 'Tidak tersedia'}<br>
            `,
            icon: 'info',
            confirmButtonText: 'Tutup',
            confirmButtonColor: '#004D40'
        });
    } catch (error) {
        console.error("Error fetching siswa details:", error);
        Swal.fire({
            title: 'Error',
            text: 'Gagal mengambil detail siswa. Silakan coba lagi.',
            icon: 'error',
            confirmButtonText: 'Tutup',
        });
    }
}


function formatDateToInput(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

