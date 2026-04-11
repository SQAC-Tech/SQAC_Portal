const nodemailer = require('nodemailer');
const User = require('../models/User');

/**
 * Build the SMTP transporter from env vars.
 * Lazily created on first use.
 */
let _transporter = null;

function getTransporter() {
  if (!_transporter) {
    _transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: parseInt(process.env.SMTP_PORT) === 465, // true for 465
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return _transporter;
}

/**
 * POST /api/mail/send
 * Body: { subject, body, recipientIds[] OR sendToAll: true }
 * Requires board role.
 */
exports.sendMail = async (req, res) => {
  try {
    const { subject, body, recipientIds, sendToAll } = req.body;

    if (!subject || !body) {
      return res.status(400).json({ error: 'subject and body are required' });
    }

    // Resolve recipient emails
    let recipients = [];

    if (sendToAll) {
      recipients = await User.find({}, 'email name').lean();
    } else if (Array.isArray(recipientIds) && recipientIds.length > 0) {
      recipients = await User.find(
        { _id: { $in: recipientIds } },
        'email name'
      ).lean();
    } else {
      return res.status(400).json({
        error: 'Provide recipientIds[] or set sendToAll: true',
      });
    }

    if (recipients.length === 0) {
      return res.status(404).json({ error: 'No recipients found' });
    }

    const transporter = getTransporter();
    let sent = 0;
    const failed = [];

    // Send emails concurrently in batches of 10 to avoid overwhelming SMTP
    const BATCH_SIZE = 10;

    for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
      const batch = recipients.slice(i, i + BATCH_SIZE);

      const results = await Promise.allSettled(
        batch.map((r) =>
          transporter.sendMail({
            from: process.env.SMTP_USER,
            to: r.email,
            subject,
            html: body,
          })
        )
      );

      results.forEach((result, idx) => {
        if (result.status === 'fulfilled') {
          sent++;
        } else {
          failed.push({
            email: batch[idx].email,
            error: result.reason?.message || 'Unknown error',
          });
        }
      });
    }

    res.json({ sent, failed });
  } catch (err) {
    console.error('sendMail error:', err);
    res.status(500).json({ error: 'Failed to send emails' });
  }
};
