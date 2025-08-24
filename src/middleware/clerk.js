const { Clerk } = require('@clerk/clerk-sdk-node');
const clerk = Clerk({ apiKey: process.env.CLERK_SECRET_KEY });

const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
      // Prefer top-level verifyToken if available; fallback to sessions.verifyToken
      const verifier = typeof clerk.verifyToken === 'function'
        ? clerk.verifyToken.bind(clerk)
        : (clerk.sessions && typeof clerk.sessions.verifyToken === 'function'
          ? clerk.sessions.verifyToken.bind(clerk.sessions)
          : null)

      if (!verifier) {
        console.error('Clerk verifyToken API not available')
        return res.status(503).json({ message: 'Auth service unavailable' })
      }

      const session = await verifier(token)
      if (!session || !session.userId) {
        return res.status(401).json({ message: 'Unauthorized: Invalid token' })
      }

      // Get user information
      const user = await clerk.users.getUser(session.userId);

      // Attach user info to request
      req.user = {
        id: user.id,
        email: user.emailAddresses?.[0]?.emailAddress,
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
      };

      next();
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = { requireAuth };
