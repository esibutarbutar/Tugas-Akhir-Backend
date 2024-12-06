const cameraIcon = document.getElementById('camera-icon');
const fileInput = document.getElementById('file-input');
const profileImage = document.getElementById('profile-image');
const uploadForm = document.getElementById('upload-form');
const fileUploadInput = document.getElementById('file-upload');


async function fetchSessionData() {
    try {
        const response = await fetch('/api/session');
        if (!response.ok) {
            throw new Error('Tidak dapat mengambil data sesi.');
        }

        const user = await response.json();
        console.log('User data:', user);

        const tempatTanggalLahir = `${user.tempat_lahir}, ${user.tanggal_lahir}`;
        document.getElementById('employee-name-header').textContent = user.name;
        document.getElementById('employee-name-message').textContent = user.name;
        document.getElementById('biodata-name').textContent = user.name;
        document.getElementById('biodata-ttl').textContent = tempatTanggalLahir;
        document.getElementById('biodata-nip').textContent = user.nip;
        document.getElementById('biodata-role').textContent = user.position;
        document.getElementById('biodata-nik').textContent = user.nik;
        document.getElementById('biodata-tmt').textContent = user.tanggal_mulai_tugas;
        document.getElementById('biodata-jp').textContent = user.jenjang_pendidikan;
        document.getElementById('biodata-jurusan').textContent = user.jurusan;
        document.getElementById('biodata-nuptk').textContent = user.nuptk;
        document.getElementById('biodata-golongan').textContent = user.golongan;

        // Set image URL if available
        if (user.profile_image) {
            profileImage.src = user.profile_image;
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Gagal memuat data sesi.');
    }
}

document.addEventListener('DOMContentLoaded', fetchSessionData);

document.addEventListener('DOMContentLoaded', () => {
    const links = document.querySelectorAll('.sidebar a'); // Menu di sidebar
    const sections = document.querySelectorAll('.content-section'); // Semua bagian konten

    // Fungsi untuk menyembunyikan semua bagian konten
    function hideAllSections() {
        sections.forEach(section => section.classList.add('hidden')); // Tambahkan kelas 'hidden'
    }

    // Event listener untuk setiap menu sidebar
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault(); // Mencegah reload halaman

            // Hapus kelas 'active' dari semua menu
            links.forEach(l => l.classList.remove('active'));
            link.classList.add('active'); // Tambahkan kelas 'active' ke menu yang diklik

            // Sembunyikan semua bagian konten
            hideAllSections();

            // Tampilkan konten yang sesuai
            const target = link.getAttribute('data-target');
            const targetSection = document.getElementById(target);
            if (targetSection) {
                targetSection.classList.remove('hidden'); // Hapus kelas 'hidden'
            }
        });
    });

    // Halaman default: hanya tampilkan Profil Admin
    hideAllSections();  // Menyembunyikan semua konten terlebih dahulu
    const defaultLink = document.querySelector('[data-target="admin-profile"]'); // Menambahkan logika untuk default link
    if (defaultLink) {
        defaultLink.classList.add('active'); // Menambahkan kelas 'active' ke link default
        document.getElementById('admin-profile').classList.remove('hidden');  // Menampilkan Profil Admin
    }
});
