function fetchTahunAjaran() {
    fetch('/api/tahun-ajaran')
        .then(response => response.json())
        .then(data => {
            renderTahunAjaran(data);
        })
        .catch(error => {
            console.error("Error fetching Tahun Ajaran data:", error);
        });
}

function renderTahunAjaran(data) {
    const tbody = document.getElementById("tahun-ajaran-tbody");
    tbody.innerHTML = "";

    data.forEach(item => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${item.nama_tahun_ajaran}</td>
            <td>${formatDate(item.tanggal_mulai)}</td>
            <td>${formatDate(item.tanggal_selesai)}</td>
            <td>${item.semester}</td>
        `;
        tbody.appendChild(tr);
    });

    
}

document.addEventListener('DOMContentLoaded', () => {
    fetchTahunAjaran();
});


document.getElementById('search-year-input').addEventListener('input', function () {
    const searchQuery = this.value.toLowerCase();
    const rows = document.querySelectorAll('#tahun-ajaran-tbody tr');

    rows.forEach(row => {
        const nameCell = row.cells[1].textContent.toLowerCase();
        const startCell = row.cells[0].textContent.toLowerCase();

        if (nameCell.includes(searchQuery) || startCell.includes(searchQuery)) {
            row.style.display = ''; // Tampilkan baris
        } else {
            row.style.display = 'none'; // Sembunyikan baris
        }
    });
});

fetchTahunAjaran();

