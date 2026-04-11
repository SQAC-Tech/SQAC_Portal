const admin = require('firebase-admin');

/**
 * Firebase Admin SDK initialization.
 * ───────────────────────────────────
 * Expects the env var FIREBASE_SERVICE_ACCOUNT_KEY to contain
 * either:
 *   (a) the JSON string of the service-account key, or
 *   (b) a file path to the key JSON (set FIREBASE_KEY_PATH instead).
 *
 * Also expects FIREBASE_STORAGE_BUCKET (e.g. "my-project.appspot.com").
 */

if (!admin.apps.length) {
  let credential;

  if (process.env.FIREBASE_KEY_PATH) {
    // Option A: path to local key file
    const serviceAccount = require(process.env.FIREBASE_KEY_PATH);
    credential = admin.credential.cert(serviceAccount);
  } else if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    // Option B: inline JSON string (for CI / cloud)
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    credential = admin.credential.cert(serviceAccount);
  } else {
    // Option C: Application Default Credentials (GCP environments)
    credential = admin.credential.applicationDefault();
  }

  admin.initializeApp({
    credential,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
  });
}

const bucket = admin.storage().bucket();

module.exports = { admin, bucket };
