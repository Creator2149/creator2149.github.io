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
    brand.href = '/index.html';
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
        if (currentPath.endsWith(item.href.replace('/', '')) || (currentPath === '/' && item.href === '/index.html')) {
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
    toggle.innerHTML = '<span></span><span></span><span></span>';
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
    icon.textContent = '\u00A9'; // © symbol
    icon.setAttribute('role', 'button');
    icon.setAttribute('tabindex', '0');
    icon.setAttribute('aria-label', 'Copyright — triple-click for admin access');

    const text = document.createTextNode(` ${SITE.owner.copyright}`);

    p.appendChild(icon);
    p.appendChild(text);
    footer.appendChild(p);

    /* Triple-click detection for admin access */
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
            showAdminAccessModal();
        }
    };

    icon.addEventListener('click', handleTripleClick);

    /* Keyboard support */
    icon.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleTripleClick();
        }
    });
}

/* ── Admin Access Modal ─────────────────────────────────────── */

const ADMIN_HASH = 'c2102ea6340446722128b1db3b9ac26e59ed820b8898c4a69cbaf90b72012b72';

async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

function showAdminAccessModal() {
    /* Remove any existing overlay */
    const existing = document.querySelector('.admin-modal-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = 'admin-modal-overlay';

    const modal = document.createElement('div');
    modal.className = 'admin-modal';

    const title = document.createElement('h2');
    title.className = 'admin-modal__title';
    title.textContent = 'Admin Access';

    const input = document.createElement('input');
    input.className = 'admin-modal__input';
    input.type = 'password';
    input.placeholder = 'Enter password';
    input.setAttribute('autocomplete', 'off');

    const actions = document.createElement('div');
    actions.className = 'admin-modal__actions';

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'admin-modal__btn admin-modal__btn--cancel';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.addEventListener('click', () => overlay.remove());

    const confirmBtn = document.createElement('button');
    confirmBtn.className = 'admin-modal__btn admin-modal__btn--confirm';
    confirmBtn.textContent = 'Enter';
    confirmBtn.addEventListener('click', async () => {
        const hash = await sha256(input.value);
        if (hash === ADMIN_HASH) {
            window.location.href = '/admin.html';
        } else {
            input.value = '';
            input.style.borderColor = '#c47070';
            setTimeout(() => {
                input.style.borderColor = '';
            }, 1500);
        }
    });

    /* Enter key submits */
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') confirmBtn.click();
    });

    /* Escape key closes */
    overlay.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') overlay.remove();
    });

    /* Click outside closes */
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.remove();
    });

    actions.appendChild(cancelBtn);
    actions.appendChild(confirmBtn);
    modal.appendChild(title);
    modal.appendChild(input);
    modal.appendChild(actions);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    requestAnimationFrame(() => {
        overlay.classList.add('admin-modal-overlay--visible');
        input.focus();
    });
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
        placeholder.textContent = 'No preview';
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

    /* Link indicator */
    if (project.link) {
        const link = document.createElement('span');
        link.className = 'card__link';
        link.textContent = 'View project \u2192';
        body.appendChild(link);
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
        placeholder.textContent = 'No image';
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
        placeholder.textContent = 'No render';
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

function sortByNewest(items, dateKey = 'year') {
    return [...items].sort((a, b) => {
        const valA = a[dateKey];
        const valB = b[dateKey];
        /* Simple string comparison works for ISO dates and years */
        if (valA > valB) return -1;
        if (valA < valB) return 1;
        return 0;
    });
}

/* ── Init on DOMContentLoaded ───────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
    buildNavbar();
    buildFooter();
});
