import mongoose from "mongoose";


const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
          },

    regNum: {
      type: String,
      required: true,
      unique: true,
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
        default:"https://images.unsplash.com/photo-1680355466468-bd0a68b11fa0?q=80&w=715&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
    role:{
        type:String,
        enum:['user','admin','subadmin','lead'],
        default:'user'
    },
    attendance:{
        type:Number,
        default:0
    },
    approved:{
        type:Boolean,
        default:false
    }
  },
  { timestamps: true }
);
export default mongoose.model("User", userSchema);
