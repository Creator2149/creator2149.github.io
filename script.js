/**
 * Rishit Choudhary Portfolio Engine
 * Neo-Futuristic Glassmorphism - Vanilla JS
 */

// portfolioData is loaded from data.js

// --- UTILITIES ---
function getYearScore(dateStr) {
    if (!dateStr) return 0;

    // Handle "1st March, 2026" or "3rd February, 2025"
    const longDateMatch = dateStr.match(/(\d+)(?:st|nd|rd|th)?\s+([a-zA-Z]+),?\s+(\d{4})/);
    if (longDateMatch) {
        const day = parseInt(longDateMatch[1]);
        const monthName = longDateMatch[2];
        const year = parseInt(longDateMatch[3]);
        const date = new Date(`${monthName} ${day}, ${year}`);
        if (!isNaN(date.getTime())) {
            return date.getTime() / 1000000; // Return timestamp-based score
        }
    }

    // Handle "AY 2025-26" or "Summer AY 24-25"
    const ayMatch = dateStr.match(/(\d{2,4})-(\d{2})/);
    if (ayMatch) {
        let year = parseInt(ayMatch[1]);
        if (year < 100) year += 2000; // Convert 25 to 2025
        let score = year;
        if (dateStr.includes('Summer')) score += 0.5;
        return score;
    }

    return 0;
}

