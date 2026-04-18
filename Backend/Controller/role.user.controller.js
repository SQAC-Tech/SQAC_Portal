import User from '../models/User.js';
import redis from '../lib/redis.js';
import crypto from 'crypto';
import sendMail from '../lib/mailer.js';

const OTP_EXP = 120;
const MAX_ATTEMPTS = 4;

const generateOTP = () => crypto.randomInt(100000, 999999).toString();

const sendOTP = async (email) => {
    const otp = generateOTP();
    await redis.hset(`otp:${email}`, { code: otp, attempts: 0 });
    await redis.expire(`otp:${email}`, OTP_EXP);
    await sendMail({
        to: email,
        subject: 'Your OTP code',
        html: `
            <h2>Your verification code</h2>
            <p style="font-size:32px;font-weight:bold;letter-spacing:8px;">${otp}</p>
            <p>This code expires in 2 minutes. Do not share it with anyone.</p>
        `,
    });
};

const verifyOTP = async (email, inputCode) => {
    const data = await redis.hgetall(`otp:${email}`);

    if (!data || !data.code)
        return { success: false, message: 'OTP expired or not found. Request a new one.' };

    const attempts = parseInt(data.attempts);

    if (attempts >= MAX_ATTEMPTS) {
        await redis.del(`otp:${email}`);
        return { success: false, message: 'Too many attempts. Request a new OTP.' };
    }

    if (data.code !== inputCode) {
        await redis.hincrby(`otp:${email}`, 'attempts', 1);
        return { success: false, message: `Wrong OTP. ${MAX_ATTEMPTS - attempts - 1} attempts left.` };
    }

    await redis.del(`otp:${email}`);
    return { success: true, message: 'OTP verified!' };
};

export const getprofile = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        if (!user)
            return res.status(404).json({ message: 'User not found' });

        res.json({ message: 'Profile fetched successfully', user });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export const getotp = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email)
            return res.status(400).json({ message: 'Enter email' });

        const user = await User.findOne({ email });
        if (!user)
            return res.status(404).json({ message: 'Not a valid registered mail' });

        await sendOTP(email);
        res.json({ message: 'OTP sent to your email' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const verifyotp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp)
            return res.status(400).json({ message: 'Email and OTP are required' });

        const result = await verifyOTP(email, otp);

        if (!result.success)
            return res.status(400).json({ message: result.message });

        await redis.set(`verified:${email}`, 'true', 'EX', 300);

        res.json({ message: 'OTP verified. You can now reset your password.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const resetpassword = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password)
            return res.status(400).json({ message: 'Email and new password are required' });

        if (password.length < 8)
            return res.status(400).json({ message: 'Password must be at least 8 characters' });

        const isVerified = await redis.get(`verified:${email}`);
        if (!isVerified)
            return res.status(403).json({ message: 'OTP not verified. Please verify OTP first.' });

        const user = await User.findOne({ email });
        if (!user)
            return res.status(404).json({ message: 'User not found' });

        user.password = password;
        await user.save();

        await redis.del(`verified:${email}`);

        res.json({ message: 'Password reset successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const editprofile = async (req, res) => {
    try {
        const { image, socials } = req.body;

        const forbiddenFields = ['role', 'position', 'password', 'email', 'name'];
        const invalidUpdates = Object.keys(req.body).filter((key) =>
            forbiddenFields.includes(key)
        );

        if (invalidUpdates.length > 0) {
            return res.status(400).json({
                message: `Cannot update ${invalidUpdates.join(', ')} through this route`,
            });
        }

        if (!image && !socials) {
            return res.status(400).json({
                message: 'Provide image or socials to update',
            });
        }

        const user = await User.findById(req.userId);
        if (!user)
            return res.status(404).json({ message: 'User not found' });

        if (image !== undefined) user.image = image;
        if (socials !== undefined) user.socials = socials;

        await user.save();

        res.json({
            message: 'Profile updated successfully',
            user: {
                ...user.toObject(),
                password: undefined,
            },
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
