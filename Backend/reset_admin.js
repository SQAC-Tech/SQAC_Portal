import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const User = (await import("./src/models/User.js")).default;
  const adminEmail = "admin@sqac.com";
  
  const hashedPassword = await bcrypt.hash("admin123", 15);
  
  const result = await User.updateOne(
    { email: adminEmail },
    { $set: { password: hashedPassword, approved: true } }
  );
  
  console.log("Admin update result:", result);
  process.exit(0);
});
