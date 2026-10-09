const lightbox = GLightbox({
    selector: '.glightbox'
});

let activeGallery = null;

/* Запоминаем, какую именно галерею открыл пользователь */
document.addEventListener('click', function (event) {
    const link = event.target.closest('.glightbox');

    if (!link) return;

    activeGallery = link.dataset.gallery || null;
});

/* Создаём полосу миниатюр */
function createGalleryThumbnails() {
    const oldStrip = document.querySelector('.gallery-thumbnails');

    if (oldStrip) {
        oldStrip.remove();
    }

    if (!activeGallery) return;

    const items = Array.from(
        document.querySelectorAll(
            `.glightbox[data-gallery="${activeGallery}"]`
        )
    );

    if (items.length <= 1) return;

    const container = document.querySelector('.gcontainer');

    if (!container) return;

    const strip = document.createElement('div');
    strip.className = 'gallery-thumbnails';

    items.forEach((item, index) => {
        const thumb = document.createElement('button');
        thumb.className = 'gallery-thumbnail';
        thumb.type = 'button';

        const sourceImage = item.querySelector('img');

        if (sourceImage) {
            const image = document.createElement('img');

            image.src = sourceImage.src;
            image.alt = sourceImage.alt || '';

            thumb.appendChild(image);
        }

        /* Для YouTube-видео добавляем значок Play */
        if (item.dataset.type === 'video') {
            thumb.classList.add('gallery-thumbnail-video');

            const play = document.createElement('span');
            play.className = 'gallery-thumbnail-play';
            play.textContent = '▶';

            thumb.appendChild(play);
        }

        thumb.addEventListener('click', function () {
            lightbox.goToSlide(index);
        });

        strip.appendChild(thumb);
    });

    container.appendChild(strip);
}

/* После открытия GLightbox создаём thumbnails */
lightbox.on('open', function () {
    createGalleryThumbnails();
});

/* После закрытия чистим их */
lightbox.on('close', function () {
    const strip = document.querySelector('.gallery-thumbnails');

    if (strip) {
        strip.remove();
    }

    activeGallery = null;
});
