import User from "../models/User.js";
import Notice from "../models/Notice.js";
import Meeting from "../models/Meeting.js";
import sendMail from "../lib/mailer.js";
import {
  getMeetingEmailTemplate,
  getPlainTextTemplate,
} from "../lib/MeetMail.js";
import { generateGoogleCalendarLink } from "../lib/calender.service.js";
import Attendance from "../models/Attendance.js";
const getmembers = async (req, res) => {
  if (!["admin", "subadmin", "lead"].includes(req.user.role)) {
    return res.status(403).json({ message: "Not authorized" });
  }
  try {
    const members = await User.find({
      role: { $in: ["user", "lead", "subadmin"] },
      approved: true
    }).sort({ createdAt: -1 });
    res.json(members);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

const getSubAdmins = async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Not authorized" });
  }
  try {
    const subAdmins = await User.find({ role: "subadmin" });
    res.json(subAdmins);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

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
};

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
};

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
};

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
};

const allowmember = async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Not authorised" });
  }
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.approved = true;
    await user.save();

    // Send confirmation email
    try {
      const loginLink = `${process.env.FRONTEND_URL || "http://localhost:5174"}/login`;
      const emailHtml = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #1f1a3a; border-radius: 16px; background-color: #0c0a15; color: #f5eefc;">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-block; padding: 6px 16px; border-radius: 8px; background: linear-gradient(135deg, #f183ff, #ff6c95); color: #000; font-weight: bold; font-size: 20px;">
              SQAC
            </div>
          </div>
          <h2 style="color: #ff6c95; text-align: center; margin-bottom: 24px;">Registration Approved</h2>
          <p>Dear <strong>${user.name}</strong>,</p>
          <p>We are pleased to inform you that your registration for the SQAC Portal has been <strong>approved</strong> by the administrator.</p>
          <p>You can now initialize your session, access your dashboard, and participate in meetings, notice threads, and projects.</p>
          
          <h3 style="color: #f183ff; border-b: 1px solid #332b56; padding-bottom: 8px; margin-top: 28px;">Terms & Portal Conduct:</h3>
          <ul style="line-height: 1.6; padding-left: 20px;">
            <li>All technical assignments and metrics will be monitored within the portal environment.</li>
            <li>Maintain confidentiality of your login credentials and system assets.</li>
            <li>Ensure active participation and timely updates on all assigned dashboard tasks.</li>
          </ul>

          <div style="text-align: center; margin: 36px 0;">
            <a href="${loginLink}" style="background: linear-gradient(to right, #f183ff, #ff6c95); color: black; font-weight: bold; padding: 14px 36px; text-decoration: none; border-radius: 30px; display: inline-block; box-shadow: 0 4px 15px rgba(241, 131, 255, 0.4);">Login to Portal</a>
          </div>

          <p style="font-size: 13px; color: #aea9b6; line-height: 1.5;">If the button above does not work, copy and paste this link into your browser:</p>
          <p style="font-size: 13px;"><a href="${loginLink}" style="color: #81ecff; text-decoration: none;">${loginLink}</a></p>
          
          <hr style="border: 0; border-top: 1px solid #221d3f; margin-top: 36px;" />
          <p style="font-size: 11px; color: #6b6679; text-align: center;">This is an automated notification from the SQAC Portal. Please do not reply directly to this message.</p>
        </div>
      `;

      await sendMail({
        to: user.email,
        subject: "SQAC Portal Registration Approved",
        html: emailHtml,
      });
      console.log(`Confirmation email sent successfully to ${user.email}`);
    } catch (mailErr) {
      console.error("Failed to send approval email:", mailErr);
    }

    res.json({ message: "Member approved successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

const showstatus = async (req, res) => {
  if (req.user.role !== "admin" && req.user.role !== "subadmin") {
    return res.status(403).json({ message: "Not authorised" });
  }
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ approved: user.approved });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

const rejectmember = async (req, res) => {
  if (req.user.role !== "admin" && req.user.role !== "subadmin") {
    return res.status(403).json({ message: "Not authorised" });
  }
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Send rejection email
    try {
      const emailHtml = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #1f1a3a; border-radius: 16px; background-color: #0c0a15; color: #f5eefc;">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-block; padding: 6px 16px; border-radius: 8px; background: linear-gradient(135deg, #f183ff, #ff6c95); color: #000; font-weight: bold; font-size: 20px;">
              SQAC
            </div>
          </div>
          <h2 style="color: #ff6c95; text-align: center; margin-bottom: 24px;">Application Status Update</h2>
          <p>Dear <strong>${user.name}</strong>,</p>
          <p>Thank you for your interest in joining the SQAC Portal. After reviewing your application details, we regret to inform you that your request for portal access has been <strong>declined</strong> by the administrator at this time.</p>
          <p>This decision is typically based on incomplete credentials, matching requirements, or domain availability. If you believe this was in error, please reach out to your administrator to verify your credentials.</p>
          
          <hr style="border: 0; border-top: 1px solid #221d3f; margin-top: 36px;" />
          <p style="font-size: 11px; color: #6b6679; text-align: center;">This is an automated notification from the SQAC Portal. Please do not reply directly to this message.</p>
        </div>
      `;

      await sendMail({
        to: user.email,
        subject: "SQAC Portal Registration Status Update",
        html: emailHtml,
      });
      console.log(`Rejection email sent successfully to ${user.email}`);
    } catch (mailErr) {
      console.error("Failed to send rejection email:", mailErr);
    }

    await User.findByIdAndDelete(id);
    res.json({ message: "Member rejected successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

const getpendingmembers = async (req, res) => {
  if (req.user.role !== "admin" && req.user.role !== "subadmin") {
    return res.status(403).json({ message: "Not authorised" });
  }
  try {
    const pendingMembers = await User.find({ approved: false, role: "user" });
    res.json(pendingMembers);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

const getnotices = async (req, res) => {
  try {
    const notices = await Notice.find();
    res.json(notices);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

const createnotice = async (req, res) => {
  if (
    req.user.role !== "admin" &&
    req.user.role !== "subadmin" &&
    req.user.role !== "lead"
  ) {
    return res.status(403).json({ message: "Not authorised" });
  }
  try {
    const { title, description, domain, subdomain, image, link } = req.body;
    const author = req.user.name;
    // Map 'subdomain' from frontend to 'subDomain' for Mongoose schema
    const notice = new Notice({
      title,
      desc: description,
      domain,
      subDomain: subdomain,
      image,
      link,
      author,
    });
    await notice.save();
    res.json({ message: "Notice created successfully" });
  } catch (error) {
    console.error("CREATE NOTICE ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

const deletenotice = async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Not authorised" });
  }
  try {
    const { id } = req.params;
    await Notice.findByIdAndDelete(id);
    res.json({ message: "Notice deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

const createMeet = async (req, res) => {
  if (
    req.user.role !== "admin" &&
    req.user.role !== "subadmin" &&
    req.user.role !== "lead"
  ) {
    return res.status(401).json({ message: "Not authorised" });
  }
  try {
    const { title, startdate, starttime, link, description, teamScope } = req.body;
    if (!title || !startdate || !starttime || !link) {
      return res.status(400).json({ message: "Fill important fields" });
    }
    const meet = new Meeting({
      title,
      startDate: startdate,
      startTime: starttime,
      meetlink: link,
      description,
      teamScope: teamScope || "all",
      createdBy: req.userId,
    });
    await meet.save();
    res.status(200).json({ message: "Meeting Created successfully", meet });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const deleteMeet = async (req, res) => {
  if (
    req.user.role !== "admin" &&
    req.user.role !== "subadmin" &&
    req.user.role !== "lead"
  ) {
    return res.status(401).json({ message: "Not authorised" });
  }

  try {
    const { id } = req.params;
    await Meeting.findByIdAndDelete(id);
    res.json({ message: "Meeting successfully deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const editMeet = async (req, res) => {
  if (
    req.user.role !== "admin" &&
    req.user.role !== "subadmin" &&
    req.user.role !== "lead"
  ) {
    return res.status(401).json({ message: "Not authorised" });
  }

  try {
    const { id } = req.params;
    const { title, startdate, starttime, link, description, teamScope } = req.body;

    const updated = await Meeting.findByIdAndUpdate(id, {
      title,
      startDate: startdate,
      startTime: starttime,
      meetlink: link,
      description,
      teamScope: teamScope || "all",
    }, { new: true });
    res.status(200).json({ message: "Meet details updated successfully", updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMeet = async (req, res) => {
  try {
    const meets = await Meeting.find().populate("createdBy", "name email");
    res.status(200).json(meets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const sendMeetCalenderMail = async (req, res) => {};

const addAttendance = async (req, res) => {
  try {
    const { userID, date, clockIn, clockOut, status, meetType } = req.body;
    if (!userID || !date || !clockIn) {
      return res.status(400).json({ message: "Required fields missing" });
    }
    const attendance = new Attendance({
      userId: userID,
      date,
      clockIn,
      clockOut,
      status,
      meetType,
    });
    await attendance.save();
    res.status(200).json({ message: "Attendance added successfully", attendance });
  } catch (error) {
    console.error("ADD ATTENDANCE ERROR:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getAttendance = async (req, res) => {
  try {
    const { userID } = req.params;
    const attendanceRecords = await Attendance.find({ userId: userID }).populate("userId", "name email");
    res.status(200).json(attendanceRecords);
  } catch (error) {
    console.error("GET USER ATTENDANCE ERROR:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getALlAttendace = async (req, res) => {
  try {
    const attendanceRecords = await Attendance.find().populate(
      "userId",
      "name email coreDomain subDomain role"
    ).sort({ date: -1 });
    res.status(200).json(attendanceRecords);
  } catch (error) {
    console.error("GET ALL ATTENDANCE ERROR:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const editAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, clockIn, clockOut, status, meetType } = req.body;
    const updated = await Attendance.findByIdAndUpdate(id, {
      date,
      clockIn,
      clockOut,
      status,
      meetType,
    }, { new: true });
    res.status(200).json({ message: "Attendance updated successfully", updated });
  } catch (error) {
    console.error("EDIT ATTENDANCE ERROR:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getAttendanceByDomain = async (req, res) => {
  try {
    const data = await Attendance.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $group: {
          _id: {
            domain: "$user.domain",
            subdomain: "$user.subdomain",
          },
          members: {
            $push: {
              name: "$user.name",
              status: "$status",
              date: "$date",
              clockIn: "$clockIn",
              clockOut: "$clockOut",
            },
          },
        },
      },
      {
        $group: {
          _id: "$_id.domain",
          subdomains: {
            $push: {
              subdomain: "$_id.subdomain",
              members: "$members",
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          domain: "$_id",
          subdomains: 1,
        },
      },
    ]);

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};



const getAttendanceByDomainSubdomain = async (req, res) => {
  try {
    const { domain, subdomain } = req.query;

    const data = await User.aggregate([
      {
        $match: {
          domain,
          subdomain
        }
      },
      {
        $lookup: {
          from: "attendances",
          localField: "_id",
          foreignField: "userId",
          as: "attendance"
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          domain: 1,
          subdomain: 1,
          attendance: 1
        }
      }
    ]);

    res.status(200).json({
      success: true,
      count: data.length,
      data
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export {
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
  deletenotice,
  createMeet,
  deleteMeet,
  editMeet,
  getMeet,
  addAttendance,
  getAttendance,
  getALlAttendace,
  editAttendance,
  getAttendanceByDomain,
  getAttendanceByDomainSubdomain
};
