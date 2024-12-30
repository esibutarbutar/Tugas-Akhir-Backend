function loadTahunAjaranOptions() {
    fetch('/api/tahun-ajaran') // Pastikan endpoint ini benar
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json(); // Pastikan response berbentuk JSON
        })
        .then(data => {
            // Cek apakah data yang diterima tidak kosong
            if (data && Array.isArray(data) && data.length > 0) {
                const select = document.getElementById('tahun-ajaran-filter');
                select.innerHTML = '<option value="">Pilih Tahun Ajaran</option>'; // Reset dropdown terlebih dahulu

                data.forEach(item => {
                    if (item.id && item.nama_tahun_ajaran && item.semester) {
                        const option = document.createElement('option');
                        option.value = item.id; // ID sebagai value
                        option.textContent = `${item.nama_tahun_ajaran} (${item.semester})`; // Tampilkan nama tahun ajaran dan semester
                        select.appendChild(option);
                    } else {
                        console.warn('Data tahun ajaran tidak lengkap:', item);
                    }
                });
                console.log('Dropdown tahun ajaran berhasil diisi.');
            } else {
                console.error('Data tahun ajaran kosong atau tidak sesuai format:', data);
            }
        })
        .catch(error => {
            console.error('Error loading tahun ajaran:', error);
        });
}



async function getUserSession() {
    try {
        const response = await fetch("api/session-siswa");
        if (!response.ok) throw new Error("Gagal memuat data session");

        const sessionData = await response.json();
        console.log("Data session pengguna:", sessionData);

        return sessionData.nisn;
    } catch (error) {
        console.error("Error:", error);
        alert("Gagal memuat data session.");
    }
}
document.addEventListener('DOMContentLoaded', function() {
    loadTahunAjaranOptions();

    // Panggil fungsi getUserSession dan tampilkan NISN di console
    getUserSession().then(nisn => {
        if (nisn) {
            console.log("NISN Pengguna:", nisn);
        } else {
            console.log("NISN tidak ditemukan.");
        }
    });
});

