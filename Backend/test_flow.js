
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./src/models/User.js";
import sendMail from "./src/lib/mailer.js";

dotenv.config();

async function runTest() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to DB.");

  const email = "test_approve4@sqac.com";
  await User.deleteOne({ email });

  const user = await User.create({
      name: "Test Email",
      regNum: "APP" + Math.floor(Math.random() * 10000),
      email: email,
      phoneNumber: "5555555555",
      password: "password123",
      coreDomain: "Technical",
      subDomain: "Web",
      position: "Developer",
      address: "123 Test",
      bio: "Testing approval email flow",
      socials: { linkedin: "https://linkedin.com/in/test", github: "https://github.com/test" }
  });
  console.log("User created:", user.email, "Approved:", user.approved);

  console.log("Simulating Admin Approval...");
  user.approved = true;
  await user.save();
  console.log("User approved status updated in DB to:", user.approved);

  console.log("Sending approval email...");
  try {
    const info = await sendMail({
      to: user.email,
      subject: "Application Approved",
      html: `Hello ${user.name}, your application to the portal has been approved. You can now login at http://localhost:5173/login`
    });
    console.log("Email sent successfully! Info:", info ? info.messageId || info : "Done");
  } catch (e) {
    console.error("Email failed:", e);
  }

  process.exit(0);
}

runTest().catch(console.error);
