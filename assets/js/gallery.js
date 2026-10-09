const lightbox = GLightbox({
    selector: '.glightbox'
});

let currentGalleryName = null;


/* =========================
   CREATE THUMBNAILS
   ========================= */

function createGalleryThumbnails(trigger, activeIndex = 0) {
    if (!trigger) return;

    const galleryName = trigger.dataset.gallery;

    if (!galleryName) return;

    /*
     * Если панель уже создана именно для этой галереи,
     * повторно её не создаём.
     */
    if (
        currentGalleryName === galleryName &&
        document.querySelector('.gallery-thumbnails')
    ) {
        updateActiveThumbnail(activeIndex);
        return;
    }

    removeGalleryThumbnails();

    currentGalleryName = galleryName;

    const items = Array.from(
        document.querySelectorAll(
            `.glightbox[data-gallery="${galleryName}"]`
        )
    );

    if (items.length <= 1) return;


    const strip = document.createElement('div');

    strip.className = 'gallery-thumbnails';
    strip.dataset.gallery = galleryName;


    items.forEach((item, index) => {
        const button = document.createElement('button');

        button.type = 'button';
        button.className = 'gallery-thumbnail';


        /* Thumbnail */
        const sourceImage = item.querySelector('img');

        if (sourceImage) {
            const image = document.createElement('img');

            image.src = sourceImage.src;
            image.alt = sourceImage.alt || '';

            button.appendChild(image);
        }


        /* YouTube / video icon */
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
        });


        strip.appendChild(button);
    });


    /*
     * ВАЖНО:
     * добавляем thumbnails прямо в body.
     * Они position: fixed, поэтому им не нужно
     * находиться внутри внутренней структуры GLightbox.
     */
    document.body.appendChild(strip);

    updateActiveThumbnail(activeIndex);
}


/* =========================
   ACTIVE THUMBNAIL
   ========================= */

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


/* =========================
   REMOVE THUMBNAILS
   ========================= */

function removeGalleryThumbnails() {
    const strip = document.querySelector(
        '.gallery-thumbnails'
    );

    if (strip) {
        strip.remove();
    }
}


/* =========================
   GLIGHTBOX EVENTS
   ========================= */

/*
 * Это событие вызывается, когда конкретный слайд
 * уже реально загружен.
 *
 * GLightbox сам сообщает нам trigger —
 * исходную ссылку <a class="glightbox">.
 */
lightbox.on('slide_after_load', function (data) {
    if (!data || !data.trigger) return;

    createGalleryThumbnails(
        data.trigger,
        data.slideIndex
    );
});


/*
 * При переключении картинки обновляем
 * выделенную миниатюру.
 */
lightbox.on('slide_changed', function ({ current }) {
    if (!current) return;

    if (current.trigger) {
        createGalleryThumbnails(
            current.trigger,
            current.slideIndex
        );
    }

    updateActiveThumbnail(
        current.slideIndex
    );
});


/*
 * После закрытия удаляем панель.
 */
lightbox.on('close', function () {
    removeGalleryThumbnails();

    currentGalleryName = null;
});