import mongoose from "mongoose";
import dotenv from "dotenv";
import Project from "../src/models/Project.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/sqac_portal";

const generateTechProjects = () => {
  const titles = [
    // Web Dev - Beginner
    { title: "Personal Portfolio Website", domain: "Web Development", diff: "beginner" },
    { title: "To-Do List App with Local Storage", domain: "Web Development", diff: "beginner" },
    { title: "Static Blog HTML/CSS", domain: "Web Development", diff: "beginner" },
    { title: "Weather App Dashboard", domain: "Web Development", diff: "beginner" },
    { title: "Basic Calculator Web App", domain: "Web Development", diff: "beginner" },
    { title: "Expense Tracker UI", domain: "Web Development", diff: "beginner" },
    { title: "Pomodoro Timer Web Extension", domain: "Web Development", diff: "beginner" },
    { title: "Recipe Finder App", domain: "Web Development", diff: "beginner" },
    { title: "Landing Page for Tech Club", domain: "Web Development", diff: "beginner" },
    { title: "Random Quote Generator", domain: "Web Development", diff: "beginner" },
    
    // AI/ML - Beginner
    { title: "Linear Regression Housing Price Predictor", domain: "AI/ML", diff: "beginner" },
    { title: "Iris Flower Classification Model", domain: "AI/ML", diff: "beginner" },
    { title: "Sentiment Analysis on Movie Reviews", domain: "AI/ML", diff: "beginner" },
    { title: "Simple Spam Email Classifier", domain: "AI/ML", diff: "beginner" },
    { title: "MNIST Digit Recognizer", domain: "AI/ML", diff: "beginner" },
    { title: "Basic Chatbot with NLTK", domain: "AI/ML", diff: "beginner" },
    { title: "Customer Segmentation with K-Means", domain: "AI/ML", diff: "beginner" },
    { title: "Titanic Survival Prediction", domain: "AI/ML", diff: "beginner" },
    { title: "Basic Recommender System (Movies)", domain: "AI/ML", diff: "beginner" },
    { title: "Data Visualization Dashboard (Pandas)", domain: "AI/ML", diff: "beginner" },

    // Web Dev - Intermediate
    { title: "Full-Stack Blog with Auth", domain: "Web Development", diff: "intermediate" },
    { title: "Real-time Chat App with Socket.io", domain: "Web Development", diff: "intermediate" },
    { title: "E-Commerce Shopping Cart API", domain: "Web Development", diff: "intermediate" },
    { title: "Job Board Platform", domain: "Web Development", diff: "intermediate" },
    { title: "Social Media Clone (Twitter-lite)", domain: "Web Development", diff: "intermediate" },
    { title: "Project Management Kanban Board", domain: "Web Development", diff: "intermediate" },
    { title: "Event Booking System", domain: "Web Development", diff: "intermediate" },
    { title: "RESTful API for Inventory", domain: "Web Development", diff: "intermediate" },
    { title: "Markdown Notes App", domain: "Web Development", diff: "intermediate" },
    { title: "Online Polling and Voting App", domain: "Web Development", diff: "intermediate" },

    // AI/ML - Intermediate
    { title: "Facial Emotion Recognition", domain: "AI/ML", diff: "intermediate" },
    { title: "Voice Command Assistant", domain: "AI/ML", diff: "intermediate" },
    { title: "Stock Market Predictor (LSTM)", domain: "AI/ML", diff: "intermediate" },
    { title: "Document Summarizer using HuggingFace", domain: "AI/ML", diff: "intermediate" },
    { title: "Resume Parser API", domain: "AI/ML", diff: "intermediate" },
    { title: "Credit Card Fraud Detection", domain: "AI/ML", diff: "intermediate" },
    { title: "Traffic Sign Recognition CNN", domain: "AI/ML", diff: "intermediate" },
    { title: "Music Genre Classifier", domain: "AI/ML", diff: "intermediate" },
    { title: "Fake News Detection Engine", domain: "AI/ML", diff: "intermediate" },
    { title: "Object Detection using YOLOv8", domain: "AI/ML", diff: "intermediate" },

    // Web Dev - Advanced
    { title: "Microservices Video Streaming App", domain: "Web Development", diff: "advanced" },
    { title: "Scalable SaaS Billing System", domain: "Web Development", diff: "advanced" },
    { title: "Decentralized Voting DApp", domain: "Web Development", diff: "advanced" },
    { title: "Real-Time Collaborative Document Editor", domain: "Web Development", diff: "advanced" },
    { title: "GraphQL CMS with Next.js", domain: "Web Development", diff: "advanced" },

    // AI/ML - Advanced
    { title: "RAG-based Enterprise Knowledge Bot", domain: "AI/ML", diff: "advanced" },
    { title: "Generative Adversarial Network (GAN) Art", domain: "AI/ML", diff: "advanced" },
    { title: "Autonomous Drone Pathfinding RL", domain: "AI/ML", diff: "advanced" },
    { title: "Real-time Multi-Language Translation API", domain: "AI/ML", diff: "advanced" },
    { title: "Large Language Model Fine-Tuning Pipeline", domain: "AI/ML", diff: "advanced" }
  ];

  return titles.map((t) => ({
    title: t.title,
    description: `A ${t.diff}-level project focused on ${t.domain} encompassing core principles, modern tooling, and efficient code.`,
    domain: t.domain,
    objectives: [
      `Implement core features of ${t.title}`,
      `Follow best practices for ${t.domain}`,
      "Ensure robust error handling and documentation"
    ],
    techStack: t.domain === "Web Development" 
      ? ["React", "Node.js", "Express", "MongoDB", "TailwindCSS", "TypeScript"].slice(0, t.diff === "beginner" ? 2 : t.diff === "intermediate" ? 4 : 6)
      : ["Python", "TensorFlow", "Scikit-Learn", "Pandas", "HuggingFace", "LangChain"].slice(0, t.diff === "beginner" ? 2 : t.diff === "intermediate" ? 4 : 6),
    features: [
      { name: "Core Module", description: "The primary functionality.", priority: "high" },
      { name: "Data Handling", description: "Safe state or data operations.", priority: "high" },
      { name: "User Interface/Output", description: "Client delivery component.", priority: "medium" }
    ],
    deliverables: ["Source Code", "Documentation", t.domain === "Web Development" ? "Deployed URL" : "Model Weights"],
    timeline: t.diff === "beginner" ? "1-2 weeks" : t.diff === "intermediate" ? "3-4 weeks" : "6+ weeks",
    difficulty: t.diff,
    teamSize: t.diff === "beginner" ? 1 : t.diff === "intermediate" ? 2 : 4,
    status: "unassigned"
  }));
};

