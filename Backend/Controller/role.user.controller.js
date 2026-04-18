import User from '../models/User.js';

const getprofile = async(req,res)=>{
    try {
        const user = await User.findById(req.userId).select("-password");
        if(!user){
            return res.status(404).json({message:"User not found"});
        }
        res.json({
            message: "Profile fetched successfully",
            user,
        })
    }

catch(error){
    res.status(500).json({message:"Server Error"});
}
}
const resetpassword = async(req,res)=>{
    try {
        const 

    } catch (error) {

    }

}