// --- RENDERING ENGINES ---
function renderProjects(filter = 'all') {
    const grid = document.getElementById('projects-grid');
    if (!grid) return;
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

function renderCredentials() {
    const grid = document.getElementById('credentials-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const sorted = [...portfolioData.credentials].sort((a, b) => {
        const scoreA = getYearScore(a.year);
        const scoreB = getYearScore(b.year);
        return scoreB - scoreA; // Always Latest First
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

function renderBlenderProjects() {
    const grid = document.getElementById('blender-grid');
    if (!grid || !portfolioData.blenderProjects) return;
    grid.innerHTML = '';

    portfolioData.blenderProjects.sort((a, b) => getYearScore(b.date) - getYearScore(a.date));

    portfolioData.blenderProjects.forEach((p) => {
        const card = document.createElement('div');
        card.className = 'glass-card cert-card'; // Reuse cert-card style for similar layout
        card.innerHTML = `
            <div class="card-content">
                <h3>${p.title}</h3>
                <p>${p.date}</p>
                <div class="img-container" style="height: 200px; background: rgba(0,0,0,0.3); margin-top: 15px; border-radius: 5px; display: flex; align-items: center; justify-content: center; overflow: hidden;">
                    <img src="${p.image}" alt="${p.title}" style="max-height: 100%; max-width: 100%; object-fit: contain;">
                </div>
                ${p.repo !== '#' ? `<a href="${p.repo}" target="_blank" class="btn secondary" style="margin-top: 20px; width: 100%; text-align: center;" onclick="event.stopPropagation()">View Repository</a>` : ''}
            </div>
        `;
        card.style.cursor = 'pointer';
        card.onclick = () => {
            const modal = document.getElementById('cert-modal');
            const body = document.getElementById('cert-modal-body');
            body.innerHTML = `
                <h2 style="color: var(--accent-color); margin-bottom: 10px;">${p.title}</h2>
                <p style="margin: 10px 0 5px 0;"><strong>Completed:</strong> ${p.date}</p>
                <div id="modal-img-container" style="display: flex; justify-content: center; align-items: center; margin: 20px 0; min-height: 200px; background: rgba(0,0,0,0.2); border-radius: 10px; overflow: hidden;">
                    <img src="${p.image}" alt="${p.title}" style="width: 100%; height: auto; border-radius: 10px; box-shadow: 0 0 20px #00fff7a0; object-fit: contain; background: #222;">
                </div>
                ${p.repo !== '#' ? `<a href="${p.repo}" target="_blank" class="btn primary" style="width: 100%; text-align: center;">View Repository</a>` : ''}
            `;
            modal.style.display = 'block';
        };
        grid.appendChild(card);
    });
}

// --- MODALS ---
window.openProjectModal = (id) => {
    const p = portfolioData.projects.find((proj) => proj.id === id);
    const modal = document.getElementById('project-modal');
    const body = document.getElementById('modal-body');
    if (!p) return;

    body.innerHTML = `
        <h2 style="color: var(--accent-color); margin-bottom: 10px;">${p.title}</h2>
        <div class="status-badge ${p.status.toLowerCase().replace(' ', '-')}">${p.status}</div>
        <p><strong>Year:</strong> ${p.academicYear}</p>
        <p style="margin: 20px 0; line-height: 1.8;">${p.fullDesc}</p>
        <div class="tech-stack" style="margin-bottom: 20px;">
            ${p.tech.map((t) => `<span class="tech-tag">${t}</span>`).join('')}
        </div>
        ${p.link !== '#' ? `<a href="${p.link}" target="_blank" class="btn primary">View Project/Website</a>` : ''}
    `;
    modal.style.display = 'block';
};

window.openCertModal = (certId) => {
    const c = portfolioData.credentials.find((cert) => cert.id === certId);
    const modal = document.getElementById('cert-modal');
    const body = document.getElementById('cert-modal-body');
    if (!c) return;

    body.innerHTML = `
        <h2 style="color: var(--accent-color); margin-bottom: 10px;">${c.title}</h2>
        <span class="tech-tag">${c.discipline}</span>
        <p style="margin: 10px 0 5px 0;"><strong>Year:</strong> ${c.year}</p>
        <div id="modal-img-container" style="display: flex; justify-content: center; align-items: center; margin: 20px 0; min-height: 200px; background: rgba(0,0,0,0.2); border-radius: 10px; overflow: hidden;">
        </div>
    `;

    const container = document.getElementById('modal-img-container');
    if (c.img && c.img !== 'placeholder.png') {
        const img = document.createElement('img');
        img.src = c.img;
        img.alt = c.title;
        img.style.width = '100%';
        img.style.height = 'auto';
        img.style.maxWidth = '100%';
        img.style.borderRadius = '10px';
        img.style.boxShadow = '0 0 20px #00fff7a0';
        img.style.objectFit = 'contain';
        img.style.background = '#222';
        img.style.display = 'block';
        img.onerror = function () {
            this.style.display = 'none';
            container.innerHTML = `<span style="color: var(--accent-color); font-size: 2rem;">[No Certificate]</span>`;
        };
        container.appendChild(img);
    } else {
        container.innerHTML = `<span style="color: var(--accent-color); font-size: 2rem;">[No Certificate]</span>`;
    }

    modal.style.display = 'block';
};

// --- PARTICLES ENGINE ---
function initParticles() {
    if (window.innerWidth < 768) return;
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;
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

// --- EVENT LISTENERS ---
document.addEventListener('DOMContentLoaded', () => {
    renderProjects();
    renderCredentials();
    renderBlenderProjects();
    initParticles();

    // Admin Trigger: Copyright click 3 times
    let clickCount = 0;
    let clickTimer = null;
    const adminTrigger = document.getElementById('admin-trigger');
    if (adminTrigger) {
        adminTrigger.style.cursor = 'pointer';
        adminTrigger.addEventListener('click', () => {
            clickCount++;
            clearTimeout(clickTimer);
            if (clickCount === 3) {
                window.location.href = 'admin.html';
                clickCount = 0;
            } else {
                clickTimer = setTimeout(() => {
                    clickCount = 0;
                }, 1000);
            }
        });
    }

    // Modal Close Logic
    const closeCertModal = document.getElementById('close-cert-modal');
    if (closeCertModal) {
        closeCertModal.onclick = () => {
            document.getElementById('cert-modal').style.display = 'none';
        };
    }

    const closeModal = document.querySelector('.close-modal');
    if (closeModal) {
        closeModal.onclick = () => {
            document.getElementById('project-modal').style.display = 'none';
        };
    }

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

    // Cursor Glow
    const glow = document.getElementById('cursor-glow');
    if (glow) {
        document.addEventListener('mousemove', (e) => {
            glow.style.left = e.clientX + 'px';
            glow.style.top = e.clientY + 'px';
        });
    }

    // Filtering
    document.querySelectorAll('.filter-btn').forEach((btn) => {
        btn.addEventListener('click', (e) => {
            const activeBtn = document.querySelector('.filter-btn.active');
            if (activeBtn) activeBtn.classList.remove('active');
            e.target.classList.add('active');
            renderProjects(e.target.dataset.filter);
        });
    });
});
