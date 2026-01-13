// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    regNum: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },

    phoneNumber: {
      type: String,
      required: true
    },

    coreDomain: {
      type: String,
      required: true
    },

    subDomain: {
      type: String
    },

    position: {
      type: String
    },

    address: {
      type: String
    },

    socials: {
      linkedin: { type: String },
      github: { type: String },
      instagram: { type: String }
    },

    bio: {
      type: String,
      maxlength: 150
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
