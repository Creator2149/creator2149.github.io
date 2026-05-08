/**
 * github.js — GitHub Contents API integration
 *
 * Handles all interactions with the GitHub REST API for:
 *   - Uploading images to the repository
 *   - Updating JavaScript data files
 *   - Managing PAT-based authentication per session
 *
 * The PAT is NEVER persisted. It is held in memory only
 * for the duration of the admin session.
 *
 * Repository target: rishitc17/rishitc17.github.io
 *
 * IMPORTANT: GitHub Contents API paths must preserve slashes.
 * Using encodeURIComponent() on the full path breaks the API
 * because it encodes "/" as "%2F". Instead, we only encode
 * individual path segments or use the raw path directly.
 */

const GitHubAPI = (() => {
    let _pat = '';

    const REPO_OWNER = SITE.repo.owner;
    const REPO_NAME = SITE.repo.name;
    const BRANCH = SITE.repo.branch;

    function baseUrl() {
        return `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents`;
    }

    function headers() {
        return {
            Authorization: `token ${_pat}`,
            Accept: 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
        };
    }

    /**
     * Set the PAT for the current session.
     * @param {string} token
     */
    function setPAT(token) {
        _pat = token;
    }

    /**
     * Get the current PAT (for display purposes — masked).
     * @returns {string}
     */
    function getPATMasked() {
        if (!_pat) return '';
        if (_pat.length <= 8) return '****';
        return _pat.slice(0, 4) + '****' + _pat.slice(-4);
    }

    /**
     * Check if a PAT is currently set.
     * @returns {boolean}
     */
    function hasPAT() {
        return _pat.length > 0;
    }

    /**
     * Clear the PAT (end session).
     */
    function clearPAT() {
        _pat = '';
    }

    /**
     * Validate the current PAT by attempting an API call.
     * @returns {Promise<{valid: boolean, username?: string}>}
     */
    async function validatePAT() {
        try {
            const res = await fetch('https://api.github.com/user', {
                headers: headers(),
            });
            if (!res.ok) return { valid: false };
            const data = await res.json();
            return { valid: true, username: data.login };
        } catch {
            return { valid: false };
        }
    }

    /**
     * Encode a repo path for the GitHub API.
     * Preserves "/" separators — only encodes special chars
     * within each segment, not the slashes themselves.
     * @param {string} path
     * @returns {string}
     */
    function encodePath(path) {
        return path
            .split('/')
            .map((segment) => encodeURIComponent(segment))
            .join('/');
    }

    /**
     * Get the SHA of an existing file (needed for updates).
     * @param {string} path — repository-relative path
     * @returns {Promise<string|null>}
     */
    async function getFileSHA(path) {
        try {
            const encoded = encodePath(path);
            const res = await fetch(`${baseUrl()}/${encoded}?ref=${BRANCH}`, {
                headers: headers(),
            });
            if (res.status === 404) return null;
            if (!res.ok) {
                const errBody = await res.text().catch(() => '');
                console.warn(`getFileSHA: ${res.status} for ${path}`, errBody);
                return null;
            }
            const data = await res.json();
            return data.sha;
        } catch (err) {
            console.error('getFileSHA failed:', err);
            return null;
        }
    }

    /**
     * Upload or update a file in the repository.
     * @param {string} path — repository-relative path (e.g. "assets/images/projects/foo.png")
     * @param {string} content — base64-encoded file content
     * @param {string} message — commit message
     * @returns {Promise<{success: boolean, error?: string}>}
     */
    async function uploadFile(path, content, message) {
        try {
            /* Check if file already exists (need SHA for update) */
            const existingSHA = await getFileSHA(path);

            const body = {
                message: message || `Update ${path}`,
                content: content,
                branch: BRANCH,
            };

            if (existingSHA) {
                body.sha = existingSHA;
            }

            const encoded = encodePath(path);
            const res = await fetch(`${baseUrl()}/${encoded}`, {
                method: 'PUT',
                headers: headers(),
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                const errMsg = errData.message || `Upload failed with status ${res.status}`;
                console.error('uploadFile error:', errMsg, errData);
                throw new Error(errMsg);
            }

            return { success: true };
        } catch (err) {
            console.error('uploadFile failed:', err);
            return { success: false, error: err.message };
        }
    }

    /**
     * Convert a File object to a base64 string.
     * @param {File} file
     * @returns {Promise<string>}
     */
    function fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                /* Strip the data URL prefix */
                const base64 = reader.result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    /**
     * Upload an image to the appropriate directory.
     * @param {File} file — the image File object
     * @param {"projects"|"certificates"|"blender"} category
     * @returns {Promise<{success: boolean, path?: string, error?: string}>}
     */
    async function uploadImage(file, category) {
        const dirMap = {
            projects: SITE.paths.projectImages,
            certificates: SITE.paths.certificateImages,
            blender: SITE.paths.blenderImages,
        };

        const dir = dirMap[category];
        if (!dir) return { success: false, error: 'Invalid category' };

        /* Sanitise filename */
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const repoPath = `${dir}${safeName}`.replace(/^\//, '');

        try {
            const base64 = await fileToBase64(file);
            const result = await uploadFile(repoPath, base64, `Upload image: ${safeName}`);

            if (result.success) {
                return { success: true, path: `/${repoPath}` };
            }
            return result;
        } catch (err) {
            return { success: false, error: err.message };
        }
    }

    /**
     * Update a JavaScript data file in the repository.
     * @param {string} fileName — e.g. "projects.js"
     * @param {string} content — the full file content as a string
     * @returns {Promise<{success: boolean, error?: string}>}
     */
    async function updateDataFile(fileName, content) {
        const path = `assets/js/data/${fileName}`;
        /* Base64-encode the string content (handles Unicode) */
        const base64 = btoa(unescape(encodeURIComponent(content)));
        return uploadFile(path, base64, `Update data: ${fileName}`);
    }

    return {
        setPAT,
        getPATMasked,
        hasPAT,
        clearPAT,
        validatePAT,
        uploadImage,
        updateDataFile,
    };
})();
