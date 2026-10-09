const lightbox = GLightbox({
    selector: '.glightbox'
});

let activeGallery = null;


/* ВАЖНО:
   true в конце включает capture phase.
   Благодаря этому мы узнаём галерею ДО того,
   как GLightbox обработает клик.
*/
document.addEventListener('click', function (event) {
    const link = event.target.closest('.glightbox');

    if (!link) return;

    activeGallery = link.dataset.gallery || null;
}, true);


function removeGalleryThumbnails() {
    const existing = document.querySelector('.gallery-thumbnails');

    if (existing) {
        existing.remove();
    }
}


function createGalleryThumbnails() {
    removeGalleryThumbnails();

    if (!activeGallery) return;

    const items = Array.from(
        document.querySelectorAll(
            `.glightbox[data-gallery="${activeGallery}"]`
        )
    );

    if (items.length <= 1) return;

    const lightboxBody = document.querySelector('#glightbox-body');

    if (!lightboxBody) return;

    const strip = document.createElement('div');
    strip.className = 'gallery-thumbnails';


    items.forEach((item, index) => {
        const button = document.createElement('button');

        button.type = 'button';
        button.className = 'gallery-thumbnail';
        button.dataset.index = index;


        /* Берём thumbnail прямо из картинки на странице */
        const sourceImage = item.querySelector('img');

        if (sourceImage) {
            const image = document.createElement('img');

            image.src = sourceImage.src;
            image.alt = sourceImage.alt || '';

            button.appendChild(image);
        }


        /* Значок play для YouTube */
        if (item.dataset.type === 'video') {
            button.classList.add('gallery-thumbnail-video');

            const play = document.createElement('span');
            play.className = 'gallery-thumbnail-play';
            play.textContent = '▶';

            button.appendChild(play);
        }


        button.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopPropagation();

            lightbox.goToSlide(index);
            updateActiveThumbnail(index);
        });


        strip.appendChild(button);
    });


    lightboxBody.appendChild(strip);

    updateActiveThumbnail(
        lightbox.getActiveSlideIndex()
    );
}


function updateActiveThumbnail(index) {
    const thumbnails = document.querySelectorAll(
        '.gallery-thumbnail'
    );

    thumbnails.forEach((thumbnail, i) => {
        thumbnail.classList.toggle(
            'active',
            i === index
        );
    });

    const active = document.querySelector(
        '.gallery-thumbnail.active'
    );

    if (active) {
        active.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'center'
        });
    }
}


lightbox.on('open', function () {
    /*
       DOM самого GLightbox уже создаётся,
       но даём ему один кадр закончить построение.
    */
    requestAnimationFrame(function () {
        createGalleryThumbnails();
    });
});


lightbox.on('slide_changed', function ({ current }) {
    if (!current) return;

    updateActiveThumbnail(
        current.slideIndex
    );
});


lightbox.on('close', function () {
    removeGalleryThumbnails();
    activeGallery = null;
});