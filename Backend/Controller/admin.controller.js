import User from "../models/User.js";
import {role} from "./User.controller.js";

const getmembers = async(req,res)=>{
    if(role != "admin"){
        res.json({message:"Not authorized"});
    }
    try {
        const members = await User.find({role:'user'});
        res.json(members);

    } catch (error) {
        res.status(500).json({message:"Server Error"});
    }
}

const getSubAdmins = async(req,res)=>{
    if(role != "admin"){
        res.json({message:"Not authorized"});
    }
    try {
        const subAdmins = await User.find({role:'subadmin'});
        res.json(subAdmins);
    } catch (error) {
        res.status(500).json({message:"Server Error"});
    }
}

const deleteUser = async(req,res)=>{
    if(role != "admin"){
        res.json({message:"Not authorized"});
    }
    try {
        const {id} = req.params.id;
        await User.findByIdAndDelete(id);
        res.json({message:"User deleted successfully"});

    } catch (error) {
        res.status(500).json({message:"Server Error"});

    }
}

const deleteSubAdmin = async(req,res)=>{
    if(role != "admin"){
        res.json({message:"Not authorized"});
    }
    try {
        const {id} = req.params.id;
        await User.findByIdAndDelete(id);
        res.json({message:"SubAdmin deleted successfully"});
    } catch (error) {
        res.status(500).json({message:"Server Error"});
    }
}

const changeposition = async(req,res)=>{
    if(role != "admin"){
        res.json({message:"Not authorized"});
    }
    try {
        const {id} = req.params.id;
        const {position} = req.body;
        await User.findByIdAndUpdate(id,{position});
        res.json({message:"Position updated successfully"});

    } catch (error) {
        res.status(500).json({message:"Server Error"});

    }
}
const changerole = async(req,res)=>{
    if(role != "admin"){
        res.json({message:"Not authorized"});
    }
    try {
        const {id} = req.params.id;
        const {role} = req.body;
        await User.findByIdAndUpdate(id,{role});
        res.json({message:"Role updated successfully"});

    } catch (error) {
        res.status(500).json({message:"Server Error"});

    }
}

