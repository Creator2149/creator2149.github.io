/**
 * main.js — Shared initialisation and utilities
 *
 * Responsibilities:
 *   - Build the navbar from SITE.navigation
 *   - Build the footer from SITE.owner
 *   - Register the triple-click admin access on the copyright icon
 *   - Provide helper functions used across pages
 */

/* ── Navbar ─────────────────────────────────────────────────── */

function buildNavbar() {
    const inner = document.querySelector('.navbar__inner');
    if (!inner) return;

    /* Brand */
    const brand = document.createElement('a');
    brand.className = 'navbar__brand';
    brand.href = 'index.html';
    brand.textContent = SITE.owner.name;
    inner.appendChild(brand);

    /* Links */
    const links = document.createElement('nav');
    links.className = 'navbar__links';
    links.setAttribute('aria-label', 'Main navigation');

    const currentPath = window.location.pathname;
    SITE.navigation.forEach((item) => {
        const a = document.createElement('a');
        a.className = 'navbar__link';
        a.href = item.href;
        a.textContent = item.label;
        if (currentPath.endsWith(item.href) || (currentPath === '/' && item.href === 'index.html')) {
            a.classList.add('navbar__link--active');
        }
        links.appendChild(a);
    });
    inner.appendChild(links);

    /* Mobile toggle */
    const toggle = document.createElement('button');
    toggle.className = 'navbar__toggle';
    toggle.setAttribute('aria-label', 'Toggle navigation');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.innerHTML = '<i class="fas fa-bars"></i>';
    toggle.addEventListener('click', () => {
        const open = links.classList.toggle('navbar__links--open');
        toggle.classList.toggle('navbar__toggle--open', open);
        toggle.setAttribute('aria-expanded', String(open));
    });
    inner.appendChild(toggle);

    /* Close nav on link click (mobile) */
    links.addEventListener('click', (e) => {
        if (e.target.classList.contains('navbar__link')) {
            links.classList.remove('navbar__links--open');
            toggle.classList.remove('navbar__toggle--open');
            toggle.setAttribute('aria-expanded', 'false');
        }
    });
}

/* ── Footer ─────────────────────────────────────────────────── */

function buildFooter() {
    const footer = document.querySelector('.footer');
    if (!footer) return;

    const p = document.createElement('p');
    p.className = 'footer__copyright';

    const icon = document.createElement('span');
    icon.className = 'footer__copyright-icon';
    icon.textContent = '';
    icon.innerHTML = '<i class="fas fa-copyright"></i>';
    icon.setAttribute('role', 'button');
    icon.setAttribute('tabindex', '0');
    icon.setAttribute('aria-label', 'Copyright — triple-click for admin access');

    const text = document.createTextNode(` ${SITE.owner.copyright}`);
    p.appendChild(icon);
    p.appendChild(text);
    footer.appendChild(p);

    let clickCount = 0;
    let clickTimer = null;

    const handleTripleClick = () => {
        clickCount++;
        if (clickTimer) clearTimeout(clickTimer);
        clickTimer = setTimeout(() => {
            clickCount = 0;
        }, 500);

        if (clickCount >= 3) {
            clickCount = 0;
            clearTimeout(clickTimer);
            window.location.href = 'admin.html';
        }
    };

    icon.addEventListener('click', handleTripleClick);
    icon.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleTripleClick();
        }
    });
}

/* ── Admin Access Modal ─────────────────────────────────────── */

async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/* ── Utility helpers ────────────────────────────────────────── */

/**
 * Create a project card element.
 * @param {Object} project — project data object
 * @param {Function} onClick — callback when card is clicked (opens modal)
 * @returns {HTMLElement}
 */
function createProjectCard(project, onClick) {
    const card = document.createElement('article');
    card.className = 'card card--clickable';
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `View details for ${project.title}`);

    /* Image */
    if (project.image) {
        const img = document.createElement('img');
        img.className = 'card__image';
        img.src = project.image;
        img.alt = project.title;
        img.loading = 'lazy';
        card.appendChild(img);
    } else {
        const placeholder = document.createElement('div');
        placeholder.className = 'card__image-placeholder';
        card.appendChild(placeholder);
    }

    /* Body */
    const body = document.createElement('div');
    body.className = 'card__body';

    const title = document.createElement('h3');
    title.className = 'card__title';
    title.textContent = project.title;

    const meta = document.createElement('div');
    meta.className = 'card__meta';

    const statusClass = project.status.toLowerCase().replace(/\s+/g, '-');
    const status = document.createElement('span');
    status.className = `card__status card__status--${statusClass}`;
    status.textContent = project.status;

    const year = document.createElement('span');
    year.className = 'card__year';
    year.textContent = project.year;

    meta.appendChild(status);
    meta.appendChild(year);

    const desc = document.createElement('p');
    desc.className = 'card__description';
    desc.textContent = project.shortDescription;

    body.appendChild(title);
    body.appendChild(meta);
    body.appendChild(desc);

    /* Tech tags */
    if (project.tech && project.tech.length) {
        const tech = document.createElement('div');
        tech.className = 'card__tech';
        project.tech.forEach((t) => {
            const tag = document.createElement('span');
            tag.className = 'card__tech-tag';
            tag.textContent = t;
            tech.appendChild(tag);
        });
        body.appendChild(tech);
    }

    card.appendChild(body);

    /* Click handler */
    const openModal = () => onClick(project);
    card.addEventListener('click', openModal);
    card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openModal();
        }
    });

    return card;
}

