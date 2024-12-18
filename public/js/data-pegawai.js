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
                <td  class="button-container">
                    <button class="edit-btn" data-nip="${pegawai.nip}">Edit</button>
                    <button onclick="deletePegawai('${pegawai.nip}')">Delete</button>
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

document.getElementById('add-data-btn').addEventListener('click', function () {
    Swal.fire({
        title: 'Tambah Data Pegawai',
        html: `
    <label for="nip">NIP:</label>
    <input type="text" id="nip" class="swal2-input" placeholder="NIP">
    
    <label for="nama_pegawai">Nama Pegawai:</label>
    <input type="text" id="nama_pegawai" class="swal2-input" placeholder="Nama Pegawai">
    
    <label for="tanggal_lahir">Tanggal Lahir:</label>
    <input type="date" id="tanggal_lahir" class="swal2-input">
    
    <label for="tempat_lahir">Tempat Lahir:</label>
    <input type="text" id="tempat_lahir" class="swal2-input" placeholder="Tempat Lahir">
    
    <label for="jenis_kelamin">Jenis Kelamin:</label>
    <select id="jenis_kelamin" class="swal2-input">
        <option value="" disabled selected>Pilih Jenis Kelamin</option>
        <option value="L">Laki-laki</option>
        <option value="P">Perempuan</option>
    </select>
    
    <label for="alamat">Alamat:</label>
    <input type="text" id="alamat" class="swal2-input" placeholder="Alamat">
    
    <label for="agama">Agama:</label>
    <select id="agama" class="swal2-input">
        <option value="" disabled selected>Pilih Agama</option>
        <option value="Islam">Islam</option>
        <option value="Kristen">Kristen</option>
        <option value="Katolik">Katolik</option>
        <option value="Hindu">Hindu</option>
        <option value="Buddha">Buddha</option>
        <option value="Konghucu">Konghucu</option>
    </select>
    
    <label for="email">Email:</label>
    <input type="email" id="email" class="swal2-input" placeholder="Email">
    
    <label for="no_hp">Nomor HP:</label>
    <input type="text" id="no_hp" class="swal2-input" placeholder="Nomor HP">
    
    <label for="nik">NIK:</label>
    <input type="text" id="nik" class="swal2-input" placeholder="NIK">
    
    <label for="tanggal_mulai_tugas">Tanggal Mulai Tugas:</label>
    <input type="date" id="tanggal_mulai_tugas" class="swal2-input">
    
    <label for="jenjang_pendidikan">Jenjang Pendidikan:</label>
    <input type="text" id="jenjang_pendidikan" class="swal2-input" placeholder="Jenjang Pendidikan">
    
    <label for="jurusan">Jurusan:</label>
    <input type="text" id="jurusan" class="swal2-input" placeholder="Jurusan">
    
    <label for="role_id">Pilih Role:</label>
    <select id="role_id" class="swal2-input" multiple>
        <option value="R1">Guru Mata Pelajaran</option>
        <option value="R2">Guru Wali Kelas</option>
        <option value="R3">Admin</option>
        <option value="R4">Kepala Sekolah</option>
    </select>
    <p class="note">Tekan tombol <strong>Ctrl</strong> (Windows) atau <strong>Cmd</strong> (Mac) untuk memilih lebih dari satu role.</p>
    `,
        confirmButtonText: 'Tambah',
        confirmButtonColor: '#3CB371',
        showCancelButton: true,
        cancelButtonText: 'Batal',
        preConfirm: () => {
            const nip = document.getElementById('nip').value.trim();
            const namaPegawai = document.getElementById('nama_pegawai').value.trim();
            const tanggalLahir = document.getElementById('tanggal_lahir').value;
            const tempatLahir = document.getElementById('tempat_lahir').value.trim();
            const jenisKelamin = document.getElementById('jenis_kelamin').value.trim();
            const alamat = document.getElementById('alamat').value.trim();
            const agama = document.getElementById('agama').value.trim();
            const email = document.getElementById('email').value.trim();
            const noHp = document.getElementById('no_hp').value.trim();
            const nik = document.getElementById('nik').value.trim();
            const tanggalMulaiTugas = document.getElementById('tanggal_mulai_tugas').value;
            const jenjangPendidikan = document.getElementById('jenjang_pendidikan').value.trim();
            const jurusan = document.getElementById('jurusan').value.trim();
            const roles = Array.from(document.getElementById('role_id').selectedOptions).map(option => option.value);

            // Password otomatis diatur sama dengan NIP
            const password = nip;

            if (!nip || !namaPegawai || !tanggalLahir || !tempatLahir || !jenisKelamin || !alamat || !agama || !email || !noHp || !nik || !tanggalMulaiTugas || !jenjangPendidikan || !jurusan || roles.length === 0) {
                Swal.showValidationMessage('Harap isi semua kolom wajib dan pilih minimal satu role!');
                return false;
            }

            return {
                nip,
                namaPegawai,
                tanggalLahir,
                tempatLahir,
                jenisKelamin,
                alamat,
                agama,
                email,
                noHp,
                password,  // Password di-set otomatis berdasarkan NIP
                nik,
                tanggalMulaiTugas,
                jenjangPendidikan,
                jurusan,
                roles, // Simpan role sebagai array
            };
        },
    }).then(async (result) => {
        if (result.isConfirmed) {
            const dataPegawai = result.value;

            try {
                const response = await fetch('/api/pegawai', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(dataPegawai),
                });

                if (response.ok) {
                    Swal.fire({
                        title: 'Berhasil!',
                        text: 'Data pegawai berhasil ditambahkan.',
                        icon: 'success',
                       confirmButtonColor: '#004D40'
                    });

                    pegawaiTbody.innerHTML = '';
                    getDataPegawai();
                } else {
                    Swal.fire({
                        title: 'Gagal!',
                        text: 'Terjadi kesalahan saat menambahkan data pegawai.',
                        icon: 'error',
                    });
                }
            } catch (error) {
                console.error('Error:', error);
                Swal.fire({
                    title: 'Gagal!',
                    text: 'Tidak dapat terhubung ke server.',
                    icon: 'error',
                });
            }
        }
    });
    
});


