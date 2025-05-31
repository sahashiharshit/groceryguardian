import jwt from 'jsonwebtoken';

export const authenticationMiddleware = (req, res, next) => {

    const authHeader = req.headers['authorization'];
   
    const secretKey = process.env.SECRET_KEY;
    if(!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: "Unauthorized access" });
    }
    const token = authHeader.split(' ')[1]; // Extract the token from the header
    
    try {
        const decoded = jwt.verify(token, secretKey);
   
        req.user = decoded; // Attach user info to request object
        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        return res.status(403).json({ message: "Invalid token" });
    }

}
