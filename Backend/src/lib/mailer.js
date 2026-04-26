import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const mailUser = process.env.EMAIL_USER || process.env.USER_EMAIL;
const mailPass = process.env.EMAIL_PASS || process.env.USER_PASS;
console.log(process.env.USER_EMAIL);
console.log(process.env.USER_PASS);

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: mailUser,
    pass: mailPass,
  },
});

const sendMail = async ({ to, subject, html }) => {
  if (!mailUser || !mailPass) {
    throw new Error(
      "Email credentials are missing. Set EMAIL_USER/EMAIL_PASS or USER_EMAIL/USER_PASS.",
    );
  }

  await transporter.sendMail({
    from: `"SQAC Portal Admin" <${mailUser}>`,
    to,
    subject,
    html,
  });
};

export default sendMail;
