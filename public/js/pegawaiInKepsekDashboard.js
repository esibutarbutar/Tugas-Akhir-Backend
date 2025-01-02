const pegawaiTbody = document.getElementById('pegawai-tbody');

async function getDataPegawai() {
    try {
        pegawaiTbody.innerHTML = '';
        const response = await fetch('/api/pegawai');
        const pegawaiData = await response.json();
        pegawaiData.forEach(pegawai => {
            const row = document.createElement('tr');
            const tanggalLahir = formatDate(pegawai.tanggal_lahir);

            row.innerHTML = `
                <td>${pegawai.nip}</td>
                <td>${pegawai.nama_pegawai}</td>
                <td>${pegawai.tempat_lahir}</td>
                <td>${tanggalLahir}</td>
                <td>${pegawai.jenjang_pendidikan}</td>
                <td>${pegawai.jurusan}</td>
                <td>
                    <a href="#" class="view-details-pegawai" data-nip="${pegawai.nip}">Lihat Selengkapnya</a>
                </td>                
               
            `;
            pegawaiTbody.appendChild(row);
        });

        // Tambahkan event listener untuk tombol edit
        const editButtons = document.querySelectorAll('.edit-btn');
        editButtons.forEach(button => {
            button.addEventListener('click', async (event) => {
                const nip = event.target.getAttribute('data-nip');
                await editPegawai(nip); // Menangani edit pegawai berdasarkan NIP
            });
        });
    } catch (error) {
        console.error("Error fetching pegawai data:", error);
    }
}


const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
};
document.addEventListener("DOMContentLoaded", getDataPegawai);

// Menangani pencarian pegawai
document.getElementById('search-input').addEventListener('input', function () {
    const searchQuery = this.value.toLowerCase();
    const rows = document.querySelectorAll('#pegawai-tbody tr');

    rows.forEach(row => {
        const nameCell = row.cells[1].textContent.toLowerCase();
        const nipCell = row.cells[0].textContent.toLowerCase();

        if (nameCell.includes(searchQuery) || nipCell.includes(searchQuery)) {
            row.style.display = ''; // Tampilkan baris
        } else {
            row.style.display = 'none'; // Sembunyikan baris
        }
    });
});





document.addEventListener('click', async function (event) {
    if (event.target.classList.contains('view-details-pegawai')) {
        event.preventDefault(); // Mencegah navigasi default
        const nip = event.target.getAttribute('data-nip');

        try {
            const response = await fetch(`/api/pegawai/${nip}`);
            const pegawai = await response.json();

            const formatTanggal = (tanggal) => {
                if (!tanggal) return 'Tidak tersedia';
                const date = new Date(tanggal);
                return date.toLocaleDateString('id-ID'); // Format Indonesia
            };

            Swal.fire({
                title: `Detail Pegawai: ${pegawai.nama_pegawai}`,
                html: `
                    <p><strong>NIP:</strong> ${pegawai.nip || 'Tidak tersedia'}</p>
                    <p><strong>Nama:</strong> ${pegawai.nama_pegawai || 'Tidak tersedia'}</p>
                    <p><strong>Tempat, Tanggal Lahir:</strong> ${pegawai.tempat_lahir || 'Tidak tersedia'}, ${formatTanggal(pegawai.tanggal_lahir)}</p>
                    <p><strong>Jenis Kelamin:</strong> ${pegawai.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</p>
                    <p><strong>Alamat:</strong> ${pegawai.alamat || 'Tidak tersedia'}</p>
                    <p><strong>Agama:</strong> ${pegawai.agama || 'Tidak tersedia'}</p>
                    <p><strong>Email:</strong> ${pegawai.email || 'Tidak tersedia'}</p>
                    <p><strong>No HP:</strong> ${pegawai.no_hp || 'Tidak tersedia'}</p>
                    <p><strong>Jenjang Pendidikan:</strong> ${pegawai.jenjang_pendidikan || 'Tidak tersedia'}</p>
                    <p><strong>Jurusan:</strong> ${pegawai.jurusan || 'Tidak tersedia'}</p>
                    <p><strong>Tanggal Mulai Tugas:</strong> ${formatTanggal(pegawai.tanggal_mulai_tugas)}</p>
            `,
                icon: 'info',
                confirmButtonText: 'Tutup',
                confirmButtonColor: '#004D40'

            });
            
        } catch (error) {
            console.error('Error fetching details:', error);
            Swal.fire({
                title: 'Gagal!',
                text: 'Tidak dapat mengambil detail pegawai.',
                icon: 'error',
            });
        }
    }
});