async function deletePegawai(nip) {
    // Menampilkan konfirmasi menggunakan SweetAlert2
    const result = await Swal.fire({
        title: 'Apakah Anda yakin?',
        text: `Pegawai dengan NIP ${nip} akan dihapus dari sistem.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#004D40',
        cancelButtonColor: '#d33',    // Warna tombol batal (merah)
        confirmButtonText: 'Ya, Hapus',
        cancelButtonText: 'Batal',
    });

    // Jika user menekan tombol "Ya, Hapus"
    if (result.isConfirmed) {
        try {
            const response = await fetch(`/api/pegawai/${nip}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                Swal.fire({
                    title: 'Berhasil!',
                    text: 'Data pegawai berhasil dihapus.',
                    icon: 'success',
                    confirmButtonColor: '#004D40'
                });

                // Hapus baris dari tabel
                const row = document.querySelector(`[data-nip="${nip}"]`).closest('tr');
                if (row) row.remove();
            } else {
                Swal.fire({
                    title: 'Gagal!',
                    text: 'Terjadi kesalahan saat menghapus data pegawai.',
                    icon: 'error',
                });
            }
        } catch (error) {
            console.error('Error deleting pegawai:', error);
            Swal.fire({
                title: 'Gagal!',
                text: 'Tidak dapat terhubung ke server.',
                icon: 'error',
            });
        }
    }
}

