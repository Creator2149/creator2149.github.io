function escHtml(str) {
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function renderMarkdown(md) {
    if (!md) return '';

    const footnotes = {};
    let fnCounter = 0;

    md = md.replace(/^\[\^([^\]]+)\]:\s*(.+)$/gm, (_, id, text) => {
        footnotes[id] = { text: text.trim(), index: null };
        return '';
    });

    md = md.replace(/\[\^([^\]]+)\]/g, (_, id) => {
        if (!footnotes[id]) return `[^${id}]`;
        if (footnotes[id].index === null) {
            fnCounter++;
            footnotes[id].index = fnCounter;
        }
        const n = footnotes[id].index;
        return `<sup><a href="#fn-${n}" id="fnref-${n}" class="fn-ref">${n}</a></sup>`;
    });

    let fnHtml = '';
    const fnEntries = Object.values(footnotes)
        .filter((f) => f.index !== null)
        .sort((a, b) => a.index - b.index);

    if (fnEntries.length > 0) {
        const items = Object.entries(footnotes)
            .filter(([_, f]) => f.index !== null)
            .sort(([_, a], [__, b]) => a.index - b.index)
            .map(
                ([_, f]) => `
            <li id="fn-${f.index}" class="fn-item">
            <span class="fn-number">${f.index}</span>
            <span class="fn-text">${f.text}
                <a href="#fnref-${f.index}" class="fn-back" title="Back to text">↩</a>
            </span>
            </li>`,
            )
            .join('');
        fnHtml = `<div class="footnotes"><hr><ol class="fn-list">${items}</ol></div>`;
    }

    let html = md;

    html = html.replace(
        /```(\w*)\n([\s\S]*?)```/g,
        (_, lang, code) => `<pre><code class="language-${lang || 'text'}">${escHtml(code.trim())}</code></pre>`,
    );
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    html = html.replace(/^######\s+(.+)$/gm, '<h6>$1</h6>');
    html = html.replace(/^#####\s+(.+)$/gm, '<h5>$1</h5>');
    html = html.replace(/^####\s+(.+)$/gm, '<h4>$1</h4>');
    html = html.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>');
    html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
    html = html.replace(/___(.+?)___/g, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    html = html.replace(/_([^_\s][^_]*[^_\s]|[^_\s])_/g, '<em>$1</em>');
    html = html.replace(/^>\s+(.+)$/gm, '<blockquote>$1</blockquote>');
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="md-img">');
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    html = html.replace(/^---+$/gm, '<hr>');
    html = html.replace(/^[-*]\s+(.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');
    html = html.replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>');

    const mathBlocks = [];
    html = html.replace(/\$\$([\s\S]+?)\$\$/g, (match) => {
        mathBlocks.push(match);
        return `%%MATHBLOCK_${mathBlocks.length - 1}%%`;
    });

    html = html
        .split(/\n{2,}/)
        .map((block) => {
            block = block.trim();
            if (!block) return '';
            if (/^%%MATHBLOCK_\d+%%$/.test(block)) return block;
            if (/^<(h[1-6]|ul|ol|pre|blockquote|hr|iframe|div|figure)/.test(block)) return block;
            return `<p>${block.replace(/\n/g, '<br>')}</p>`;
        })
        .join('\n');

    html = html.replace(/%%MATHBLOCK_(\d+)%%/g, (_, i) => mathBlocks[parseInt(i, 10)]);
    return html + fnHtml;
}

async function loadProjectPage() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const project = window.PROJECTS_DATA?.find((item) => item.id === id);
    const main = document.getElementById('project-main');

    if (!main) return;

    if (!project) {
        main.innerHTML = `
            <section class="project-page__hero">
                <div class="project-page__hero-inner">
                    <a class="project-page__back" href="projects.html"><i class="fa-solid fa-arrow-left" aria-hidden="true"></i> Back to Projects</a>
                    <h1 class="project-page__title">Project not found</h1>
                    <p class="project-page__subtitle">The requested project could not be located. Please choose another item from the projects list.</p>
                </div>
            </section>
            <div class="project-page__body">
                <section class="project-page__section">
                    <p class="project-page-loading">No project data matched the requested identifier.</p>
                </section>
            </div>
        `;
        return;
    }

    document.title = `${project.title} — Rishit Choudhary`;

    main.innerHTML = `
        <header class="proj-page-hero" style="background-image: url('${project.image || ''}')">
            <div class="proj-page-hero-overlay"></div>
            <div class="proj-page-hero-inner">
                <a class="proj-page-back" href="projects.html"><i class="fa-solid fa-arrow-left" aria-hidden="true"></i> Back to Projects</a>
                <h1 class="proj-page-title">${escHtml(project.title)}</h1>
                <p class="proj-page-short">${escHtml(project.shortDescription || '')}</p>
                ${project.link ? `<div class="proj-page-link"><a class="project-page__button" href="${project.link}" target="_blank" rel="noopener noreferrer">Open Project</a></div>` : ''}
            </div>
        </header>

        <div class="proj-page-body-wrap">
            <div class="proj-page-content">
                <article class="md-content" id="project-content">
                    <div class="proj-page-loading">Loading…</div>
                </article>
            </div>
        </div>
    `;

    const contentEl = document.getElementById('project-content');
    if (!contentEl) return;

    const renderFallback = () => {
        contentEl.innerHTML = renderMarkdown(project.shortDescription || 'No project content available.');
    };

    if (project.mdFile) {
        try {
            const response = await fetch(project.mdFile);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const markdown = await response.text();
            contentEl.innerHTML = renderMarkdown(markdown);
        } catch (error) {
            console.warn('Markdown fetch failed:', error);
            renderFallback();
        }
    } else {
        renderFallback();
    }

    requestAnimationFrame(() => {
        if (typeof renderMathInElement !== 'undefined') {
            renderMathInElement(contentEl, {
                delimiters: [
                    { left: '$$', right: '$$', display: true },
                    { left: '$', right: '$', display: false },
                ],
                throwOnError: false,
            });
        }
    });
}

document.addEventListener('DOMContentLoaded', loadProjectPage);
