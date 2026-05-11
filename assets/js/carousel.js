/**
 * carousel.js — Lightweight carousel system
 * 
 * Features:
 * - Touch/swipe support
 * - Keyboard navigation
 * - Dot indicators
 * - Responsive
 * - Smooth transitions
 */

(function () {
  'use strict';

  class Carousel {
    constructor(container, options = {}) {
      this.container = container;
      this.track = container.querySelector('.carousel__track');
      this.slides = container.querySelectorAll('.carousel__slide');
      this.prevBtn = container.querySelector('.carousel__btn--prev');
      this.nextBtn = container.querySelector('.carousel__btn--next');
      this.dotsContainer = container.querySelector('.carousel__dots');

      this.currentIndex = 0;
      this.totalSlides = this.slides.length;
      this.isAnimating = false;
      this.autoPlay = options.autoPlay || false;
      this.autoPlayInterval = options.autoPlayInterval || 5000;
      this.autoPlayTimer = null;

      // Touch support
      this.touchStartX = 0;
      this.touchEndX = 0;
      this.minSwipeDistance = 50;

      if (this.totalSlides === 0) return;

      this.init();
    }

    init() {
      // Create dots if container exists
      if (this.dotsContainer) {
        this.createDots();
      }

      // Button listeners
      if (this.prevBtn) {
        this.prevBtn.addEventListener('click', () => this.prev());
      }
      if (this.nextBtn) {
        this.nextBtn.addEventListener('click', () => this.next());
      }

      // Touch listeners
      this.container.addEventListener('touchstart', (e) => {
        this.touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });

      this.container.addEventListener('touchend', (e) => {
        this.touchEndX = e.changedTouches[0].screenX;
        this.handleSwipe();
      }, { passive: true });

      // Keyboard navigation
      this.container.setAttribute('tabindex', '0');
      this.container.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') this.prev();
        else if (e.key === 'ArrowRight') this.next();
      });

      // Auto play
      if (this.autoPlay) {
        this.startAutoPlay();
        this.container.addEventListener('mouseenter', () => this.stopAutoPlay());
        this.container.addEventListener('mouseleave', () => this.startAutoPlay());
      }

      // Initial state
      this.goTo(0, false);
    }

    createDots() {
      this.dotsContainer.innerHTML = '';
      for (let i = 0; i < this.totalSlides; i++) {
        const dot = document.createElement('button');
        dot.className = 'carousel__dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
        dot.addEventListener('click', () => this.goTo(i));
        this.dotsContainer.appendChild(dot);
      }
    }

    goTo(index, animate = true) {
      if (this.isAnimating || index === this.currentIndex) return;
      if (index < 0) index = this.totalSlides - 1;
      if (index >= this.totalSlides) index = 0;

      this.isAnimating = true;
      this.currentIndex = index;

      if (this.track) {
        this.track.style.transition = animate ? 'transform 0.4s ease' : 'none';
        this.track.style.transform = `translateX(-${index * 100}%)`;
      }

      // Update dots
      if (this.dotsContainer) {
        const dots = this.dotsContainer.querySelectorAll('.carousel__dot');
        dots.forEach((dot, i) => {
          dot.classList.toggle('active', i === index);
        });
      }

      // Update buttons
      if (this.prevBtn) this.prevBtn.disabled = index === 0;
      if (this.nextBtn) this.nextBtn.disabled = index === this.totalSlides - 1;

      setTimeout(() => {
        this.isAnimating = false;
      }, animate ? 400 : 0);
    }

    next() {
      this.goTo(this.currentIndex + 1);
    }

    prev() {
      this.goTo(this.currentIndex - 1);
    }

    handleSwipe() {
      const distance = this.touchStartX - this.touchEndX;
      if (Math.abs(distance) > this.minSwipeDistance) {
        if (distance > 0) this.next();
        else this.prev();
      }
    }

    startAutoPlay() {
      this.stopAutoPlay();
      this.autoPlayTimer = setInterval(() => this.next(), this.autoPlayInterval);
    }

    stopAutoPlay() {
      if (this.autoPlayTimer) {
        clearInterval(this.autoPlayTimer);
        this.autoPlayTimer = null;
      }
    }

    destroy() {
      this.stopAutoPlay();
    }
  }

  // Auto-initialize carousels
  function initCarousels() {
    const carousels = document.querySelectorAll('.carousel');
    const instances = [];

    carousels.forEach(container => {
      instances.push(new Carousel(container));
    });

    return instances;
  }

  // Expose
  window.Carousel = Carousel;
  window.initCarousels = initCarousels;

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCarousels);
  } else {
    initCarousels();
  }

})();
