import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const User = (await import("./src/models/User.js")).default;
  const users = await User.find({}, "name email role approved");
  console.log("All Users:", users);
  process.exit(0);
});
