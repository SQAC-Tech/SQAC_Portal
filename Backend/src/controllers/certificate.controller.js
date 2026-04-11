const puppeteer = require('puppeteer');
const Certificate = require('../models/Certificate');
const User = require('../models/User');
const { bucket } = require('../config/firebaseAdmin');

/* ── HTML template for certificates ── */
function buildCertificateHTML({ memberName, title, description, type, issuedByName, issuedAt }) {
  const formattedDate = new Date(issuedAt).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const typeLabel = type.charAt(0).toUpperCase() + type.slice(1);

  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;600&display=swap');

      * { margin: 0; padding: 0; box-sizing: border-box; }

      body {
        width: 1056px;
        height: 816px;
        font-family: 'Inter', sans-serif;
        background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .cert-container {
        width: 980px;
        height: 740px;
        background: #fff;
        border-radius: 12px;
        border: 3px solid #d4af37;
        padding: 60px 80px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        position: relative;
        overflow: hidden;
      }

      .cert-container::before {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        border: 1px solid #e8d48b;
        margin: 12px;
        border-radius: 8px;
        pointer-events: none;
      }

      .cert-type {
        font-size: 14px;
        letter-spacing: 4px;
        text-transform: uppercase;
        color: #d4af37;
        margin-bottom: 12px;
      }

      h1 {
        font-family: 'Playfair Display', serif;
        font-size: 42px;
        color: #1a1a2e;
        margin-bottom: 8px;
      }

      .subtitle {
        font-size: 16px;
        color: #555;
        margin-bottom: 30px;
      }

      .awarded-to {
        font-size: 14px;
        letter-spacing: 2px;
        text-transform: uppercase;
        color: #888;
        margin-bottom: 8px;
      }

      .member-name {
        font-family: 'Playfair Display', serif;
        font-size: 36px;
        color: #302b63;
        border-bottom: 2px solid #d4af37;
        padding-bottom: 6px;
        margin-bottom: 20px;
      }

      .description {
        font-size: 15px;
        color: #444;
        text-align: center;
        max-width: 600px;
        line-height: 1.6;
        margin-bottom: 40px;
      }

      .footer {
        display: flex;
        justify-content: space-between;
        width: 100%;
        margin-top: auto;
        padding-top: 20px;
        border-top: 1px solid #eee;
      }

      .footer-item {
        text-align: center;
      }

      .footer-label {
        font-size: 11px;
        color: #999;
        text-transform: uppercase;
        letter-spacing: 1px;
      }

      .footer-value {
        font-size: 14px;
        color: #333;
        font-weight: 600;
        margin-top: 4px;
      }
    </style>
  </head>
  <body>
    <div class="cert-container">
      <div class="cert-type">Certificate of ${typeLabel}</div>
      <h1>${title}</h1>
      <div class="subtitle">SQAC — Software Quality Assurance Club</div>

      <div class="awarded-to">Awarded To</div>
      <div class="member-name">${memberName}</div>

      <div class="description">${description || ''}</div>

      <div class="footer">
        <div class="footer-item">
          <div class="footer-label">Date</div>
          <div class="footer-value">${formattedDate}</div>
        </div>
        <div class="footer-item">
          <div class="footer-label">Issued By</div>
          <div class="footer-value">${issuedByName}</div>
        </div>
      </div>
    </div>
  </body>
  </html>`;
}

/**
 * POST /api/certificate/generate
 * Body: { userId, type, title, description }
 * Requires board or domain_lead role.
 */
exports.generateCertificate = async (req, res) => {
  try {
    const { userId, type, title, description } = req.body;

    if (!userId || !type || !title) {
      return res.status(400).json({ error: 'userId, type, and title are required' });
    }

    // Fetch the target user and the issuer
    const [targetUser, issuer] = await Promise.all([
      User.findById(userId).lean(),
      User.findById(req.user.userId).lean(),
    ]);

    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const issuedAt = new Date();

    // 1. Build HTML
    const html = buildCertificateHTML({
      memberName: targetUser.name,
      title,
      description: description || '',
      type,
      issuedByName: issuer ? issuer.name : 'SQAC Board',
      issuedAt,
    });

    // 2. Convert HTML → PDF via Puppeteer
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({
      width: '1056px',
      height: '816px',
      printBackground: true,
      landscape: true,
    });
    await browser.close();

    // 3. Upload PDF to Firebase Storage
    const filename = `certificates/${userId}_${Date.now()}.pdf`;
    const file = bucket.file(filename);

    await file.save(pdfBuffer, {
      metadata: {
        contentType: 'application/pdf',
        metadata: {
          issuedTo: userId,
          type,
          title,
        },
      },
    });

    // Make the file publicly accessible and get the URL
    await file.makePublic();
    const pdfUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;

    // 4. Save Certificate doc to MongoDB
    const certificate = await Certificate.create({
      issuedTo: userId,
      issuedBy: req.user.userId,
      type,
      title,
      description,
      issuedAt,
      pdfUrl,
    });

    res.status(201).json({ certificate, pdfUrl });
  } catch (err) {
    console.error('generateCertificate error:', err);
    res.status(500).json({ error: 'Failed to generate certificate' });
  }
};

/**
 * GET /api/certificate/my
 * Get logged-in user's own certificates.
 */
exports.getMyCertificates = async (req, res) => {
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
exports.getUserCertificates = async (req, res) => {
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
