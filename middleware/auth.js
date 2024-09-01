const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    
    // Check if the authorization header is present
    if (!authHeader) {
        return res.status(401).json({ message: 'Access Denied' });
    }

    // Extract the token from the header
    const token = authHeader.split(' ')[1]; // Assumes 'Bearer <token>' format

    if (!token) {
        return res.status(401).json({ message: 'Access Denied: No Token Provided' });
    }

    try {
        const verified = jwt.verify(token, process.env.TOKEN_SECRET);
        req.user = verified;
        next();
    } catch (e) {
        return res.status(401).json({ message: 'Invalid Token' });
    }
}

module.exports = authMiddleware;
