document.getElementById('search-subject-input').addEventListener('input', function () {
    const searchValue = this.value.trim().toLowerCase();
    loadMatpelData('', searchValue); // Menyaring berdasarkan input pencarian
});

function loadMatpelData(filterTahunAjaran = '', searchValue = '') {
    const url = filterTahunAjaran
        ? `/api/mata-pelajaran?tahun_ajaran=${encodeURIComponent(filterTahunAjaran)}`
        : `/api/mata-pelajaran`;

    console.log('Memuat data mata pelajaran dari:', url);

    fetch(url)
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            return response.json();
        })
        .then(data => {
            console.log('Data mata pelajaran yang diterima:', data);

            // Filter data berdasarkan pencarian
            const filteredData = data.filter(matpel => {
                const query = searchValue.toLowerCase();
                return matpel.id.toString().includes(query) ||
                    matpel.nama_mata_pelajaran.toLowerCase().includes(query) ||
                    matpel.nip.toString().includes(query) ||
                    (matpel.nama_pegawai && matpel.nama_pegawai.toLowerCase().includes(query));
            });

            const tbody = document.getElementById('mata-pelajaran-tbody');
            tbody.innerHTML = ''; // Kosongkan tabel sebelum mengisi data

            if (!filteredData || filteredData.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5">Data tidak ditemukan</td></tr>';
                return;
            }

            // Loop untuk menambahkan setiap data mata pelajaran yang sudah difilter ke tabel
            filteredData.forEach(matpel => {
                const namaPegawai = matpel.nama_pegawai || 'Nama Pegawai Tidak Ada';
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${matpel.id}</td>
                    <td>${matpel.nama_mata_pelajaran}</td>
                    <td>${matpel.nip} - ${namaPegawai}</td>
                    <td>${matpel.id_kelas} - ${matpel.nama_kelas}</td>
                `;
                tbody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Terjadi kesalahan saat memuat data mata pelajaran.');
        });
}
function loadTahunAjaranOptions() {
    fetch('/api/tahun-ajaran')
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            return response.json();
        })
        .then(data => {
            const select = document.getElementById('tahun-ajaran-filter');
            select.innerHTML = '<option value="">Semua</option>';

            data.forEach(item => {
                const option = document.createElement('option');
                option.value = item.id;
                option.textContent = `${item.nama_tahun_ajaran} (${item.semester})`;
                select.appendChild(option);
            });
            console.log('Dropdown tahun ajaran berhasil diisi.');
        })
        .catch(error => {
            console.error('Error loading tahun ajaran:', error);
        });
}

document.getElementById('tahun-ajaran-filter').addEventListener('change', function () {
    const filterValue = this.value;
    console.log('Filter tahun ajaran yang dipilih:', filterValue);
    loadMatpelData(filterValue);
});

// Memuat data awal
document.addEventListener('DOMContentLoaded', () => {
    loadTahunAjaranOptions();
    loadMatpelData();
});

