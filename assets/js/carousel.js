/**
 * carousel.js — Horizontal carousel component
 *
 * Renders a scrollable carousel from an array of items.
 * Each item is rendered into a card using the provided factory function.
 *
 * Usage:
 *   initCarousel(containerSelector, items, cardFactory, perSlide)
 *     containerSelector — CSS selector for the carousel wrapper
 *     items             — array of data objects
 *     cardFactory       — function(item) => HTMLElement
 *     perSlide          — items visible per slide (default 3)
 */

function initCarousel(containerSelector, items, cardFactory, perSlide = 3) {
    const container = document.querySelector(containerSelector);
    if (!container || !items.length) {
        if (container) container.innerHTML = '<p class="empty-state">No featured items yet.</p>';
        return;
    }

    let currentIndex = 0;

    /* Build track */
    const wrapper = document.createElement('div');
    wrapper.className = 'carousel__track-wrapper';

    const track = document.createElement('div');
    track.className = 'carousel__track';

    items.forEach((item) => {
        const slide = document.createElement('div');
        slide.className = 'carousel__slide';
        slide.appendChild(cardFactory(item));
        track.appendChild(slide);
    });

    wrapper.appendChild(track);
    container.appendChild(wrapper);

    /* Controls */
    const controls = document.createElement('div');
    controls.className = 'carousel__controls';

    const prevBtn = document.createElement('button');
    prevBtn.className = 'carousel__btn';
    prevBtn.setAttribute('aria-label', 'Previous');
    prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';

    const nextBtn = document.createElement('button');
    nextBtn.className = 'carousel__btn';
    nextBtn.setAttribute('aria-label', 'Next');
    nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';

    controls.appendChild(prevBtn);
    controls.appendChild(nextBtn);
    container.appendChild(controls);

    /* Navigation logic */
    function getMaxIndex() {
        return Math.max(0, items.length - perSlide);
    }

    function updateCarousel() {
        /* Calculate offset as percentage-based slide width */
        const gap = 24; /* matches --space-lg in px approx */
        const slideEl = track.querySelector('.carousel__slide');
        if (!slideEl) return;
        const slideWidth = slideEl.offsetWidth + gap;
        track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;

        prevBtn.disabled = currentIndex === 0;
        nextBtn.disabled = currentIndex >= getMaxIndex();
    }

    prevBtn.addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex--;
            updateCarousel();
        }
    });

    nextBtn.addEventListener('click', () => {
        if (currentIndex < getMaxIndex()) {
            currentIndex++;
            updateCarousel();
        }
    });

    /* Handle resize — recalculate positions */
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            /* Recalculate perSlide based on viewport */
            perSlide = getPerSlide();
            if (currentIndex > getMaxIndex()) currentIndex = getMaxIndex();
            updateCarousel();
        }, 150);
    });

    function getPerSlide() {
        const w = window.innerWidth;
        if (w <= 768) return 1;
        if (w <= 1024) return 2;
        return 3;
    }

    /* Initial */
    perSlide = getPerSlide();
    updateCarousel();
}
