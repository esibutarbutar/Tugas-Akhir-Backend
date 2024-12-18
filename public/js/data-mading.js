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
    container.innerHTML = "";

    data.forEach(item => {
        const card = document.createElement("div");
        card.className = "mading-card";

        const shortDescription = item.konten.length > 200 
            ? item.konten.slice(0, 200).trim() + "..." 
            : item.konten;

        // Membuat konten HTML untuk setiap item
        card.innerHTML = `
            <div class="mading-title">${item.judul}</div>
            <hr>
            <div class="mading-image">
                ${item.foto ? `<img src="${item.foto}" alt="Mading Image">` : ''}
            </div>
            <div class="mading-description">
                ${shortDescription}
                ${item.konten.length > 200 ? `<a href="#" class="read-more">Lihat Selengkapnya</a>` : ''}
            </div>
            <div class="mading-date">${new Date(item.tanggal).toLocaleDateString()}</div>
            <div class="mading-actions">
                <button class="view-btn" data-id="${item.id}">Lihat</button>
                <button class="delete-btn" data-id="${item.id}">Hapus</button>
            </div>
        `;
        container.appendChild(card);

        // Event handler untuk "Lihat Selengkapnya"
        const readMoreLink = card.querySelector('.read-more');
        if (readMoreLink) {
            readMoreLink.addEventListener('click', (e) => {
                e.preventDefault();
                // Tampilkan detail dengan SweetAlert
                Swal.fire({
                    title: item.judul,
                    html: `
                        <div class="swal-content">
                            ${item.foto ? `<img src="${item.foto}" alt="Mading Image" style="max-width: 300px; height: auto; margin-bottom: 10px;">` : ''}
                            <p>${item.konten}</p>
                        </div>
                    `,
                    icon: 'info',
                    showCloseButton: true,
                    confirmButtonText: 'Tutup',
                    customClass: {
                        popup: 'swal-custom-popup'
                    }
                });
            });
        }
    });

container.addEventListener("click", function (event) {
    const id = event.target.getAttribute("data-id");

    if (event.target.classList.contains("view-btn")) {
        // Ambil data dari atribut tombol "data-id"
        const selectedMading = data.find(item => item.id === id); 
        if (selectedMading) {
            Swal.fire({
                title: selectedMading.judul,
                html: `
                    <div class="swal-content">
                        ${selectedMading.foto ? `<img src="${selectedMading.foto}" alt="Mading Image" style="max-width: 100%; margin-bottom: 10px;">` : ''}
                        <p>${selectedMading.konten}</p>
                    </div>
                `,
                icon: 'info',
                showCloseButton: true,
                confirmButtonText: 'Tutup',
                customClass: {
                    popup: 'swal-custom-popup'
                }
            });
        }
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
            html: `
                <div class="swal-content">
                    ${mading.foto ? `<img src="${mading.foto}" alt="Mading Image" style="max-width: 300px; height: auto; margin-bottom: 10px;">` : ''}
                    <p>${mading.deskripsi}</p>
                </div>
            `,
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
    try {
        const response = await fetch(`/api/mading/${id}`);
        const mading = await response.json();

        const result = await Swal.fire({
            title: 'Apakah Anda yakin?',
            text: `Data mading "${mading.judul}" akan dihapus. Data yang dihapus tidak dapat dikembalikan!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#004D40',
            confirmButtonText: 'Ya, hapus!',
            cancelButtonText: 'Batal',
            cancelButtonColor: '#FF0000',
        });

        if (result.isConfirmed) {
            await fetch(`/api/mading/${id}`, {
                method: 'DELETE',
            });
            Swal.fire({
                title: 'Berhasil!',
                text: 'Pengumuman berhasil dihapuss.',
                icon: 'success',
               confirmButtonColor: '#004D40'
            });
            fetchMading()
        }
    } catch (error) {
        console.error("Error deleting Mading:", error);
        Swal.fire('Gagal!', 'Tidak dapat menghapus mading.', 'error');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    fetchMading();
});

// Tambahkan event listener untuk tombol tambah
document.getElementById("add-mading-btn").addEventListener("click", addMading);

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



document.addEventListener('DOMContentLoaded', () => {
    fetchMading();
});

async function addMading() {
    const today = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD

    Swal.fire({
        title: "Tambah Pengumuman Baru",
        html: `
            <input type="text" id="judul" class="swal2-input" placeholder="Judul Pengumuman">
            <textarea id="konten" class="swal2-textarea" placeholder="Isi Pengumuman"></textarea>
            <input type="file" id="image" class="swal2-input" accept="image/*"> <!-- Input gambar -->
        `,
        confirmButtonText: "Tambah",
        showCancelButton: true,
        cancelButtonText: 'Batal',
        cancelButtonColor: '#FF0000',
        confirmButtonColor: '#004D40',


        preConfirm: () => {
            const judul = document.getElementById("judul").value.trim();
            const konten = document.getElementById("konten").value.trim();
            const image = document.getElementById("image").files[0]; // Mengambil file gambar

            if (!judul || !konten) {
                Swal.showValidationMessage("Semua kolom harus diisi!");
                return null;
            }

            // Return objek dengan tambahan file gambar
            return { judul, konten, tanggal: today, image };
        },
    }).then((result) => {
        if (result.isConfirmed) {
            const { judul, konten, tanggal, image } = result.value;

            const formData = new FormData();
            formData.append("judul", judul);
            formData.append("konten", konten);
            formData.append("tanggal", tanggal);
            if (image) {
                formData.append("image", image); // Menambahkan file gambar ke form data
            }

            fetch('/api/mading', {
                method: "POST",
                body: formData, // Kirim data dengan FormData
            })
            .then(async (response) => {
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || "Gagal menambah mading.");
                }
                return response.json();
            })
            .then(() => {
                Swal.fire({
                    title: 'Berhasil!',
                    text: 'Pengumuman berhasil ditambahkan.',
                    icon: 'success',
                   confirmButtonColor: '#004D40'
                });                
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
    const rows = document.querySelectorAll('#mading-container .mading-card'); // Pilih elemen yang sesuai

    rows.forEach(row => {
        const judulCell = row.querySelector('.mading-title').textContent.toLowerCase(); // Menyesuaikan dengan kelas judul
        const kontenCell = row.querySelector('.mading-description').textContent.toLowerCase(); // Menyesuaikan dengan kelas konten

        if (judulCell.includes(searchQuery) || kontenCell.includes(searchQuery)) {
            row.style.display = ''; // Tampilkan baris
        } else {
            row.style.display = 'none'; // Sembunyikan baris
        }
    });
});


