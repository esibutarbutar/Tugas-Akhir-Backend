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
                <button onclick="deleteTahunAjaran('${item.id}')">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    document.querySelectorAll('.edit-button-TA').forEach(button => {
        button.addEventListener('click', () => {
            const id = button.getAttribute('data-id-TA');
            editTahunAjaran(id);
        });
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



// Fungsi untuk menghapus tahun ajaran
function deleteTahunAjaran(id) {
    const confirmed = confirm("Apakah Anda yakin ingin menghapus data ini?");
    if (confirmed) {
        const index = tahunAjaranData.findIndex((item) => item.id === id);
        if (index !== -1) {
            tahunAjaranData.splice(index, 1);
            renderTahunAjaran();
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

fetchTahunAjaran();
