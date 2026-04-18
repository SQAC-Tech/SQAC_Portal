import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
    service:'gmail',
    auth:{
        user:processs.env.USER_EMAIL,
        pass:process.env.USER_PASS
    }
})
