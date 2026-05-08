/**
 * site.js — Global site configuration and metadata
 *
 * This file centralises all site-wide settings, owner information,
 * and navigation structure. Edit these values to personalise the
 * portfolio without touching any HTML.
 */

const SITE = Object.freeze({
    owner: {
        name: 'Rishit Choudhary',
        philosophy:
            'I build systems that are deliberate, structured, and built to last. Every project is an exercise in clarity — of thought, of architecture, of intent.',
        motto: 'Statuo. Persevero. Perficio.',
        about: {
            intro: 'I am a developer and 3D artist who works at the intersection of engineering rigour and creative exploration. My practice revolves around building tools, studying systems, and producing visual work that is as functional as it is considered.',
            interests: [
                'Systems architecture & design patterns',
                'Computational geometry & procedural generation',
                '3D modelling, rendering & visual storytelling',
                'Open-source tooling & developer experience',
                'Low-level systems programming',
            ],
            mindset:
                'I approach problems by first understanding the structure beneath them. Premature optimisation is avoided; premature understanding is not. I value clarity over cleverness, and I prefer tools that disappear into the workflow rather than demand attention.',
            currentFocus:
                'Currently deepening my work in systems-level programming and expanding my Blender rendering pipeline with custom procedural tools.',
            exploredFields: [
                'Full-stack web development',
                'Algorithm design & competitive programming',
                'Blender 3D — modelling, sculpting, procedural nodes',
                'Cloud infrastructure & deployment',
                'Database design & optimisation',
            ],
        },
        contact: {
            github: 'https://github.com/rishitc17',
            email: 'rishit@example.com',
        },
        copyright: 'Rishit Choudhary',
    },

    /**
     * Navigation links.
     * Using relative paths so they work on:
     *   - GitHub Pages (root domain)
     *   - Local file:// protocol
     *   - Any subdirectory deployment
     */
    navigation: [
        { label: 'Home', href: 'index.html' },
        { label: 'Projects', href: 'projects.html' },
        { label: 'Certificates', href: 'certificates.html' },
        { label: 'Blender', href: 'blender.html' },
    ],

    /* GitHub repository used by the admin sync system */
    repo: {
        owner: 'rishitc17',
        name: 'rishitc17.github.io',
        branch: 'main',
    },

    /* Image base paths — relative, no leading slash */
    paths: {
        projectImages: 'assets/images/projects/',
        certificateImages: 'assets/images/certificates/',
        blenderImages: 'assets/images/blender/',
    },

    /* Design tokens exposed to JS if needed */
    theme: {
        accentColor: '#5b9bd5',
    },
});
