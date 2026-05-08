/**
 * carousel.js — Infinite carousel with preloaded images
 * Prevents blank slides by proactively caching and replacing lazy images.
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
    const extendedItems = [items[totalItems - 1], ...items, items[0]];

    let currentIndex = 1;
    let isTransitioning = false;
    let autoScrollTimer = null;
    let isPaused = false;

    // STEP 1: Preload all image data into the browser's HTTP cache
    function preloadImages() {
        return Promise.all(
            items.map((item) => {
                if (!item.image) return Promise.resolve();
                return new Promise((resolve) => {
                    const img = new Image();
                    img.src = item.image;
                    img.onload = resolve;
                    img.onerror = resolve;
                });
            }),
        );
    }

    // STEP 2: Build the carousel with fresh, eager-loading image elements
    function buildCarousel() {
        const track = document.createElement('div');
        track.className = 'carousel__track';

        extendedItems.forEach((item) => {
            const slide = document.createElement('div');
            slide.className = 'carousel__slide';
            const card = cardFactory(item);

            // CRITICAL FIX: Replace any lazy-loaded images with fresh eager elements.
            // This completely bypasses the browser bug where native lazy images
            // inside translate3d containers refuse to render until scrolled to center.
            const images = card.querySelectorAll('img');
            images.forEach((img) => {
                const parent = img.parentNode;
                const newImg = document.createElement('img');

                // Copy attributes except 'loading'
                for (const attr of img.attributes) {
                    if (attr.name !== 'loading') {
                        newImg.setAttribute(attr.name, attr.value);
                    }
                }

                // Set eager loading BEFORE appending to any DOM
                newImg.loading = 'eager';
                newImg.style.opacity = '1';

                parent.replaceChild(newImg, img);
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

        // Pixel-based positioning logic
        function getVisibleCount() {
            if (window.innerWidth >= 1024) return 3;
            if (window.innerWidth >= 768) return 2;
            return 1;
        }

        function updateTrackPosition(animate = true) {
            const visibleCount = getVisibleCount();
            const containerWidth = container.clientWidth;
            const slideWidth = containerWidth / visibleCount;

            const slides = track.querySelectorAll('.carousel__slide');
            slides.forEach((s) => {
                s.style.flex = `0 0 ${slideWidth}px`;
                s.style.padding = '0 8px';
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

        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => updateTrackPosition(false), 150);
        });

        updateTrackPosition(false);
        startAutoScroll();
    }

    // Initialize: Preload first, then build
    preloadImages().then(buildCarousel);
}
