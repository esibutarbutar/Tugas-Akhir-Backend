
const cameraIcon = document.getElementById('camera-icon');
const fileInput = document.getElementById('file-input');
const profileImage = document.getElementById('profile-image');
const uploadForm = document.getElementById('upload-form');
const fileUploadInput = document.getElementById('file-upload');
const profileContainer = document.querySelector('.profile-container');
const dropdownMenu = document.querySelector('.dropdown-menu');

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
        const profileInitial = document.getElementById('profile-initial');
        if (profileInitial) {
            profileInitial.textContent = user.name.charAt(0).toUpperCase();
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
    hideAllSections();  
    const defaultLink = document.querySelector('[data-target="admin-profile"]'); 
    if (defaultLink) {
        defaultLink.classList.add('active'); 
        document.getElementById('admin-profile').classList.remove('hidden');  
    }
});

document.querySelectorAll(".sidebar ul li a").forEach((link) => {
    link.addEventListener("click", (e) => {
        e.preventDefault();
        const target = e.target.getAttribute("data-target");
        document.querySelectorAll(".content-section").forEach((section) => {
            section.classList.add("hidden");
        });
        document.getElementById(target).classList.remove("hidden");
    });
});

// Menghindari klik berturut-turut terlalu cepat
let isClicking = false;

profileContainer.addEventListener('click', (e) => {
    if (isClicking) return;
    isClicking = true;
    setTimeout(() => { isClicking = false; }, 200);
    
    e.stopPropagation();
    profileContainer.classList.toggle('active');
    
    if (dropdownMenu) {
        dropdownMenu.style.display = profileContainer.classList.contains('active') ? 'block' : 'none';
    }
});

// Logika untuk "Lihat Foto"
document.getElementById('view-photo').addEventListener('click', (e) => {
    e.preventDefault();  // Mencegah tindakan default
    console.log('Lihat Foto diklik');
    
    const profileImage = document.getElementById('profile-image');
    const imageUrl = profileImage ? profileImage.src : null;

    console.log('URL gambar: ', imageUrl);  // Menampilkan URL gambar

    if (imageUrl) {
        window.open(imageUrl, '_blank');  // Membuka gambar di tab baru
    } else {
        alert('Gambar profil tidak ditemukan!');
    }
});

// Memuat foto profil atau inisial dari Local Storage saat halaman di-refresh
document.addEventListener('DOMContentLoaded', () => {
    const userId = getCurrentUserId(); // Mendapatkan ID pengguna yang sedang login
    const savedImage = localStorage.getItem(`profileImage_${userId}`);
    const profileImage = document.getElementById('profile-image');

    if (savedImage) {
        // Jika ada gambar yang tersimpan di LocalStorage, tampilkan
        profileImage.src = savedImage;
        profileImage.style.display = 'block'; 
    } else {
        // Jika tidak ada gambar, sembunyikan gambar profil dan buat inisial
        profileImage.style.display = 'none';
    }
});

// Logika untuk "Unggah Foto"
document.getElementById('browse-photo').addEventListener('click', (e) => {
    e.preventDefault(); // Mencegah aksi default link (misalnya, navigasi)

    // Buat input file secara dinamis
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*'; // Batasi hanya untuk gambar

    // Ketika file dipilih
    fileInput.onchange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const imageSrc = e.target.result; // Ambil URL gambar dari file yang dipilih
                const profileImage = document.getElementById('profile-image');
                profileImage.src = imageSrc;  // Update gambar profil dengan gambar yang baru
                profileImage.style.display = 'block'; // Pastikan gambar terlihat

                // Jika Anda ingin menyimpan gambar ke LocalStorage
                const userId = getCurrentUserId();  // Ambil ID pengguna yang sedang login
                localStorage.setItem(`profileImage_${userId}`, imageSrc); // Simpan gambar ke LocalStorage

                console.log('Foto profil berhasil diubah');
            };
            reader.readAsDataURL(file); // Membaca file gambar sebagai URL data
        }
    };

    // Buka dialog pemilihan file
    fileInput.click();
});

