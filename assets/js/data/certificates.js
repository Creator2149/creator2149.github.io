/**
 * certificates.js — Certificate data store
 *
 * Each certificate object follows this schema:
 *   id       — unique string identifier
 *   featured — boolean; true → appears on homepage carousel
 *   title    — certificate display name
 *   field    — subject area / domain tag
 *   year     — year obtained (free text)
 *   image    — relative path from /assets/images/certificates/ or empty string
 */

const CERTIFICATES = [
  {
    id: "aws-cloud-practitioner",
    featured: true,
    title: "AWS Cloud Practitioner",
    field: "Cloud Computing",
    year: "2024",
    image: "",
  },
  {
    id: "deep-learning-specialisation",
    featured: true,
    title: "Deep Learning Specialisation",
    field: "Machine Learning",
    year: "2024",
    image: "",
  },
  {
    id: "meta-frontend",
    featured: true,
    title: "Meta Front-End Developer",
    field: "Web Development",
    year: "2023",
    image: "",
  },
  {
    id: "rust-programming",
    featured: false,
    title: "Rust Programming Course",
    field: "Systems Programming",
    year: "2023",
    image: "",
  },
  {
    id: "mongodb-university",
    featured: false,
    title: "MongoDB for Developers",
    field: "Databases",
    year: "2023",
    image: "",
  },
  {
    id: "docker-essentials",
    featured: false,
    title: "Docker Essentials",
    field: "DevOps",
    year: "2022",
    image: "",
  },
  {
    id: "comp-networks",
    featured: false,
    title: "Computer Networks",
    field: "Networking",
    year: "2022",
    image: "",
  },
  {
    id: "data-structures-algos",
    featured: false,
    title: "Data Structures & Algorithms",
    field: "Computer Science",
    year: "2022",
    image: "",
  },
];
