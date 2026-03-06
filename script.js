// --- CERTIFICATE MODAL ---
window.openCertModal = (certId) => {
    const c = portfolioData.credentials.find((cert) => cert.id === certId);
    const modal = document.getElementById('cert-modal');
    const body = document.getElementById('cert-modal-body');
    if (!c) return;
    body.innerHTML = `
        <h2 style=\"color: var(--accent-color); margin-bottom: 10px;\">${c.title}</h2>
        <span class=\"tech-tag\">${c.discipline}</span>
        <p style=\"margin: 10px 0 5px 0;\"><strong>Year:</strong> ${c.year}</p>
        <div style=\"display: flex; justify-content: center; align-items: center; margin: 20px 0;\">
            <img src=\"${c.img}\" alt=\"${c.title}\" style=\"width: 100%; height: auto; max-width: 100%; border-radius: 10px; box-shadow: 0 0 20px #00fff7a0; object-fit: contain; background: #222; display: block;\" onerror=\"this.style.display='none';this.parentNode.innerHTML='<span style=\\'color: var(--accent-color);font-size:2rem\\'>[No Certificate]</span>';\" />
        </div>
    `;
    modal.style.display = 'block';
};
/**
 * Rishit Choudhary Portfolio Engine
 * Neo-Futuristic Glassmorphism - Vanilla JS
 */

