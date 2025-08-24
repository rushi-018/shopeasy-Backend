const User = require('../models/User');

let clerk = null;
try {
  const { Clerk } = require('@clerk/clerk-sdk-node');
  clerk = Clerk({ apiKey: process.env.CLERK_SECRET_KEY });
  console.log('✅ Clerk initialized successfully');
} catch (error) {
  console.error('❌ Failed to initialize Clerk:', error.message);
}

const clerkAuthController = {
  // Verify a user's Clerk session and return user data
  verifySession: async (req, res) => {
    try {
      const { token } = req.body;
      
      if (!token) {
        return res.status(400).json({ message: 'Token is required' });
      }
      
      // Check if Clerk is initialized
      if (!clerk) {
        return res.status(503).json({ 
          message: 'Clerk authentication is not available',
          error: 'Clerk SDK initialization failed'
        });
      }
      
      try {
        // Verify token with Clerk
        const session = await clerk.sessions.verifyToken(token);
        
        if (!session) {
          return res.status(401).json({ message: 'Invalid token' });
        }
        
        // Get user from Clerk
        const clerkUser = await clerk.users.getUser(session.userId);
        
  // Check if user exists in our database
  let user = await User.findOne({ clerkId: clerkUser.id });
        
        // If not, create a new user
        if (!user) {
          const roleFromClerk = (clerkUser.publicMetadata && clerkUser.publicMetadata.role) || 'customer';
          user = await User.create({
            clerkId: clerkUser.id,
            name: `${clerkUser.firstName} ${clerkUser.lastName || ''}`.trim(),
            email: clerkUser.emailAddresses[0].emailAddress,
            avatar: clerkUser.imageUrl || '',
            role: roleFromClerk,
          });
        }
        
        return res.status(200).json({
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            role: user.role,
          }
        });
      } catch (error) {
        console.error('Token verification error:', error);
        return res.status(401).json({ message: 'Invalid token' });
      }
    } catch (error) {
      console.error('Auth verification error:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  },
  
  // Update user profile with Clerk ID
  updateUserWithClerkId: async (req, res) => {
    try {
      const { email, clerkId } = req.body;
      
      if (!email || !clerkId) {
        return res.status(400).json({ message: 'Email and Clerk ID are required' });
      }
      
      // Find user by email and update with Clerk ID
      const user = await User.findOneAndUpdate(
        { email },
        { clerkId },
        { new: true }
      );
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      return res.status(200).json({
        message: 'User updated successfully',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        }
      });
    } catch (error) {
      console.error('Update user error:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }
};

module.exports = clerkAuthController;
