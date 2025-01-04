function loadTahunAjaran() {
    fetch('/api/tahun-ajaran')
        .then(response => response.json())
        .then(data => {
            const filterSelect = document.getElementById('kelas-filter');
            data.forEach(tahun => {
                const option = document.createElement('option');
                option.value = tahun.id;
                option.textContent = `${tahun.nama_tahun_ajaran} (${tahun.semester})`;
                filterSelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

loadKelasData();

document.getElementById('kelas-filter').addEventListener('change', function () {
    const filterValue = this.value;
    loadKelasData(filterValue);
});
document.addEventListener('DOMContentLoaded', () => {
    loadTahunAjaran();
    loadKelasData();
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
                     <td><a href="#" class="detail-link"  data-id-kelas="${kelas.id}">Lihat Selengkapnya</a></td>
                    <td  class="button-container">
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
document.getElementById('search-kelas-input').addEventListener('input', function () {
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
                    <td><a href="#" class="detail-link"  data-id-kelas="${kelas.id}">Detail</a></td>

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
document.getElementById('search-subject-input').addEventListener('input', function () {
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
                return `<option value="${tahun.id}">${tahun.nama_tahun_ajaran} ${tahun.semester}</option>`;
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
                showCancelButton: true,
                confirmButtonText: 'Tambah',
                confirmButtonColor: '#004D40',
                cancelButtonText: 'Batal',
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
                    Swal.fire({
                        title: 'Berhasil!',
                        text: 'Data Kelas Baru berhasil ditambahkan.',
                        icon: 'success',
                        confirmButtonColor: '#004D40'
                    });
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
                        return `<option value="${tahun.id}" ${tahun.id === kelasData.tahun_ajaran_id ? 'selected' : ''}>${tahun.nama_tahun_ajaran} ${tahun.semester}</option>`;
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
                            Swal.fire({
                                title: 'Berhasil!',
                                text: 'Data Kelas berhasil diperbarui.',
                                icon: 'success',
                                confirmButtonColor: '#004D40'
                            });
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
        confirmButtonColor: '#FF0000',
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
                    Swal.fire({
                        title: 'Berhasil!',
                        text: 'Data Kelas berhasil dihapus.',
                        icon: 'success',
                        confirmButtonColor: '#004D40'
                    });
                    loadKelasData(); // Memuat ulang data kelas
                })
                .catch(error => {
                    Swal.fire('Gagal!', error.message, 'error');
                });
        }
    });
}
document.addEventListener('DOMContentLoaded', () => {
    const tbody = document.getElementById('kelas-tbody');
    const kelasDetailDiv = document.getElementById('kelas-detail');
    const sembunyi = document.getElementById('sembunyi');

    tbody.addEventListener('click', (e) => {
        if (e.target && e.target.classList.contains('detail-link')) {
            e.preventDefault();
            sembunyi.classList.add('hidden');

            const kelasId = e.target.getAttribute('data-id-kelas');
            showKelasDetail(kelasId);
        }
    });

    function showKelasDetail(kelasId) {
        console.log('Memuat detail kelas untuk ID:', kelasId);

        const url = `/api/kelas/${kelasId}`;
        fetch(url)
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                return response.json();
            })
            .then(kelas => {
                if (kelas) {
                    kelasDetailDiv.innerHTML = `
                   <div style="text-align: left; margin-bottom: 10px;">
                    <a href="#" id="back-to-kelas" class="btn btn-secondary">
                        <i class="fa fa-arrow-left" style="color: #004D40;"></i>
                    </a>
                 </div>
                    <h3 class="kelas-detail-title">Detail Kelas</h3>
                    <p><strong>ID Kelas:</strong> ${kelas.id}</p>
                    <p><strong>Nama Kelas:</strong> ${kelas.nama_kelas}</p>
                    <p><strong>Wali Kelas:</strong> ${kelas.nip} - ${kelas.nama_pegawai}</p>
                    <p><strong>Tingkatan:</strong> ${kelas.tingkatan}</p>
                    <div style="text-align: right;">
                        <button id="tambahSiswa" class="btn" style="background-color: #004D40; color: white;">Tambah Siswa</button>
                    </div>
                    <table style="width: 100%; border: 1px solid #ddd; border-collapse: collapse;">
                        <thead>
                            <tr>
                                <th style="padding: 8px; border: 1px solid #ddd; text-align: center;">
                                    <input type="checkbox" id="selectAll" />
                                    <span>Pilih Semua</span>
                                </th>
                                <th style="padding: 8px; border: 1px solid #ddd;">Nomor</th>
                                <th style="padding: 8px; border: 1px solid #ddd;">NISN</th>
                                <th style="padding: 8px; border: 1px solid #ddd;">Nama Siswa</th>
                            </tr>
                        </thead>
                        <tbody>
                        ${kelas.siswa && Array.isArray(kelas.siswa) && kelas.siswa.length > 0
                        ? kelas.siswa.map((siswa, index) => `
                                <tr>
                                    <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">
                                        <input type="checkbox" class="studentCheckbox" data-id="${siswa.nisn}" />
                                    </td>
                                    <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${index + 1}</td>
                                    <td style="padding: 8px; border: 1px solid #ddd;">${siswa.nisn}</td>
                                    <td style="padding: 8px; border: 1px solid #ddd;">${siswa.nama_siswa}</td>
                                </tr>
                            `).join('')
                        : `<tr>
                                <td colspan="4" style="padding: 8px; border: 1px solid #ddd; text-align: center;">
                                    Belum ada siswa dalam kelas ini.
                                </td>
                            </tr>`}
                        </tbody>
                    </table>
            
                    <button id="deleteButton" class="btn btn-danger" style="display: none;">Hapus</button>
                `;
            

                    kelasDetailDiv.classList.remove('hidden');
                    document.getElementById('back-to-kelas').addEventListener('click', () => {
                        kelasDetailDiv.classList.add('hidden');
                        sembunyi.classList.remove('hidden');
                    });

                    const checkboxes = document.querySelectorAll('.studentCheckbox');
                    const selectAllCheckbox = document.getElementById('selectAll');
                    const deleteButton = document.getElementById('deleteButton');

                    function updateActionMenuVisibility() {
                        const anyChecked = Array.from(checkboxes).some(checkbox => checkbox.checked);
                        deleteButton.style.display = anyChecked ? 'inline-block' : 'none';
                    }

                    selectAllCheckbox.addEventListener('change', () => {
                        checkboxes.forEach(checkbox => {
                            checkbox.checked = selectAllCheckbox.checked;
                        });
                        updateActionMenuVisibility();
                    });

                    checkboxes.forEach(checkbox => {
                        checkbox.addEventListener('change', updateActionMenuVisibility);
                    });

                    updateActionMenuVisibility(); // Call it initially to set the correct visibility

                    deleteButton.addEventListener('click', () => {
                        const selectedIds = Array.from(checkboxes)
                            .filter(checkbox => checkbox.checked)
                            .map(checkbox => checkbox.dataset.id);
    
                        if (selectedIds.length === 0) {
                            Swal.fire('Peringatan', 'Tidak ada siswa yang dipilih.', 'warning');
                            return;
                        }
    
                        Swal.fire({
                            title: 'Apakah Anda yakin?',
                            text: 'Siswa yang dipilih akan Dihapus.',
                            icon: 'warning',
                            showCancelButton: true,
                            confirmButtonColor: '#004D40',
                            cancelButtonColor: '#d33',
                            confirmButtonText: 'Ya, Hapus!',
                        }).then((result) => {
                            if (result.isConfirmed) {
                                Promise.all(selectedIds.map(nisn => {
                                    return fetch(`/api/siswa/move/${nisn}`, {
                                        method: 'PUT',
                                        headers: {
                                            'Content-Type': 'application/json',
                                        },
                                        body: JSON.stringify({ id_kelas: kelasId })
                                    });
                                }))
                                .then(responses => Promise.all(responses.map(response => response.json())))
                                .then(results => {
                                Swal.fire({
                                title: 'Berhasil',
                                text: 'Siswa berhasil dihapus dari kelas!',
                                icon: 'success',
                                confirmButtonColor: '#004D40'  // Ganti dengan warna yang diinginkan
                                });
                                    showKelasDetail(kelasId); // Segarkan detail kelas setelah update
                                })
                                .catch(error => {
                                    Swal.fire('Gagal', 'Terjadi kesalahan saat memperbarui data siswa.', 'error');
                                });
                            }
                        });
                    });

                    document.getElementById('tambahSiswa').addEventListener('click', () => {
                        fetch('/api/no-class')
                            .then(response => {
                                if (!response.ok) {
                                    throw new Error('Gagal mengambil data siswa.');
                                }
                                return response.json();
                            })
                            .then(data => {
                                // Cek apakah ada siswa tanpa kelas
                                let siswaListHtml;
                                if (data.siswa && Array.isArray(data.siswa) && data.siswa.length > 0) {
                                    // Buat tabel dengan data siswa
                                    siswaListHtml = `
                <table style="width: 100%; border: 1px solid #ddd; border-collapse: collapse;">
                    <thead>
                        <tr>
                            <th style="padding: 8px; border: 1px solid #ddd;">
                                <input type="checkbox" id="selectAll" style="transform: scale(1.5);">
                                <label for="selectAll" style="font-weight: normal; margin-left: 10px;">Pilih Semua</label>
                            </th>
                            <th style="padding: 8px; border: 1px solid #ddd;">NISN</th>
                            <th style="padding: 8px; border: 1px solid #ddd;">Nama Siswa</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.siswa.map(siswa => `
                            <tr>
                                <td style="padding: 8px; border: 1px solid #ddd;">
                                    <input type="checkbox" class="siswa-select" value="${siswa.nisn}">
                                </td>
                                <td style="padding: 8px; border: 1px solid #ddd;">${siswa.nisn}</td>
                                <td style="padding: 8px; border: 1px solid #ddd;">${siswa.nama_siswa}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <button id="addButton" style="margin-top: 10px; display: none;" class="btn btn-primary">Tambahkan</button>
            `;
                                } else {
                                    // Tampilkan tabel kosong dengan pesan keterangan
                                    siswaListHtml = `
                <table style="width: 100%; border: 1px solid #ddd; border-collapse: collapse;">
                    <thead>
                        <tr>
                            <th style="padding: 8px; border: 1px solid #ddd;">Keterangan</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">
                                Semua siswa sudah memiliki kelas.
                            </td>
                        </tr>
                    </tbody>
                </table>
            `;
                                }

                                Swal.fire({
                                    title: 'Daftar Siswa Tanpa Kelas',
                                    html: `
                                        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                                            <button id="addButton" style="background-color: #004D40; color: white; padding: 8px 16px; border: none; cursor: pointer; display: none;">Tambahkan</button>
                                        </div>
                                        <table style="width: 100%; border: 1px solid #ddd; border-collapse: collapse;">
                                            <thead>
                                                <tr>
                                                    <th style="padding: 8px; border: 1px solid #ddd; text-align: center;">
                                                        <input type="checkbox" id="selectAll" />
                                                        <span>Pilih Semua</span>
                                                    </th>
                                                    <th style="padding: 8px; border: 1px solid #ddd;">Nomor</th>
                                                    <th style="padding: 8px; border: 1px solid #ddd;">NISN</th>
                                                    <th style="padding: 8px; border: 1px solid #ddd;">Nama Siswa</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                ${data.siswa && Array.isArray(data.siswa) && data.siswa.length > 0
                                                    ? data.siswa.map((siswa, index) => `
                                                        <tr>
                                                            <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">
                                                                <input type="checkbox" class="siswa-select" value="${siswa.nisn}" />
                                                            </td>
                                                            <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${index + 1}</td>
                                                            <td style="padding: 8px; border: 1px solid #ddd;">${siswa.nisn}</td>
                                                            <td style="padding: 8px; border: 1px solid #ddd;">${siswa.nama_siswa}</td>
                                                        </tr>
                                                    `).join('')
                                                    : `<tr><td colspan="4" style="padding: 8px; border: 1px solid #ddd; text-align: center;">Tidak ada siswa yang tersedia.</td></tr>`
                                                }
                                            </tbody>
                                        </table>
                                    `,
                                    showCloseButton: true,
                                    confirmButtonText: 'Tutup',
                                    confirmButtonColor: '#004D40',
                                    willOpen: () => {
                                        const selectAllCheckbox = document.getElementById('selectAll');
                                        const siswaSelectCheckboxes = document.querySelectorAll('.siswa-select');
                                        const addButton = document.getElementById('addButton');
                                
                                        function toggleAddButton() {
                                            const anyChecked = Array.from(siswaSelectCheckboxes).some(checkbox => checkbox.checked);
                                            addButton.style.display = anyChecked ? 'inline-block' : 'none';
                                        }
                                
                                        selectAllCheckbox.addEventListener('change', (event) => {
                                            const isChecked = event.target.checked;
                                            siswaSelectCheckboxes.forEach(checkbox => {
                                                checkbox.checked = isChecked;
                                            });
                                            toggleAddButton(); // Update tombol Tambahkan
                                        });
                                
                                        siswaSelectCheckboxes.forEach(checkbox => {
                                            checkbox.addEventListener('change', () => {
                                                const allChecked = Array.from(siswaSelectCheckboxes).every(checkbox => checkbox.checked);
                                                selectAllCheckbox.checked = allChecked;
                                                selectAllCheckbox.indeterminate = !allChecked && Array.from(siswaSelectCheckboxes).some(checkbox => checkbox.checked);
                                                toggleAddButton(); // Update tombol Tambahkan
                                            });
                                        });
                                
                                        addButton.addEventListener('click', () => {
                                            const selectedNisn = Array.from(siswaSelectCheckboxes)
                                                .filter(checkbox => checkbox.checked)
                                                .map(checkbox => checkbox.value);
                                            if (selectedNisn.length > 0) {
                                                Swal.fire({
                                                    title: 'Konfirmasi',
                                                    text: `Apakah Anda yakin ingin menambahkan siswa ke kelas ini?`,
                                                    icon: 'warning',
                                                    showCancelButton: true,
                                                    confirmButtonText: 'Ya, Tambahkan',
                                                    confirmButtonColor: '#004D40',
                                                    cancelButtonText: 'Batal'
                                                }).then((result) => {
                                                    if (result.isConfirmed) {
                                                        Promise.all(selectedNisn.map(nisn => {
                                                            return fetch(`/api/move/${nisn}`, {
                                                                method: 'PUT',
                                                                headers: {
                                                                    'Content-Type': 'application/json',
                                                                },
                                                                body: JSON.stringify({ id_kelas: kelas.id })
                                                            });
                                                        }))
                                                        .then(responses => Promise.all(responses.map(response => response.json())))
                                                        .then(data => {
                                                            Swal.fire({
                                                                title: 'Berhasil',
                                                                text: 'Siswa berhasil ditambahkan ke kelas!',
                                                                icon: 'success',
                                                                confirmButtonColor: '#004D40'  // Ganti dengan warna yang diinginkan
                                                                });
                                                                                            showKelasDetail(kelas.id); // Refresh kelas setelah penambahan siswa
                                                        })
                                                        .catch(error => {
                                                            Swal.fire('Error', `Terjadi kesalahan: ${error.message}`, 'error');
                                                        });
                                                    }
                                                });
                                            } else {
                                                Swal.fire('Peringatan', 'Tidak ada siswa yang dipilih.', 'warning');
                                            }
                                        });
                                    }
                                });
                                
                            })
                            .catch(error => {
                                // Menampilkan tabel kosong jika gagal mengambil data
                                const siswaListHtml = `
                                <table style="width: 100%; border: 1px solid #ddd; border-collapse: collapse;">
                                    <thead>
                                        <tr>
                                            <th style="padding: 8px; border: 1px solid #ddd;">Keterangan</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">
                                                Semua siswa sudah memiliki kelas.
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            `;
                                Swal.fire({
                                    title: 'Daftar Siswa Tanpa Kelas',
                                    html: siswaListHtml,
                                    showCloseButton: true,
                                    confirmButtonText: 'Tutup',
                                    confirmButtonColor: '#004D40'
                                });
                            });

                    });
                }
            });
    }

});