async function getCurrentUserId() {
    try {
        const response = await fetch('/api/session');
        if (!response.ok) {
            throw new Error('Gagal mengambil data sesi.');
        }
        const sessionData = await response.json();
        return sessionData.userId; // Pastikan API mengembalikan ID pengguna di bawah properti 'userId'
    } catch (error) {
        console.error('Error mendapatkan ID pengguna:', error);
        return null; // Atau kembalikan nilai default jika terjadi error
    }
}
// Fungsi untuk menghapus foto profil
function removeProfilePhoto() {
    console.log('Hapus Foto diklik');
    
    const profileImage = document.getElementById('profile-image');
    
    // Ambil nama pengguna dari elemen di halaman
    const userName = getUserNameFromPage();
    
    // Sembunyikan gambar profil
    profileImage.style.display = 'none'; 
    
    // Hapus gambar profil dari LocalStorage
    const userId = getCurrentUserId();
    localStorage.removeItem(`profileImage_${userId}`); // Hapus gambar profil dari LocalStorage
    localStorage.setItem(`isImageDeleted_${userId}`, 'true'); // Tandai bahwa foto telah dihapus

    // Tampilkan inisial
    createInitialCircle(userName);

    console.log('Foto profil dihapus dan diganti dengan inisial');
}

// Fungsi untuk mengambil nama pengguna dari elemen yang ada di halaman
function getUserNameFromPage() {
    const userNameElement = document.getElementById('employee-name');
    return userNameElement ? userNameElement.textContent : 'T'; // Default 'T' jika elemen tidak ditemukan
}

// Fungsi untuk membuat lingkaran dengan inisial nama
function createInitialCircle(userName) {
    const initials = getInitials(userName);

    // Cek apakah lingkaran inisial sudah ada
    if (document.getElementById('initial-circle')) return;

    const profileContainer = document.querySelector('.profile-container');
    const initialCircle = document.createElement('div');
    initialCircle.id = 'initial-circle';
    initialCircle.textContent = initials; // Gunakan inisial dari nama
    initialCircle.style.cssText = `
        display: flex;
        justify-content: center;
        align-items: center;
        width: 150px;
        height: 150px;
        border-radius: 50%;
        background-color: #007bff;
        color: white;
        font-size: 48px;
        font-weight: bold;
    `;
    profileContainer.appendChild(initialCircle);
}

// Fungsi untuk mengambil inisial dari nama
function getInitials(name) {
    const nameParts = name.split(' ');
    return nameParts.map(part => part[0].toUpperCase()).join(''); // Ambil huruf pertama dari setiap kata
}

// Fungsi untuk memuat foto atau inisial saat halaman dimuat
function loadProfile() {
    const userId = getCurrentUserId(); // Mendapatkan ID pengguna yang sedang login
    const savedImage = localStorage.getItem(`profileImage_${userId}`);
    const profileImage = document.getElementById('profile-image');
    const isImageDeleted = localStorage.getItem(`isImageDeleted_${userId}`) === 'true';

    if (isImageDeleted) {
        // Jika foto telah dihapus, tampilkan inisial
        profileImage.style.display = 'none'; // Sembunyikan foto
        const userName = getUserNameFromPage(); // Ambil nama pengguna dari halaman
        createInitialCircle(userName); // Tampilkan inisial
    } else if (savedImage) {
        // Jika ada gambar yang tersimpan, tampilkan foto profil
        profileImage.src = savedImage;
        profileImage.style.display = 'block';
    } else {
        // Jika tidak ada gambar dan belum dihapus, tampilkan inisial
        profileImage.style.display = 'none';
        const userName = getUserNameFromPage(); // Ambil nama pengguna dari halaman
        createInitialCircle(userName); // Tampilkan inisial
    }
}

// Fungsi untuk mendapatkan ID pengguna (misalnya dari sesi atau API)
async function getCurrentUserId() {
    try {
        const response = await fetch('/api/session');
        if (!response.ok) {
            throw new Error('Gagal mengambil data sesi.');
        }
        const sessionData = await response.json();
        return sessionData.userId; // Pastikan API mengembalikan ID pengguna
    } catch (error) {
        console.error('Error mendapatkan ID pengguna:', error);
        return null; // Atau kembalikan nilai default jika terjadi error
    }
}

// Inisialisasi fungsi saat halaman dimuat
loadProfile();

// Menangani klik tombol "Hapus Foto Profil" secara langsung
document.getElementById('remove-photo').addEventListener('click', (e) => {
    e.preventDefault();
    removeProfilePhoto(); // Panggil fungsi untuk menghapus foto
});

document.addEventListener('click', (e) => {
    if (!profileContainer.contains(e.target)) {
        profileContainer.classList.remove('active');
        if (dropdownMenu) {
            dropdownMenu.style.display = 'none';
        }
    }
});
