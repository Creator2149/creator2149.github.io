/**
 * filters.js — Project status filter system
 *
 * Provides a filter bar and filtering logic for the projects
 * archive page. Filters by status: All / Completed / In Progress / Planned.
 *
 * Usage:
 *   initFilters(containerSelector, items, renderFn)
 *     containerSelector — CSS selector for the filter bar container
 *     items             — full array of project data objects
 *     renderFn          — function(filteredItems) to re-render the grid
 */

function initFilters(containerSelector, items, renderFn) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  const filters = [
    { label: "All", value: "all" },
    { label: "Completed", value: "Completed" },
    { label: "In Progress", value: "In Progress" },
    { label: "Planned", value: "Planned" },
  ];

  let activeFilter = "all";

  filters.forEach((f) => {
    const btn = document.createElement("button");
    btn.className = "filters__btn";
    if (f.value === "all") btn.classList.add("filters__btn--active");
    btn.textContent = f.label;
    btn.setAttribute("data-filter", f.value);

    btn.addEventListener("click", () => {
      activeFilter = f.value;

      /* Update active state on all buttons */
      container.querySelectorAll(".filters__btn").forEach((b) => {
        b.classList.toggle("filters__btn--active", b.getAttribute("data-filter") === activeFilter);
      });

      /* Filter items */
      const filtered =
        activeFilter === "all"
          ? items
          : items.filter((item) => item.status === activeFilter);

      renderFn(filtered);
    });

    container.appendChild(btn);
  });
}
