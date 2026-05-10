  /**
   * Run once: node script/setup-firebase.js
   * Seeds: 4 document types only.
   *
   * RBAC setup:
   *  - Regular users: register via /register (role = "user" by default)
   *  - Admins: register via /register with role = "admin" + correct ADMIN_REGISTRATION_SECRET
   *    Set ADMIN_REGISTRATION_SECRET in your backend .env file.
   *  - Alternatively: open Firestore → users collection → set role: "admin" manually.
   */
  const admin = require('firebase-admin');
  const fs = require('fs');
  const path = require('path');

  require('dotenv').config({ path: path.join(__dirname, '../.env') });

  function normalizePrivateKey(key) {
    if (!key) return undefined;
    let normalized = key.trim();
    if (normalized.startsWith('"') && normalized.endsWith('"')) {
      normalized = normalized.slice(1, -1);
    }
    normalized = normalized.replace(/\\r\\n/g, '\n').replace(/\\n/g, '\n');
    return normalized;
  }

  function isPrivateKeyValid(key) {
    if (typeof key !== 'string') return false;
    const normalized = key.trim();
    if (!normalized.startsWith('-----BEGIN PRIVATE KEY-----') || !normalized.endsWith('-----END PRIVATE KEY-----')) return false;
    if (normalized.includes('...') || normalized.includes('YOUR_ACTUAL_KEY_HERE')) return false;

    const body = normalized
      .replace('-----BEGIN PRIVATE KEY-----', '')
      .replace('-----END PRIVATE KEY-----', '')
      .trim();
    const lines = body.split(/\r?\n/).filter((line) => line.length > 0);
    if (lines.length < 3) return false;
    return lines.every((line) => /^[A-Za-z0-9+/=]+$/.test(line));
  }

  function getServiceAccount(filePath) {
    if (!fs.existsSync(filePath)) return null;
    const account = require(filePath);
    const privateKey = normalizePrivateKey(account?.private_key);
    if (account && privateKey && isPrivateKeyValid(privateKey)) {
      account.private_key = privateKey;
      return account;
    }
    return null;
  }

  function getFirebaseCredentials() {
    const serviceAccountPath = path.join(__dirname, '../service-account-key.json');
    const serviceAccountAltPath = path.join(__dirname, '../serviceAccountKey.json');

    const envCreds = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    };

    if (envCreds.projectId && envCreds.privateKey && envCreds.clientEmail && isPrivateKeyValid(envCreds.privateKey)) {
      console.log('Using Firebase credentials from .env');
      return envCreds;
    }

    const serviceAccount = getServiceAccount(serviceAccountPath);
    if (serviceAccount) {
      console.log('Using Firebase credentials from service-account-key.json');
      return serviceAccount;
    }

    const serviceAccountAlt = getServiceAccount(serviceAccountAltPath);
    if (serviceAccountAlt) {
      console.log('Using Firebase credentials from serviceAccountKey.json');
      return serviceAccountAlt;
    }

    throw new Error(
      'Firebase credentials not found or invalid. Provide valid FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, and FIREBASE_CLIENT_EMAIL in backend/.env, or place a valid service account JSON file in backend/.'
    );
  }

  const credentials = getFirebaseCredentials();
  console.log('Loaded Firebase credentials successfully.');
  admin.initializeApp({
    credential: admin.credential.cert(credentials),
  });

  const db = admin.firestore();

  async function seed() {
    // ── Document types ──────────────────────────────────────────────────────────
    const docTypes = [
      {
        id: 'certificate_of_enrollment',
        name: 'Certificate of Enrollment',
        description: 'Official certificate confirming current enrollment status. Required for scholarship applications, bank loans, and government transactions.',
        fee: 50,
        processingDays: 2,
        requirements: ['Valid School ID', 'Request Form'],
      },
      {
        id: 'transcript_of_records',
        name: 'Transcript of Records',
        description: 'Official academic transcript showing all grades and units earned. Required for job applications, graduate school, and government examinations.',
        fee: 150,
        processingDays: 5,
        requirements: ['Clearance Slip', 'Valid ID', 'Request Form'],
      },
      {
        id: 'good_moral_certificate',
        name: 'Good Moral Certificate',
        description: "Certificate attesting to the student's good moral character and conduct. Required for employment, further studies, and government transactions.",
        fee: 30,
        processingDays: 1,
        requirements: ['Valid School ID'],
      },
      {
        id: 'barangay_clearance',
        name: 'Barangay Clearance',
        description: 'Official clearance issued by the Barangay certifying residency and good standing in the community. Required for employment and various government transactions.',
        fee: 100,
        processingDays: 1,
        requirements: ['Valid Government ID', 'Proof of Residency'],
      },
    ];

    for (const dt of docTypes) {
      const { id, ...data } = dt;
      await db.collection('document_types').doc(id).set({
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }, { merge: true });
      console.log(`✅ Document type seeded: ${data.name}`);
    }

    console.log('\n🎉 Seed complete!');
    console.log('👉 To grant admin access: open Firestore → users collection → find the user doc → set role: "admin"');
    process.exit(0);
  }

  seed().catch((err) => { console.error(err); process.exit(1); });