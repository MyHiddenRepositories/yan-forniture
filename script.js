document.addEventListener('DOMContentLoaded', () => {
    const track = document.querySelector('.carousel-track');
    const dotsContainer = document.querySelector('.carousel-dots');
    const prevBtn = document.querySelector('.carousel-btn-prev');
    const nextBtn = document.querySelector('.carousel-btn-next');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = lightbox.querySelector('.lightbox-img');
    const lightboxClose = lightbox.querySelector('.lightbox-close');
    const lightboxPrev = lightbox.querySelector('.lightbox-btn-prev');
    const lightboxNext = lightbox.querySelector('.lightbox-btn-next');
    let allImages = [];
    let lightboxIndex = 0;
    let current = 0;
    let slides = [];
    let dots = [];
    let autoplayTimer;

    // Load images from images.json
    fetch('images.json')
        .then(res => res.json())
        .then(images => {
            allImages = images;
            const total = images.length;

            // Build slides
            images.forEach((img, i) => {
                const slide = document.createElement('div');
                slide.className = 'carousel-slide' + (i === 0 ? ' active' : '');
                slide.setAttribute('role', 'group');
                slide.setAttribute('aria-roledescription', 'slide');
                slide.setAttribute('aria-label', `${i + 1} / ${total}`);

                const image = document.createElement('img');
                image.src = img.src;
                image.alt = img.alt || 'YAN Furniture';
                image.loading = i === 0 ? 'eager' : 'lazy';
                image.width = 1200;
                image.height = 800;
                image.addEventListener('click', () => openLightbox(i));

                slide.appendChild(image);
                track.appendChild(slide);
            });

            // Build dots
            images.forEach((_, i) => {
                const dot = document.createElement('button');
                dot.className = 'dot' + (i === 0 ? ' active' : '');
                dot.setAttribute('role', 'tab');
                dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
                dot.setAttribute('aria-label', `${i + 1}`);
                dot.dataset.index = i;
                dot.addEventListener('click', () => {
                    goTo(i);
                    resetAutoplay();
                });
                dotsContainer.appendChild(dot);
            });

            slides = document.querySelectorAll('.carousel-slide');
            dots = document.querySelectorAll('.dot');

            startAutoplay();
        });

    function goTo(index) {
        if (slides.length === 0) return;
        if (index < 0) index = slides.length - 1;
        if (index >= slides.length) index = 0;
        current = index;
        track.style.transform = `translateX(-${current * 100}%)`;
        dots.forEach((d, i) => {
            d.classList.toggle('active', i === current);
            d.setAttribute('aria-selected', i === current ? 'true' : 'false');
        });
    }

    prevBtn.addEventListener('click', () => {
        goTo(current - 1);
        resetAutoplay();
    });

    nextBtn.addEventListener('click', () => {
        goTo(current + 1);
        resetAutoplay();
    });

    // Touch / swipe support
    let startX = 0;
    let isDragging = false;

    track.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        isDragging = true;
    }, { passive: true });

    track.addEventListener('touchend', (e) => {
        if (!isDragging) return;
        const diff = startX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) {
            diff > 0 ? goTo(current + 1) : goTo(current - 1);
            resetAutoplay();
        }
        isDragging = false;
    }, { passive: true });

    // Autoplay
    function startAutoplay() {
        autoplayTimer = setInterval(() => goTo(current + 1), 4000);
    }

    function resetAutoplay() {
        clearInterval(autoplayTimer);
        startAutoplay();
    }

    // Lightbox
    function openLightbox(index) {
        lightboxIndex = index;
        updateLightbox();
        lightbox.hidden = false;
        document.body.classList.add('lightbox-open');
        clearInterval(autoplayTimer);
    }

    function updateLightbox() {
        const img = allImages[lightboxIndex];
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt || 'YAN Furniture';
    }

    function lightboxGoTo(index) {
        if (allImages.length === 0) return;
        if (index < 0) index = allImages.length - 1;
        if (index >= allImages.length) index = 0;
        lightboxIndex = index;
        updateLightbox();
        goTo(index);
    }

    function closeLightbox() {
        lightbox.hidden = true;
        lightboxImg.src = '';
        document.body.classList.remove('lightbox-open');
        startAutoplay();
    }

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });
    lightboxClose.addEventListener('click', closeLightbox);
    lightboxPrev.addEventListener('click', (e) => {
        e.stopPropagation();
        lightboxGoTo(lightboxIndex - 1);
    });
    lightboxNext.addEventListener('click', (e) => {
        e.stopPropagation();
        lightboxGoTo(lightboxIndex + 1);
    });
    document.addEventListener('keydown', (e) => {
        if (lightbox.hidden) return;
        if (e.key === 'Escape') closeLightbox();
        else if (e.key === 'ArrowLeft') lightboxGoTo(lightboxIndex - 1);
        else if (e.key === 'ArrowRight') lightboxGoTo(lightboxIndex + 1);
    });

    // Swipe support for lightbox
    let lbStartX = 0;
    let lbDragging = false;
    lightboxImg.addEventListener('touchstart', (e) => {
        lbStartX = e.touches[0].clientX;
        lbDragging = true;
    }, { passive: true });
    lightboxImg.addEventListener('touchend', (e) => {
        if (!lbDragging) return;
        const diff = lbStartX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) {
            diff > 0 ? lightboxGoTo(lightboxIndex + 1) : lightboxGoTo(lightboxIndex - 1);
        }
        lbDragging = false;
    }, { passive: true });
});
