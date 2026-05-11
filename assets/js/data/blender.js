const BLENDER_DATA = [
    {
        id: 'the-donut',
        featured: true,
        featuredOnHome: true,
        title: 'The Donut',
        date: '2026-02',
        image: 'assets/images/blender/The_Donut.png',

        description:
            'A foundational Blender study exploring procedural shading, lighting, and physically based rendering through the iconic donut workflow. The project focused less on the object itself and more on understanding the rendering pipeline — materials, displacement, compositing, and scene composition.',

        renderEngine: 'Cycles',

        techniques: ['Procedural Shading', 'Subdivision Modeling', 'Lighting Setup', 'Compositor Nodes'],
    },

    {
        id: 'desk-scene',
        featured: true,
        featuredOnHome: true,
        title: 'Desk Scene',
        date: '2026-02',
        image: 'assets/images/blender/Desk_Scene.png',

        description:
            'A stylized desk environment study focused on composition, material variation, and believable object placement. The project explored how lighting and clutter distribution affect the perceived realism and atmosphere of interior scenes.',

        renderEngine: 'Cycles',

        techniques: ['Hard Surface Modeling', 'PBR Materials', 'Scene Composition', 'Global Illumination'],
    },

    {
        id: 'industrial-corner',
        featured: true,
        featuredOnHome: true,
        title: 'Industrial Corner',
        date: '2026-02',
        image: 'assets/images/blender/Industrial_Corner.png',

        description:
            'An industrial environment render emphasizing atmospheric lighting, surface wear, and environmental storytelling. The scene experiments with rough concrete textures, metallic reflections, and constrained lighting to create visual depth and mood.',

        renderEngine: 'Cycles',

        techniques: [
            'Industrial Environment Modeling',
            'Texture Layering',
            'Volumetric Lighting',
            'Surface Wear Detailing',
        ],
    },
];

window.BLENDER_DATA = BLENDER_DATA;
