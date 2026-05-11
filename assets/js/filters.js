/**
 * filters.js — Project status filtering
 *
 * Filters projects on the Projects page by status:
 *   Completed (green), In Progress (yellow), Planned (grey)
 */

(function () {
    'use strict';

    // Status → CSS class and display order
    const STATUS_CONFIG = {
        Completed: { cls: 'filter-btn--completed', order: 1 },
        'In Progress': { cls: 'filter-btn--in-progress', order: 2 },
        Planned: { cls: 'filter-btn--planned', order: 3 },
    };

    function initProjectFilters() {
        const container = document.querySelector('.projects-grid');
        const filterBar = document.querySelector('.projects-filters');
        if (!container || !filterBar || !window.PROJECTS_DATA) return;

        const data = PROJECTS_DATA;
        const filterKey = 'status';

        // Collect unique statuses present in data
        const statusSet = new Set();
        data.forEach((item) => {
            if (item[filterKey]) statusSet.add(item[filterKey]);
        });

        // Sort by defined order
        const statuses = [...statusSet].sort((a, b) => {
            return (STATUS_CONFIG[a]?.order ?? 99) - (STATUS_CONFIG[b]?.order ?? 99);
        });

        // Build filter bar
        filterBar.innerHTML = '';

        // "All" button
        const allBtn = document.createElement('button');
        allBtn.className = 'filter-btn active';
        allBtn.textContent = 'All';
        allBtn.addEventListener('click', () => {
            setActive(allBtn);
            filterItems(null);
        });
        filterBar.appendChild(allBtn);

        // Status buttons
        statuses.forEach((status) => {
            const cfg = STATUS_CONFIG[status] || {};
            const btn = document.createElement('button');
            btn.className = `filter-btn ${cfg.cls || ''}`.trim();
            btn.textContent = status;
            btn.addEventListener('click', () => {
                setActive(btn);
                filterItems(status);
            });
            filterBar.appendChild(btn);
        });

        function setActive(activeBtn) {
            filterBar.querySelectorAll('.filter-btn').forEach((btn) => btn.classList.remove('active'));
            activeBtn.classList.add('active');
        }

        function filterItems(filterValue) {
            const items = container.querySelectorAll('[data-id]');

            items.forEach((item) => {
                const dataItem = data.find((d) => d.id === item.dataset.id);
                if (!dataItem) {
                    item.style.display = 'none';
                    return;
                }

                const show = filterValue === null || dataItem[filterKey] === filterValue;

                if (show) {
                    item.style.display = '';
                    item.style.opacity = '0';
                    item.style.transform = 'translateY(10px)';
                    requestAnimationFrame(() => {
                        item.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                        item.style.opacity = '1';
                        item.style.transform = 'translateY(0)';
                    });
                } else {
                    item.style.transition = 'opacity 0.2s ease';
                    item.style.opacity = '0';
                    setTimeout(() => {
                        item.style.display = 'none';
                    }, 200);
                }
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initProjectFilters);
    } else {
        initProjectFilters();
    }
})();
