import admin from 'firebase-admin';
import dotenv from 'dotenv';
import logger from './logger.js';

dotenv.config();

let initialized = false;

export function initFirebase() {
  if (initialized || admin.apps.length) return admin;

  const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = process.env;

  if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
    logger.warn('Firebase credentials missing — push notifications are disabled.');
    return null;
  }

  // A malformed/placeholder key must never take the whole API down — degrade to
  // "push disabled" the same way missing credentials do, and log loudly instead.
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: FIREBASE_PROJECT_ID,
        clientEmail: FIREBASE_CLIENT_EMAIL,
        privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
  } catch (err) {
    logger.warn(`Firebase credentials are invalid — push notifications are disabled. (${err.message})`);
    return null;
  }

  initialized = true;
  return admin;
}

export default admin;
