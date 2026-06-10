
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const User = (await import("./src/models/User.js")).default;
  const user = await User.findOne({ email: "test_approve2@sqac.com" });
  console.log("User from DB:", user);
  process.exit(0);
});
