function fetchTahunAjaran() {
    fetch('/api/tahun-ajaran')
        .then(response => response.json())
        .then(data => {
            renderTahunAjaran(data);
        })
        .catch(error => {
            console.error("Error fetching Tahun Ajaran data:", error);
        });
}

function renderTahunAjaran(data) {
    const tbody = document.getElementById("tahun-ajaran-tbody");
    tbody.innerHTML = "";

    data.forEach(item => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${item.nama_tahun_ajaran}</td>
            <td>${item.tanggal_mulai}</td>
            <td>${item.tanggal_selesai}</td>
            <td>${item.semester}</td>
            <td>
                <button class="edit-button-TA" data-id-TA="${item.id}">Edit</button>
                <button class="delete-button-TA" data-id-TA="${item.id}">Delete</button>            
            </td>
        `;
        tbody.appendChild(tr);
    });

     // Event delegation untuk tombol Delete
     tbody.addEventListener("click", function (event) {
        if (event.target.classList.contains("delete-button-TA")) {
            const id = event.target.getAttribute("data-id-TA");
            deleteTahunAjaran(id);
        }
    });

    // Event delegation untuk tombol Edit
    tbody.addEventListener("click", function (event) {
        if (event.target.classList.contains("edit-button-TA")) {
            const id = event.target.getAttribute("data-id-TA");
            editTahunAjaran(id);
        }
    });
    
}

document.addEventListener('DOMContentLoaded', () => {
    fetchTahunAjaran();
});
document.getElementById("tahun-ajaran-tbody").addEventListener('click', (event) => {
    if (event.target.classList.contains('edit-button-TA')) {
        const id = event.target.getAttribute('data-id-TA');
        editTahunAjaran(id);
    }
});


async function editTahunAjaran(id) {
    try {
        const response = await fetch(`/api/tahun-ajaran/${id}`);
        if (!response.ok) throw new Error("Gagal mengambil Tahun Ajaran untuk edit!");

        const TA = await response.json();

        const { value: formValues } = await Swal.fire({
            title: 'Edit Data Tahun Ajaran',
            html: `
            <input id="nama_TA" type="text" class="swal2-input" value="${TA.nama_tahun_ajaran}">
            <input id="semester" type="text" class="swal2-input" value="${TA.semester}">
            <input id="tanggal_mulai" type="date" class="swal2-input" value="${formatDateToInput(TA.tanggal_mulai)}">
            <input id="tanggal_selesai" type="date" class="swal2-input" value="${formatDateToInput(TA.tanggal_selesai)}">
        `,        
            showCancelButton: true,
            cancelButtonText: 'Batal',
            confirmButtonText: 'Simpan',
            preConfirm: () => {
                console.log("Data yang dikirim:", {
                    nama_tahun_ajaran: document.getElementById('nama_TA').value,
                    semester: document.getElementById('semester').value,  // Pastikan semester ada di sini
                    tanggal_mulai: document.getElementById('tanggal_mulai').value,
                    tanggal_selesai: document.getElementById('tanggal_selesai').value,
                });
            
                return {
                    nama_tahun_ajaran: document.getElementById('nama_TA').value,
                    semester: document.getElementById('semester').value,
                    tanggal_mulai: document.getElementById('tanggal_mulai').value,
                    tanggal_selesai: document.getElementById('tanggal_selesai').value,
                };
            }
            
        });

        if (formValues) {
            const responseUpdate = await fetch(`/api/tahun-ajaran/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formValues),
            });

            if (responseUpdate.ok) {
                await responseUpdate.json();
                Swal.fire({
                    title: 'Berhasil!',
                    text: 'Data Tahun Ajaran berhasil diperbarui.',
                    icon: 'success',
                });
                fetchTahunAjaran(); // Refresh data
            } else {
                const errorMessage = await responseUpdate.json();
                Swal.fire({
                    title: 'Gagal!',
                    text: errorMessage.message || 'Terjadi kesalahan saat memperbarui data.',
                    icon: 'error',
                });
            }
        }
    } catch (error) {
        console.error("Error updating Tahun Ajaran data:", error);
        Swal.fire({
            title: 'Gagal!',
            text: 'Tidak dapat mengambil data Tahun Ajaran untuk edit.',
            icon: 'error',
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

async function deleteTahunAjaran(id) {
    console.log("Menghapus data dengan ID " + id);

    // Gunakan SweetAlert untuk konfirmasi
    const result = await Swal.fire({
        title: 'Apakah Anda yakin?',
        text: "Data yang dihapus tidak dapat dikembalikan!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Ya, hapus!',
        cancelButtonText: 'Batal',
    });

    if (result.isConfirmed) {
        try {
            // Mengirim permintaan DELETE ke API
            const response = await fetch(`/api/tahun-ajaran/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                Swal.fire({
                    title: 'Berhasil!',
                    text: 'Data Tahun Ajaran berhasil dihapus.',
                    icon: 'success',
                });
                fetchTahunAjaran(); // Memuat ulang data setelah penghapusan
            } else {
                const errorMessage = await response.json();
                Swal.fire({
                    title: 'Gagal!',
                    text: errorMessage.message || 'Terjadi kesalahan saat menghapus data.',
                    icon: 'error',
                });
            }
        } catch (error) {
            console.error("Error deleting Tahun Ajaran:", error);
            Swal.fire({
                title: 'Gagal!',
                text: 'Tidak dapat menghapus data Tahun Ajaran.',
                icon: 'error',
            });
        }
    }
}


document.getElementById('tambah-tahun-ajaran').addEventListener('click', async () => {
    try {
        const { value: formValues } = await Swal.fire({
            title: 'Tambah Tahun Ajaran Baru',
            html: `
                <input id="nama_TA" type="text" class="swal2-input" placeholder="Nama Tahun Ajaran">
                <input id="semester" type="text" class="swal2-input" placeholder="Semester">
                <input id="tanggal_mulai" type="date" class="swal2-input" placeholder="Tanggal Mulai">
                <input id="tanggal_selesai" type="date" class="swal2-input" placeholder="Tanggal Selesai">
            `,
            showCancelButton: true,
            cancelButtonText: 'Batal',
            confirmButtonText: 'Simpan',
            preConfirm: () => {
                const tanggal_mulai = new Date(document.getElementById('tanggal_mulai').value);
                const tanggal_selesai = new Date(document.getElementById('tanggal_selesai').value);
            
                if (tanggal_mulai > tanggal_selesai) {
                    Swal.showValidationMessage('Tanggal Mulai harus sebelum Tanggal Selesai!');
                    return null;
                }
                console.log("Data yang dikirim:", {
                    nama_tahun_ajaran: document.getElementById('nama_TA').value,
                    semester: document.getElementById('semester').value,  // Pastikan semester ada di sini
                    tanggal_mulai: document.getElementById('tanggal_mulai').value,
                    tanggal_selesai: document.getElementById('tanggal_selesai').value,
                });
                return {
                    nama_tahun_ajaran: document.getElementById('nama_TA').value,
                    semester: document.getElementById('semester').value,
                    tanggal_mulai: document.getElementById('tanggal_mulai').value,
                    tanggal_selesai: document.getElementById('tanggal_selesai').value,
                };
            }
        });

        if (formValues) {
            // Kirim data ke API untuk menyimpan
            const response = await fetch('/api/tahun-ajaran', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formValues),
            });

            if (response.ok) {
                await response.json();
                Swal.fire({
                    title: 'Berhasil!',
                    text: 'Tahun Ajaran berhasil ditambahkan.',
                    icon: 'success',
                });
                fetchTahunAjaran(); // Refresh data
            } else {
                const errorMessage = await response.json();
                Swal.fire({
                    title: 'Gagal!',
                    text: errorMessage.message || 'Terjadi kesalahan saat menambahkan Tahun Ajaran.',
                    icon: 'error',
                });
            }
        }
    } catch (error) {
        console.error("Error adding Tahun Ajaran:", error);
        Swal.fire({
            title: 'Gagal!',
            text: 'Tidak dapat menambahkan Tahun Ajaran baru.',
            icon: 'error',
        });
    }
});

document.getElementById('search-year-input').addEventListener('input', function () {
    const searchQuery = this.value.toLowerCase();
    const rows = document.querySelectorAll('#tahun-ajaran-tbody tr');

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

fetchTahunAjaran();

