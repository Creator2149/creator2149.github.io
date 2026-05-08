/**
 * blender.js — Blender project data store
 *
 * Each Blender project object follows this schema:
 *   id       — unique string identifier
 *   featured — boolean; true → appears on homepage carousel
 *   title    — render display name
 *   date     — creation date (free text)
 *   image    — relative path from /assets/images/blender/ or empty string
 *
 * NOTE: Blender projects do NOT have repository links.
 */

const BLENDER_PROJECTS = [
  {
    id: "procedural-landscape",
    featured: true,
    title: "Procedural Landscape",
    date: "2025-03",
    image: "",
  },
  {
    id: "mechanical-watch",
    featured: true,
    title: "Mechanical Watch Study",
    date: "2025-01",
    image: "",
  },
  {
    id: "abstract-sculpture",
    featured: true,
    title: "Abstract Sculpture Series",
    date: "2024-11",
    image: "",
  },
  {
    id: "kitchen-interior",
    featured: false,
    title: "Kitchen Interior Render",
    date: "2024-09",
    image: "",
  },
  {
    id: "ceramic-vessels",
    featured: false,
    title: "Ceramic Vessels",
    date: "2024-07",
    image: "",
  },
  {
    id: "arch-viz-sunset",
    featured: false,
    title: "Architectural Viz — Sunset",
    date: "2024-05",
    image: "",
  },
  {
    id: "hard-surface-drone",
    featured: false,
    title: "Hard-Surface Drone",
    date: "2024-02",
    image: "",
  },
  {
    id: "botanical-closeup",
    featured: false,
    title: "Botanical Close-Up",
    date: "2023-12",
    image: "",
  },
];
