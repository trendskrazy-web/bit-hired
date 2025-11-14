GEGZNzOWg6bnU53iwJLzL5LaXwR2
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
// The script now looks for the key in the SAME directory as the script itself.
const serviceAccountPath = path.resolve(__dirname, 'service-account.json');

let serviceAccount;
try {
  serviceAccount = require(serviceAccountPath);
} catch (error) {
  console.error('\x1b[31m%s\x1b[0m', 'Error: Could not find or read service-account.json.');
  console.error('Please make sure you have created a `service-account.json` file inside the `scripts` directory.');
  console.error('You need to paste the content of the service account key you downloaded from Firebase into that file.');
  process.exit(1);
}


// --- Main Logic ---
if (!uid) {
  console.error('\x1b[31m%s\x1b[0m', 'Error: No user UID provided.');
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
    console.log('\x1b[32m%s\x1b[0m', `Successfully set admin claim for user: ${uid}`);
    console.log('They will have admin privileges on their next login.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error setting custom claim:', error);
    process.exit(1);
  });