/* --- DATA_START --- */
const INITIAL_DATA = {
    version: '1.9',
    projects: [
        {
            id: 'p1',
            title: 'MealFlow',
            status: 'Complete',
            shortDesc: 'AI-powered meal planning for Indian households.',
            fullDesc:
                "MealFlow is a website designed for Indian households where homemakers struggle to decide meal plans that suit every member's needs, preferences, and health goals. The platform takes in family member details and available ingredients to create a meal plan via AI. Developed using HTML, Tailwind CSS, JS, FastAPI, Appwrite, and Groq AI.",
            tech: ['FastAPI', 'Appwrite', 'Tailwind', 'Groq AI'],
            link: 'https://github.com/Creator2149/MealFlow',
            academicYear: 'AY 2025-26',
        },
        {
            id: 'p2',
            title: 'Nullary',
            status: 'In Progress',
            shortDesc: 'Axiomatic framework for division by zero.',
            fullDesc:
                'An axiomatic framework developed to simplify working with expressions involving division by 0. Currently seeking expert feedback on the paper. Developed in AY 2025-26 and still under active research.',
            tech: ['Mathematics', 'Research', 'LaTeX'],
            link: '#',
            academicYear: 'AY 2025-26',
        },
        {
            id: 'p3',
            title: 'RawCrypt',
            status: 'Planned',
            shortDesc: 'Educational platform for cryptographic principles.',
            fullDesc:
                'Teaches teenagers basic cryptography from Caesar Cipher to RSA through intuitive mathematical explanations. Planned for development with FastAPI and a modern web stack.',
            tech: ['Python', 'FastAPI', 'Cryptography'],
            link: '#',
            academicYear: 'AY 2025-26',
        },
        {
            id: 'p4',
            title: 'Raksha',
            status: 'Complete',
            shortDesc: 'AI-powered self-defense platform.',
            fullDesc:
                'Self-defense platform where people learn from home through webcam motion tracking and AI-powered feedback. Contributor role. Built with React and Python.',
            tech: ['React', 'Python', 'Supabase', 'AI'],
            link: '#',
            academicYear: 'AY 2025-26',
        },
        {
            id: 'p5',
            title: 'Cybersecurity for Elderly',
            status: 'Planned',
            shortDesc: 'Awareness program for online safety.',
            fullDesc:
                'Educational program to help elderly people avoid common online scams using real-world analogies. Will be hosted via online meetings.',
            tech: ['Education', 'Public Speaking', 'Community'],
            link: '#',
            academicYear: 'AY 2025-26',
        },
        {
            id: 'p6',
            title: 'Solar Cell Efficiency Research',
            status: 'Planned',
            shortDesc: 'Research paper on solar cell materials.',
            fullDesc:
                'Modeling efficiency changes based on material variations using SCAPS-1D software. Focusing on specific material impacts on performance.',
            tech: ['Physics', 'SCAPS-1D', 'Research'],
            link: '#',
            academicYear: 'AY 2025-26',
        },
        {
            id: 'p7',
            title: 'Socratic AI Business',
            status: 'Planned',
            shortDesc: 'Guiding critical thinking through Socratic AI.',
            fullDesc:
                'A business solution and research paper exploring how Socratic questioning prevents critical thinking decline caused by direct AI answers. Includes a proof-of-concept pre-prompt and qualitative study.',
            tech: ['Business Strategy', 'NLP', 'Prompt Engineering'],
            link: '#',
            academicYear: 'AY 2025-26',
        },
        {
            id: 'p8',
            title: 'The Celestis Conclave',
            status: 'In Progress',
            shortDesc: 'Regional STEM club for students.',
            fullDesc:
                'Mathematics department head and core council member of a student-led regional STEM club dedicated to advanced learning.',
            tech: ['Leadership', 'STEM Education'],
            link: '#',
            academicYear: 'AY 2025-26',
        },
        {
            id: 'p9',
            title: 'Echoes of Etheryn',
            status: 'In Progress',
            shortDesc: 'Fantasy/Sci-Fi mixed genre novel.',
            fullDesc:
                'A creative writing project blending high fantasy with science fiction elements. Currently in progress.',
            tech: ['Creative Writing', 'World Building'],
            link: '#',
            academicYear: 'AY 2024-25',
        },
        {
            id: 'p10',
            title: 'Disease Spread Simulation',
            status: 'Complete',
            shortDesc: 'Pygame-based epidemiology simulation.',
            fullDesc:
                'A mathematical model of disease transmission visualized through a Pygame simulation. Available on GitHub.',
            tech: ['Python', 'Pygame', 'Simulation'],
            link: 'https://github.com/Creator2149/DiseaseSpreadSimulation',
            academicYear: 'AY 2024-25',
        },
        {
            id: 'p11',
            title: 'Maze Simulation',
            status: 'Complete',
            shortDesc: 'Pygame-based maze generation/solving.',
            fullDesc: 'A simulation exploring maze generation and solving algorithms in Python.',
            tech: ['Python', 'Pygame', 'Algorithms'],
            link: 'https://github.com/Creator2149/Maze',
            academicYear: 'AY 2023-24',
        },
    ],
    credentials: [
        {
            id: 'c1',
            title: 'National Inter DPS IT Festival - 2nd Place',
            year: 'AY 2025-26',
            discipline: 'Tech',
            img: 'DPSS AIdea Quest Rank.png',
        },
        {
            id: 'c2',
            title: 'Lodha Genius Programme Scholar (Ashoka University)',
            year: 'Summer AY 24-25',
            discipline: 'Maths & Science',
            img: 'Lodha Genius Programme Participation.png',
        },
        {
            id: 'c3',
            title: 'WSC Global Round - Qualified for Tournament of Champions',
            year: 'AY 2025-26',
            discipline: 'Academic',
            img: 'wsc.png',
        },
        {
            id: 'c4',
            title: 'NOF International Math Olympiad - Rank 2',
            year: 'AY 2023-24',
            discipline: 'Maths',
            img: 'NOF IMO Meritorious Performance.png',
        },
        {
            id: 'c5',
            title: 'ISTSE International Rank 110',
            year: 'Summer AY 22-23',
            discipline: 'Maths',
            img: 'ISTSE Participation and Rank.png',
        },
        {
            id: 'c6',
            title: 'Harvard Model Congress YGLP',
            year: 'AY 2022-23',
            discipline: 'Leadership',
            img: 'Harvard Model Congress Participation.png',
        },
        {
            id: 'c7',
            title: 'AMC 10 Participation',
            year: 'AY 2025-26',
            discipline: 'Maths',
            img: 'AMC 10 2025 Participation Certificate.png',
        },
        {
            id: 'c8',
            title: 'ISRO Summer Online Course',
            year: 'Summer AY 21-22',
            discipline: 'Science',
            img: 'ISRO Summer Course Certificate.png',
        },
        {
            id: 'wsc-r1',
            title: "World Scholar's Cup - Regional Round",
            year: 'AY 2022-23',
            discipline: 'Academic',
            img: 'wsc.png',
        },
        {
            id: 'wsc-r2',
            title: "World Scholar's Cup - Regional Round",
            year: 'AY 2023-24',
            discipline: 'Academic',
            img: 'WSC Regional Certificate 2.png',
        },
        {
            id: 'wsc-r3',
            title: "World Scholar's Cup - Regional Round",
            year: 'AY 2024-25',
            discipline: 'Academic',
            img: 'WSC Regional Certificate 3.png',
        },
        {
            id: 'c10',
            title: 'LogiQids Round 1 Complete (Reg. Round 2)',
            year: 'AY 2025-26',
            discipline: 'Logic',
            img: 'LogiQids Round 1 Certificate.png',
        },
        {
            id: 'c11',
            title: 'National Road Safety Mission Course',
            year: 'AY 2025-26',
            discipline: 'Community',
            img: 'National Road Safety Mission Certificate.png',
        },
        {
            id: 'roh-22-23',
            title: 'Roll of Honour for Academic Excellence',
            year: 'AY 2022-23',
            discipline: 'Academic',
            img: 'Roll of Honour 1.png',
        },
        {
            id: 'lp-22-23',
            title: 'IB Learner Profile Attribute Award',
            year: 'AY 2022-23',
            discipline: 'Academic',
            img: 'Learner Profile 1.png',
        },
        {
            id: 'roh-23-24',
            title: 'Roll of Honour for Academic Excellence',
            year: 'AY 2023-24',
            discipline: 'Academic',
            img: 'Roll of Honour 2.png',
        },
        {
            id: 'lp-23-24',
            title: 'IB Learner Profile Attribute Award',
            year: 'AY 2023-24',
            discipline: 'Academic',
            img: 'Learner Profile 2.png',
        },
        {
            id: 'roh-24-25',
            title: 'Roll of Honour for Academic Excellence',
            year: 'AY 2024-25',
            discipline: 'Academic',
            img: 'Roll of Honour 3.png',
        },
        {
            id: 'lp-24-25',
            title: 'IB Learner Profile Attribute Award',
            year: 'AY 2024-25',
            discipline: 'Academic',
            img: 'Learner Profile 3.png',
        },
        {
            id: 'c13',
            title: 'SOF IMO Round 1',
            year: 'AY 2025-26',
            discipline: 'Maths',
            img: 'sof.png',
        },
        {
            id: 'c15',
            title: 'LIS Annual Interschool Fest - Stop Motion',
            year: 'AY 2024-25',
            discipline: 'Tech',
            img: 'LIS Fest Participation.png',
        },
        {
            id: 'c16',
            title: 'DPS International Techathlon - Code Battle',
            year: 'AY 2025-26',
            discipline: 'Tech',
            img: 'Techathlon Participation Certificate.png',
        },
        {
            id: 'c1772614102624',
            title: 'Participation and Shortlisting for John Locke Essay Competition',
            year: 'AY 2024-25',
            discipline: 'Literature',
            img: 'placeholder.png',
        },
    ],
};
/* --- DATA_END --- */

