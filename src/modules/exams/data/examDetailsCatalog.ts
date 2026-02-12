import type { ExamDetails } from "@/modules/exams/types";

export const examDetailsCatalog: Record<string, ExamDetails> = {
  banking: {
    id: "banking",
    name: "Banking",
    slug: "banking",
    description:
      "Target IBPS, SBI, and RBI exams with structured notes, practice sets, and timed mocks.",
    tags: ["Popular", "Advanced"],
    modulesAvailable: {
      notes: true,
      practice: true,
      tests: false,
    },
    counts: {
      notes: 120,
      practice: 450,
      tests: 12,
    },
    topics: [
      {
        title: "Quantitative Aptitude",
        topics: ["Number Series", "Simplification", "Data Interpretation"],
      },
      {
        title: "Reasoning",
        topics: ["Puzzles", "Seating Arrangement", "Syllogism"],
      },
    ],
    faqs: [
      {
        question: "Do I get full-length mocks?",
        answer: "Full-length mocks will be available in the next release.",
      },
      {
        question: "Is this suitable for beginners?",
        answer: "Yes, start with the foundation notes before moving to advanced drills.",
      },
      {
        question: "Can I track my weak areas?",
        answer: "Analytics highlight accuracy and weak topics after each practice set.",
      },
    ],
  },
  ssc: {
    id: "ssc",
    name: "SSC",
    slug: "ssc",
    description:
      "Prepare for CGL, CHSL, and MTS with topic-aligned notes and smart practice flows.",
    tags: ["Popular", "Advanced"],
    modulesAvailable: {
      notes: true,
      practice: true,
      tests: true,
    },
    counts: {
      notes: 150,
      practice: 520,
      tests: 18,
    },
    topics: [
      {
        title: "General Intelligence",
        topics: ["Analogy", "Classification", "Series"],
      },
      {
        title: "English",
        topics: ["Vocabulary", "Cloze Test", "Grammar"],
      },
    ],
    faqs: [
      {
        question: "Are tests timed?",
        answer: "Yes, subject tests and mocks are timed to match exam patterns.",
      },
      {
        question: "Can I revisit solutions?",
        answer: "Yes, instant solutions are available after each attempt.",
      },
      {
        question: "Is mobile practice supported?",
        answer: "The platform is optimized for mobile-first study sessions.",
      },
    ],
  },
  "state-exams": {
    id: "state-exams",
    name: "State Exams",
    slug: "state-exams",
    description:
      "State PSC-focused content with structured notes and regional practice packs.",
    tags: ["New", "Advanced"],
    modulesAvailable: {
      notes: true,
      practice: false,
      tests: false,
    },
    counts: {
      notes: 90,
      practice: 0,
      tests: 0,
    },
    topics: [
      {
        title: "General Studies",
        topics: ["History", "Polity", "Geography"],
      },
      {
        title: "Current Affairs",
        topics: ["Weekly Updates", "Monthly Capsules", "Revision"],
      },
    ],
    faqs: [
      {
        question: "When will practice sets launch?",
        answer: "Practice sets are scheduled for the next course update.",
      },
      {
        question: "Are notes updated regularly?",
        answer: "Yes, notes are refreshed to reflect exam notifications and trends.",
      },
      {
        question: "Do you support regional languages?",
        answer: "We are expanding regional language support this year.",
      },
    ],
  },
};
