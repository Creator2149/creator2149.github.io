/**
 * projects.js — Project data store
 *
 * Each project object follows this schema:
 *   id               — unique string identifier
 *   featured         — boolean; true → appears on homepage carousel
 *   title            — project display name
 *   status           — "Completed" | "In Progress" | "Planned"
 *   year             — free-text year or range (e.g. "2024", "2023–2024")
 *   tech             — array of technology strings
 *   image            — relative path from /assets/images/projects/ or empty string
 *   shortDescription — one-line summary shown on cards
 *   longDescription  — extended write-up shown in modals
 *   link             — external URL (GitHub / live demo) or empty string
 */

const PROJECTS = [
  {
    id: "proc-gen-toolkit",
    featured: true,
    title: "Procedural Generation Toolkit",
    status: "In Progress",
    year: "2025",
    tech: ["Python", "NumPy", "OpenGL", "GLSL"],
    image: "",
    shortDescription:
      "A modular toolkit for generating and visualising procedural terrain, noise fields, and L-systems in real time.",
    longDescription:
      "This project provides a composable set of generators for procedural content — from Perlin and Simplex noise fields to L-system plant structures and erosion-simulated terrain. The rendering layer uses OpenGL with custom GLSL shaders, allowing real-time parameter tweaking. The architecture separates generation, simulation, and rendering into independent modules so each can be tested and extended in isolation. Current work focuses on GPU-accelerated erosion simulation and a node-based editor for chaining generators.",
    link: "https://github.com/rishitc17/proc-gen-toolkit",
  },
  {
    id: "kv-store",
    featured: true,
    title: "Distributed Key-Value Store",
    status: "Completed",
    year: "2024",
    tech: ["Go", "gRPC", "Raft", "BoltDB"],
    image: "",
    shortDescription:
      "A fault-tolerant distributed key-value store implementing the Raft consensus protocol.",
    longDescription:
      "Built from the ground up in Go, this key-value store replicates data across a cluster using the Raft consensus algorithm. It exposes a gRPC interface for put, get, and delete operations, with leader election and log replication handled transparently. Persistence uses BoltDB for on-disk snapshots. The project includes integration tests for network partitions, leader failover, and log consistency. It was an exercise in understanding the mechanics of distributed consensus and the engineering discipline required to make it reliable.",
    link: "https://github.com/rishitc17/kv-store",
  },
  {
    id: "shader-lab",
    featured: true,
    title: "Shader Lab",
    status: "In Progress",
    year: "2024–2025",
    tech: ["GLSL", "WebGL", "Three.js", "JavaScript"],
    image: "",
    shortDescription:
      "A collection of fragment and vertex shader experiments with interactive parameter controls.",
    longDescription:
      "Shader Lab is an ongoing archive of visual shader experiments — raymarched scenes, signed distance field renderers, Voronoi decompositions, and post-processing effects. Each shader runs in a WebGL canvas with real-time uniform controls for tweaking parameters. The collection is structured as individual self-contained modules with shared boilerplate for canvas setup and UI generation. The goal is to build an intuitive understanding of GPU rendering while producing visually compelling results.",
    link: "https://github.com/rishitc17/shader-lab",
  },
  {
    id: "compiler-toolkit",
    featured: false,
    title: "Mini Compiler Toolkit",
    status: "Completed",
    year: "2023",
    tech: ["Rust", "LLVM", "Nom"],
    image: "",
    shortDescription:
      "A small compiler frontend and IR generator for a custom statically-typed language.",
    longDescription:
      "This project implements a compiler frontend for a toy statically-typed language with type inference, pattern matching, and algebraic data types. Parsing uses the Nom parser combinator library in Rust, and the intermediate representation lowers to LLVM IR for code generation. The type checker supports Hindley-Milner inference with let-polymorphism. While the language is not production-ready, the project served as a deep-dive into the internals of programming language implementation and compiler design.",
    link: "https://github.com/rishitc17/compiler-toolkit",
  },
  {
    id: "task-runner",
    featured: false,
    title: "Parallel Task Runner",
    status: "Completed",
    year: "2023",
    tech: ["Rust", "Tokio", "CLI"],
    image: "",
    shortDescription:
      "A command-line task runner that executes shell tasks in parallel with dependency-aware scheduling.",
    longDescription:
      "Designed as a build-system-agnostic task orchestrator, this CLI tool reads a YAML-defined task graph and executes commands in parallel where dependencies allow. Built on the Tokio async runtime, it supports configurable concurrency limits, task timeouts, and structured logging. The scheduler performs a topological sort on the dependency graph and dispatches independent tasks concurrently. It was built to scratch a personal itch — existing task runners felt either too opinionated or too slow for iterative workflows.",
    link: "https://github.com/rishitc17/task-runner",
  },
  {
    id: "portfolio-site",
    featured: false,
    title: "This Portfolio",
    status: "Completed",
    year: "2025",
    tech: ["HTML", "CSS", "JavaScript", "GitHub Pages"],
    image: "",
    shortDescription:
      "The personal portfolio system you are currently viewing — statically hosted, admin-managed, zero frameworks.",
    longDescription:
      "This portfolio is a vanilla HTML, CSS, and JavaScript application designed as a personal build system rather than a template. All content is driven by structured JavaScript data files, with an integrated admin panel that uses the GitHub Contents API to manage updates. The design prioritises readability, calm aesthetics, and engineering clarity. The carousel, modal, and filter systems are hand-rolled with no external dependencies. It is intentionally framework-free — the constraint is the feature.",
    link: "https://github.com/rishitc17/rishitc17.github.io",
  },
  {
    id: "network-monitor",
    featured: false,
    title: "Network Monitor Daemon",
    status: "Planned",
    year: "2025",
    tech: ["Rust", "pcap", "SQLite"],
    image: "",
    shortDescription:
      "A lightweight background daemon for capturing and analysing network traffic patterns.",
    longDescription:
      "Planned as a minimal network observability tool, this daemon will capture packets via libpcap, aggregate traffic statistics into SQLite, and expose a simple HTTP API for querying patterns. The focus is on low resource usage and reliable long-running operation. Planned features include per-protocol breakdowns, configurable alerting thresholds, and optional DNS resolution caching. The project is currently in the design and prototyping phase.",
    link: "",
  },
  {
    id: "cli-dotfiles",
    featured: false,
    title: "Dotfile Manager",
    status: "Completed",
    year: "2022",
    tech: ["Bash", "Stow", "Git"],
    image: "",
    shortDescription:
      "A personal dotfile management system using GNU Stow with automated symlink creation.",
    longDescription:
      "A structured dotfiles repository managed with GNU Stow for clean symlink-based deployment across machines. Each tool (vim, tmux, zsh, git, etc.) lives in its own Stow package, making it easy to install or remove individual configurations. The repository includes a bootstrap script that handles initial setup, dependency checks, and platform-specific adjustments. This was one of my first exercises in treating personal tooling as infrastructure.",
    link: "https://github.com/rishitc17/dotfiles",
  },
];
