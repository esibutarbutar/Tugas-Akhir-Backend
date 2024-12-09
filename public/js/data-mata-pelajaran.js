function loadMatpelData() {
    console.log('Memuat data mata pelajaran...');
    fetch('/api/mata-pelajaran')
        .then(response => response.json())
        .then(data => {
            const tbody = document.getElementById('mata-pelajaran-tbody');
            tbody.innerHTML = ''; // Kosongkan tabel
            data.forEach(matpel => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${matpel.id_mata_pelajaran}</td>
                    <td>${matpel.nama_matpel}</td>
                    <td>${matpel.nip}</td>
                    <td>${matpel.id_tahun_ajaran}</td>
                     <td>
                        <button onclick="editMatpel(${matpel.id_mata_pelajaran})">Edit</button>
                        <button onclick="deleteMatpel('${matpel.id_mata_pelajaran}')">Delete</button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        })
        .catch(error => console.error('Error:', error));
}

function generateSubjectId(namaMatpel) {
    const prefixMap = {
        'pendidikan agama': 'PA',
        'bahasa indonesia': 'BIND',
        'matematika': 'MTK',
        'ipa': 'IPA',
        'ips': 'IPS',
        'bahasa inggris': 'ENG',
    };
    const prefix = prefixMap[namaMatpel.toLowerCase()] || 'EKS';
    return `${prefix}${Math.floor(1000 + Math.random() * 9000)}`;
}

document.getElementById('add-subject-btn').addEventListener('click', function () {
    Swal.fire({
        title: 'Tambah Mata Pelajaran',
        html: `
            <label for="nama_matpel">Nama Mata Pelajaran</label>
            <input type="text" id="nama_matpel" class="swal2-input">
            <label for="nip">NIP</label>
            <input type="text" id="nip" class="swal2-input">
            <label for="id_tahun_ajaran">ID Tahun Ajaran</label>
            <input type="text" id="id_tahun_ajaran" class="swal2-input">
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Tambah',
        preConfirm: async () => {
            const namaMatpel = document.getElementById('nama_matpel').value;
            const nip = document.getElementById('nip').value;
            const idTahunAjaran = document.getElementById('id_tahun_ajaran').value;
            const idMataPelajaran = generateSubjectId(namaMatpel);

            if (!namaMatpel || !nip || !idTahunAjaran) {
                Swal.showValidationMessage('Semua field harus diisi');
                return false;
            }

            try {
                // Mengirim data ke server
                const response = await fetch('http://localhost:3000/api/mata-pelajaran', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id_mata_pelajaran: idMataPelajaran, nama_matpel: namaMatpel, nip, id_tahun_ajaran: idTahunAjaran }),
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const result = await response.json();
                if (!result.success) {
                    throw new Error(result.message);
                }

                return result; // Mengembalikan hasil ke Swal.fire
            } catch (error) {
                Swal.showValidationMessage(`Error: ${error.message}`);
                return false; // Gagal validasi
            }
        },
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire('Berhasil!', 'Mata Pelajaran berhasil ditambahkan', 'success').then(() => {
                loadMatpelData(); // Memuat ulang data mata pelajaran
            });
        }
    });
});

function deleteMatpel(id) {
    Swal.fire({
        title: 'Apakah Anda yakin?',
        text: 'Mata pelajaran akan dihapus secara permanen!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Ya, hapus!',
        cancelButtonText: 'Batal',
    }).then((result) => {
        if (result.isConfirmed) {
            fetch(`/api/mata-pelajaran/${id}`, {
                method: 'DELETE',
            })
            .then(response => {
                if (response.ok) {
                    Swal.fire('Berhasil!', 'Mata pelajaran telah dihapus.', 'success').then(() => {
                        loadMatpelData(); // Memuat ulang data setelah penghapusan
                    });
                } else {
                    return response.json().then(data => {
                        Swal.fire('Error', data.message || 'Gagal menghapus data', 'error');
                    });
                }
            })
            .catch(error => {
                console.error('Error:', error);
                Swal.fire('Error', `Terjadi kesalahan: ${error.message}`, 'error');
            });
        }
    });
}

document.addEventListener('DOMContentLoaded', loadMatpelData);
