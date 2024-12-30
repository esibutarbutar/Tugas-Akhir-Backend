const cameraIcon = document.getElementById('camera-icon');
const fileInput = document.getElementById('file-input');
const profileImage = document.getElementById('profile-image');
const uploadForm = document.getElementById('upload-form');
const fileUploadInput = document.getElementById('file-upload');

// Fungsi untuk mengambil data sesi
async function fetchSessionData() {
    try {
        const response = await fetch('/api/session-siswa');
        if (!response.ok) {
            throw new Error('Tidak dapat mengambil data sesi.');
        }

        const user = await response.json();
        console.log('User data:', user);
        console.log('Nama pengguna:', user.name); 

        const nameHeader = document.getElementById('employee-name-header');
        console.log(nameHeader);  // Debugging log
        if (nameHeader) {
            nameHeader.textContent = user.name || 'Tamu';
        }

        const nameMessage = document.getElementById('employee-name-message');
        if (nameMessage) {
            nameMessage.textContent = user.name || 'Tamu'; // Menggunakan 'Tamu' jika user.name undefined
        } else {
            console.error("Elemen dengan ID 'employee-name-message' tidak ditemukan.");
        }
         // Update nama pengguna
        const biodataName = document.getElementById('biodata-name');
        if (biodataName) {
            biodataName.textContent = user.name || 'Tidak tersedia';
        }

        // Update tempat dan tanggal lahir
        const biodataTtl = document.getElementById('biodata-ttl');
        if (biodataTtl) {
            biodataTtl.textContent = `${user.tempat_lahir || 'Tidak tersedia'}, ${user.tanggal_lahir || 'Tidak tersedia'}`;
        }

        // Update jenis kelamin
        const biodataJenisKelamin = document.getElementById('biodata-jenis-kelamin');
        if (biodataJenisKelamin) {
            biodataJenisKelamin.textContent = user.jenis_kelamin || 'Tidak tersedia';
        }

        // Update NISN
        const biodataNisn = document.getElementById('biodata-nisn');
        if (biodataNisn) {
            biodataNisn.textContent = user.nisn || 'Tidak tersedia';
        }

        // Update agama
        const biodataAgama = document.getElementById('biodata-agama');
        if (biodataAgama) {
            biodataAgama.textContent = user.agama || 'Tidak tersedia';
        }

        // Update nama ayah
        const biodataNamaAyah = document.getElementById('biodata-nama-ayah');
        if (biodataNamaAyah) {
            biodataNamaAyah.textContent = user.nama_ayah || 'Tidak tersedia';
        }

        // Update nama ibu
        const biodataNamaIbu = document.getElementById('biodata-nama-ibu');
        if (biodataNamaIbu) {
            biodataNamaIbu.textContent = user.nama_ibu || 'Tidak tersedia';
        }

        // Update nomor HP orang tua
        const biodataNoHpOrtu = document.getElementById('biodata-no-hp-ortu');
        if (biodataNoHpOrtu) {
            biodataNoHpOrtu.textContent = user.no_hp_ortu || 'Tidak tersedia';
        }

        // Update email
        const biodataEmail = document.getElementById('biodata-email');
        if (biodataEmail) {
            biodataEmail.textContent = user.email || 'Tidak tersedia';
        }

        // Update NIK
        const biodataNik = document.getElementById('biodata-nik');
        if (biodataNik) {
            biodataNik.textContent = user.nik || 'Tidak tersedia';
        }

        // Update anak ke
        const biodataAnakKe = document.getElementById('biodata-anak-ke');
        if (biodataAnakKe) {
            biodataAnakKe.textContent = user.anak_ke || 'Tidak tersedia';
        }

        // Update status
        const biodataStatus = document.getElementById('biodata-status');
        if (biodataStatus) {
            biodataStatus.textContent = user.status || 'Tidak tersedia';
        }

        // Update tanggal masuk
        const biodataTanggalMasuk = document.getElementById('biodata-tanggal-masuk');
        if (biodataTanggalMasuk) {
            biodataTanggalMasuk.textContent = user.tanggal_masuk || 'Tidak tersedia';
        }

        // Update last password update
        const biodataLastPasswordUpdate = document.getElementById('biodata-last-password-update');
        if (biodataLastPasswordUpdate) {
            biodataLastPasswordUpdate.textContent = user.last_password_update || 'Tidak tersedia';
        }

        // Update ID Kelas
        const biodataIdKelas = document.getElementById('biodata-id-kelas');
        if (biodataIdKelas) {
            biodataIdKelas.textContent = user.id_kelas || 'Tidak tersedia';
        }
        const profileInitial = document.getElementById('profile-initial');
        if (profileInitial) {
            profileInitial.textContent = user.name?.charAt(0).toUpperCase() || 'T';
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Gagal memuat data sesi.');
    }
}

document.addEventListener('DOMContentLoaded', fetchSessionData);

document.addEventListener('DOMContentLoaded', () => {
    const links = document.querySelectorAll('.sidebar a');
    const sections = document.querySelectorAll('.content-section');
  
    console.log('Links:', links); // Debugging
    console.log('Sections:', sections); // Debugging
  
    function hideAllSections() {
        sections.forEach(section => {
            console.log('Hiding section:', section.id); // Debugging
            section.classList.add('hidden');
        });
    }
  
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            hideAllSections();
            const target = link.getAttribute('data-target');
            console.log('Trying to show section:', target); // Debugging
  
            const targetSection = document.getElementById(target);
            if (targetSection) {
                console.log('Showing section:', targetSection.id); // Debugging
                targetSection.classList.remove('hidden');
            } else {
                console.error('Target section not found:', target); // Debugging
                alert(`Target section not found: ${target}`); // Error handling
            }
        });
    });
  
    // Default to show the profile section
    hideAllSections();
    const defaultSection = document.getElementById('siswa-profile'); // Pastikan nama ID sama dengan di HTML
    if (defaultSection) {
        console.log('Default section shown:', defaultSection.id); // Debugging
        defaultSection.classList.remove('hidden');
    } else {
        console.error('Default section not found!'); // Debugging
    }
});
