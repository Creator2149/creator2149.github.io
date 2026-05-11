/**
 * filters.js — Dynamic filtering system
 * 
 * Features:
 * - Tag-based filtering
 * - Search filtering
 * - Animated transitions
 * - Works with projects, certificates, and blender items
 */

(function () {
  'use strict';

  /**
   * Initialize filter system for a given container
   * @param {Object} options
   * @param {HTMLElement} options.container - Grid container to filter
   * @param {HTMLElement} options.filterBar - Filter buttons container
   * @param {Array} options.data - Data array
   * @param {Function} options.renderFn - Function to create card elements
   * @param {string} options.filterKey - Key to filter by (e.g., 'tech', 'field', 'tags')
   * @param {string} options.allLabel - Label for the "All" filter button
   */
  function initFilterSystem(options) {
    const { container, filterBar, data, renderFn, filterKey, allLabel = 'All' } = options;
    if (!container || !filterBar || !data || !renderFn) return;

    // Extract unique filter values
    const filterValues = new Set();
    data.forEach(item => {
      const val = item[filterKey];
      if (Array.isArray(val)) {
        val.forEach(v => filterValues.add(v));
      } else if (val) {
        filterValues.add(val);
      }
    });

    // Create filter buttons
    filterBar.innerHTML = '';

    // "All" button
    const allBtn = document.createElement('button');
    allBtn.className = 'filter-btn active';
    allBtn.textContent = allLabel;
    allBtn.addEventListener('click', () => {
      setActiveFilter(allBtn);
      filterItems(null);
    });
    filterBar.appendChild(allBtn);

    // Category buttons
    const sortedValues = [...filterValues].sort();
    sortedValues.forEach(value => {
      const btn = document.createElement('button');
      btn.className = 'filter-btn';
      btn.textContent = value;
      btn.addEventListener('click', () => {
        setActiveFilter(btn);
        filterItems(value);
      });
      filterBar.appendChild(btn);
    });

    function setActiveFilter(activeBtn) {
      filterBar.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
      });
      activeBtn.classList.add('active');
    }

    function filterItems(filterValue) {
      const items = container.querySelectorAll('[data-id]');
      
      items.forEach(item => {
        const itemId = item.dataset.id;
        const dataItem = data.find(d => d.id === itemId);
        if (!dataItem) {
          item.style.display = 'none';
          return;
        }

        let show = true;
        if (filterValue !== null) {
          const val = dataItem[filterKey];
          if (Array.isArray(val)) {
            show = val.includes(filterValue);
          } else {
            show = val === filterValue;
          }
        }

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

  /**
   * Initialize search filter
   * @param {Object} options
   * @param {HTMLElement} options.input - Search input element
   * @param {HTMLElement} options.container - Grid container
   * @param {Array} options.data - Data array
   * @param {Array} options.searchKeys - Keys to search in
   */
  function initSearchFilter(options) {
    const { input, container, data, searchKeys } = options;
    if (!input || !container) return;

    let debounceTimer;

    input.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const query = input.value.toLowerCase().trim();
        filterBySearch(query);
      }, 200);
    });

    function filterBySearch(query) {
      const items = container.querySelectorAll('[data-id]');

      items.forEach(item => {
        const itemId = item.dataset.id;
        const dataItem = data.find(d => d.id === itemId);
        if (!dataItem) return;

        let matches = true;
        if (query) {
          matches = searchKeys.some(key => {
            const val = dataItem[key];
            if (Array.isArray(val)) {
              return val.some(v => String(v).toLowerCase().includes(query));
            }
            return val && String(val).toLowerCase().includes(query);
          });
        }

        item.style.display = matches ? '' : 'none';
      });
    }
  }

  // Expose
  window.FilterSystem = {
    init: initFilterSystem,
    initSearch: initSearchFilter
  };

  // Auto-initialize filters on pages that have filter bars
  function autoInitFilters() {
    // Projects page
    const projectsGrid = document.querySelector('.projects-grid');
    const projectsFilter = document.querySelector('.projects-filters');
    if (projectsGrid && projectsFilter && window.PROJECTS_DATA) {
      initFilterSystem({
        container: projectsGrid,
        filterBar: projectsFilter,
        data: PROJECTS_DATA,
        renderFn: null, // Already rendered by main.js
        filterKey: 'tech',
        allLabel: 'All Projects'
      });
    }

    // Certificates page
    const certGrid = document.querySelector('.certificates-grid');
    const certFilter = document.querySelector('.certificates-filters');
    if (certGrid && certFilter && window.CERTIFICATES_DATA) {
      initFilterSystem({
        container: certGrid,
        filterBar: certFilter,
        data: CERTIFICATES_DATA,
        renderFn: null,
        filterKey: 'field',
        allLabel: 'All Fields'
      });
    }

    // Blender page
    const blenderGrid = document.querySelector('.blender-grid');
    const blenderFilter = document.querySelector('.blender-filters');
    if (blenderGrid && blenderFilter && window.BLENDER_DATA) {
      initFilterSystem({
        container: blenderGrid,
        filterBar: blenderFilter,
        data: BLENDER_DATA,
        renderFn: null,
        filterKey: 'renderEngine',
        allLabel: 'All Renders'
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInitFilters);
  } else {
    autoInitFilters();
  }

})();
