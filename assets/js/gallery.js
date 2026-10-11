const lightbox = GLightbox({
    selector: '.glightbox'
});

let currentGalleryName = null;
let openedTrigger = null;


/* =========================
   REMEMBER CLICKED ITEM
   ========================= */

/*
 * Запоминаем конкретную картинку, по которой нажал пользователь.
 * pointerdown происходит раньше, чем GLightbox откроется.
 */
document.addEventListener('pointerdown', function (event) {
    const trigger = event.target.closest('.glightbox');

    if (!trigger) return;

    openedTrigger = trigger;
}, true);


/* =========================
   CREATE THUMBNAILS
   ========================= */

function createGalleryThumbnails(trigger) {
    if (!trigger) return;

    const galleryName = trigger.dataset.gallery;

    if (!galleryName) return;

    /*
     * Если thumbnails этой галереи уже существуют,
     * заново ничего не строим.
     */
    if (
        currentGalleryName === galleryName &&
        document.querySelector('.gallery-thumbnails')
    ) {
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


        /* Play icon для видео */
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


    document.body.appendChild(strip);
}


/* =========================
   ACTIVE THUMBNAIL
   ========================= */

function updateActiveThumbnailByTrigger(trigger) {
    if (!trigger || !currentGalleryName) return;

    const items = Array.from(
        document.querySelectorAll(
            `.glightbox[data-gallery="${currentGalleryName}"]`
        )
    );

    const localIndex = items.indexOf(trigger);

    if (localIndex === -1) return;

    const thumbnails = document.querySelectorAll(
        '.gallery-thumbnail'
    );

    thumbnails.forEach((thumbnail, index) => {
        thumbnail.classList.toggle(
            'active',
            index === localIndex
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
   OPEN
   ========================= */

/*
 * При открытии используем именно тот элемент,
 * по которому пользователь кликнул.
 */
lightbox.on('open', function () {
    if (!openedTrigger) return;

    createGalleryThumbnails(openedTrigger);
    updateActiveThumbnailByTrigger(openedTrigger);
});


/* =========================
   SLIDE CHANGED
   ========================= */

/*
 * Только slide_changed имеет право менять
 * активную миниатюру.
 *
 * slide_after_load здесь намеренно НЕ используется,
 * потому что GLightbox предзагружает соседние слайды.
 */
lightbox.on('slide_changed', function ({ current }) {
    if (!current || !current.trigger) return;

    updateActiveThumbnailByTrigger(
        current.trigger
    );
});


/* =========================
   INSTANT CLOSE
   ========================= */

/*
 * Убираем thumbnails сразу при клике на крестик,
 * не дожидаясь завершения close-анимации GLightbox.
 */
document.addEventListener('pointerdown', function (event) {
    if (event.target.closest('.gclose')) {
        removeGalleryThumbnails();
        currentGalleryName = null;
        openedTrigger = null;
    }
}, true);


/*
 * То же самое для Escape.
 */
document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
        removeGalleryThumbnails();
        currentGalleryName = null;
        openedTrigger = null;
    }
});


/*
 * Страховка:
 * после полного закрытия GLightbox всё равно чистим состояние.
 */
lightbox.on('close', function () {
    removeGalleryThumbnails();

    currentGalleryName = null;
    openedTrigger = null;
});