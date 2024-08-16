// middleware/authMiddleware.js
const { auth } = require('../firebase/firebase'); // Import the initialized auth from firebase.js

const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Extract token from the "Authorization" header

  if (!token) {
    return res.status(403).send('Unauthorized');
  }

  try {
    const decodedToken = await auth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    return res.status(403).send('Unauthorized');
  }
};

module.exports = verifyToken;
