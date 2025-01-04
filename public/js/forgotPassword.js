document.getElementById('forgotPasswordForm').addEventListener('submit', async function (e) {
    e.preventDefault(); // Mencegah reload halaman
    const email = document.getElementById('email').value;
    const nik = document.getElementById('nik').value;

    const response = await fetch('/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, nik })
    });

    const result = await response.json();
    const message = document.getElementById('message');

    if (response.ok) {
        message.textContent = result.message;
        window.location.href = 'reset-password.html'; // Arahkan ke halaman reset password
    } else {
        message.textContent = result.error || 'Terjadi kesalahan. Silakan coba lagi.';
    }
});
