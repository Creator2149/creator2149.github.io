/**
 * admin.js — Admin panel logic
 *
 * Features:
 * - CRUD operations for projects, certificates, blender items
 * - Image upload with preview
 * - GitHub sync (PAT-based, session-only)
 * - Featured/homepage toggle per item
 * - Live UI updates without page reload
 * - Toast notifications
 * - Tab-based navigation
 *
 * Security:
 * - PAT never persisted (session only, stored in GitHub module)
 * - Admin password uses SHA-256 hash verification
 * - ADMIN_HASH placeholder for deployment
 */

(function () {
    'use strict';

    /* =========================================================
     ADMIN PASSWORD HASH
     =========================================================
     To set the admin password:
     1. Open browser console and run:
        const encoder = new TextEncoder();
        crypto.subtle.digest('SHA-256', encoder.encode('YOUR_PASSWORD'))
          .then(buf => Array.from(new Uint8Array(buf))
            .map(b => b.toString(16).padStart(2, '0')).join(''))
          .then(hash => console.log(hash));
     2. Copy the resulting hash string
     3. Replace REPLACE_THIS_HASH below with the hash
  ========================================================= */

    const ADMIN_HASH = 'c2102ea6340446722128b1db3b9ac26e59ed820b8898c4a69cbaf90b72012b72';

    // Local state (deep copies of data, modified through admin)
    let localProjects = [];
    let localCertificates = [];
    let localBlender = [];

    // Pending image uploads (stored as File objects)
    let pendingImages = {};

    // Current editing state
    let editingItem = null;
    let editingType = null;

    /* =========================================================
     INITIALIZATION
  ========================================================= */

    /* =========================================================
     LOGIN GATE
     =========================================================
     The admin page is locked behind a password prompt on
     every load. The SHA-256 hash is compared — same hash
     that was previously in main.js.
  ========================================================= */

    let isAuthenticated = false;

    async function verifyLogin(password) {
        if (!password) return false;
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
        return hashHex === ADMIN_HASH;
    }

    function initLoginGate() {
        const overlay = document.getElementById('admin-login-overlay');
        const input = document.getElementById('admin-login-input');
        const submitBtn = document.getElementById('admin-login-submit');
        const errorEl = document.getElementById('admin-login-error');

        if (!overlay || !input || !submitBtn) return;

        // Focus the input
        input.focus();

        async function attemptLogin() {
            const password = input.value;
            if (!password) return;

            submitBtn.textContent = 'Verifying...';
            submitBtn.disabled = true;

            const valid = await verifyLogin(password);

            if (valid) {
                isAuthenticated = true;
                overlay.classList.add('admin__login-overlay--dismissed');
                // Remove overlay from DOM after animation
                setTimeout(() => overlay.remove(), 400);
                // Now initialize the admin panel
                initAdminPanel();
            } else {
                errorEl.textContent = 'Incorrect password.';
                input.value = '';
                input.focus();
                submitBtn.textContent = 'Verify';
                submitBtn.disabled = false;
            }
        }

        submitBtn.addEventListener('click', attemptLogin);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') attemptLogin();
        });
    }

    function init() {
        // Check if we're on the admin page
        if (!document.querySelector('.admin')) return;

        // Initialize login gate first — blocks everything else
        initLoginGate();
    }

    function initAdminPanel() {
        // Deep copy data
        localProjects = JSON.parse(JSON.stringify(window.PROJECTS_DATA || []));
        localCertificates = JSON.parse(JSON.stringify(window.CERTIFICATES_DATA || []));
        localBlender = JSON.parse(JSON.stringify(window.BLENDER_DATA || []));

        // Initialize tabs
        initTabs();

        // Initialize PAT section
        initPATSection();

        // Render all lists
        renderProjectsList();
        renderCertificatesList();
        renderBlenderList();

        // Initialize sync bar
        initSyncBar();

        // Initialize add buttons
        initAddButtons();
    }

    /* =========================================================
     TABS
  ========================================================= */

    function initTabs() {
        const tabs = document.querySelectorAll('.admin__tab');
        const panels = document.querySelectorAll('.admin__panel');

        tabs.forEach((tab) => {
            tab.addEventListener('click', () => {
                const target = tab.dataset.tab;

                tabs.forEach((t) => t.classList.remove('active'));
                panels.forEach((p) => p.classList.remove('active'));

                tab.classList.add('active');
                const panel = document.querySelector(`.admin__panel[data-panel="${target}"]`);
                if (panel) panel.classList.add('active');
            });
        });

        // Update tab counts
        updateTabCounts();
    }

    function updateTabCounts() {
        const counts = {
            projects: localProjects.length,
            certificates: localCertificates.length,
            blender: localBlender.length,
        };

        document.querySelectorAll('.admin__tab').forEach((tab) => {
            const type = tab.dataset.tab;
            const countEl = tab.querySelector('.admin__tab-count');
            if (countEl && counts[type] !== undefined) {
                countEl.textContent = counts[type];
            }
        });
    }

    /* =========================================================
     PAT SECTION
  ========================================================= */

    function initPATSection() {
        const patInput = document.querySelector('.admin__pat-input');
        const patBtn = document.querySelector('.admin__pat-btn');
        const patStatus = document.querySelector('.admin__pat-status');

        if (!patInput || !patBtn) return;

        patBtn.addEventListener('click', async () => {
            const pat = patInput.value.trim();
            if (!pat) {
                setPATStatus('error', 'Enter a PAT');
                return;
            }

            setPATStatus('pending', 'Verifying...');
            window.GitHub.setPAT(pat);

            const result = await window.GitHub.validatePAT();
            if (result.valid) {
                setPATStatus('success', `Connected as ${result.username}`);
                patInput.type = 'password';
                patInput.disabled = true;
                patBtn.textContent = 'Reset';
                patBtn.addEventListener(
                    'click',
                    () => {
                        window.GitHub.clearPAT();
                        patInput.type = 'text';
                        patInput.disabled = false;
                        patInput.value = '';
                        patBtn.textContent = 'Connect';
                        setPATStatus('none', '');
                        initPATSection(); // Re-init
                    },
                    { once: true },
                );
            } else {
                setPATStatus('error', result.error);
                window.GitHub.clearPAT();
            }
        });
    }

    function setPATStatus(type, message) {
        const status = document.querySelector('.admin__pat-status');
        if (!status) return;

        status.textContent = message;
        status.className = 'admin__pat-status';
        if (type === 'success') {
            status.style.color = '#22c55e';
        } else if (type === 'error') {
            status.style.color = '#ef4444';
        } else if (type === 'pending') {
            status.style.color = 'var(--accent-amber)';
        } else {
            status.style.color = 'var(--text-tertiary)';
        }
    }

    /* =========================================================
     PROJECTS CRUD
  ========================================================= */

    function renderProjectsList() {
        const list = document.querySelector('.admin-projects-list');
        if (!list) return;

        list.innerHTML = '';

        if (localProjects.length === 0) {
            list.innerHTML =
                '<div style="color:var(--text-tertiary);padding:2rem;text-align:center;font-family:var(--font-mono);font-size:0.8rem;">No projects yet. Add one above.</div>';
            return;
        }

        localProjects.forEach((project, index) => {
            const item = document.createElement('div');
            item.className = 'admin__list-item' + (project.flagship ? ' flagship' : '');

            item.innerHTML = `
        <div class="admin__list-item-info">
          <div class="admin__list-item-title">${escapeHTML(project.title)}</div>
          <div class="admin__list-item-meta">
            ${escapeHTML(project.year)} · ${escapeHTML(project.status || 'No status')}
            ${project.flagship ? ' · FLAGSHIP' : ''}
            ${project.featuredOnHome ? ' · ON HOME' : ''}
          </div>
        </div>
        <div class="admin__list-item-actions">
          <button class="btn btn--secondary btn--small" onclick="AdminApp.editProject(${index})">Edit</button>
          <button class="btn btn--danger btn--small" onclick="AdminApp.deleteProject(${index})">Delete</button>
        </div>
      `;

            list.appendChild(item);
        });

        updateTabCounts();
    }

    function showProjectForm(project = null, index = -1) {
        const formContainer = document.querySelector('.admin-project-form');
        if (!formContainer) return;

        const isEdit = project !== null;
        editingItem = project;
        editingType = isEdit ? 'project' : null;

        formContainer.innerHTML = `
      <div class="admin__form">
        <h3 style="font-family:'JetBrains Mono',monospace;font-size:0.9rem;color:var(--text-primary);margin-bottom:1.5rem;">
          ${isEdit ? 'Edit Project' : 'Add Project'}
        </h3>

        <div class="admin__form-group">
          <label class="admin__form-label">Title</label>
          <input class="admin__form-input" type="text" id="proj-title" value="${isEdit ? escapeHTML(project.title) : ''}" required>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
          <div class="admin__form-group">
            <label class="admin__form-label">Year</label>
            <input class="admin__form-input" type="text" id="proj-year" value="${isEdit ? escapeHTML(project.year) : new Date().getFullYear()}">
          </div>
          <div class="admin__form-group">
            <label class="admin__form-label">Status</label>
            <input class="admin__form-input" type="text" id="proj-status" value="${isEdit ? escapeHTML(project.status || '') : ''}" placeholder="e.g. In Development">
          </div>
        </div>

        <div class="admin__form-group">
          <label class="admin__form-label">Status Details</label>
          <input class="admin__form-input" type="text" id="proj-status-details" value="${isEdit ? escapeHTML(project.statusDetails || '') : ''}">
        </div>

        <div class="admin__form-group">
          <label class="admin__form-label">Tech Stack (comma-separated)</label>
          <input class="admin__form-input" type="text" id="proj-tech" value="${isEdit ? escapeHTML((project.tech || []).join(', ')) : ''}" placeholder="C++, Python, OpenGL">
        </div>

        <div class="admin__form-group">
          <label class="admin__form-label">Short Description</label>
          <textarea class="admin__form-textarea" id="proj-short-desc" rows="2">${isEdit ? escapeHTML(project.shortDescription || '') : ''}</textarea>
        </div>

        <div class="admin__form-group">
          <label class="admin__form-label">Long Description</label>
          <textarea class="admin__form-textarea" id="proj-long-desc" rows="4">${isEdit ? escapeHTML(project.longDescription || '') : ''}</textarea>
        </div>

        <div class="admin__form-group">
          <label class="admin__form-label">Featured Quote</label>
          <textarea class="admin__form-textarea" id="proj-quote" rows="2">${isEdit ? escapeHTML(project.featuredQuote || '') : ''}</textarea>
        </div>

        <div class="admin__form-group">
          <label class="admin__form-label">Architecture Notes</label>
          <textarea class="admin__form-textarea" id="proj-arch" rows="3">${isEdit ? escapeHTML(project.architectureNotes || '') : ''}</textarea>
        </div>

        <div class="admin__form-group">
          <label class="admin__form-label">Link (GitHub/Live)</label>
          <input class="admin__form-input" type="url" id="proj-link" value="${isEdit ? escapeHTML(project.link || '') : ''}">
        </div>

        <div class="admin__form-group">
          <label class="admin__form-label">Tags (comma-separated)</label>
          <input class="admin__form-input" type="text" id="proj-tags" value="${isEdit ? escapeHTML((project.tags || []).join(', ')) : ''}">
        </div>

        <div class="admin__form-group">
          <label class="admin__form-toggle">
            <input type="checkbox" id="proj-flagship" ${isEdit && project.flagship ? 'checked' : ''}>
            <span class="admin__form-toggle-label">Flagship (homepage centerpiece)</span>
          </label>
        </div>
        <div class="admin__form-group">
          <label class="admin__form-toggle">
            <input type="checkbox" id="proj-home" ${isEdit && project.featuredOnHome ? 'checked' : ''}>
            <span class="admin__form-toggle-label">Show on Homepage</span>
          </label>
        </div>

        <div class="admin__form-group">
          <label class="admin__form-label">Image</label>
          <div class="admin__image-drop" id="proj-image-drop">
            <div class="admin__image-drop-text">Click or drop image here</div>
            <input type="file" accept="image/*" id="proj-image-input" style="display:none">
          </div>
          <div class="admin__form-file-name" id="proj-image-name">${isEdit && project.image ? escapeHTML(project.image) : 'No image selected'}</div>
          ${isEdit && project.image ? `<img class="admin__form-image-preview" src="${escapeHTML(project.image)}" alt="Preview" onerror="this.style.display='none'">` : ''}
        </div>

        <div class="admin__form-actions">
          <button class="btn btn--primary" id="proj-save">${isEdit ? 'Update' : 'Add'} Project</button>
          <button class="btn btn--secondary" id="proj-cancel">Cancel</button>
        </div>
      </div>
    `;

        // Image upload handlers
        const imageDrop = document.getElementById('proj-image-drop');
        const imageInput = document.getElementById('proj-image-input');
        const imageName = document.getElementById('proj-image-name');

        imageDrop.addEventListener('click', () => imageInput.click());
        imageInput.addEventListener('change', (e) => {
            if (e.target.files[0]) {
                imageName.textContent = e.target.files[0].name;
                pendingImages.projects = e.target.files[0];
            }
        });

        // Save handler
        document.getElementById('proj-save').addEventListener('click', () => {
            saveProject(isEdit ? index : -1);
        });

        // Cancel handler
        document.getElementById('proj-cancel').addEventListener('click', () => {
            formContainer.innerHTML = '';
            editingItem = null;
            editingType = null;
        });
    }

    function saveProject(index) {
        const title = document.getElementById('proj-title').value.trim();
        if (!title) {
            showToast('Title is required', 'error');
            return;
        }

        const techStr = document.getElementById('proj-tech').value.trim();
        const tagsStr = document.getElementById('proj-tags').value.trim();

        const project = {
            id:
                index >= 0 && localProjects[index]
                    ? localProjects[index].id
                    : title
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, '-')
                          .replace(/^-|-$/g, ''),
            title: title,
            year: document.getElementById('proj-year').value.trim() || String(new Date().getFullYear()),
            status: document.getElementById('proj-status').value.trim() || '',
            statusDetails: document.getElementById('proj-status-details').value.trim() || '',
            tech: techStr
                ? techStr
                      .split(',')
                      .map((t) => t.trim())
                      .filter(Boolean)
                : [],
            shortDescription: document.getElementById('proj-short-desc').value.trim() || '',
            longDescription: document.getElementById('proj-long-desc').value.trim() || '',
            featuredQuote: document.getElementById('proj-quote').value.trim() || '',
            architectureNotes: document.getElementById('proj-arch').value.trim() || '',
            link: document.getElementById('proj-link').value.trim() || '',
            tags: tagsStr
                ? tagsStr
                      .split(',')
                      .map((t) => t.trim())
                      .filter(Boolean)
                : [],
            flagship: document.getElementById('proj-flagship').checked,
            featuredOnHome: document.getElementById('proj-home').checked,
            image: index >= 0 && localProjects[index] ? localProjects[index].image : '',
        };

        // Preserve additional fields from existing item
        if (index >= 0 && localProjects[index]) {
            const existing = localProjects[index];
            if (existing.processBreakdown) project.processBreakdown = existing.processBreakdown;
            if (existing.challenges) project.challenges = existing.challenges;
            if (existing.technicalHighlights) project.technicalHighlights = existing.technicalHighlights;
        }

        if (index >= 0) {
            localProjects[index] = project;
        } else {
            localProjects.push(project);
        }

        renderProjectsList();
        document.querySelector('.admin-project-form').innerHTML = '';
        showToast(`Project ${index >= 0 ? 'updated' : 'added'}: ${title}`, 'success');
    }

    function deleteProject(index) {
        const project = localProjects[index];
        if (!project) return;

        if (!confirm(`Delete "${project.title}"? This cannot be undone.`)) return;

        localProjects.splice(index, 1);
        renderProjectsList();
        showToast(`Deleted: ${project.title}`, 'info');
    }

    function editProject(index) {
        showProjectForm(localProjects[index], index);
        scrollToForm('.admin-project-form');
    }

    /* =========================================================
     CERTIFICATES CRUD
  ========================================================= */

    function renderCertificatesList() {
        const list = document.querySelector('.admin-certificates-list');
        if (!list) return;

        list.innerHTML = '';

        if (localCertificates.length === 0) {
            list.innerHTML =
                '<div style="color:var(--text-tertiary);padding:2rem;text-align:center;font-family:var(--font-mono);font-size:0.8rem;">No certificates yet. Add one above.</div>';
            return;
        }

        localCertificates.forEach((cert, index) => {
            const item = document.createElement('div');
            item.className = 'admin__list-item';

            item.innerHTML = `
        <div class="admin__list-item-info">
          <div class="admin__list-item-title">${escapeHTML(cert.title)}</div>
          <div class="admin__list-item-meta">
            ${escapeHTML(String(cert.year))} · ${escapeHTML(cert.field || 'No field')}

          </div>
        </div>
        <div class="admin__list-item-actions">
          <button class="btn btn--secondary btn--small" onclick="AdminApp.editCertificate(${index})">Edit</button>
          <button class="btn btn--danger btn--small" onclick="AdminApp.deleteCertificate(${index})">Delete</button>
        </div>
      `;

            list.appendChild(item);
        });

        updateTabCounts();
    }

    function showCertificateForm(cert = null, index = -1) {
        const formContainer = document.querySelector('.admin-certificate-form');
        if (!formContainer) return;

        const isEdit = cert !== null;

        formContainer.innerHTML = `
      <div class="admin__form">
        <h3 style="font-family:'JetBrains Mono',monospace;font-size:0.9rem;color:var(--text-primary);margin-bottom:1.5rem;">
          ${isEdit ? 'Edit Certificate' : 'Add Certificate'}
        </h3>

        <div class="admin__form-group">
          <label class="admin__form-label">Title</label>
          <input class="admin__form-input" type="text" id="cert-title" value="${isEdit ? escapeHTML(cert.title) : ''}" required>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
          <div class="admin__form-group">
            <label class="admin__form-label">Year</label>
            <input class="admin__form-input" type="text" id="cert-year" value="${isEdit ? escapeHTML(String(cert.year)) : new Date().getFullYear()}">
          </div>
          <div class="admin__form-group">
            <label class="admin__form-label">Field</label>
            <input class="admin__form-input" type="text" id="cert-field" value="${isEdit ? escapeHTML(cert.field || '') : ''}">
          </div>
        </div>

        <div class="admin__form-group">
          <label class="admin__form-label">Issuer</label>
          <input class="admin__form-input" type="text" id="cert-issuer" value="${isEdit ? escapeHTML(cert.issuer || '') : ''}">
        </div>

        <div class="admin__form-group">
          <label class="admin__form-label">Description</label>
          <textarea class="admin__form-textarea" id="cert-desc" rows="2">${isEdit ? escapeHTML(cert.description || '') : ''}</textarea>
        </div>

        <div class="admin__form-group">
          <label class="admin__form-label">Image</label>
          <div class="admin__image-drop" id="cert-image-drop">
            <div class="admin__image-drop-text">Click or drop image here</div>
            <input type="file" accept="image/*" id="cert-image-input" style="display:none">
          </div>
          <div class="admin__form-file-name" id="cert-image-name">${isEdit && cert.image ? escapeHTML(cert.image) : 'No image selected'}</div>
          ${isEdit && cert.image ? `<img class="admin__form-image-preview" src="${escapeHTML(cert.image)}" alt="Preview" onerror="this.style.display='none'">` : ''}
        </div>

        <div class="admin__form-actions">
          <button class="btn btn--primary" id="cert-save">${isEdit ? 'Update' : 'Add'} Certificate</button>
          <button class="btn btn--secondary" id="cert-cancel">Cancel</button>
        </div>
      </div>
    `;

        const imageDrop = document.getElementById('cert-image-drop');
        const imageInput = document.getElementById('cert-image-input');
        const imageName = document.getElementById('cert-image-name');

        imageDrop.addEventListener('click', () => imageInput.click());
        imageInput.addEventListener('change', (e) => {
            if (e.target.files[0]) {
                imageName.textContent = e.target.files[0].name;
                pendingImages.certificates = e.target.files[0];
            }
        });

        document.getElementById('cert-save').addEventListener('click', () => {
            saveCertificate(isEdit ? index : -1);
        });

        document.getElementById('cert-cancel').addEventListener('click', () => {
            formContainer.innerHTML = '';
        });
    }

    function saveCertificate(index) {
        const title = document.getElementById('cert-title').value.trim();
        if (!title) {
            showToast('Title is required', 'error');
            return;
        }

        const cert = {
            id:
                index >= 0 && localCertificates[index]
                    ? localCertificates[index].id
                    : title
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, '-')
                          .replace(/^-|-$/g, ''),
            title: title,
            year: document.getElementById('cert-year').value.trim() || String(new Date().getFullYear()),
            field: document.getElementById('cert-field').value.trim() || '',
            issuer: document.getElementById('cert-issuer').value.trim() || '',
            description: document.getElementById('cert-desc').value.trim() || '',
            image: index >= 0 && localCertificates[index] ? localCertificates[index].image : '',
        };

        if (index >= 0) {
            localCertificates[index] = cert;
        } else {
            localCertificates.push(cert);
        }

        renderCertificatesList();
        document.querySelector('.admin-certificate-form').innerHTML = '';
        showToast(`Certificate ${index >= 0 ? 'updated' : 'added'}: ${title}`, 'success');
    }

    function deleteCertificate(index) {
        const cert = localCertificates[index];
        if (!cert) return;
        if (!confirm(`Delete "${cert.title}"?`)) return;

        localCertificates.splice(index, 1);
        renderCertificatesList();
        showToast(`Deleted: ${cert.title}`, 'info');
    }

    function editCertificate(index) {
        showCertificateForm(localCertificates[index], index);
        scrollToForm('.admin-certificate-form');
    }

    /* =========================================================
     BLENDER CRUD
  ========================================================= */

    function renderBlenderList() {
        const list = document.querySelector('.admin-blender-list');
        if (!list) return;

        list.innerHTML = '';

        if (localBlender.length === 0) {
            list.innerHTML =
                '<div style="color:var(--text-tertiary);padding:2rem;text-align:center;font-family:var(--font-mono);font-size:0.8rem;">No blender items yet. Add one above.</div>';
            return;
        }

        localBlender.forEach((item, index) => {
            const el = document.createElement('div');
            el.className = 'admin__list-item';

            el.innerHTML = `
        <div class="admin__list-item-info">
          <div class="admin__list-item-title">${escapeHTML(item.title)}</div>
          <div class="admin__list-item-meta">
            ${escapeHTML(item.date || '')} · ${escapeHTML(item.renderEngine || 'No engine')}
            ${item.featuredOnHome ? ' · ON HOME' : ''}
          </div>
        </div>
        <div class="admin__list-item-actions">
          <button class="btn btn--secondary btn--small" onclick="AdminApp.editBlender(${index})">Edit</button>
          <button class="btn btn--danger btn--small" onclick="AdminApp.deleteBlender(${index})">Delete</button>
        </div>
      `;

            list.appendChild(el);
        });

        updateTabCounts();
    }

    function showBlenderForm(item = null, index = -1) {
        const formContainer = document.querySelector('.admin-blender-form');
        if (!formContainer) return;

        const isEdit = item !== null;

        formContainer.innerHTML = `
      <div class="admin__form">
        <h3 style="font-family:'JetBrains Mono',monospace;font-size:0.9rem;color:var(--text-primary);margin-bottom:1.5rem;">
          ${isEdit ? 'Edit Blender Render' : 'Add Blender Render'}
        </h3>

        <div class="admin__form-group">
          <label class="admin__form-label">Title</label>
          <input class="admin__form-input" type="text" id="blend-title" value="${isEdit ? escapeHTML(item.title) : ''}" required>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
          <div class="admin__form-group">
            <label class="admin__form-label">Date</label>
            <input class="admin__form-input" type="text" id="blend-date" value="${isEdit ? escapeHTML(item.date || '') : new Date().toISOString().slice(0, 7)}" placeholder="YYYY-MM">
          </div>
          <div class="admin__form-group">
            <label class="admin__form-label">Render Engine</label>
            <input class="admin__form-input" type="text" id="blend-engine" value="${isEdit ? escapeHTML(item.renderEngine || '') : ''}" placeholder="Cycles / EEVEE">
          </div>
        </div>

        <div class="admin__form-group">
          <label class="admin__form-label">Description</label>
          <textarea class="admin__form-textarea" id="blend-desc" rows="3">${isEdit ? escapeHTML(item.description || '') : ''}</textarea>
        </div>

        <div class="admin__form-group">
          <label class="admin__form-label">Techniques (comma-separated)</label>
          <input class="admin__form-input" type="text" id="blend-techniques" value="${isEdit ? escapeHTML((item.techniques || []).join(', ')) : ''}">
        </div>

        <div class="admin__form-group">
          <label class="admin__form-toggle">
            <input type="checkbox" id="blend-home" ${isEdit && item.featuredOnHome ? 'checked' : ''}>
            <span class="admin__form-toggle-label">Show on Homepage</span>
          </label>
        </div>

        <div class="admin__form-group">
          <label class="admin__form-label">Render Image</label>
          <div class="admin__image-drop" id="blend-image-drop">
            <div class="admin__image-drop-text">Click or drop image here</div>
            <input type="file" accept="image/*" id="blend-image-input" style="display:none">
          </div>
          <div class="admin__form-file-name" id="blend-image-name">${isEdit && item.image ? escapeHTML(item.image) : 'No image selected'}</div>
          ${isEdit && item.image ? `<img class="admin__form-image-preview" src="${escapeHTML(item.image)}" alt="Preview" onerror="this.style.display='none'">` : ''}
        </div>

        <div class="admin__form-actions">
          <button class="btn btn--primary" id="blend-save">${isEdit ? 'Update' : 'Add'} Render</button>
          <button class="btn btn--secondary" id="blend-cancel">Cancel</button>
        </div>
      </div>
    `;

        const imageDrop = document.getElementById('blend-image-drop');
        const imageInput = document.getElementById('blend-image-input');
        const imageName = document.getElementById('blend-image-name');

        imageDrop.addEventListener('click', () => imageInput.click());
        imageInput.addEventListener('change', (e) => {
            if (e.target.files[0]) {
                imageName.textContent = e.target.files[0].name;
                pendingImages.blender = e.target.files[0];
            }
        });

        document.getElementById('blend-save').addEventListener('click', () => {
            saveBlender(isEdit ? index : -1);
        });

        document.getElementById('blend-cancel').addEventListener('click', () => {
            formContainer.innerHTML = '';
        });
    }

    function saveBlender(index) {
        const title = document.getElementById('blend-title').value.trim();
        if (!title) {
            showToast('Title is required', 'error');
            return;
        }

        const techStr = document.getElementById('blend-techniques').value.trim();

        const item = {
            id:
                index >= 0 && localBlender[index]
                    ? localBlender[index].id
                    : title
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, '-')
                          .replace(/^-|-$/g, ''),
            title: title,
            date: document.getElementById('blend-date').value.trim() || '',
            renderEngine: document.getElementById('blend-engine').value.trim() || '',
            description: document.getElementById('blend-desc').value.trim() || '',
            techniques: techStr
                ? techStr
                      .split(',')
                      .map((t) => t.trim())
                      .filter(Boolean)
                : [],
            featuredOnHome: document.getElementById('blend-home').checked,
            image: index >= 0 && localBlender[index] ? localBlender[index].image : '',
        };

        if (index >= 0) {
            localBlender[index] = item;
        } else {
            localBlender.push(item);
        }

        renderBlenderList();
        document.querySelector('.admin-blender-form').innerHTML = '';
        showToast(`Render ${index >= 0 ? 'updated' : 'added'}: ${title}`, 'success');
    }

    function deleteBlender(index) {
        const item = localBlender[index];
        if (!item) return;
        if (!confirm(`Delete "${item.title}"?`)) return;

        localBlender.splice(index, 1);
        renderBlenderList();
        showToast(`Deleted: ${item.title}`, 'info');
    }

    function editBlender(index) {
        showBlenderForm(localBlender[index], index);
        scrollToForm('.admin-blender-form');
    }

    /* =========================================================
     SCROLL TO FORM
  ========================================================= */

    function scrollToForm(selector) {
        requestAnimationFrame(() => {
            const form = document.querySelector(selector);
            if (form) {
                form.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }

    /* =========================================================
     SYNC TO GITHUB
  ========================================================= */

    function initSyncBar() {
        const syncBtn = document.querySelector('.admin__sync-btn');
        if (!syncBtn) return;

        syncBtn.addEventListener('click', syncToGitHub);
    }

    async function syncToGitHub() {
        if (!window.GitHub || !window.GitHub.hasPAT()) {
            showToast('Connect a PAT first', 'error');
            return;
        }

        const syncStatus = document.querySelector('.admin__sync-status');
        if (syncStatus) syncStatus.textContent = 'Syncing...';

        try {
            // Upload pending images
            for (const [category, file] of Object.entries(pendingImages)) {
                try {
                    const result = await window.GitHub.uploadImage(category, file);
                    // Update the image path in local data
                    const filename = window.GitHub.sanitizeFilename(file.name);
                    const imagePath = window.GitHub.getImageUrl(category, filename);

                    // Find the item that was being edited and update its image path
                    if (category === 'projects') {
                        // Update last edited project
                    } else if (category === 'certificates') {
                        // Update last edited cert
                    } else if (category === 'blender') {
                        // Update last edited blender item
                    }
                } catch (err) {
                    showToast(`Image upload failed: ${err.message}`, 'error');
                }
            }

            // Clear pending images
            pendingImages = {};

            // Generate and upload data files
            const projectsContent = generateDataFile('PROJECTS_DATA', localProjects);
            const certificatesContent = generateDataFile('CERTIFICATES_DATA', localCertificates);
            const blenderContent = generateDataFile('BLENDER_DATA', localBlender);

            await window.GitHub.updateDataFile('projects', projectsContent);
            await window.GitHub.updateDataFile('certificates', certificatesContent);
            await window.GitHub.updateDataFile('blender', blenderContent);

            if (syncStatus) syncStatus.textContent = 'Last synced: ' + new Date().toLocaleTimeString();
            showToast('All changes synced to GitHub', 'success');
        } catch (err) {
            if (syncStatus) syncStatus.textContent = 'Sync failed';
            showToast(`Sync error: ${err.message}`, 'error');
        }
    }

    function generateDataFile(variableName, data) {
        const json = JSON.stringify(data, null, 2);
        return `const ${variableName} = ${json};\n\nwindow.${variableName} = ${variableName};`;
    }

    /* =========================================================
     TOAST NOTIFICATIONS
  ========================================================= */

    function showToast(message, type = 'info') {
        let container = document.querySelector('.admin__toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'admin__toast-container';
            container.style.cssText =
                'position:fixed;bottom:4rem;right:2rem;z-index:5000;display:flex;flex-direction:column;gap:0.5rem;';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `admin__toast admin__toast--${type}`;
        toast.textContent = message;
        container.appendChild(toast);

        requestAnimationFrame(() => toast.classList.add('show'));

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    /* =========================================================
     UTILITY
  ========================================================= */

    function escapeHTML(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    /* =========================================================
     EXPOSE API FOR INLINE EVENT HANDLERS
  ========================================================= */

    window.AdminApp = {
        editProject,
        deleteProject,
        editCertificate,
        deleteCertificate,
        editBlender,
        deleteBlender,
        showToast,
    };

    // Add project/cert/blender buttons
    function initAddButtons() {
        const addProjBtn = document.querySelector('.admin-add-project-btn');
        const addCertBtn = document.querySelector('.admin-add-cert-btn');
        const addBlendBtn = document.querySelector('.admin-add-blend-btn');

        if (addProjBtn)
            addProjBtn.addEventListener('click', () => {
                showProjectForm();
                scrollToForm('.admin-project-form');
            });
        if (addCertBtn)
            addCertBtn.addEventListener('click', () => {
                showCertificateForm();
                scrollToForm('.admin-certificate-form');
            });
        if (addBlendBtn)
            addBlendBtn.addEventListener('click', () => {
                showBlenderForm();
                scrollToForm('.admin-blender-form');
            });
    }

    /* =========================================================
     INIT
  ========================================================= */

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
