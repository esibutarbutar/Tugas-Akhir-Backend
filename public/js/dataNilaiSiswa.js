async function fetchSiswaData(kelas = '') {
    try {
        const url = kelas ? `/api/siswa/kelas/${encodeURIComponent(kelas)}` : '/api/siswa';
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Gagal mengambil data siswa. Status: ${response.status}`);
        }

        const data = await response.json();
        renderSiswaTable(data);
    } catch (error) {
        console.error('Kesalahan dalam fetchSiswaData:', error);
        alert('Terjadi kesalahan saat memuat data siswa.');
    }
}


// Fungsi untuk menampilkan tabel siswa
function renderSiswaTable(data) {
    const siswaTbody = document.getElementById("siswa-tbody");
    siswaTbody.innerHTML = "";

    if (data.length === 0) {
        siswaTbody.innerHTML = `<tr><td colspan="3">Tidak ada data siswa.</td></tr>`;
        return;
    }

    data.forEach(siswa => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${siswa.nisn}</td>
            <td>${siswa.nama_siswa}</td>
            <td class="button-container">
                <button class="edit-btn-siswa" data-nisn="${siswa.nisn}">Edit</button>
                <button class="delete-btn-siswa" data-nisn="${siswa.nisn}">Delete</button>
            </td>
        `;
        siswaTbody.appendChild(row);
    });
}
function loadKelasFilter(tahunAjaranId = '') {
    const url = tahunAjaranId ? `/api/kelas?tahun_ajaran_id=${encodeURIComponent(tahunAjaranId)}` : '/api/kelas';
    fetch(url)
        .then(response => response.json())
        .then(data => {
            const filterSelect = document.getElementById('kelas-filter');
            filterSelect.innerHTML = '<option value="">Pilih Kelas</option>'; // Tambahkan opsi default
            data.forEach(kelas => {
                const option = document.createElement('option');
                option.value = kelas.id;
                option.textContent = kelas.nama_kelas;
                filterSelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error saat memuat filter kelas:', error);
        });
}


// Fungsi untuk memuat data kelas ke filter
function loadKelasFilter() {
    fetch('/api/kelas')
        .then(response => response.json())
        .then(data => {
            const filterSelect = document.getElementById('kelas-filter');
            filterSelect.innerHTML = '<option value="">Pilih Kelas</option>'; // Tambahkan opsi default
            data.forEach(kelas => {
                const option = document.createElement('option');
                option.value = kelas.id;
                option.textContent = kelas.nama_kelas;
                filterSelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error saat memuat filter kelas:', error);
        });
}



// Event listener untuk filter
document.getElementById('kelas-filter').addEventListener('change', function () {
    const selectedKelas = this.value;
    fetchSiswaData(selectedKelas); // Panggil fetchSiswaData dengan filter kelas
});

// Inisialisasi halaman
document.addEventListener('DOMContentLoaded', () => {
    loadKelasFilter(); // Muat opsi filter kelas
    fetchSiswaData();  // Muat semua siswa secara default
});
