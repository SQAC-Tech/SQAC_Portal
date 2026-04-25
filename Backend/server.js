import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import connectDB from './lib/db.js';

// Controllers
import { 
    createUser, 
    loginUser, 
    logoutUser, 
    authenticateToken, 
    getrole 
} from './Controller/User.controller.js';

import { 
    getprofile, 
    getotp, 
    verifyotp, 
    resetpassword, 
    editprofile 
} from './Controller/role.user.controller.js';

import { 
    getmembers, 
    getSubAdmins, 
    deleteUser, 
    deleteSubAdmin, 
    changeposition, 
    changerole, 
    allowmember, 
    showstatus, 
    rejectmember, 
    getpendingmembers, 
    getnotices, 
    createnotice, 
    deletenotice 
} from './Controller/admin.controller.js';

import certificateRoutes from './src/routes/certificate.routes.js';

dotenv.config();

const app = express();

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(cookieParser());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));

// --- Public Routes ---
app.post("/user/create", createUser);
app.post("/user/login", loginUser);
app.post("/logout", logoutUser);

// OTP & Password Reset
app.post("/otp/get", getotp);
app.post("/otp/verify", verifyotp);
app.post("/password/reset", resetpassword);

// Certificates (Public and Protected inside)
app.use('/api/certificate', certificateRoutes);

// --- Protected Routes ---
app.use(authenticateToken); // Apply to all routes below

// User Profile
app.get("/user/profile", getprofile);
app.put("/user/update", editprofile);
app.get("/user/role", getrole);

// Admin Management
app.get("/admin/members", getmembers);
app.get("/admin/subadmins", getSubAdmins);
app.delete("/admin/user/:id", deleteUser);
app.delete("/admin/subadmin/:id", deleteSubAdmin);
app.put("/admin/position/:id", changeposition);
app.put("/admin/role/:id", changerole);
app.post("/admin/approve/:id", allowmember);
app.get("/admin/status/:id", showstatus);
app.post("/admin/reject/:id", rejectmember);
app.get("/admin/pending", getpendingmembers);

// Notices
app.get("/notices", getnotices);
app.post("/notices/create", createnotice);
app.delete("/notices/:id", deletenotice);

// Database Connection and Server Start
const PORT = process.env.PORT || 3000;

connectDB().then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
}).catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
});