/**
 * Create a certificate card element.
 * @param {Object} cert — certificate data object
 * @param {Function} onClick — callback for modal
 * @returns {HTMLElement}
 */
function createCertificateCard(cert, onClick) {
    const card = document.createElement('article');
    card.className = 'card card--clickable';
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `View details for ${cert.title}`);

    if (cert.image) {
        const img = document.createElement('img');
        img.className = 'card__image';
        img.src = cert.image;
        img.alt = cert.title;
        img.loading = 'lazy';
        card.appendChild(img);
    } else {
        const placeholder = document.createElement('div');
        placeholder.className = 'card__image-placeholder';
        card.appendChild(placeholder);
    }

    const body = document.createElement('div');
    body.className = 'card__body';

    const title = document.createElement('h3');
    title.className = 'card__title';
    title.textContent = cert.title;

    const meta = document.createElement('div');
    meta.className = 'card__meta';

    const field = document.createElement('span');
    field.className = 'card__field-tag';
    field.textContent = cert.field;

    const year = document.createElement('span');
    year.className = 'card__year';
    year.textContent = cert.year;

    meta.appendChild(field);
    meta.appendChild(year);

    body.appendChild(title);
    body.appendChild(meta);
    card.appendChild(body);

    const openModal = () => onClick(cert);
    card.addEventListener('click', openModal);
    card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openModal();
        }
    });

    return card;
}

/**
 * Create a Blender project card element.
 * @param {Object} item — blender data object
 * @param {Function} onClick — callback for modal
 * @returns {HTMLElement}
 */
function createBlenderCard(item, onClick) {
    const card = document.createElement('article');
    card.className = 'card card--clickable';
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `View details for ${item.title}`);

    if (item.image) {
        const img = document.createElement('img');
        img.className = 'card__image card__image--blender';
        img.src = item.image;
        img.alt = item.title;
        img.loading = 'lazy';
        card.appendChild(img);
    } else {
        const placeholder = document.createElement('div');
        placeholder.className = 'card__image-placeholder card__image-placeholder--blender';
        card.appendChild(placeholder);
    }

    const body = document.createElement('div');
    body.className = 'card__body';

    const title = document.createElement('h3');
    title.className = 'card__title';
    title.textContent = item.title;

    const meta = document.createElement('div');
    meta.className = 'card__meta';
    const date = document.createElement('span');
    date.className = 'card__year';
    date.textContent = item.date;
    meta.appendChild(date);

    body.appendChild(title);
    body.appendChild(meta);
    card.appendChild(body);

    const openModal = () => onClick(item);
    card.addEventListener('click', openModal);
    card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openModal();
        }
    });

    return card;
}

/* ── Sort helper: newest first ──────────────────────────────── */

function parseDate(dateStr) {
    if (!dateStr) return 0;

    /* Check if it's a simple year (e.g., "2024") */
    if (/^\d{4}$/.test(dateStr)) {
        return new Date(dateStr, 0, 1).getTime();
    }

    /* Parse "13th February, 2026" format */
    const dateRegex = /^(\d{1,2})(?:st|nd|rd|th)\s+(\w+),\s+(\d{4})$/;
    const match = dateStr.match(dateRegex);
    if (match) {
        const day = parseInt(match[1], 10);
        const month = match[2];
        const year = match[3];
        const dateObj = new Date(`${month} ${day}, ${year}`);
        return dateObj.getTime();
    }

    /* Fallback: try parsing as ISO date */
    try {
        return new Date(dateStr).getTime();
    } catch {
        return 0;
    }
}

function sortByNewest(items, dateKey = 'year') {
    return [...items].sort((a, b) => {
        const timeA = parseDate(a[dateKey]);
        const timeB = parseDate(b[dateKey]);
        return timeB - timeA; /* Descending (newest first) */
    });
}

/* ── Init on DOMContentLoaded ───────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
    buildNavbar();
    buildFooter();
});

/* ── Scroll Reveal Observer ─────────────────────────────────── */

function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal');
    if (!reveals.length) return;

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.1, rootMargin: '0px 0px -40px 0px' },
    );

    reveals.forEach((el) => observer.observe(el));
}

// Append to existing DOMContentLoaded
document.addEventListener('DOMContentLoaded', initScrollReveal);
