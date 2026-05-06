import mongoose from "mongoose";
import dotenv from "dotenv";
import Project from "../src/models/Project.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/sqac_portal";

const sampleProjects = [
  {
    title: "SQAC Student Portal Redesign",
    description: "A complete overhaul of the existing SQAC portal, transitioning from a monolithic legacy system to a modern React + Node.js architecture with advanced dashboarding and seamless UX.",
    domain: "Web Development",
    objectives: [
      "Improve portal load time by 40%",
      "Implement a sleek glassmorphism design system",
      "Develop a centralized member dashboard"
    ],
    techStack: ["React", "Tailwind CSS", "Node.js", "Express", "MongoDB"],
    features: [
      { name: "Auth System", description: "JWT-based authentication with role access.", priority: "high" },
      { name: "Profile Manager", description: "Real-time updates to member skills.", priority: "medium" },
      { name: "Dark Mode", description: "System-wide theme toggling.", priority: "low" }
    ],
    deliverables: ["Figma mockups", "Frontend repository", "Backend API documentation", "Deployed application"],
    timeline: "1 month",
    difficulty: "advanced",
    teamSize: 3,
    status: "unassigned"
  },
  {
    title: "AI Resume ATS Scorer",
    description: "An intelligent applicant tracking system simulator that parses resumes (PDF/Doc) and scores them against job descriptions using modern NLP models and LLMs.",
    domain: "AI/ML",
    objectives: [
      "Extract semantic entities from resumes",
      "Calculate a similarity score between resume and JD",
      "Provide actionable feedback to the applicant"
    ],
    techStack: ["Python", "FastAPI", "HuggingFace", "LangChain", "OpenAI API"],
    features: [
      { name: "PDF Parser", description: "OCR and text extraction from documents.", priority: "high" },
      { name: "Semantic Matcher", description: "Vector similarity scoring.", priority: "high" },
      { name: "Feedback Generator", description: "LLM-driven improvements.", priority: "medium" }
    ],
    deliverables: ["Trained Model/Pipeline", "API Endpoints", "Performance metrics report"],
    timeline: "3 weeks",
    difficulty: "advanced",
    teamSize: 2,
    status: "unassigned"
  },
  {
    title: "Tech Symposium 2026 Sponsorship Drive",
    description: "A comprehensive corporate strategy and execution plan to secure title and co-sponsors for the upcoming annual technical symposium.",
    domain: "Sponsorships",
    objectives: [
      "Secure $10,000 in funding",
      "Partner with at least 3 tier-1 tech companies",
      "Create high-converting pitch decks"
    ],
    techStack: ["Canva", "LinkedIn Sales Navigator", "Google Workspace", "HubSpot CRM"],
    features: [
      { name: "Pitch Deck", description: "Design a compelling sponsorship presentation.", priority: "high" },
      { name: "Lead Pipeline", description: "Track outreach to 50+ companies.", priority: "high" },
      { name: "Sponsor Packages", description: "Define Gold, Silver, Bronze tiers.", priority: "medium" }
    ],
    deliverables: ["Final Pitch Deck", "CRM Tracker", "Signed MOUs"],
    timeline: "2 months",
    difficulty: "intermediate",
    teamSize: 3,
    status: "unassigned"
  },
  {
    title: "Generative AI Social Media Campaign",
    description: "A cross-domain initiative leveraging generative AI tools to create a month-long social media content calendar, including automated posts, AI-generated graphics, and video scripts.",
    domain: "Cross-Domain",
    objectives: [
      "Automate content generation pipeline",
      "Increase Instagram engagement by 30%",
      "Produce 15 AI-assisted marketing videos"
    ],
    techStack: ["Next.js", "Python", "Midjourney", "OpenAI", "Instagram Graph API"],
    features: [
      { name: "Content Scheduler", description: "Web app to schedule posts.", priority: "high" },
      { name: "Prompt Engine", description: "Pre-configured prompts for visuals.", priority: "medium" },
      { name: "Analytics Dashboard", description: "Track engagement metrics.", priority: "medium" }
    ],
    deliverables: ["Content Generation App", "30-Day Content Calendar", "Marketing Report"],
    timeline: "1 month",
    difficulty: "advanced",
    teamSize: 4,
    status: "unassigned"
  },
  {
    title: "Annual SQAC Hackathon Logistics & Venue Setup",
    description: "End-to-end event planning and logistics management for the 48-hour internal hackathon, handling venue booking, catering, seating charts, and IT infrastructure.",
    domain: "Events",
    objectives: [
      "Accommodate 200 participants comfortably",
      "Ensure zero downtime for internet and power",
      "Manage a budget of $2000 effectively"
    ],
    techStack: ["Notion", "Google Sheets", "Figma (Floor Plans)"],
    features: [
      { name: "Venue Blueprint", description: "Seating and power outlet mapping.", priority: "high" },
      { name: "Catering Schedule", description: "Coordinate 6 meals across 48 hours.", priority: "high" },
      { name: "Crisis Protocol", description: "Backup plans for technical failures.", priority: "medium" }
    ],
    deliverables: ["Event Master Document", "Budget Sheet", "Vendor Agreements"],
    timeline: "1.5 months",
    difficulty: "intermediate",
    teamSize: 3,
    status: "unassigned"
  },
  {
    title: "RAG-based Knowledge Base Chatbot",
    description: "Implementing a Retrieval-Augmented Generation chatbot using the club's past documentation, rules, and codebases to help onboard new members instantly.",
    domain: "AI/ML",
    objectives: [
      "Index 500+ past documents and chat logs",
      "Achieve 90% accuracy on club-specific FAQs",
      "Deploy via a Discord bot interface"
    ],
    techStack: ["Python", "LangChain", "Pinecone (Vector DB)", "Discord.py", "OpenAI"],
    features: [
      { name: "Document Ingestion", description: "Pipeline to chunk and embed documents.", priority: "high" },
      { name: "Query Engine", description: "RAG retrieval algorithm.", priority: "high" },
      { name: "Discord Integration", description: "Live bot deployment.", priority: "medium" }
    ],
    deliverables: ["Vector Database", "Chatbot Source Code", "Deployment Instructions"],
    timeline: "4 weeks",
    difficulty: "advanced",
    teamSize: 2,
    status: "unassigned"
  },
  {
    title: "E-Commerce Microservices Architecture",
    description: "Building a scalable mock e-commerce backend using microservices to practice advanced system design, message queues, and container orchestration.",
    domain: "Web Development",
    objectives: [
      "Decouple auth, inventory, and order services",
      "Implement event-driven communication",
      "Deploy using Docker Compose"
    ],
    techStack: ["Node.js", "Go", "RabbitMQ", "Redis", "Docker", "PostgreSQL"],
    features: [
      { name: "API Gateway", description: "Centralized routing.", priority: "high" },
      { name: "Inventory Service", description: "Track stock levels.", priority: "medium" },
      { name: "Order Service", description: "Process payments and queuing.", priority: "high" }
    ],
    deliverables: ["Microservices Codebase", "Docker Compose File", "Architecture Diagram"],
    timeline: "1.5 months",
    difficulty: "advanced",
    teamSize: 4,
    status: "unassigned"
  },
  {
    title: "Rebranding & UI/UX Overhaul for TechFest",
    description: "A complete visual overhaul for the upcoming TechFest, including a new logo, typography, color palette, and high-fidelity prototype designs for the website and mobile app.",
    domain: "Creatives",
    objectives: [
      "Create a modern, cyberpunk-inspired brand identity",
      "Design 15+ screens for the web platform",
      "Produce animated promotional assets"
    ],
    techStack: ["Figma", "Adobe Illustrator", "After Effects"],
    features: [
      { name: "Brand Guidelines", description: "Logo, colors, typography.", priority: "high" },
      { name: "Web Prototypes", description: "Interactive Figma designs.", priority: "high" },
      { name: "Promo Video", description: "30-second teaser animation.", priority: "medium" }
    ],
    deliverables: ["Brand Book PDF", "Figma File Link", "MP4 Promo Video"],
    timeline: "3 weeks",
    difficulty: "intermediate",
    teamSize: 2,
    status: "unassigned"
  }
];

const seedProjects = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected successfully.");

    console.log("Clearing existing projects...");
    await Project.deleteMany({});

    console.log(`Inserting ${sampleProjects.length} projects...`);
    await Project.insertMany(sampleProjects);
    
    console.log("✅ Database seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
};

seedProjects();
