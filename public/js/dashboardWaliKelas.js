const cameraIcon = document.getElementById('camera-icon');
const fileInput = document.getElementById('file-input');
const profileImage = document.getElementById('profile-image');
const uploadForm = document.getElementById('upload-form');
const fileUploadInput = document.getElementById('file-upload');

// Fungsi untuk mengambil data sesi
async function fetchSessionData() {
    try {
        const response = await fetch('/api/session');
        if (!response.ok) {
            throw new Error('Tidak dapat mengambil data sesi.');
        }

        const user = await response.json();
        console.log('User data:', user);

        const tempatTanggalLahir = `${user.tempat_lahir}, ${user.tanggal_lahir}`;
        document.getElementById('employee-name-header').textContent = user.name || 'Tamu';
        document.getElementById('employee-name-message').textContent = user.name || 'Tamu';
        document.getElementById('biodata-name').textContent = user.name || 'Tidak tersedia';
        document.getElementById('biodata-ttl').textContent = tempatTanggalLahir || 'Tidak tersedia';
        document.getElementById('biodata-nip').textContent = user.nip || 'Tidak tersedia';
        document.getElementById('biodata-role').textContent = user.position || 'Tidak tersedia';
        document.getElementById('biodata-nik').textContent = user.nik || 'Tidak tersedia';
        document.getElementById('biodata-tmt').textContent = user.tanggal_mulai_tugas || 'Tidak tersedia';
        document.getElementById('biodata-jp').textContent = user.jenjang_pendidikan || 'Tidak tersedia';
        document.getElementById('biodata-jurusan').textContent = user.jurusan || 'Tidak tersedia';
        document.getElementById('biodata-nuptk').textContent = user.nuptk || 'Tidak tersedia';
        document.getElementById('biodata-golongan').textContent = user.golongan || 'Tidak tersedia';

        // Setel URL gambar profil jika tersedia
        if (user.profile_image) {
            profileImage.src = user.profile_image;
        }

        // Setel huruf inisial pada lingkaran profil
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

// Navigasi antara profil dan data nilai siswa
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

                // Jika target adalah data siswa, panggil fungsi fetchSiswaData()
                if (target === 'data-nilai-siswa') {
                    fetchSiswaData();
                }
            }
        });
    });

    hideAllSections();
    const defaultLink = document.querySelector('[data-target="guru-matpel-profile"]');
    if (defaultLink) {
        defaultLink.classList.add('active');
        document.getElementById('guru-matpel-profile').classList.remove('hidden');
    }
});