import User from "../models/User.js";
import Notice from "../models/Notice.js";

const getmembers = async (req, res) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Not authorized" });
    }
    try {
        const members = await User.find({ role: 'user' });
        res.json(members);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
}

const getSubAdmins = async (req, res) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Not authorized" });
    }
    try {
        const subAdmins = await User.find({ role: 'subadmin' });
        res.json(subAdmins);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
}

const deleteUser = async (req, res) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Not authorized" });
    }
    try {
        const { id } = req.params;
        await User.findByIdAndDelete(id);
        res.json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
}

const deleteSubAdmin = async (req, res) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Not authorized" });
    }
    try {
        const { id } = req.params;
        await User.findByIdAndDelete(id);
        res.json({ message: "SubAdmin deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
}

const changeposition = async (req, res) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Not authorized" });
    }
    try {
        const { id } = req.params;
        const { position } = req.body;
        await User.findByIdAndUpdate(id, { position });
        res.json({ message: "Position updated successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
}

const changerole = async (req, res) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Not authorized" });
    }
    try {
        const { id } = req.params;
        const { role } = req.body;
        await User.findByIdAndUpdate(id, { role });
        res.json({ message: "Role updated successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
}

const allowmember = async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorised' });
    }
    try {
        const { id } = req.params;
        await User.findByIdAndUpdate(id, { approved: true });
        res.json({ message: "Member approved successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
}

const showstatus = async (req, res) => {
    if (req.user.role !== 'admin' && req.user.role !== 'subadmin') {
        return res.status(403).json({ message: 'Not authorised' });
    }
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json({ approved: user.approved });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
}

const rejectmember = async (req, res) => {
    if (req.user.role !== 'admin' && req.user.role !== 'subadmin') {
        return res.status(403).json({ message: 'Not authorised' });
    }
    try {
        const { id } = req.params;
        await User.findByIdAndDelete(id);
        res.json({ message: "Member rejected and removed successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
}

const getpendingmembers = async (req, res) => {
    if (req.user.role !== 'admin' && req.user.role !== 'subadmin') {
        return res.status(403).json({ message: 'Not authorised' });
    }
    try {
        const pendingMembers = await User.find({ approved: false, role: 'user' });
        res.json(pendingMembers);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
}

const getnotices = async (req, res) => {
    if (req.user.role !== 'admin' && req.user.role !== 'subadmin') {
        return res.status(403).json({ message: 'Not authorised' });
    }
    try {
        const notices = await Notice.find();
        res.json(notices);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
}

const createnotice = async (req, res) => {
    if (req.user.role !== 'admin' && req.user.role !== 'subadmin' && req.user.role !== 'lead') {
        return res.status(403).json({ message: 'Not authorised' });
    }
    try {
        const { title, description, domain, subdomain, image, link } = req.body;
        const author = req.user.name;
        const notice = new Notice({ title, description, domain, subdomain, image, link, author });
        await notice.save();
        res.json({ message: "Notice created successfully" });
    } catch (error) {
        console.error("CREATE NOTICE ERROR:", error);
        res.status(500).json({ message: "Server Error" });
    }
}

const deletenotice = async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorised' });
    }
    try {
        const { id } = req.params;
        await Notice.findByIdAndDelete(id);
        res.json({ message: "Notice deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
}

export { getmembers, getSubAdmins, deleteUser, deleteSubAdmin, changeposition, changerole, allowmember, showstatus, rejectmember, getpendingmembers, getnotices, createnotice, deletenotice };
