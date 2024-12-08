function fetchMading() {
    fetch('/api/mading') // Pastikan endpoint Anda benar
        .then(response => response.json())
        .then(data => {
            renderMading(data);
        })
        .catch(error => {
            console.error("Error fetching Mading data:", error);
        });
}

function renderMading(data) {
    const container = document.getElementById("mading-container");
    container.innerHTML = ""; // Kosongkan container sebelum render ulang

    data.forEach(item => {
        const card = document.createElement("div");
        card.className = "mading-card";

        card.innerHTML = `
            <div class="mading-title">${item.judul}</div>
            <div class="mading-date">${new Date(item.tanggal).toLocaleDateString()}</div>
            <div class="mading-description">${item.konten}</div>
            <div class="mading-actions">
                <button class="view-btn" data-id="${item.id}">Lihat</button>
                <button class="delete-btn" data-id="${item.id}">Hapus</button>
            </div>
        `;

        container.appendChild(card);
    });

    // Delegasi event untuk tombol
    container.addEventListener("click", function (event) {
        const id = event.target.getAttribute("data-id");

        if (event.target.classList.contains("view-btn")) {
            viewMading(id);
        } else if (event.target.classList.contains("delete-btn")) {
            deleteMading(id);
        }
    });
}

async function viewMading(id) {
    try {
        const response = await fetch(`/api/mading/${id}`);
        const mading = await response.json();

        Swal.fire({
            title: mading.judul,
            text: mading.deskripsi,
            footer: `Dibuat pada: ${new Date(mading.tanggal).toLocaleDateString()}`,
        });
    } catch (error) {
        console.error("Error viewing Mading:", error);
        Swal.fire({
            title: "Gagal!",
            text: "Tidak dapat menampilkan mading.",
            icon: "error",
        });
    }
}

async function deleteMading(id) {
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
            const response = await fetch(`/api/mading/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                Swal.fire({
                    title: 'Berhasil!',
                    text: 'Mading berhasil dihapus.',
                    icon: 'success',
                });
                fetchMading(); // Refresh data
            } else {
                const errorMessage = await response.json();
                Swal.fire({
                    title: 'Gagal!',
                    text: errorMessage.message || 'Terjadi kesalahan saat menghapus mading.',
                    icon: 'error',
                });
            }
        } catch (error) {
            console.error("Error deleting Mading:", error);
            Swal.fire({
                title: 'Gagal!',
                text: 'Tidak dapat menghapus mading.',
                icon: 'error',
            });
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    fetchMading();
});

async function addMading() {
    Swal.fire({
        title: "Tambah Pengumuman Baru",
        html: `
            <input type="text" id="judul" class="swal2-input" placeholder="Judul Pengumuman">
            <textarea id="konten" class="swal2-textarea" placeholder="Isi Pengumuman"></textarea>
            <input type="date" id="tanggal" class="swal2-input">
        `,
        confirmButtonText: "Tambah",
        showCancelButton: true,
        preConfirm: () => {
            const judul = document.getElementById("judul").value.trim();
            const konten = document.getElementById("konten").value.trim();
            const tanggal = document.getElementById("tanggal").value;

            if (!judul || !konten || !tanggal) {
                Swal.showValidationMessage("Semua kolom harus diisi!");
                return null;
            }

            return { judul, konten, tanggal };
        },
    }).then((result) => {
        if (result.isConfirmed) {
            const { judul, konten, tanggal } = result.value;

            fetch('/api/mading', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ judul, konten, tanggal }),
            })
                .then((response) => {
                    if (!response.ok) throw new Error("Gagal menambah mading.");
                    return response.json();
                })
                .then(() => {
                    Swal.fire("Berhasil!", "Pengumuman baru telah ditambahkan.", "success");
                    fetchMading(); // Refresh data
                })
                .catch((error) => {
                    console.error("Error adding Mading:", error);
                    Swal.fire("Gagal!", "Terjadi kesalahan saat menambah pengumuman.", "error");
                });
        }
    });
}


// Tambahkan event listener untuk tombol tambah
document.getElementById("add-mading-btn").addEventListener("click", addMading);

document.getElementById('search-mading-input').addEventListener('input', function () {
    const searchQuery = this.value.toLowerCase();
    const rows = document.querySelectorAll('#mading-container');

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

