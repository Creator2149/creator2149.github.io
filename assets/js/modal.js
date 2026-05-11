/**
 * modal.js — Immersive modal system
 *
 * Features:
 * - Animated open/close
 * - Close on overlay click
 * - Close on Escape key
 * - Keyboard accessible
 * - Responsive
 * - Works with projects, certificates, and blender items
 */

(function () {
    'use strict';

    let overlay = null;
    let modal = null;
    let isOpen = false;
    let lastFocusedElement = null;

    /** Create the modal overlay structure */
    function ensureModalStructure() {
        if (overlay) return;

        overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-label', 'Detail view');

        modal = document.createElement('div');
        modal.className = 'modal';

        // Close button
        const closeBtn = document.createElement('button');
        closeBtn.className = 'modal__close';
        closeBtn.setAttribute('aria-label', 'Close modal');
        closeBtn.innerHTML = '&times;';
        closeBtn.addEventListener('click', close);

        modal.appendChild(closeBtn);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        // Close on overlay click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) close();
        });

        // Trap focus within modal
        overlay.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                trapFocus(e);
            }
        });
    }

    /** Trap focus within the modal */
    function trapFocus(e) {
        const focusable = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
            if (document.activeElement === first) {
                e.preventDefault();
                last.focus();
            }
        } else {
            if (document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        }
    }

    /** Open modal with content */
    function open(contentHTML) {
        ensureModalStructure();
        lastFocusedElement = document.activeElement;

        // Set content
        const closeBtn = modal.querySelector('.modal__close');
        modal.innerHTML = '';
        modal.appendChild(closeBtn);
        modal.insertAdjacentHTML('beforeend', contentHTML);

        // Show
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        isOpen = true;

        // Focus the close button
        requestAnimationFrame(() => {
            closeBtn.focus();
        });

        // Escape key listener
        document.addEventListener('keydown', onEscape);
    }

    /** Close the modal */
    function close() {
        if (!isOpen) return;
        overlay.classList.remove('active');
        document.body.style.overflow = '';
        isOpen = false;

        // Restore focus
        if (lastFocusedElement) {
            lastFocusedElement.focus();
            lastFocusedElement = null;
        }

        document.removeEventListener('keydown', onEscape);
    }

    /** Handle Escape key */
    function onEscape(e) {
        if (e.key === 'Escape') close();
    }

    /** Generate project modal HTML */
    function openProjectModal(project) {
        let html = '<div class="modal__header">';
        html += '<div class="modal__label">PROJECT</div>';
        html += `<h2 class="modal__title">${escapeHTML(project.title)}</h2>`;

        // Meta row
        html += '<div style="display:flex;gap:1rem;align-items:center;margin-top:0.5rem;">';
        if (project.year)
            html += `<span style="font-family:var(--font-mono);font-size:0.75rem;color:var(--text-tertiary);">${escapeHTML(project.year)}</span>`;
        if (project.status)
            html += `<span style="font-family:var(--font-mono);font-size:0.75rem;color:var(--accent-amber);">${escapeHTML(project.status)}</span>`;
        html += '</div>';
        html += '</div>';

        html += '<div class="modal__body">';

        // Image
        if (project.image && project.image.trim()) {
            html += `<div style="margin-bottom:1.5rem;background:var(--bg-tertiary);border:1px solid var(--border);overflow:hidden;">
        <img src="${escapeHTML(project.image)}" alt="${escapeHTML(project.title)}" style="width:100%;display:block;object-fit:contain;background:var(--bg-tertiary);" loading="lazy" onerror="this.parentElement.innerHTML='<div class=no-image>NO PREVIEW</div>'">
      </div>`;
        }

        // Quote
        if (project.featuredQuote) {
            html += `<blockquote class="modal__quote">${escapeHTML(project.featuredQuote)}</blockquote>`;
        }

        // Long description
        if (project.longDescription) {
            html += `<p>${escapeHTML(project.longDescription)}</p>`;
        }

        // Architecture Notes
        if (project.architectureNotes) {
            html += '<div class="modal__section">';
            html += '<div class="modal__section-title">ARCHITECTURE</div>';
            html += `<p>${escapeHTML(project.architectureNotes)}</p>`;
            html += '</div>';
        }

        // Process Breakdown
        if (project.processBreakdown && project.processBreakdown.length) {
            html += '<div class="modal__section">';
            html += '<div class="modal__section-title">PROCESS</div>';
            html += '<ol class="modal__list">';
            project.processBreakdown.forEach((step) => {
                html += `<li>${escapeHTML(step)}</li>`;
            });
            html += '</ol></div>';
        }

        // Challenges
        if (project.challenges && project.challenges.length) {
            html += '<div class="modal__section">';
            html += '<div class="modal__section-title">CHALLENGES</div>';
            html += '<ul class="modal__list">';
            project.challenges.forEach((c) => {
                html += `<li>${escapeHTML(c)}</li>`;
            });
            html += '</ul></div>';
        }

        // Technical Highlights
        if (project.technicalHighlights && project.technicalHighlights.length) {
            html += '<div class="modal__section">';
            html += '<div class="modal__section-title">HIGHLIGHTS</div>';
            html += '<ul class="modal__list">';
            project.technicalHighlights.forEach((h) => {
                html += `<li>${escapeHTML(h)}</li>`;
            });
            html += '</ul></div>';
        }

        // Tech stack
        if (project.tech && project.tech.length) {
            html += '<div class="modal__tech">';
            project.tech.forEach((t) => {
                html += `<span class="modal__tech-tag">${escapeHTML(t)}</span>`;
            });
            html += '</div>';
        }

        // Tags
        if (project.tags && project.tags.length) {
            html += '<div style="display:flex;flex-wrap:wrap;gap:0.35rem;margin-top:1rem;align-items:center;">';
            project.tags.forEach((t, i) => {
                if (i > 0) html += '<span class="project-card__tag-separator">|</span>';
                html += `<span class="project-card__tag">${escapeHTML(t)}</span>`;
            });
            html += '</div>';
        }

        // Link
        if (project.link) {
            html += `<div style="margin-top:1.5rem;">
        <a href="${escapeHTML(project.link)}" target="_blank" rel="noopener noreferrer" class="featured-project__link" style="font-size:0.875rem;">View Repository &rarr;</a>
      </div>`;
        }

        html += '</div>';

        open(html);
    }

    /** Generate certificate modal HTML */
    function openCertificateModal(cert) {
        let html = '<div class="modal__header">';
        html += '<div class="modal__label">CERTIFICATE</div>';
        html += `<h2 class="modal__title">${escapeHTML(cert.title)}</h2>`;
        html += '<div style="display:flex;gap:1rem;align-items:center;margin-top:0.5rem;">';
        if (cert.year)
            html += `<span style="font-family:var(--font-mono);font-size:0.75rem;color:var(--text-tertiary);">${escapeHTML(String(cert.year))}</span>`;
        if (cert.field)
            html += `<span style="font-family:var(--font-mono);font-size:0.75rem;color:var(--accent-blue);">${escapeHTML(cert.field)}</span>`;
        html += '</div>';
        html += '</div>';

        html += '<div class="modal__body">';

        if (cert.issuer) {
            html += `<p><span style="font-family:var(--font-mono);font-size:0.75rem;color:var(--text-tertiary);letter-spacing:0.1em;">ISSUED BY</span><br>${escapeHTML(cert.issuer)}</p>`;
        }

        if (cert.description) {
            html += `<p>${escapeHTML(cert.description)}</p>`;
        }

        if (cert.image && cert.image.trim()) {
            html += `<div style="margin-top:1.5rem;border:1px solid var(--border);overflow:hidden;">
        <img src="${escapeHTML(cert.image)}" alt="${escapeHTML(cert.title)}" style="width:100%;display:block;" loading="lazy" onerror="this.parentElement.innerHTML='<div class=no-image>CERTIFICATE IMAGE</div>'">
      </div>`;
        }

        html += '</div>';

        open(html);
    }

    /** Generate blender modal HTML */
    function openBlenderModal(item) {
        let html = '<div class="modal__header">';
        html += '<div class="modal__label">BLENDER RENDER</div>';
        html += `<h2 class="modal__title">${escapeHTML(item.title)}</h2>`;
        html += '<div style="display:flex;gap:1rem;align-items:center;margin-top:0.5rem;">';
        if (item.date)
            html += `<span style="font-family:var(--font-mono);font-size:0.75rem;color:var(--text-tertiary);">${escapeHTML(item.date)}</span>`;
        if (item.renderEngine)
            html += `<span style="font-family:var(--font-mono);font-size:0.75rem;color:var(--accent-amber);">${escapeHTML(item.renderEngine)}</span>`;
        html += '</div>';
        html += '</div>';

        html += '<div class="modal__body">';

        // Large image
        if (item.image && item.image.trim()) {
            html += `<div style="margin-bottom:1.5rem;border:1px solid var(--border);overflow:hidden;background:var(--bg-tertiary);">
        <img src="${escapeHTML(item.image)}" alt="${escapeHTML(item.title)}" style="width:100%;display:block;" loading="lazy" onerror="this.parentElement.innerHTML='<div class=no-image style=\\'display:flex;align-items:center;justify-content:center;height:300px;font-family:var(--font-mono);font-size:0.8rem;color:var(--text-tertiary);\\'>NO RENDER</div>'">
      </div>`;
        }

        if (item.description) {
            html += `<p>${escapeHTML(item.description)}</p>`;
        }

        if (item.techniques && item.techniques.length) {
            html += '<div class="modal__section">';
            html += '<div class="modal__section-title">TECHNIQUES</div>';
            html += '<div class="modal__tech">';
            item.techniques.forEach((t) => {
                html += `<span class="modal__tech-tag">${escapeHTML(t)}</span>`;
            });
            html += '</div></div>';
        }

        html += '</div>';

        open(html);
    }

    /** Escape HTML to prevent XSS */
    function escapeHTML(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // Expose API
    window.ModalSystem = {
        open,
        close,
        openProjectModal,
        openCertificateModal,
        openBlenderModal,
    };
})();
