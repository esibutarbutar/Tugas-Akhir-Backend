document.addEventListener("DOMContentLoaded", () => {
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
            <td>
                <button class="edit-btn-siswa" data-nisn="${siswa.nisn}">Edit</button>
                <button onclick="deleteSiswa('${siswa.nisn}')">Delete</button>
            </td>
        `;
            siswaTbody.appendChild(row);
        });
    }
    fetchSiswaData();
});

async function deleteSiswa(nisn) {
    const result = await Swal.fire({
        title: 'Apakah Anda yakin?',
        text: `Siswa dengan NISN ${nisn} akan dihapus dari sistem.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3CB371', 
        cancelButtonColor: '#d33',    
        confirmButtonText: 'Ya, Hapus',
        cancelButtonText: 'Batal',
    });

    if (result.isConfirmed) {
        try {
            const response = await fetch(`/api/siswa/${nisn}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                Swal.fire({
                    title: 'Berhasil!',
                    text: 'Data Siswa berhasil dihapus.',
                    icon: 'success',
                    confirmButtonColor: '#3CB371', // Warna tombol sukses
                });

                // Hapus baris dari tabel
                const row = document.querySelector(`[data-siswa="${nisn}"]`).closest('tr');
                if (row) row.remove();
            } else {
                Swal.fire({
                    title: 'Gagal!',
                    text: 'Terjadi kesalahan saat menghapus data Siswa.',
                    icon: 'error',
                });
            }
        } catch (error) {
            console.error('Error deleting Siswa:', error);
            Swal.fire({
                title: 'Gagal!',
                text: 'Tidak dapat terhubung ke server.',
                icon: 'error',
            });
        }
    }
}

document.getElementById('search-student-input').addEventListener('input', function () {
    const searchQuery = this.value.toLowerCase();
    const rows = document.querySelectorAll('#siswa-tbody tr');

    rows.forEach(row => {
        const nameCell = row.cells[1].textContent.toLowerCase();
        const nisnCell = row.cells[0].textContent.toLowerCase();

        if (nameCell.includes(searchQuery) || nisnCell.includes(searchQuery)) {
            row.style.display = ''; // Tampilkan baris
        } else {
            row.style.display = 'none'; // Sembunyikan baris
        }
    });
});


document.addEventListener('click', (event) => {
    if (event.target.classList.contains('view-details-siswa')) {
        event.preventDefault(); // Mencegah aksi default tautan
        const nisn = event.target.getAttribute('data-nisn');
        viewDetails(nisn); // Fungsi untuk menangani klik "Lihat Selengkapnya"
    }
});

// Fungsi untuk menangani klik "Lihat Selengkapnya"
async function viewDetails(nisn) {
    try {
        console.log("Fetching details for NISN:", nisn); // Debug
        const response = await fetch(`/api/siswa/${nisn}`);
        if (!response.ok) throw new Error("Gagal mengambil data siswa!");

        const siswa = await response.json();
        console.log("Detail siswa:", siswa); // Debug untuk melihat data yang diterima

        // Tampilkan dengan SweetAlert2
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
            `,
            icon: 'info',
            confirmButtonText: 'Tutup',
            confirmButtonColor: '#3CB371'
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

document.addEventListener('click', (event) => {
    if (event.target.classList.contains('edit-btn-siswa')) {
        console.log("Edit button clicked!"); // Debugging: memastikan event listener bekerja
        const nisn = event.target.getAttribute('data-nisn');
        console.log("NISN:", nisn); // Debugging: memastikan NISN berhasil diambil
        editSiswa(nisn); // Panggil fungsi edit
    }
});

// Fungsi untuk menangani klik tombol "Edit"
async function editSiswa(nisn) {
    try {
        const response = await fetch(`/api/siswa/${nisn}`);
        if (!response.ok) throw new Error("Gagal mengambil data siswa untuk edit!");

        const siswa = await response.json();

        // Menampilkan formulir edit dalam SweetAlert
        const { value: formValues } = await Swal.fire({
            title: 'Edit Data Siswa',
            html: `
                <input id="nisn" type="text" class="swal2-input" value="${siswa.nisn}" disabled>
                <input id="nama_siswa" type="text" class="swal2-input" value="${siswa.nama_siswa}">
                <input id="alamat" type="text" class="swal2-input" value="${siswa.alamat}">
                <input id="tempat_lahir" type="text" class="swal2-input" value="${siswa.tempat_lahir}">
                <input id="tanggal_lahir" type="date" class="swal2-input" value="${formatDateToInput(siswa.tanggal_lahir)}">
            `,
            showCancelButton: true,
            cancelButtonText: 'Batal',
            confirmButtonText: 'Simpan',
            confirmButtonColor: '#3CB371',
            cancelButtonColor: '#d33',
            preConfirm: () => {
                return {
                    nama_siswa: document.getElementById('nama_siswa').value,
                    alamat: document.getElementById('alamat').value,
                    tempat_lahir: document.getElementById('tempat_lahir').value,
                    tanggal_lahir: document.getElementById('tanggal_lahir').value,
                };
            }
        });

        if (formValues) {
            // Kirim update ke server
            const responseUpdate = await fetch(`/api/siswa/${nisn}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formValues),
            });

            if (responseUpdate.ok) {
                Swal.fire({
                    title: 'Berhasil!',
                    text: 'Data siswa berhasil diperbarui.',
                    icon: 'success',
                });
                fetchSiswaData(); // Mengambil data siswa terbaru
            } else {
                Swal.fire({
                    title: 'Gagal!',
                    text: 'Terjadi kesalahan saat memperbarui data siswa.',
                    icon: 'error',
                });
            }
        }
    } catch (error) {
        console.error("Error updating siswa data:", error);
        Swal.fire({
            title: 'Gagal!',
            text: 'Tidak dapat mengambil data siswa untuk edit.',
            icon: 'error',
        });
    }
}
;
function formatDateToInput(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}