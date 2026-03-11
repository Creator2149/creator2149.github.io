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
    },

    renderProjects() {
        const list = document.getElementById('projects-admin-list');
        list.innerHTML = '';
        portfolioData.projects.forEach(p => {
            const card = this.createAdminCard(p, 'project');
            list.appendChild(card);
        });
    },

    renderCerts() {
        const list = document.getElementById('certs-admin-list');
        list.innerHTML = '';
        portfolioData.credentials.forEach(c => {
            const card = this.createAdminCard(c, 'cert');
            list.appendChild(card);
        });
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
            const item = type === 'project' 
                ? portfolioData.projects.find(p => p.id === id)
                : portfolioData.credentials.find(c => c.id === id);
            
            container.innerHTML = type === 'project' 
                ? this.getProjectFormHtml(item)
                : this.getCertFormHtml(item);
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
                    <label>Image URL / Filename</label>
                    <input type="text" id="edit-cert-img-${c.id}" value="${c.img}">
                </div>
                <div class="form-btns">
                    <button class="btn secondary" onclick="adminUI.cancelEdit('${c.id}')">Cancel</button>
                    <button class="btn primary" onclick="adminUI.saveCert('${c.id}')">Save Locally</button>
                </div>
            </div>
        `;
    },

    cancelEdit(id) {
        document.getElementById(`form-container-${id}`).classList.add('hidden');
    },

    saveProject(id) {
        const isNew = !portfolioData.projects.find(p => p.id === id);
        const updated = {
            id: id,
            title: document.getElementById(`edit-title-${id}`).value,
            tech: document.getElementById(`edit-tech-${id}`).value.split(',').map(t => t.trim()),
            academicYear: document.getElementById(`edit-year-${id}`).value,
            shortDesc: document.getElementById(`edit-short-${id}`).value,
            fullDesc: document.getElementById(`edit-full-${id}`).value,
            link: document.getElementById(`edit-link-${id}`).value,
            status: document.getElementById(`edit-status-${id}`).value
        };

        if (isNew) {
            portfolioData.projects.unshift(updated);
        } else {
            const index = portfolioData.projects.findIndex(p => p.id === id);
            portfolioData.projects[index] = updated;
        }

        this.renderProjects();
        if (isNew) document.getElementById('new-project-container').innerHTML = '';
        this.notifyLocalSave();
    },

    saveCert(id) {
        const isNew = !portfolioData.credentials.find(c => c.id === id);
        const updated = {
            id: id,
            title: document.getElementById(`edit-cert-title-${id}`).value,
            discipline: document.getElementById(`edit-cert-discipline-${id}`).value,
            year: document.getElementById(`edit-cert-year-${id}`).value,
            img: document.getElementById(`edit-cert-img-${id}`).value
        };

        if (isNew) {
            portfolioData.credentials.unshift(updated);
        } else {
            const index = portfolioData.credentials.findIndex(c => c.id === id);
            portfolioData.credentials[index] = updated;
        }

        this.renderCerts();
        if (isNew) document.getElementById('new-cert-container').innerHTML = '';
        this.notifyLocalSave();
    },

    deleteItem(id, type) {
        if (!confirm(`Are you sure you want to delete this ${type}? It will be removed from your current view, but you still need to "Push Changes" to make it permanent.`)) return;

        if (type === 'project') {
            portfolioData.projects = portfolioData.projects.filter(p => p.id !== id);
            this.renderProjects();
        } else {
            portfolioData.credentials = portfolioData.credentials.filter(c => c.id !== id);
            this.renderCerts();
        }
        this.notifyLocalSave();
    },

    notifyLocalSave() {
        const statusEl = document.getElementById('pat-status');
        statusEl.innerText = 'Changes saved locally. Click "Push Changes" to update production.';
        statusEl.style.color = 'var(--accent-color)';
    },

    addNewProject() {
        const id = 'p' + Date.now();
        const container = document.getElementById('new-project-container');
        container.innerHTML = this.getProjectFormHtml({
            id, title: '', tech: [], academicYear: '', shortDesc: '', fullDesc: '', link: '#', status: 'Planned'
        });
    },

    addNewCert() {
        const id = 'c' + Date.now();
        const container = document.getElementById('new-cert-container');
        container.innerHTML = this.getCertFormHtml({
            id, title: '', discipline: '', year: '', img: ''
        });
    },

    async syncToGitHub(successMsg) {
        const token = this.patInput.value.trim();
        const statusEl = document.getElementById('pat-status');

        if (!token) {
            statusEl.innerText = 'Error: Please enter your GitHub PAT first.';
            statusEl.style.color = '#ff4d4d';
            return;
        }

        this.pushBtn.disabled = true;
        this.pushBtn.innerText = 'Syncing...';
        statusEl.innerText = 'Syncing with GitHub...';
        statusEl.style.color = 'var(--accent-color)';

        const repo = 'rishitc17/rishitc17.github.io';
        const path = 'data.js';

        try {
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

            statusEl.innerText = `Success: ${successMsg} (v${portfolioData.version} deploying)`;
            statusEl.style.color = '#00ff80';
        } catch (err) {
            statusEl.innerText = 'Error: ' + err.message;
            statusEl.style.color = '#ff4d4d';
            console.error(err);
        } finally {
            this.pushBtn.disabled = false;
            this.pushBtn.innerText = 'Push Changes';
        }
    }
};

document.addEventListener('DOMContentLoaded', () => adminUI.init());
