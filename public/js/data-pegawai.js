const pegawaiTbody = document.getElementById('pegawai-tbody');

async function getDataPegawai() {
    try {
        // Bersihkan tabel sebelum menambahkan data baru
        pegawaiTbody.innerHTML = '';

        const response = await fetch('/api/pegawai');
        const pegawaiData = await response.json();

        // Tambahkan data pegawai ke dalam tabel
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
                    <a href="#" class="view-details" data-nip="${pegawai.nip}">Lihat Selengkapnya</a>
                </td>                
                <td>
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
            <input type="text" id="nip" class="swal2-input" placeholder="NIP">
            <input type="text" id="nama_pegawai" class="swal2-input" placeholder="Nama Pegawai">
            <input type="date" id="tanggal_lahir" class="swal2-input">
            <input type="text" id="tempat_lahir" class="swal2-input" placeholder="Tempat Lahir">
            <select id="jenis_kelamin" class="swal2-input">
                <option value="" disabled selected>Pilih Jenis Kelamin</option>
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
            </select>
            <input type="text" id="alamat" class="swal2-input" placeholder="Alamat">
            <input type="text" id="agama" class="swal2-input" placeholder="Agama">
            <input type="email" id="email" class="swal2-input" placeholder="Email">
            <input type="text" id="no_hp" class="swal2-input" placeholder="Nomor HP">
            <input type="password" id="password" class="swal2-input" placeholder="Password">
            <input type="text" id="nik" class="swal2-input" placeholder="NIK">
            <input type="date" id="tanggal_mulai_tugas" class="swal2-input">
            <input type="text" id="jenjang_pendidikan" class="swal2-input" placeholder="Jenjang Pendidikan">
            <input type="text" id="jurusan" class="swal2-input" placeholder="Jurusan">
            <label for="role_id">Pilih Role:</label>
            <select id="role_id" class="swal2-input" multiple>
                <option value="R1">Guru Mata Pelajaran</option>
                <option value="R2">Guru Wali Kelas</option>
                <option value="R3">Admin</option>
                <option value="R4">Kepala Sekolah</option>
            </select>
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
            const password = document.getElementById('password').value.trim();
            const nik = document.getElementById('nik').value.trim();
            const tanggalMulaiTugas = document.getElementById('tanggal_mulai_tugas').value;
            const jenjangPendidikan = document.getElementById('jenjang_pendidikan').value.trim();
            const jurusan = document.getElementById('jurusan').value.trim();
            const roles = Array.from(document.getElementById('role_id').selectedOptions).map(option => option.value);

            if (!nip || !namaPegawai || !tanggalLahir || !tempatLahir || !jenisKelamin || !alamat || !agama || !email || !noHp || !password || !nik || !tanggalMulaiTugas || !jenjangPendidikan || !jurusan || roles.length === 0) {
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
                password,
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

            // Kirim data ke server
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
        confirmButtonColor: '#3CB371', // Warna tombol konfirmasi
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
                    confirmButtonColor: '#3CB371', // Warna tombol sukses
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
                <input type="text" id="nip" class="swal2-input" value="${pegawai.nip}" disabled>
                <input type="text" id="nama_pegawai" class="swal2-input" value="${pegawai.nama_pegawai}">
                <input type="date" id="tanggal_lahir" class="swal2-input" value="${tanggalLahir}">
                <input type="text" id="tempat_lahir" class="swal2-input" value="${pegawai.tempat_lahir}">
                <select id="jenis_kelamin" class="swal2-input">
                    <option value="L" ${pegawai.jenis_kelamin === 'L' ? 'selected' : ''}>Laki-laki</option>
                    <option value="P" ${pegawai.jenis_kelamin === 'P' ? 'selected' : ''}>Perempuan</option>
                </select>
                <input type="text" id="alamat" class="swal2-input" value="${pegawai.alamat}">
                <input type="text" id="agama" class="swal2-input" value="${pegawai.agama}">
                <input type="email" id="email" class="swal2-input" value="${pegawai.email}">
                <input type="text" id="no_hp" class="swal2-input" value="${pegawai.no_hp}">
                <input type="password" id="password" class="swal2-input" placeholder="Password (kosongkan jika tidak ingin diubah)">
                <input type="text" id="nik" class="swal2-input" value="${pegawai.nik}">
                <input type="date" id="tanggal_mulai_tugas" class="swal2-input" value="${tanggalMulaiTugas}">
                <input type="text" id="jenjang_pendidikan" class="swal2-input" value="${pegawai.jenjang_pendidikan}">
                <input type="text" id="jurusan" class="swal2-input" value="${pegawai.jurusan}">
                <label for="role_id">Pilih Role:</label>
                <select id="role_id" class="swal2-input" multiple>
                    <option value="R1" ${pegawai.roles && pegawai.roles.includes('R1') ? 'selected' : ''}>Guru Mata Pelajaran</option>
                    <option value="R2" ${pegawai.roles && pegawai.roles.includes('R2') ? 'selected' : ''}>Guru Wali Kelas</option>
                    <option value="R3" ${pegawai.roles && pegawai.roles.includes('R3') ? 'selected' : ''}>Admin</option>
                    <option value="R4" ${pegawai.roles && pegawai.roles.includes('R4') ? 'selected' : ''}>Kepala Sekolah</option>
                </select>
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
                const password = document.getElementById('password').value.trim();
                const nik = document.getElementById('nik').value.trim();
                const tanggalMulaiTugas = document.getElementById('tanggal_mulai_tugas').value;
                const jenjangPendidikan = document.getElementById('jenjang_pendidikan').value.trim();
                const jurusan = document.getElementById('jurusan').value.trim();
                const roles = Array.from(document.getElementById('role_id').selectedOptions).map(option => option.value);
        
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
                    password, // Sertakan password jika diubah
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
            Swal.fire('Data berhasil diperbarui', '', 'success');
        }
    } catch (error) {
        Swal.fire('Terjadi kesalahan', 'Silakan coba lagi', 'error');
    }
}


