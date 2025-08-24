const express = require('express');
const router = express.Router();
const clerkAuthController = require('../controllers/clerkAuthController');

// Verify Clerk session
router.post('/verify-session', clerkAuthController.verifySession);

// Update user with Clerk ID
router.post('/update-user', clerkAuthController.updateUserWithClerkId);

module.exports = router;
