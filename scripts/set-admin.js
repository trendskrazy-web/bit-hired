import admin from 'firebase-admin';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

// Recreate __dirname and require for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

// --- Configuration ---
const uid = process.argv[2]; 

const serviceAccountPath = path.resolve(__dirname, 'service-account.json');

let serviceAccount;
try {
  serviceAccount = require(serviceAccountPath);
} catch (error) {
  if (error.code === 'MODULE_NOT_FOUND') {
    console.error('\x1b[31m%s\x1b[0m', 'Error: Could not find service-account.json.');
    console.error('Please make sure you have created a `service-account.json` file inside the `scripts` directory and pasted your key into it.');
  } else {
    console.error('\x1b[31m%s\x1b[0m', 'Error reading service-account.json:', error.message);
  }
  process.exit(1);
}


// --- Main Logic ---
if (!uid) {
  console.error('\x1b[31m%s\x1b[0m', 'Error: No user UID provided.');
  console.log('Usage: node scripts/set-admin.js <user_uid>');
  process.exit(1);
}

// Initialize the Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
}


// Set the custom claim { admin: true } on the specified user.
admin.auth().setCustomUserClaims(uid, { admin: true })
  .then(() => {
    console.log('\x1b[32m%s\x1b[0m', `Successfully set admin claim for user: ${uid}`);
    console.log('They will have admin privileges on their next login.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error setting custom claim:', error);
    process.exit(1);
  });
