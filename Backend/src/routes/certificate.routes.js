const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const certController = require('../controllers/certificate.controller');

/**
 * Certificate Routes
 */

// POST /api/certificate/generate — board or domain_lead only
router.post(
  '/generate',
  verifyToken,
  requireRole('board', 'domain_lead'),
  certController.generateCertificate
);

// GET /api/certificate/my — logged-in user's own certificates
router.get('/my', verifyToken, certController.getMyCertificates);

// GET /api/certificate/user/:userId — board or domain_lead only
router.get(
  '/user/:userId',
  verifyToken,
  requireRole('board', 'domain_lead'),
  certController.getUserCertificates
);

module.exports = router;