// Menambahkan event listener untuk semua elemen dengan class 'view-details'
document.querySelectorAll('.view-details').forEach(button => {
    button.addEventListener('click', function(event) {
        event.preventDefault(); // Menghindari navigasi ke href="#"
        
        // Mengambil data NIP dari atribut data-nip
        const nip = this.getAttribute('data-nip');
        
        // Menampilkan informasi lebih lengkap berdasarkan NIP
        showDetails(nip);
    });
});

// Fungsi untuk menampilkan detail pegawai
function showDetails(nip) {
    // Misalnya, menggunakan fetch untuk mendapatkan data pegawai berdasarkan NIP
    fetch(`/api/pegawai/${nip}`) // Sesuaikan dengan endpoint API Anda
        .then(response => response.json())
        .then(data => {
            // Menampilkan data pegawai lebih lengkap (misalnya di dalam modal)
            const detailSection = document.getElementById('detail-section');
            detailSection.innerHTML = `
                <h3>Detail Pegawai</h3>
                <p>NIP: ${data.nip}</p>
                <p>Nama: ${data.nama_pegawai}</p>
                <p>Tempat Lahir: ${data.tempat_lahir}</p>
                <p>Tanggal Lahir: ${data.tanggal_lahir}</p>
                <p>Jenjang Pendidikan: ${data.jenjang_pendidikan}</p>
                <p>Jurusan: ${data.jurusan}</p>
                <p>Alamat: ${data.alamat}</p>
                <p>Telepon: ${data.telepon}</p>
                <!-- Informasi lainnya sesuai dengan data pegawai -->
            `;
            detailSection.style.display = 'block'; // Menampilkan bagian detail
        })
        .catch(error => {
            console.error('Terjadi kesalahan:', error);
        });
}

document.addEventListener('click', (event) => {
    if (event.target.classList.contains('view-details')) {
        event.preventDefault(); // Mencegah aksi default tautan
        const nip = event.target.getAttribute('data-nip');
        viewDetails(nip); // Fungsi untuk menangani klik "Lihat Selengkapnya"
    }
});

// Fungsi untuk menangani klik "Lihat Selengkapnya"
async function viewDetails(nip) {
    try {
        // Panggil API untuk mendapatkan detail pegawai
        const response = await fetch(`/api/pegawai/${nip}`);
        if (!response.ok) throw new Error("Gagal mengambil data pegawai!");

        const pegawai = await response.json();

        // Menampilkan detail pegawai dengan SweetAlert2
        Swal.fire({
            title: `Detail Pegawai: ${pegawai.nama_pegawai}`,
            html: `
                <strong>NIP:</strong> ${pegawai.nip}<br>
                <strong>Nama:</strong> ${pegawai.nama_pegawai}<br>
                <strong>Tempat Lahir:</strong> ${pegawai.tempat_lahir}<br>
                <strong>Tanggal Lahir:</strong> ${formatDate(pegawai.tanggal_lahir)}<br>
                <strong>Pendidikan:</strong> ${pegawai.jenjang_pendidikan}<br>
                <strong>Jurusan:</strong> ${pegawai.jurusan}<br>
                <strong>Alamat:</strong> ${pegawai.alamat}<br>
                <strong>NUPTK:</strong> ${pegawai.nuptk}<br>
                <strong>Golongan:</strong> ${pegawai.golongan}<br>
                <strong>Jenis Kelamin:</strong> ${pegawai.jenis_kelamin}<br>
                <strong>Agama:</strong> ${pegawai.agama}<br>
                <strong>NIK:</strong> ${pegawai.nik}<br>
                <strong>Email:</strong> ${pegawai.email}<br>
                <strong>No HP:</strong> ${pegawai.no_hp}<br>


            `,
            icon: 'info',
            confirmButtonText: 'Tutup'
        });
    } catch (error) {
        console.error("Error fetching pegawai details:", error);

        // Tampilkan pesan error menggunakan SweetAlert2
        Swal.fire({
            title: 'Error',
            text: 'Gagal mengambil detail pegawai. Silakan coba lagi nanti.',
            icon: 'error',
            confirmButtonText: 'Tutup'
        });
    }
}
;

