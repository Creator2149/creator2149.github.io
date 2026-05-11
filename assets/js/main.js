/**
 * main.js — Core application logic
 *
 * Handles:
 * - Navbar behavior (scroll hide/show, mobile toggle, active state)
 * - Scroll reveal animations (IntersectionObserver)
 * - Dynamic content rendering for all pages
 * - Hero donut animation (Canvas 2D, vanilla JS)
 * - Admin access via footer triple-click
 * - Utility functions
 */

(function () {
    'use strict';

    /* =========================================================
     UTILITY FUNCTIONS
  ========================================================= */

    /** Safely get element */
    const $ = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

    /** Create element with optional attributes and children */
    function createElement(tag, attrs = {}, children = []) {
        const el = document.createElement(tag);
        Object.entries(attrs).forEach(([key, val]) => {
            if (key === 'className') el.className = val;
            else if (key === 'innerHTML') el.innerHTML = val;
            else if (key === 'textContent') el.textContent = val;
            else if (key.startsWith('on')) el.addEventListener(key.slice(2).toLowerCase(), val);
            else if (key === 'dataset') Object.entries(val).forEach(([k, v]) => (el.dataset[k] = v));
            else el.setAttribute(key, val);
        });
        children.forEach((child) => {
            if (typeof child === 'string') el.appendChild(document.createTextNode(child));
            else if (child) el.appendChild(child);
        });
        return el;
    }

    /** Generate image element with fallback */
    function createImage(src, alt = '', fallbackText = 'No preview') {
        if (src && src.trim()) {
            const img = createElement('img', { src, alt, loading: 'lazy' });
            img.onerror = function () {
                this.parentElement.innerHTML = `<div class="no-image">${fallbackText}</div>`;
            };
            return img;
        }
        return createElement('div', { className: 'no-image' }, [fallbackText]);
    }

    /** Create a tech tag pill */
    function createTechTag(text) {
        return createElement('span', { className: 'project-card__tech-tag' }, [text]);
    }

    /** Create a generic tag */
    function createTag(text) {
        return createElement('span', { className: 'project-card__tag' }, [text]);
    }

    /** Format date string */
    function formatDate(dateStr) {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    }

    /* =========================================================
     NAVBAR
  ========================================================= */

    function initNavbar() {
        const navbar = $('.navbar');
        const toggle = $('.navbar__toggle');
        const mobileMenu = $('.navbar__mobile-menu');
        if (!navbar) return;

        let lastScroll = 0;
        let ticking = false;

        function onScroll() {
            const currentScroll = window.scrollY;
            if (currentScroll > lastScroll && currentScroll > 80) {
                navbar.classList.add('navbar--hidden');
            } else {
                navbar.classList.remove('navbar--hidden');
            }
            lastScroll = currentScroll;
            ticking = false;
        }

        window.addEventListener(
            'scroll',
            () => {
                if (!ticking) {
                    requestAnimationFrame(onScroll);
                    ticking = true;
                }
            },
            { passive: true },
        );

        // Mobile toggle
        if (toggle && mobileMenu) {
            toggle.addEventListener('click', () => {
                toggle.classList.toggle('active');
                mobileMenu.classList.toggle('active');
                document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
            });

            // Close on link click
            $$('.navbar__mobile-link').forEach((link) => {
                link.addEventListener('click', () => {
                    toggle.classList.remove('active');
                    mobileMenu.classList.remove('active');
                    document.body.style.overflow = '';
                });
            });
        }

        // Set active link based on current page
        const currentPath = window.location.pathname;
        $$('.navbar__link').forEach((link) => {
            const href = link.getAttribute('href');
            if (
                currentPath.endsWith(href) ||
                (href === '/index.html' && (currentPath === '/' || currentPath.endsWith('/')))
            ) {
                link.classList.add('active');
            }
        });
    }

    /* =========================================================
     SCROLL REVEAL
  ========================================================= */

    function initScrollReveal() {
        const reveals = $$('.reveal');
        if (!reveals.length) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        observer.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.05,
                rootMargin: '100px 0px 0px 0px',
            },
        );

        reveals.forEach((el) => observer.observe(el));
    }

    /* =========================================================
     HERO DONUT ANIMATION
     Enhanced ASCII torus renderer with:
     - Mouse-reactive tilt
     - Blue-to-amber surface gradient
     - Motion trail afterglow
     - Ambient floating particles
     - Torus surface spark emission
     - Layered atmospheric glow
     - Subtle breathing scale oscillation
     - Background star field
  ========================================================= */

    function initDonut() {
        const container = $('.hero__canvas-container');
        if (!container) return;

        const canvas = createElement('canvas');
        container.appendChild(canvas);
        const ctx = canvas.getContext('2d');

        // --- Character sets ---
        const glyphs = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*+=-<>?/|~{}[]';
        const luminanceChars = '.,-~:;=!*#$@';

        // --- Torus geometry ---
        const R1 = 1; // minor radius
        const R2 = 2.2; // major radius
        const K2 = 5;
        let K1;

        // --- Animation state ---
        let A = 0,
            B = 0;
        let animId;
        let width, height;
        let frameCount = 0;

        // --- Mouse tracking (normalized -1 to 1) ---
        let mouseX = 0,
            mouseY = 0;
        let targetMouseX = 0,
            targetMouseY = 0;

        document.addEventListener('mousemove', (e) => {
            targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
            targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
        });

        // --- Glyph cycling ---
        let glyphMap = {};

        // --- Background star field ---
        const STAR_COUNT = 120;
        let stars = [];

        function generateStars() {
            stars = [];
            for (let i = 0; i < STAR_COUNT; i++) {
                stars.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    size: 0.5 + Math.random() * 1.2,
                    alpha: 0.1 + Math.random() * 0.25,
                    twinkleSpeed: 0.002 + Math.random() * 0.008,
                    twinkleOffset: Math.random() * Math.PI * 2,
                });
            }
        }

        // --- Ambient floating particles ---
        const PARTICLE_COUNT = 40;
        let particles = [];

        function generateParticles() {
            particles = [];
            for (let i = 0; i < PARTICLE_COUNT; i++) {
                particles.push(createParticle());
            }
        }

        function createParticle(fromTorus) {
            if (fromTorus) {
                // Spawn from approximate torus center region
                const angle = Math.random() * Math.PI * 2;
                const dist = 80 + Math.random() * 120;
                return {
                    x: width / 2 + Math.cos(angle) * dist * (width / 800),
                    y: height / 2 + Math.sin(angle) * dist * 0.5 * (height / 600),
                    vx: (Math.random() - 0.5) * 0.4,
                    vy: (Math.random() - 0.5) * 0.3 - 0.15,
                    size: 0.8 + Math.random() * 1.5,
                    alpha: 0.3 + Math.random() * 0.5,
                    life: 1,
                    decay: 0.002 + Math.random() * 0.004,
                    color: Math.random() < 0.6 ? 'blue' : 'amber',
                };
            }
            return {
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.2,
                vy: (Math.random() - 0.5) * 0.15,
                size: 0.6 + Math.random() * 1.2,
                alpha: 0.05 + Math.random() * 0.15,
                life: 1,
                decay: 0,
                color: Math.random() < 0.7 ? 'blue' : 'amber',
            };
        }

        // --- Surface spark particles (emitted from torus) ---
        const SPARK_LIMIT = 60;
        let sparks = [];

        function emitSpark(screenX, screenY, ooz) {
            if (sparks.length >= SPARK_LIMIT) return;
            const angle = Math.random() * Math.PI * 2;
            const speed = 0.3 + Math.random() * 0.8;
            sparks.push({
                x: screenX,
                y: screenY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                alpha: 0.4 + Math.min(1, ooz * 2) * 0.4,
                life: 1,
                decay: 0.008 + Math.random() * 0.012,
                size: 1 + Math.random() * 1.5,
            });
        }

        // --- Resize ---
        function resize() {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            width = container.clientWidth;
            height = container.clientHeight;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            canvas.style.width = width + 'px';
            canvas.style.height = height + 'px';
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            K1 = (width * 0.1 * K2 * 3) / (8 * (R1 + R2));
            generateStars();
            generateParticles();
        }

        resize();
        window.addEventListener('resize', resize);

        // --- Main render loop ---
        function renderFrame() {
            frameCount++;

            // Smooth mouse interpolation (eased follow)
            mouseX += (targetMouseX - mouseX) * 0.04;
            mouseY += (targetMouseY - mouseY) * 0.04;

            // --- Afterglow: partial clear instead of full clear ---
            ctx.fillStyle = 'rgba(10, 14, 23, 0.28)';
            ctx.fillRect(0, 0, width, height);

            // --- Background stars ---
            const time = frameCount * 0.016;
            for (const star of stars) {
                const twinkle = 0.5 + 0.5 * Math.sin(time * star.twinkleSpeed * 60 + star.twinkleOffset);
                const a = star.alpha * twinkle;
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(232, 222, 211, ${a})`;
                ctx.fill();
            }

            // --- Ambient floating particles ---
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                p.x += p.vx;
                p.y += p.vy;
                p.life -= p.decay;

                if (p.life <= 0 || p.x < -20 || p.x > width + 20 || p.y < -20 || p.y > height + 20) {
                    particles[i] = createParticle(false);
                    continue;
                }

                const drawAlpha = p.alpha * (p.decay > 0 ? p.life : 1);
                const cr = p.color === 'amber' ? '201, 149, 107' : '91, 143, 185';
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${cr}, ${drawAlpha})`;
                ctx.fill();
            }

            // --- Breathing scale oscillation ---
            const breathe = 1 + Math.sin(frameCount * 0.012) * 0.015;
            const effectiveK1 = K1 * breathe;

            // --- Mouse-influenced rotation offsets ---
            const mouseA = mouseY * 0.15;
            const mouseB = mouseX * 0.1;

            const totalA = A + mouseA;
            const totalB = B + mouseB;

            const cosA = Math.cos(totalA),
                sinA = Math.sin(totalA);
            const cosB = Math.cos(totalB),
                sinB = Math.sin(totalB);

            // --- Z-buffer and character output ---
            const output = [];
            const zbuffer = [];
            const colorData = []; // store per-cell color info

            const numCols = Math.floor(width / 10);
            const numRows = Math.floor(height / 16);

            for (let i = 0; i < numCols; i++) {
                output[i] = new Array(numRows).fill(' ');
                zbuffer[i] = new Array(numRows).fill(0);
                colorData[i] = new Array(numRows).fill(null);
            }

            // --- Render torus surface ---
            for (let theta = 0; theta < 6.28; theta += 0.07) {
                const cosTheta = Math.cos(theta),
                    sinTheta = Math.sin(theta);

                for (let phi = 0; phi < 6.28; phi += 0.02) {
                    const cosPhi = Math.cos(phi),
                        sinPhi = Math.sin(phi);

                    const cx = R2 + R1 * cosTheta;
                    const cy = R1 * sinTheta;

                    const x = cx * (cosB * cosPhi + sinA * sinB * sinPhi) - cy * cosA * sinB;
                    const y = cx * (sinB * cosPhi - sinA * cosB * sinPhi) + cy * cosA * cosB;
                    const z = K2 + cosA * cx * sinPhi + cy * sinA;
                    const ooz = 1 / z;

                    const xp = Math.floor(numCols / 2 + effectiveK1 * ooz * x);
                    const yp = Math.floor(numRows / 2 - effectiveK1 * ooz * y * 0.5);

                    const L =
                        cosPhi * cosTheta * sinB -
                        cosA * cosTheta * sinPhi -
                        sinA * sinTheta +
                        cosB * (cosA * sinTheta - cosTheta * sinPhi * sinA);

                    if (yp >= 0 && yp < numRows && xp >= 0 && xp < numCols) {
                        if (ooz > zbuffer[xp][yp]) {
                            zbuffer[xp][yp] = ooz;

                            const depth = Math.min(1, ooz * 2);

                            // --- Color: blue-to-amber gradient based on phi angle ---
                            // phi goes 0..2pi around the torus tube
                            // Map to a smooth gradient: top = blue, bottom = amber blend
                            const phiNorm = (phi % (Math.PI * 2)) / (Math.PI * 2); // 0-1
                            const colorMix = 0.5 + 0.5 * Math.sin(phiNorm * Math.PI * 2 - Math.PI * 0.5);

                            // Blue base: (91, 143, 185), Amber base: (201, 149, 107)
                            const baseR = 91 + (201 - 91) * colorMix;
                            const baseG = 143 + (149 - 143) * colorMix;
                            const baseB = 185 + (107 - 185) * colorMix;

                            // Depth brightens
                            const alpha = 0.12 + depth * 0.72;

                            // Luminance character selection
                            const luminanceIdx = Math.max(0, Math.min(luminanceChars.length - 1, Math.floor(L * 8)));
                            const depthFactor = depth;
                            const charIdx = Math.floor(
                                luminanceIdx * depthFactor + (luminanceChars.length - 1) * (1 - depthFactor) * 0.3,
                            );

                            // Glyph cycling
                            const key = xp + ',' + yp;
                            if (Math.random() < 0.004) {
                                glyphMap[key] = glyphs[Math.floor(Math.random() * glyphs.length)];
                            }

                            output[xp][yp] =
                                glyphMap[key] ||
                                luminanceChars[Math.max(0, Math.min(charIdx, luminanceChars.length - 1))];
                            colorData[xp][yp] = { r: baseR, g: baseG, b: baseB, alpha, ooz, phi: phiNorm };

                            // --- Occasionally emit a spark from bright surface points ---
                            if (Math.random() < 0.0008 && depth > 0.6) {
                                emitSpark(xp * 10, yp * 16, ooz);
                            }
                        }
                    }
                }
            }

            // --- Draw torus characters ---
            ctx.font = '12px "JetBrains Mono", "SF Mono", monospace';
            ctx.textBaseline = 'top';

            for (let x = 0; x < numCols; x++) {
                for (let y = 0; y < numRows; y++) {
                    const char = output[x][y];
                    if (char && char !== ' ' && colorData[x][y]) {
                        const c = colorData[x][y];
                        ctx.fillStyle = `rgba(${c.r | 0},${c.g | 0},${c.b | 0},${c.alpha.toFixed(2)})`;
                        ctx.fillText(char, x * 10, y * 16);
                    }
                }
            }

            // --- Draw and update surface sparks ---
            for (let i = sparks.length - 1; i >= 0; i--) {
                const s = sparks[i];
                s.x += s.vx;
                s.y += s.vy;
                s.vy += 0.01; // slight gravity
                s.life -= s.decay;

                if (s.life <= 0) {
                    sparks.splice(i, 1);
                    continue;
                }

                const sa = s.alpha * s.life;
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.size * s.life, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(201, 149, 107, ${sa.toFixed(2)})`;
                ctx.fill();
            }

            // --- Layered atmospheric glow ---
            // Inner blue glow
            const glow1 = ctx.createRadialGradient(
                width / 2,
                height / 2,
                0,
                width / 2,
                height / 2,
                Math.min(width, height) * 0.3,
            );
            glow1.addColorStop(0, 'rgba(91, 143, 185, 0.06)');
            glow1.addColorStop(0.6, 'rgba(91, 143, 185, 0.02)');
            glow1.addColorStop(1, 'rgba(91, 143, 185, 0)');
            ctx.fillStyle = glow1;
            ctx.fillRect(0, 0, width, height);

            // Outer warm glow (offset for directionality)
            const offX = width / 2 + mouseX * 60;
            const offY = height / 2 + mouseY * 40;
            const glow2 = ctx.createRadialGradient(offX, offY, 0, offX, offY, Math.min(width, height) * 0.5);
            glow2.addColorStop(0, 'rgba(201, 149, 107, 0.025)');
            glow2.addColorStop(0.5, 'rgba(201, 149, 107, 0.01)');
            glow2.addColorStop(1, 'rgba(201, 149, 107, 0)');
            ctx.fillStyle = glow2;
            ctx.fillRect(0, 0, width, height);

            // --- Rotate base angles ---
            A += 0.004;
            B += 0.002;

            // --- Glyph map cleanup ---
            if (frameCount % 60 === 0) {
                const keys = Object.keys(glyphMap);
                if (keys.length > 250) {
                    for (let i = 0; i < 25; i++) {
                        delete glyphMap[keys[Math.floor(Math.random() * keys.length)]];
                    }
                }
            }

            animId = requestAnimationFrame(renderFrame);
        }

        // Check for reduced motion
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (!prefersReducedMotion) {
            renderFrame();
        } else {
            renderFrame();
            cancelAnimationFrame(animId);
        }
    }

    /* =========================================================
     DYNAMIC CONTENT RENDERING — HOMEPAGE
  ========================================================= */

    function renderHomepage() {
        if (!$('.page--home')) return;

        // Render hero content
        if (window.SITE_DATA) {
            const heroGreeting = $('.hero__greeting');
            const heroTitle = $('.hero__title');
            const heroSubtitle = $('.hero__subtitle');
            const heroSystemLabel = $('.hero__system-label');

            if (heroGreeting) heroGreeting.textContent = SITE_DATA.hero.greeting;
            if (heroTitle) heroTitle.textContent = SITE_DATA.hero.mainStatement;
            if (heroSubtitle) heroSubtitle.textContent = SITE_DATA.hero.subStatement;
            if (heroSystemLabel) heroSystemLabel.textContent = SITE_DATA.tagline || '';
        }

        // Render philosophy section
        if (window.SITE_DATA && window.SITE_DATA.philosophy) {
            const phil = SITE_DATA.philosophy;
            const philHeading = $('.philosophy .section__title');
            const philTextContainer = $('.philosophy__text');
            const philInterests = $('.philosophy__interests');
            const philFocus = $('.philosophy__focus-text');

            if (philHeading) philHeading.textContent = phil.heading;

            if (philTextContainer) {
                philTextContainer.innerHTML = '';
                phil.paragraphs.forEach((p) => {
                    philTextContainer.appendChild(createElement('p', { textContent: p }));
                });
            }

            if (philInterests) {
                philInterests.innerHTML = '';
                phil.interests.forEach((interest) => {
                    philInterests.appendChild(createElement('div', { className: 'philosophy__interest' }, [interest]));
                });
            }

            if (philFocus) philFocus.textContent = phil.currentFocus;
        }

        // Render featured project (cinematic centerpiece)
        renderFeaturedProject();

        // Render curated project selection
        renderCuratedProjects();

        // Render blender showcase
        renderHomeBlender();

        // Render contact section
        renderContact();
    }

    function renderFeaturedProject() {
        const container = $('.featured-project');
        if (!container || !window.PROJECTS_DATA) return;

        // Find the flagship project
        const project = PROJECTS_DATA.find((p) => p.flagship);
        if (!project) return;

        // Update the section title dynamically
        const featuredSectionTitle = document.querySelector('#featured .section__title');
        if (featuredSectionTitle) featuredSectionTitle.textContent = project.title;

        container.innerHTML = '';

        const inner = createElement('div', { className: 'featured-project__inner container' });

        // Visual side
        const visual = createElement('div', { className: 'featured-project__visual' });
        visual.appendChild(createImage(project.image, project.title, 'PROJECT VISUAL'));
        const visualLabel = createElement('div', { className: 'featured-project__visual-label' }, ['FLAGSHIP PROJECT']);
        visual.appendChild(visualLabel);
        inner.appendChild(visual);

        // Content side
        const content = createElement('div', { className: 'featured-project__content' });

        // Label
        content.appendChild(createElement('div', { className: 'featured-project__label' }, ['FEATURED WORK']));

        // Status — with color-coded modifier class
        if (project.status) {
            const statusCls =
                project.status === 'Completed'
                    ? 'featured-project__status--completed'
                    : project.status === 'In Progress'
                      ? 'featured-project__status--in-progress'
                      : project.status === 'Planned'
                        ? 'featured-project__status--planned'
                        : '';
            const status = createElement('div', { className: `featured-project__status ${statusCls}`.trim() });
            status.appendChild(createElement('span', { className: 'featured-project__status-dot' }));
            status.appendChild(
                createElement('span', {
                    textContent: project.status + (project.statusDetails ? ' — ' + project.statusDetails : ''),
                }),
            );
            content.appendChild(status);
        }

        // Title
        content.appendChild(createElement('h2', { className: 'featured-project__title', textContent: project.title }));

        // Quote
        if (project.featuredQuote) {
            content.appendChild(
                createElement('blockquote', {
                    className: 'featured-project__quote',
                    textContent: project.featuredQuote,
                }),
            );
        }

        // Description
        content.appendChild(
            createElement('p', {
                className: 'featured-project__description',
                textContent: project.longDescription || project.shortDescription,
            }),
        );

        // Architecture notes
        if (project.architectureNotes) {
            const archSection = createElement('div', { className: 'featured-project__architecture' });
            archSection.appendChild(
                createElement('div', { className: 'featured-project__architecture-title' }, ['ARCHITECTURE']),
            );
            archSection.appendChild(
                createElement('p', {
                    className: 'featured-project__architecture-text',
                    textContent: project.architectureNotes,
                }),
            );
            content.appendChild(archSection);
        }

        // Technical highlights
        if (project.technicalHighlights && project.technicalHighlights.length) {
            const hlSection = createElement('div', { className: 'featured-project__highlights' });
            hlSection.appendChild(
                createElement('div', { className: 'featured-project__highlights-title' }, ['HIGHLIGHTS']),
            );
            project.technicalHighlights.forEach((hl) => {
                hlSection.appendChild(
                    createElement('div', { className: 'featured-project__highlight-item', textContent: hl }),
                );
            });
            content.appendChild(hlSection);
        }

        // Tech stack
        if (project.tech && project.tech.length) {
            const techContainer = createElement('div', { className: 'featured-project__tech' });
            project.tech.forEach((t) => techContainer.appendChild(createTechTag(t)));
            content.appendChild(techContainer);
        }

        // Link
        if (project.link) {
            content.appendChild(
                createElement('a', {
                    className: 'featured-project__link',
                    href: project.link,
                    target: '_blank',
                    rel: 'noopener noreferrer',
                    innerHTML: 'View Project &rarr;',
                }),
            );
        }

        inner.appendChild(content);
        container.appendChild(inner);

        // Make the card open a modal on click (for non-flagship, we open modals)
        container.addEventListener('click', (e) => {
            if (e.target.closest('.featured-project__link')) return;
            if (window.ModalSystem) window.ModalSystem.openProjectModal(project);
        });
        container.style.cursor = 'pointer';
    }

    function renderCuratedProjects() {
        const container = $('.home-projects__grid');
        if (!container || !window.PROJECTS_DATA) return;

        // Get featuredOnHome projects (excluding the flagship one)
        const flagship = PROJECTS_DATA.find((p) => p.flagship);
        const curated = PROJECTS_DATA.filter((p) => p.featuredOnHome && !p.flagship);

        container.innerHTML = '';
        curated.forEach((project) => {
            container.appendChild(createProjectCard(project, 'standard'));
        });
    }

    /** Get status modifier class for project cards */
    function getStatusClass(status) {
        if (status === 'Completed') return 'project-card__status--completed';
        if (status === 'In Progress') return 'project-card__status--in-progress';
        if (status === 'Planned') return 'project-card__status--planned';
        return '';
    }

    function createProjectCard(project, variant = 'standard') {
        const hasImage = project.image && project.image.trim();

        const card = createElement('div', {
            className: `project-card project-card--${variant}${!hasImage ? ' project-card--no-image' : ''}`,
            dataset: { id: project.id },
        });

        // Determine layout based on variant
        if (variant === 'featured') {
            // Side-by-side layout
            const visual = createElement('div', { className: 'project-card__visual' });
            visual.appendChild(createImage(project.image, project.title, 'PROJECT'));
            card.appendChild(visual);

            const content = createElement('div', { className: 'project-card__content' });
            const meta = createElement('div', { className: 'project-card__meta' });
            meta.appendChild(createElement('span', { className: 'project-card__year', textContent: project.year }));
            if (project.status) {
                const statusCls = getStatusClass(project.status);
                meta.appendChild(
                    createElement('span', {
                        className: `project-card__status ${statusCls}`.trim(),
                        textContent: project.status,
                    }),
                );
            }
            content.appendChild(meta);
            content.appendChild(createElement('h3', { className: 'project-card__title', textContent: project.title }));
            content.appendChild(
                createElement('p', { className: 'project-card__description', textContent: project.shortDescription }),
            );
            if (project.tech && project.tech.length) {
                const tech = createElement('div', { className: 'project-card__tech' });
                project.tech.forEach((t) => tech.appendChild(createTechTag(t)));
                content.appendChild(tech);
            }
            card.appendChild(content);
        } else if (variant === 'compact') {
            // Horizontal mini layout
            const visual = createElement('div', { className: 'project-card__visual' });
            visual.appendChild(createImage(project.image, project.title, ''));
            card.appendChild(visual);

            const content = createElement('div', { className: 'project-card__content' });
            const meta = createElement('div', { className: 'project-card__meta' });
            meta.appendChild(createElement('span', { className: 'project-card__year', textContent: project.year }));
            if (project.status) {
                const statusCls = getStatusClass(project.status);
                meta.appendChild(
                    createElement('span', {
                        className: `project-card__status ${statusCls}`.trim(),
                        textContent: project.status,
                    }),
                );
            }
            content.appendChild(meta);
            content.appendChild(createElement('h3', { className: 'project-card__title', textContent: project.title }));
            content.appendChild(
                createElement('p', { className: 'project-card__description', textContent: project.shortDescription }),
            );
            if (project.tech && project.tech.length) {
                const tech = createElement('div', { className: 'project-card__tech' });
                project.tech.slice(0, 3).forEach((t) => tech.appendChild(createTechTag(t)));
                content.appendChild(tech);
            }
            card.appendChild(content);
        } else {
            // Standard vertical card
            const visual = createElement('div', { className: 'project-card__visual' });
            visual.appendChild(createImage(project.image, project.title, 'PROJECT'));
            card.appendChild(visual);

            const content = createElement('div', { className: 'project-card__content' });
            const meta = createElement('div', { className: 'project-card__meta' });
            meta.appendChild(createElement('span', { className: 'project-card__year', textContent: project.year }));
            if (project.status) {
                const statusCls = getStatusClass(project.status);
                meta.appendChild(
                    createElement('span', {
                        className: `project-card__status ${statusCls}`.trim(),
                        textContent: project.status,
                    }),
                );
            }
            content.appendChild(meta);
            content.appendChild(createElement('h3', { className: 'project-card__title', textContent: project.title }));
            content.appendChild(
                createElement('p', { className: 'project-card__description', textContent: project.shortDescription }),
            );
            if (project.tech && project.tech.length) {
                const tech = createElement('div', { className: 'project-card__tech' });
                project.tech.slice(0, 5).forEach((t) => tech.appendChild(createTechTag(t)));
                content.appendChild(tech);
            }
            if (project.tags && project.tags.length) {
                const tags = createElement('div', { className: 'project-card__tags' });
                project.tags.forEach((t, i) => {
                    if (i > 0)
                        tags.appendChild(
                            createElement('span', { className: 'project-card__tag-separator', textContent: '|' }),
                        );
                    tags.appendChild(createTag(t));
                });
                content.appendChild(tags);
            }
            card.appendChild(content);
        }

        // Click to open modal
        card.addEventListener('click', () => {
            if (window.ModalSystem) window.ModalSystem.openProjectModal(project);
        });
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (window.ModalSystem) window.ModalSystem.openProjectModal(project);
            }
        });

        return card;
    }

    function renderHomeBlender() {
        const container = $('.home-blender__grid');
        if (!container || !window.BLENDER_DATA) return;

        const featured = BLENDER_DATA.filter((b) => b.featuredOnHome);
        container.innerHTML = '';
        featured.forEach((item) => {
            container.appendChild(createBlenderCard(item));
        });
    }

    function createBlenderCard(item) {
        const card = createElement('div', { className: 'blender-card', dataset: { id: item.id } });

        const visual = createElement('div', { className: 'blender-card__visual' });
        visual.appendChild(createImage(item.image, item.title, 'RENDER'));

        const content = createElement('div', { className: 'blender-card__content' });
        content.appendChild(createElement('h3', { className: 'blender-card__title', textContent: item.title }));

        const meta = createElement('div', { className: 'blender-card__meta' });
        meta.appendChild(
            document.createTextNode(formatDate(item.date) + (item.renderEngine ? ' · ' + item.renderEngine : '')),
        );
        content.appendChild(meta);

        if (item.description) {
            content.appendChild(
                createElement('p', { className: 'blender-card__description', textContent: item.description }),
            );
        }

        if (item.techniques && item.techniques.length) {
            const techniques = createElement('div', { className: 'blender-card__techniques' });
            item.techniques.forEach((t) =>
                techniques.appendChild(createElement('span', { className: 'blender-card__technique' }, [t])),
            );
            content.appendChild(techniques);
        }

        card.appendChild(visual);
        card.appendChild(content);

        // Click image/card to open near-fullscreen image lightbox
        card.addEventListener('click', () => {
            if (item.image && window.ImageLightbox) window.ImageLightbox.open(item.image, item.title);
        });
        card.style.cursor = 'pointer';

        return card;
    }

    function renderContact() {
        const section = $('.contact');
        if (!section || !window.SITE_DATA || !window.SITE_DATA.contact) return;

        const contact = SITE_DATA.contact;
        const heading = $('.contact__heading');
        const statement = $('.contact__statement');
        const linksContainer = $('.contact__links');

        if (heading) heading.textContent = contact.heading;
        if (statement) statement.textContent = contact.statement;

        if (linksContainer) {
            linksContainer.innerHTML = '';
            if (contact.email) {
                linksContainer.appendChild(
                    createElement('a', {
                        className: 'contact__link',
                        href: 'mailto:' + contact.email,
                        textContent: 'Email',
                    }),
                );
            }
            if (contact.github) {
                linksContainer.appendChild(
                    createElement('a', {
                        className: 'contact__link',
                        href: contact.github,
                        target: '_blank',
                        rel: 'noopener noreferrer',
                        textContent: 'GitHub',
                    }),
                );
            }
            if (contact.linkedin) {
                linksContainer.appendChild(
                    createElement('a', {
                        className: 'contact__link',
                        href: contact.linkedin,
                        target: '_blank',
                        rel: 'noopener noreferrer',
                        textContent: 'LinkedIn',
                    }),
                );
            }
        }
    }

    /* =========================================================
     DYNAMIC CONTENT RENDERING — PROJECTS PAGE
  ========================================================= */

    function renderProjectsPage() {
        if (!$('.page--projects')) return;
        if (!window.PROJECTS_DATA) return;

        const grid = $('.projects-grid');
        if (!grid) return;

        const projects = PROJECTS_DATA;
        grid.innerHTML = '';

        projects.forEach((project) => {
            // All cards use standard variant for consistent styling
            grid.appendChild(createProjectCard(project, 'standard'));
        });
    }

    /* =========================================================
     DYNAMIC CONTENT RENDERING — CERTIFICATES PAGE
  ========================================================= */

    function renderCertificatesPage() {
        if (!$('.page--certificates')) return;
        if (!window.CERTIFICATES_DATA) return;

        const grid = $('.certificates-grid');
        if (!grid) return;

        grid.innerHTML = '';
        CERTIFICATES_DATA.forEach((cert) => {
            grid.appendChild(createCertificateCard(cert));
        });
    }

    function createCertificateCard(cert) {
        const card = createElement('div', {
            className: 'certificate-card',
            dataset: { id: cert.id },
        });

        card.appendChild(createElement('div', { className: 'certificate-card__year', textContent: cert.year }));
        card.appendChild(createElement('h3', { className: 'certificate-card__title', textContent: cert.title }));
        card.appendChild(createElement('div', { className: 'certificate-card__field', textContent: cert.field }));

        if (cert.issuer) {
            card.appendChild(createElement('div', { className: 'certificate-card__issuer', textContent: cert.issuer }));
        }

        if (cert.description) {
            card.appendChild(
                createElement('p', {
                    className: 'certificate-card__description',
                    textContent: cert.description,
                    style: 'font-size: 0.875rem; color: var(--text-secondary); line-height: 1.6; margin-top: 0.5rem;',
                }),
            );
        }

        if (cert.image) {
            const imgContainer = createElement('div', { className: 'certificate-card__image' });
            imgContainer.appendChild(createImage(cert.image, cert.title, 'CERTIFICATE'));
            card.appendChild(imgContainer);
        }

        // Click to open modal
        card.addEventListener('click', () => {
            if (window.ModalSystem) window.ModalSystem.openCertificateModal(cert);
        });
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');

        return card;
    }

    /* =========================================================
     DYNAMIC CONTENT RENDERING — BLENDER PAGE
  ========================================================= */

    function renderBlenderPage() {
        if (!$('.page--blender')) return;
        if (!window.BLENDER_DATA) return;

        const container = $('.blender-lighthouse');
        if (!container) return;

        container.innerHTML = '';
        BLENDER_DATA.forEach((item, index) => {
            container.appendChild(createLighthouseItem(item, index));
        });
    }

    function createLighthouseItem(item, index) {
        const isReversed = index % 2 === 1;
        const itemEl = createElement('div', {
            className: `blender-lighthouse__item${isReversed ? ' blender-lighthouse__item--reverse' : ''}`,
            dataset: { id: item.id },
        });

        // Visual
        const visual = createElement('div', { className: 'blender-lighthouse__visual' });
        visual.appendChild(createImage(item.image, item.title, 'RENDER'));

        // Content
        const content = createElement('div', { className: 'blender-lighthouse__content' });

        // Render number
        content.appendChild(
            createElement('div', {
                className: 'blender-lighthouse__number',
                textContent: `RENDER ${String(index + 1).padStart(2, '0')}`,
            }),
        );

        // Title
        content.appendChild(
            createElement('h2', {
                className: 'blender-lighthouse__title',
                textContent: item.title,
            }),
        );

        // Description
        if (item.description) {
            content.appendChild(
                createElement('p', {
                    className: 'blender-lighthouse__description',
                    textContent: item.description,
                }),
            );
        }

        // Meta (date + engine)
        const meta = createElement('div', { className: 'blender-lighthouse__meta' });
        meta.appendChild(
            document.createTextNode(formatDate(item.date) + (item.renderEngine ? ' \u00B7 ' + item.renderEngine : '')),
        );
        content.appendChild(meta);

        // Techniques
        if (item.techniques && item.techniques.length) {
            const techniques = createElement('div', { className: 'blender-lighthouse__techniques' });
            item.techniques.forEach((t) =>
                techniques.appendChild(createElement('span', { className: 'blender-lighthouse__technique' }, [t])),
            );
            content.appendChild(techniques);
        }

        itemEl.appendChild(visual);
        itemEl.appendChild(content);

        // Click visual to open near-fullscreen image lightbox
        visual.addEventListener('click', () => {
            if (item.image && window.ImageLightbox) window.ImageLightbox.open(item.image, item.title);
        });
        visual.style.cursor = 'pointer';

        return itemEl;
    }

    /* =========================================================
     ADMIN ACCESS — Triple-click footer copyright
     Navigates directly to admin.html; the admin page
     itself handles password verification on load.
  ========================================================= */

    function initAdminAccess() {
        const copyrightIcon = $('.footer__copyright-icon');
        if (!copyrightIcon) return;

        let clickCount = 0;
        let clickTimer = null;

        copyrightIcon.addEventListener('click', () => {
            clickCount++;
            if (clickTimer) clearTimeout(clickTimer);

            if (clickCount >= 3) {
                clickCount = 0;
                window.location.href = '/admin.html';
                return;
            }

            clickTimer = setTimeout(() => {
                clickCount = 0;
            }, 500);
        });
    }

    /* =========================================================
     NAVBAR DYNAMIC RENDERING
  ========================================================= */

    function renderNavbar() {
        const navLinks = $('.navbar__links');
        const mobileLinks = $('.navbar__mobile-menu-links');
        if (!window.SITE_DATA || !window.SITE_DATA.nav) return;

        const currentPath = window.location.pathname;

        if (navLinks) {
            navLinks.innerHTML = '';
            SITE_DATA.nav.forEach((item) => {
                const li = createElement('li');
                const link = createElement('a', {
                    className: 'navbar__link',
                    href: item.href,
                    textContent: item.label,
                });
                // Set active
                if (
                    currentPath.endsWith(item.href) ||
                    (item.href === '/index.html' && (currentPath === '/' || currentPath.endsWith('/')))
                ) {
                    link.classList.add('active');
                }
                li.appendChild(link);
                navLinks.appendChild(li);
            });
        }

        if (mobileLinks) {
            mobileLinks.innerHTML = '';
            SITE_DATA.nav.forEach((item) => {
                const link = createElement('a', {
                    className: 'navbar__mobile-link',
                    href: item.href,
                    textContent: item.label,
                });
                // Set active state on mobile links too
                if (
                    currentPath.endsWith(item.href) ||
                    (item.href === '/index.html' && (currentPath === '/' || currentPath.endsWith('/')))
                ) {
                    link.classList.add('active');
                }
                mobileLinks.appendChild(link);
            });
        }
    }

    /* =========================================================
     FOOTER RENDERING
  ========================================================= */

    function renderFooter() {
        if (!window.SITE_DATA || !window.SITE_DATA.footer) return;

        const footer = $('.footer');
        if (!footer) return;

        const copyright = $('.footer__copyright');
        const built = $('.footer__built');

        if (copyright) {
            copyright.innerHTML = '';
            const icon = createElement('span', { className: 'footer__copyright-icon', textContent: '\u00A9' });
            copyright.appendChild(icon);
            copyright.appendChild(
                document.createTextNode(' ' + SITE_DATA.footer.year + ' ' + SITE_DATA.footer.copyright),
            );
        }

        // Hide built section since footer is now centered
        if (built) built.style.display = 'none';
    }

    /* =========================================================
     IMAGE LIGHTBOX — Near-fullscreen image viewer
     Used for Blender render images (homepage cards + lighthouse)
  ========================================================= */

    let lightboxEl = null;

    function initImageLightbox() {
        if (lightboxEl) return;

        lightboxEl = document.createElement('div');
        lightboxEl.className = 'image-lightbox';
        lightboxEl.setAttribute('role', 'dialog');
        lightboxEl.setAttribute('aria-modal', 'true');
        lightboxEl.setAttribute('aria-label', 'Image viewer');

        const closeBtn = document.createElement('button');
        closeBtn.className = 'image-lightbox__close';
        closeBtn.setAttribute('aria-label', 'Close image viewer');
        closeBtn.innerHTML = '&times;';
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeImageLightbox();
        });

        const img = document.createElement('img');
        img.className = 'image-lightbox__img';
        img.alt = '';

        const title = document.createElement('div');
        title.className = 'image-lightbox__title';

        lightboxEl.appendChild(closeBtn);
        lightboxEl.appendChild(img);
        lightboxEl.appendChild(title);
        document.body.appendChild(lightboxEl);

        // Close on background click
        lightboxEl.addEventListener('click', (e) => {
            if (e.target === lightboxEl) closeImageLightbox();
        });

        // Close on Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && lightboxEl.classList.contains('active')) {
                closeImageLightbox();
            }
        });
    }

    function openImageLightbox(src, titleText) {
        if (!lightboxEl) initImageLightbox();
        const img = lightboxEl.querySelector('.image-lightbox__img');
        const title = lightboxEl.querySelector('.image-lightbox__title');
        img.src = src;
        img.alt = titleText || '';
        title.textContent = titleText || '';
        lightboxEl.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeImageLightbox() {
        if (!lightboxEl) return;
        lightboxEl.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Expose globally
    window.ImageLightbox = { open: openImageLightbox, close: closeImageLightbox };

    /* =========================================================
     INITIALIZATION
  ========================================================= */

    function init() {
        initImageLightbox();
        renderNavbar();
        initNavbar();
        renderFooter();
        initAdminAccess();

        // Page-specific rendering
        renderHomepage();
        renderProjectsPage();
        renderCertificatesPage();
        renderBlenderPage();

        // Start donut animation
        initDonut();

        // Initialize scroll reveals after content is rendered
        initScrollReveal();
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose utilities globally for other modules
    window.AppUtils = {
        $,
        $$,
        createElement,
        createImage,
        createTechTag,
        createTag,
        formatDate,
        createProjectCard,
        createBlenderCard,
        createCertificateCard,
    };
})();
