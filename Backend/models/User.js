import mongoose from "mongoose";


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
      minlength: 8,
      select: false
    },

    coreDomain: {
      type: String,
      required: true
    },

    subDomain: String,
    position: String,

    socials: {
      linkedin: String,
      github: String,
      instagram: String
    },

    bio: {
      type: String,
      maxlength: 150
    },
    image:{
        type:String,
    },
    role:{
        type:String,
        enum:['user','admin','subadmin'],
        default:'user'
    }
  },
  { timestamps: true }
);
export default mongoose.model("User", userSchema);
