/**
 * carousel.js — Infinite carousel component with pause functionality
 *
 * Renders an infinite scrolling carousel from an array of items.
 * Each item is rendered into a card using the provided factory function.
 * Features: infinite loop, pause on hover, manual controls, responsive.
 *
 * Usage:
 *   initCarousel(containerSelector, items, cardFactory)
 *     containerSelector — CSS selector for the carousel wrapper
 *     items             — array of data objects
 *     cardFactory       — function(item) => HTMLElement
 */

function initCarousel(containerSelector, items, cardFactory) {
    const container = document.querySelector(containerSelector);
    if (!container || !items.length) {
        if (container) container.innerHTML = '<p class="empty-state">No featured items yet.</p>';
        return;
    }

    // Duplicate items for infinite effect (at least 3 sets)
    const duplicatedItems = [...items, ...items, ...items];
    let currentIndex = 0;
    let isPaused = false;
    let pauseTimeout;
    const pauseDuration = 6000; // 6 seconds pause on each item

    /* Build track */
    const track = document.createElement('div');
    track.className = 'carousel__track';

    duplicatedItems.forEach((item, index) => {
        const slide = document.createElement('div');
        slide.className = 'carousel__slide';
        slide.setAttribute('data-index', index % items.length);
        slide.appendChild(cardFactory(item));
        track.appendChild(slide);
    });

    container.appendChild(track);

    /* Controls */
    const controls = document.createElement('div');
    controls.className = 'carousel__controls';

    const prevBtn = document.createElement('button');
    prevBtn.className = 'carousel__btn carousel__btn--prev';
    prevBtn.setAttribute('aria-label', 'Previous');
    prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';

    const nextBtn = document.createElement('button');
    nextBtn.className = 'carousel__btn carousel__btn--next';
    nextBtn.setAttribute('aria-label', 'Next');
    nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';

    controls.appendChild(prevBtn);
    controls.appendChild(nextBtn);
    container.appendChild(controls);

    /* Navigation logic */
    function updateCarousel(smooth = true) {
        const slideWidth = 33.333; // percentage
        const translateX = -currentIndex * slideWidth;
        track.style.transition = smooth ? 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)' : 'none';
        track.style.transform = `translateX(${translateX}%)`;

        // Reset to middle set when reaching end/beginning for infinite effect
        if (currentIndex >= items.length * 2) {
            setTimeout(() => {
                track.style.transition = 'none';
                currentIndex = items.length;
                track.style.transform = `translateX(-${currentIndex * slideWidth}%)`;
            }, 800);
        } else if (currentIndex <= -items.length) {
            setTimeout(() => {
                track.style.transition = 'none';
                currentIndex = items.length - 1;
                track.style.transform = `translateX(-${currentIndex * slideWidth}%)`;
            }, 800);
        }
    }

    function nextSlide() {
        if (!isPaused) {
            currentIndex++;
            updateCarousel();
            schedulePause();
        }
    }

    function prevSlide() {
        if (!isPaused) {
            currentIndex--;
            updateCarousel();
            schedulePause();
        }
    }

    function schedulePause() {
        clearTimeout(pauseTimeout);
        isPaused = true;
        track.classList.add('carousel__track--paused');

        pauseTimeout = setTimeout(() => {
            isPaused = false;
            track.classList.remove('carousel__track--paused');
        }, pauseDuration);
    }

    function startAutoScroll() {
        setInterval(nextSlide, pauseDuration + 800); // pause + transition time
    }

    /* Event listeners */
    prevBtn.addEventListener('click', () => {
        clearTimeout(pauseTimeout);
        prevSlide();
    });

    nextBtn.addEventListener('click', () => {
        clearTimeout(pauseTimeout);
        nextSlide();
    });

    // Pause on hover
    container.addEventListener('mouseenter', () => {
        clearTimeout(pauseTimeout);
        isPaused = true;
        track.classList.add('carousel__track--paused');
    });

    container.addEventListener('mouseleave', () => {
        isPaused = false;
        track.classList.remove('carousel__track--paused');
        schedulePause();
    });

    /* Handle resize */
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            updateCarousel(false); // Instant update on resize
        }, 150);
    });

    /* Initial setup */
    updateCarousel(false);
    schedulePause();
    startAutoScroll();
}
