/**
 * carousel.js — Infinite carousel with symmetric peeks and deep buffer
 * Prevents blank slides by maintaining a 2-item clone buffer and
 * enforcing eager image rendering.
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

    // Deep buffer: 2 clones at each end to prevent browser un-rendering off-screen items
    const extendedItems = [items[totalItems - 2], items[totalItems - 1], ...items, items[0], items[1]];

    let currentIndex = 2; // Start at the first real item
    let isTransitioning = false;
    let autoScrollTimer = null;
    let isPaused = false;

    const track = document.createElement('div');
    track.className = 'carousel__track';

    extendedItems.forEach((item) => {
        const slide = document.createElement('div');
        slide.className = 'carousel__slide';
        const card = cardFactory(item);

        // CRITICAL FIX: The cardFactory generates images with loading="lazy".
        // Browsers refuse to paint lazy-loaded images inside translate3d off-screen.
        // We must remove 'lazy' and enforce 'eager' to fix the blank carousel issue.
        card.querySelectorAll('img').forEach((img) => {
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

    // Symmetric peek logic
    function getCarouselLayout() {
        const width = window.innerWidth;
        // Subtract horizontal padding of the container (56px * 2 on desktop, 30px * 2 on mobile)
        const containerPadding = width >= 768 ? 112 : 60;
        const trackWidth = container.clientWidth - containerPadding;

        if (width >= 1024) {
            // Desktop: 3 full cards + 2 peeks
            const peek = 40;
            const slideWidth = (trackWidth - 2 * peek) / 3;
            return { fullCards: 3, peek, slideWidth };
        } else if (width >= 768) {
            // Tablet: 1 full card + 2 peeks
            const peek = 30;
            const slideWidth = (trackWidth - 2 * peek) / 1;
            return { fullCards: 1, peek, slideWidth };
        } else {
            // Mobile: 1 full card + 2 small peeks
            const peek = 16;
            const slideWidth = (trackWidth - 2 * peek) / 1;
            return { fullCards: 1, peek, slideWidth };
        }
    }

    function updateTrackPosition(animate = true) {
        const { fullCards, peek, slideWidth } = getCarouselLayout();

        const slides = track.querySelectorAll('.carousel__slide');
        slides.forEach((s) => {
            s.style.flex = `0 0 ${slideWidth}px`;
            s.style.padding = '0 8px'; // Gap
            s.style.boxSizing = 'border-box';
        });

        // General formula to center the currentIndex card symmetrically
        // offset = (currentIndex - (fullCards - 1) / 2) * slideWidth - peek
        const offset = (currentIndex - (fullCards - 1) / 2) * slideWidth - peek;

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
        // Snap logic for 2-item buffer
        if (currentIndex >= totalItems + 2) {
            currentIndex -= totalItems;
            updateTrackPosition(false);
        }
        if (currentIndex <= 1) {
            currentIndex += totalItems;
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

    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => updateTrackPosition(false), 150);
    });

    updateTrackPosition(false);
    startAutoScroll();
}
