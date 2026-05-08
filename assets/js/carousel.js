/**
 * carousel.js — Infinite carousel component with 4s pause
 * Preloads images to prevent blank slides on fast navigation.
 */

function initCarousel(containerSelector, items, cardFactory) {
    const container = document.querySelector(containerSelector);
    if (!container || !items || items.length === 0) {
        if (container) container.innerHTML = '<p class="empty-state">No featured items yet.</p>';
        return;
    }

    const totalItems = items.length;
    const pauseDuration = 4000;
    const transitionSpeed = '0.5s';
    const transitionEasing = 'cubic-bezier(0.4, 0, 0.2, 1)';

    // Extended array: [Last] + [All Items] + [First]
    const extendedItems = [items[totalItems - 1], ...items, items[0]];

    let currentIndex = 1;
    let isTransitioning = false;
    let autoScrollTimer = null;
    let isPaused = false;

    // FIX: Preload images into browser cache immediately to prevent blank slides
    items.forEach((item) => {
        if (item.image) {
            const img = new Image();
            img.src = item.image; // Forces the browser to fetch and cache
        }
    });

    const track = document.createElement('div');
    track.className = 'carousel__track';

    extendedItems.forEach((item) => {
        const slide = document.createElement('div');
        slide.className = 'carousel__slide';
        const card = cardFactory(item);

        // Also force remove lazy loading on DOM elements just in case
        const images = card.querySelectorAll('img');
        images.forEach((img) => {
            img.removeAttribute('loading');
            img.loading = 'eager';
            img.style.opacity = '1';
        });

        slide.appendChild(card);
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

    // Core logic - Pixel based for perfect alignment
    function getVisibleCount() {
        if (window.innerWidth >= 1024) return 3;
        if (window.innerWidth >= 768) return 2;
        return 1;
    }

    function updateTrackPosition(animate = true) {
        const visibleCount = getVisibleCount();
        const containerWidth = container.clientWidth;
        // Calculate exact pixel width for each slide based on current container size
        const slideWidth = containerWidth / visibleCount;

        const slides = track.querySelectorAll('.carousel__slide');
        slides.forEach((s) => {
            s.style.flex = `0 0 ${slideWidth}px`;
            s.style.padding = '0 8px'; // Gap between cards
            s.style.boxSizing = 'border-box';
        });

        const offset = currentIndex * slideWidth;
        if (animate) {
            track.style.transition = `transform ${transitionSpeed} ${transitionEasing}`;
        } else {
            track.style.transition = 'none';
        }
        track.style.transform = `translate3d(-${offset}px, 0, 0)`;
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

    function startAutoScroll() {
        clearTimeout(autoScrollTimer);
        if (!isPaused) {
            autoScrollTimer = setTimeout(() => {
                nextSlide();
                setTimeout(startAutoScroll, 500);
            }, pauseDuration);
        }
    }

    function resetAutoScroll() {
        clearTimeout(autoScrollTimer);
        startAutoScroll();
    }

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

    // Handle resize dynamically
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => updateTrackPosition(false), 150);
    });

    // Init
    updateTrackPosition(false);
    startAutoScroll();
}
