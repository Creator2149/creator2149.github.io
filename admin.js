/**
 * Admin Logic for Portfolio
 */

const ADMIN_HASH = 'cae0dd875c4b3d94bddc6f8cd3f772f705d800d1afb36ca7eeffd5031a57ad05'; // "rishit2026"

async function hashPassphrase(str) {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

const adminUI = {
    pendingFiles: {},

    init() {
        this.loginBtn = document.getElementById('admin-login-btn');
        this.passphraseInput = document.getElementById('admin-passphrase');
        this.errorMsg = document.getElementById('admin-error');
        this.overlay = document.getElementById('admin-auth-overlay');
        this.mainContent = document.getElementById('admin-main');
        this.patInput = document.getElementById('github-pat');
        this.pushBtn = document.getElementById('push-changes-btn');

        this.loginBtn.addEventListener('click', () => this.handleLogin());
        this.passphraseInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleLogin();
        });

        this.pushBtn.addEventListener('click', () => this.syncToGitHub('All changes synced successfully!'));

        // Initialize lists
        this.renderLists();
    },

    async handleLogin() {
        const input = this.passphraseInput.value.trim();
        const hash = await hashPassphrase(input);
        if (hash === ADMIN_HASH) {
            this.overlay.classList.add('hidden');
            this.mainContent.classList.remove('hidden');
        } else {
            this.errorMsg.innerText = 'Incorrect passphrase.';
        }
    },

    renderLists() {
        this.renderProjects();
        this.renderCerts();
        this.renderBlender();
    },

    renderProjects() {
        const list = document.getElementById('projects-admin-list');
        list.innerHTML = '';
        portfolioData.projects.forEach((p) => {
            const card = this.createAdminCard(p, 'project');
            list.appendChild(card);
        });
    },

    renderCerts() {
        const list = document.getElementById('certs-admin-list');
        list.innerHTML = '';
        portfolioData.credentials.forEach((c) => {
            const card = this.createAdminCard(c, 'cert');
            list.appendChild(card);
        });
    },

    renderBlender() {
        const list = document.getElementById('blender-admin-list');
        if (!list) return;
        list.innerHTML = '';
        if (portfolioData.blenderProjects) {
            portfolioData.blenderProjects.forEach((p) => {
                const card = this.createAdminCard(p, 'blender');
                list.appendChild(card);
            });
        }
    },

    createAdminCard(item, type) {
        const card = document.createElement('div');
        card.className = 'admin-card';
        card.id = `${type}-${item.id}`;

        card.innerHTML = `
            <div class="admin-card-header">
                <div class="admin-card-title">${item.title}</div>
                <div class="admin-card-actions">
                    <button class="btn secondary" onclick="adminUI.editItem('${item.id}', '${type}')">Edit</button>
                    <button class="btn secondary" style="color: #ff4d4d; border-color: #ff4d4d;" onclick="adminUI.deleteItem('${item.id}', '${type}')">Delete</button>
                </div>
            </div>
            <div id="form-container-${item.id}" class="hidden"></div>
        `;
        return card;
    },

    editItem(id, type) {
        const container = document.getElementById(`form-container-${id}`);
        const isHidden = container.classList.contains('hidden');

        if (isHidden) {
            let item;
            if (type === 'project') {
                item = portfolioData.projects.find((p) => p.id === id);
                container.innerHTML = this.getProjectFormHtml(item);
            } else if (type === 'cert') {
                item = portfolioData.credentials.find((c) => c.id === id);
                container.innerHTML = this.getCertFormHtml(item);
            } else if (type === 'blender') {
                item = portfolioData.blenderProjects.find((p) => p.id === id);
                container.innerHTML = this.getBlenderFormHtml(item);
            }

            container.classList.remove('hidden');
        } else {
            container.classList.add('hidden');
        }
    },

    getProjectFormHtml(p) {
        return `
            <div class="inline-form">
                <div class="full-width">
                    <label>Title</label>
                    <input type="text" id="edit-title-${p.id}" value="${p.title}">
                </div>
                <div>
                    <label>Tech Stack (comma separated)</label>
                    <input type="text" id="edit-tech-${p.id}" value="${p.tech.join(', ')}">
                </div>
                <div>
                    <label>Academic Year</label>
                    <input type="text" id="edit-year-${p.id}" value="${p.academicYear}">
                </div>
                <div class="full-width">
                    <label>Short Description</label>
                    <input type="text" id="edit-short-${p.id}" value="${p.shortDesc}">
                </div>
                <div class="full-width">
                    <label>Long Description</label>
                    <textarea id="edit-full-${p.id}" rows="4">${p.fullDesc}</textarea>
                </div>
                <div>
                    <label>GitHub Link</label>
                    <input type="text" id="edit-link-${p.id}" value="${p.link}">
                </div>
                <div>
                    <label>Status</label>
                    <select id="edit-status-${p.id}">
                        <option value="Complete" ${p.status === 'Complete' ? 'selected' : ''}>Complete</option>
                        <option value="In Progress" ${p.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                        <option value="Planned" ${p.status === 'Planned' ? 'selected' : ''}>Planned</option>
                    </select>
                </div>
                <div class="form-btns">
                    <button class="btn secondary" onclick="adminUI.cancelEdit('${p.id}')">Cancel</button>
                    <button class="btn primary" onclick="adminUI.saveProject('${p.id}')">Save Locally</button>
                </div>
            </div>
        `;
    },

    getCertFormHtml(c) {
        return `
            <div class="inline-form">
                <div class="full-width">
                    <label>Title</label>
                    <input type="text" id="edit-cert-title-${c.id}" value="${c.title}">
                </div>
                <div>
                    <label>Area of Study / Discipline</label>
                    <input type="text" id="edit-cert-discipline-${c.id}" value="${c.discipline}">
                </div>
                <div>
                    <label>Academic Year</label>
                    <input type="text" id="edit-cert-year-${c.id}" value="${c.year}">
                </div>
                <div class="full-width">
                    <label>Certificate Image (Upload to GitHub)</label>
                    <div style="display: flex; align-items: center; gap: 10px; margin-top: 5px;">
                        <input type="file" id="edit-cert-file-${c.id}" accept="image/*" style="flex-grow: 1">
                        <span style="font-size: 0.8rem; color: var(--text-secondary)">Current: ${c.img || 'None'}</span>
                    </div>
                </div>
                <div class="form-btns">
                    <button class="btn secondary" onclick="adminUI.cancelEdit('${c.id}')">Cancel</button>
                    <button class="btn primary" onclick="adminUI.saveCert('${c.id}')">Save Locally</button>
                </div>
            </div>
        `;
    },

    getBlenderFormHtml(p) {
        return `
            <div class="inline-form">
                <div class="full-width">
                    <label>Title</label>
                    <input type="text" id="edit-blender-title-${p.id}" value="${p.title}">
                </div>
                <div class="full-width">
                    <label>Render Image URL (GitHub URL)</label>
                    <input type="text" id="edit-blender-image-${p.id}" value="${p.image}">
                </div>
                <div>
                    <label>Date of Completion</label>
                    <input type="text" id="edit-blender-date-${p.id}" value="${p.date}">
                </div>
                <div>
                    <label>GitHub Repo URL</label>
                    <input type="text" id="edit-blender-repo-${p.id}" value="${p.repo}">
                </div>
                <div class="form-btns">
                    <button class="btn secondary" onclick="adminUI.cancelEdit('${p.id}')">Cancel</button>
                    <button class="btn primary" onclick="adminUI.saveBlender('${p.id}')">Save Locally</button>
                </div>
            </div>
        `;
    },

    cancelEdit(id) {
        const container = document.getElementById(`form-container-${id}`);
        if (container) {
            container.classList.add('hidden');
        } else {
            // It's a new item form
            if (id.startsWith('p')) {
                document.getElementById('new-project-container').innerHTML = '';
            } else if (id.startsWith('c')) {
                document.getElementById('new-cert-container').innerHTML = '';
            } else if (id.startsWith('b')) {
                document.getElementById('new-blender-container').innerHTML = '';
            }
        }
    },

    saveProject(id) {
        const isNew = !portfolioData.projects.find((p) => p.id === id);
        const updated = {
            id: id,
            title: document.getElementById(`edit-title-${id}`).value,
            tech: document
                .getElementById(`edit-tech-${id}`)
                .value.split(',')
                .map((t) => t.trim()),
            academicYear: document.getElementById(`edit-year-${id}`).value,
            shortDesc: document.getElementById(`edit-short-${id}`).value,
            fullDesc: document.getElementById(`edit-full-${id}`).value,
            link: document.getElementById(`edit-link-${id}`).value,
            status: document.getElementById(`edit-status-${id}`).value,
        };

        if (isNew) {
            portfolioData.projects.unshift(updated);
        } else {
            const index = portfolioData.projects.findIndex((p) => p.id === id);
            portfolioData.projects[index] = updated;
        }

        this.renderProjects();
        if (isNew) document.getElementById('new-project-container').innerHTML = '';
        this.notifyLocalSave();
    },

    saveCert(id) {
        const isNew = !portfolioData.credentials.find((c) => c.id === id);
        const fileInput = document.getElementById(`edit-cert-file-${id}`);
        const file = fileInput.files[0];
        let imgName = "";

        if (file) {
            // Store file for later upload
            this.pendingFiles[file.name] = file;
            imgName = file.name;
        } else {
            if (!isNew) {
                const oldCert = portfolioData.credentials.find((c) => c.id === id);
                imgName = oldCert.img;
            } else {
                imgName = "placeholder.png";
            }
        }

        const updated = {
            id: id,
            title: document.getElementById(`edit-cert-title-${id}`).value,
            discipline: document.getElementById(`edit-cert-discipline-${id}`).value,
            year: document.getElementById(`edit-cert-year-${id}`).value,
            img: imgName,
        };

        if (isNew) {
            portfolioData.credentials.unshift(updated);
        } else {
            const index = portfolioData.credentials.findIndex((c) => c.id === id);
            portfolioData.credentials[index] = updated;
        }

        this.renderCerts();
        if (isNew) document.getElementById('new-cert-container').innerHTML = '';
        this.notifyLocalSave();
    },

    saveBlender(id) {
        const isNew = !portfolioData.blenderProjects.find((p) => p.id === id);
        const updated = {
            id: id,
            title: document.getElementById(`edit-blender-title-${id}`).value,
            image: document.getElementById(`edit-blender-image-${id}`).value,
            date: document.getElementById(`edit-blender-date-${id}`).value,
            repo: document.getElementById(`edit-blender-repo-${id}`).value,
        };

        if (isNew) {
            portfolioData.blenderProjects.unshift(updated);
        } else {
            const index = portfolioData.blenderProjects.findIndex((p) => p.id === id);
            portfolioData.blenderProjects[index] = updated;
        }

        this.renderBlender();
        if (isNew) document.getElementById('new-blender-container').innerHTML = '';
        this.notifyLocalSave();
    },

    async uploadFileToGitHub(file, token) {
        const repo = 'rishitc17/rishitc17.github.io';
        const path = file.name;
        const url = `https://api.github.com/repos/${repo}/contents/${path}`;

        let sha = null;
        try {
            const res = await fetch(url, {
                headers: { Authorization: `token ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                sha = data.sha;
            }
        } catch (e) {}

        const content = await this.readFileAsBase64(file);

        const res = await fetch(url, {
            method: 'PUT',
            headers: {
                Authorization: `token ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: `Admin: Upload image ${file.name}`,
                content: content,
                sha: sha
            }),
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || "Failed to upload file to GitHub");
        }
    },

    readFileAsBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const base64 = reader.result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    },

    deleteItem(id, type) {
        if (
            !confirm(
                `Are you sure you want to delete this ${type}? It will be removed from your current view, but you still need to "Push Changes" to make it permanent.`,
            )
        )
            return;

        if (type === 'project') {
            portfolioData.projects = portfolioData.projects.filter((p) => p.id !== id);
            this.renderProjects();
        } else if (type === 'cert') {
            portfolioData.credentials = portfolioData.credentials.filter((c) => c.id !== id);
            this.renderCerts();
        } else if (type === 'blender') {
            portfolioData.blenderProjects = portfolioData.blenderProjects.filter((p) => p.id !== id);
            this.renderBlender();
        }
        this.notifyLocalSave();
    },

    notifyStatus(msg, color) {
        const statusEl = document.getElementById('pat-status');
        statusEl.innerText = msg;
        statusEl.style.color = color || 'var(--text-secondary)';
    },

    notifyLocalSave() {
        this.notifyStatus('Changes saved locally. Click "Push Changes" to update production.', 'var(--accent-color)');
    },

    addNewProject() {
        const id = 'p' + Date.now();
        const container = document.getElementById('new-project-container');
        container.innerHTML = this.getProjectFormHtml({
            id,
            title: '',
            tech: [],
            academicYear: '',
            shortDesc: '',
            fullDesc: '',
            link: '#',
            status: 'Planned',
        });
    },

    addNewCert() {
        const id = 'c' + Date.now();
        const container = document.getElementById('new-cert-container');
        container.innerHTML = this.getCertFormHtml({
            id,
            title: '',
            discipline: '',
            year: '',
            img: '',
        });
    },

    addNewBlender() {
        const id = 'b' + Date.now();
        const container = document.getElementById('new-blender-container');
        if (!container) return;
        container.innerHTML = this.getBlenderFormHtml({
            id,
            title: '',
            image: '',
            date: '',
            repo: '#',
        });
    },

    async syncToGitHub(successMsg) {
        const token = this.patInput.value.trim();
        const statusEl = document.getElementById('pat-status');

        if (!token) {
            this.notifyStatus('Error: Please enter your GitHub PAT first.', '#ff4d4d');
            return;
        }

        this.pushBtn.disabled = true;
        this.pushBtn.innerText = 'Syncing...';
        this.notifyStatus('Syncing with GitHub...', 'var(--accent-color)');

        try {
            // 1. Upload any pending images first
            const fileNames = Object.keys(this.pendingFiles);
            for (const name of fileNames) {
                this.notifyStatus(`Uploading ${name}...`, 'var(--accent-color)');
                await this.uploadFileToGitHub(this.pendingFiles[name], token);
                delete this.pendingFiles[name];
            }

            // 2. Update data.js
            const repo = 'rishitc17/rishitc17.github.io';
            const path = 'data.js';

            // Increment version
            const parts = portfolioData.version.split('.');
            parts[parts.length - 1] = parseInt(parts[parts.length - 1]) + 1;
            portfolioData.version = parts.join('.');

            // Fetch current file for SHA
            const getUrl = `https://api.github.com/repos/${repo}/contents/${path}`;
            const getRes = await fetch(getUrl, {
                headers: { Authorization: `token ${token}` },
            });

            if (!getRes.ok) throw new Error('Could not fetch data.js from GitHub.');
            const fileData = await getRes.json();
            const currentSha = fileData.sha;

            // Build new content
            const newDataStr = `const portfolioData = ${JSON.stringify(portfolioData, null, 4)};`;

            // Update file
            const putRes = await fetch(getUrl, {
                method: 'PUT',
                headers: {
                    Authorization: `token ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: `Admin: Data update to v${portfolioData.version}`,
                    content: btoa(unescape(encodeURIComponent(newDataStr))),
                    sha: currentSha,
                }),
            });

            if (!putRes.ok) throw new Error('Failed to update data.js. Check PAT permissions.');

            this.notifyStatus(`Success: ${successMsg} (v${portfolioData.version} deploying)`, '#00ff80');
        } catch (err) {
            this.notifyStatus('Error: ' + err.message, '#ff4d4d');
            console.error(err);
        } finally {
            this.pushBtn.disabled = false;
            this.pushBtn.innerText = 'Push Changes';
        }
    },
};

document.addEventListener('DOMContentLoaded', () => adminUI.init());
