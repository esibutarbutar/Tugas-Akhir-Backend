const siswaTbody = document.getElementById("siswa-tbody");

async function fetchSiswaData() {
    try {
        const response = await fetch('/api/siswa');
        if (response.ok) {
            const data = await response.json();
            renderSiswaTable(data);
        } else {
            console.error("Gagal mengambil data siswa:", response.statusText);
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

function renderSiswaTable(data) {
    siswaTbody.innerHTML = "";
    data.forEach((siswa, index) => {
        const row = document.createElement("tr");
        const tanggalLahir = formatDate(siswa.tanggal_lahir);
        row.innerHTML = `
        <td>${siswa.nisn}</td>
        <td>${siswa.nama_siswa}</td>
        <td>${siswa.tempat_lahir}</td>
        <td>${tanggalLahir}</td>
        <td>${siswa.alamat}</td>
        <td>
            <a href="#" class="view-details-siswa" data-nisn="${siswa.nisn}">Lihat Selengkapnya</a>
        </td>                
        <td  class="button-container">
            <button class="edit-btn-siswa" data-nisn="${siswa.nisn}">Edit</button>
            <button class="delete-btn-siswa" data-nisn="${siswa.nisn}">Delete</button>
        </td>
    `;
        siswaTbody.appendChild(row);
    });
}
fetchSiswaData()


document.addEventListener('click', (event) => {
    if (event.target.classList.contains('delete-btn-siswa')) {
        console.log("Delete button clicked!");
        const nisn = event.target.getAttribute('data-nisn');
        console.log("NISN:", nisn);
        deleteSiswa(nisn);
    }
});
async function deleteSiswa(nisn) {
    const result = await Swal.fire({
        title: 'Apakah Anda yakin?',
        text: `Siswa dengan NISN ${nisn} akan dihapus dari sistem.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#004D40',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Ya, Hapus',
        cancelButtonText: 'Batal',
    });

    if (result.isConfirmed) {
        try {
            const response = await fetch(`/api/siswa/${nisn}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                Swal.fire({
                    title: 'Berhasil!',
                    text: 'Data Siswa berhasil dihapus.',
                    icon: 'success',
                    confirmButtonColor: '#004D40',
                });

                const row = document.querySelector(`[data-nisn="${nisn}"]`).closest('tr');
                if (row) row.remove();
            } else {
                Swal.fire({
                    title: 'Gagal!',
                    text: 'Terjadi kesalahan saat menghapus data Siswa.',
                    icon: 'error',
                });
            }
        } catch (error) {
            console.error('Error deleting Siswa:', error);
            Swal.fire({
                title: 'Gagal!',
                text: 'Tidak dapat terhubung ke server.',
                icon: 'error',
            });
        }
    }
}

document.getElementById('search-student-input').addEventListener('input', function () {
    const searchQuery = this.value.toLowerCase();
    const rows = document.querySelectorAll('#siswa-tbody tr');

    rows.forEach(row => {
        const nameCell = row.cells[1].textContent.toLowerCase();
        const nisnCell = row.cells[0].textContent.toLowerCase();

        if (nameCell.includes(searchQuery) || nisnCell.includes(searchQuery)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
});


document.addEventListener('click', (event) => {
    if (event.target.classList.contains('view-details-siswa')) {
        event.preventDefault();
        const nisn = event.target.getAttribute('data-nisn');
        viewDetails(nisn);
    }
});

document.addEventListener('click', (event) => {
    if (event.target.classList.contains('view-details-siswa')) {
        event.preventDefault();
        const nisn = event.target.getAttribute('data-nisn');
        viewDetails(nisn);
    }
});

async function viewDetails(nisn) {
    try {
        console.log("Fetching details for NISN:", nisn);
        const response = await fetch(`/api/siswa/${nisn}`);
        if (!response.ok) throw new Error("Gagal mengambil data siswa!");

        const siswa = await response.json();
        console.log("Detail siswa:", siswa);  // Cek data siswa yang diterima
        console.log("Kelas siswa:", siswa.nama_kelas);  // Cek apakah nama_kelas ada

        Swal.fire({
            title: `Detail Siswa: ${siswa.nama_siswa}`,
            html: `
                <strong>NISN:</strong> ${siswa.nisn}<br>
                <strong>Nama:</strong> ${siswa.nama_siswa}<br>
                <strong>Tempat Lahir:</strong> ${siswa.tempat_lahir}<br>
                <strong>Tanggal Lahir:</strong> ${formatDate(siswa.tanggal_lahir)}<br>
                <strong>Alamat:</strong> ${siswa.alamat}<br>
                <strong>Jenis Kelamin:</strong> ${siswa.jenis_kelamin}<br>
                <strong>Agama:</strong> ${siswa.agama}<br>
                <strong>NIK:</strong> ${siswa.nik}<br>
                <strong>Nama Ayah:</strong> ${siswa.nama_ayah}<br>
                <strong>Nama Ibu:</strong> ${siswa.nama_ibu}<br>
                <strong>No HP ortu:</strong> ${siswa.no_hp_ortu}<br>
                <strong>Email:</strong> ${siswa.email}<br>
                <strong>Anak Ke:</strong> ${siswa.anak_ke}<br>
                <strong>Status:</strong> ${siswa.status}<br>
                <strong>Tanggal Masuk:</strong> ${formatDate(siswa.tanggal_masuk)}<br>
                <strong>Kelas:</strong> ${siswa.id_kelas} - ${siswa.nama_kelas || 'Tidak tersedia'}<br>
            `,
            icon: 'info',
            confirmButtonText: 'Tutup',
            confirmButtonColor: '#004D40'
        });
    } catch (error) {
        console.error("Error fetching siswa details:", error);
        Swal.fire({
            title: 'Error',
            text: 'Gagal mengambil detail siswa. Silakan coba lagi.',
            icon: 'error',
            confirmButtonText: 'Tutup',
        });
    }
}

siswaTbody.addEventListener('click', async (event) => {
    if (event.target && event.target.classList.contains('edit-btn-siswa')) {
        const siswaId = event.target.getAttribute('data-nisn'); // Mengambil nisn dari atribut data

        // Ambil data siswa dari API berdasarkan ID
        const siswaData = await fetch(`/api/siswa/${siswaId}`)
            .then(response => response.json())
            .catch(error => {
                console.error('Error fetching siswa data:', error);
                Swal.fire({
                    title: 'Gagal!',
                    text: 'Tidak dapat mengambil data siswa.',
                    icon: 'error',
                });
                return null;
            });

        if (!siswaData) {
            return;
        }

        // Ambil data kelas
        const kelasData = await fetch('/api/kelas')
            .then(response => response.json())
            .catch(error => {
                console.error('Error fetching kelas data:', error);
                Swal.fire({
                    title: 'Gagal!',
                    text: 'Tidak dapat mengambil data kelas.',
                    icon: 'error',
                });
                return [];
            });



        const { value: formValues } = await Swal.fire({
            title: 'Edit Data Siswa',
            html: `
            <label for="nisn"><strong>NISN:</strong></label>
            <input id="nisn" type="text" class="swal2-input" value="${siswaData.nisn}" placeholder="NISN"><br>

            <label for="nama_siswa"><strong>Nama Siswa:</strong></label>
            <input id="nama_siswa" type="text" class="swal2-input" value="${siswaData.nama_siswa}" placeholder="Nama Siswa"><br>

            <label for="alamat"><strong>Alamat:</strong></label>
            <input id="alamat" type="text" class="swal2-input" value="${siswaData.alamat}" placeholder="Alamat"><br>

            <label for="tempat_lahir"><strong>Tempat Lahir:</strong></label>
            <input id="tempat_lahir" type="text" class="swal2-input" value="${siswaData.tempat_lahir}" placeholder="Tempat Lahir"><br>

            <label for="tanggal_lahir"><strong>Tanggal Lahir:</strong></label>
            <input id="tanggal_lahir" type="date" class="swal2-input" value="${formatDateToInput(siswaData.tanggal_lahir)}"><br>

            <label for="jenis_kelamin"><strong>Jenis Kelamin:</strong></label>
            <select id="jenis_kelamin" class="swal2-input">
                <option ${siswaData.jenis_kelamin === 'laki-laki' ? 'selected' : ''} value="laki-laki">Laki - Laki</option>
                <option ${siswaData.jenis_kelamin === 'perempuan' ? 'selected' : ''} value="perempuan">Perempuan</option>
            </select><br>

            <label for="agama"><strong>Agama:</strong></label>
            <select id="agama" class="swal2-input">
                <option ${siswaData.agama === 'Islam' ? 'selected' : ''} value="Islam">Islam</option>
                <option ${siswaData.agama === 'Kristen' ? 'selected' : ''} value="Kristen">Kristen</option>
                <option ${siswaData.agama === 'Hindu' ? 'selected' : ''} value="Hindu">Hindu</option>
                <option ${siswaData.agama === 'Buddha' ? 'selected' : ''} value="Buddha">Buddha</option>
                <option ${siswaData.agama === 'Katholik' ? 'selected' : ''} value="Katholik">Katholik</option>
            </select><br>

            <label for="tanggal_masuk"><strong>Tanggal Masuk:</strong></label>
            <input id="tanggal_masuk" type="date" class="swal2-input" value="${formatDateToInput(siswaData.tanggal_masuk)}"><br>

            <label for="nama_ayah"><strong>Nama Ayah:</strong></label>
            <input id="nama_ayah" type="text" class="swal2-input" value="${siswaData.nama_ayah}" placeholder="Nama Ayah"><br>

            <label for="nama_ibu"><strong>Nama Ibu:</strong></label>
            <input id="nama_ibu" type="text" class="swal2-input" value="${siswaData.nama_ibu}" placeholder="Nama Ibu"><br>

            <label for="no_hp_ortu"><strong>No HP Ortu:</strong></label>
            <input id="no_hp_ortu" type="text" class="swal2-input" value="${siswaData.no_hp_ortu}" placeholder="No HP Ortu"><br>

            <label for="email"><strong>Email:</strong></label>
            <input id="email" type="email" class="swal2-input" value="${siswaData.email}" placeholder="Email"><br>

            <label for="nik"><strong>NIK:</strong></label>
            <input id="nik" type="number" class="swal2-input" value="${siswaData.nik}" placeholder="NIK"><br>

            <label for="anak_ke"><strong>Anak Ke:</strong></label>
            <input id="anak_ke" type="number" class="swal2-input" value="${siswaData.anak_ke}" placeholder="Anak Ke" min="1" step="1"><br>

            <label for="status"><strong>Status:</strong></label>
            <select id="status" class="swal2-input">
                <option ${siswaData.status === 'Aktif' ? 'selected' : ''} value="Aktif">Aktif</option>
                <option ${siswaData.status === 'Lulus' ? 'selected' : ''} value="Lulus">Lulus</option>
                <option ${siswaData.status === 'Cuti' ? 'selected' : ''} value="Cuti">Cuti</option>
            </select><br>

            <label for="id_kelas"><strong>Kelas:</strong></label>
            <label for="id_kelas"><strong>Kelas:</strong></label>
            <select id="id_kelas" class="swal2-input">
                <option value="" ${!siswaData.id_kelas ? 'selected' : ''}>Tidak Ada Kelas</option>
                ${kelasData.map(kelas =>
                    `<option value="${kelas.id}" ${siswaData.id_kelas === kelas.id ? 'selected' : ''}>
                        ${kelas.id} - ${kelas.nama_kelas}
                    </option>`).join('')}
            </select><br>
             `,
            showCancelButton: true,
            confirmButtonText: 'Simpan',
            cancelButtonText: 'Batal',
            preConfirm: () => {
                const nisn = document.getElementById('nisn');
                const namaSiswa = document.getElementById('nama_siswa');
                const alamat = document.getElementById('alamat');
                const tempatLahir = document.getElementById('tempat_lahir');
                const tanggalLahir = document.getElementById('tanggal_lahir');
                const jenisKelamin = document.getElementById('jenis_kelamin');
                const agama = document.getElementById('agama');
                const tanggalMasuk = document.getElementById('tanggal_masuk');
                const namaAyah = document.getElementById('nama_ayah');
                const namaIbu = document.getElementById('nama_ibu');
                const noHpOrtu = document.getElementById('no_hp_ortu');
                const email = document.getElementById('email');
                const nik = document.getElementById('nik');
                const anakKe = document.getElementById('anak_ke');
                const status = document.getElementById('status');
                const idKelas = document.getElementById('id_kelas');

                if (!nisn || !namaSiswa || !alamat || !tempatLahir || !tanggalLahir || !jenisKelamin || !agama ||
                    !tanggalMasuk || !namaAyah || !namaIbu || !noHpOrtu || !email || !nik || !anakKe || !status) {
                    Swal.showValidationMessage('Semua field harus diisi!');
                    return false;
                }

                return {
                    id: siswaId, // ID siswa untuk update
                    nisn: nisn.value,
                    nama_siswa: namaSiswa.value,
                    alamat: alamat.value,
                    tempat_lahir: tempatLahir.value,
                    tanggal_lahir: tanggalLahir.value,
                    jenis_kelamin: jenisKelamin.value,
                    agama: agama.value,
                    tanggal_masuk: tanggalMasuk.value,
                    nama_ayah: namaAyah.value,
                    nama_ibu: namaIbu.value,
                    no_hp_ortu: noHpOrtu.value,
                    email: email.value,
                    nik: nik.value,
                    anak_ke: anakKe.value,
                    status: status.value,
                    id_kelas: idKelas.value || null,  // Mengambil kelas yang dipilih
                };
            },
        });



        if (formValues) {
            try {
                const response = await fetch(`/api/siswa/${siswaId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formValues),
                });

                if (response.ok) {
                    Swal.fire({
                        title: 'Berhasil!',
                        text: 'Data siswa berhasil diperbarui.',
                        icon: 'success',
                        confirmButtonColor: '#004D40'
                    });
                    fetchSiswaData(); // Memuat ulang data siswa
                } else {
                    Swal.fire({
                        title: 'Gagal!',
                        text: 'Terjadi kesalahan saat memperbarui data siswa.',
                        icon: 'error',
                    });
                }
            } catch (error) {
                console.error("Error updating siswa:", error);
                Swal.fire({
                    title: 'Gagal!',
                    text: 'Tidak dapat terhubung ke server.',
                    icon: 'error',
                });
            }
        }
    }
});



function formatDateToInput(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

document.getElementById('add-student-btn').addEventListener('click', async () => {
    const kelasData = await fetch('/api/kelas')
        .then(response => response.json())
        .catch(error => {
            console.error('Error fetching kelas:', error);
            Swal.fire({
                title: 'Gagal!',
                text: 'Tidak dapat mengambil data kelas.',
                icon: 'error',
            });
            return [];
        });

    const kelasOptions = kelasData.map(kelas => {
        return `<option value="${kelas.id}">${kelas.id} - ${kelas.nama_kelas}</option>`;
    }).join("");

    const { value: formValues } = await Swal.fire({
        title: 'Tambah Data Siswa',
        html: `
        <label for="nisn"><strong>NISN:</strong></label>
        <input id="nisn" type="text" class="swal2-input" placeholder="NISN"><br>

        <label for="nama_siswa"><strong>Nama Siswa:</strong></label>
        <input id="nama_siswa" type="text" class="swal2-input" placeholder="Nama Siswa"><br>

        <label for="alamat"><strong>Alamat:</strong></label>
        <input id="alamat" type="text" class="swal2-input" placeholder="Alamat"><br>

        <label for="tempat_lahir"><strong>Tempat Lahir:</strong></label>
        <input id="tempat_lahir" type="text" class="swal2-input" placeholder="Tempat Lahir"><br>

        <label for="tanggal_lahir"><strong>Tanggal Lahir:</strong></label>
        <input id="tanggal_lahir" type="date" class="swal2-input"><br>

        <label for="jenis_kelamin"><strong>Jenis Kelamin:</strong></label>
        <select id="jenis_kelamin" class="swal2-input">
            <option>Pilih Jenis Kelamin</option>
            <option value="laki-laki">Laki - Laki</option>
            <option value="perempuan">Perempuan</option>
        </select><br>

        <label for="agama"><strong>Agama:</strong></label>
        <select id="agama" class="swal2-input">
            <option>Pilih Agama</option>
            <option value="Islam">Islam</option>
            <option value="Kristen">Kristen</option>
            <option value="Hindu">Hindu</option>
            <option value="Buddha">Buddha</option>
            <option value="Katholik">Katholik</option>
        </select><br>

        <label for="tanggal_masuk"><strong>Tanggal Masuk:</strong></label>
        <input id="tanggal_masuk" type="date" class="swal2-input"><br>

        <label for="nama_ayah"><strong>Nama Ayah:</strong></label>
        <input id="nama_ayah" type="text" class="swal2-input" placeholder="Nama Ayah"><br>

        <label for="nama_ibu"><strong>Nama Ibu:</strong></label>
        <input id="nama_ibu" type="text" class="swal2-input" placeholder="Nama Ibu"><br>

        <label for="no_hp_ortu"><strong>No HP Ortu:</strong></label>
        <input id="no_hp_ortu" type="text" class="swal2-input" placeholder="No HP Ortu"><br>

        <label for="email"><strong>Email:</strong></label>
        <input id="email" type="email" class="swal2-input" placeholder="Email"><br>

        <label for="nik"><strong>NIK:</strong></label>
        <input id="nik" type="number" class="swal2-input" placeholder="NIK"><br>

        <label for="anak_ke"><strong>Anak Ke:</strong></label>
        <input id="anak_ke" type="number" class="swal2-input" placeholder="Anak Ke" min="1" step="1"><br>

        <label for="status"><strong>Status:</strong></label>
        <select id="status" class="swal2-input">
            <option>Status</option>
            <option value="Aktif">Aktif</option>
            <option value="Lulus">Lulus</option>
            <option value="Cuti">Cuti</option>
        </select><br>

        <label for="id_kelas"><strong>Kelas:</strong></label>
        <select id="id_kelas" class="swal2-input">
            <option value="">Pilih Kelas</option>
            ${kelasOptions} <!-- Mengisi opsi kelas -->
        </select><br>   
        `,
        showCancelButton: true,
        confirmButtonText: 'Tambah',
        cancelButtonText: 'Batal',
        preConfirm: () => {
            const nisn = document.getElementById('nisn');
            const namaSiswa = document.getElementById('nama_siswa');
            const alamat = document.getElementById('alamat');
            const tempatLahir = document.getElementById('tempat_lahir');
            const tanggalLahir = document.getElementById('tanggal_lahir');
            const jenisKelamin = document.getElementById('jenis_kelamin');
            const agama = document.getElementById('agama');
            const tanggalMasuk = document.getElementById('tanggal_masuk');
            const namaAyah = document.getElementById('nama_ayah');
            const namaIbu = document.getElementById('nama_ibu');
            const noHpOrtu = document.getElementById('no_hp_ortu');
            const email = document.getElementById('email');
            const nik = document.getElementById('nik');
            const anakKe = document.getElementById('anak_ke');
            const status = document.getElementById('status');
            const idKelas = document.getElementById('id_kelas');
            const idKelasValue = idKelas.value ? idKelas.value : null

            if (!nisn || !namaSiswa || !alamat || !tempatLahir || !tanggalLahir || !jenisKelamin || !agama ||
                !tanggalMasuk || !namaAyah || !namaIbu || !noHpOrtu || !email || !nik || !anakKe || !status ) {
                Swal.showValidationMessage('Semua field harus diisi!');
                return false;
            }
            

            return {
                nisn: nisn.value,
                nama_siswa: namaSiswa.value,
                alamat: alamat.value,
                tempat_lahir: tempatLahir.value,
                tanggal_lahir: tanggalLahir.value,
                jenis_kelamin: jenisKelamin.value,
                agama: agama.value,
                tanggal_masuk: tanggalMasuk.value,
                nama_ayah: namaAyah.value,
                nama_ibu: namaIbu.value,
                no_hp_ortu: noHpOrtu.value,
                email: email.value,
                nik: nik.value,
                anak_ke: anakKe.value,
                status: status.value,
                id_kelas: idKelasValue,  // Menambahkan id_kelas
            };
        },
    });

    if (formValues) {
        try {
            const response = await fetch('/api/siswa', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formValues),
            });

            if (response.ok) {
                Swal.fire({
                    title: 'Berhasil!',
                    text: 'Data siswa berhasil ditambahkan.',
                    icon: 'success',
                    confirmButtonColor: '#004D40'
                });
                fetchSiswaData();
            } else {
                Swal.fire({
                    title: 'Gagal!',
                    text: 'Terjadi kesalahan saat menambahkan data siswa.',
                    icon: 'error',
                });
            }
        } catch (error) {
            console.error("Error adding siswa:", error);
            Swal.fire({
                title: 'Gagal!',
                text: 'Tidak dapat terhubung ke server.',
                icon: 'error',
            });
        }
    }
});
