/**
 * admin.js — Admin panel logic
 *
 * Manages CRUD operations for projects, certificates, and Blender
 * items. All edits happen in local state first; changes are pushed
 * to GitHub only when the user explicitly syncs.
 *
 * Workflow:
 *   1. Load current data from the data modules
 *   2. Render admin lists with edit/delete actions
 *   3. Provide add/edit forms for each data type
 *   4. On sync: upload pending images, then rewrite data files
 */

const Admin = (() => {
  /* ── Local state ─────────────────────────────────────────── */
  let projects = JSON.parse(JSON.stringify(PROJECTS));
  let certificates = JSON.parse(JSON.stringify(CERTIFICATES));
  let blenderItems = JSON.parse(JSON.stringify(BLENDER_PROJECTS));

  /* Pending image uploads: { [category]: Map<itemId, File> } */
  const pendingImages = {
    projects: new Map(),
    certificates: new Map(),
    blender: new Map(),
  };

  /* Track which items have been edited */
  const dirty = {
    projects: false,
    certificates: false,
    blender: false,
  };

  let editingItem = null; // { type, id }

  /* ── Initialisation ──────────────────────────────────────── */

  function init() {
    renderPATBanner();
    renderProjectsSection();
    renderCertificatesSection();
    renderBlenderSection();
    renderSyncBar();
  }

  /* ── PAT Banner ──────────────────────────────────────────── */

  function renderPATBanner() {
    const container = document.getElementById("pat-banner");
    if (!container) return;

    container.innerHTML = "";

    const banner = document.createElement("div");
    banner.className = "pat-banner";

    const status = document.createElement("div");
    status.className = "pat-banner__status";
    const dot = document.createElement("span");
    dot.className = "pat-banner__dot" + (GitHubAPI.hasPAT() ? " pat-banner__dot--connected" : "");
    const statusText = document.createElement("span");
    statusText.textContent = GitHubAPI.hasPAT()
      ? `Connected as ${GitHubAPI.getPATMasked()}`
      : "No PAT connected";
    status.appendChild(dot);
    status.appendChild(statusText);

    const input = document.createElement("input");
    input.className = "pat-banner__input";
    input.type = "password";
    input.placeholder = "Enter GitHub PAT";
    input.value = "";

    const btn = document.createElement("button");
    btn.className = "pat-banner__btn btn";
    btn.textContent = GitHubAPI.hasPAT() ? "Update" : "Connect";

    btn.addEventListener("click", async () => {
      const token = input.value.trim();
      if (!token) return;
      GitHubAPI.setPAT(token);
      const validation = await GitHubAPI.validatePAT();
      if (validation.valid) {
        input.value = "";
        renderPATBanner();
      } else {
        GitHubAPI.clearPAT();
        input.style.borderColor = "#c47070";
        setTimeout(() => { input.style.borderColor = ""; }, 1500);
      }
    });

    banner.appendChild(status);
    banner.appendChild(input);
    banner.appendChild(btn);
    container.appendChild(banner);
  }

  /* ── Generic list renderer ───────────────────────────────── */

  /**
   * Render an admin list for a data type.
   * @param {string} containerId — DOM id for the list container
   * @param {Array} items — data array
   * @param {string} type — "projects" | "certificates" | "blender"
   * @param {Function} metaText — function(item) => string for meta line
   */
  function renderAdminList(containerId, items, type, metaText) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = "";

    if (!items.length) {
      container.innerHTML = '<p class="empty-state">No items yet.</p>';
      return;
    }

    const list = document.createElement("div");
    list.className = "admin-list";

    items.forEach((item) => {
      const el = document.createElement("div");
      el.className = "admin-item" + (item.featured ? " admin-item--featured" : "");

      const info = document.createElement("div");
      info.className = "admin-item__info";

      const title = document.createElement("div");
      title.className = "admin-item__title";
      title.textContent = item.title;

      const meta = document.createElement("div");
      meta.className = "admin-item__meta";
      meta.textContent = metaText(item);

      if (item.featured) {
        const badge = document.createElement("span");
        badge.className = "admin-item__badge";
        badge.textContent = "Featured";
        meta.appendChild(badge);
      }

      info.appendChild(title);
      info.appendChild(meta);

      const actions = document.createElement("div");
      actions.className = "admin-item__actions";

      const editBtn = document.createElement("button");
      editBtn.className = "admin-item__btn";
      editBtn.textContent = "Edit";
      editBtn.addEventListener("click", () => openEditForm(type, item.id));

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "admin-item__btn admin-item__btn--delete";
      deleteBtn.textContent = "Delete";
      deleteBtn.addEventListener("click", () => confirmDelete(type, item.id, item.title));

      actions.appendChild(editBtn);
      actions.appendChild(deleteBtn);

      el.appendChild(info);
      el.appendChild(actions);
      list.appendChild(el);
    });

    container.appendChild(list);
  }

  /* ── Sections ────────────────────────────────────────────── */

  function renderProjectsSection() {
    renderAdminList(
      "projects-list",
      projects,
      "projects",
      (p) => `${p.status} · ${p.year}`
    );
  }

  function renderCertificatesSection() {
    renderAdminList(
      "certificates-list",
      certificates,
      "certificates",
      (c) => `${c.field} · ${c.year}`
    );
  }

  function renderBlenderSection() {
    renderAdminList(
      "blender-list",
      blenderItems,
      "blender",
      (b) => b.date
    );
  }

  /* ── Delete confirmation ─────────────────────────────────── */

  function confirmDelete(type, id, title) {
    const overlay = document.createElement("div");
    overlay.className = "confirm-overlay";

    const dialog = document.createElement("div");
    dialog.className = "confirm-dialog";

    const msg = document.createElement("p");
    msg.className = "confirm-dialog__message";
    msg.textContent = `Delete "${title}"? This will be synced on the next push.`;

    const actions = document.createElement("div");
    actions.className = "confirm-dialog__actions";

    const cancelBtn = document.createElement("button");
    cancelBtn.className = "btn btn--secondary";
    cancelBtn.textContent = "Cancel";
    cancelBtn.addEventListener("click", () => overlay.remove());

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "btn btn--danger";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", () => {
      deleteItem(type, id);
      overlay.remove();
    });

    actions.appendChild(cancelBtn);
    actions.appendChild(deleteBtn);
    dialog.appendChild(msg);
    dialog.appendChild(actions);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    requestAnimationFrame(() => overlay.classList.add("confirm-overlay--visible"));
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) overlay.remove();
    });
  }

  function deleteItem(type, id) {
    if (type === "projects") {
      projects = projects.filter((p) => p.id !== id);
      dirty.projects = true;
      renderProjectsSection();
    } else if (type === "certificates") {
      certificates = certificates.filter((c) => c.id !== id);
      dirty.certificates = true;
      renderCertificatesSection();
    } else if (type === "blender") {
      blenderItems = blenderItems.filter((b) => b.id !== id);
      dirty.blender = true;
      renderBlenderSection();
    }
  }

  /* ── Add / Edit forms ────────────────────────────────────── */

  function openAddForm(type) {
    editingItem = null;
    if (type === "projects") renderProjectForm({}, type);
    else if (type === "certificates") renderCertificateForm({}, type);
    else if (type === "blender") renderBlenderForm({}, type);
  }

  function openEditForm(type, id) {
    let item;
    if (type === "projects") item = projects.find((p) => p.id === id);
    else if (type === "certificates") item = certificates.find((c) => c.id === id);
    else if (type === "blender") item = blenderItems.find((b) => b.id === id);
    if (!item) return;

    editingItem = { type, id };
    if (type === "projects") renderProjectForm(item, type);
    else if (type === "certificates") renderCertificateForm(item, type);
    else if (type === "blender") renderBlenderForm(item, type);
  }

  /* ── Project Form ────────────────────────────────────────── */

  function renderProjectForm(item, type) {
    const container = document.getElementById("form-container");
    if (!container) return;
    container.innerHTML = "";

    const form = document.createElement("div");
    form.className = "admin-form";

    const formTitle = document.createElement("div");
    formTitle.className = "admin-form__title";
    const titleText = document.createElement("span");
    titleText.textContent = item.id ? "Edit Project" : "Add Project";
    const closeBtn = document.createElement("button");
    closeBtn.className = "btn btn--secondary";
    closeBtn.textContent = "Cancel";
    closeBtn.addEventListener("click", () => { container.innerHTML = ""; editingItem = null; });
    formTitle.appendChild(titleText);
    formTitle.appendChild(closeBtn);

    const grid = document.createElement("div");
    grid.className = "admin-form__grid";

    /* Fields */
    const fields = [
      { key: "title", label: "Title", type: "text", value: item.title || "", full: false },
      { key: "status", label: "Status", type: "select", value: item.status || "Planned", options: ["Completed", "In Progress", "Planned"], full: false },
      { key: "year", label: "Year", type: "text", value: item.year || "", full: false },
      { key: "tech", label: "Tech Stack (comma-separated)", type: "text", value: (item.tech || []).join(", "), full: false },
      { key: "shortDescription", label: "Short Description", type: "textarea", value: item.shortDescription || "", full: true },
      { key: "longDescription", label: "Long Description", type: "textarea", value: item.longDescription || "", full: true },
      { key: "link", label: "GitHub / Live Link (optional)", type: "text", value: item.link || "", full: false },
    ];

    fields.forEach((f) => {
      const group = document.createElement("div");
      group.className = "admin-form__group" + (f.full ? " admin-form__group--full" : "");

      const label = document.createElement("label");
      label.className = "admin-form__label";
      label.textContent = f.label;

      let input;
      if (f.type === "textarea") {
        input = document.createElement("textarea");
        input.className = "admin-form__textarea";
        input.value = f.value;
      } else if (f.type === "select") {
        input = document.createElement("select");
        input.className = "admin-form__select";
        f.options.forEach((opt) => {
          const option = document.createElement("option");
          option.value = opt;
          option.textContent = opt;
          if (opt === f.value) option.selected = true;
          input.appendChild(option);
        });
      } else {
        input = document.createElement("input");
        input.className = "admin-form__input";
        input.type = f.type;
        input.value = f.value;
      }

      input.setAttribute("data-field", f.key);
      group.appendChild(label);
      group.appendChild(input);
      grid.appendChild(group);
    });

    /* Featured toggle */
    const featuredGroup = document.createElement("div");
    featuredGroup.className = "admin-form__group";
    const featuredLabel = document.createElement("label");
    featuredLabel.className = "admin-form__toggle";
    const featuredCheckbox = document.createElement("input");
    featuredCheckbox.type = "checkbox";
    featuredCheckbox.checked = item.featured || false;
    featuredCheckbox.setAttribute("data-field", "featured");
    const featuredText = document.createElement("span");
    featuredText.className = "admin-form__toggle-label";
    featuredText.textContent = "Featured on Home Page";
    featuredLabel.appendChild(featuredCheckbox);
    featuredLabel.appendChild(featuredText);
    featuredGroup.appendChild(featuredLabel);
    grid.appendChild(featuredGroup);

    /* Image upload */
    const imageGroup = document.createElement("div");
    imageGroup.className = "admin-form__group admin-form__group--full";
    const imageLabel = document.createElement("label");
    imageLabel.className = "admin-form__label";
    imageLabel.textContent = "Project Image (optional)";
    const imageFile = document.createElement("input");
    imageFile.type = "file";
    imageFile.accept = "image/*";
    imageFile.setAttribute("data-field", "image");
    imageGroup.appendChild(imageLabel);
    imageGroup.appendChild(imageFile);

    /* Preview existing image */
    if (item.image) {
      const preview = document.createElement("img");
      preview.className = "admin-form__image-preview";
      preview.src = item.image;
      preview.alt = "Current image";
      imageGroup.appendChild(preview);
    }

    grid.appendChild(imageGroup);

    /* Save button */
    const actions = document.createElement("div");
    actions.className = "admin-form__actions";
    const saveBtn = document.createElement("button");
    saveBtn.className = "btn btn--primary";
    saveBtn.textContent = item.id ? "Save Changes" : "Add Project";
    saveBtn.addEventListener("click", () => saveProject(item));
    actions.appendChild(saveBtn);
    grid.appendChild(actions);

    form.appendChild(formTitle);
    form.appendChild(grid);
    container.appendChild(form);

    /* Scroll to form */
    container.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function saveProject(existingItem) {
    const getValue = (key) => {
      const el = document.querySelector(`[data-field="${key}"]`);
      if (!el) return "";
      if (el.type === "checkbox") return el.checked;
      return el.value.trim();
    };

    const title = getValue("title");
    if (!title) { alert("Title is required."); return; }

    const techRaw = getValue("tech");
    const tech = techRaw ? techRaw.split(",").map((t) => t.trim()).filter(Boolean) : [];

    const project = {
      id: existingItem.id || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
      featured: getValue("featured"),
      title: title,
      status: getValue("status"),
      year: getValue("year"),
      tech: tech,
      image: existingItem.image || "",
      shortDescription: getValue("shortDescription"),
      longDescription: getValue("longDescription"),
      link: getValue("link"),
    };

    /* Handle image upload */
    const fileInput = document.querySelector('[data-field="image"]');
    if (fileInput && fileInput.files && fileInput.files[0]) {
      pendingImages.projects.set(project.id, fileInput.files[0]);
      /* Set temporary path */
      project.image = `${SITE.paths.projectImages}${fileInput.files[0].name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    }

    if (existingItem.id) {
      /* Update */
      const idx = projects.findIndex((p) => p.id === existingItem.id);
      if (idx !== -1) projects[idx] = project;
    } else {
      /* Add */
      projects.push(project);
    }

    dirty.projects = true;
    renderProjectsSection();
    document.getElementById("form-container").innerHTML = "";
    editingItem = null;
  }

  /* ── Certificate Form ────────────────────────────────────── */

  function renderCertificateForm(item, type) {
    const container = document.getElementById("form-container");
    if (!container) return;
    container.innerHTML = "";

    const form = document.createElement("div");
    form.className = "admin-form";

    const formTitle = document.createElement("div");
    formTitle.className = "admin-form__title";
    const titleText = document.createElement("span");
    titleText.textContent = item.id ? "Edit Certificate" : "Add Certificate";
    const closeBtn = document.createElement("button");
    closeBtn.className = "btn btn--secondary";
    closeBtn.textContent = "Cancel";
    closeBtn.addEventListener("click", () => { container.innerHTML = ""; editingItem = null; });
    formTitle.appendChild(titleText);
    formTitle.appendChild(closeBtn);

    const grid = document.createElement("div");
    grid.className = "admin-form__grid";

    const fields = [
      { key: "title", label: "Title", type: "text", value: item.title || "", full: false },
      { key: "field", label: "Field", type: "text", value: item.field || "", full: false },
      { key: "year", label: "Year", type: "text", value: item.year || "", full: false },
    ];

    fields.forEach((f) => {
      const group = document.createElement("div");
      group.className = "admin-form__group";
      const label = document.createElement("label");
      label.className = "admin-form__label";
      label.textContent = f.label;
      const input = document.createElement("input");
      input.className = "admin-form__input";
      input.type = f.type;
      input.value = f.value;
      input.setAttribute("data-field", f.key);
      group.appendChild(label);
      group.appendChild(input);
      grid.appendChild(group);
    });

    /* Featured toggle */
    const featuredGroup = document.createElement("div");
    featuredGroup.className = "admin-form__group";
    const featuredLabel = document.createElement("label");
    featuredLabel.className = "admin-form__toggle";
    const featuredCheckbox = document.createElement("input");
    featuredCheckbox.type = "checkbox";
    featuredCheckbox.checked = item.featured || false;
    featuredCheckbox.setAttribute("data-field", "featured");
    const featuredText = document.createElement("span");
    featuredText.className = "admin-form__toggle-label";
    featuredText.textContent = "Featured on Home Page";
    featuredLabel.appendChild(featuredCheckbox);
    featuredLabel.appendChild(featuredText);
    featuredGroup.appendChild(featuredLabel);
    grid.appendChild(featuredGroup);

    /* Image upload */
    const imageGroup = document.createElement("div");
    imageGroup.className = "admin-form__group admin-form__group--full";
    const imageLabel = document.createElement("label");
    imageLabel.className = "admin-form__label";
    imageLabel.textContent = "Certificate Image (optional)";
    const imageFile = document.createElement("input");
    imageFile.type = "file";
    imageFile.accept = "image/*";
    imageFile.setAttribute("data-field", "image");
    imageGroup.appendChild(imageLabel);
    imageGroup.appendChild(imageFile);

    if (item.image) {
      const preview = document.createElement("img");
      preview.className = "admin-form__image-preview";
      preview.src = item.image;
      preview.alt = "Current image";
      imageGroup.appendChild(preview);
    }

    grid.appendChild(imageGroup);

    const actions = document.createElement("div");
    actions.className = "admin-form__actions";
    const saveBtn = document.createElement("button");
    saveBtn.className = "btn btn--primary";
    saveBtn.textContent = item.id ? "Save Changes" : "Add Certificate";
    saveBtn.addEventListener("click", () => saveCertificate(item));
    actions.appendChild(saveBtn);
    grid.appendChild(actions);

    form.appendChild(formTitle);
    form.appendChild(grid);
    container.appendChild(form);
    container.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function saveCertificate(existingItem) {
    const getValue = (key) => {
      const el = document.querySelector(`[data-field="${key}"]`);
      if (!el) return "";
      if (el.type === "checkbox") return el.checked;
      return el.value.trim();
    };

    const title = getValue("title");
    if (!title) { alert("Title is required."); return; }

    const cert = {
      id: existingItem.id || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
      featured: getValue("featured"),
      title: title,
      field: getValue("field"),
      year: getValue("year"),
      image: existingItem.image || "",
    };

    const fileInput = document.querySelector('[data-field="image"]');
    if (fileInput && fileInput.files && fileInput.files[0]) {
      pendingImages.certificates.set(cert.id, fileInput.files[0]);
      cert.image = `${SITE.paths.certificateImages}${fileInput.files[0].name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    }

    if (existingItem.id) {
      const idx = certificates.findIndex((c) => c.id === existingItem.id);
      if (idx !== -1) certificates[idx] = cert;
    } else {
      certificates.push(cert);
    }

    dirty.certificates = true;
    renderCertificatesSection();
    document.getElementById("form-container").innerHTML = "";
    editingItem = null;
  }

  /* ── Blender Form ────────────────────────────────────────── */

  function renderBlenderForm(item, type) {
    const container = document.getElementById("form-container");
    if (!container) return;
    container.innerHTML = "";

    const form = document.createElement("div");
    form.className = "admin-form";

    const formTitle = document.createElement("div");
    formTitle.className = "admin-form__title";
    const titleText = document.createElement("span");
    titleText.textContent = item.id ? "Edit Blender Project" : "Add Blender Project";
    const closeBtn = document.createElement("button");
    closeBtn.className = "btn btn--secondary";
    closeBtn.textContent = "Cancel";
    closeBtn.addEventListener("click", () => { container.innerHTML = ""; editingItem = null; });
    formTitle.appendChild(titleText);
    formTitle.appendChild(closeBtn);

    const grid = document.createElement("div");
    grid.className = "admin-form__grid";

    const fields = [
      { key: "title", label: "Title", type: "text", value: item.title || "", full: false },
      { key: "date", label: "Date", type: "text", value: item.date || "", full: false },
    ];

    fields.forEach((f) => {
      const group = document.createElement("div");
      group.className = "admin-form__group";
      const label = document.createElement("label");
      label.className = "admin-form__label";
      label.textContent = f.label;
      const input = document.createElement("input");
      input.className = "admin-form__input";
      input.type = f.type;
      input.value = f.value;
      input.setAttribute("data-field", f.key);
      group.appendChild(label);
      group.appendChild(input);
      grid.appendChild(group);
    });

    /* Featured toggle */
    const featuredGroup = document.createElement("div");
    featuredGroup.className = "admin-form__group";
    const featuredLabel = document.createElement("label");
    featuredLabel.className = "admin-form__toggle";
    const featuredCheckbox = document.createElement("input");
    featuredCheckbox.type = "checkbox";
    featuredCheckbox.checked = item.featured || false;
    featuredCheckbox.setAttribute("data-field", "featured");
    const featuredText = document.createElement("span");
    featuredText.className = "admin-form__toggle-label";
    featuredText.textContent = "Featured on Home Page";
    featuredLabel.appendChild(featuredCheckbox);
    featuredLabel.appendChild(featuredText);
    featuredGroup.appendChild(featuredLabel);
    grid.appendChild(featuredGroup);

    /* Image upload */
    const imageGroup = document.createElement("div");
    imageGroup.className = "admin-form__group admin-form__group--full";
    const imageLabel = document.createElement("label");
    imageLabel.className = "admin-form__label";
    imageLabel.textContent = "Render Image";
    const imageFile = document.createElement("input");
    imageFile.type = "file";
    imageFile.accept = "image/*";
    imageFile.setAttribute("data-field", "image");
    imageGroup.appendChild(imageLabel);
    imageGroup.appendChild(imageFile);

    if (item.image) {
      const preview = document.createElement("img");
      preview.className = "admin-form__image-preview";
      preview.src = item.image;
      preview.alt = "Current image";
      imageGroup.appendChild(preview);
    }

    grid.appendChild(imageGroup);

    const actions = document.createElement("div");
    actions.className = "admin-form__actions";
    const saveBtn = document.createElement("button");
    saveBtn.className = "btn btn--primary";
    saveBtn.textContent = item.id ? "Save Changes" : "Add Blender Project";
    saveBtn.addEventListener("click", () => saveBlenderItem(item));
    actions.appendChild(saveBtn);
    grid.appendChild(actions);

    form.appendChild(formTitle);
    form.appendChild(grid);
    container.appendChild(form);
    container.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function saveBlenderItem(existingItem) {
    const getValue = (key) => {
      const el = document.querySelector(`[data-field="${key}"]`);
      if (!el) return "";
      if (el.type === "checkbox") return el.checked;
      return el.value.trim();
    };

    const title = getValue("title");
    if (!title) { alert("Title is required."); return; }

    const item = {
      id: existingItem.id || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
      featured: getValue("featured"),
      title: title,
      date: getValue("date"),
      image: existingItem.image || "",
    };

    const fileInput = document.querySelector('[data-field="image"]');
    if (fileInput && fileInput.files && fileInput.files[0]) {
      pendingImages.blender.set(item.id, fileInput.files[0]);
      item.image = `${SITE.paths.blenderImages}${fileInput.files[0].name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    }

    if (existingItem.id) {
      const idx = blenderItems.findIndex((b) => b.id === existingItem.id);
      if (idx !== -1) blenderItems[idx] = item;
    } else {
      blenderItems.push(item);
    }

    dirty.blender = true;
    renderBlenderSection();
    document.getElementById("form-container").innerHTML = "";
    editingItem = null;
  }

  /* ── Sync ────────────────────────────────────────────────── */

  function renderSyncBar() {
    const container = document.getElementById("sync-bar");
    if (!container) return;

    container.innerHTML = "";

    const bar = document.createElement("div");
    bar.className = "sync-bar";

    const status = document.createElement("div");
    status.className = "sync-bar__status";
    status.id = "sync-status";
    status.textContent = getDirtyStatus();

    const syncBtn = document.createElement("button");
    syncBtn.className = "btn btn--sync";
    syncBtn.id = "sync-btn";
    syncBtn.textContent = "Sync to GitHub";
    syncBtn.addEventListener("click", syncToGitHub);

    bar.appendChild(status);
    bar.appendChild(syncBtn);
    container.appendChild(bar);
  }

  function getDirtyStatus() {
    const parts = [];
    if (dirty.projects) parts.push("Projects");
    if (dirty.certificates) parts.push("Certificates");
    if (dirty.blender) parts.push("Blender");
    return parts.length ? `Unsynced: ${parts.join(", ")}` : "All changes synced";
  }

  function updateSyncStatus() {
    const el = document.getElementById("sync-status");
    if (el) el.textContent = getDirtyStatus();
  }

  async function syncToGitHub() {
    if (!GitHubAPI.hasPAT()) {
      alert("Please connect your GitHub PAT first.");
      return;
    }

    const btn = document.getElementById("sync-btn");
    const statusEl = document.getElementById("sync-status");
    if (btn) btn.disabled = true;
    if (statusEl) {
      statusEl.textContent = "Syncing...";
      statusEl.className = "sync-bar__status";
    }

    let hasError = false;

    /* 1. Upload pending images */
    for (const [category, fileMap] of Object.entries(pendingImages)) {
      for (const [itemId, file] of fileMap.entries()) {
        const result = await GitHubAPI.uploadImage(file, category);
        if (!result.success) {
          console.error(`Image upload failed for ${file.name}:`, result.error);
          hasError = true;
        }
      }
    }

    /* 2. Update data files */
    if (dirty.projects) {
      const content = generateDataFileContent("PROJECTS", projects);
      const result = await GitHubAPI.updateDataFile("projects.js", content);
      if (!result.success) {
        console.error("projects.js sync failed:", result.error);
        hasError = true;
      } else {
        dirty.projects = false;
      }
    }

    if (dirty.certificates) {
      const content = generateDataFileContent("CERTIFICATES", certificates);
      const result = await GitHubAPI.updateDataFile("certificates.js", content);
      if (!result.success) {
        console.error("certificates.js sync failed:", result.error);
        hasError = true;
      } else {
        dirty.certificates = false;
      }
    }

    if (dirty.blender) {
      const content = generateDataFileContent("BLENDER_PROJECTS", blenderItems);
      const result = await GitHubAPI.updateDataFile("blender.js", content);
      if (!result.success) {
        console.error("blender.js sync failed:", result.error);
        hasError = true;
      } else {
        dirty.blender = false;
      }
    }

    /* 3. Clear pending images */
    if (!hasError) {
      Object.values(pendingImages).forEach((map) => map.clear());
    }

    /* 4. Update UI */
    if (btn) btn.disabled = false;
    if (statusEl) {
      if (hasError) {
        statusEl.textContent = "Sync completed with errors — check console";
        statusEl.className = "sync-bar__status sync-bar__status--error";
      } else {
        statusEl.textContent = "All changes synced successfully";
        statusEl.className = "sync-bar__status sync-bar__status--success";
      }
    }

    setTimeout(() => {
      if (statusEl) {
        statusEl.textContent = getDirtyStatus();
        statusEl.className = "sync-bar__status";
      }
    }, 4000);
  }

  /**
   * Generate the content of a data JS file.
   * @param {string} varName — the variable name (e.g. "PROJECTS")
   * @param {Array} data — the data array
   * @returns {string}
   */
  function generateDataFileContent(varName, data) {
    const header = `/**\n * Auto-generated by admin panel\n */\n\n`;
    return header + `const ${varName} = ${JSON.stringify(data, null, 2)};\n`;
  }

  /* ── Public API ──────────────────────────────────────────── */

  return {
    init,
    openAddForm,
  };
})();

document.addEventListener("DOMContentLoaded", Admin.init);