// --- CORE APP STATE ---
function loadData() {
    // FORCE CLEAR LOCALSTORAGE TO PREVENT GHOST DATA
    localStorage.removeItem('rishitPortfolioData');
    return INITIAL_DATA;
}

let portfolioData = loadData();
const ADMIN_HASH = 'cae0dd875c4b3d94bddc6f8cd3f772f705d800d1afb36ca7eeffd5031a57ad05'; // Correct hash for "rishit2026"

// --- UTILITIES ---
const AY_OPTIONS = [
    'AY 2021-22',
    'Summer AY 21-22',
    'AY 2022-23',
    'Summer AY 22-23',
    'AY 2023-24',
    'Summer AY 23-24',
    'AY 2024-25',
    'Summer AY 24-25',
    'AY 2025-26',
    'Summer AY 25-26',
    'AY 2026-27',
    'Summer AY 26-27',
    'AY 2027-28',
    'Summer AY 27-28',
    'AY 2028-29',
    'Summer AY 28-29',
];

function getYearScore(yearStr) {
    if (!yearStr) return 0;
    const match = yearStr.match(/(\d{2})-(\d{2})/);
    if (!match) return 0;
    let score = parseInt(match[1]);
    if (yearStr.includes('Summer')) score += 0.5;
    return score;
}

