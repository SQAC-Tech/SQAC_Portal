
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const User = (await import("./src/models/User.js")).default;
  const user = await User.findOne({ email: "test_approve2@sqac.com" }).select("+password");
  console.log("User from DB (select +password):", user.toObject ? user.toObject() : user);
  process.exit(0);
});
