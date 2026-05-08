/**
 * carousel.js — Infinite carousel component with 4s pause
 *
 * Features:
 *   - Infinite looping (clones items at start and end)
 *   - Stops on a single item for 4 seconds, then smoothly advances
 *   - Left and right arrow navigation that doesn't overlap cards
 *   - Pauses on hover
 *   - GPU Accelerated translate3d transitions
 *   - Responsive (1 slide mobile, 2 tablet, 3 desktop)
 *
 * Usage:
 *   initCarousel(containerSelector, items, cardFactory)
 */

function initCarousel(containerSelector, items, cardFactory) {
    const container = document.querySelector(containerSelector);
    if (!container || !items || items.length === 0) {
        if (container) container.innerHTML = '<p class="empty-state">No featured items yet.</p>';
        return;
    }

    const totalItems = items.length;
    const pauseDuration = 4000; // 4 seconds pause
    const transitionSpeed = '0.5s';
    const transitionEasing = 'cubic-bezier(0.4, 0, 0.2, 1)'; // Smooth standard material curve

    // Create extended array: [Last Item] + [All Items] + [First Item]
    const extendedItems = [items[totalItems - 1], ...items, items[0]];

    let currentIndex = 1; // Start at the first real item (index 1 because of clone)
    let isTransitioning = false;
    let autoScrollTimer = null;
    let isPaused = false;

    // Build track
    const track = document.createElement('div');
    track.className = 'carousel__track';

    extendedItems.forEach((item) => {
        const slide = document.createElement('div');
        slide.className = 'carousel__slide';
        slide.appendChild(cardFactory(item));
        track.appendChild(slide);
    });

    container.appendChild(track);

    // Controls
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

    // Core logic
    function getSlideWidthPercent() {
        const width = window.innerWidth;
        if (width >= 1024) return 33.333;
        if (width >= 768) return 50;
        return 100;
    }

    function updateTrackPosition(animate = true) {
        if (animate) {
            track.style.transition = `transform ${transitionSpeed} ${transitionEasing}`;
        } else {
            track.style.transition = 'none';
        }
        const offset = currentIndex * getSlideWidthPercent();
        // Using translate3d triggers GPU acceleration for smooth rendering
        track.style.transform = `translate3d(-${offset}%, 0, 0)`;
    }

    function nextSlide() {
        if (isTransitioning) return;
        isTransitioning = true;
        currentIndex++;
        updateTrackPosition(true);
    }

    function prevSlide() {
        if (isTransitioning) return;
        isTransitioning = true;
        currentIndex--;
        updateTrackPosition(true);
    }

    // Handle infinite loop snapping
    track.addEventListener('transitionend', () => {
        isTransitioning = false;
        if (currentIndex >= totalItems + 1) {
            currentIndex = 1;
            updateTrackPosition(false);
        }
        if (currentIndex <= 0) {
            currentIndex = totalItems;
            updateTrackPosition(false);
        }
    });

    // Auto-scroll Timer
    function startAutoScroll() {
        clearTimeout(autoScrollTimer);
        if (!isPaused) {
            autoScrollTimer = setTimeout(() => {
                nextSlide();
                setTimeout(startAutoScroll, 500); // Restart timer after transition
            }, pauseDuration);
        }
    }

    function resetAutoScroll() {
        clearTimeout(autoScrollTimer);
        startAutoScroll();
    }

    // Events
    prevBtn.addEventListener('click', () => {
        prevSlide();
        resetAutoScroll();
    });
    nextBtn.addEventListener('click', () => {
        nextSlide();
        resetAutoScroll();
    });

    container.addEventListener('mouseenter', () => {
        isPaused = true;
        clearTimeout(autoScrollTimer);
    });
    container.addEventListener('mouseleave', () => {
        isPaused = false;
        startAutoScroll();
    });

    // Handle resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => updateTrackPosition(false), 150);
    });

    // Init
    updateTrackPosition(false);
    startAutoScroll();
}
