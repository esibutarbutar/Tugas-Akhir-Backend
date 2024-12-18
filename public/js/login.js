// Mendapatkan elemen-elemen yang diperlukan
const pegawaiBtn = document.getElementById("pegawai-btn");
const siswaBtn = document.getElementById("siswa-btn");
const loginForm = document.getElementById("login-form");
const buttonGroup = document.getElementById("button-group");
const backButton = document.querySelector(".back-button");
const roleText = document.getElementById("role-text"); // Elemen untuk menampilkan role (Siswa/Pegawai)

loginForm.addEventListener("submit", function(event) {
    event.preventDefault();  // Mencegah form dikirim secara default

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const login_sebagai = document.getElementById("login_sebagai").value;

    // Mengirim data login ke server dengan fetch
    fetch('/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: username,
            password: password,
            login_sebagai: login_sebagai
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === 'Login berhasil') {
            const user = data.user;

            // Tampilkan SweetAlert
            Swal.fire({
                title: 'Selamat Datang!',
                text: `Selamat datang, ${user.name}!`,
                icon: 'success',
                confirmButtonText: 'Lanjutkan',
                confirmButtonColor: '#004D40'
            }).then(() => {
                // Redirect setelah menutup SweetAlert
                if (user.role === 'admin') {
                    window.location.href = '/dashboard-admin';  // Redirect to admin dashboard
                } else {
                    window.location.href = '/dashboard';  // Redirect to general dashboard
                }
            });
        } else {
            // SweetAlert untuk login gagal
            Swal.fire({
                title: 'Login Gagal!',
                text: data.message,
                icon: 'error',
                confirmButtonText: 'Coba Lagi',
                confirmButtonColor: '#FF0000' 
            });
        }
    })
    .catch(error => {
        console.error('Error:', error);

        // SweetAlert untuk error sistem
        Swal.fire({
            title: 'Terjadi Kesalahan!',
            text: 'Tidak dapat terhubung ke server.',
            icon: 'error',
            confirmButtonText: 'Coba Lagi'
        });
    });
});


pegawaiBtn.addEventListener("click", function() {
    roleText.textContent = "Pegawai"; 
    document.getElementById('login_sebagai').value = 'Pegawai';  
    loginForm.style.display = "block";  
    buttonGroup.style.display = "none"; 
});

siswaBtn.addEventListener("click", function() {
    roleText.textContent = "Siswa"; 
    document.getElementById('login_sebagai').value = 'Siswa';  
    loginForm.style.display = "block";  
    buttonGroup.style.display = "none"; 
});


backButton.addEventListener("click", function() {
    loginForm.style.display = "none"; 
    buttonGroup.style.display = "flex"; 
});
