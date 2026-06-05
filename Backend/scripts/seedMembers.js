/**
 * Seed script: Parses the CSV member data and populates MongoDB MemberProfile collection.
 *
 * Usage: node scripts/seedMembers.js
 *
 * Reads from: ../Technical Member Skill & Availability Profile (Responses) - Form Responses 1.csv
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "..", ".env") });

// Import model
import MemberProfile from "../src/models/MemberProfile.js";

const CSV_PATH = path.join(
  __dirname,
  "..",
  "..",
  "Technical Member Skill & Availability Profile  (Responses) - Form Responses 1.csv",
);

function parseCSVLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function toNum(val) {
  const n = parseInt(val, 10);
  return isNaN(n) ? 0 : Math.min(5, Math.max(0, n));
}

async function seed() {
  console.log("🌱 Starting member seed...");
  console.log("📂 CSV path:", CSV_PATH);

  if (!fs.existsSync(CSV_PATH)) {
    console.error("❌ CSV file not found at:", CSV_PATH);
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ Connected to MongoDB");

  const raw = fs.readFileSync(CSV_PATH, "utf-8");
  const lines = raw
    .split("\n")
    .map((l) => l.replace(/\r/g, ""))
    .filter((l) => l.trim());

  // Skip header
  const header = lines[0];
  const dataLines = lines.slice(1);

  console.log(`📊 Found ${dataLines.length} member entries`);

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const line of dataLines) {
    if (!line.trim()) continue;

    const cols = parseCSVLine(line);
    if (cols.length < 52) {
      console.warn(`⚠️  Skipping line with ${cols.length} columns (expected 52+)`);
      skipped++;
      continue;
    }

    // CSV columns (0-indexed):
    // 0: Timestamp, 1: Full Name, 2: Email ID, 3: Year Of Study, 4: Technical Sub Domain
    // 5-9: HTML, CSS, JAVASCRIPT, React, Next.js
    // 10-12: Angular, Vue, Tailwind
    // 13: Bootstrap
    // 14-15: API, GraphQL
    // 16-17: Node.js, Express
    // 18-20: FastAPI, Django, Flask
    // 21-22: Java, Spring
    // 23-25: Authentication, API Design, System Design
    // 26-28: SQL, MongoDB, Redis
    // 29-31: C++, Java(prog), Python
    // 32-34: Numpy, Pandas, Scikit-learn
    // 35-36: TensorFlow, PyTorch
    // 37: Deep Learning
    // 38-39: NLP, Computer Vision
    // 40: Data Analysis
    // 41: Model Evaluation
    // 42: GitHub
    // 43-45: Docker, CI/CD, Linux
    // 46-47: AWS, Deployment
    // 48: Hours per week
    // 49: Preferred type of work
    // 50: Work preference
    // 51: Skills to learn
    // 52: Built real projects

    const fullName = cols[1]?.trim();
    const email = cols[2]?.trim()?.toLowerCase()?.split(",")[0]?.trim(); // handle multi-email
    const yearOfStudy = cols[3]?.trim();
    const domain = cols[4]?.trim();

    if (!fullName || !email) {
      console.warn(`⚠️  Skipping row: missing name or email`);
      skipped++;
      continue;
    }

    const profileData = {
      fullName,
      email,
      yearOfStudy,
      domain,
      skills: {
        html: toNum(cols[5]),
        css: toNum(cols[6]),
        javascript: toNum(cols[7]),
        react: toNum(cols[8]),
        nextjs: toNum(cols[9]),
        angular: toNum(cols[10]),
        vue: toNum(cols[11]),
        tailwind: toNum(cols[12]),
        bootstrap: toNum(cols[13]),
        api: toNum(cols[14]),
        graphql: toNum(cols[15]),
        nodejs: toNum(cols[16]),
        express: toNum(cols[17]),
        fastapi: toNum(cols[18]),
        django: toNum(cols[19]),
        flask: toNum(cols[20]),
        java: toNum(cols[21]),
        spring: toNum(cols[22]),
        authentication: toNum(cols[23]),
        apiDesign: toNum(cols[24]),
        systemDesign: toNum(cols[25]),
        sql: toNum(cols[26]),
        mongodb: toNum(cols[27]),
        redis: toNum(cols[28]),
        cpp: toNum(cols[29]),
        javaProg: toNum(cols[30]),
        python: toNum(cols[31]),
        numpy: toNum(cols[32]),
        pandas: toNum(cols[33]),
        scikitlearn: toNum(cols[34]),
        tensorflow: toNum(cols[35]),
        pytorch: toNum(cols[36]),
        deepLearning: toNum(cols[37]),
        nlp: toNum(cols[38]),
        computerVision: toNum(cols[39]),
        dataAnalysis: toNum(cols[40]),
        modelEvaluation: toNum(cols[41]),
        github: toNum(cols[42]),
        docker: toNum(cols[43]),
        cicd: toNum(cols[44]),
        linux: toNum(cols[45]),
        aws: toNum(cols[46]),
        deployment: toNum(cols[47]),
      },
      hoursPerWeek: cols[48]?.trim() || "01-Feb",
      preferredWork: cols[49]?.trim() || "",
      workPreference: cols[50]?.trim() || "",
      wantToLearn: cols[51]?.trim() || "",
      hasBuiltProjects: cols[52]?.trim()?.toLowerCase() === "yes",
      status: "available",
    };

    try {
      const existing = await MemberProfile.findOne({ email });
      if (existing) {
        // Update existing
        Object.assign(existing, profileData);
        await existing.save(); // triggers pre-save hook for score computation
        updated++;
        console.log(`🔄 Updated: ${fullName} (${email})`);
      } else {
        const profile = new MemberProfile(profileData);
        await profile.save();
        created++;
        console.log(
          `✅ Created: ${fullName} — WebDev: ${profile.webdevScore}% (${profile.webdevTier}) | AIML: ${profile.aimlScore}% (${profile.aimlTier})`,
        );
      }
    } catch (err) {
      if (err.code === 11000) {
        console.warn(`⚠️  Duplicate email skipped: ${email}`);
        skipped++;
      } else {
        console.error(`❌ Error for ${fullName}:`, err.message);
        skipped++;
      }
    }
  }

  console.log("\n────────────────────────────────────");
  console.log(`✅ Created: ${created}`);
  console.log(`🔄 Updated: ${updated}`);
  console.log(`⚠️  Skipped: ${skipped}`);
  console.log("────────────────────────────────────\n");

  await mongoose.disconnect();
  console.log("🔌 Disconnected from MongoDB");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
