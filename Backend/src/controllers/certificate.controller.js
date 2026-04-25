import Certificate from '../models/Certificate.js';
import User from '../../models/User.js';
import { supabase } from '../config/supabase.js';
import nodemailer from 'nodemailer';

/**
 * GET /api/certificate/my
 * Get logged-in user's own certificates.
 */
export const getMyCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find({ issuedTo: req.user.userId })
      .sort({ issuedAt: -1 })
      .populate('issuedBy', 'name username')
      .lean();

    res.json({ certificates });
  } catch (err) {
    console.error('getMyCertificates error:', err);
    res.status(500).json({ error: 'Failed to fetch certificates' });
  }
};

/**
 * GET /api/certificate/user/:userId
 * Get all certificates for a specific user. Requires board or domain_lead role.
 */
export const getUserCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find({ issuedTo: req.params.userId })
      .sort({ issuedAt: -1 })
      .populate('issuedBy', 'name username')
      .lean();

    res.json({ certificates });
  } catch (err) {
    console.error('getUserCertificates error:', err);
    res.status(500).json({ error: 'Failed to fetch certificates' });
  }
};

/**
 * GET /api/certificate/verify/:credentialId
 * Public endpoint to verify a certificate
 */
export const verifyCertificate = async (req, res) => {
  try {
    const { credentialId } = req.params;
    const certificate = await Certificate.findOne({ credentialId })
      .populate('issuedTo', 'name')
      .populate('issuedBy', 'name')
      .lean();

    if (!certificate) {
      return res.status(404).json({ error: 'Certificate not found or invalid' });
    }

    res.json({ certificate });
  } catch (err) {
    console.error('verifyCertificate error:', err);
    res.status(500).json({ error: 'Failed to verify certificate' });
  }
};

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: parseInt(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

/**
 * POST /api/certificate/upload-generated
 * Bulk upload and send emails
 */
export const uploadGenerated = async (req, res) => {
  try {
    const { certificates, templateType, templateTitle, templateDescription } = req.body;
    
    if (!Array.isArray(certificates) || certificates.length === 0) {
      return res.status(400).json({ error: 'No certificates provided' });
    }

    const savedCerts = [];
    const transporter = getTransporter();

    for (const certData of certificates) {
      const { credentialId, issuedToName, issuedToEmail, imageBase64 } = certData;

      // Extract base64 part
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, 'base64');

      // Upload to Supabase Storage
      const bucketName = process.env.SUPABASE_BUCKET || 'certificates';
      const filename = `${credentialId}_${Date.now()}.png`;
      const filePath = `generated/${filename}`;

      const { data, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, buffer, {
          contentType: 'image/png',
          upsert: true
        });

      if (uploadError) {
        console.error('Supabase upload error:', uploadError);
        throw new Error('Failed to upload image to Supabase');
      }

      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      const imageUrl = publicUrl;

      const certificate = await Certificate.create({
        credentialId,
        issuedToName,
        issuedToEmail,
        issuedBy: req.userId,
        type: templateType,
        title: templateTitle,
        description: templateDescription,
        imageUrl,
      });
      savedCerts.push(certificate);

      // Send email
      const linkedInShareUrl = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(templateTitle)}&organizationName=SQAC&certId=${credentialId}&certUrl=${encodeURIComponent((process.env.FRONTEND_URL || 'http://localhost:5173') + '/verify/' + credentialId)}`;
      
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
          <h2>Congratulations ${issuedToName}!</h2>
          <p>We are pleased to issue your certificate for <strong>${templateTitle}</strong>.</p>
          <p>You can view and download your certificate using the link below:</p>
          <a href="${imageUrl}" target="_blank" style="display:inline-block; padding: 10px 20px; background: #007bff; color: #fff; text-decoration: none; border-radius: 5px;">View Certificate</a>
          <br><br>
          <p>Share your achievement on LinkedIn!</p>
          <a href="${linkedInShareUrl}" target="_blank" style="display:inline-block; padding: 10px 20px; background: #0077b5; color: #fff; text-decoration: none; border-radius: 5px;">Post to LinkedIn</a>
        </div>
      `;

      try {
        await transporter.sendMail({
          from: process.env.SMTP_USER,
          to: issuedToEmail,
          subject: `Your Certificate: ${templateTitle}`,
          html: emailHtml,
        });
      } catch (mailErr) {
        console.error('Failed to send email to', issuedToEmail, mailErr);
      }
    }

    res.status(201).json({ message: 'Certificates generated and sent', count: savedCerts.length });
  } catch (err) {
    console.error('uploadGenerated error:', err);
    res.status(500).json({ error: 'Failed to process certificates' });
  }
};
