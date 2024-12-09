function loadMatpelData(filterTahunAjaran = '') {
    const url = filterTahunAjaran
        ? `/api/mata-pelajaran?tahun_ajaran=${encodeURIComponent(filterTahunAjaran)}`
        : '/api/mata-pelajaran';

    console.log('Memuat data mata pelajaran dari:', url);
    fetch(url)
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            return response.json();
        })
        .then(data => {
            console.log('Data mata pelajaran:', data);

            const tbody = document.getElementById('mata-pelajaran-tbody');
            tbody.innerHTML = ''; 
            if (!data || data.length === 0) {
                console.log('Data tidak ditemukan untuk filter tahun ajaran:', filterTahunAjaran);
                tbody.innerHTML = '<tr><td colspan="5">Data tidak ditemukan</td></tr>';
                return; 
            }
            const filteredData = data.filter(matpel => {
                if (filterTahunAjaran) {
                    return matpel.id_tahun_ajaran == filterTahunAjaran;
                }
                return true; 
            });
            if (filteredData.length === 0) {
                console.log('Tidak ada data mata pelajaran yang sesuai dengan filter tahun ajaran:', filterTahunAjaran);
                tbody.innerHTML = '<tr><td colspan="5">Data tidak ditemukan untuk filter tahun ajaran tersebut.</td></tr>';
                return;
            }
            filteredData.forEach(matpel => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${matpel.id}</td>
                    <td>${matpel.nama_pelajaran}</td>
                    <td>${matpel.nip}</td>
                    <td>
                        <button onclick="editMatpel('${matpel.id}')">Edit</button>
                        <button onclick="deleteMatpel('${matpel.id}')">Delete</button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error:', error);
            const tbody = document.getElementById('mata-pelajaran-tbody');
            tbody.innerHTML = '<tr><td colspan="5">Terjadi kesalahan saat memuat data</td></tr>';
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
    Promise.all([
        fetch('/api/pegawai'),
        fetch('/api/tahun-ajaran')
    ])
    .then(responses => Promise.all(responses.map(response => response.json())))
    .then(([guruData, tahunAjaranData]) => {
        // Debug: Periksa data yang diterima
        console.log('Data Guru:', guruData);
        console.log('Data Tahun Ajaran:', tahunAjaranData);

        let guruOptions = guruData.map(guru => {
            return `<option value="${guru.nip}">${guru.nip} - ${guru.nama_pegawai}</option>`;
        }).join('');

        let tahunAjaranOptions = tahunAjaranData.map(tahun => {
            return `<option value="${tahun.id}">${tahun.id} - ${tahun.nama_tahun_ajaran}</option>`;
        }).join('');

        Swal.fire({
            title: 'Tambah Mata Pelajaran',
            html: `
                <div class="form-container">
                    <label for="nama_matpel">Nama Mata Pelajaran</label>
                    <input type="text" id="nama_matpel" class="swal2-input">
                    
                    <label for="nip">Guru (NIP + Nama)</label>
                    <select id="nip" class="swal2-select">
                        <option value="">Pilih Guru</option>
                        ${guruOptions}
                    </select>
                    
                    <label for="id_tahun_ajaran">Tahun Ajaran</label>
                    <select id="id_tahun_ajaran" class="swal2-select">
                        <option value="">Pilih Tahun Ajaran</option>
                        ${tahunAjaranOptions}
                    </select>
                </div>
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Tambah',
            cancelButtonText: 'Batal',
            preConfirm: async () => {
                const namaMatpel = document.getElementById('nama_matpel').value;
                const nip = document.getElementById('nip').value;
                const idTahunAjaran = document.getElementById('id_tahun_ajaran').value;
                const idMataPelajaran = generateSubjectId(namaMatpel);
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 2000); // Timeout 5 detik

                // Debug: Periksa nilai yang dipilih
                console.log('Nama Mata Pelajaran:', namaMatpel);
                console.log('NIP:', nip);
                console.log('ID Tahun Ajaran:', idTahunAjaran);

                if (!namaMatpel || !nip || !idTahunAjaran) {
                    Swal.showValidationMessage('Semua field harus diisi');
                    return false;
                }
                try {
                    const response = await fetch('/api/mata-pelajaran', {
                        method: 'POST',
                        headers: { 
                            'Content-Type': 'application/json' 
                        },
                        body: JSON.stringify({
                            id: idMataPelajaran, 
                            nama_pelajaran: namaMatpel, 
                            nip, 
                            id_tahun_ajaran: idTahunAjaran
                        }),
                        signal: controller.signal,
                    });
                    clearTimeout(timeoutId);
                    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                    const data = await response.json();
                    console.log('Response from server:', data);
                } catch (error) {
                    if (error.name === 'AbortError') {
                        console.error('Request timed out');
                    } else {
                        console.error('Error during fetch operation:', error);
                    }
                }                
            },
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire('Berhasil!', 'Mata Pelajaran berhasil ditambahkan', 'success').then(() => {
                    loadMatpelData();
                });
            }
        });
    })
    .catch(error => {
        Swal.fire('Error!', 'Terjadi masalah saat memuat data guru atau tahun ajaran', 'error');
        console.error('Error:', error);
    });
});

function deleteMatpel(id) {
    console.log('ID yang akan dihapus:', id); // Debugging log

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
                    console.log('Status response:', response.status); // Debugging log
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

document.getElementById('search-subject-input').addEventListener('input', function () {
    const searchQuery = this.value.toLowerCase();
    const rows = document.querySelectorAll('#mata-pelajaran-tbody tr');

    rows.forEach(row => {
        const idCell = row.cells[0].textContent.toLowerCase(); // Kolom ID mata pelajaran
        const namaMatpelCell = row.cells[1].textContent.toLowerCase(); // Kolom nama mata pelajaran

        if (idCell.includes(searchQuery) || namaMatpelCell.includes(searchQuery)) {
            row.style.display = ''; // Tampilkan baris
        } else {
            row.style.display = 'none'; // Sembunyikan baris
        }
    });
});

function editMatpel(id) {
    console.log('ID mata pelajaran yang akan diedit:', id); // Debugging log
    fetch(`/api/mata-pelajaran/${id}`)
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            return response.json();
        })
        .then(matpel => {
            console.log('Data mata pelajaran yang akan diedit:', matpel);
            Promise.all([
                fetch('/api/pegawai'),
                fetch('/api/tahun-ajaran')
            ])
            .then(responses => Promise.all(responses.map(response => response.json())))
            .then(([guruData, tahunAjaranData]) => {
                let guruOptions = guruData.map(guru => {
                    const selected = guru.nip === matpel.nip ? 'selected' : '';
                    return `<option value="${guru.nip}" ${selected}>${guru.nip} - ${guru.nama_pegawai}</option>`;
                }).join('');

                let tahunAjaranOptions = tahunAjaranData.map(tahun => {
                    const selected = tahun.id === matpel.id_tahun_ajaran ? 'selected' : '';
                    return `<option value="${tahun.id}" ${selected}>${tahun.id} - ${tahun.nama_tahun_ajaran}</option>`;
                }).join('');

                Swal.fire({
                    title: 'Edit Mata Pelajaran',
                    html: `
                        <div class="form-container">
                            <label for="edit_nama_matpel">Nama Mata Pelajaran</label>
                            <input type="text" id="edit_nama_matpel" class="swal2-input" value="${matpel.nama_pelajaran}">
                            
                            <label for="edit_nip">Guru (NIP + Nama)</label>
                            <select id="edit_nip" class="swal2-select">
                                ${guruOptions}
                            </select>
                            
                            <label for="edit_id_tahun_ajaran">Tahun Ajaran</label>
                            <select id="edit_id_tahun_ajaran" class="swal2-select">
                                ${tahunAjaranOptions}
                            </select>
                        </div>
                    `,
                    focusConfirm: false,
                    showCancelButton: true,
                    confirmButtonText: 'Simpan',
                    cancelButtonText: 'Batal',
                    preConfirm: () => {
                        const editedMatpel = {
                            nama_pelajaran: document.getElementById('edit_nama_matpel').value,
                            nip: document.getElementById('edit_nip').value,
                            id_tahun_ajaran: document.getElementById('edit_id_tahun_ajaran').value,
                        };

                        // Validasi data
                        if (!editedMatpel.nama_pelajaran || !editedMatpel.nip || !editedMatpel.id_tahun_ajaran) {
                            Swal.showValidationMessage('Semua field harus diisi');
                            return false;
                        }

                        return fetch(`/api/mata-pelajaran/${id}`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(editedMatpel),
                        })
                        .then(response => {
                            if (!response.ok) throw new Error('Gagal menyimpan data');
                            return response.json();
                        })
                        .catch(error => {
                            Swal.showValidationMessage(`Error: ${error.message}`);
                        });
                    },
                }).then(result => {
                    if (result.isConfirmed) {
                        Swal.fire('Berhasil!', 'Data mata pelajaran berhasil diperbarui.', 'success').then(() => {
                            loadMatpelData(); // Refresh data
                        });
                    }
                });
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                Swal.fire('Error!', 'Gagal memuat data guru atau tahun ajaran.', 'error');
            });
        })
        .catch(error => {
            console.error('Error fetching mata pelajaran:', error);
            Swal.fire('Error!', 'Gagal memuat data mata pelajaran.', 'error');
        });
}
