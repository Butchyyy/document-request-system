import * as admin from 'firebase-admin';
import * as path from 'path';
import * as fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const getPrivateKey = () => {
  const rawKey = process.env.FIREBASE_PRIVATE_KEY || '';
  return rawKey.replace(/\\n/g, '\n').replace(/^"|"$/g, '').trim();
};

export let db: admin.firestore.Firestore;
export let auth: admin.auth.Auth;

export const initializeFirebase = (): boolean => {
  try {
    if (admin.apps.length) {
      console.log('✅ Firebase already initialized');
      db = admin.firestore();
      auth = admin.auth();
      return true;
    }

    let credential;

    // Method 1: Try service account file
    // Checks multiple possible locations so it works regardless of cwd
    const possiblePaths = [
      path.resolve(process.cwd(), 'serviceAccountKey.json'),                // backend/serviceAccountKey.json
      path.resolve(process.cwd(), '..', 'serviceAccountKey.json'),          // project root
      path.resolve(__dirname, '..', '..', '..', 'serviceAccountKey.json'),  // ts-node __dirname fallback
      path.resolve(__dirname, '..', 'serviceAccountKey.json'),              // backend/src fallback
    ];

    const serviceAccountPath = possiblePaths.find(p => fs.existsSync(p));

    console.log('🔍 Searching for serviceAccountKey.json...');
    possiblePaths.forEach(p => {
      console.log(`   ${fs.existsSync(p) ? '✅ FOUND' : '❌ not found'}: ${p}`);
    });

    if (serviceAccountPath) {
      console.log('🔑 Using service account file:', serviceAccountPath);
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const serviceAccount = require(serviceAccountPath);
      credential = admin.credential.cert(serviceAccount);
    }
    // Method 2: Environment variables fallback
    else if (process.env.FIREBASE_PRIVATE_KEY) {
      console.log('🔑 Using environment variables');

      const privateKey = getPrivateKey();

      if (!privateKey.includes('BEGIN PRIVATE KEY')) {
        throw new Error(
          'FIREBASE_PRIVATE_KEY in .env appears to be a placeholder. ' +
          'Either add serviceAccountKey.json or set a real private key in .env'
        );
      }

      credential = admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      });
    } else {
      throw new Error(
        'No Firebase credentials found.\n' +
        '  Option A: Place serviceAccountKey.json in your backend/ folder\n' +
        '  Option B: Set FIREBASE_PRIVATE_KEY, FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL in .env'
      );
    }

    admin.initializeApp({
      credential,
      databaseURL: `https://${process.env.FIREBASE_PROJECT_ID || 'document-request-system-53127'}.firebaseio.com`,
    });

    db = admin.firestore();
    auth = admin.auth();

    console.log('✅ Firebase Admin initialized successfully');
    return true;

  } catch (error: any) {
    console.error('❌ Firebase initialization error:', error.message);
    return false;
  }
};

export const testConnection = async (): Promise<boolean> => {
  try {
    await db.collection('_test').doc('connection').set({
      timestamp: new Date().toISOString(),
      status: 'connected',
    });
    console.log('✅ Firestore connection test passed');
    return true;
  } catch (error) {
    console.error('❌ Firestore connection test failed:', error);
    return false;
  }
};