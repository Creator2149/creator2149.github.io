/**
 * carousel.js — Infinite carousel component with 6s pause
 *
 * Features:
 *   - Infinite looping (clones items at start and end)
 *   - Stops on a single item for 6 seconds, then smoothly advances
 *   - Left and right arrow navigation
 *   - Pauses on hover
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

    // Number of items in the original array
    const totalItems = items.length;
    const pauseDuration = 6000; // 6 seconds pause
    const transitionSpeed = '0.65s'; // Smooth transition duration
    const transitionEasing = 'cubic-bezier(0.25, 1, 0.5, 1)';

    // Create extended array: [Last Item] + [All Items] + [First Item]
    // This provides enough buffer for smooth infinite scrolling 1 step at a time
    const extendedItems = [items[totalItems - 1], ...items, items[0]];

    let currentIndex = 1; // Start at the first real item (index 1 because of clone)
    let isTransitioning = false;
    let autoScrollTimer = null;
    let isPaused = false;

    // Build track
    const track = document.createElement('div');
    track.className = 'carousel__track';

    extendedItems.forEach((item, index) => {
        const slide = document.createElement('div');
        slide.className = 'carousel__slide';
        slide.appendChild(cardFactory(item));
        track.appendChild(slide);
    });

    container.appendChild(track);

    // Controls (Left and Right Arrows)
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

    // Core navigation logic
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
        track.style.transform = `translateX(-${offset}%)`;
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

    // Handle infinite loop snapping (when hitting clones)
    track.addEventListener('transitionend', () => {
        isTransitioning = false;
        // If we've slid past the last real item to the clone
        if (currentIndex >= totalItems + 1) {
            currentIndex = 1;
            updateTrackPosition(false);
        }
        // If we've slid before the first real item to the clone
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
                // Restart timer after transition finishes
                setTimeout(startAutoScroll, 650);
            }, pauseDuration);
        }
    }

    function resetAutoScroll() {
        clearTimeout(autoScrollTimer);
        startAutoScroll();
    }

    // Event Listeners
    prevBtn.addEventListener('click', () => {
        prevSlide();
        resetAutoScroll();
    });

    nextBtn.addEventListener('click', () => {
        nextSlide();
        resetAutoScroll();
    });

    // Pause on hover
    container.addEventListener('mouseenter', () => {
        isPaused = true;
        clearTimeout(autoScrollTimer);
    });

    container.addEventListener('mouseleave', () => {
        isPaused = false;
        startAutoScroll();
    });

    // Handle resize (recalculate position instantly)
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            updateTrackPosition(false);
        }, 150);
    });

    // Initial setup
    updateTrackPosition(false);
    startAutoScroll();
}