async function hashPassphrase(str) {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

function saveData() {
    // LocalStorage completely disabled to ensure only GitHub pushes are final.
}

// --- RENDERING ENGINES ---
function renderProjects(filter = 'all') {
    const grid = document.getElementById('projects-grid');
    grid.innerHTML = '';

    const filtered =
        filter === 'all' ? portfolioData.projects : portfolioData.projects.filter((p) => p.status === filter);

    filtered.sort((a, b) => getYearScore(b.academicYear) - getYearScore(a.academicYear));

    filtered.forEach((p) => {
        const card = document.createElement('div');
        card.className = 'glass-card project-card';
        card.innerHTML = `
            <div class="status-badge ${p.status.toLowerCase().replace(' ', '-')}">${p.status}</div>
            <div class="card-content">
                <h3>${p.title}</h3>
                <p class="academic-year">${p.academicYear}</p>
                <p>${p.shortDesc}</p>
                <div class="tech-stack">
                    ${p.tech.map((t) => `<span class="tech-tag">${t}</span>`).join('')}
                </div>
                <button class="btn secondary" style="margin-top: 20px" onclick="openProjectModal('${p.id}')">Details</button>
            </div>
        `;
        grid.appendChild(card);
    });
}

function renderCredentials(sort = 'desc') {
    const grid = document.getElementById('credentials-grid');
    grid.innerHTML = '';

    const sorted = [...portfolioData.credentials].sort((a, b) => {
        const scoreA = getYearScore(a.year);
        const scoreB = getYearScore(b.year);
        return sort === 'desc' ? scoreB - scoreA : scoreA - scoreB;
    });

    sorted.forEach((c) => {
        const card = document.createElement('div');
        card.className = 'glass-card cert-card';
        const cardContent = document.createElement('div');
        cardContent.className = 'card-content';
        cardContent.innerHTML = `
            <span class="tech-tag">${c.discipline}</span>
            <h3>${c.title}</h3>
            <p>${c.year}</p>
        `;
        const imgContainer = document.createElement('div');
        imgContainer.style.height = '150px';
        imgContainer.style.background = 'rgba(0,0,0,0.3)';
        imgContainer.style.marginTop = '15px';
        imgContainer.style.borderRadius = '5px';
        imgContainer.style.display = 'flex';
        imgContainer.style.alignItems = 'center';
        imgContainer.style.justifyContent = 'center';

        if (c.img && c.img !== 'placeholder.png') {
            const img = document.createElement('img');
            img.src = c.img;
            img.alt = c.title;
            img.style.maxHeight = '100%';
            img.style.maxWidth = '100%';
            img.style.borderRadius = '5px';
            img.style.objectFit = 'contain';
            img.onerror = function () {
                imgContainer.innerHTML = `<span style='color: var(--accent-color)'>[No Certificate]</span>`;
            };
            imgContainer.appendChild(img);
        } else {
            imgContainer.innerHTML = `<span style='color: var(--accent-color)'>[No Certificate]</span>`;
        }

        cardContent.appendChild(imgContainer);
        card.appendChild(cardContent);
        card.style.cursor = 'pointer';
        card.onclick = () => window.openCertModal(c.id);
        grid.appendChild(card);
    });
}

// --- MODALS ---
window.openProjectModal = (id) => {
    const p = portfolioData.projects.find((proj) => proj.id === id);
    const modal = document.getElementById('project-modal');
    const body = document.getElementById('modal-body');

    body.innerHTML = `
        <h2 style="color: var(--accent-color); margin-bottom: 10px;">${p.title}</h2>
        <div class="status-badge ${p.status.toLowerCase().replace(' ', '-')}">${p.status}</div>
        <p><strong>Year:</strong> ${p.academicYear}</p>
        <p style="margin: 20px 0; line-height: 1.8;">${p.fullDesc}</p>
        <div class="tech-stack" style="margin-bottom: 20px;">
            ${p.tech.map((t) => `<span class="tech-tag">${t}</span>`).join('')}
        </div>
        ${p.link !== '#' ? `<a href="${p.link}" target="_blank" class="btn primary">View on GitHub</a>` : ''}
    `;
    modal.style.display = 'block';
};

// --- PARTICLES ENGINE ---
function initParticles() {
    if (window.innerWidth < 768) return;
    const canvas = document.getElementById('particles-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let particles = [];
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2;
            this.speedX = (Math.random() - 0.5) * 0.5;
            this.speedY = (Math.random() - 0.5) * 0.5;
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            if (this.x > canvas.width) this.x = 0;
            if (this.x < 0) this.x = canvas.width;
            if (this.y > canvas.height) this.y = 0;
            if (this.y < 0) this.y = canvas.height;
        }
        draw() {
            ctx.fillStyle = 'rgba(0, 255, 255, 0.2)';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    for (let i = 0; i < 100; i++) particles.push(new Particle());

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach((p) => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(animate);
    }
    animate();
}

// --- ADMIN LOGIC (THE BACKDOOR) ---
const admin = {
    locked: true,

    init() {
        document.addEventListener('keydown', (e) => {
            if (e.altKey && e.shiftKey && e.key === 'A') {
                document.getElementById('admin-gate').style.display = 'block';
            }
        });

        document.getElementById('admin-login-btn').addEventListener('click', async () => {
            const input = document.getElementById('admin-passphrase').value.trim();
            const hash = await hashPassphrase(input);
            if (hash === ADMIN_HASH) {
                this.locked = false;
                document.getElementById('admin-gate').style.display = 'none';
                document.getElementById('admin-dashboard').style.display = 'block';
                this.renderDashboard();
            } else {
                document.getElementById('admin-error').innerText = 'Incorrect passphrase.';
            }
        });

        document.querySelector('.close-admin').onclick = () => {
            document.getElementById('admin-dashboard').style.display = 'none';
        };

        // GitHub Sync Event Listener
        document.getElementById('push-to-github')?.addEventListener('click', () => {
            this.pushToGitHub();
        });
    },

    renderDashboard() {
        const pList = document.getElementById('admin-projects-list');
        pList.innerHTML = portfolioData.projects
            .map(
                (p) => `
            <div class="admin-item-row">
                <span>${p.title} (${p.status})</span>
                <div class="admin-actions">
                    <button class="admin-btn edit" onclick="admin.editProject('${p.id}')">Edit</button>
                    <button class="admin-btn delete" onclick="admin.deleteProject('${p.id}')">Delete</button>
                </div>
            </div>
        `,
            )
            .join('');

        const cList = document.getElementById('admin-certs-list');
        cList.innerHTML = portfolioData.credentials
            .map(
                (c) => `
            <div class="admin-item-row">
                <span>${c.title} (${c.year})</span>
                <div class="admin-actions">
                    <button class="admin-btn edit" onclick="admin.editCert('${c.id}')">Edit</button>
                    <button class="admin-btn delete" onclick="admin.deleteCert('${c.id}')">Delete</button>
                </div>
            </div>
        `,
            )
            .join('');

        // Tab Switching Logic
        document.querySelectorAll('.tab-btn').forEach((btn) => {
            btn.onclick = (e) => {
                document.querySelector('.tab-btn.active').classList.remove('active');
                e.target.classList.add('active');
                document.querySelectorAll('.tab-content').forEach((tc) => tc.classList.add('hidden'));
                document.getElementById(e.target.dataset.tab).classList.remove('hidden');
            };
        });
    },

    openProjectForm(id = null) {
        const p = id
            ? portfolioData.projects.find((proj) => proj.id === id)
            : {
                  title: '',
                  status: 'Planned',
                  fullDesc: '',
                  academicYear: 'AY 2025-26',
                  shortDesc: '',
                  tech: [],
                  link: '#',
              };
        const form = document.getElementById('dynamic-form');
        document.getElementById('form-title').innerText = id ? 'Edit Project' : 'Add Project';

        form.innerHTML = `
            <input type="text" id="edit-title" value="${p.title}" placeholder="Project Title">
            <input type="text" id="edit-short" value="${p.shortDesc || ''}" placeholder="Short Description">
            <select id="edit-status">
                <option ${p.status === 'Complete' ? 'selected' : ''}>Complete</option>
                <option ${p.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                <option ${p.status === 'Planned' ? 'selected' : ''}>Planned</option>
            </select>
            <textarea id="edit-desc" placeholder="Full Description">${p.fullDesc}</textarea>
            <select id="edit-year">
                ${AY_OPTIONS.map((yr) => `<option value="${yr}" ${p.academicYear === yr ? 'selected' : ''}>${yr}</option>`).join('')}
            </select>
            <input type="text" id="edit-tech" value="${(p.tech || []).join(', ')}" placeholder="Tech Stack (comma separated)">
            <input type="text" id="edit-link" value="${p.link}" placeholder="GitHub Link">
        `;

        document.getElementById('form-modal').style.display = 'block';
        document.getElementById('save-btn').onclick = () => {
            const updated = {
                id: id || 'p' + Date.now(),
                title: document.getElementById('edit-title').value,
                shortDesc: document.getElementById('edit-short').value,
                status: document.getElementById('edit-status').value,
                fullDesc: document.getElementById('edit-desc').value,
                academicYear: document.getElementById('edit-year').value,
                tech: document
                    .getElementById('edit-tech')
                    .value.split(',')
                    .map((t) => t.trim()),
                link: document.getElementById('edit-link').value,
            };

            if (id) {
                const index = portfolioData.projects.findIndex((proj) => proj.id === id);
                portfolioData.projects[index] = updated;
            } else {
                portfolioData.projects.push(updated);
            }

            renderProjects();
            this.renderDashboard();
            document.getElementById('form-modal').style.display = 'none';
        };
    },

    editProject(id) {
        this.openProjectForm(id);
    },

    deleteProject(id) {
        if (confirm('Are you sure you want to delete this project?')) {
            portfolioData.projects = portfolioData.projects.filter((p) => p.id !== id);
            renderProjects();
            this.renderDashboard();
        }
    },

    openCertForm(id = null) {
        const c = id
            ? portfolioData.credentials.find((cert) => cert.id === id)
            : { title: '', year: 'AY 2025-26', discipline: '', img: '' };
        const form = document.getElementById('dynamic-form');
        document.getElementById('form-title').innerText = id ? 'Edit Entry' : 'Add Entry';

        form.innerHTML = `
            <input type="text" id="edit-cert-title" value="${c.title}" placeholder="Title">
            <select id="edit-cert-year">
                ${AY_OPTIONS.map((yr) => `<option value="${yr}" ${c.year === yr ? 'selected' : ''}>${yr}</option>`).join('')}
            </select>
            <input type="text" id="edit-cert-discipline" value="${c.discipline}" placeholder="Discipline (e.g., Tech, Maths)">
        `;

        document.getElementById('form-modal').style.display = 'block';
        document.getElementById('save-btn').onclick = () => {
            const updated = {
                id: id || 'c' + Date.now(),
                title: document.getElementById('edit-cert-title').value,
                year: document.getElementById('edit-cert-year').value,
                discipline: document.getElementById('edit-cert-discipline').value,
                img: c.img || 'placeholder.png',
            };

            if (id) {
                const index = portfolioData.credentials.findIndex((cert) => cert.id === id);
                portfolioData.credentials[index] = updated;
            } else {
                portfolioData.credentials.push(updated);
            }

            renderCredentials();
            this.renderDashboard();
            document.getElementById('form-modal').style.display = 'none';
        };
    },

    editCert(id) {
        this.openCertForm(id);
    },

    deleteCert(id) {
        if (confirm('Are you sure you want to delete this entry?')) {
            portfolioData.credentials = portfolioData.credentials.filter((c) => c.id !== id);
            renderCredentials();
            this.renderDashboard();
        }
    },

    async pushToGitHub() {
        const token = document.getElementById('github-token').value.trim();
        const repo = 'Creator2149/Portfolio';
        const path = 'script.js';
        const btn = document.getElementById('push-to-github');
        const status = document.getElementById('sync-status');

        if (!token) {
            alert('Please enter your GitHub Token.');
            return;
        }

        btn.innerText = 'Syncing...';
        btn.disabled = true;
        status.innerText = 'Connecting to GitHub...';

        try {
            // 1. Automatically increment version before pushing
            const parts = portfolioData.version.split('.');
            parts[parts.length - 1] = parseInt(parts[parts.length - 1]) + 1;
            portfolioData.version = parts.join('.');

            // 2. Fetch current file to get SHA
            const getUrl = `https://api.github.com/repos/${repo}/contents/${path}`;
            const getRes = await fetch(getUrl, {
                headers: { Authorization: `token ${token}` },
            });

            if (!getRes.ok) throw new Error('Could not fetch file from GitHub. Check token and repo name.');
            const fileData = await getRes.json();
            const currentSha = fileData.sha;
            const currentContent = decodeURIComponent(escape(atob(fileData.content)));

            // 3. Build the new file content
            const newDataStr = `const INITIAL_DATA = ${JSON.stringify(portfolioData, null, 4)};`;
            const newContent = currentContent.replace(
                /\/\* --- DATA_START --- \*\/([\s\S]*?)\/\* --- DATA_END --- \*\//,
                `/* --- DATA_START --- */\n${newDataStr}\n/* --- DATA_END --- */`,
            );

            // 4. Update the file
            const putRes = await fetch(getUrl, {
                method: 'PUT',
                headers: {
                    Authorization: `token ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: `Admin: Data update to v${portfolioData.version}`,
                    content: btoa(unescape(encodeURIComponent(newContent))),
                    sha: currentSha,
                }),
            });

            if (!putRes.ok) throw new Error('Failed to update file. Check repository permissions.');

            status.innerText = `Success! v${portfolioData.version} is being deployed (take ~1 min).`;
            status.style.color = '#00ff80';
        } catch (err) {
            status.innerText = 'Error: ' + err.message;
            status.style.color = '#ff4d4d';
        } finally {
            btn.innerText = 'Push to Production';
            btn.disabled = false;
        }
    },
};

// --- EVENT LISTENERS ---
document.addEventListener('DOMContentLoaded', () => {
    renderProjects();
    renderCredentials();
    initParticles();
    admin.init();

    // Certificate Modal Close Logic
    document.getElementById('close-cert-modal').onclick = () => {
        document.getElementById('cert-modal').style.display = 'none';
    };
    window.onclick = (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    };

    // Mobile Menu Toggle
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    menuBtn?.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        menuBtn.classList.toggle('open');
    });

    // Double-click logo for Admin door (Mobile Friendly)
    document.querySelector('.logo')?.addEventListener('dblclick', () => {
        document.getElementById('admin-gate').style.display = 'block';
    });

    // Cursor Glow
    const glow = document.getElementById('cursor-glow');
    document.addEventListener('mousemove', (e) => {
        glow.style.left = e.clientX + 'px';
        glow.style.top = e.clientY + 'px';
    });

    // Filtering
    document.querySelectorAll('.filter-btn').forEach((btn) => {
        btn.addEventListener('click', (e) => {
            document.querySelector('.filter-btn.active').classList.remove('active');
            e.target.classList.add('active');
            renderProjects(e.target.dataset.filter);
        });
    });

    // Sorting
    document.getElementById('sort-year').addEventListener('change', (e) => {
        renderCredentials(e.target.value);
    });

    // Modal Closing
    window.onclick = (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    };

    document.querySelector('.close-modal').onclick = () => {
        document.getElementById('project-modal').style.display = 'none';
    };
});
