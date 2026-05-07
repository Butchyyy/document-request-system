"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testConnection = exports.initializeFirebase = exports.auth = exports.db = void 0;
const admin = __importStar(require("firebase-admin"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const getPrivateKey = () => {
    const rawKey = process.env.FIREBASE_PRIVATE_KEY || '';
    return rawKey.replace(/\\n/g, '\n').replace(/^"|"$/g, '').trim();
};
const initializeFirebase = () => {
    try {
        if (admin.apps.length) {
            console.log('✅ Firebase already initialized');
            exports.db = admin.firestore();
            exports.auth = admin.auth();
            return true;
        }
        let credential;
        // Method 1: Try service account file
        // Checks multiple possible locations so it works regardless of cwd
        const possiblePaths = [
            path.resolve(process.cwd(), 'serviceAccountKey.json'), // backend/serviceAccountKey.json
            path.resolve(process.cwd(), '..', 'serviceAccountKey.json'), // project root
            path.resolve(__dirname, '..', '..', '..', 'serviceAccountKey.json'), // ts-node __dirname fallback
            path.resolve(__dirname, '..', 'serviceAccountKey.json'), // backend/src fallback
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
                throw new Error('FIREBASE_PRIVATE_KEY in .env appears to be a placeholder. ' +
                    'Either add serviceAccountKey.json or set a real private key in .env');
            }
            credential = admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                privateKey,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            });
        }
        else {
            throw new Error('No Firebase credentials found.\n' +
                '  Option A: Place serviceAccountKey.json in your backend/ folder\n' +
                '  Option B: Set FIREBASE_PRIVATE_KEY, FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL in .env');
        }
        admin.initializeApp({
            credential,
            databaseURL: `https://${process.env.FIREBASE_PROJECT_ID || 'document-request-system-53127'}.firebaseio.com`,
        });
        exports.db = admin.firestore();
        exports.auth = admin.auth();
        console.log('✅ Firebase Admin initialized successfully');
        return true;
    }
    catch (error) {
        console.error('❌ Firebase initialization error:', error.message);
        return false;
    }
};
exports.initializeFirebase = initializeFirebase;
const testConnection = async () => {
    try {
        await exports.db.collection('_test').doc('connection').set({
            timestamp: new Date().toISOString(),
            status: 'connected',
        });
        console.log('✅ Firestore connection test passed');
        return true;
    }
    catch (error) {
        console.error('❌ Firestore connection test failed:', error);
        return false;
    }
};
exports.testConnection = testConnection;