async function editPegawai(nip) {
    try {
        // Ambil data pegawai berdasarkan nip
        const response = await fetch(`/api/pegawai/${nip}`);
        const pegawai = await response.json();

        // Format tanggal
        const tanggalLahir = pegawai.tanggal_lahir; // Pastikan tanggal dalam format yyyy-mm-dd
        const tanggalMulaiTugas = pegawai.tanggal_mulai_tugas;
        // Tampilkan form edit dengan data pegawai
        const result = await Swal.fire({
            title: 'Edit Data Pegawai',
            html: `
                <label for="nip">NIP:</label>
                <input type="text" id="nip" class="swal2-input" value="${pegawai.nip}">

                <label for="nama_pegawai">Nama Pegawai:</label>
                <input type="text" id="nama_pegawai" class="swal2-input" value="${pegawai.nama_pegawai}">

                <label for="tanggal_lahir">Tanggal Lahir:</label>
                <input type="date" id="tanggal_lahir" class="swal2-input" value="${formatDateToInput(tanggalLahir)}">

                <label for="tempat_lahir">Tempat Lahir:</label>
                <input type="text" id="tempat_lahir" class="swal2-input" value="${pegawai.tempat_lahir}">

                <label for="jenis_kelamin">Jenis Kelamin:</label>
                <select id="jenis_kelamin" class="swal2-input">
                    <option value="L" ${pegawai.jenis_kelamin === 'L' ? 'selected' : ''}>Laki-laki</option>
                    <option value="P" ${pegawai.jenis_kelamin === 'P' ? 'selected' : ''}>Perempuan</option>
                </select>

                <label for="alamat">Alamat:</label>
                <input type="text" id="alamat" class="swal2-input" value="${pegawai.alamat}">

                <label for="agama"><strong>Agama:</strong></label>
                <select id="agama" class="swal2-input">
                    <option ${pegawai.agama === 'Islam' ? 'selected' : ''} value="Islam">Islam</option>
                    <option ${pegawai.agama === 'Kristen' ? 'selected' : ''} value="Kristen">Kristen</option>
                    <option ${pegawai.agama === 'Hindu' ? 'selected' : ''} value="Hindu">Hindu</option>
                    <option ${pegawai.agama === 'Buddha' ? 'selected' : ''} value="Buddha">Buddha</option>
                    <option ${pegawai  .agama === 'Katholik' ? 'selected' : ''} value="Katholik">Katholik</option>
                </select><br>

                <label for="email">Email:</label>
                <input type="email" id="email" class="swal2-input" value="${pegawai.email}">

                <label for="no_hp">Nomor HP:</label>
                <input type="text" id="no_hp" class="swal2-input" value="${pegawai.no_hp}">

                <label for="nik">NIK:</label>
                <input type="text" id="nik" class="swal2-input" value="${pegawai.nik}">

                <label for="tanggal_mulai_tugas">Tanggal Mulai Tugas:</label>
                <input type="date" id="tanggal_mulai_tugas" class="swal2-input" value="${formatDateToInput(tanggalMulaiTugas)}">

                <label for="jenjang_pendidikan">Jenjang Pendidikan:</label>
                <input type="text" id="jenjang_pendidikan" class="swal2-input" value="${pegawai.jenjang_pendidikan}">

                <label for="jurusan">Jurusan:</label>
                <input type="text" id="jurusan" class="swal2-input" value="${pegawai.jurusan}">

                <label for="role_id">Pilih Role:</label>
                <select id="role_id" class="swal2-input" multiple>
                    <option value="R1" ${pegawai.roles && pegawai.roles.includes('R1') ? 'selected' : ''}>Guru Mata Pelajaran</option>
                    <option value="R2" ${pegawai.roles && pegawai.roles.includes('R2') ? 'selected' : ''}>Guru Wali Kelas</option>
                    <option value="R3" ${pegawai.roles && pegawai.roles.includes('R3') ? 'selected' : ''}>Admin</option>
                    <option value="R4" ${pegawai.roles && pegawai.roles.includes('R4') ? 'selected' : ''}>Kepala Sekolah</option>
                </select>
                <p class="note">Tekan tombol <strong>Ctrl</strong> (Windows) atau <strong>Cmd</strong> (Mac) untuk memilih lebih dari satu role.</p>
                `,
            confirmButtonText: 'Simpan Perubahan',
            confirmButtonColor: '#3CB371',
            showCancelButton: true,
            cancelButtonText: 'Batal',
            preConfirm: () => {
                const nip = document.getElementById('nip').value.trim();
                const namaPegawai = document.getElementById('nama_pegawai').value.trim();
                const tanggalLahir = document.getElementById('tanggal_lahir').value;
                const tempatLahir = document.getElementById('tempat_lahir').value.trim();
                const jenisKelamin = document.getElementById('jenis_kelamin').value.trim();
                const alamat = document.getElementById('alamat').value.trim();
                const agama = document.getElementById('agama').value.trim();
                const email = document.getElementById('email').value.trim();
                const noHp = document.getElementById('no_hp').value.trim();
                const nik = document.getElementById('nik').value.trim();
                const tanggalMulaiTugas = document.getElementById('tanggal_mulai_tugas').value;
                const jenjangPendidikan = document.getElementById('jenjang_pendidikan').value.trim();
                const jurusan = document.getElementById('jurusan').value.trim();
                const roles = Array.from(document.getElementById('role_id').selectedOptions).map(option => option.value);
        
                return {
                    nip,
                    namaPegawai,
                    tanggalLahir,
                    tempatLahir,
                    jenisKelamin,
                    alamat,
                    agama,
                    email,
                    noHp,
                    nik,
                    tanggalMulaiTugas,
                    jenjangPendidikan,
                    jurusan,
                    roles,
                };
            },
        });
        // Jika konfirmasi berhasil, kirim data pegawai yang sudah diubah
        if (result.isConfirmed) {
            const dataPegawai = result.value;

            // Kirim data ke server untuk diupdate
            await fetch(`/api/pegawai/${nip}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataPegawai),
            });

            // Beri feedback bahwa data berhasil diperbarui
            Swal.fire({
                title: 'Berhasil!',
                text: 'Data pegawai berhasil dihapus.',
                icon: 'success',
                confirmButtonColor: '#004D40'
            });
            getDataPegawai();
        }
    } catch (error) {
        Swal.fire('Terjadi kesalahan', 'Silakan coba lagi', 'error');
    }
}

document.addEventListener('click', async function (event) {
    if (event.target.classList.contains('view-details-pegawai')) {
        event.preventDefault(); // Mencegah navigasi default
        const nip = event.target.getAttribute('data-nip');

        try {
            // Ambil data pegawai berdasarkan NIP
            const response = await fetch(`/api/pegawai/${nip}`);
            const pegawai = await response.json();

            // Fungsi untuk memformat tanggal
            const formatTanggal = (tanggal) => {
                if (!tanggal) return 'Tidak tersedia';
                const date = new Date(tanggal);
                return date.toLocaleDateString('id-ID'); // Format Indonesia
            };

            // Pastikan roles adalah array

            // Tampilkan detail pegawai menggunakan SweetAlert2
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

// async function viewDetails(nisn) {
//     try {
//         console.log("Fetching details for NISN:", nisn); // Debug
//         const response = await fetch(`/api/siswa/${nisn}`);
//         if (!response.ok) throw new Error("Gagal mengambil data siswa!");

//         const siswa = await response.json();
//         console.log("Detail siswa:", siswa); // Debug untuk melihat data yang diterima

//         // Tampilkan dengan SweetAlert2
//         Swal.fire({
//             title: `Detail Siswa: ${siswa.nama_siswa}`,
//             html: `
//                 <strong>NISN:</strong> ${siswa.nisn}<br>
//                 <strong>Nama:</strong> ${siswa.nama_siswa}<br>
//                 <strong>Tempat Lahir:</strong> ${siswa.tempat_lahir}<br>
//                 <strong>Tanggal Lahir:</strong> ${formatDate(siswa.tanggal_lahir)}<br>
//                 <strong>Alamat:</strong> ${siswa.alamat}<br>
//                 <strong>Jenis Kelamin:</strong> ${siswa.jenis_kelamin}<br>
//                 <strong>Agama:</strong> ${siswa.agama}<br>
//                 <strong>NIK:</strong> ${siswa.nik}<br>
//                 <strong>Nama Ayah:</strong> ${siswa.nama_ayah}<br>
//                 <strong>Nama Ibu:</strong> ${siswa.nama_ibu}<br>
//                 <strong>No HP ortu:</strong> ${siswa.no_hp_ortu}<br>
//                 <strong>Email:</strong> ${siswa.email}<br>
//                 <strong>Anak Ke:</strong> ${siswa.anak_ke}<br>
//                 <strong>Status:</strong> ${siswa.status}<br>
//                 <strong>Tanggal Masuk:</strong> ${formatDate(siswa.tanggal_masuk)}<br>
//             `,
//             icon: 'info',
//             confirmButtonText: 'Tutup',
//         });
//     } catch (error) {
//         console.error("Error fetching siswa details:", error);
//         Swal.fire({
//             title: 'Error',
//             text: 'Gagal mengambil detail siswa. Silakan coba lagi.',
//             icon: 'error',
//             confirmButtonText: 'Tutup',
//         });
//     }
// }
