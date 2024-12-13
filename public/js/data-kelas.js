function loadTahunAjaran() {
    fetch('/api/tahun-ajaran') // Pastikan URL ini benar dan API tahun ajaran tersedia
        .then(response => response.json())
        .then(data => {
            const filterSelect = document.getElementById('kelas-filter');
            data.forEach(tahun => {
                const option = document.createElement('option');
                option.value = tahun.id; // Misalnya id tahun ajaran
                option.textContent = tahun.nama_tahun_ajaran; // Misalnya nama tahun ajaran
                filterSelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

loadKelasData(); // Load semua data

document.getElementById('kelas-filter').addEventListener('change', function() {
    const filterValue  = this.value; // Ambil value tahun ajaran yang dipilih
    loadKelasData(filterValue); // Panggil fungsi loadKelasData dengan filter tahun ajaran
});
document.addEventListener('DOMContentLoaded', () => {
    loadTahunAjaran(); // Memuat daftar tahun ajaran
    loadKelasData();   // Memuat data kelas tanpa filter awal
});


function loadKelasData(filterTahunAjaran = '') {
    const url = filterTahunAjaran
        ? `/api/kelas?tahun_ajaran=${encodeURIComponent(filterTahunAjaran)}`
        : '/api/kelas';

    console.log('Memuat data kelas dari:', url);
    fetch(url)
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            return response.json();
        })
        .then(data => {
            console.log('Data kelas yang diterima:', data);

            const tbody = document.getElementById('kelas-tbody');
            tbody.innerHTML = ''; // Kosongkan tabel sebelum mengisi data

            if (!data || data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6">Data tidak ditemukan</td></tr>';
                return;
            }

            // Loop untuk menambahkan setiap data kelas ke tabel
            data.forEach(kelas => {
                const namaPegawai = kelas.nama_pegawai || 'Nama Pegawai Tidak Ada';
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${kelas.id}</td>
                    <td>${kelas.nama_kelas}</td>
                    <td>${kelas.nip} - ${namaPegawai}</td>
                    <td>${kelas.tingkatan}</td>
                    <td>
                        <button class="edit-button-kelas" data-id-kelas="${kelas.id}">Edit</button>
                        <button class="delete-button-kelas" data-id-kelas="${kelas.id}">Delete</button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Terjadi kesalahan saat memuat data kelas.');
        });
}

// Fungsi pencarian data kelas
document.getElementById('search-kelas-input').addEventListener('input', function() {
    const searchQuery = this.value.trim(); // Ambil nilai dari input pencarian
    const filterTahunAjaran = document.getElementById('kelas-filter').value; // Ambil filter tahun ajaran
    searchKelas(searchQuery, filterTahunAjaran); // Panggil fungsi pencarian dengan query pencarian dan filter tahun ajaran
});

function searchKelas(searchQuery, filterTahunAjaran = '') {
    const url = filterTahunAjaran
        ? `/api/kelas?tahun_ajaran=${encodeURIComponent(filterTahunAjaran)}`
        : '/api/kelas';

    fetch(url)
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            return response.json();
        })
        .then(data => {
            const tbody = document.getElementById('kelas-tbody');
            tbody.innerHTML = ''; // Kosongkan tabel sebelum mengisi data

            if (!data || data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6">Data tidak ditemukan</td></tr>';
                return;
            }

            const filteredData = data.filter(kelas => {
                const query = searchQuery.toLowerCase();
                return kelas.id.toString().includes(query) ||
                       kelas.nama_kelas.toLowerCase().includes(query) || 
                       kelas.nip.toString().includes(query) ||
                       (kelas.nama_pegawai && kelas.nama_pegawai.toLowerCase().includes(query));
            });

            if (filteredData.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6">Data tidak ditemukan untuk pencarian tersebut.</td></tr>';
                return;
            }

            filteredData.forEach(kelas => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${kelas.id}</td>
                    <td>${kelas.nama_kelas}</td>
                    <td>${kelas.nip} - ${kelas.nama_pegawai || 'Nama Pegawai Tidak Ada'}</td>
                    <td>${kelas.tingkatan}</td>
                    <td>
                        <button class="edit-button-kelas" data-id-kelas="${kelas.id}">Edit</button>
                        <button class="delete-button-kelas" data-id-kelas="${kelas.id}">Delete</button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error:', error);
            const tbody = document.getElementById('kelas-tbody');
            tbody.innerHTML = '<tr><td colspan="6">Terjadi kesalahan saat memuat data</td></tr>';
        });
}
// Event listener untuk input pencarian
document.getElementById('search-subject-input').addEventListener('input', function() {
    const searchQuery = this.value.trim(); // Ambil nilai dari input pencarian
    const filterTahunAjaran = document.getElementById('kelas-filter').value; // Ambil filter tahun ajaran
    searchKelas(searchQuery, filterTahunAjaran); // Panggil fungsi pencarian dengan query pencarian dan filter tahun ajaran
});

document.getElementById('add-kelas-btn').addEventListener('click', function () {
    // Mengambil data pegawai dan tahun ajaran dari API atau server
    Promise.all([
        fetch('/api/pegawai'), // Sesuaikan URL dengan API pegawai Anda
        fetch('/api/tahun-ajaran') // Sesuaikan URL dengan API tahun ajaran Anda
    ])
        .then(([pegawaiResponse, tahunAjaranResponse]) => {
            return Promise.all([
                pegawaiResponse.json(),
                tahunAjaranResponse.json()
            ]);
        })
        .then(([pegawaiData, tahunAjaranData]) => {
            const pegawaiOptions = pegawaiData.map(pegawai => {
                return `<option value="${pegawai.nip}">${pegawai.nama_pegawai}</option>`;
            }).join('');

            const tahunAjaranOptions = tahunAjaranData.map(tahun => {
                return `<option value="${tahun.id}">${tahun.nama_tahun_ajaran}</option>`;
            }).join('');

            const tingkatanOptions = ["VII", "VIII", "IX"].map(tingkatan => {
                return `<option value="${tingkatan}">${tingkatan}</option>`;
            }).join('');

            // Menampilkan SweetAlert
            Swal.fire({
                title: 'Tambah Kelas',
                html: `
                    <input id="kelas-name" class="swal2-input" placeholder="Nama Kelas" required>
                    <select id="pegawai-select" class="swal2-input" required>
                        <option value="" disabled selected>Pilih Pegawai</option>
                        ${pegawaiOptions}
                    </select>
                    <select id="tahun-ajaran-select" class="swal2-input" required>
                        <option value="" disabled selected>Pilih Tahun Ajaran</option>
                        ${tahunAjaranOptions}
                    </select>
                    <select id="tingkatan-select" class="swal2-input" required>
                        <option value="" disabled selected>Pilih Tingkatan</option>
                        ${tingkatanOptions}
                    </select>
                `,
                focusConfirm: false,
                preConfirm: () => {
                    const kelasName = document.getElementById('kelas-name').value.trim();
                    const pegawaiId = document.getElementById('pegawai-select').value;
                    const tahunAjaranId = document.getElementById('tahun-ajaran-select').value;
                    const tingkatan = document.getElementById('tingkatan-select').value;

                    if (!kelasName || !pegawaiId || !tahunAjaranId || !tingkatan) {
                        Swal.showValidationMessage('Semua kolom harus diisi!');
                        return null; // Tidak memproses jika ada yang kosong
                    }

                    const kelasData = {
                        nama_kelas: kelasName,
                        pegawai_id: pegawaiId,
                        tahun_ajaran_id: tahunAjaranId,
                        tingkatan: tingkatan,
                    };

                    // Kembalikan promise untuk diproses
                    return fetch('/api/kelas', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(kelasData),
                    })
                        .then(response => {
                            if (!response.ok) {
                                return response.json().then(err => {
                                    throw new Error(err.message || 'Gagal menambahkan kelas.');
                                });
                            }
                            return response.json();
                        });
                }
            }).then(result => {
                if (result.isConfirmed) {
                    // Tampilkan SweetAlert sukses
                    Swal.fire('Berhasil!', 'Kelas baru telah ditambahkan.', 'success');
                    loadKelasData(); // Memuat ulang data kelas
                }
            }).catch(error => {
                // Tampilkan SweetAlert error
                Swal.fire('Gagal!', error.message, 'error');
            });
        });
});

document.getElementById("kelas-tbody").addEventListener('click', (event) => {
    if (event.target.classList.contains('edit-button-kelas')) {
        const id = event.target.getAttribute('data-id-kelas');
        editKelas(id);
    }
});

document.getElementById("kelas-tbody").addEventListener('click', (event) => {
    if (event.target.classList.contains('delete-button-kelas')) {
        const id = event.target.getAttribute('data-id-kelas');
        deleteKelas(id);
    }
});


// Fungsi untuk mengedit kelas
function editKelas(id) {
    // Ambil data kelas berdasarkan ID
    fetch(`/api/kelas/${id}`)
        .then(response => {
            if (!response.ok) throw new Error("Gagal mengambil data kelas untuk diedit");
            return response.json();
        })
        .then(kelasData => {
            // Ambil data pegawai dan tahun ajaran untuk dropdown
            Promise.all([
                fetch('/api/pegawai'),
                fetch('/api/tahun-ajaran')
            ])
            .then(([pegawaiResponse, tahunAjaranResponse]) => {
                return Promise.all([
                    pegawaiResponse.json(),
                    tahunAjaranResponse.json()
                ]);
            })
            .then(([pegawaiData, tahunAjaranData]) => {
                // Membuat opsi untuk select Pegawai dan Tahun Ajaran
                const pegawaiOptions = pegawaiData.map(pegawai => {
                    return `<option value="${pegawai.nip}" ${pegawai.nip === kelasData.pegawai_id ? 'selected' : ''}>${pegawai.nama_pegawai}</option>`;
                }).join('');

                const tahunAjaranOptions = tahunAjaranData.map(tahun => {
                    return `<option value="${tahun.id}" ${tahun.id === kelasData.tahun_ajaran_id ? 'selected' : ''}>${tahun.nama_tahun_ajaran}</option>`;
                }).join('');

                const tingkatanOptions = ["VII", "VIII", "IX"].map(tingkatan => {
                    return `<option value="${tingkatan}" ${tingkatan === kelasData.tingkatan ? 'selected' : ''}>${tingkatan}</option>`;
                }).join('');

                // Menampilkan form edit menggunakan SweetAlert
                Swal.fire({
                    title: 'Edit Kelas',
                    html: `
                        <input id="kelas-name" class="swal2-input" value="${kelasData.nama_kelas}" placeholder="Nama Kelas" required>
                        <select id="pegawai-select" class="swal2-input" required>
                            <option value="" disabled>Pilih Pegawai</option>
                            ${pegawaiOptions}
                        </select>
                        <select id="tahun-ajaran-select" class="swal2-input" required>
                            <option value="" disabled>Pilih Tahun Ajaran</option>
                            ${tahunAjaranOptions}
                        </select>
                        <select id="tingkatan-select" class="swal2-input" required>
                            <option value="" disabled>Pilih Tingkatan</option>
                            ${tingkatanOptions}
                        </select>
                    `,
                    focusConfirm: false,
                    preConfirm: () => {
                        const kelasName = document.getElementById('kelas-name').value.trim();
                        const pegawaiId = document.getElementById('pegawai-select').value;
                        const tahunAjaranId = document.getElementById('tahun-ajaran-select').value;
                        const tingkatan = document.getElementById('tingkatan-select').value;

                       
                        // Data yang telah diedit
                        const kelasDataUpdate = {
                            nama_kelas: kelasName,
                            pegawai_id: pegawaiId,
                            tahun_ajaran_id: tahunAjaranId,
                            tingkatan: tingkatan,
                        };

                        // Kirim data yang telah diperbarui ke server
                        return fetch(`/api/kelas/${id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(kelasDataUpdate)
                        })
                            .then(response => {
                                if (!response.ok) {
                                    return response.json().then(err => {
                                        throw new Error(err.message || 'Gagal mengedit kelas.');
                                    });
                                }
                                return response.json();
                            });
                    }
                }).then(result => {
                    if (result.isConfirmed) {
                        Swal.fire('Berhasil!', 'Kelas telah diperbarui.', 'success');
                        loadKelasData(); // Memuat ulang data kelas
                    }
                }).catch(error => {
                    Swal.fire('Gagal!', error.message, 'error');
                });
            })
            .catch(error => {
                Swal.fire('Error!', 'Terjadi kesalahan saat mengambil data pegawai atau tahun ajaran.', 'error');
            });
        })
        .catch(error => {
            Swal.fire('Error!', 'Gagal mengambil data kelas.', 'error');
        });
}


function deleteKelas(id) {
    Swal.fire({
        title: 'Apakah Anda yakin?',
        text: 'Data kelas ini akan dihapus secara permanen!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Hapus',
        cancelButtonText: 'Batal',
        reverseButtons: true
    }).then((result) => {
        if (result.isConfirmed) {
            // Mengirim permintaan DELETE ke API
            fetch(`/api/kelas/${id}`, {
                method: 'DELETE',
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Gagal menghapus kelas');
                    }
                    return response.json();
                })
                .then(() => {
                    Swal.fire('Berhasil!', 'Kelas telah dihapus.', 'success');
                    loadKelasData(); // Memuat ulang data kelas
                })
                .catch(error => {
                    Swal.fire('Gagal!', error.message, 'error');
                });
        }
    });
}

document.addEventListener('DOMContentLoaded', loadKelasData);