const SITE_DATA = {
    name: 'Rishit Choudhary',
    domain: 'rishitc17.github.io',
    tagline: 'Statuo. Persevero. Perficio.',

    hero: {
        greeting: "Hello, I'm",
        mainStatement: 'Rishit Choudhary.',
        subStatement:
            'I build systems at the intersection of engineering, mathematics, and visual computation. This is a workspace — not a showcase. An archive of things built, explored, and thought through.',
    },

    philosophy: {
        heading: 'How I Think',
        paragraphs: [
            "I work across systems programming, computational mathematics, and visual design — not because I can't choose, but because the interesting problems live between disciplines. A simulation is only as useful as its visualization. A tool is only as powerful as the thinking behind its architecture.",
            "My approach is structural: decompose the problem, understand the constraints, engineer the system, then refine until the solution feels inevitable. I'm drawn to problems where elegance and efficiency converge — where the right abstraction makes complexity tractable.",
            'Currently focused on computational geometry, real-time rendering systems, and the mathematics of visual form. Always reading. Always building. The best work happens when theoretical understanding and practical implementation inform each other.',
        ],
        interests: [
            'Computational Geometry',
            'Systems Programming',
            'Rendering Architecture',
            'Mathematical Visualization',
            'Procedural Generation',
            'Type Systems & Language Design',
            'Blender & 3D Pipeline',
            'Simulation Engines',
        ],
        currentFocus:
            'Building a computational geometry library that bridges mathematical formalism with real-time rendering — making it possible to go from theorem to visualization without losing the structure of either.',
    },

    nav: [
        { label: 'Home', href: '/index.html' },
        { label: 'Projects', href: '/projects.html' },
        { label: 'Certificates', href: '/certificates.html' },
        { label: 'Blender', href: '/blender.html' },
    ],

    contact: {
        heading: 'Get in Touch',
        statement:
            'Open to conversations about systems, computation, geometry, rendering, or interesting problems in general.',
        email: 'rishit@example.com',
        github: 'https://github.com/rishitc17',
        linkedin: '#',
    },

    footer: {
        copyright: 'Rishit Choudhary',
        year: new Date().getFullYear(),
        built: '',
        repo: 'rishitc17/rishitc17.github.io',
    },
};

window.SITE_DATA = SITE_DATA;
