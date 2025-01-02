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



document.addEventListener('DOMContentLoaded', () => {
    fetchMading();
});


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


