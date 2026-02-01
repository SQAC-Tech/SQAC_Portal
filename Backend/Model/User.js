const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

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

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false
    },

    coreDomain: {
      type: String,
      required: true
    },

    subDomain: String,
    position: String,
    address: String,

    socials: {
      linkedin: String,
      github: String,
      instagram: String
    },

    bio: {
      type: String,
      maxlength: 150
    }
  },
  { timestamps: true }
);

/* 🔐 Hash password before saving (MODERN WAY) */
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

/* 🔍 Compare password during login */
userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
