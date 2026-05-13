const PROJECTS_DATA = [
  {
    "id": "nullary",
    "flagship": true,
    "featuredOnHome": true,
    "title": "Nullary",
    "status": "In Progress",
    "year": "2026",
    "tech": [
      "Mathematics",
      "Research",
      "LaTeX"
    ],
    "image": "assets/images/projects/Nullary.png",
    "shortDescription": "A mathematical research project exploring an axiomatic treatment of division by zero.",
    "longDescription": "Nullary investigates whether expressions involving division by zero can be treated consistently within an alternative axiomatic framework. The project combines mathematical formalization, symbolic reasoning, and theoretical exploration while documenting the implications and contradictions that emerge from extending conventional arithmetic structures.",
    "featuredQuote": "The interesting part of mathematics isn't where rules work — it's where extending them forces you to rethink the foundations themselves.",
    "challenges": [
      "Avoiding contradictions while extending arithmetic operations",
      "Defining algebraic behavior for undefined expressions",
      "Balancing formal rigor with exploratory theoretical work"
    ],
    "technicalHighlights": [
      "Axiomatic framework experimentation",
      "Formal mathematical notation and proof structuring",
      "Research-oriented LaTeX documentation pipeline"
    ],
    "tags": [
      "Mathematics",
      "Research",
      "Theoretical Exploration"
    ],
    "link": ""
  },
  {
    "id": "jr-water-ambassadors",
    "featuredOnHome": true,
    "title": "Jr. Water Ambassadors",
    "status": "Completed",
    "year": "2026",
    "tech": [
      "HTML",
      "CSS",
      "JavaScript"
    ],
    "image": "assets/images/projects/Water_Ambassadors.png",
    "shortDescription": "A showcase platform documenting the school's Water Ambassadors initiative and outreach efforts.",
    "longDescription": "Although I was not directly part of the Water Ambassadors initiative, I developed the official showcase website documenting the program's activities — including cleanliness drives, awareness campaigns, posters, and collaborations with schools and organizations. The project focused on presenting social impact initiatives in a visually organized and accessible format while maintaining a clean, responsive frontend architecture.",
    "featuredQuote": "Good design is invisible when it works — the focus should stay on the initiative, not the interface.",
    "challenges": [
      "Structuring diverse initiative content into a coherent visual narrative",
      "Designing responsive layouts for posters, campaign galleries, and event documentation",
      "Balancing informational density with readability across devices"
    ],
    "technicalHighlights": [
      "Responsive static frontend architecture",
      "Optimized image handling and layout organization",
      "Modular section-based UI design for scalability"
    ],
    "tags": [
      "Frontend Development",
      "Community Initiative",
      "Web Design"
    ],
    "link": "https://waterambassadors.github.io"
  },
  {
    "id": "school-menu-voting-system",
    "featuredOnHome": true,
    "title": "School Menu Voting System",
    "status": "Completed",
    "year": "2026",
    "tech": [
      "HTML",
      "CSS",
      "JavaScript",
      "Supabase"
    ],
    "image": "assets/images/projects/School_Menu_Voting_System.png",
    "shortDescription": "A voting platform enabling students to collaboratively decide the weekly school menu.",
    "longDescription": "This platform allows the school nutritionist to upload meal options while students vote on how meals should be distributed across the week. The system includes constraints to preserve nutritional balance, prevent duplicate selections, and maintain structured scheduling. The project explored how lightweight full-stack systems can support participatory decision-making in school environments.",
    "architectureNotes": "The application uses a Supabase backend for authentication and vote persistence while the frontend handles dynamic state updates and live vote aggregation. Validation logic prevents conflicting selections and enforces scheduling constraints.",
    "challenges": [
      "Preventing duplicate or conflicting menu allocations",
      "Maintaining fair voting while enforcing nutritional constraints",
      "Designing a workflow simple enough for rapid student participation"
    ],
    "technicalHighlights": [
      "Supabase-backed real-time voting system",
      "Constraint-based menu validation",
      "Responsive frontend with dynamic UI updates"
    ],
    "tags": [
      "Full Stack Development",
      "Supabase",
      "Community Tools"
    ],
    "link": "https://dpsimenu.in"
  },
  {
    "id": "mealflow",
    "featuredOnHome": true,
    "title": "MealFlow",
    "status": "Completed",
    "year": "2026",
    "tech": [
      "FastAPI",
      "Appwrite",
      "Tailwind CSS",
      "Groq AI"
    ],
    "image": "assets/images/projects/MealFlow.png",
    "shortDescription": "An AI-powered meal planning platform designed for Indian households.",
    "longDescription": "MealFlow generates personalized meal plans based on family preferences, dietary goals, and available ingredients. The system combines AI-assisted planning with a modern web stack to create practical and adaptive recommendations tailored to Indian cuisine and family structures.",
    "architectureNotes": "The backend uses FastAPI for API orchestration, Appwrite for backend services and authentication, and Groq-powered AI inference for recommendation generation. Tailwind CSS provides the responsive frontend styling layer.",
    "challenges": [
      "Generating meal suggestions that balance nutrition, practicality, and user preferences",
      "Structuring prompts for consistent AI-generated planning",
      "Designing flexible schemas for varying household configurations"
    ],
    "technicalHighlights": [
      "AI-assisted personalized meal generation",
      "FastAPI-based backend architecture",
      "Integrated authentication and data handling with Appwrite"
    ],
    "tags": [
      "AI Applications",
      "Full Stack Development",
      "Health Tech"
    ],
    "link": "https://github.com/rishitc17/MealFlow"
  },
  {
    "id": "raksha",
    "title": "Raksha",
    "year": "2026",
    "status": "In Progress",
    "tech": [
      "React",
      "Python",
      "Supabase",
      "AI"
    ],
    "shortDescription": "An AI-powered self-defense learning platform using motion analysis and webcam feedback.",
    "longDescription": "Raksha is a self-defense training platform that uses webcam motion tracking and AI-generated feedback to help users practice techniques remotely. The project focuses on accessibility — enabling users to receive structured guidance without requiring physical training infrastructure.",
    "featuredQuote": "",
    "architectureNotes": "",
    "link": "https://rakshaapp.github.io",
    "tags": [
      "AI Applications",
      "Computer Vision",
      "EdTech"
    ],
    "flagship": false,
    "featuredOnHome": false,
    "image": "assets/images/projects/Raksha.jpeg",
    "challenges": [
      "Designing accurate motion-feedback workflows using consumer webcams",
      "Balancing responsiveness with computational overhead",
      "Creating usable interfaces for real-time practice sessions"
    ],
    "technicalHighlights": [
      "AI-assisted motion analysis",
      "React frontend with Python-based processing",
      "Supabase integration for authentication and storage"
    ]
  },
  {
    "id": "socra",
    "title": "Socra",
    "year": "2026",
    "status": "Planned",
    "tech": [
      "Business Strategy",
      "NLP",
      "Prompt Engineering"
    ],
    "shortDescription": "A research project exploring Socratic questioning as a safeguard against passive AI dependence.",
    "longDescription": "Socra investigates whether AI systems can encourage deeper reasoning through guided questioning rather than direct answer generation. The project combines qualitative research with prototype conversational systems designed around critical thinking and reflective dialogue.",
    "featuredQuote": "The goal of intelligence augmentation shouldn't be replacing thought — it should be provoking it.",
    "architectureNotes": "",
    "link": "",
    "tags": [
      "AI Research",
      "NLP",
      "Critical Thinking"
    ],
    "flagship": false,
    "featuredOnHome": false,
    "image": "",
    "challenges": [
      "Designing questioning flows that remain engaging rather than frustrating",
      "Balancing guidance with user autonomy",
      "Evaluating whether reflective prompting improves understanding"
    ]
  },
  {
    "id": "the-celestis-conclave",
    "featuredOnHome": true,
    "title": "The Celestis Conclave",
    "status": "In Progress",
    "year": "2026",
    "tech": [
      "Leadership",
      "STEM Education"
    ],
    "image": "assets/images/projects/Celestis_Conclave.png",
    "shortDescription": "A student-led regional STEM learning and collaboration community.",
    "longDescription": "The Celestis Conclave is a regional STEM initiative focused on advanced learning, interdisciplinary collaboration, and student-led exploration. I serve as the Mathematics Department Head and part of the core council, contributing to organizational planning and academic direction.",
    "tags": [
      "Leadership",
      "STEM",
      "Community"
    ],
    "link": "https://celestisconclave.github.io"
  },
  {
    "id": "nomad",
    "title": "NOMAD — Neural Observation and Model Analysis of Digits",
    "year": "2026",
    "status": "Planned",
    "tech": [
      "Python",
      "Nengo",
      "MNIST",
      "NumPy",
      "Matplotlib"
    ],
    "shortDescription": "A neuromorphic computing benchmark exploring spiking neural networks for digit classification.",
    "longDescription": "NOMAD investigates digit classification using neuromorphic computing techniques and spiking neural networks implemented with Nengo. The project compares computational efficiency, biological plausibility, and accuracy against traditional machine learning approaches using the MNIST dataset.",
    "featuredQuote": "",
    "architectureNotes": "",
    "link": "",
    "tags": [
      "Neuromorphic Computing",
      "Machine Learning",
      "Research"
    ],
    "flagship": false,
    "featuredOnHome": false,
    "image": "",
    "challenges": [
      "Understanding trade-offs between biological realism and computational efficiency",
      "Benchmarking spiking architectures against conventional neural networks",
      "Visualizing temporal spike-based representations"
    ]
  },
  {
    "id": "echoes-of-etheryn",
    "title": "Echoes of Etheryn",
    "year": "2025",
    "status": "In Progress",
    "tech": [
      "Creative Writing",
      "World Building"
    ],
    "shortDescription": "A long-form fantasy and science-fiction novel series.",
    "longDescription": "Echoes of Etheryn is a multi-book narrative blending cosmic fantasy, science fiction, and philosophical themes. The series explores power, fate, morality, and identity through interconnected storylines and morally complex characters across a shared universe.",
    "featuredQuote": "Worldbuilding isn't about inventing places — it's about inventing systems of meaning.",
    "architectureNotes": "",
    "link": "",
    "tags": [
      "Creative Writing",
      "Fantasy",
      "Science Fiction"
    ],
    "flagship": false,
    "featuredOnHome": false,
    "image": "assets/images/projects/Echoes_of_Etheryn.png"
  },
  {
    "id": "disease-spread-simulation",
    "title": "Disease Spread Simulation",
    "year": "2025",
    "status": "Completed",
    "statusDetails": "",
    "tech": [
      "Python",
      "Pygame",
      "Simulation"
    ],
    "shortDescription": "A simulation visualizing epidemiological spread dynamics using Pygame.",
    "longDescription": "This project models the transmission of diseases using mathematical epidemiology concepts and visualizes infection spread dynamically through a Pygame-based environment. The simulation explores how factors like movement, transmission probability, and recovery rates influence outbreak behavior.",
    "featuredQuote": "",
    "architectureNotes": "",
    "link": "https://github.com/rishitc17/DiseaseSpreadSimulation",
    "tags": [
      "Simulation",
      "Python",
      "Mathematics"
    ],
    "flagship": false,
    "featuredOnHome": false,
    "image": "/assets/images/projects/diseasespreadsimulation.png",
    "challenges": [
      "Balancing simulation realism with computational simplicity",
      "Visualizing infection states clearly in real time",
      "Designing adjustable parameters for experimentation"
    ],
    "technicalHighlights": [
      "Real-time epidemiological simulation",
      "Interactive parameter experimentation",
      "Dynamic visualization using Pygame"
    ]
  },
  {
    "id": "rawcrypt",
    "featuredOnHome": false,
    "title": "RawCrypt",
    "status": "Planned",
    "year": "2026",
    "tech": [
      "Python",
      "FastAPI",
      "Cryptography"
    ],
    "image": "",
    "shortDescription": "An educational platform designed to teach cryptography through intuitive mathematical explanations.",
    "longDescription": "RawCrypt is planned as an educational platform introducing students to cryptographic systems ranging from classical ciphers to RSA and modern encryption schemes. The goal is to make cryptography understandable from first principles instead of treating algorithms as black boxes.",
    "tags": [
      "Cryptography",
      "Education",
      "Backend Development"
    ],
    "link": ""
  },
  {
    "id": "cybersecurity-for-elderly",
    "title": "Cybersecurity for Support Staff",
    "year": "2026",
    "status": "In Progress",
    "statusDetails": "",
    "tech": [
      "Education",
      "Public Speaking",
      "Community"
    ],
    "shortDescription": "A cybersecurity awareness initiative focused on helping school support staff navigate the online world safely.",
    "longDescription": "This initiative aims to educate school support staff about online scams, phishing attempts, misinformation, and digital safety practices through relatable examples and simplified explanations. The project emphasizes accessibility and practical real-world understanding over technical jargon.",
    "featuredQuote": "",
    "architectureNotes": "",
    "link": "",
    "tags": [
      "Community",
      "Cybersecurity",
      "Education"
    ],
    "flagship": false,
    "featuredOnHome": false,
    "image": "/assets/images/projects/cybersurakshaabhiyan.png"
  }
];

window.PROJECTS_DATA = PROJECTS_DATA;