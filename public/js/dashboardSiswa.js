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
        const biodataName = document.getElementById('biodata-name');
        console.log(biodataName);  // Debugging log
        if (biodataName) {
            biodataName.textContent = user.name || 'Tidak tersedia';
        }

        const biodataTtl = document.getElementById('biodata-ttl');
        console.log(biodataTtl);  // Debugging log
        if (biodataTtl) {
            biodataTtl.textContent = `${user.tempat_lahir}, ${user.tanggal_lahir}` || 'Tidak tersedia';
        }

       

        const biodataNisn = document.getElementById('biodata-nisn');
        console.log(biodataNisn);  // Debugging log
        if (biodataNisn) {
            biodataNisn.textContent = user.nisn || 'Tidak tersedia';
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

    function hideAllSections() {
        sections.forEach(section => section.classList.add('hidden'));
    }

    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();

            links.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            hideAllSections();

            const target = link.getAttribute('data-target');
            const targetSection = document.getElementById(target);
            if (targetSection) {
                targetSection.classList.remove('hidden');
            }
        });
    });

    hideAllSections(); // Menyembunyikan semua konten
    const defaultLink = document.querySelector('[data-target="siswa-profil"]'); // Memastikan Profil adalah default
    if (defaultLink) {
        defaultLink.classList.add('active');
        document.getElementById('siswa-profile').classList.remove('hidden'); // Menampilkan Profil
    }
});
