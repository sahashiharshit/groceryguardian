
import type { Request, Response, NextFunction } from 'express';
import type { UserPayload } from '../types/userPayload.js';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
interface AuthenticatedRequest extends Request{

    user?:UserPayload;
}

export const authenticationMiddleware =async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {

    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ message: "Unauthorized access" });
        return;
    }
    const secretKey = process.env.SECRET_KEY;
    if (!secretKey) {
        res.status(500).json({ message: "Server configuration error" });
        return;
    }



    const token = authHeader.split(' ')[1]; // Extract the token from the header
    if (!token) {
        res.status(401).json({ message: "Token missing from authorization header" });
        return;
    }

    try {
        const decoded = jwt.verify(token, secretKey) as UserPayload;
        const user = await User.findById(decoded.id);
        const householdId = user?.householdId??null;
        decoded.householdId = householdId; 
        req.user = decoded; // Attach user info to request object
        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        res.status(403).json({ message: "Invalid token" });
        return;
    }

}

