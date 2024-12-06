let slideIndex = 1;
showSlides(slideIndex);

let autoSlide = setInterval(() => plusSlides(1), 3000);

function plusSlides(n) {
    showSlides(slideIndex += n);
    resetAutoSlide();
}

function currentSlide(n) {
    showSlides(slideIndex = n);
    resetAutoSlide();
}

function showSlides(n) {
    let slides = document.getElementsByClassName("mySlides");
    let dots = document.getElementsByClassName("dot");

    if (n > slides.length) { slideIndex = 1; }
    if (n < 1) { slideIndex = slides.length; }

    for (let i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }

    for (let i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace(" active-dot", "");
    }

    slides[slideIndex - 1].style.display = "block";
    dots[slideIndex - 1].className += " active-dot";
}

function resetAutoSlide() {
    clearInterval(autoSlide);
    autoSlide = setInterval(() => plusSlides(1), 3000);
}

// untuk mengubah posisi header saat scroll
window.onscroll = function() {
    var header = document.querySelector('.header');
    var navigation = document.querySelector('.navigation-container');

    if (window.scrollY > 50) {
        header.style.display = 'none';
        navigation.style.top = '0';
    } else {
        header.style.display = 'block';
        navigation.style.top = '50px';
    }
};

window.addEventListener('scroll', function() {
    const nav = document.querySelector('.navigation-container');
    if (window.scrollY > 0) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }
});

const navItems = document.querySelectorAll('.nav-item');

// untuk mengatur 'active' pada elemen yang diklik
// navItems.forEach(item => {
//     item.addEventListener('click', function(event) {
//         event.preventDefault();
//         navItems.forEach(nav => nav.classList.remove('active'));
//         item.classList.add('active');
//     });
// });



// menghapus kelas 'active' saat scroll, tambahkan event scroll
window.addEventListener('scroll', function() {
    navItems.forEach(nav => nav.classList.remove('active'));
});