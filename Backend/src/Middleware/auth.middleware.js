// create authentication middleware to check for JWT in Authorization header

import jwt from 'jsonwebtoken';

export const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    // Check if Authorization header is present 
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization header missing or malformed' });
    }
    
    // Extract token from header
    const token = authHeader.split(' ')[1];

    // Verify token
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is missing from environment variables");
    }
        //what is decoded here? payload with userId
        //what is gettring passed to in the callback function? err and decoded payload
        //why need decoded and where is it comming from? from the verified token
      jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Invalid or expired token' });
      }
      
      // Attach user info to request object
      req.user = { id: decoded.userId };
      next();
    });
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};