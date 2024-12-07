// Mengambil data kelas dari API dan menampilkannya dalam tabel
function loadMatpelData() {
    fetch('/api/mata-pelajaran')
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        const tbody = document.getElementById('mata-pelajaran-tbody');
        tbody.innerHTML = ''; // Kosongkan tabel sebelum diisi
        data.forEach(matpel => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${matpel.id_mata_pelajaran}</td>
                <td>${matpel.nama_matpel}</td>
                <td>${matpel.nip}</td>
                <td>${matpel.id_tahun_ajaran}</td>
                <td>
                    <button onclick="editMatpel(${matpel.id})">Edit</button>
                    <button onclick="deleteMatpel(${matpel.id})">Delete</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    })
    .catch(error => {
        console.error('Error:', error);
    });

}

// Memanggil fungsi untuk load data kelas saat halaman dimuat
document.addEventListener('DOMContentLoaded', loadMatpelData);
