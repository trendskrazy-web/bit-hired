// This script is used to grant admin privileges to a user by setting a custom claim.
// It uses the Firebase Admin SDK, which requires a service account key.

// Usage: node scripts/set-admin.js <user_uid>

const admin = require('firebase-admin');
const path = require('path');

// --- Configuration ---
// The UID of the user you want to make an admin.
// You can pass this as a command-line argument or set it here.
const uid = process.argv[2]; 

// Path to your service account key JSON file.
const serviceAccountPath = path.resolve(__dirname, '../service-account.json');
const serviceAccount = require(serviceAccountPath);

// --- Main Logic ---
if (!uid) {
  console.error('Error: No user UID provided.');
  console.log('Usage: node scripts/set-admin.js <user_uid>');
  process.exit(1);
}

// Initialize the Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Set the custom claim { admin: true } on the specified user.
admin.auth().setCustomUserClaims(uid, { admin: true })
  .then(() => {
    console.log(`Successfully set admin claim for user: ${uid}`);
    console.log('They will have admin privileges on their next login.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error setting custom claim:', error);
    process.exit(1);
  });
