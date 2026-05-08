/**
 * modal.js — Modal system
 *
 * Provides a single reusable modal system for projects,
 * certificates, and Blender renders.
 *
 * Usage:
 *   openModal(contentHTML)  — opens the overlay with custom HTML
 *   closeModal()            — closes the overlay
 */

let _modalOverlay = null;

/**
 * Ensure a single overlay element exists in the DOM.
 * Returns the overlay element.
 */
function ensureModalOverlay() {
  if (_modalOverlay) return _modalOverlay;

  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-label", "Detail view");

  /* Close on outside click */
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeModal();
  });

  document.body.appendChild(overlay);
  _modalOverlay = overlay;
  return overlay;
}

/**
 * Open a modal with the given inner HTML.
 * @param {string} html — inner HTML for the modal content
 */
function openModal(html) {
  const overlay = ensureModalOverlay();

  /* Remove old content */
  const oldModal = overlay.querySelector(".modal");
  if (oldModal) oldModal.remove();

  /* Create modal shell */
  const modal = document.createElement("div");
  modal.className = "modal";
  modal.innerHTML = html;

  /* Close button */
  const closeBtn = document.createElement("button");
  closeBtn.className = "modal__close";
  closeBtn.setAttribute("aria-label", "Close modal");
  closeBtn.innerHTML = "&times;";
  closeBtn.addEventListener("click", closeModal);
  modal.prepend(closeBtn);

  overlay.appendChild(modal);

  /* Show */
  requestAnimationFrame(() => {
    overlay.classList.add("modal-overlay--visible");
  });

  /* Trap focus */
  modal.focus();

  /* Register escape key listener */
  document.addEventListener("keydown", _modalEscHandler);

  /* Prevent body scroll */
  document.body.style.overflow = "hidden";
}

/**
 * Close the modal overlay.
 */
function closeModal() {
  if (!_modalOverlay) return;
  _modalOverlay.classList.remove("modal-overlay--visible");
  document.removeEventListener("keydown", _modalEscHandler);
  document.body.style.overflow = "";
}

function _modalEscHandler(e) {
  if (e.key === "Escape") closeModal();
}

/* ── Content builders ───────────────────────────────────────── */

/**
 * Build modal HTML for a project.
 * @param {Object} project
 * @returns {string}
 */
function buildProjectModalHTML(project) {
  let imageSection = "";
  if (project.image) {
    imageSection = `<img class="modal__image" src="${project.image}" alt="${project.title}" />`;
  } else {
    imageSection = `<div class="modal__image-placeholder">No preview available</div>`;
  }

  const statusClass = project.status.toLowerCase().replace(/\s+/g, "-");

  let techHTML = "";
  if (project.tech && project.tech.length) {
    techHTML = `<div class="modal__tech">${project.tech
      .map((t) => `<span class="card__tech-tag">${t}</span>`)
      .join("")}</div>`;
  }

  let linkHTML = "";
  if (project.link) {
    linkHTML = `<a class="modal__link" href="${project.link}" target="_blank" rel="noopener noreferrer">View project &rarr;</a>`;
  }

  return `
    ${imageSection}
    <div class="modal__body">
      <h2 class="modal__title">${project.title}</h2>
      <div class="modal__meta">
        <span class="card__status card__status--${statusClass}">${project.status}</span>
        <span class="card__year">${project.year}</span>
      </div>
      <p class="modal__description">${project.longDescription}</p>
      ${techHTML}
      ${linkHTML}
    </div>
  `;
}

/**
 * Build modal HTML for a certificate.
 * @param {Object} cert
 * @returns {string}
 */
function buildCertificateModalHTML(cert) {
  let imageSection = "";
  if (cert.image) {
    imageSection = `<img class="modal__image" src="${cert.image}" alt="${cert.title}" />`;
  } else {
    imageSection = `<div class="modal__image-placeholder">No image available</div>`;
  }

  return `
    ${imageSection}
    <div class="modal__body">
      <h2 class="modal__title">${cert.title}</h2>
      <div class="modal__meta">
        <span class="card__field-tag">${cert.field}</span>
        <span class="card__year">${cert.year}</span>
      </div>
    </div>
  `;
}

/**
 * Build modal HTML for a Blender project.
 * @param {Object} item
 * @returns {string}
 */
function buildBlenderModalHTML(item) {
  let imageSection = "";
  if (item.image) {
    imageSection = `<img class="modal__image modal__image--blender" src="${item.image}" alt="${item.title}" />`;
  } else {
    imageSection = `<div class="modal__image-placeholder modal__image-placeholder--blender">No render available</div>`;
  }

  return `
    ${imageSection}
    <div class="modal__body">
      <h2 class="modal__title">${item.title}</h2>
      <div class="modal__meta">
        <span class="card__year">${item.date}</span>
      </div>
    </div>
  `;
}

/**
 * Convenience: open a project modal.
 */
function openProjectModal(project) {
  openModal(buildProjectModalHTML(project));
}

/**
 * Convenience: open a certificate modal.
 */
function openCertificateModal(cert) {
  openModal(buildCertificateModalHTML(cert));
}

/**
 * Convenience: open a Blender modal.
 */
function openBlenderModal(item) {
  openModal(buildBlenderModalHTML(item));
}
