const CERTIFICATES_DATA = [
    {
        id: 'wharton-data-science-competition',
        featuredOnHome: false,
        title: 'Wharton Data Science Competition Participation',
        field: 'Data Science',
        year: '2026',
        image: 'assets/images/certificates/Wharton_Data_Science_Competition_2026.png',
        issuer: 'Wharton',
        description:
            'Participation in a competitive data science program focused on analytical reasoning, collaborative problem solving, and applied quantitative thinking.',
    },

    {
        id: 'lodha-genius-shadow-the-scientists',
        featuredOnHome: false,
        title: 'Lodha Genius Programme & UC Santa Cruz Shadow the Scientists Programme Completion',
        field: 'Astronomy',
        year: '2026',
        image: 'assets/images/certificates/LGP_Shadow_the_Scientists.png',
        issuer: 'Lodha Genius Programme / UC Santa Cruz',
        description:
            'Completed advanced enrichment programs exploring astronomy, scientific inquiry, and exposure to real-world research workflows through the Shadow the Scientists initiative.',
    },

    {
        id: 'national-inter-dps-it-festival-2nd-place',
        featuredOnHome: true,
        title: 'National Inter DPS IT Festival — 2nd Place',
        field: 'Technology',
        year: '2026',
        image: 'assets/images/certificates/DPSS_AIdea_Quest_Rank.png',
        issuer: 'Delhi Public School Society',
        description:
            'Awarded second place at a national-level inter-school technology competition focused on innovation, problem solving, and technical presentation.',
    },

    {
        id: 'lodha-genius-programme-scholar',
        featuredOnHome: true,
        title: 'Lodha Genius Programme Scholar',
        field: 'Mathematics & Science',
        year: '2025',
        image: 'assets/images/certificates/Lodha_Genius_Programme_Participation.png',
        issuer: 'Ashoka University',
        description:
            'Selected as a Lodha Genius Programme scholar for advanced enrichment in mathematics and science through mentorship-driven academic exploration.',
    },

    {
        id: 'wsc-global-round-toc-qualification',
        featuredOnHome: true,
        title: 'WSC Global Round — Qualified for Tournament of Champions',
        field: 'Academic',
        year: '2026',
        image: '',
        issuer: "World Scholar's Cup",
        description:
            "Qualified for the Tournament of Champions through performance in the World Scholar's Cup global round competitions.",
    },

    {
        id: 'nof-international-math-olympiad-rank-2',
        featuredOnHome: true,
        title: 'NOF International Math Olympiad — Rank 2',
        field: 'Mathematics',
        year: '2024',
        image: 'assets/images/certificates/NOF_IMO_Meritorious_Performance.png',
        issuer: 'National Olympiad Foundation',
        description:
            'Achieved Rank 2 in the NOF International Mathematics Olympiad, demonstrating strong mathematical problem-solving and analytical reasoning skills.',
    },

    {
        id: 'istse-international-rank-110',
        featuredOnHome: false,
        title: 'ISTSE International Rank 110',
        field: 'Mathematics',
        year: '2023',
        image: 'assets/images/certificates/ISTSE_Participation_and_Rank.png',
        issuer: 'ISTSE',
        description:
            'Achieved an international ranking of 110 in the ISTSE examination, demonstrating strong analytical and mathematical reasoning abilities.',
    },

    {
        id: 'harvard-model-congress-yglp',
        featuredOnHome: false,
        title: 'Harvard Model Congress YGLP',
        field: 'Leadership',
        year: '2023',
        image: 'assets/images/certificates/Harvard_Model_Congress_Participation.png',
        issuer: 'Harvard Model Congress',
        description:
            'Participated in the Harvard Model Congress YGLP program, developing skills in debate, leadership, policy analysis, and collaborative discussion.',
    },

    {
        id: 'amc-10-participation',
        featuredOnHome: false,
        title: 'AMC 10 Participation',
        field: 'Mathematics',
        year: '2026',
        image: 'assets/images/certificates/AMC_10_2025_Participation_Certificate.png',
        issuer: 'Mathematical Association of America',
        description:
            'Participated in the AMC 10 mathematics competition, engaging with advanced problem-solving and proof-oriented mathematical thinking.',
    },

    {
        id: 'isro-summer-online-course',
        featuredOnHome: false,
        title: 'ISRO Summer Online Course',
        field: 'Science',
        year: '2022',
        image: 'assets/images/certificates/ISRO_Summer_Course_Certificate.png',
        issuer: 'ISRO',
        description:
            'Completed an online summer course conducted by ISRO exploring foundational concepts in space science, astronomy, and aerospace systems.',
    },

    {
        id: 'wsc-regional-round-2023',
        featuredOnHome: false,
        title: "World Scholar's Cup — Regional Round",
        field: 'Academic',
        year: '2023',
        image: '',
        issuer: "World Scholar's Cup",
        description:
            "Participated in the regional round of the World Scholar's Cup, engaging in interdisciplinary academic competitions involving debate, writing, and collaborative challenges.",
    },

    {
        id: 'wsc-regional-round-2024',
        featuredOnHome: false,
        title: "World Scholar's Cup — Regional Round",
        field: 'Academic',
        year: '2024',
        image: 'assets/images/certificates/WSC_Regional_Certificate_2.png',
        issuer: "World Scholar's Cup",
        description:
            "Participated in the 2024 regional round of the World Scholar's Cup, competing across debate, writing, and knowledge-based collaborative events.",
    },

    {
        id: 'wsc-regional-round-2025',
        featuredOnHome: false,
        title: "World Scholar's Cup — Regional Round",
        field: 'Academic',
        year: '2025',
        image: 'assets/images/certificates/WSC_Regional_Certificate_3.png',
        issuer: "World Scholar's Cup",
        description:
            "Participated in the 2025 regional round of the World Scholar's Cup, focusing on interdisciplinary reasoning and collaborative academic competition.",
    },

    {
        id: 'logiqids-round-1-complete',
        featuredOnHome: false,
        title: 'LogiQids Round 1 Complete (Reg. Round 2)',
        field: 'Logic',
        year: '2026',
        image: 'assets/images/certificates/LogiQids_Round_1_Certificate.png',
        issuer: 'LogiQids',
        description:
            'Successfully completed the first round of the LogiQids competition, qualifying for the next stage through logical reasoning and analytical problem solving.',
    },

    {
        id: 'national-road-safety-mission-course',
        featuredOnHome: false,
        title: 'National Road Safety Mission Course',
        field: 'Community',
        year: '2026',
        image: 'assets/images/certificates/National_Road_Safety_Mission_Certificate.png',
        issuer: 'National Road Safety Mission',
        description:
            'Completed a road safety awareness course focused on responsible public behavior, transportation safety, and community awareness.',
    },

    {
        id: 'roll-of-honour-2023',
        featuredOnHome: false,
        title: 'Roll of Honour for Academic Excellence',
        field: 'Academic',
        year: '2023',
        image: 'assets/images/certificates/Roll_of_Honour_1.png',
        issuer: 'School Recognition',
        description:
            'Awarded Roll of Honour recognition for consistent academic excellence and strong overall performance.',
    },

    {
        id: 'ib-learner-profile-award-2023',
        featuredOnHome: false,
        title: 'IB Learner Profile Attribute Award',
        field: 'Academic',
        year: '2023',
        image: 'assets/images/certificates/Learner_Profile_1.png',
        issuer: 'International Baccalaureate',
        description:
            'Recognized for demonstrating IB learner profile attributes through academic engagement, reflection, and collaborative contribution.',
    },

    {
        id: 'roll-of-honour-2024',
        featuredOnHome: false,
        title: 'Roll of Honour for Academic Excellence',
        field: 'Academic',
        year: '2024',
        image: 'assets/images/certificates/Roll_of_Honour_2.png',
        issuer: 'School Recognition',
        description:
            'Awarded Roll of Honour recognition for academic achievement and sustained excellence across subjects.',
    },

    {
        id: 'ib-learner-profile-award-2024',
        featuredOnHome: false,
        title: 'IB Learner Profile Attribute Award',
        field: 'Academic',
        year: '2024',
        image: 'assets/images/certificates/Learner_Profile_2.png',
        issuer: 'International Baccalaureate',
        description:
            'Received recognition for demonstrating IB learner profile values including inquiry, reflection, and principled learning.',
    },

    {
        id: 'roll-of-honour-2025',
        featuredOnHome: false,
        title: 'Roll of Honour for Academic Excellence',
        field: 'Academic',
        year: '2025',
        image: 'assets/images/certificates/Roll_of_Honour_3.png',
        issuer: 'School Recognition',
        description:
            'Recognized for continued academic excellence and strong performance across interdisciplinary coursework.',
    },

    {
        id: 'ib-learner-profile-award-2025',
        featuredOnHome: false,
        title: 'IB Learner Profile Attribute Award',
        field: 'Academic',
        year: '2025',
        image: 'assets/images/certificates/Learner_Profile_3.png',
        issuer: 'International Baccalaureate',
        description:
            'Awarded for embodying IB learner profile characteristics through active participation, inquiry, and reflective learning.',
    },

    {
        id: 'sof-imo-round-1',
        featuredOnHome: false,
        title: 'SOF IMO Round 1',
        field: 'Mathematics',
        year: '2026',
        image: '',
        issuer: 'Science Olympiad Foundation',
        description:
            'Participated in the SOF International Mathematics Olympiad Round 1, focusing on mathematical reasoning and competitive problem solving.',
    },

    {
        id: 'lis-annual-interschool-fest-stop-motion',
        featuredOnHome: false,
        title: 'LIS Annual Interschool Fest — Stop Motion',
        field: 'Technology',
        year: '2025',
        image: 'assets/images/certificates/LIS_Fest_Participation.png',
        issuer: 'LIS',
        description:
            'Participated in an interschool technology and creativity festival with a focus on stop-motion production and digital storytelling.',
    },

    {
        id: 'dps-international-techathlon-code-battle',
        featuredOnHome: false,
        title: 'DPS International Techathlon — Code Battle',
        field: 'Technology',
        year: '2026',
        image: 'assets/images/certificates/Techathlon_Participation_Certificate.png',
        issuer: 'DPS International',
        description:
            'Participated in a competitive coding and technology event emphasizing algorithmic thinking and rapid problem solving.',
    },

    {
        id: 'john-locke-essay-competition-shortlisting',
        featuredOnHome: true,
        title: 'Participation and Shortlisting for John Locke Essay Competition',
        field: 'Literature',
        year: '2025',
        image: 'assets/images/certificates/John_Locke_Essay_2025.png',
        issuer: 'John Locke Institute',
        description:
            'Participated in and was shortlisted for the John Locke Essay Competition, engaging with analytical and argumentative writing on complex intellectual topics.',
    },
];

window.CERTIFICATES_DATA = CERTIFICATES_DATA;
