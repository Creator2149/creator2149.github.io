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
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px',
            },
        );

        reveals.forEach((el) => observer.observe(el));
    }

    /* =========================================================
     HERO DONUT ANIMATION
     Converted from Three.js to pure Canvas 2D
     Classic donut.c approach with atmospheric enhancements
  ========================================================= */

    function initDonut() {
        const container = $('.hero__canvas-container');
        if (!container) return;

        const canvas = createElement('canvas');
        container.appendChild(canvas);
        const ctx = canvas.getContext('2d');

        // Character set — matrix glyphs
        const glyphs = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*+=-<>?/|~{}[]';

        // Torus parameters
        const R1 = 1; // minor radius
        const R2 = 2.2; // major radius
        const K2 = 5;
        let K1;

        // Animation state
        let A = 0,
            B = 0;
        let animId;
        let width, height;

        // Glyph cycling state — track which character each cell displays
        let glyphMap = {};
        let glyphCycleCounter = 0;

        function resize() {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            width = container.clientWidth;
            height = container.clientHeight;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            canvas.style.width = width + 'px';
            canvas.style.height = height + 'px';
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            // Scale K1 based on canvas width for responsive sizing
            K1 = (width * 0.1 * K2 * 3) / (8 * (R1 + R2));
        }

        resize();
        window.addEventListener('resize', resize);

        // Luminance to character mapping
        const luminanceChars = '.,-~:;=!*#$@';

        function renderFrame() {
            ctx.clearRect(0, 0, width, height);

            const cosA = Math.cos(A),
                sinA = Math.sin(A);
            const cosB = Math.cos(B),
                sinB = Math.sin(B);

            // Z-buffer and output buffers
            const output = [];
            const zbuffer = [];

            const numCols = Math.floor(width / 10);
            const numRows = Math.floor(height / 16);

            for (let i = 0; i < numCols; i++) {
                output[i] = new Array(numRows).fill(' ');
                zbuffer[i] = new Array(numRows).fill(0);
            }

            // Render torus surface
            for (let theta = 0; theta < 6.28; theta += 0.07) {
                const cosTheta = Math.cos(theta),
                    sinTheta = Math.sin(theta);

                for (let phi = 0; phi < 6.28; phi += 0.02) {
                    const cosPhi = Math.cos(phi),
                        sinPhi = Math.sin(phi);

                    // Circle point
                    const cx = R2 + R1 * cosTheta;
                    const cy = R1 * sinTheta;

                    // 3D coordinates after rotation
                    const x = cx * (cosB * cosPhi + sinA * sinB * sinPhi) - cy * cosA * sinB;
                    const y = cx * (sinB * cosPhi - sinA * cosB * sinPhi) + cy * cosA * cosB;
                    const z = K2 + cosA * cx * sinPhi + cy * sinA;
                    const ooz = 1 / z;

                    // Project to 2D
                    const xp = Math.floor(numCols / 2 + K1 * ooz * x);
                    const yp = Math.floor(numRows / 2 - K1 * ooz * y * 0.5);

                    // Luminance
                    const L =
                        cosPhi * cosTheta * sinB -
                        cosA * cosTheta * sinPhi -
                        sinA * sinTheta +
                        cosB * (cosA * sinTheta - cosTheta * sinPhi * sinA);

                    if (yp >= 0 && yp < numRows && xp >= 0 && xp < numCols) {
                        if (ooz > zbuffer[xp][yp]) {
                            zbuffer[xp][yp] = ooz;

                            // Map luminance to glyph
                            const luminanceIdx = Math.max(0, Math.min(luminanceChars.length - 1, Math.floor(L * 8)));
                            const depthFactor = Math.min(1, ooz * 2);
                            const charIdx = Math.floor(
                                luminanceIdx * depthFactor + (luminanceChars.length - 1) * (1 - depthFactor) * 0.3,
                            );

                            // Occasionally cycle glyphs for matrix effect
                            const key = xp + ',' + yp;
                            if (Math.random() < 0.003) {
                                glyphMap[key] = glyphs[Math.floor(Math.random() * glyphs.length)];
                            }

                            if (glyphMap[key]) {
                                output[xp][yp] = glyphMap[key];
                            } else {
                                output[xp][yp] =
                                    luminanceChars[Math.max(0, Math.min(charIdx, luminanceChars.length - 1))];
                            }
                        }
                    }
                }
            }

            // Render to canvas
            ctx.font = '12px "JetBrains Mono", "SF Mono", monospace';
            ctx.textBaseline = 'top';

            for (let x = 0; x < numCols; x++) {
                for (let y = 0; y < numRows; y++) {
                    const char = output[x][y];
                    if (char && char !== ' ') {
                        const ooz = zbuffer[x][y];
                        const depth = Math.min(1, ooz * 2);

                        // Color based on depth — closer = brighter
                        const baseR = 91,
                            baseG = 143,
                            baseB = 185;
                        const alpha = 0.15 + depth * 0.7;

                        // Subtle warm accent for closest points
                        const warmMix = Math.max(0, depth - 0.7) * 3;
                        const r = Math.floor(baseR + (201 - baseR) * warmMix * 0.3);
                        const g = Math.floor(baseG + (149 - baseG) * warmMix * 0.2);
                        const b = Math.floor(baseB + (107 - baseB) * warmMix * 0.1);

                        ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
                        ctx.fillText(char, x * 10, y * 16);
                    }
                }
            }

            // Subtle depth glow effect
            const gradient = ctx.createRadialGradient(
                width / 2,
                height / 2,
                0,
                width / 2,
                height / 2,
                Math.min(width, height) * 0.45,
            );
            gradient.addColorStop(0, 'rgba(91,143,185,0.04)');
            gradient.addColorStop(0.5, 'rgba(91,143,185,0.02)');
            gradient.addColorStop(1, 'rgba(91,143,185,0)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);

            // Rotate
            A += 0.004;
            B += 0.002;

            // Slowly cycle some glyphs
            glyphCycleCounter++;
            if (glyphCycleCounter % 60 === 0) {
                // Fade old glyph entries
                const keys = Object.keys(glyphMap);
                if (keys.length > 200) {
                    for (let i = 0; i < 20; i++) {
                        const randKey = keys[Math.floor(Math.random() * keys.length)];
                        delete glyphMap[randKey];
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
            // Render single frame
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
            if (heroSystemLabel) heroSystemLabel.textContent = '';
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

        // Click to open modal
        card.addEventListener('click', () => {
            if (window.ModalSystem) window.ModalSystem.openBlenderModal(item);
        });
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (window.ModalSystem) window.ModalSystem.openBlenderModal(item);
            }
        });

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

        const grid = $('.blender-grid');
        if (!grid) return;

        grid.innerHTML = '';
        BLENDER_DATA.forEach((item) => {
            grid.appendChild(createBlenderCard(item));
        });
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

        if (built) built.textContent = SITE_DATA.footer.built;
    }

    /* =========================================================
     INITIALIZATION
  ========================================================= */

    function init() {
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