const generateCorpProjects = () => {
  const titles = [
    // Events - Beginner
    { title: "Local Workshop Coordination", domain: "Events", diff: "beginner" },
    { title: "Club Member Meetup Plan", domain: "Events", diff: "beginner" },
    { title: "Alumni Mixer Venue Prep", domain: "Events", diff: "beginner" },
    { title: "Game Night Setup", domain: "Events", diff: "beginner" },
    { title: "Freshman Orientation Booth", domain: "Events", diff: "beginner" },
    // Media - Beginner
    { title: "Weekly Newsletter Drafting", domain: "Media", diff: "beginner" },
    { title: "Club Introduction Video (1min)", domain: "Media", diff: "beginner" },
    { title: "Event Highlight Reel", domain: "Media", diff: "beginner" },
    { title: "Tech Blog Proofreading", domain: "Media", diff: "beginner" },
    { title: "Social Media Post Schedule", domain: "Media", diff: "beginner" },
    // Public Relations - Beginner
    { title: "Email Outreach Template Creation", domain: "Public Relations", diff: "beginner" },
    { title: "Campus Partnership Inquiry", domain: "Public Relations", diff: "beginner" },
    { title: "Member Survey Formulation", domain: "Public Relations", diff: "beginner" },
    { title: "Guest Speaker Invitation List", domain: "Public Relations", diff: "beginner" },
    { title: "Community Discord Moderation Guide", domain: "Public Relations", diff: "beginner" },
    // Sponsorships - Beginner
    { title: "Local Business Sponsor List", domain: "Sponsorships", diff: "beginner" },
    { title: "Sponsorship Cold Email Drafting", domain: "Sponsorships", diff: "beginner" },
    { title: "Bronze Tier Package Definition", domain: "Sponsorships", diff: "beginner" },
    { title: "Sponsor Thank-You Cards", domain: "Sponsorships", diff: "beginner" },
    { title: "Tracking Sponsor Metrics", domain: "Sponsorships", diff: "beginner" },
    // Creatives - Beginner
    { title: "Club Logo Resize & Formatting", domain: "Creatives", diff: "beginner" },
    { title: "Event Flyer Design (Canva)", domain: "Creatives", diff: "beginner" },
    { title: "Instagram Post Templates", domain: "Creatives", diff: "beginner" },
    { title: "Zoom Virtual Backgrounds", domain: "Creatives", diff: "beginner" },
    { title: "ID Card Layouts", domain: "Creatives", diff: "beginner" },

    // Events - Intermediate
    { title: "24-Hour Internal Hackathon Logistics", domain: "Events", diff: "intermediate" },
    { title: "Tech Guest Speaker Symposium", domain: "Events", diff: "intermediate" },
    { title: "Inter-college Coding Contest Setup", domain: "Events", diff: "intermediate" },
    { title: "End of Year Tech Banquet", domain: "Events", diff: "intermediate" },
    { title: "Job Fair Booth Allocations", domain: "Events", diff: "intermediate" },
    // Media - Intermediate
    { title: "Podcast Series Production (3 Episodes)", domain: "Media", diff: "intermediate" },
    { title: "Monthly Tech Magazine Launch", domain: "Media", diff: "intermediate" },
    { title: "Live Streaming Setup for Events", domain: "Media", diff: "intermediate" },
    { title: "Multi-platform Social Media Campaign", domain: "Media", diff: "intermediate" },
    { title: "Corporate Video Pitch", domain: "Media", diff: "intermediate" },
    // Public Relations - Intermediate
    { title: "Press Release for Annual Hackathon", domain: "Public Relations", diff: "intermediate" },
    { title: "Influencer Collaboration Pipeline", domain: "Public Relations", diff: "intermediate" },
    { title: "Crisis Comm Protocol Drafting", domain: "Public Relations", diff: "intermediate" },
    { title: "Alumni Network Launch Strategy", domain: "Public Relations", diff: "intermediate" },
    { title: "Tech Blog Syndication", domain: "Public Relations", diff: "intermediate" },
    // Sponsorships - Intermediate
    { title: "Silver/Gold Tier Sponsorship Pitch", domain: "Sponsorships", diff: "intermediate" },
    { title: "Negotiation with Tech Startup Sponsors", domain: "Sponsorships", diff: "intermediate" },
    { title: "Sponsor Contract Drafting", domain: "Sponsorships", diff: "intermediate" },
    { title: "B2B Outreach for Tech Fest", domain: "Sponsorships", diff: "intermediate" },
    { title: "Grant Application for Club Funding", domain: "Sponsorships", diff: "intermediate" },
    // Creatives - Intermediate
    { title: "Annual Magazine Layout Design", domain: "Creatives", diff: "intermediate" },
    { title: "Motion Graphics Intro for Videos", domain: "Creatives", diff: "intermediate" },
    { title: "UI Mockups for Student Portal", domain: "Creatives", diff: "intermediate" },
    { title: "Merchandise Design (Hoodies/Tees)", domain: "Creatives", diff: "intermediate" },
    { title: "Complete Social Media Rebranding", domain: "Creatives", diff: "intermediate" },

    // Advanced (One per corp domain)
    { title: "National Level TechFest Execution", domain: "Events", diff: "advanced" },
    { title: "Viral Gen-AI Media Marketing Blitz", domain: "Media", diff: "advanced" },
    { title: "Global Tech Community Expansion Strategy", domain: "Public Relations", diff: "advanced" },
    { title: "$50k Corporate Sponsorship Pipeline", domain: "Sponsorships", diff: "advanced" },
    { title: "Comprehensive Club Brand Identity Overhaul", domain: "Creatives", diff: "advanced" }
  ];

  return titles.map((t) => ({
    title: t.title,
    description: `A ${t.diff}-level corporate project focused on ${t.domain} aimed at maximizing outreach, organization, and brand identity.`,
    domain: t.domain,
    objectives: [
      `Execute ${t.title} efficiently`,
      `Collaborate across corporate domains`,
      "Measure and report success metrics"
    ],
    techStack: ["Notion", "Google Workspace", "Slack", "Canva", "Figma"].slice(0, t.diff === "beginner" ? 2 : t.diff === "intermediate" ? 4 : 5),
    features: [
      { name: "Planning & Strategy", description: "Initial phase outline.", priority: "high" },
      { name: "Execution", description: "On-ground or digital deployment.", priority: "high" },
      { name: "Reporting", description: "Post-project analytics.", priority: "medium" }
    ],
    deliverables: ["Strategy Document", "Execution Logs", "Final Analytics Report"],
    timeline: t.diff === "beginner" ? "1-2 weeks" : t.diff === "intermediate" ? "3-4 weeks" : "8+ weeks",
    difficulty: t.diff,
    teamSize: t.diff === "beginner" ? 1 : t.diff === "intermediate" ? 3 : 6,
    status: "unassigned"
  }));
};

const seedProjects = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected successfully.");

    console.log("Clearing existing projects...");
    await Project.deleteMany({});

    const techProjs = generateTechProjects();
    const corpProjs = generateCorpProjects();
    const allProjects = [...techProjs, ...corpProjs];

    console.log(`Inserting ${allProjects.length} projects (${techProjs.length} Tech, ${corpProjs.length} Corp)...`);
    await Project.insertMany(allProjects);
    
    console.log("✅ 100+ Projects seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
};

seedProjects();
