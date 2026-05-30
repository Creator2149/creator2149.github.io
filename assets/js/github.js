/**
 * github.js — GitHub Contents API integration
 *
 * Handles:
 * - Uploading images to GitHub repository
 * - Updating JS data files
 * - PAT session management (never persisted)
 * - Safe overwrites
 * - Error handling
 *
 * Target repository: rishitc17/rishitc17.github.io
 * Uses GitHub Contents API: PUT /repos/{owner}/{repo}/contents/{path}
 */

(function () {
    'use strict';

    const REPO_OWNER = 'rishitc17';
    const REPO_NAME = 'rishitc17.github.io';
    const API_BASE = 'https://api.github.com';

    // Image path mapping
    const IMAGE_PATHS = {
        projects: 'assets/images/projects',
        certificates: 'assets/images/certificates',
        blender: 'assets/images/blender',
    };

    // Markdown path mapping
    const MARKDOWN_PATHS = {
        projects: 'assets/projects/md',
    };

    // Data file path mapping
    const DATA_PATHS = {
        projects: 'assets/js/data/projects.js',
        certificates: 'assets/js/data/certificates.js',
        blender: 'assets/js/data/blender.js',
        site: 'assets/js/data/site.js',
    };

    /**
     * GitHub API client
     */
    const GitHub = {
        _pat: null,

        /** Set PAT for current session only */
        setPAT(pat) {
            this._pat = pat;
        },

        /** Get current PAT */
        getPAT() {
            return this._pat;
        },

        /** Clear PAT */
        clearPAT() {
            this._pat = null;
        },

        /** Check if PAT is set */
        hasPAT() {
            return !!this._pat;
        },

        /** Validate PAT by fetching user info */
        async validatePAT() {
            if (!this._pat) return { valid: false, error: 'No PAT provided' };

            try {
                const response = await fetch(`${API_BASE}/user`, {
                    headers: {
                        Authorization: `token ${this._pat}`,
                        Accept: 'application/vnd.github.v3+json',
                    },
                });

                if (response.ok) {
                    const user = await response.json();
                    return { valid: true, username: user.login };
                } else {
                    const error = await response.json();
                    return { valid: false, error: error.message || 'Invalid PAT' };
                }
            } catch (err) {
                return { valid: false, error: err.message };
            }
        },

        /**
         * Upload or update a file in the repository
         * @param {string} path - File path in the repo
         * @param {string} content - Base64 encoded content
         * @param {string} message - Commit message
         * @param {string} [sha] - File SHA for overwriting (optional for new files)
         */
        async uploadFile(path, content, message, sha) {
            if (!this._pat) throw new Error('No PAT set');

            const url = `${API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`;
            const body = {
                message: message || `Update ${path}`,
                content: content,
                branch: 'main',
            };

            if (sha) {
                body.sha = sha;
            }

            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    Authorization: `token ${this._pat}`,
                    Accept: 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || `Failed to upload ${path}`);
            }

            return await response.json();
        },

        /**
         * Get file info (including SHA) from the repository
         * @param {string} path - File path in the repo
         */
        async getFileInfo(path) {
            if (!this._pat) throw new Error('No PAT set');

            const url = `${API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`;
            const response = await fetch(url, {
                headers: {
                    Authorization: `token ${this._pat}`,
                    Accept: 'application/vnd.github.v3+json',
                },
            });

            if (response.status === 404) {
                return null; // File doesn't exist yet
            }

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || `Failed to get file info for ${path}`);
            }

            return await response.json();
        },

        /**
         * Delete a file from the repository
         * @param {string} path - File path in the repo
         * @param {string} message - Commit message
         * @param {string} sha - File SHA (required for deletion)
         */
        async deleteFile(path, message, sha) {
            if (!this._pat) throw new Error('No PAT set');
            if (!sha) throw new Error('SHA required for deletion');

            const url = `${API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`;
            const response = await fetch(url, {
                method: 'DELETE',
                headers: {
                    Authorization: `token ${this._pat}`,
                    Accept: 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message || `Delete ${path}`,
                    sha: sha,
                    branch: 'main',
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || `Failed to delete ${path}`);
            }

            return await response.json();
        },

        /**
         * Upload an image to the repository
         * @param {string} category - 'projects', 'certificates', or 'blender'
         * @param {File} file - Image file
         * @param {string} [customName] - Optional custom filename
         */
        async uploadImage(category, file, customName) {
            const dir = IMAGE_PATHS[category];
            if (!dir) throw new Error(`Unknown category: ${category}`);

            const filename = customName || this.sanitizeFilename(file.name);
            const path = `${dir}/${filename}`;

            // Convert file to base64
            const content = await this.fileToBase64(file);

            // Check if file exists (for overwrite)
            let sha;
            try {
                const existing = await this.getFileInfo(path);
                if (existing) sha = existing.sha;
            } catch (e) {
                // File doesn't exist, that's fine
            }

            return await this.uploadFile(path, content, `${sha ? 'Update' : 'Upload'} image: ${filename}`, sha);
        },

        /**
         * Upload a markdown file to the repository
         * @param {string} category - 'projects'
         * @param {File} file - Markdown file
         * @param {string} [customName] - Optional custom filename
         */
        async uploadMarkdownFile(category, file, customName) {
            const dir = MARKDOWN_PATHS[category];
            if (!dir) throw new Error(`Unknown category: ${category}`);

            const filename = customName || this.sanitizeFilename(file.name);
            const path = `${dir}/${filename}`;

            const content = await this.fileToBase64(file);

            let sha;
            try {
                const existing = await this.getFileInfo(path);
                if (existing) sha = existing.sha;
            } catch (e) {
                // File doesn't exist, that's fine
            }

            return await this.uploadFile(path, content, `${sha ? 'Update' : 'Upload'} markdown: ${filename}`, sha);
        },

        /**
         * Update a data file in the repository
         * @param {string} type - 'projects', 'certificates', 'blender', or 'site'
         * @param {string} content - File content (not base64)
         */
        async updateDataFile(type, content) {
            const path = DATA_PATHS[type];
            if (!path) throw new Error(`Unknown data type: ${type}`);

            // Get current SHA
            let sha;
            try {
                const existing = await this.getFileInfo(path);
                if (existing) sha = existing.sha;
            } catch (e) {
                // Doesn't exist yet
            }

            // Base64 encode content
            const encoded = btoa(unescape(encodeURIComponent(content)));

            return await this.uploadFile(path, encoded, `Update ${type} data`, sha);
        },

        /**
         * Delete an image from the repository
         * @param {string} imagePath - Full path of the image
         */
        async deleteImage(imagePath) {
            if (!imagePath) return;

            // Get SHA
            let sha;
            try {
                const existing = await this.getFileInfo(imagePath);
                if (existing) sha = existing.sha;
            } catch (e) {
                return; // File doesn't exist, nothing to delete
            }

            return await this.deleteFile(imagePath, `Delete image: ${imagePath.split('/').pop()}`, sha);
        },

        /**
         * Convert File to base64 string
         */
        fileToBase64(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => {
                    // Remove data URL prefix
                    const base64 = reader.result.split(',')[1];
                    resolve(base64);
                };
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        },

        /**
         * Sanitize filename for safe upload
         */
        sanitizeFilename(name) {
            return name
                .toLowerCase()
                .replace(/[^a-z0-9._-]/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '');
        },

        /**
         * Get the full image URL for use in data files
         * @param {string} category - 'projects', 'certificates', or 'blender'
         * @param {string} filename - Image filename
         */
        getImageUrl(category, filename) {
            return `/${IMAGE_PATHS[category]}/${filename}`;
        },
    };

    // Expose
    window.GitHub = GitHub;
})();
